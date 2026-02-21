import express from 'express';
import { cabinetService } from '../services/cabinet';

const router = express.Router();

// POST /api/cabinet/run
// 接收用户输入的需求，返回任务ID
router.post('/run', async (req, res) => {
  try {
    const { text, ocrResult } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: '参数错误，需要提供 text 字段'
      });
    }
    
    const taskId = await cabinetService.runCabinet(text, ocrResult);
    
    res.status(200).json({
      taskId,
      message: '任务已创建，正在执行'
    });
  } catch (error) {
    console.error('创建任务失败:', error);
    res.status(500).json({
      error: '创建任务失败，请稍后重试'
    });
  }
});

// GET /api/cabinet/status/:id
// 查询任务执行状态
router.get('/status/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    
    if (isNaN(taskId)) {
      return res.status(400).json({
        error: '参数错误，任务ID必须是数字'
      });
    }
    
    const status = await cabinetService.getTaskStatus(taskId);
    
    res.status(200).json({
      ...status
    });
  } catch (error) {
    console.error('查询任务状态失败:', error);
    res.status(404).json({
      error: '任务不存在'
    });
  }
});

// GET /api/cabinet/result/:id
// 获取最终结果
router.get('/result/:id', async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    
    if (isNaN(taskId)) {
      return res.status(400).json({
        error: '参数错误，任务ID必须是数字'
      });
    }
    
    const result = await cabinetService.getTaskResult(taskId);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('获取任务结果失败:', error);
    res.status(404).json({
      error: '任务不存在'
    });
  }
});

export default router;