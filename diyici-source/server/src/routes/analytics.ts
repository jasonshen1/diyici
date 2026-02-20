import express from 'express';
import { analyticsService } from '../analytics/service';
import crypto from 'crypto';

const router = express.Router();

// POST /api/analytics/track
// 记录页面访问
router.post('/track', async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || '';
    const referrer = req.headers.referer || req.headers.referrer || '';
    const { page, sessionId } = req.body;

    // 生成会话ID（如果没有）
    const sid = sessionId || crypto.randomUUID();

    await analyticsService.trackVisit({
      ip: String(ip).split(',')[0].trim(),
      userAgent: String(userAgent),
      referrer: String(referrer),
      page: page || '/',
      sessionId: sid
    });

    res.status(200).json({ success: true, sessionId: sid });
  } catch (error) {
    console.error('统计记录失败:', error);
    res.status(200).json({ success: false });
  }
});

// GET /api/analytics/stats
// 获取统计数据（需要简单认证）
router.get('/stats', async (req, res) => {
  try {
    // 简单认证 - 检查查询参数中的 token
    const token = req.query.token;
    if (token !== 'diyici2024') {
      return res.status(401).json({ error: '未授权' });
    }

    const stats = await analyticsService.getStats();
    res.status(200).json(stats);
  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({ error: '获取统计失败' });
  }
});

export default router;
