import express from 'express';
import multer from 'multer';
import { TencentCloudOCR } from '../services/tencent-ocr';

const router = express.Router();
const upload = multer({ dest: '/tmp/uploads/' });

// POST /api/ocr/tencent
// 调用腾讯云 OCR 识别图片
router.post('/tencent', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    const result = await TencentCloudOCR.recognize(req.file.path);
    
    res.json({
      success: true,
      text: result.text,
      confidence: result.confidence,
      service: 'tencent-cloud-ocr'
    });
  } catch (error) {
    console.error('腾讯云 OCR 调用失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'OCR 识别失败'
    });
  }
});

export default router;