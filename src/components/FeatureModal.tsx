import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { toast } from "sonner";
import { callDeepSeekAPI, buildPrompt } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureId: string | null;
}

// Feature configurations
interface FeatureConfig {
  id: string;
  title: string;
  description: string;
  inputs: {
    id: string;
    label: string;
    type: "text" | "textarea";
    placeholder: string;
    defaultValue: string;
  }[];
  submitText: string;
  loadingText: string;
  successText: string;
  systemPrompt: (inputs: Record<string, string>) => string;
}

// Feature configurations
const featureConfigs: Record<string, FeatureConfig> = {
  weekly: {
    id: "weekly",
    title: "职场除皱霜",
    description: "一键平复周报里的逻辑褶皱",
    inputs: [
      {
        id: "rawMaterial",
        label: "请放入你需要修饰的原始文字",
        type: "textarea",
        placeholder: "请输入你的周报内容，剩下的交给职场除皱霜为您精心调理",
        defaultValue: "本周做了很多事情，比如完成了项目的原型设计，解决了用户登录的问题，还参加了几个会议..."
      },
      {
        id: "audience",
        label: "请告知您的汇报对象",
        type: "text",
        placeholder: "例如：直接上级、部门总监，我们会为您调整最适合的语气",
        defaultValue: "直接上级"
      }
    ],
    submitText: "即刻调配",
    loadingText: "阿一正在为你调配配方...",
    successText: "阿一为你完成了职场除皱！",
    systemPrompt: (inputs) => `角色设定：你是一位拥有 20 年经验的顶级大厂幕僚，擅长向上管理。

任务：将用户的碎碎念转化为具备'结构化、结果导向、高情商'特质的周报。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

目标读者：${inputs.audience}

请按照以下结构输出：
1. 核心成果：突出本周最重要的 3-5 项成果，用简洁有力的语言表达
2. 工作过程：简要说明完成这些成果的关键步骤和方法
3. 价值体现：强调这些成果为团队或公司带来的价值
4. 下周计划：基于本周工作，提出合理的下周工作计划

输出要求：
- 语言简洁明了，重点突出
- 结构清晰，层次分明
- 体现专业性和结果导向
- 适合直接向上级汇报使用`
  },
  social: {
    id: "social",
    title: "社交隔离乳",
    description: "隔离社交表达中的多余情绪，让沟通更得体",
    inputs: [
      {
        id: "rawMaterial",
        label: "请放入你需要修饰的原始文字",
        type: "textarea",
        placeholder: "请输入你想要表达的内容，社交隔离乳会为您隔离负面情绪，塑造得体回应",
        defaultValue: "我觉得这个想法不太好，可能会有问题。"
      }
    ],
    submitText: "即刻调配",
    loadingText: "阿一正在为你涂抹隔离霜...",
    successText: "阿一为你完成了社交隔离！",
    systemPrompt: (inputs) => `角色设定：你是一位情商专家，擅长在各种场合下给出得体、恰当的回复。

任务：根据用户提供的内容，生成一份高情商的社交表达。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

原始内容：${inputs.rawMaterial}

请按照以下要求输出：
1. 回复内容：得体、恰当，符合社交场景特点
2. 语气：友好、真诚，体现高情商
3. 结构：开头问候，中间表达观点，结尾表达祝愿
4. 长度：适中，简洁明了

输出要求：
- 语言得体，符合社交礼仪
- 内容恰当，解决实际问题
- 语气友好，体现真诚
- 适合直接用于社交场合`
  },
  logic: {
    id: "logic",
    title: "逻辑遮瑕膏",
    description: "修饰逻辑漏洞，让表达更严谨有力",
    inputs: [
      {
        id: "rawMaterial",
        label: "请放入你需要修饰的原始文字",
        type: "textarea",
        placeholder: "请输入你需要逻辑优化的内容，逻辑遮瑕膏会为您修饰逻辑漏洞",
        defaultValue: "我们应该立即执行这个计划，因为它很好。"
      }
    ],
    submitText: "即刻调配",
    loadingText: "阿一正在为你修饰逻辑漏洞...",
    successText: "阿一为你完成了逻辑遮瑕！",
    systemPrompt: (inputs) => `角色设定：你是一位逻辑思维专家，擅长分析和优化各种表达中的逻辑结构。

任务：根据用户提供的内容，优化其逻辑结构，使其更加严谨有力。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

原始内容：${inputs.rawMaterial}

请按照以下要求输出：
1. 分析原始内容的逻辑结构
2. 识别并修正逻辑漏洞
3. 增强论证的说服力
4. 保持原意不变，同时提升表达效果

输出要求：
- 逻辑清晰，结构严谨
- 论证有力，说服力强
- 语言流畅，表达自然
- 适合直接用于正式场合`
  },
  meeting: {
    id: "meeting",
    title: "会议提纯乳",
    description: "快速提炼会议要点，节省时间",
    inputs: [
      {
        id: "rawMaterial",
        label: "请放入会议记录或讨论内容",
        type: "textarea",
        placeholder: "请输入会议内容，会议提纯乳会为您提炼关键要点",
        defaultValue: "今天的会议讨论了产品上线计划，大家各抒己见，有很多不同的想法。有人认为应该先做市场调研，有人认为应该尽快上线抢占市场。最后大家决定下周再开会讨论。"
      }
    ],
    submitText: "即刻调配",
    loadingText: "阿一正在为你提炼会议要点...",
    successText: "阿一为你完成了会议提纯！",
    systemPrompt: (inputs) => `角色设定：你是一位高效的会议记录专家，擅长从冗长的会议内容中提炼关键信息。

任务：根据用户提供的会议内容，提炼出清晰的会议要点。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

原始内容：${inputs.rawMaterial}

请按照以下要求输出：
1. 会议主题：明确会议的核心议题
2. 关键讨论：提炼出会议中的主要讨论点
3. 达成共识：总结会议中达成的一致意见
4. 后续行动：列出需要跟进的任务和负责人

输出要求：
- 语言简洁明了，重点突出
- 结构清晰，层次分明
- 信息准确，覆盖主要内容
- 适合直接用于会议纪要分享`
  },
  emotion: {
    id: "emotion",
    title: "高情商精华",
    description: "提升社交表达的情商，让沟通更顺畅",
    inputs: [
      {
        id: "rawMaterial",
        label: "请放入你需要优化的表达内容",
        type: "textarea",
        placeholder: "请输入你想要表达的内容，高情商精华会为您提升表达效果",
        defaultValue: "你总是迟到，这让我很生气。"
      }
    ],
    submitText: "即刻调配",
    loadingText: "阿一正在为你注入高情商因子...",
    successText: "阿一为你完成了情商提升！",
    systemPrompt: (inputs) => `角色设定：你是一位情商专家，擅长将直接、生硬的表达转化为更加得体、有效的沟通方式。

任务：根据用户提供的内容，转化为高情商的表达。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

原始内容：${inputs.rawMaterial}

请按照以下要求输出：
1. 表达感受：用温和的方式表达自己的感受
2. 具体描述：明确指出具体的行为或情况
3. 提出期望：表达对未来的积极期望
4. 保持尊重：保持对对方的尊重和理解

输出要求：
- 语言得体，符合社交礼仪
- 内容真诚，表达真实感受
- 语气友好，体现高情商
- 适合直接用于人际关系沟通`
  },
  terms: {
    id: "terms",
    title: "条款拆解液",
    description: "拆解复杂条款，让信息更易懂",
    inputs: [
      {
        id: "rawMaterial",
        label: "请放入需要拆解的复杂条款",
        type: "textarea",
        placeholder: "请输入复杂条款内容，条款拆解液会为您简化解释",
        defaultValue: "本协议的任何修改或变更须经双方书面同意并签署后方可生效。任何一方违反本协议的任何条款，应承担违约责任，并赔偿对方因此遭受的全部损失。"
      }
    ],
    submitText: "即刻调配",
    loadingText: "阿一正在为你拆解复杂条款...",
    successText: "阿一为你完成了条款拆解！",
    systemPrompt: (inputs) => `角色设定：你是一位法律专家，擅长将复杂的法律条款转化为通俗易懂的语言。

任务：根据用户提供的复杂条款，拆解为简单易懂的解释。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

原始内容：${inputs.rawMaterial}

请按照以下要求输出：
1. 核心内容：用简单的语言概括条款的核心内容
2. 关键要点：列出条款中的关键要点
3. 潜在影响：分析条款对双方的潜在影响
4. 注意事项：提醒需要特别注意的地方

输出要求：
- 语言通俗易懂，避免专业术语
- 结构清晰，层次分明
- 信息准确，覆盖主要内容
- 适合普通用户理解`
  },
  
  negotiation: {
    id: "negotiation",
    title: "谈判舒缓喷雾",
    description: "缓解博弈僵局，将强硬要求转化为共赢的商业信函",
    inputs: [
      {
        id: "rawMaterial",
        label: "请放入你需要修饰的原始文字",
        type: "textarea",
        placeholder: "请输入你的谈判内容，谈判舒缓喷雾会为您缓解紧张气氛",
        defaultValue: "我们要求你方必须在下周之前完成所有工作，否则将追究违约责任。"
      }
    ],
    submitText: "即刻调配",
    loadingText: "阿一正在为你缓解谈判紧张气氛...",
    successText: "阿一为你完成了谈判舒缓！",
    systemPrompt: (inputs) => `角色设定：你是一位商务谈判专家，擅长将强硬的要求转化为共赢的商业信函。

任务：根据用户提供的内容，生成一份专业、得体的商务谈判回复。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

原始内容：${inputs.rawMaterial}

请按照以下要求输出：
1. 开场：礼貌的问候和对对方立场的理解
2. 核心内容：清晰表达自己的立场和要求
3. 共赢方案：提出一个对双方都有利的解决方案
4. 结尾：表达合作的诚意和对未来的期望

输出要求：
- 语言专业、得体，符合商务礼仪
- 内容清晰、明确，表达立场坚定
- 方案具体、可行，体现共赢理念
- 语气友好、真诚，缓解紧张气氛
- 适合直接用于商务谈判场合`
  },
  
  thinking: {
    id: "thinking",
    title: "思维焕新液",
    description: "击碎认知墙，为你提供 3 种跨界维度的惊叹解法",
    inputs: [
      {
        id: "rawMaterial",
        label: "请放入你需要修饰的原始文字",
        type: "textarea",
        placeholder: "请输入你的问题，思维焕新液会为您提供全新的思考维度",
        defaultValue: "如何提高团队的工作效率？"
      }
    ],
    submitText: "即刻调配",
    loadingText: "阿一正在为你注入焕新思维...",
    successText: "阿一为你完成了思维焕新！",
    systemPrompt: (inputs) => `角色设定：你是一位创意顾问，擅长从不同角度思考问题并提供创意解决方案。

任务：根据用户提供的问题，从三个不同的视角提供创意解决方案。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

原始问题：${inputs.rawMaterial}

请按照以下要求输出：
1. 乔布斯视角：注重创新、用户体验和简洁设计
   - 从创新和用户体验的角度提出解决方案
   - 强调简洁、高效的设计理念
   - 提供具体、可操作的建议

2. 苏格拉底视角：注重逻辑、提问和深度思考
   - 从逻辑和深度思考的角度分析问题
   - 通过提问引导思考，挖掘问题本质
   - 提供系统性的解决方案

3. 爱因斯坦视角：注重想象力、突破性思维和跨界融合
   - 从想象力和突破性思维的角度思考问题
   - 尝试跨界融合不同领域的理念
   - 提供颠覆性的解决方案

输出要求：
- 每个视角的解决方案具体、有创意
- 语言清晰、表达流畅
- 结构分明、层次清晰
- 适合启发用户的思维`
  }
};

export function FeatureModal({ isOpen, onClose, featureId }: FeatureModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [loadingText, setLoadingText] = useState("");
  const [keyboardOpen, setKeyboardOpen] = useState(false);
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
      // 找到'即刻调配'按钮
      const button = modalRef.current.querySelector('button');
      if (button) {
        button.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isMobile, keyboardOpen]);

  // 动态切换加载文案
  useState(() => {
    if (loading) {
      const loadingTexts = [
        "正在萃取精华...",
        "正在平复逻辑...",
        "正在检测肤感..."
      ];
      let index = 0;
      
      const interval = setInterval(() => {
        setLoadingText(loadingTexts[index]);
        index = (index + 1) % loadingTexts.length;
      }, 3000);

      return () => clearInterval(interval);
    }
  });

  // Get current feature config
  const currentConfig = featureId ? featureConfigs[featureId] : null;

  // Reset state when feature changes or modal opens
  useState(() => {
    if (currentConfig) {
      const initialInputs: Record<string, string> = {};
      currentConfig.inputs.forEach(input => {
        initialInputs[input.id] = input.defaultValue;
      });
      setInputs(initialInputs);
      setResult("");
    }
  });

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async () => {
    if (!currentConfig) return;

    setLoading(true);
    setResult("");

    try {
      // Generate system prompt
      const systemPrompt = currentConfig.systemPrompt(inputs);

      // Build user input based on feature type
      let userInput = "";
      if (currentConfig.id === "weekly") {
        userInput = `用户原始素材：\n${inputs.rawMaterial}`;
      } else if (currentConfig.id === "social") {
        userInput = `用户原始素材：\n${inputs.rawMaterial}`;
      } else if (currentConfig.id === "logic") {
        userInput = `用户原始素材：\n${inputs.rawMaterial}`;
      }

      // Build prompt and call API
      const messages = buildPrompt(systemPrompt, userInput);
      const apiResult = await callDeepSeekAPI(messages);

      // Format result
      const formattedResult = `# ${currentConfig.title} · 焕新成品

## 注入配方

${currentConfig.inputs.map(input => {
  return `**${input.label}：** ${inputs[input.id]}`;
}).join('\n\n')}

## 调配完成

${apiResult}

---

*本成品由阿一的小样实验室手工调配*`;

      setResult(formattedResult);

      // Show success message
      toast.success(
        `🎉 ${currentConfig.successText}`,
        {
          description: "成品已调配完成，快去使用吧！",
          duration: 3000,
          position: "top-center"
        }
      );
    } catch (error) {
      console.error("Error generating result:", error);
      toast.error(
        "焕新失败",
        {
          description: "请稍后重试",
          duration: 3000,
          position: "top-center"
        }
      );
    } finally {
      setLoading(false);
    }
  };

  if (!currentConfig) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>功能未找到</DialogTitle>
            <DialogDescription>
              请选择一个有效的功能
            </DialogDescription>
          </DialogHeader>
          <Button onClick={onClose} className="mt-4">
            关闭
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={onClose} direction="bottom">
          <DrawerContent 
            ref={modalRef}
            className={`
              fixed bottom-0 left-0 right-0 top-[${keyboardOpen ? '10vh' : '20vh'}] max-w-none w-full h-[${keyboardOpen ? '90vh' : '80vh'}] rounded-t-3xl rounded-b-none p-0 overflow-hidden gap-0 bg-[#F0F0E8] shadow-2xl shadow-black/10 z-50
            `}
          >
            {/* 顶部拉柄暗示 */}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-[#91A398]/30 rounded-full"></div>
            
            {/* Header */}
            <div className="px-6 py-4 border-b bg-white flex justify-between items-center shrink-0">
              <div>
                <div className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#91A398]" />
                  {currentConfig.title}
                </div>
                <div className="text-[#4A4A4A]">
                  {currentConfig.description}
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {!result ? (
                <div className="space-y-6">
                  {/* Input Fields */}
                  {currentConfig.inputs.map((input) => (
                    <div key={input.id} className="space-y-2">
                      <Label className="text-sm font-medium text-[#4A4A4A] block">
                        {input.label}
                      </Label>
                      {input.type === "textarea" ? (
                        <Textarea
                          value={inputs[input.id] || ""}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          placeholder={input.placeholder}
                          className="min-h-[100px] bg-[#F0F0E8] border-[#E8E8E0] focus:border-[#91A398] transition-all rounded-3xl"
                        />
                      ) : (
                        <Input
                          value={inputs[input.id] || ""}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          placeholder={input.placeholder}
                          className="bg-[#F0F0E8] border-[#E8E8E0] focus:border-[#91A398] transition-all rounded-3xl"
                        />
                      )}
                    </div>
                  ))}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full h-12 rounded-3xl bg-[#91A398] hover:bg-[#91A398]/90 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-all duration-300 font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {loadingText || "阿一正在手工调配..."}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          {currentConfig.submitText}
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-[#91A398] mt-2">只需 3 分钟，完成你的第一次 AI 交付。</p>
                  </div>

                  <div className="pt-4 p-4 bg-[#91A398]/10 rounded-3xl border border-[#91A398]/20 text-[#4A4A4A] text-sm">
                    💡 阿一提示：只需输入相关信息，我会帮你焕新专业的结果。
                  </div>
                </div>
              ) : (
                /* Result Display */
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-[#91A398]" />
                    <h3 className="text-xl font-bold text-[#4A4A4A]">焕新成品</h3>
                  </div>

                  <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#91A398]/20 text-[#91A398] text-xs font-medium">
                    耗时 42 秒，为你省下 45 分钟
                  </div>

                  <div className="p-4 bg-[#F0F0E8] rounded-3xl border border-[#E8E8E0] text-center">
                    <h2 className="text-2xl font-bold text-[#4A4A4A]">
                      🎉 恭喜！这是你拿到的第一份 AI 成功单品
                    </h2>
                  </div>

                  <Card className="p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border-[#E8E8E0] bg-white overflow-hidden rounded-3xl">
                    <div className="prose max-w-none">
                      {result.split('\n').map((line, index) => {
                        if (line.startsWith('# ')) {
                          return <h1 key={index} className="text-2xl font-bold text-[#4A4A4A] mb-4">{line.substring(2)}</h1>;
                        } else if (line.startsWith('## ')) {
                          return <h2 key={index} className="text-xl font-semibold text-[#4A4A4A] mb-3 mt-6">{line.substring(3)}</h2>;
                        } else if (line.startsWith('### ')) {
                          return <h3 key={index} className="text-lg font-medium text-[#4A4A4A] mb-2 mt-4">{line.substring(4)}</h3>;
                        } else if (line.startsWith('- ')) {
                          return <p key={index} className="text-[#4A4A4A] mb-1">{line}</p>;
                        } else if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={index} className="text-[#4A4A4A] font-medium mb-1">{line}</p>;
                        } else if (line === '') {
                          return <br key={index} />;
                        } else {
                          return <p key={index} className="text-[#4A4A4A] mb-2">{line}</p>;
                        }
                      })}
                      <div className="mt-8 pt-6 border-t border-[#E8E8E0] text-center">
                        <p className="text-[#91A398] font-medium italic">这是你在阿一的小样实验室的第一次成功。从此，AI 只有零次和无数次。</p>
                      </div>
                    </div>
                  </Card>

                  {/* 阿一的叮嘱 */}
                  <div className="mt-6 p-5 bg-[#FFF9C4] rounded-3xl shadow-sm border border-yellow-200">
                    <h4 className="text-lg font-medium text-[#4A4A4A] mb-3 font-serif">
                      阿一的叮嘱
                    </h4>
                    <p className="text-[#4A4A4A] font-light leading-relaxed">
                      {featureId === "weekly" && "阿一说：褶皱已抹平。发送前，别忘了深呼吸，你其实很优秀！"}
                      {featureId === "social" && "阿一说：隔离乳已涂抹。社交场合，真诚是最好的武器，做最真实的自己！"}
                      {featureId === "logic" && "阿一说：漏洞已遮瑕。逻辑清晰的表达会让你更有说服力，继续加油！"}
                      {featureId === "meeting" && "阿一说：要点已提纯。会议中，倾听比表达更重要，你已经做得很好了！"}
                      {featureId === "emotion" && "阿一说：情商已提升。沟通是门艺术，慢慢来，你会越来越得心应手的！"}
                      {featureId === "terms" && "阿一说：条款已拆解。重要文件要仔细阅读，保护自己是最重要的！"}
                      {featureId === "negotiation" && "阿一说：紧张已舒缓。谈判中，保持冷静和专业是最重要的，你做得很好！"}
                      {featureId === "thinking" && "阿一说：思维已焕新。不同的视角会带给你全新的启发，记得保持开放的心态！"}
                    </p>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => {
                        // Copy result to clipboard
                        navigator.clipboard.writeText(result);
                        toast.success(
                          "📋 成品已复制",
                          {
                            description: "成品已复制到剪贴板，快去使用吧！",
                            duration: 2000,
                            position: "top-center"
                          }
                        );
                      }}
                      className="rounded-3xl bg-white border border-[#91A398] text-[#91A398] hover:bg-[#91A398]/10 transition-all"
                    >
                      复制成品
                    </Button>
                    <Button
                      onClick={() => setResult("")}
                      className="rounded-3xl bg-white border border-[#E8E8E0] text-[#4A4A4A] hover:bg-[#F0F0E8] transition-all"
                    >
                      瞬间焕新
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent 
            ref={modalRef}
            className="
              max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden gap-0 bg-[#F0F0E8]
            "
          >
            {/* Header */}
            <div className="px-6 py-4 border-b bg-white flex justify-between items-center shrink-0">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#91A398]" />
                  {currentConfig.title}
                </DialogTitle>
                <DialogDescription className="text-[#4A4A4A]">
                  {currentConfig.description}
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
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#91A398] text-white flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-sm text-[#4A4A4A]">领取小样（选择场景）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#91A398]/70 text-white flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-sm text-[#4A4A4A]">注入配方（简单填空）</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#91A398]/50 text-white flex items-center justify-center text-xs font-bold">3</div>
                    <span className="text-sm text-[#4A4A4A]">焕新交付（见证你的第一次 AI 成功）</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {!result ? (
                <div className="space-y-6">
                  {/* Input Fields */}
                  {currentConfig.inputs.map((input) => (
                    <div key={input.id} className="space-y-2">
                      <Label className="text-sm font-medium text-[#4A4A4A] block">
                        {input.label}
                      </Label>
                      {input.type === "textarea" ? (
                        <Textarea
                          value={inputs[input.id] || ""}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          placeholder={input.placeholder}
                          className="min-h-[100px] bg-[#F0F0E8] border-[#E8E8E0] focus:border-[#91A398] transition-all rounded-3xl"
                        />
                      ) : (
                        <Input
                          value={inputs[input.id] || ""}
                          onChange={(e) => handleInputChange(input.id, e.target.value)}
                          placeholder={input.placeholder}
                          className="bg-[#F0F0E8] border-[#E8E8E0] focus:border-[#91A398] transition-all rounded-3xl"
                        />
                      )}
                    </div>
                  ))}

                  {/* Submit Button */}
                  <div className="pt-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full h-12 rounded-3xl bg-[#91A398] hover:bg-[#91A398]/90 text-white shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)] transition-all duration-300 font-medium"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          {loadingText || "阿一正在手工调配..."}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          {currentConfig.submitText}
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-[#91A398] mt-2">只需 3 分钟，完成你的第一次 AI 交付。</p>
                  </div>

                  <div className="pt-4 p-4 bg-[#91A398]/10 rounded-3xl border border-[#91A398]/20 text-[#4A4A4A] text-sm">
                    💡 阿一提示：只需输入相关信息，我会帮你焕新专业的结果。
                  </div>
                </div>
              ) : (
                /* Result Display */
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-[#91A398]" />
                    <h3 className="text-xl font-bold text-[#4A4A4A]">焕新成品</h3>
                  </div>

                  <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#91A398]/20 text-[#91A398] text-xs font-medium">
                    耗时 42 秒，为你省下 45 分钟
                  </div>

                  <div className="p-4 bg-[#F0F0E8] rounded-3xl border border-[#E8E8E0] text-center">
                    <h2 className="text-2xl font-bold text-[#4A4A4A]">
                      🎉 恭喜！这是你拿到的第一份 AI 成功单品
                    </h2>
                  </div>

                  <Card className="p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border-[#E8E8E0] bg-white overflow-hidden rounded-3xl">
                    <div className="prose max-w-none">
                      {result.split('\n').map((line, index) => {
                        if (line.startsWith('# ')) {
                          return <h1 key={index} className="text-2xl font-bold text-[#4A4A4A] mb-4">{line.substring(2)}</h1>;
                        } else if (line.startsWith('## ')) {
                          return <h2 key={index} className="text-xl font-semibold text-[#4A4A4A] mb-3 mt-6">{line.substring(3)}</h2>;
                        } else if (line.startsWith('### ')) {
                          return <h3 key={index} className="text-lg font-medium text-[#4A4A4A] mb-2 mt-4">{line.substring(4)}</h3>;
                        } else if (line.startsWith('- ')) {
                          return <p key={index} className="text-[#4A4A4A] mb-1">{line}</p>;
                        } else if (line.startsWith('**') && line.endsWith('**')) {
                          return <p key={index} className="text-[#4A4A4A] font-medium mb-1">{line}</p>;
                        } else if (line === '') {
                          return <br key={index} />;
                        } else {
                          return <p key={index} className="text-[#4A4A4A] mb-2">{line}</p>;
                        }
                      })}
                      <div className="mt-8 pt-6 border-t border-[#E8E8E0] text-center">
                        <p className="text-[#91A398] font-medium italic">这是你在阿一的小样实验室的第一次成功。从此，AI 只有零次和无数次。</p>
                      </div>
                    </div>
                  </Card>

                  {/* 阿一的叮嘱 */}
                  <div className="mt-6 p-5 bg-[#FFF9C4] rounded-3xl shadow-sm border border-yellow-200">
                    <h4 className="text-lg font-medium text-[#4A4A4A] mb-3 font-serif">
                      阿一的叮嘱
                    </h4>
                    <p className="text-[#4A4A4A] font-light leading-relaxed">
                      {featureId === "weekly" && "阿一说：褶皱已抹平。发送前，别忘了深呼吸，你其实很优秀！"}
                      {featureId === "social" && "阿一说：隔离乳已涂抹。社交场合，真诚是最好的武器，做最真实的自己！"}
                      {featureId === "logic" && "阿一说：漏洞已遮瑕。逻辑清晰的表达会让你更有说服力，继续加油！"}
                      {featureId === "meeting" && "阿一说：要点已提纯。会议中，倾听比表达更重要，你已经做得很好了！"}
                      {featureId === "emotion" && "阿一说：情商已提升。沟通是门艺术，慢慢来，你会越来越得心应手的！"}
                      {featureId === "terms" && "阿一说：条款已拆解。重要文件要仔细阅读，保护自己是最重要的！"}
                      {featureId === "negotiation" && "阿一说：紧张已舒缓。谈判中，保持冷静和专业是最重要的，你做得很好！"}
                      {featureId === "thinking" && "阿一说：思维已焕新。不同的视角会带给你全新的启发，记得保持开放的心态！"}
                    </p>
                  </div>

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => {
                        // Copy result to clipboard
                        navigator.clipboard.writeText(result);
                        toast.success(
                          "📋 成品已复制",
                          {
                            description: "成品已复制到剪贴板，快去使用吧！",
                            duration: 2000,
                            position: "top-center"
                          }
                        );
                      }}
                      className="rounded-3xl bg-white border border-[#91A398] text-[#91A398] hover:bg-[#91A398]/10 transition-all"
                    >
                      复制成品
                    </Button>
                    <Button
                      onClick={() => setResult("")}
                      className="rounded-3xl bg-white border border-[#E8E8E0] text-[#4A4A4A] hover:bg-[#F0F0E8] transition-all"
                    >
                      瞬间焕新
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
