import * as tencentcloud from 'tencentcloud-sdk-nodejs';
import * as fs from 'fs';

const OcrClient = tencentcloud.ocr.v20181119.Client;

// 从环境变量读取密钥
const SECRET_ID = process.env.TENCENT_SECRET_ID || '';
const SECRET_KEY = process.env.TENCENT_SECRET_KEY || '';

// 创建客户端
const client = new OcrClient({
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
});

export class TencentCloudOCR {
  static async recognize(imagePath: string): Promise<{ text: string; confidence: number }> {
    if (!SECRET_ID || !SECRET_KEY) {
      throw new Error('腾讯云 OCR 密钥未配置');
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
    } catch (error) {
      console.error('腾讯云 OCR 错误:', error);
      throw error;
    }
  }
}