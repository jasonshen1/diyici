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
        label: "你的原始素材（随便写点碎碎念）",
        type: "textarea",
        placeholder: "例如：本周做了很多事情，比如完成了项目的原型设计，解决了用户登录的问题...",
        defaultValue: "本周做了很多事情，比如完成了项目的原型设计，解决了用户登录的问题，还参加了几个会议..."
      },
      {
        id: "audience",
        label: "汇报对象（例如：直接上级、部门总监）",
        type: "text",
        placeholder: "例如：直接上级、部门总监",
        defaultValue: "直接上级"
      }
    ],
    submitText: "即刻抹平",
    loadingText: "配方调配中...",
    successText: "职场除皱成功！",
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
  ppt: {
    id: "ppt",
    title: "PPT 大纲生成",
    description: "输入主题和目标，领取专业 PPT 大纲",
    inputs: [
      {
        id: "topic",
        label: "演讲主题",
        type: "text",
        placeholder: "例如：2024 产品 roadmap",
        defaultValue: "产品 Q3 季度规划"
      },
      {
        id: "audience",
        label: "目标 audience",
        type: "text",
        placeholder: "例如：公司高管、客户",
        defaultValue: "公司内部团队"
      }
    ],
    submitText: "生成大纲",
    loadingText: "构建框架中...",
    successText: "PPT 大纲生成成功！",
    systemPrompt: (inputs) => `角色设定：你是一位专业的 PPT 设计师，擅长制作结构清晰、逻辑严密的演示文稿。

任务：根据用户提供的主题和目标 audience，生成一份专业的 PPT 大纲。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

演讲主题：${inputs.topic}
目标 audience：${inputs.audience}

请按照以下结构输出：
1. 封面页：包含主题、副标题和演讲人
2. 目录页：列出主要章节
3. 每个章节：包含标题、内容要点和视觉建议
4. 总结页：总结核心观点
5. Q&A 页：预留问答环节

输出要求：
- 结构清晰，层次分明
- 内容要点具体，有可操作性
- 视觉建议实用，符合主题风格
- 适合直接用于 PPT 制作`
  },
  meeting: {
    id: "meeting",
    title: "会议纪要",
    description: "输入会议内容，领取结构化会议纪要",
    inputs: [
      {
        id: "topic",
        label: "会议主题",
        type: "text",
        placeholder: "例如：产品评审会",
        defaultValue: "周例会"
      },
      {
        id: "content",
        label: "讨论要点",
        type: "textarea",
        placeholder: "例如：项目进度、问题讨论",
        defaultValue: "项目进度、资源分配"
      }
    ],
    submitText: "生成纪要",
    loadingText: "整理纪要中...",
    successText: "会议纪要生成成功！",
    systemPrompt: (inputs) => `角色设定：你是一位专业的会议纪要整理专家，擅长从会议内容中提取关键信息，形成结构化的纪要。

任务：根据用户提供的会议主题和讨论要点，生成一份专业的会议纪要。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

会议主题：${inputs.topic}
讨论要点：${inputs.content}

请按照以下结构输出：
1. 会议基本信息：主题、时间、地点、参会人员
2. 会议议程：主要讨论议题
3. 讨论内容：每个议题的具体讨论情况
4. 决议事项：会议达成的共识和决定
5. 行动项：需要后续跟进的任务，包括负责人和截止时间
6. 下次会议安排

输出要求：
- 结构清晰，层次分明
- 内容准确，重点突出
- 语言简洁，专业规范
- 适合直接作为正式会议纪要使用`
  },
  speech: {
    id: "speech",
    title: "发言稿生成",
    description: "输入场合和要点，领取专业发言稿",
    inputs: [
      {
        id: "occasion",
        label: "演讲场合",
        type: "text",
        placeholder: "例如：公司年会、客户答谢会",
        defaultValue: "部门周会"
      },
      {
        id: "keyPoints",
        label: "核心要点",
        type: "textarea",
        placeholder: "例如：感谢团队、未来计划",
        defaultValue: "工作总结、未来目标"
      }
    ],
    submitText: "生成发言稿",
    loadingText: "撰写发言稿中...",
    successText: "发言稿生成成功！",
    systemPrompt: (inputs) => `角色设定：你是一位专业的演讲稿撰写专家，擅长根据不同场合和要点，撰写得体、有感染力的发言稿。

任务：根据用户提供的演讲场合和核心要点，生成一份专业的发言稿。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

演讲场合：${inputs.occasion}
核心要点：${inputs.keyPoints}

请按照以下结构输出：
1. 开场白：问候语、自我介绍、对场合的简要说明
2. 主体内容：围绕核心要点展开，每个要点详细阐述
3. 结尾：总结核心观点、表达感谢、展望未来

输出要求：
- 语言流畅，有感染力
- 结构清晰，层次分明
- 内容符合场合特点
- 适合直接上台演讲使用`
  },
  reply: {
    id: "reply",
    title: "高情商回复",
    description: "输入场景，领取得体回复",
    inputs: [
      {
        id: "scene",
        label: "回复场景",
        type: "textarea",
        placeholder: "例如：拒绝借钱、客户投诉",
        defaultValue: "拒绝同事借钱"
      }
    ],
    submitText: "生成回复",
    loadingText: "构思回复中...",
    successText: "高情商回复生成成功！",
    systemPrompt: (inputs) => `角色设定：你是一位情商专家，擅长在各种场合下给出得体、恰当的回复。

任务：根据用户提供的场景，生成一份高情商的回复。

禁令：禁止出现'你好'、'以下是建议'等废话，直接给出成品。

回复场景：${inputs.scene}

请按照以下要求输出：
1. 回复内容：得体、恰当，符合场景特点
2. 语气：友好、真诚，体现高情商
3. 结构：开头问候，中间表达观点，结尾表达祝愿
4. 长度：适中，简洁明了

输出要求：
- 语言得体，符合社交礼仪
- 内容恰当，解决实际问题
- 语气友好，体现真诚
- 适合直接用于回复对方`
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
      } else if (currentConfig.id === "ppt") {
        userInput = `演讲主题：${inputs.topic}\n目标 audience：${inputs.audience}`;
      } else if (currentConfig.id === "meeting") {
        userInput = `会议主题：${inputs.topic}\n讨论要点：${inputs.content}`;
      } else if (currentConfig.id === "speech") {
        userInput = `演讲场合：${inputs.occasion}\n核心要点：${inputs.keyPoints}`;
      } else if (currentConfig.id === "reply") {
        userInput = `回复场景：${inputs.scene}`;
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
