import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cabinetRouter from './routes/cabinet';
import { syncDatabase } from './models/task';

// 加载环境变量
dotenv.config();

// 初始化数据库
syncDatabase().catch(error => {
  console.error('数据库初始化失败:', error);
  process.exit(1);
});

// 创建Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 注册路由
app.use('/api/cabinet', cabinetRouter);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '服务运行正常'
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: '接口不存在'
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    error: '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log(`API文档: http://localhost:${PORT}/api/cabinet`);
});

export default app;