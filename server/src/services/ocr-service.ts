import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import * as fs from 'fs';
import axios from 'axios';
import { OCRStats } from '../models/task';

const OcrClient = tencentcloud.ocr.v20181119.Client;

// 从环境变量读取密钥
const SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';
const KIMI_API_KEY = process.env.KIMI_API_KEY || '';

// 每月免费额度
const TENCENT_FREE_LIMIT = 950;

// 创建腾讯云客户端
const client = SECRET_ID && SECRET_KEY ? new OcrClient({
  credential: { secretId: SECRET_ID, secretKey: SECRET_KEY },
  region: 'ap-guangzhou',
  profile: { signMethod: 'TC3-HMAC-SHA256', httpProfile: { reqMethod: 'POST', reqTimeout: 30 } },
}) : null;

async function getOrCreateStats(month: string) {
  let stats = await OCRStats.findOne({ where: { month } });
  if (!stats) {
    stats = await OCRStats.create({ month, tencent_count: 0 });
  }
  return stats;
}

// 多轮OCR尝试策略
async function tryMultipleOCR(imagePath: string): Promise<{ text: string; confidence: number; method: string }> {
  const results: Array<{ text: string; confidence: number; method: string }> = [];
  
  // 第1轮：表格OCR（适合复杂布局如命盘）
  try {
    console.log('[OCR] 尝试第1轮：表格识别');
    const result = await callTencentTableOCR(imagePath);
    if (result.text.length > 10) {
      results.push({ ...result, method: 'table' });
    }
  } catch (e) {
    console.log('[OCR] 表格识别失败');
  }
  
  // 第2轮：高精度通用OCR
  try {
    console.log('[OCR] 尝试第2轮：高精度通用识别');
    const result = await callTencentAccurateOCR(imagePath);
    if (result.text.length > 10) {
      results.push({ ...result, method: 'accurate' });
    }
  } catch (e) {
    console.log('[OCR] 高精度识别失败');
  }
  
  // 第3轮：基础通用OCR
  try {
    console.log('[OCR] 尝试第3轮：基础通用识别');
    const result = await callTencentBasicOCR(imagePath);
    if (result.text.length > 10) {
      results.push({ ...result, method: 'basic' });
    }
  } catch (e) {
    console.log('[OCR] 基础识别失败');
  }
  
  // 选择最佳结果（文字最多且置信度合理的）
  if (results.length > 0) {
    // 按文字长度排序，优先选长的
    results.sort((a, b) => b.text.length - a.text.length);
    const best = results[0];
    console.log(`[OCR] 选择最佳结果：方法=${best.method}, 长度=${best.text.length}, 置信度=${best.confidence}`);
    return best;
  }
  
  throw new Error('所有OCR方法均失败');
}

// 表格OCR
async function callTencentTableOCR(imagePath: string): Promise<{ text: string; confidence: number }> {
  if (!client) throw new Error('未配置');
  
  const imageBuffer = fs.readFileSync(imagePath);
  const response = await client.RecognizeTableOCR({ ImageBase64: imageBuffer.toString('base64') });
  
  let text = '';
  let totalConfidence = 0;
  let count = 0;
  
  if (response.TableDetections) {
    for (const table of response.TableDetections) {
      if (table.Cells) {
        for (const cell of table.Cells) {
          if (cell.Text) {
            text += cell.Text + ' ';
            if (cell.Confidence) {
              totalConfidence += cell.Confidence;
              count++;
            }
          }
        }
        text += '\n';
      }
    }
  }
  
  return {
    text: text.trim(),
    confidence: count > 0 ? Math.round((totalConfidence / count) * 100) / 100 : 0
  };
}

// 高精度通用OCR
async function callTencentAccurateOCR(imagePath: string): Promise<{ text: string; confidence: number }> {
  if (!client) throw new Error('未配置');
  
  const imageBuffer = fs.readFileSync(imagePath);
  const response = await client.GeneralAccurateOCR({ ImageBase64: imageBuffer.toString('base64') });
  
  let text = '';
  let totalConfidence = 0;
  let count = 0;
  
  if (response.TextDetections) {
    for (const item of response.TextDetections) {
      if (item.DetectedText) {
        text += item.DetectedText + '\n';
        if (item.Confidence) {
          totalConfidence += item.Confidence;
          count++;
        }
      }
    }
  }
  
  return {
    text: text.trim(),
    confidence: count > 0 ? Math.round((totalConfidence / count) * 100) / 100 : 0
  };
}

// 基础通用OCR
async function callTencentBasicOCR(imagePath: string): Promise<{ text: string; confidence: number }> {
  if (!client) throw new Error('未配置');
  
  const imageBuffer = fs.readFileSync(imagePath);
  const response = await client.GeneralBasicOCR({ ImageBase64: imageBuffer.toString('base64') });
  
  let text = '';
  let totalConfidence = 0;
  let count = 0;
  
  if (response.TextDetections) {
    for (const item of response.TextDetections) {
      if (item.DetectedText) {
        text += item.DetectedText + '\n';
        if (item.Confidence) {
          totalConfidence += item.Confidence;
          count++;
        }
      }
    }
  }
  
  return {
    text: text.trim(),
    confidence: count > 0 ? Math.round((totalConfidence / count) * 100) / 100 : 0
  };
}

// AI视觉分析（当OCR都失败时，用AI直接看图片）
async function callAIVision(imagePath: string): Promise<{ text: string; confidence: number; method: string }> {
  console.log('[OCR] 所有OCR失败，启用AI视觉分析');
  
  if (!KIMI_API_KEY) {
    throw new Error('AI视觉分析未配置');
  }
  
  try {
    // 读取图片转为base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // 使用Kimi Vision API分析图片
    const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
      model: 'kimi-k2',
      messages: [
        {
          role: 'system',
          content: '你是一个图片分析助手。请详细描述图片中的内容，包括文字、图表、布局等信息。'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '请分析这张图片，提取其中的所有文字信息和内容描述。如果是表格或命盘等复杂布局，请尽量还原其结构。' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      timeout: 60000
    });
    
    const analysisText = response.data.choices[0].message.content;
    
    return {
      text: `[图片AI分析]\n${analysisText}`,
      confidence: 85, // AI分析给中等置信度
      method: 'ai-vision'
    };
  } catch (error) {
    console.error('[OCR] AI视觉分析失败:', error);
    throw error;
  }
}

export class OCRService {
  // 智能OCR识别（自动重试+降级）
  static async recognize(imagePath: string): Promise<{ 
    text: string; 
    confidence: number; 
    service: string;
    remainingQuota?: number;
    method?: string;
    note?: string;
  }> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const stats = await getOrCreateStats(currentMonth);
    const tencentCount = stats.tencent_count;

    if (!client) {
      throw new Error('OCR 服务未配置');
    }

    if (tencentCount >= TENCENT_FREE_LIMIT) {
      // 额度用完，直接使用AI视觉
      const result = await callAIVision(imagePath);
      return {
        ...result,
        service: 'ai-vision-only',
        note: 'OCR额度已用完，使用AI视觉分析'
      };
    }

    try {
      // 多轮OCR尝试
      let result;
      let note = '';
      
      try {
        result = await tryMultipleOCR(imagePath);
        note = `使用${result.method === 'table' ? '表格' : result.method === 'accurate' ? '高精度' : '基础'}识别模式`;
      } catch (ocrError) {
        // 所有OCR失败，回退到AI视觉
        console.log('[OCR] 所有OCR方法失败，回退到AI视觉');
        result = await callAIVision(imagePath);
        note = 'OCR识别困难，启用AI视觉分析';
      }
      
      // 更新计数
      await stats.update({ tencent_count: tencentCount + 1 });
      const remainingQuota = TENCENT_FREE_LIMIT - (tencentCount + 1);
      
      console.log(`[OCR] 最终识别成功，方法=${result.method || 'unknown'}, 长度=${result.text.length}`);
      
      return {
        ...result,
        service: result.method === 'ai-vision' ? 'ai-vision' : 'tencent-cloud-ocr',
        remainingQuota,
        note
      };
    } catch (error: any) {
      throw new Error(`识别失败: ${error.message}`);
    }
  }

  // 获取统计信息
  static async getStats() {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const stats = await getOrCreateStats(currentMonth);
    
    return {
      tencentCount: stats.tencent_count,
      lastResetDate: currentMonth,
      tencentLimit: TENCENT_FREE_LIMIT,
      tencentRemaining: Math.max(0, TENCENT_FREE_LIMIT - stats.tencent_count)
    };
  }
}
