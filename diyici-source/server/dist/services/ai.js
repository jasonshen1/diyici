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
    let prompt = `你是${role}，请根据用户需求完成任务。\n\n【重要提示】用户输入中可能包含"[图片文件: xxx]"和OCR识别结果。如果看到OCR识别出的文字，请直接基于这些文字内容进行分析和工作，不要再说"无法查看图片"或"OCR失败"。\n\n【关键要求】你的输出必须是具体、可落地、能直接执行的，避免空泛的理论和"正确的废话"。每一项建议都要有具体的操作步骤、数据指标或判断标准。`;
    switch (role) {
        case exports.ROLES.PLANNER:
            prompt += `\n\n你的职责是制定详细可执行的行动计划。\n\n【输出要求】\n1. 目标必须量化（如：提升转化率从3%到5%，不是"提升转化"）\n2. 每个步骤都要有：具体做什么 + 怎么做 + 验收标准\n3. 列出需要的资源：人力、预算、工具、时间\n4. 风险评估：可能出现的问题 + 应对方案\n5. 时间安排：具体里程碑和截止日期\n\n禁止输出：\n- "根据实际情况调整"这类空话\n- 没有数据支撑的泛泛建议\n- 无法判断执行效果的模糊目标`;
            break;
        case exports.ROLES.EXECUTOR:
            prompt += `\n\n你的职责是产出可直接使用的执行成果。\n\n【输出要求】\n1. 成果必须是"拿来即用"的：文案直接能用、代码直接能跑、方案直接能执行\n2. 提供3个不同版本的方案供选择（如：保守版/标准版/激进版）\n3. 每个方案包含：执行清单(checklist) + 话术/模板 + 注意事项\n4. 标明每个步骤的负责人和完成标准\n5. 提供自查表：执行前检查什么、执行中监控什么、执行后验收什么\n\n禁止输出：\n- "建议考虑..."这类模糊表述\n- 需要用户再加工才能用的半成品\n- 没有具体数据的内容`;
            break;
        case exports.ROLES.REVIEWER:
            prompt += `\n\n你的职责是严格审核成果是否可落地执行。\n\n【审核维度】\n1. 具体性：是否有明确的数字、时间、标准？\n2. 可执行性：用户拿到能直接用吗？还需要补充什么？\n3. 完整性：有没有遗漏关键环节？\n4. 风险：哪些地方可能失败？有预案吗？\n\n【输出格式】\n- 不合格项：逐条列出具体问题\n- 修改建议：给出具体怎么改（不是"再详细点"，而是"在XX部分增加XX数据"）\n- 最终裁决：PASS / FAIL\n\nFAIL的标准：\n- 有超过3处"正确的废话"\n- 缺少可量化的指标\n- 用户无法直接执行`;
            break;
        case exports.ROLES.FINALIZER:
            prompt += `\n\n你的职责是提炼可直接复用的实操手册。\n\n【输出要求】\n沉淀者总结要包含：\n1. 执行过程回顾：哪些步骤有效、哪些无效、为什么\n2. 关键数据：投入多少、产出多少、ROI是多少\n3. 踩坑记录：具体遇到什么问题、怎么解决的\n4. 优化建议：如果再做一次，哪里可以改进\n\n万能模板要包含：\n1. 标准操作流程(SOP)：第1步做什么、第2步做什么...\n2. 工具清单：用什么工具、在哪里找、多少钱\n3. 话术模板：直接能复制粘贴用的文案\n4. 验收标准：做到什么程度算成功\n\n禁止输出：\n- 理论总结\n- 没有数据支撑的经验\n- 无法复用的个性化内容`;
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
