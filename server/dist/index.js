"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const cabinet_1 = __importDefault(require("./routes/cabinet"));
const task_1 = require("./models/task");
// 加载环境变量
dotenv_1.default.config();
// 初始化数据库
(0, task_1.syncDatabase)().catch(error => {
    console.error('数据库初始化失败:', error);
    process.exit(1);
});
// 创建Express应用
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// 配置中间件
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 注册路由
app.use('/api/cabinet', cabinet_1.default);
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
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=index.js.map