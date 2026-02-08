import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { callDeepSeekAPI, buildPrompt } from "@/lib/api";

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
    submitText: "即刻抹平",
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
    submitText: "即刻隔离",
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
    submitText: "即刻遮瑕",
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
  }
};

export function FeatureModal({ isOpen, onClose, featureId }: FeatureModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [inputs, setInputs] = useState<Record<string, string>>({});

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
      const formattedResult = `# ${currentConfig.title} · 生成结果

## 输入分析

${currentConfig.inputs.map(input => {
  return `**${input.label}：** ${inputs[input.id]}`;
}).join('\n\n')}

## 生成内容

${apiResult}

---

*本结果由 diyici.ai 生成*`;

      setResult(formattedResult);

      // Show success message
      toast.success(
        `🎉 ${currentConfig.successText}`,
        {
          description: "结果已生成，快去使用吧！",
          duration: 3000,
          position: "top-center"
        }
      );
    } catch (error) {
      console.error("Error generating result:", error);
      toast.error(
        "生成失败",
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden gap-0 bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-purple-50 flex justify-between items-center shrink-0">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              {currentConfig.title}
            </DialogTitle>
            <DialogDescription>
              {currentConfig.description}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-pink-200 flex items-center justify-center">
              <span className="text-pink-600 font-medium">阿一</span>
            </div>
            <span className="text-sm text-slate-600">店长</span>
          </div>
        </div>

        {/* Steps Guide */}
        <div className="px-6 py-4 border-b bg-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                <span className="text-sm text-slate-700">领取小样（选择场景）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-pink-300 text-slate-700 flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-sm text-slate-700">注入素材（简单填空）</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-pink-200 text-slate-600 flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-sm text-slate-700">焕新交付（见证你的第一次 AI 成功）</span>
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
                  <Label className="text-sm font-medium text-slate-700 block">
                    {input.label}
                  </Label>
                  {input.type === "textarea" ? (
                    <Textarea
                      value={inputs[input.id] || ""}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={input.placeholder}
                      className="min-h-[100px] bg-slate-50 border-slate-200 focus:border-pink-300 focus:ring-pink-100 transition-all"
                    />
                  ) : (
                    <Input
                      value={inputs[input.id] || ""}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      placeholder={input.placeholder}
                      className="bg-slate-50 border-slate-200 focus:border-pink-300 focus:ring-pink-100 transition-all"
                    />
                  )}
                </div>
              ))}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {currentConfig.loadingText}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      {currentConfig.submitText}
                    </>
                  )}
                </Button>
                <p className="text-center text-xs text-pink-600 mt-2">只需 3 分钟，完成你的第一次 AI 交付。</p>
              </div>

              <div className="pt-4 p-4 bg-pink-50 rounded-lg border border-pink-100 text-pink-800 text-sm">
                💡 提示：只需输入相关信息，我们会帮你生成专业的结果。
              </div>
            </div>
          ) : (
            /* Result Display */
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-bold text-slate-900">生成结果</h3>
              </div>

              <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100 text-center">
                <h2 className="text-2xl font-bold text-slate-900">
                  🎉 恭喜！这是你拿到的第一份 AI 成功单品
                </h2>
              </div>

              <Card className="p-6 shadow-sm border-slate-200 bg-white overflow-hidden">
                <div className="prose max-w-none">
                  {result.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index} className="text-2xl font-bold text-slate-900 mb-4">{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-semibold text-slate-800 mb-3 mt-6">{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={index} className="text-lg font-medium text-slate-700 mb-2 mt-4">{line.substring(4)}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <p key={index} className="text-slate-600 mb-1">{line}</p>;
                    } else if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={index} className="text-slate-700 font-medium mb-1">{line}</p>;
                    } else if (line === '') {
                      return <br key={index} />;
                    } else {
                      return <p key={index} className="text-slate-600 mb-2">{line}</p>;
                    }
                  })}
                  <div className="mt-8 pt-6 border-t border-pink-100 text-center">
                    <p className="text-pink-600 font-medium italic">这是你在 diyici.ai 的第一次成功。从此，AI 只有零次和无数次。</p>
                  </div>
                </div>
              </Card>

              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    // Copy result to clipboard
                    navigator.clipboard.writeText(result);
                    toast.success(
                      "📋 结果已复制",
                      {
                        description: "结果已复制到剪贴板，快去使用吧！",
                        duration: 2000,
                        position: "top-center"
                      }
                    );
                  }}
                  className="rounded-full bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 transition-all"
                >
                  复制结果
                </Button>
                <Button
                  onClick={() => setResult("")}
                  className="rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  重新生成
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
