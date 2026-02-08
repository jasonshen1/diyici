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

interface WrinkleCreamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WrinkleCreamModal({ isOpen, onClose }: WrinkleCreamModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [inputs, setInputs] = useState({
    rawMaterial: "本周做了很多事情，比如完成了项目的原型设计，解决了用户登录的问题，还参加了几个会议...",
    audience: "直接上级"
  });

  const handleInputChange = (field: keyof typeof inputs, value: string) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setResult("");

    try {
      // 预设系统提示词（厚配方）
      const systemPrompt = `角色设定：你是一位拥有 20 年经验的顶级大厂幕僚，擅长向上管理。

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
- 适合直接向上级汇报使用`;

      // 构建完整的提示词
      const userInput = `用户原始素材：\n${inputs.rawMaterial}`;
      const messages = buildPrompt(systemPrompt, userInput);

      // Call DeepSeek API
      const apiResult = await callDeepSeekAPI(messages);

      // Format the result with diagnosis
      const formattedResult = `# 职场除皱霜 · 诊断结果

## 原始素材分析

**问题诊断：**
- 逻辑褶皱：信息罗列，缺乏结构化表达
- 重点模糊：没有突出核心成果
- 层次不清：叙述顺序混乱

## 平复方案

${apiResult}

## 适用场景
- 周报汇报
- 工作述职
- 项目总结

---

*本诊断结果由 diyici.ai 职场除皱霜生成*`;

      setResult(formattedResult);

      // Show success message
      toast.success(
        "🎉 职场除皱成功！",
        {
          description: "结果已生成，快去使用吧！",
          duration: 3000,
          position: "top-center"
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden gap-0 bg-white">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-purple-50 flex justify-between items-center shrink-0">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              职场除皱霜
            </DialogTitle>
            <DialogDescription>
              一键平复周报里的逻辑褶皱
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result ? (
            <div className="space-y-6">
              {/* Input Fields */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 block">
                  你的原始素材（随便写点碎碎念）
                </Label>
                <Textarea
                  value={inputs.rawMaterial}
                  onChange={(e) => handleInputChange("rawMaterial", e.target.value)}
                  placeholder="例如：本周做了很多事情，比如完成了项目的原型设计，解决了用户登录的问题..."
                  className="min-h-[150px] bg-slate-50 border-slate-200 focus:border-pink-300 focus:ring-pink-100 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700 block">
                  汇报对象（例如：直接上级、部门总监）
                </Label>
                <Input
                  value={inputs.audience}
                  onChange={(e) => handleInputChange("audience", e.target.value)}
                  placeholder="例如：直接上级、部门总监"
                  className="bg-slate-50 border-slate-200 focus:border-pink-300 focus:ring-pink-100 transition-all"
                />
              </div>

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
                      配方调配中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      即刻抹平
                    </>
                  )}
                </Button>
              </div>

              <div className="pt-4 p-4 bg-pink-50 rounded-lg border border-pink-100 text-pink-800 text-sm">
                💡 提示：只需输入你的原始素材，我们会帮你整理成逻辑清晰、重点突出的专业汇报。
              </div>
            </div>
          ) : (
            /* Result Display */
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <h3 className="text-xl font-bold text-slate-900">诊断结果</h3>
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
                    } else if (line === '') {
                      return <br key={index} />;
                    } else {
                      return <p key={index} className="text-slate-600 mb-2">{line}</p>;
                    }
                  })}
                </div>
              </Card>

              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    // Copy result to clipboard
                    navigator.clipboard.writeText(result);
                    toast.success(
                      "📋 结果已复制",
                      {
                        description: "诊断结果已复制到剪贴板，快去使用吧！",
                        duration: 2000,
                        position: "top-center"
                      }
                    );
                  }}
                  className="rounded-full bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 transition-all"
                >
                  复制结果
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
