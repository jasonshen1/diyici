import express from 'express';
import multer from 'multer';
import path from 'path';
import { OCRService } from '../services/ocr-service';
import { DocumentService } from '../services/document-service';

const router = express.Router();

// 配置 multer 保留原始文件扩展名
const storage = multer.diskStorage({
  destination: '/tmp/uploads/',
  filename: (req, file, cb) => {
    // 生成唯一文件名但保留原始扩展名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg'; // 默认 .jpg
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB 文件大小限制
  }
  // 移除 fileFilter 限制，支持任意格式文件
});

// POST /api/ocr/recognize
// 智能文档识别（支持图片、PDF、Word、TXT、Markdown）
router.post('/recognize', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const fileType = req.file.mimetype;
    
    let result: any;
    
    // 根据文件类型选择处理方式
    if (fileType.startsWith('image/')) {
      // 图片 - 使用 OCR
      result = await OCRService.recognize(filePath);
      result.documentType = 'image';
    } else if (fileExt === '.pdf' || fileType === 'application/pdf') {
      // PDF - 提取文本
      const pdfResult = await DocumentService.extractPDF(filePath);
      result = {
        text: pdfResult.text,
        confidence: 95, // PDF提取通常较准确
        method: 'pdf-extract',
        documentType: 'pdf',
        pages: pdfResult.pages,
        service: 'document-extract'
      };
    } else if (fileExt === '.doc' || fileExt === '.docx' || fileType.includes('word')) {
      // Word - 提取文本
      const wordResult = await DocumentService.extractWord(filePath);
      result = {
        text: wordResult.text,
        confidence: 95,
        method: 'word-extract',
        documentType: wordResult.type,
        service: 'document-extract'
      };
    } else if (fileExt === '.txt' || fileExt === '.md' || fileExt === '.markdown' || 
               fileType === 'text/plain' || fileType === 'text/markdown') {
      // 文本文件 - 直接读取
      const text = await DocumentService.extractText(filePath);
      result = {
        text,
        confidence: 100,
        method: 'text-read',
        documentType: fileExt === '.md' || fileExt === '.markdown' ? 'markdown' : 'text',
        service: 'document-extract'
      };
    } else {
      throw new Error('不支持的文件格式');
    }
    
    // 删除临时文件
    try {
      fs.unlinkSync(filePath);
    } catch (e) {}
    
    // 检查OCR结果是否为空
    if (!result.text || result.text.trim().length === 0) {
      console.log('[OCR Route] 识别结果为空:', result.note || '无详细信息');
    }
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    // 删除临时文件
    try {
      if (req.file) fs.unlinkSync(req.file.path);
    } catch (e) {}
    
    console.error('文档识别失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '文档识别失败',
      text: '',
      confidence: 0
    });
  }
});

// POST /api/ocr/tencent
// 兼容旧接口 - 重定向到 recognize
router.post('/tencent', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传文件' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;
    
    let result: any;
    
    // 图片使用 OCR，其他使用文档提取
    if (fileType.startsWith('image/')) {
      result = await OCRService.recognize(filePath);
    } else {
      const docResult = await DocumentService.extract(filePath);
      result = {
        text: docResult.text,
        confidence: 95,
        method: docResult.type + '-extract',
        documentType: docResult.type,
        meta: docResult.meta,
        service: 'document-extract'
      };
    }
    
    // 删除临时文件
    try {
      fs.unlinkSync(filePath);
    } catch (e) {}
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    // 删除临时文件
    try {
      if (req.file) fs.unlinkSync(req.file.path);
    } catch (e) {}
    
    console.error('文档识别失败:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '文档识别失败',
      text: '',
      confidence: 0
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

// 添加 fs 导入
import * as fs from 'fs';

export default router;
