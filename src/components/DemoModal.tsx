import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Copy, Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define Scenario Types
type ScenarioId = "weekly" | "reply" | "ppt";

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
  defaultValue?: any;
}

// 1. 周报场景配置
const weeklyConfig: ScenarioConfig = {
  id: "weekly",
  title: "周报生成器",
  description: "填空生成，拒绝流水账",
  inputs: [
    { id: "done", label: "本周关键产出 (3件)", type: "textarea", placeholder: "例如：完成A客户签约；修复了登录Bug...", defaultValue: "1. 完成了 Landing Page 的首版设计与开发\n2. 梳理了产品说明书与战略文档\n3. 修复了移动端适配的 2 个 Bug" },
    { id: "blocker", label: "遇到的困难", type: "text", placeholder: "例如：服务器资源不足...", defaultValue: "API 响应速度偶尔不稳定，影响体验" },
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
  id: "reply",
  title: "高情商回复",
  description: "拒绝尴尬，体面回应",
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
  template: (data) => {
    if (data.attitude === "soft") {
      return `【建议回复 - 委婉版】
      
"哎呀，老哥/姐，听到你买房的消息真替你开心！这可是大事啊。
      
不过实在是不巧，我最近手头也特别紧，刚把钱都投到理财/还贷里了，一时半会真周转不开。真不好意思啊，这点忙没帮上。祝你后面一切顺利，早日搞定！"`;
    } else if (data.attitude === "hard") {
      return `【建议回复 - 坚决版】
      
"兄弟，买房是好事。不过我原则上是不跟朋友发生金钱往来的，容易伤感情。这事儿我真帮不了，你再问问别人吧。"`;
    } else {
      return `【建议回复 - 拖延版】
      
"哟，买房啦？恭喜恭喜！我现在人在外面办事呢，不太方便看账户。等我这阵子忙完了，回家盘算一下手头情况再跟你说哈。（然后就可以不回了）"`;
    }
  }
};


// Map scenarios
const scenarioMap: Record<string, ScenarioConfig> = {
  weekly: weeklyConfig,
  reply: replyConfig,
  // Fallback for others to generic
  default: weeklyConfig 
};


interface DemoModalProps {
  scenarioId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DemoModal({ scenarioId, isOpen, onClose }: DemoModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [copied, setCopied] = useState(false);

  // Initialize config
  const config = (scenarioId && scenarioMap[scenarioId]) 
    ? scenarioMap[scenarioId] 
    : weeklyConfig; // Default fallback

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      const initialData: any = {};
      config.inputs.forEach(input => {
        initialData[input.id] = input.defaultValue || "";
      });
      setFormData(initialData);
      setResult(""); // Clear previous result or set initial preview?
      // Auto-generate initial preview for better experience?
      // Let's generate it after a small delay to simulate "thinking" or just static
      setResult(config.template(initialData));
    }
  }, [isOpen, config]);

  const handleInputChange = (id: string, value: any) => {
    const newData = { ...formData, [id]: value };
    setFormData(newData);
    
    // Real-time preview update logic
    // In real app, might debounce. Here instant is fine.
    setResult(config.template(newData));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 overflow-hidden gap-0 bg-slate-50">
        
        {/* Header */}
        <div className="px-6 py-4 border-b bg-white flex justify-between items-center shrink-0">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 p-1 rounded text-sm font-mono">Input</span>
              {config.title}
              <span className="text-slate-400 font-normal text-sm mx-2">vs</span>
              <span className="bg-green-100 text-green-700 p-1 rounded text-sm font-mono">Output</span>
            </DialogTitle>
            <DialogDescription>
              {config.description} | 左侧修改，右侧实时预览
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
        <div className="px-6 py-4 border-b bg-gradient-to-r from-pink-50 to-purple-50">
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

        {/* Body - Two Columns */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Left: Input Form */}
          <div className="w-1/2 p-6 overflow-y-auto border-r bg-white">
            <div className="space-y-6">
              {config.inputs.map((input) => (
                <div key={input.id} className="space-y-2">
                  <Label className="text-slate-700 font-semibold">{input.label}</Label>
                  
                  {input.type === "textarea" && (
                    <Textarea 
                      value={formData[input.id]} 
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="min-h-[100px] bg-slate-50 border-slate-200 focus:border-blue-500 transition-all"
                    />
                  )}
                  
                  {input.type === "text" && (
                    <Input 
                      value={formData[input.id]}
                      onChange={(e) => handleInputChange(input.id, e.target.value)}
                      className="bg-slate-50 border-slate-200 focus:border-blue-500 transition-all"
                    />
                  )}

                  {input.type === "select" && (
                    <Select 
                      value={formData[input.id]} 
                      onValueChange={(val) => handleInputChange(input.id, val)}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200">
                        <SelectValue placeholder="请选择" />
                      </SelectTrigger>
                      <SelectContent>
                        {input.options?.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}

              <div className="pt-4 p-4 bg-pink-50 rounded-lg border border-pink-100 text-pink-800 text-sm">
                💡 阿一提示：这只是 A 版的极简演示。在完整版中，我会自动记住你的偏好，无需每次重复输入。
              </div>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="w-1/2 p-6 overflow-y-auto bg-slate-100/50 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-slate-500 uppercase text-xs tracking-wider font-bold">Live Preview</Label>
              <Button size="sm" variant="outline" onClick={handleCopy} className="h-8 text-xs bg-white hover:bg-slate-50">
                {copied ? <Check className="w-3 h-3 mr-1 text-green-500"/> : <Copy className="w-3 h-3 mr-1"/>}
                {copied ? "已复制" : "复制结果"}
              </Button>
            </div>

            <Card className="flex-1 p-8 shadow-sm border-slate-200 bg-white font-serif whitespace-pre-wrap leading-relaxed text-slate-800 overflow-y-auto min-h-[400px]">
              {loading ? (
                <div className="h-full flex items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  阿一正在为你调配配方...
                </div>
              ) : (
                <div className="animate-in fade-in duration-500">
                  {result}
                  <div className="mt-8 pt-6 border-t border-pink-100 text-center">
                    <p className="text-pink-600 font-medium italic">阿一为你完成了第一次成功。从此，AI 只有零次和无数次。</p>
                  </div>
                  
                  {/* 阿一的叮嘱 */}
                  <div className="mt-8 p-4 bg-pink-50 rounded-lg border border-pink-100">
                    <h3 className="text-lg font-semibold text-pink-700 mb-3">阿一的叮嘱</h3>
                    <blockquote className="text-slate-700 italic">
                      {scenarioId === "weekly" && "配方已抹平褶皱。发送前，记得检查一下领导的名字有没有写错哦！"}
                      {scenarioId === "social" && "防护层已开启。如果对方继续纠缠，阿一建议你直接开启飞行模式。"}
                      {scenarioId === "logic" && "漏洞已覆盖。阿一觉得这份方案已经足够惊艳你的老板了。"}
                      {(!scenarioId || (scenarioId !== "weekly" && scenarioId !== "social" && scenarioId !== "logic")) && "阿一希望这份结果能帮到你。如果有任何问题，随时告诉我哦！"}
                    </blockquote>
                  </div>
                  
                  {/* 感谢阿一按钮 */}
                  <div className="mt-8 text-center">
                    <Button 
                      onClick={onClose} 
                      className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      感谢阿一
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
