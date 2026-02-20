# Trae CN 实现提示词

## 目标
在 Trae CN 中实现 diyici.ai 的"一键托管运行"功能，让数字内阁真正在云端自动运行。

## 完整提示词（复制到 Trae 的 Builder 模式）

```
我需要开发一个后端服务，实现 diyici.ai 的"数字内阁"一键托管运行功能。

## 项目背景
- 当前 diyici.ai 是静态网站，只有前端展示
- 需要增加后端 API，实现真正的"一键托管运行"
- 用户在前端输入需求，后端自动调用 AI 完成四步流程

## 技术栈要求
- 后端：Node.js + Express + TypeScript
- AI API：Kimi (Moonshot AI)
- 数据库：SQLite（简单存储用户请求和结果）
- 部署：支持 Docker 部署

## 核心功能

### 1. API 端点
POST /api/cabinet/run
- 接收用户输入的需求（text）
- 返回任务 ID，异步执行四步流程

GET /api/cabinet/status/:id
- 查询任务执行状态

GET /api/cabinet/result/:id
- 获取最终结果

### 2. 四步流程自动化
第一步 - 谋局者（首辅）：
- 调用 Kimi API，角色设定为"数字产品经理（内阁首辅）"
- 系统提示词使用 quad-brain.md 中的"谋局者（首辅）提示词"
- 用户输入作为任务需求
- 输出：行动指南（JSON 格式）

第二步 - 执行者（干吏）：
- 调用 Kimi API，角色设定为"数字打工人（六部干吏）"
- 系统提示词使用 quad-brain.md 中的"执行者（干吏）提示词"
- 输入第一步的行动指南
- 输出：初版成果

第三步 - 找茬者（御史）：
- 调用 Kimi API，角色设定为"数字质检员（都察院御史）"
- 系统提示词使用 quad-brain.md 中的"找茬者（御史）提示词"
- 输入第二步的成果
- 输出：审核报告（包含裁决：PASS 或 FAIL）
- 如果 FAIL，回到第二步让执行者修改（最多循环 3 次）

第四步 - 沉淀者（史官）：
- 调用 Kimi API，角色设定为"数字史官（翰林院小秘）"
- 系统提示词使用 quad-brain.md 中的"沉淀者（史官）提示词"
- 输入全过程
- 输出：万能模板

### 3. 数据库设计
表：tasks
- id: INTEGER PRIMARY KEY
- user_input: TEXT
- status: TEXT (pending, planning, executing, reviewing, archiving, completed, failed)
- planning_result: TEXT
- execution_result: TEXT
- review_result: TEXT
- final_result: TEXT
- template: TEXT
- created_at: DATETIME
- updated_at: DATETIME

### 4. 前端交互页面
创建 api-test.html：
- 简单的输入框，用户输入需求
- 提交按钮，调用 POST /api/cabinet/run
- 显示任务 ID
- 轮询 GET /api/cabinet/status/:id 显示进度
- 完成后显示 GET /api/cabinet/result/:id 的结果
- 结果包含：最终成果 + 万能模板

### 5. 环境变量配置
.env.example：
KIMI_API_KEY=your_kimi_api_key
PORT=3000
DATABASE_URL=./data/cabinet.db

### 6. 项目结构
```
diyici/
├── public/          # 现有静态网站文件
├── server/          # 新增后端代码
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   └── cabinet.ts
│   │   ├── services/
│   │   │   ├── kimi.ts
│   │   │   └── cabinet.ts
│   │   ├── models/
│   │   │   └── task.ts
│   │   └── database.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

### 7. 关键实现细节

谋局者调用示例：
```typescript
const planningPrompt = `你是数字产品经理（内阁首辅）。
死规矩：不准亲手干脏活。唯一任务：拿着模糊不清的想法，进行极其冷静的拆解，输出像法律条文一样的行动指南。

用户需求：${userInput}

请输出：
1. 需求理解（用户到底想要什么）
2. 目标定义（做成什么样算成功）
3. 功能清单（要包含哪些）
4. 实现步骤（分几步做）
5. 验收标准（怎么检查对不对）`;

const result = await kimiApi.chat(planningPrompt);
```

执行者调用示例：
```typescript
const executionPrompt = `你是数字打工人（六部干吏）。
设定：没有感情的、极致高效的干饭机器。

首辅给你的行动指南是：${planningResult}

请按照这个指南，产出具体的成果。`;

const result = await kimiApi.chat(executionPrompt);
```

找茬者调用示例：
```typescript
const reviewPrompt = `你是数字质检员（都察院御史），极其尖酸刻薄、眼高于顶、不留情面。

干吏的成果是：${executionResult}

请检查并给出裁决。
最后一行必须写：**裁决：通过（PASS）** 或 **裁决：不通过（FAIL）**`;

const result = await kimiApi.chat(reviewPrompt);
// 解析结果，判断是否包含 "PASS" 或 "FAIL"
```

### 8. 部署说明
- 提供 Dockerfile 和 docker-compose.yml
- 支持一键部署到服务器
- 前端和后端一起运行

### 9. 开发步骤
1. 创建 server/ 目录和基础文件
2. 实现 Kimi API 封装
3. 实现四步流程逻辑
4. 实现数据库操作
5. 实现 API 路由
6. 创建前端测试页面
7. 编写部署文档

请按照以上要求，生成完整的后端服务代码。确保代码可以直接运行，并且包含详细的注释。
```

## 给 Kimi 的提示词（获取 API Key）

如果你还没有 Kimi API Key，用这个提示词问 Kimi：

```
我想申请 Kimi API Key 来开发一个项目，请告诉我：
1. 如何注册 Kimi 开放平台账号
2. 如何获取 API Key
3. API 的定价和免费额度
4. 快速开始示例代码（Node.js）
```

## 预期输出

Trae 会生成：
1. `server/` 目录下的完整后端代码
2. `package.json` 和 `tsconfig.json`
3. `Dockerfile` 和 `docker-compose.yml`
4. `api-test.html` 前端测试页面
5. 部署文档

## 后续步骤

1. 在 Trae 中粘贴上面的完整提示词
2. 等待 Trae 生成代码
3. 申请 Kimi API Key（kimi.moonshot.cn）
4. 创建 `.env` 文件填入 API Key
5. 运行 `docker-compose up` 启动服务
6. 访问 `http://localhost:3000/api-test.html` 测试

## 注意事项

- Kimi API 需要充值或申请免费额度
- 四步流程会调用 4 次 API，注意成本控制
- 建议先实现简单版本（一步流程），验证通后再实现完整四步
- 可以增加并发限制，防止滥用
