import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import * as fs from 'fs';
import axios from 'axios';
import { OCRStats } from '../models/task';

const OcrClient = tencentcloud.ocr.v20181119.Client;

// 从环境变量读取密钥
const SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';
const KIMI_API_KEY = process.env.KIMI_API_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

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

// DeepSeek Vision
async function callDeepSeekVision(imagePath: string): Promise<{ text: string; confidence: number; method: string }> {
  console.log('[OCR] 启用DeepSeek Vision');

  if (!DEEPSEEK_API_KEY) {
    throw new Error('DeepSeek API未配置');
  }

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的图片文字识别助手。你的任务是准确提取图片中的所有文字内容。请直接输出识别到的文字，不要添加解释。'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '请提取这张图片中的所有文字信息，直接输出文字内容：' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      timeout: 60000
    });

    const analysisText = response.data.choices[0].message.content;

    const hasRealContent = analysisText &&
                          analysisText.length > 20 &&
                          !analysisText.includes('图片中未检测到文字') &&
                          !analysisText.includes('未检测到') &&
                          !analysisText.includes('没有文字');

    if (hasRealContent) {
      console.log(`[OCR] DeepSeek Vision识别成功: ${analysisText.length}字符`);
      return {
        text: analysisText.trim(),
        confidence: 90,
        method: 'deepseek-vision'
      };
    } else {
      console.log('[OCR] DeepSeek Vision未检测到有效文字');
      return {
        text: '',
        confidence: 0,
        method: 'deepseek-vision-empty'
      };
    }
  } catch (error: any) {
    console.error('[OCR] DeepSeek Vision失败:', error.message);
    throw error;
  }
}

// Kimi Vision
async function callKimiVision(imagePath: string): Promise<{ text: string; confidence: number; method: string }> {
  console.log('[OCR] 启用Kimi Vision');

  if (!KIMI_API_KEY) {
    throw new Error('Kimi API未配置');
  }

  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
      model: 'moonshot-v1-8k',
      messages: [
        {
          role: 'system',
          content: '你是一个专业的图片文字识别助手。你的任务是准确提取图片中的所有文字内容。请直接输出识别到的文字，不要添加解释。'
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: '请提取这张图片中的所有文字信息，直接输出文字内容：' },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64Image}` } }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 4000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
      },
      timeout: 60000
    });

    const analysisText = response.data.choices[0].message.content;

    const hasRealContent = analysisText &&
                          analysisText.length > 20 &&
                          !analysisText.includes('图片中未检测到文字') &&
                          !analysisText.includes('未检测到') &&
                          !analysisText.includes('没有文字');

    if (hasRealContent) {
      console.log(`[OCR] Kimi Vision识别成功: ${analysisText.length}字符`);
      return {
        text: analysisText.trim(),
        confidence: 90,
        method: 'kimi-vision'
      };
    } else {
      console.log('[OCR] Kimi Vision未检测到有效文字');
      return {
        text: '',
        confidence: 0,
        method: 'kimi-vision-empty'
      };
    }
  } catch (error: any) {
    console.error('[OCR] Kimi Vision失败:', error.message);
    throw error;
  }
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

export class OCRService {
  // 智能OCR识别（优先腾讯云OCR，失败后再尝试AI视觉）
  static async recognize(imagePath: string): Promise<{
    text: string;
    confidence: number;
    service: string;
    remainingQuota?: number;
    method?: string;
    note?: string;
    error?: string;
  }> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const stats = await getOrCreateStats(currentMonth);
    const tencentCount = stats.tencent_count;

    console.log(`[OCR] 调试: client=${!!client}, tencentCount=${tencentCount}, limit=${TENCENT_FREE_LIMIT}`);

    // 第1步：优先尝试腾讯云OCR（额度充足时）
    if (client && tencentCount < TENCENT_FREE_LIMIT) {
      try {
        console.log('[OCR] 第1步：尝试腾讯云高精度OCR');
        let result = await callTencentAccurateOCR(imagePath);
        
        // 如果高精度结果不好，再尝试基础OCR
        if (result.text.length < 10) {
          console.log('[OCR] 高精度结果太短，尝试基础OCR');
          const basicResult = await callTencentBasicOCR(imagePath);
          if (basicResult.text.length > result.text.length) {
            result = basicResult;
          }
        }
        
        if (result.text.length > 0) {
          await stats.update({ tencent_count: tencentCount + 1 });
          console.log(`[OCR] 腾讯云OCR成功: ${result.text.length}字符`);
          return {
            ...result,
            service: 'tencent-cloud-ocr',
            remainingQuota: TENCENT_FREE_LIMIT - (tencentCount + 1),
            note: '腾讯云OCR识别成功'
          };
        } else {
          console.log('[OCR] 腾讯云OCR未识别到文字，继续下一步');
        }
      } catch (tencentError: any) {
        console.log('[OCR] 腾讯云OCR失败:', tencentError.message);
      }
    } else if (tencentCount >= TENCENT_FREE_LIMIT) {
      console.log('[OCR] 腾讯云OCR额度已用完，跳过');
    }

    // 第2步：腾讯云失败或额度用完，尝试AI视觉（Kimi优先，DeepSeek备用）
    console.log('[OCR] 第2步：尝试AI视觉识别');
    
    // 先尝试Kimi
    if (KIMI_API_KEY) {
      try {
        console.log('[OCR] 尝试Kimi Vision');
        const kimiResult = await callKimiVision(imagePath);
        if (kimiResult.text && kimiResult.text.length > 10) {
          console.log(`[OCR] Kimi Vision成功: ${kimiResult.text.length}字符`);
          return {
            ...kimiResult,
            service: 'kimi-vision',
            remainingQuota: TENCENT_FREE_LIMIT - tencentCount,
            note: 'Kimi Vision识别成功'
          };
        }
      } catch (kimiError: any) {
        console.log('[OCR] Kimi Vision失败:', kimiError.message);
      }
    }
    
    // Kimi失败或不可用，尝试DeepSeek
    if (DEEPSEEK_API_KEY) {
      try {
        console.log('[OCR] 尝试DeepSeek Vision');
        const deepseekResult = await callDeepSeekVision(imagePath);
        if (deepseekResult.text && deepseekResult.text.length > 10) {
          console.log(`[OCR] DeepSeek Vision成功: ${deepseekResult.text.length}字符`);
          return {
            ...deepseekResult,
            service: 'deepseek-vision',
            remainingQuota: TENCENT_FREE_LIMIT - tencentCount,
            note: 'DeepSeek Vision识别成功'
          };
        }
      } catch (deepseekError: any) {
        console.log('[OCR] DeepSeek Vision失败:', deepseekError.message);
      }
    }

    // 所有方法都失败
    console.log('[OCR] 所有识别方法均失败');
    return {
      text: '',
      confidence: 0,
      service: 'all-failed',
      note: '所有OCR方法均未能识别到文字',
      error: '图片中未检测到可识别的文字内容'
    };
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
