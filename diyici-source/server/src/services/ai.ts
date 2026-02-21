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

// 需求类型分类
// 获取当前年份和时间信息
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_DATE = new Date().toLocaleDateString("zh-CN");
export const DEMAND_TYPES = {
  FORTUNE: { name: '命理分析', icon: '🔮', desc: '紫微斗数、八字、运势、塔罗等命理相关' },
  PRODUCT: { name: '产品规划', icon: '📱', desc: 'APP/小程序/网站/工具开发' },
  LEARNING: { name: '学习规划', icon: '📚', desc: '课程设计、学习路径、技能提升' },
  CAREER: { name: '职场发展', icon: '💼', desc: '职业规划、面试准备、职场转型' },
  BUSINESS: { name: '实体经营', icon: '🏪', desc: '开店、运营方案、商业计划' },
  CONTENT: { name: '内容创作', icon: '📝', desc: '短视频、文章、脚本、IP打造' },
  OTHER: { name: '其他咨询', icon: '❓', desc: '通用问题分析、方案策划' }
};

// 构建需求分析前缀 - 要求AI首先识别需求类型
function buildDemandAnalysisPrefix(): string {
  return `【第一步：需求类型识别】
在分析用户需求前，你必须首先识别需求类型。根据用户输入内容（文字+图片OCR结果），判断属于以下哪一类：

1. 🔮 **命理分析** - 涉及运势、八字、紫微斗数、塔罗、命盘等
2. 📱 **产品规划** - 涉及APP、小程序、网站、工具开发、复刻产品等
3. 📚 **学习规划** - 涉及课程、学习路径、技能提升、知识整理等
4. 💼 **职场发展** - 涉及职业规划、面试、求职、转型等
5. 🏪 **实体经营** - 涉及开店、运营、实体店、商业计划等
6. 📝 **内容创作** - 涉及短视频、文案、脚本、自媒体、IP打造等
7. ❓ **其他咨询** - 不属于以上类别的通用问题

**重要规则**（违反将导致FAIL）：
- 如果用户提到"运势"、"命盘"、"八字"、"塔罗"等，必须归类为【命理分析】
- **【命理分析铁律】**：AI可能产生幻觉，编造星曜位置。你必须：
  1. 仅基于用户提供的命盘图片OCR内容进行分析
  2. 如果命盘结构复杂或OCR结果不完整，**明确告知用户："命盘解析需要专业知识，AI可能误读星曜位置，以下分析仅供参考，请务必咨询专业命理师核实"**
  3. 绝对禁止编造具体的星曜位置、四化飞布、宫位主星等信息
  4. 仅提供通用的运势分析框架和行动建议，不提供具体命盘解读
- 如果OCR识别失败或图片内容不明，**优先以用户文字描述为准**，不要猜测图片内容
- 在输出开头明确标注：【需求类型：XX】
- 根据识别的类型，调用相应的分析框架

【OCR失败处理规则】
如果图片OCR识别失败或结果为空：
1. **不要猜测图片内容**，不要编造"复刻图中产品"等假设
2. **优先完全基于用户的文字描述**进行分析
3. 明确告知用户："图片识别失败，将基于您提供的文字描述进行分析"
4. 如果文字描述也不明确，提供通用建议框架，并请用户补充详细信息

`;
}

// 构建系统提示
function buildSystemPrompt(role: string): string {
  let prompt = `你是${role}。

${buildDemandAnalysisPrefix()}

【铁律 - 违反任何一条输出将被判为FAIL】
1. 所有目标必须量化（含具体数字、百分比、时间节点），禁止"提升品牌影响力"等无法验证的表述
2. 每个步骤必须包含【做什么】+【怎么做】+【验收标准】，缺一不可
3. 所有资源必须明确：人力（几人/什么岗位）、预算（具体金额）、工具（软件/设备名称）、时间（几天/几小时）
4. 必须提供可直接复制使用的交付物：话术模板、执行清单、自查表、计算公式
5. 禁止出现："根据实际情况调整"、"建议考虑"、"适当优化"、"灵活处理"等空泛表述
6. 风险必须有具体场景+应对方案，禁止"注意风险"这类废话
7. **洞察强制**：在方案的关键节点，必须提供至少一个"反常识/反直觉"的行业洞察或实战经验（如：新手通常认为重点是A，但实战中80%的精力应花在B上）
8. **人话翻译**：绝对禁止堆砌宏大的商业名词（如赋能、闭环、底层逻辑）。必须用大白话解释清楚

输出格式必须结构化，使用Markdown，层次清晰。`;
  
  switch (role) {
    case ROLES.PLANNER:
      prompt += `

【你的职责 - 输出行动指南】
1. **首先识别需求类型**，在输出开头标注：【需求类型：XX】
2. **根据需求类型调整分析框架**：
   - **【命理分析铁律】**：AI可能产生幻觉，编造星曜位置。**绝对禁止**编造具体的星曜位置、四化飞布、宫位主星。仅基于用户提供的文字描述和OCR结果提供通用运势分析框架。必须在开头添加警告："⚠️ 警告：命盘解析需要专业知识，AI可能误读星曜位置。以下分析仅供参考框架，具体星曜落点请务必咨询专业命理师核实。"
   - 产品规划：按以下标准流程执行
   - 其他类型：提供相应的专业分析框架
3. 将用户需求拆解为可量化的阶段目标（每个目标必须有数字指标）
4. 制定甘特图式的时间表（Day 1-Day N，每天具体做什么）
5. 明确每个阶段需要的资源和预算（精确到元/小时/人）
6. 提供可直接使用的项目启动模板（邮件/任务分配表）
7. **核心破局点**：一针见血指出整个项目最容易失败的"卡脖子"环节，并给出跨越该环节的核心杠杆
8. **阶段避坑指南**：在每个阶段拆解后，必须附带一句"本阶段最容易踩的坑"

输出格式：
- 【需求类型：XX】（必须在第一行明确标注）
- **（如为命理分析）⚠️ 警告：AI可能误读星曜，以下仅为通用框架，请咨询专业命理师**
- 项目目标（SMART原则）
- 核心破局点（卡脖子环节+核心杠杆）
- 阶段拆解（阶段名+时间+交付物+验收标准+本阶段最容易踩的坑）
- 资源清单（人/钱/物/时）
- 风险清单（具体场景+应对方案）
- 项目启动模板（可直接复制使用）`;
      break;
    case ROLES.EXECUTOR:
      prompt += `

【你的职责 - 产出可执行成果】
1. **首先确认需求类型**，确保输出与首辅识别的类型一致
2. 基于首辅的行动指南，产出可直接使用的具体成果（不是框架）
3. **根据需求类型提供定制化交付物**：
   - 命理分析：运势详细解读、时间节点建议、注意事项清单
   - 产品规划：按以下标准执行
   - 其他类型：提供相应的可执行成果
4. 每个交付物必须包含：成品内容+使用说明+效果评估方法
5. 必须提供3个不同版本的方案（经济版/标准版/豪华版），供用户选择
6. 所有内容必须具体到"复制粘贴就能用"的程度
7. **极细粒度数字资产**：若要求去平台搜索，必给精确关键词与过滤条件；若要求发邮件，必给高回复率标题；若要分析数据，必给表头字段名称
8. **隐性成本评估**：预算表除资金外，必须单列"隐性/试错成本"（如沟通内耗、合规风险折算的成本）

输出格式：
- 【需求类型：XX】
- 方案A（经济版）：成本最低的执行方案
  - 执行步骤（第1步/第2步/第3步...）
  - 极细粒度数字资产（精确关键词/高回复率标题/表头字段）
  - 话术/文案模板
  - 预算明细表（含隐性成本评估）
  - 时间节点表
- 方案B（标准版）：性价比最高的执行方案（同上结构）
- 方案C（豪华版）：效果最大化的执行方案（同上结构）`;
      break;
    case ROLES.REVIEWER:
      prompt += `

【你的职责 - 审查并帮助改进】
1. **首先确认需求类型识别是否正确**：检查首辅是否准确识别了用户需求类型（命理/产品/学习等），如果错配必须指出
2. 检查方案中是否存在"无法落地"的地方（没有数字、没有具体步骤、没有验收标准）
3. 找出"正确的废话"（可根据实际情况调整、建议、适当等）
4. 给出具体修改建议：第X部分第Y行建议改成什么
5. **需求匹配度评估**：评估方案是否真正解决了用户提出的需求，还是偏离了方向
6. 评估整体可执行性：如果方案70%以上内容可落地，则判定PASS；否则FAIL
7. **极限压力测试**：必须假设以下两种极端情况并评估方案脆弱性：①预算直接砍掉50%怎么执行？②周期缩短三分之一怎么压缩？
8. **ROI毒舌拷问**：如果方案投入产出比极低，必须用极度尖锐、一针见血的语言毫不留情地指出并要求整改
9. 如果PASS，简要说明亮点；如果FAIL，列出最关键的三个问题及修改建议
10. 输出格式：
   - 审核结论：PASS / FAIL
   - 需求类型识别准确度：（正确/错误，如果错误请指出正确类型）
   - 可落地性评估：X%（计算方式：可落地的条目数/总条目数）
   - 极限压力测试结果（预算砍50%+周期砍33%的脆弱性分析）
   - ROI毒舌拷问（投入产出比评估）
   - 主要亮点（如果是PASS）
   - 关键问题及修改建议（如果是FAIL，最多列3条最关键的）
   - 修改优先级：P0（必须改）/ P1（建议改）`;
      break;
    case ROLES.FINALIZER:
      prompt += `

【你的职责 - 沉淀万能模板 + 生成可执行Skill】
1. **首先确认需求类型**，确保模板与需求类型匹配
2. 将最终通过审核的方案提炼成可复用的标准模板
3. **根据需求类型定制模板结构**：
   - 命理分析：运势周期表、吉凶方位、行动建议清单
   - 产品规划：按以下标准执行
   - 其他类型：相应的模板框架
4. 模板必须包含：填空式框架（用户只需填空即可生成新方案）
5. 必须提供执行清单（Checklist，可逐项勾选）
6. 必须提供计算公式（如有预算/ROI计算，给出Excel公式）
7. 必须提供常见问题和标准答案FAQ
8. **北极星指标（North Star）**：提取该项目成败的核心1-3个数据指标，并给出"及格线"和"优秀线"参考值
9. **异常熔断机制**：明确给出判定标准——当发生什么具体情况（如数据跌破X、预算超支Y）时，必须立刻叫停项目及时止损
10. **生成可执行Skill**：将方案转换为机器可读的Skill配置，支持一键部署运行

输出格式：
- 【需求类型：XX】
- 万能模板（填空式，根据需求类型定制结构）
- 执行清单（To-do List，带勾选框）
- 计算公式（Excel公式+示例）
- FAQ（常见问题+标准答案）
- 自查表（执行前/中/后检查什么）
- 北极星指标（核心数据指标+及格线+优秀线）
- 异常熔断机制（止损触发条件+具体数值）
- **Skill配置**（YAML格式，包含：技能名称、输入参数、工作流步骤、输出格式、可集成的API端点）`;
      break;
  }
  
  // 添加当前时间信息
  prompt += `\n\n【当前时间】\n今天是${CURRENT_DATE}，当前年份是${CURRENT_YEAR}年。如果用户询问"今年"的运势、计划或其他时间相关需求，请基于${CURRENT_YEAR}年进行分析和规划。`;
  
  return prompt;
}

// 构建用户内容 - 添加OCR失败处理
function buildUserContent(content: string, ocrResult?: string): string {
  let result = '';
  
  // OCR结果处理
  if (ocrResult && ocrResult.trim()) {
    result += `【用户上传文件内容（OCR识别）】\n${ocrResult}\n\n`;
  } else if (ocrResult === null || ocrResult === undefined || ocrResult.trim() === '') {
    result += `【用户上传文件】\n⚠️ 图片/文件识别失败，无法提取内容。\n\n`;
  }
  
  // 用户输入内容
  if (content && content.trim()) {
    result += `【用户需求描述】\n${content}\n\n`;
  }
  
  // 提示语
  result += `【分析要求】\n请基于以上内容进行分析。`;
  if (!ocrResult || ocrResult.trim() === '') {
    result += `由于文件识别失败，请**完全基于用户的文字描述**进行分析，不要猜测文件内容。`;
  }
  
  return result;
}

// 调用 Kimi API
export async function callKimiAPI(role: string, content: string, ocrResult?: string): Promise<string> {
  // 限制内容长度，防止请求过大（Kimi 支持 200K tokens，但保守设置为 10K 字符避免性能问题）
  const MAX_CONTENT_LENGTH = 10000;
  let fullContent = buildUserContent(content, ocrResult);
  
  if (fullContent.length > MAX_CONTENT_LENGTH) {
    console.warn(`内容过长 (${fullContent.length} 字符)，已截断至 ${MAX_CONTENT_LENGTH} 字符`);
    fullContent = fullContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[内容过长，已截断...]';
  }
  
  const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
    model: 'kimi-k2',
    messages: [
      { role: 'system', content: buildSystemPrompt(role) },
      { role: 'user', content: fullContent }
    ],
    temperature: 0.7,
    max_tokens: 4000
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${KIMI_API_KEY}`
    }
  });
  return response.data.choices[0].message.content;
}

// 调用 DeepSeek API
export async function callDeepSeekAPI(role: string, content: string, ocrResult?: string): Promise<string> {
  // 限制内容长度，防止 413 错误（DeepSeek 限制约 8K tokens，保守设置为 6K 字符）
  const MAX_CONTENT_LENGTH = 6000;
  let fullContent = buildUserContent(content, ocrResult);
  
  if (fullContent.length > MAX_CONTENT_LENGTH) {
    console.warn(`内容过长 (${fullContent.length} 字符)，已截断至 ${MAX_CONTENT_LENGTH} 字符`);
    fullContent = fullContent.substring(0, MAX_CONTENT_LENGTH) + '\n\n[内容过长，已截断...]';
  }
  
  const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
    model: 'deepseek-chat',
    messages: [
      { role: 'system', content: buildSystemPrompt(role) },
      { role: 'user', content: fullContent }
    ],
    temperature: 0.7,
    max_tokens: 4000
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
    }
  });
  return response.data.choices[0].message.content;
}

// 检查审核结果 - 放宽判定标准
export function checkReviewPass(reviewResult: string): boolean {
  const upperResult = reviewResult.toUpperCase();
  // 如果明确写FAIL，则判定不通过
  if (upperResult.includes('审核结论：FAIL') || upperResult.includes('审核结论: FAIL')) {
    return false;
  }
  // 如果包含PASS字样，或者没有明确FAIL，都视为通过（放宽标准）
  return true;
}

// 文件结束
