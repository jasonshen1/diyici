import { Visit, PageView } from './model';
import { Op } from 'sequelize';

export class AnalyticsService {
  // 记录访问
  async trackVisit(data: {
    ip: string;
    userAgent: string;
    referrer: string;
    page: string;
    sessionId: string;
  }) {
    try {
      // 解析 IP 获取地理位置（简化版）
      const country = this.getCountryFromIP(data.ip);
      const city = this.getCityFromIP(data.ip);

      // 记录访问
      await Visit.create({
        ip: data.ip,
        user_agent: data.userAgent,
        referrer: data.referrer,
        page: data.page,
        country,
        city,
        session_id: data.sessionId
      });

      // 更新页面浏览统计
      const today = new Date().toISOString().split('T')[0];
      const [pageView, created] = await PageView.findOrCreate({
        where: { page: data.page, date: today },
        defaults: { views: 1 }
      });

      if (!created) {
        await pageView.increment('views');
      }

      return { success: true };
    } catch (error) {
      console.error('统计记录失败:', error);
      return { success: false };
    }
  }

  // 获取统计数据
  async getStats() {
    try {
      // 总访问数
      const totalVisits = await Visit.count();

      // 今日访问
      const today = new Date().toISOString().split('T')[0];
      const todayVisits = await Visit.count({
        where: {
          created_at: {
            [Op.gte]: new Date(today)
          }
        }
      });

      // 独立访客（按 IP 统计）
      const uniqueVisitors = await Visit.count({
        distinct: true,
        col: 'ip'
      });

      // 今日独立访客
      const todayUniqueVisitors = await Visit.count({
        distinct: true,
        col: 'ip',
        where: {
          created_at: {
            [Op.gte]: new Date(today)
          }
        }
      });

      // 热门页面
      const topPages = await PageView.findAll({
        attributes: ['page', 'views'],
        order: [['views', 'DESC']],
        limit: 10
      });

      // 访问来源
      const referrers = await Visit.findAll({
        attributes: ['referrer'],
        group: ['referrer'],
        raw: true
      });

      // 地理位置统计
      const countries = await Visit.findAll({
        attributes: ['country', [sequelize.fn('COUNT', sequelize.col('country')), 'count']],
        group: ['country'],
        order: [[sequelize.fn('COUNT', sequelize.col('country')), 'DESC']],
        limit: 10,
        raw: true
      });

      return {
        totalVisits,
        todayVisits,
        uniqueVisitors,
        todayUniqueVisitors,
        topPages,
        referrers,
        countries
      };
    } catch (error) {
      console.error('获取统计失败:', error);
      throw error;
    }
  }

  // 简化版 IP 地理位置（实际可用 IP 库）
  private getCountryFromIP(ip: string): string {
    // 简化处理，返回 "中国" 或 "海外"
    const chineseIPs = ['223.', '119.', '114.', '101.', '183.', '116.', '117.', '42.', '106.'];
    for (const prefix of chineseIPs) {
      if (ip.startsWith(prefix)) return '中国';
    }
    return '海外';
  }

  private getCityFromIP(ip: string): string | null {
    // 简化处理
    return null;
  }
}

export const analyticsService = new AnalyticsService();

// 引入 sequelize 用于查询
import { sequelize } from '../models/task';
