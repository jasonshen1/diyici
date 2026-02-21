import express from 'express';
import multer from 'multer';
import path from 'path';
import { OCRService } from '../services/ocr-service';

const router = express.Router();

// 配置 multer 保留原始文件扩展名
const storage = multer.diskStorage({
  destination: '/tmp/uploads/',
  filename: (req, file, cb) => {
    // 生成唯一文件名但保留原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg'; // 默认 .jpg
    cb(null, 'ocr-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage });

// POST /api/ocr/recognize
// 智能识别（自动切换腾讯云/本地）
router.post('/recognize', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    const result = await OCRService.recognize(req.file.path);
    
    // 删除临时文件
    try {
      require('fs').unlinkSync(req.file.path);
    } catch (e) {}
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    // 删除临时文件
    try {
      if (req.file) require('fs').unlinkSync(req.file.path);
    } catch (e) {}
    
    console.error('OCR 识别失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'OCR 识别失败'
    });
  }
});

// POST /api/ocr/tencent
// 强制使用腾讯云（兼容旧接口）
router.post('/tencent', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' });
    }

    const result = await OCRService.recognize(req.file.path);
    
    // 删除临时文件
    try {
      require('fs').unlinkSync(req.file.path);
    } catch (e) {}
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    // 删除临时文件
    try {
      if (req.file) require('fs').unlinkSync(req.file.path);
    } catch (e) {}
    
    console.error('OCR 识别失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'OCR 识别失败'
    });
  }
});

// GET /api/ocr/stats
// 获取 OCR 使用统计
router.get('/stats', async (req, res) => {
  try {
    const stats = await OCRService.getStats();
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取统计失败'
    });
  }
});

export default router;