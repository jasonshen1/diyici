import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import * as fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

const OcrClient = tencentcloud.ocr.v20181119.Client;

// 从环境变量读取密钥
const SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';

// OCR 统计
let ocrStats = {
  tencentCount: 0,
  localCount: 0,
  lastResetDate: new Date().toISOString().slice(0, 7) // YYYY-MM
};

// 每月免费额度阈值（留 50 次缓冲）
const TENCENT_FREE_LIMIT = 950;

// 创建腾讯云客户端
const client = SECRET_ID && SECRET_KEY ? new OcrClient({
  credential: {
    secretId: SECRET_ID,
    secretKey: SECRET_KEY,
  },
  region: 'ap-guangzhou',
  profile: {
    signMethod: 'TC3-HMAC-SHA256',
    httpProfile: {
      reqMethod: 'POST',
      reqTimeout: 30,
    },
  },
}) : null;

// 检查是否需要重置计数（新月）
function checkResetStats() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (currentMonth !== ocrStats.lastResetDate) {
    console.log('OCR 统计已重置（新月）');
    ocrStats = {
      tencentCount: 0,
      localCount: 0,
      lastResetDate: currentMonth
    };
  }
}

// 调用本地 PaddleOCR（带自动启动）
async function callLocalOCR(imagePath: string): Promise<{ text: string; confidence: number }> {
  try {
    // 先检查本地服务是否运行
    try {
      await axios.get('http://localhost:8000/health', { timeout: 3000 });
    } catch (e) {
      // 服务未运行，自动启动
      console.log('[OCR] 本地服务未运行，正在启动...');
      await startLocalOCRService();
      // 等待服务启动完成
      await waitForLocalService();
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(imagePath));

    const response = await axios.post('http://localhost:8000/ocr', formData, {
      headers: formData.getHeaders(),
      timeout: 30000
    });

    if (response.data.success) {
      return {
        text: response.data.text,
        confidence: response.data.lines?.length > 0 
          ? Math.round((response.data.lines.reduce((sum: number, line: any) => sum + (line.confidence || 0), 0) / response.data.lines.length) * 100) / 100
          : 0
      };
    }
    throw new Error(response.data.error || '本地 OCR 识别失败');
  } catch (error) {
    console.error('本地 OCR 调用失败:', error);
    throw error;
  }
}

// 启动本地 OCR 服务
async function startLocalOCRService(): Promise<void> {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    
    const ocrProcess = spawn('bash', ['-c', `
      cd /var/www/diyici.ai/ocr-service && 
      source venv/bin/activate && 
      nohup python main.py > /tmp/ocr.log 2>&1 &
    `], {
      detached: true,
      stdio: 'ignore'
    });
    
    ocrProcess.on('error', (err: any) => {
      console.error('[OCR] 启动本地服务失败:', err);
      reject(err);
    });
    
    ocrProcess.unref();
    
    // 给进程一点时间启动
    setTimeout(resolve, 2000);
  });
}

// 等待本地服务就绪
async function waitForLocalService(maxRetries = 60): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await axios.get('http://localhost:8000/health', { timeout: 5000 });
      console.log('[OCR] 本地服务已就绪');
      return;
    } catch (e) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error('本地 OCR 服务启动超时');
}

// 调用腾讯云 OCR
async function callTencentOCR(imagePath: string): Promise<{ text: string; confidence: number }> {
  if (!client) {
    throw new Error('腾讯云 OCR 未配置');
  }

  try {
    // 读取图片并转为 base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // 调用腾讯云 OCR API（通用印刷体识别）
    const response = await client.GeneralBasicOCR({
      ImageBase64: base64Image,
    });

    // 提取文字
    let text = '';
    let totalConfidence = 0;
    let count = 0;

    if (response.TextDetections) {
      for (const item of response.TextDetections) {
        if (item.DetectedText) {
          text += item.DetectedText + '\n';
        }
        if (item.Confidence) {
          totalConfidence += item.Confidence;
          count++;
        }
      }
    }

    const avgConfidence = count > 0 ? totalConfidence / count : 0;

    return {
      text: text.trim(),
      confidence: Math.round(avgConfidence * 100) / 100,
    };
  } catch (error: any) {
    // 检查是否是额度超限错误
    if (error.message?.includes('limit') || error.message?.includes('quota') || error.code === 'ResourceUnavailable') {
      throw new Error('QUOTA_EXCEEDED');
    }
    throw error;
  }
}

export class OCRService {
  // 智能识别（自动切换）
  static async recognize(imagePath: string): Promise<{ 
    text: string; 
    confidence: number; 
    service: string;
    remainingQuota?: number;
  }> {
    checkResetStats();

    // 优先使用腾讯云（只要还有额度）
    if (ocrStats.tencentCount < TENCENT_FREE_LIMIT && client) {
      try {
        const result = await callTencentOCR(imagePath);
        ocrStats.tencentCount++;
        const remainingQuota = TENCENT_FREE_LIMIT - ocrStats.tencentCount;
        
        console.log(`[OCR] 腾讯云识别成功，本月已用: ${ocrStats.tencentCount}，剩余: ${remainingQuota}`);
        
        return {
          ...result,
          service: 'tencent-cloud-ocr',
          remainingQuota
        };
      } catch (error: any) {
        // 额度超限，降级到本地
        if (error.message === 'QUOTA_EXCEEDED' || ocrStats.tencentCount >= TENCENT_FREE_LIMIT) {
          console.log('[OCR] 腾讯云额度已用完，自动切换到本地 PaddleOCR');
          const result = await callLocalOCR(imagePath);
          ocrStats.localCount++;
          return {
            ...result,
            service: 'local-paddleocr',
            remainingQuota: 0
          };
        }
        throw error;
      }
    }

    // 使用本地 OCR
    console.log('[OCR] 使用本地 PaddleOCR');
    const result = await callLocalOCR(imagePath);
    ocrStats.localCount++;
    return {
      ...result,
      service: 'local-paddleocr',
      remainingQuota: 0
    };
  }

  // 获取统计信息
  static getStats() {
    checkResetStats();
    return {
      ...ocrStats,
      tencentLimit: TENCENT_FREE_LIMIT,
      tencentRemaining: Math.max(0, TENCENT_FREE_LIMIT - ocrStats.tencentCount)
    };
  }
}