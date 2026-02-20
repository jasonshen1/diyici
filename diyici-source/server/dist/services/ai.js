"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLES = void 0;
exports.callKimiAPI = callKimiAPI;
exports.callDeepSeekAPI = callDeepSeekAPI;
exports.checkReviewPass = checkReviewPass;
const axios_1 = require("axios");
// API 配置
const KIMI_API_KEY = process.env.KIMI_API_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
// 角色设定
exports.ROLES = {
    PLANNER: '数字产品经理（内阁首辅）',
    EXECUTOR: '数字打工人（六部干吏）',
    REVIEWER: '数字质检员（都察院御史）',
    FINALIZER: '数字史官（翰林院小秘）'
};
// 构建系统提示
function buildSystemPrompt(role) {
    let prompt = `你是${role}，请根据用户需求完成任务。\n\n【重要提示】用户输入中可能包含"[图片文件: xxx]"和OCR识别结果。如果看到OCR识别出的文字，请直接基于这些文字内容进行分析和工作，不要再说"无法查看图片"或"OCR失败"。如果OCR结果为空，可以基于已知的文字信息继续工作。`;
    switch (role) {
        case exports.ROLES.PLANNER:
            prompt += `\n\n你的职责是：\n1. 分析用户输入的任务需求（包括OCR识别的文字）\n2. 制定详细的行动指南\n3. 明确任务目标、步骤和预期成果`;
            break;
        case exports.ROLES.EXECUTOR:
            prompt += `\n\n你的职责是：\n1. 根据行动指南执行任务\n2. 生成高质量的初版成果\n3. 确保成果符合用户需求`;
            break;
        case exports.ROLES.REVIEWER:
            prompt += `\n\n你的职责是：\n1. 严格审核提交的成果\n2. 找出问题和不足\n3. 给出详细的审核报告\n4. 最终做出裁决：PASS 或 FAIL\n5. 如果FAIL，提供具体的修改建议`;
            break;
        case exports.ROLES.FINALIZER:
            prompt += `\n\n你的职责是：\n1. 详细总结整个流程（包括各阶段做了什么、遇到的问题、解决方案）\n2. 提炼出简洁的万能模板（可复用的标准化流程框架）\n\n【输出格式要求】\n你必须用以下格式输出，两部分都要包含：\n\n===== 沉淀者总结 =====\n[详细总结整个流程，包括背景、过程、问题、解决方案等]\n\n===== 万能模板 =====\n[提炼出的简洁可复用模板，只保留核心框架和关键步骤]\n\n注意：总结部分要详细全面，模板部分要简洁实用，两者内容不同。`;
            break;
    }
    return prompt;
}
// 调用 Kimi API
async function callKimiAPI(role, content, context) {
    const response = await axios_1.default.post('https://api.moonshot.cn/v1/chat/completions', {
        model: 'kimi-k2',
        messages: [
            { role: 'system', content: buildSystemPrompt(role) },
            { role: 'user', content: context ? `${context}\n\n${content}` : content }
        ],
        temperature: 0.7,
        max_tokens: 2000
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${KIMI_API_KEY}`
        }
    });
    return response.data.choices[0].message.content;
}
// 调用 DeepSeek API
async function callDeepSeekAPI(role, content, context) {
    const response = await axios_1.default.post('https://api.deepseek.com/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
            { role: 'system', content: buildSystemPrompt(role) },
            { role: 'user', content: context ? `${context}\n\n${content}` : content }
        ],
        temperature: 0.7,
        max_tokens: 2000
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
    });
    return response.data.choices[0].message.content;
}
// 检查审核结果
function checkReviewPass(reviewResult) {
    return reviewResult.toUpperCase().includes('PASS');
}
//# sourceMappingURL=ai.js.map
