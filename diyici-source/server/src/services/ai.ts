import axios from 'axios';

// API 配置
const KIMI_API_KEY = process.env.KIMI_API_KEY || '';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

// 角色设定
export const ROLES = {
  PLANNER: '数字产品经理（内阁首辅）',
  EXECUTOR: '数字打工人（六部干吏）',
  REVIEWER: '数字质检员（都察院御史）',
  FINALIZER: '数字史官（翰林院小秘）'
};

// 构建系统提示
function buildSystemPrompt(role: string): string {
  let prompt = `你是${role}，请根据用户需求完成任务。`;
  
  switch (role) {
    case ROLES.PLANNER:
      prompt += `\n\n你的职责是：\n1. 分析用户输入的任务需求\n2. 制定详细的行动指南\n3. 明确任务目标、步骤和预期成果`;
      break;
    case ROLES.EXECUTOR:
      prompt += `\n\n你的职责是：\n1. 根据行动指南执行任务\n2. 生成高质量的初版成果\n3. 确保成果符合用户需求`;
      break;
    case ROLES.REVIEWER:
      prompt += `\n\n你的职责是：\n1. 严格审核提交的成果\n2. 找出问题和不足\n3. 给出详细的审核报告\n4. 最终做出裁决：PASS 或 FAIL\n5. 如果FAIL，提供具体的修改建议`;
      break;
    case ROLES.FINALIZER:
      prompt += `\n\n你的职责是：\n1. 总结整个流程\n2. 提取关键信息\n3. 生成可复用的万能模板\n4. 确保模板结构清晰、内容完整`;
      break;
  }
  return prompt;
}

// 调用 Kimi API
export async function callKimiAPI(role: string, content: string, context?: string): Promise<string> {
  const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
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
export async function callDeepSeekAPI(role: string, content: string, context?: string): Promise<string> {
  const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
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
export function checkReviewPass(reviewResult: string): boolean {
  return reviewResult.toUpperCase().includes('PASS');
}
