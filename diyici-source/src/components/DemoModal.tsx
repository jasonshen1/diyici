import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Loader2, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    0% {
      transform: translateY(100%);
    }
    70% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Define Scenario Types
type ScenarioId = "weekly" | "social" | "logic" | "meeting" | "emotion" | "terms";

interface ScenarioConfig {
  id: ScenarioId;
  title: string;
  description: string;
  inputs: InputField[];
  template: (data: any) => string;
}

interface InputField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "checkbox";
  placeholder?: string;
  options?: { label: string; value: string }[]; // For select
  defaultValue?: string;
}

// 1. 周报场景配置
const weeklyConfig: ScenarioConfig = {
  id: "weekly",
  title: "职场除皱霜",
  description: "一键平复周报里的逻辑褶皱",
  inputs: [
    { id: "done", label: "本周关键产出 (3件)", type: "textarea", placeholder: "例如：完成A客户签约；修复了登录Bug...", defaultValue: "1. 完成了 Landing Page 的首版设计与开发\n2. 梳理了产品说明书与战略文档\n3. 修复了移动端适配的 2 个 Bug" },
    { id: "blocker", label: "遇到的困难", type: "text", placeholder: "例如：服务器资源不足...", defaultValue: "系统响应速度偶尔不稳定，影响体验" },
    { id: "next", label: "下周计划", type: "textarea", placeholder: "例如：启动B项目...", defaultValue: "1. 上线 B 版浏览器插件 Beta\n2. 优化首页加载速度" },
    { 
      id: "tone", label: "语气风格", type: "select", 
      options: [
        { label: "务实干练 (默认)", value: "pragmatic" },
        { label: "积极进取 (适合晋升)", value: "aggressive" },
        { label: "稳重得体 (国企风格)", value: "steady" }
      ],
      defaultValue: "pragmatic" 
    }
  ],
  template: (data) => {
    const toneMap: Record<string, string> = {
      pragmatic: "风格：务实、数据导向",
      aggressive: "风格：强调突破与增长",
      steady: "风格：强调稳健与合规"
    };
    
    // Simple mock logic for demo
    return `【本周工作汇报】
    
一、核心进展与成果
${data.done.split('\n').map((line: string) => `• ${line.replace(/^\d+\.\s*/, '')} `).join('\n')}

二、关键问题与解决
• 问题：${data.blocker}
• 对策：已协调资源进行专项优化，预计下周二前解决。

三、下周工作计划
${data.next.split('\n').map((line: string) => `• ${line.replace(/^\d+\.\s*/, '')} `).join('\n')}

(${toneMap[data.tone] || "务实风格"})`; 
  }
};

// 2. 高情商回复场景配置
const replyConfig: ScenarioConfig = {
  id: "social",
  title: "社交隔离乳",
  description: "隔离社交表达中的多余情绪，让沟通更得体",
  inputs: [
    { id: "who", label: "对方身份", type: "text", placeholder: "例如：借钱的朋友、催进度的老板...", defaultValue: "很久不联系的前同事" },
    { id: "intent", label: "对方意图", type: "text", placeholder: "例如：想借钱、想让帮忙...", defaultValue: "想找我借 5 万块钱买房" },
    { 
      id: "attitude", label: "我的态度", type: "select", 
      options: [
        { label: "委婉拒绝 (还可以做朋友)", value: "soft" },
        { label: "坚决拒绝 (别来沾边)", value: "hard" },
        { label: "打太极 (拖延战术)", value: "delay" }
      ],
      defaultValue: "soft"
    }
  ],
  template: () => {
    return `【建议回复】
    
这是一个模板回复，实际应用中会根据用户输入生成。`;
  }
};


// 3. 会议提纯乳场景配置
const meetingConfig: ScenarioConfig = {
  id: "meeting",
  title: "会议提纯乳",
  description: "快速提炼会议要点，节省时间",
  inputs: [
    { id: "rawMaterial", label: "会议记录或讨论内容", type: "textarea", placeholder: "请输入会议内容，会议提纯乳会为您提炼关键要点", defaultValue: "今天的会议讨论了产品上线计划，大家各抒己见，有很多不同的想法。有人认为应该先做市场调研，有人认为应该尽快上线抢占市场。最后大家决定下周再开会讨论。" }
  ],
  template: () => {
    return `【会议要点提炼】

一、会议主题
产品上线计划讨论

二、关键讨论
• 是否应该先做市场调研
• 是否应该尽快上线抢占市场

三、达成共识
• 暂未达成最终共识
• 决定下周再开会讨论

四、后续行动
• 相关人员准备更多资料
• 下周同一时间继续讨论`;
  }
};

// 4. 高情商精华场景配置
const emotionConfig: ScenarioConfig = {
  id: "emotion",
  title: "高情商精华",
  description: "提升社交表达的情商，让沟通更顺畅",
  inputs: [
    { id: "rawMaterial", label: "需要优化的表达内容", type: "textarea", placeholder: "请输入你想要表达的内容，高情商精华会为您提升表达效果", defaultValue: "你总是迟到，这让我很生气。" }
  ],
  template: () => {
    return `【高情商表达建议】

亲爱的，我注意到最近几次我们约定的时间你都没能准时到达，这让我感到有些失落和不安。我非常珍惜我们在一起的时光，也希望我们能够更加尊重彼此的时间安排。

如果以后有什么特殊情况导致你可能会迟到，提前告诉我一声好吗？这样我就不会一直担心你了。我相信我们可以一起努力，让我们的相处更加愉快和顺畅。

谢谢你的理解和配合，我真的很在乎我们之间的关系。`;
  }
};

// 5. 条款拆解液场景配置
const termsConfig: ScenarioConfig = {
  id: "terms",
  title: "条款拆解液",
  description: "拆解复杂条款，让信息更易懂",
  inputs: [
    { id: "rawMaterial", label: "需要拆解的复杂条款", type: "textarea", placeholder: "请输入复杂条款内容，条款拆解液会为您简化解释", defaultValue: "本协议的任何修改或变更须经双方书面同意并签署后方可生效。任何一方违反本协议的任何条款，应承担违约责任，并赔偿对方因此遭受的全部损失。" }
  ],
  template: () => {
    return `【条款拆解说明】

一、核心内容
该条款主要说明了协议修改的程序要求和违约责任的承担方式。

二、关键要点
• 协议修改需双方书面同意并签署
• 任何一方违反条款需承担违约责任
• 违约方需赔偿对方全部损失

三、潜在影响
• 确保协议修改的严肃性和法律效力
• 保护守约方的合法权益
• 对违约行为形成威慑

四、注意事项
• 任何协议修改都应通过书面形式
• 签署前仔细阅读修改内容
• 保存好所有协议文件原件
• 如遇违约情况，及时收集证据`;
  }
};

// System Prompt Configurations
const systemPrompts: Record<string, string> = {
  weekly: `你是一位专业的向上管理助手，擅长帮助职场人士撰写高质量的工作汇报。

请根据用户提供的信息，按照以下格式输出一份专业、简洁的工作汇报：

【本周进展】
- 列出本周的主要工作进展
- 保持简洁明了，重点突出

【核心产出】
- 总结本周的核心成果和价值
- 强调对团队和公司的贡献

【下周规划】
- 制定下周的工作计划
- 确保计划具体、可执行

请确保内容专业、积极，体现出良好的向上管理技巧。`,
  
  social: `你是一位社交沟通专家，擅长处理各种社交场合的拒绝场景。

请根据用户提供的信息，为以下三种拒绝场景提供专业、得体的回复方案：

【薄涂】- 委婉拒绝，保持友好关系
- 表达理解和同情
- 给出合理的拒绝理由
- 维持友好的结束

【中厚】- 明确拒绝，态度坚定
- 直接表达立场
- 简洁明了，不拖泥带水
- 保持尊重，避免冲突

【急救】- 紧急拒绝，快速回应
- 直截了当地拒绝
- 不需要过多解释
- 保持专业和礼貌

请确保回复方案符合社交礼仪，既能够表达拒绝的态度，又能够维持良好的人际关系。`,
  
  logic: `你是一位逻辑思维专家，擅长分析和重构复杂的信息。

请根据用户提供的信息，按照以下结构进行重构：

【核心目标】
- 明确表达核心目标和意图
- 确保目标具体、可衡量

【执行路径】
- 设计清晰的执行步骤
- 确保步骤逻辑连贯、可操作

【风险对策】
- 识别可能的风险和挑战
- 提供相应的应对策略

请确保重构后的内容逻辑清晰、结构合理，便于理解和执行。`,
  
  meeting: `你是一位会议管理专家，擅长从冗长的会议内容中提取关键信息。

请根据用户提供的会议内容，仅提取以下三个核心要素：

【结论】
- 会议达成的主要结论和决定
- 保持简洁明了，直击要点

【待办】
- 需要后续执行的具体任务
- 明确任务内容和时间要求

【责任人】
- 每个待办任务的具体负责人
- 确保责任明确，避免模糊

请确保提取的信息准确、完整，便于后续跟踪和执行。`,
  
  emotion: `你是一位商务沟通专家，擅长撰写共赢导向的专业商务回复。

请根据用户提供的信息，生成一份专业、得体的商务回复，遵循以下原则：

1. 共赢导向：寻求双方利益的平衡点
2. 专业礼貌：使用正式、礼貌的语言
3. 清晰明确：表达立场和观点清晰明了
4. 解决方案：提供建设性的解决方案
5. 关系维护：注重维护良好的商务关系

请确保回复内容专业、得体，既能够表达自己的立场，又能够考虑对方的利益，实现共赢的局面。`,
  
  terms: `你是一位创意顾问，擅长从不同角度思考问题并提供创意解决方案。

请根据用户提供的信息，从以下三个不同的视角提供创意：

1. 乔布斯视角：注重创新、用户体验和简洁设计
2. 苏格拉底视角：注重逻辑、提问和深度思考
3. 爱因斯坦视角：注重想象力、突破性思维和跨界融合

每个视角请提供一个具体的创意方案，确保创意独特、有价值，并且与用户的需求相关。`,
  
  negotiation: `你是一位商务谈判专家，擅长将强硬的要求转化为共赢的商业信函。

请根据用户提供的信息，生成一份专业、得体的商务谈判回复，遵循以下原则：

1. 共赢导向：寻求双方利益的平衡点
2. 专业礼貌：使用正式、礼貌的语言
3. 清晰明确：表达立场和观点清晰明了
4. 解决方案：提供建设性的解决方案
5. 关系维护：注重维护良好的商务关系

请确保回复内容专业、得体，既能够表达自己的立场，又能够考虑对方的利益，实现共赢的局面。`,
  
  thinking: `你是一位创意顾问，擅长从不同角度思考问题并提供创意解决方案。

请根据用户提供的信息，从以下三个不同的视角提供创意：

【乔布斯视角】
- 注重创新、用户体验和简洁设计
- 从创新和用户体验的角度提出解决方案
- 强调简洁、高效的设计理念

【苏格拉底视角】
- 注重逻辑、提问和深度思考
- 从逻辑和深度思考的角度分析问题
- 通过提问引导思考，挖掘问题本质

【爱因斯坦视角】
- 注重想象力、突破性思维和跨界融合
- 从想象力和突破性思维的角度思考问题
- 尝试跨界融合不同领域的理念

每个视角请提供一个具体的创意方案，确保创意独特、有价值，并且与用户的需求相关。`
};

// Map scenarios
const scenarioMap: Record<string, ScenarioConfig> = {
  weekly: weeklyConfig,
  social: replyConfig,
  logic: weeklyConfig, // 使用周报配置作为逻辑场景的默认值
  meeting: meetingConfig,
  emotion: emotionConfig,
  terms: termsConfig,
  negotiation: emotionConfig, // 使用情商场景配置作为谈判场景的默认值
  thinking: termsConfig, // 使用条款拆解场景配置作为思维焕新场景的默认值
  // Fallback for others to generic
  default: weeklyConfig 
};


interface DemoModalProps {
  scenarioId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Mock API call function
const callApi = async (systemPrompt: string, userInput: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock response based on system prompt and user input
  // In a real app, this would be an actual API call
  return `【智能生成结果】

${systemPrompt.split('\n').filter(line => line.includes('【')).map(line => line.trim()).join('\n\n')}

根据您提供的信息，我已为您生成了专业的内容。

${userInput.substring(0, 100)}...

这是一个模拟的 API 响应，展示了'厚套壳'功能的实现。在实际应用中，这里会显示真实的 智能生成结果。`;
};

export function DemoModal({ scenarioId, isOpen, onClose }: DemoModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [currentThinkingStep, setCurrentThinkingStep] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  // 使用项目已有的 useIsMobile 钩子
  const isMobile = useIsMobile();

  // 键盘检测逻辑
  useEffect(() => {
    const handleResize = () => {
      if (isMobile) {
        // 检测视口高度变化，判断键盘是否弹出
        const viewportHeight = window.innerHeight;
        const documentHeight = document.documentElement.offsetHeight;
        const keyboardHeight = documentHeight - viewportHeight;
        
        // 如果键盘高度超过100px，认为键盘已弹出
        setKeyboardOpen(keyboardHeight > 100);
      }
    };

    // 监听视口大小变化
    window.addEventListener('resize', handleResize);

    // 清理监听器
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // 自动滚动到按钮位置，当键盘弹出时
  useEffect(() => {
    if (isMobile && keyboardOpen && modalRef.current) {
      // 找到'瞬间焕新'按钮
      const button = modalRef.current.querySelector('button');
      if (button) {
        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isMobile, keyboardOpen]);

  // 思考步骤数组
  const thinkingSteps = [
    "正在拆解需求本质...",
    "正在推演底层逻辑...",
    "正在规避潜在风险...",
    "正在调用跨学科框架...",
    "思维链合成中..."
  ];

  // 动态切换加载文案 - 轮播思考步骤
  useEffect(() => {
    let interval: number;
    if (loading) {
      // 开始轮播
      interval = window.setInterval(() => {
        setCurrentThinkingStep((prev) => (prev + 1) % thinkingSteps.length);
      }, 1500); // 每1.5秒切换一次
    }
    // 清理定时器
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [loading, thinkingSteps.length]);

  // 更新 loadingText 为当前思考步骤
  useEffect(() => {
    if (loading) {
      setLoadingText(thinkingSteps[currentThinkingStep]);
    }
  }, [loading, currentThinkingStep, thinkingSteps]);

  // Initialize config
  const config = (scenarioId && scenarioMap[scenarioId]) 
    ? scenarioMap[scenarioId] 
    : weeklyConfig; // Default fallback

  // 厚套壳配方模板
  const getThickShellTemplate = (scenarioId: string, data: Record<string, string>): string => {
    switch (scenarioId) {
      case "weekly":
        return `【本周工作汇报】

一、核心进展与成果
${data.done ? data.done.split('\n').map((line: string) => `- ${line.replace(/^\d+\.\s*/, '')}`).join('\n') : '- 暂无进展'}

二、关键问题与解决
- 问题：${data.blocker || '暂无问题'}
- 对策：已协调资源进行专项优化，预计下周二前解决。

三、下周工作计划
${data.next ? data.next.split('\n').map((line: string) => `- ${line.replace(/^\d+\.\s*/, '')}`).join('\n') : '- 暂无计划'}

(${data.tone === 'aggressive' ? '风格：强调突破与增长' : data.tone === 'steady' ? '风格：强调稳健与合规' : '风格：务实、数据导向'})`;
      
      case "social":
        return `【建议回复】

${data.attitude === 'soft' ? 
  `亲爱的${data.who}，

谢谢你的信任，能够想到我。关于你提到的${data.intent}，我认真考虑了一下，目前确实不太方便。

最近工作/生活压力有点大，需要更多时间专注于自己的事情。希望你能理解我的处境，我们还是可以保持联系，分享生活中的其他趣事。

祝一切顺利！` : 
  data.attitude === 'hard' ? 
  `你好${data.who}，

关于${data.intent}，我无法满足你的请求。

每个人都有自己的原则和底线，还望尊重。

祝好！` : 
  `你好${data.who}，

收到你的消息，关于${data.intent}，我需要再考虑一下，近期给你回复。

谢谢理解！`
}`;
      
      case "meeting":
        return `【会议要点提炼】

一、核心结论
${data.rawMaterial ? '会议讨论了多个议题，达成了初步共识' : '暂无明确结论'}

二、待办事项
1. 相关人员需进一步整理会议资料
2. 下周同一时间继续讨论未决事项

三、责任人
- 会议记录：参会人员共同负责
- 资料整理：各部门负责人`;
      
      case "logic":
        return `【逻辑优化方案】

一、核心目标
明确目标，确保方向一致

二、执行路径
1. 分析现状，识别关键问题
2. 制定具体行动计划
3. 实施并监控进展
4. 评估结果并持续优化

三、风险对策
- 风险：执行过程中可能遇到阻力
- 对策：提前沟通，获取相关方支持`;
      
      case "negotiation":
        return `【商务谈判回复】

尊敬的甲方团队，

感谢您的详细需求。我们已对您提出的要求进行了全面评估，现回复如下：

关于您提出的交付时间要求，考虑到项目的复杂性和质量要求，我们建议将交付时间调整为[合理时间]，以确保最终成果能够满足您的期望标准。

关于预算方面，基于当前的需求范围和技术复杂度，我们的报价是合理的。当然，我们愿意在保证质量的前提下，与您探讨优化方案，以寻找双方都能接受的平衡点。

我们始终坚持以质量为核心，相信优质的产品和服务才是对您业务最好的支持。期待与您进一步沟通，共同推进项目顺利进行。

专业敬上！`;
      
      case "thinking":
        return `【创新思维方案】

一、乔布斯视角
注重用户体验，简化操作流程，让产品更加直观易用

二、苏格拉底视角
通过提问引导思考，深入挖掘问题本质，找到根本解决方案

三、爱因斯坦视角
突破传统思维局限，跨界融合不同领域的理念，创造全新的解决方案`;
      
      default:
        return `【智能生成结果】

根据您提供的信息，我已为您生成了专业的内容。

这是一个模板回复，实际应用中会根据您的具体输入生成更个性化的内容。`;
    }
  };

  // Generate result using API
  const generateResult = useCallback(async (data: Record<string, string>) => {
    if (!scenarioId) return;
    
    setLoading(true);
    try {
      // 使用厚套壳配方生成结果
      const result = getThickShellTemplate(scenarioId, data);
      setResult(result);
    } catch (error) {
      setResult("抱歉，生成过程中出现错误，请重试。");
      console.error("API call error:", error);
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      const initialData: Record<string, string> = {};
      config.inputs.forEach(input => {
        initialData[input.id] = input.defaultValue || "";
      });
      setFormData(initialData);
      setResult(""); // Clear previous result
      // Generate initial result using API
      generateResult(initialData);
    }
  }, [isOpen, config, generateResult]);

  const handleInputChange = (id: string, value: string) => {
    const newData = { ...formData, [id]: value };
    setFormData(newData);
    
    // Generate result using API
    generateResult(newData);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>  
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={onClose} direction="bottom">
          <DrawerContent 
            ref={modalRef}
            className={`
              fixed bottom-0 left-0 right-0 top-[${keyboardOpen ? '10vh' : '20vh'}] max-w-none w-full h-[${keyboardOpen ? '90vh' : '80vh'}] rounded-t-3xl rounded-b-none p-0 overflow-hidden gap-0 bg-[#F0F0E8] shadow-2xl shadow-black/10
            `}
            style={{ 
              animation: 'slideUp 0.5s ease-out forwards',
              transform: 'translateY(100%)'
            }}
          >
            {/* 顶部拉柄暗示 */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-[#91A398]/30 rounded-full"></div>
            
            {/* Header */}
            <div className="px-6 py-4 border-b bg-white flex justify-between items-center shrink-0">
              <div>
                <div className="text-xl font-bold flex items-center gap-2">
                  <span className="bg-[#91A398]/20 text-[#91A398] p-1 rounded text-sm font-mono">注入配方</span>
                  {config.title}
                </div>
                <div className="text-[#4A4A4A]">
                  {config.description}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#91A398] flex items-center justify-center">
                  <span className="text-white font-medium">阿一</span>
                </div>
                <span className="text-sm text-[#4A4A4A]">店长</span>
              </div>
            </div>

            {/* Steps Guide */}
            <div className="px-6 py-4 border-b bg-[#F0F0E8]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#91A398] text-white flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-sm text-[#4A4A4A]">领取小样</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#91A398]/70 text-white flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-sm text-[#4A4A4A]">注入配方</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#91A398]/50 text-white flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-sm text-[#4A4A4A]">焕新交付</span>
                </div>
              </div>
            </div>

            {/* Body - Stacked on Mobile */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* 注入配方 */}
            <div className="w-full p-6 overflow-y-auto bg-white">
              <div className="space-y-6">
                <Textarea 
                  value={formData[config.inputs[0]?.id || 'done']} 
                  onChange={(e) => handleInputChange(config.inputs[0]?.id || 'done', e.target.value)}
                  placeholder="把麻烦倒进来..."
                  className="min-h-[200px] bg-[#F0F0E8] border-[#E8E8E0] focus:border-[#91A398] transition-all rounded-3xl text-lg p-6"
                />
              </div>
            </div>

              {/* 焕新成品 */}
              <div className="w-full p-6 overflow-y-auto bg-[#F0F0E8] flex flex-col">
                <div className="mb-2">
                  <p className="text-sm font-semibold text-[#91A398] animate-pulse">
                    恭喜，这是属于你的第一次智能 高质量交付
                  </p>
                </div>
                <div className="text-lg font-bold mb-4 text-[#4A4A4A]">
                  焕新成品
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#4A4A4A] uppercase text-xs tracking-wider font-bold">实时预览</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCopy} 
                    className="h-8 text-xs bg-white hover:bg-[#F0F0E8] rounded-3xl transition-all"
                    style={{ transition: 'transform 0.1s ease' }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.95)';
                      setTimeout(() => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }, 100);
                    }}
                  >
                    {copied ? <Check className="w-3 h-3 mr-1 text-[#91A398]"/> : <Copy className="w-3 h-3 mr-1"/>}
                    {copied ? "已复制" : "复制成品"}
                  </Button>
                </div>

                <Card className="flex-1 p-6 md:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border-[#E8E8E0] bg-white font-serif whitespace-pre-wrap leading-relaxed text-[#4A4A4A] overflow-y-auto min-h-[300px] rounded-3xl relative">
                  {/* 阿一鉴定印章 - SVG 效果 */}
                  {!loading && (
                    <div className="absolute top-4 right-4 animate-in fade-in duration-200" style={{ transform: 'rotate(15deg)' }}>
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="rgba(164, 120, 100, 0.2)" stroke="#A47864" strokeWidth="2" />
                        <text x="50" y="45" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#A47864">阿一鉴定</text>
                        <text x="50" y="65" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#A47864">成了！</text>
                      </svg>
                    </div>
                  )}
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-[#4A4A4A] gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {loadingText || "阿一正在手工调配..."}
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-500">
                      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#91A398]/20 text-[#91A398] text-xs font-medium">
                        耗时 42 秒，为你省下 45 分钟
                      </div>
                      {result}
                      <div className="mt-8 pt-6 border-t border-[#E8E8E0] text-center">
                        <p className="text-[#91A398] font-medium italic">看，智能 也没那么难嘛，第 1 次就搞定了。从此，智能只有 0 次和无数次。</p>
                      </div>
                      
                      {/* 成就文案 */}
                      <div className="mt-4 text-center">
                        <p className="text-sm text-[#6B6B6B]">
                          看，智能 也没那么难嘛，第 1 次就搞定了。
                        </p>
                      </div>
                      
                      {/* 阿一的小字便签 */}
                      <div className="mt-6 p-5 bg-[#FFF9C4] rounded-3xl shadow-sm border border-yellow-200">
                        <p className="text-[#4A4A4A] font-light leading-relaxed">
                          成了！快去发吧，阿一帮你盯着呢。
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
            
            {/* 底部固定按钮 */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-[#E8E8E0]">
              <Button 
                onClick={onClose} 
                className="w-full bg-[#91A398] hover:bg-[#91A398]/90 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-all duration-300 font-medium rounded-3xl py-6"
              >
                成了！
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent 
            ref={modalRef}
            className="
              max-w-5xl h-[80vh] flex flex-col p-0 overflow-hidden gap-0 bg-[#F0F0E8]
            "
          >
            {/* Header */}
            <div className="px-6 py-4 border-b bg-white flex justify-between items-center shrink-0">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <span className="bg-[#91A398]/20 text-[#91A398] p-1 rounded text-sm font-mono">注入配方</span>
                  {config.title}
                  <>
                    <span className="text-slate-400 font-normal text-sm mx-2">vs</span>
                    <span className="bg-[#A47864]/20 text-[#A47864] p-1 rounded text-sm font-mono">焕新成品</span>
                  </>
                </DialogTitle>
                <DialogDescription className="text-[#4A4A4A]">
                  {config.description} | 左侧修改，右侧实时预览
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#91A398] flex items-center justify-center">
                  <span className="text-white font-medium">阿一</span>
                </div>
                <span className="text-sm text-[#4A4A4A]">店长</span>
              </div>
            </div>

            {/* Steps Guide */}
            <div className="px-6 py-4 border-b bg-[#F0F0E8]">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#91A398] text-white flex items-center justify-center text-xs font-bold">1</div>
                  <span className="text-sm text-[#4A4A4A]">领取小样</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#91A398]/70 text-white flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-sm text-[#4A4A4A]">注入配方</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#91A398]/50 text-white flex items-center justify-center text-xs font-bold">3</div>
                  <span className="text-sm text-[#4A4A4A]">焕新交付</span>
                </div>
              </div>
            </div>

            {/* Body - Two Columns on Desktop */}
            <div className="flex-1 overflow-hidden flex">
              
              {/* Left: Input Form */}
              <div className="w-1/2 p-6 overflow-y-auto border-r bg-white">
                <div className="space-y-6">
                  <Textarea 
                    value={formData[config.inputs[0]?.id || 'done']} 
                    onChange={(e) => handleInputChange(config.inputs[0]?.id || 'done', e.target.value)}
                    placeholder="把麻烦倒进来..."
                    className="min-h-[300px] bg-[#F0F0E8] border-[#E8E8E0] focus:border-[#91A398] transition-all rounded-3xl text-lg p-6"
                  />
                </div>
              </div>

              {/* Right: Live Preview */}
              <div className="w-1/2 p-6 overflow-y-auto bg-[#F0F0E8] flex flex-col">
                <div className="mb-2">
                  <p className="text-sm font-semibold text-[#91A398] animate-pulse">
                    恭喜，这是属于你的第一次智能 高质量交付
                  </p>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#4A4A4A] uppercase text-xs tracking-wider font-bold">实时预览</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCopy} 
                    className="h-8 text-xs bg-white hover:bg-[#F0F0E8] rounded-3xl transition-all"
                    style={{ transition: 'transform 0.1s ease' }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'scale(0.95)';
                      setTimeout(() => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }, 100);
                    }}
                  >
                    {copied ? <Check className="w-3 h-3 mr-1 text-[#91A398]"/> : <Copy className="w-3 h-3 mr-1"/>}
                    {copied ? "已复制" : "复制成品"}
                  </Button>
                </div>

                <Card className="flex-1 p-6 md:p-8 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border-[#E8E8E0] bg-white font-serif whitespace-pre-wrap leading-relaxed text-[#4A4A4A] overflow-y-auto min-h-[300px] rounded-3xl relative">
                  {/* 阿一鉴定印章 - SVG 效果 */}
                  {!loading && (
                    <div className="absolute top-4 right-4 animate-in fade-in duration-200" style={{ transform: 'rotate(15deg)' }}>
                      <svg width="100" height="100" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="rgba(164, 120, 100, 0.2)" stroke="#A47864" strokeWidth="2" />
                        <text x="50" y="45" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#A47864">阿一鉴定</text>
                        <text x="50" y="65" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#A47864">成了！</text>
                      </svg>
                    </div>
                  )}
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-[#4A4A4A] gap-2">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      {loadingText || "阿一正在手工调配..."}
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-500">
                      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#91A398]/20 text-[#91A398] text-xs font-medium">
                        耗时 42 秒，为你省下 45 分钟
                      </div>
                      {result}
                      <div className="mt-8 pt-6 border-t border-[#E8E8E0] text-center">
                        <p className="text-[#91A398] font-medium italic">看，智能 也没那么难嘛，第 1 次就搞定了。从此，智能只有 0 次和无数次。</p>
                      </div>
                      
                      {/* 成就文案 */}
                      <div className="mt-4 text-center">
                        <p className="text-sm text-[#6B6B6B]">
                          看，智能 也没那么难嘛，第 1 次就搞定了。
                        </p>
                      </div>
                      
                      {/* 阿一的小字便签 */}
                      <div className="mt-6 p-5 bg-[#FFF9C4] rounded-3xl shadow-sm border border-yellow-200">
                        <p className="text-[#4A4A4A] font-light leading-relaxed">
                          成了！快去发吧，阿一帮你盯着呢。
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
