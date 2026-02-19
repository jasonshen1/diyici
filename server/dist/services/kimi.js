"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLES = void 0;
exports.callKimiAPI = callKimiAPI;
exports.checkReviewPass = checkReviewPass;
exports.extractReviewSuggestions = extractReviewSuggestions;
const axios_1 = __importDefault(require("axios"));
// Kimi API配置
const KIMI_API_KEY = process.env.KIMI_API_KEY || '';
const KIMI_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
// 角色设定
exports.ROLES = {
    PLANNER: '数字产品经理（内阁首辅）',
    EXECUTOR: '数字打工人（六部干吏）',
    REVIEWER: '数字质检员（都察院御史）',
    FINALIZER: '数字史官（翰林院小秘）'
};
// 调用Kimi API的函数
async function callKimiAPI(role, content, context) {
    try {
        // 构建系统提示
        let systemPrompt = `你是${role}，请根据用户需求完成任务。`;
        // 根据角色添加特定的系统提示
        switch (role) {
            case exports.ROLES.PLANNER:
                systemPrompt += `\n\n你的职责是：
1. 分析用户输入的任务需求
2. 制定详细的行动指南
3. 明确任务目标、步骤和预期成果`;
                break;
            case exports.ROLES.EXECUTOR:
                systemPrompt += `\n\n你的职责是：
1. 根据行动指南执行任务
2. 生成高质量的初版成果
3. 确保成果符合用户需求`;
                break;
            case exports.ROLES.REVIEWER:
                systemPrompt += `\n\n你的职责是：
1. 严格审核提交的成果
2. 找出问题和不足
3. 给出详细的审核报告
4. 最终做出裁决：PASS 或 FAIL
5. 如果FAIL，提供具体的修改建议`;
                break;
            case exports.ROLES.FINALIZER:
                systemPrompt += `\n\n你的职责是：
1. 总结整个流程
2. 提取关键信息
3. 生成可复用的万能模板
4. 确保模板结构清晰、内容完整`;
                break;
        }
        // 构建消息列表
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: context ? `${context}\n\n${content}` : content }
        ];
        // 调用API
        const response = await axios_1.default.post(KIMI_API_URL, {
            model: 'kimi-k2',
            messages,
            temperature: 0.7,
            max_tokens: 2000
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${KIMI_API_KEY}`
            }
        });
        // 提取并返回结果
        const result = response.data.choices[0].message.content;
        return result;
    }
    catch (error) {
        console.error('Kimi API调用失败:', error);
        throw new Error('AI API调用失败，请检查API密钥和网络连接');
    }
}
// 检查审核结果是否通过
function checkReviewPass(reviewResult) {
    return reviewResult.toUpperCase().includes('PASS');
}
// 从审核结果中提取修改建议
function extractReviewSuggestions(reviewResult) {
    const match = reviewResult.match(/修改建议[:：]([\s\S]*)/i);
    return match ? match[1] : reviewResult;
}
//# sourceMappingURL=kimi.js.map