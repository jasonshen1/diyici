import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Gift, User, MessageCircle } from "lucide-react";
import { JoinCommunityModal } from "@/components/JoinCommunityModal";

export function PricingSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    painPoint: "",
    scenario: "",
    expectations: "",
    joinCommunity: false
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 打开内测群模态框
    setIsModalOpen(true);
  };

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-white to-pink-50 border-t border-slate-100">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-700 mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">独家邀请</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            领取阿一的首批体验卡
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            成为 diyici.ai 的首批内测官，优先体验全新 AI 小样。<br className="hidden md:block"/>
            您的反馈，将帮助我们打造更贴心的产品。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2 text-slate-700">
              <Gift className="w-5 h-5 text-pink-500" />
              <span>优先体验新品</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-5 h-5 text-pink-500" />
              <span>专属定制服务</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MessageCircle className="w-5 h-5 text-pink-500" />
              <span>直接对话产品团队</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="border-pink-100 shadow-md overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-purple-50 border-b border-pink-100">
              <CardTitle className="text-2xl font-bold text-slate-900 text-center">
                内测官申请表
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-700 font-medium">
                      您的姓名
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="请输入您的姓名"
                      className="bg-white border-slate-200 focus:border-pink-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      联系邮箱
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="请输入您的邮箱"
                      className="bg-white border-slate-200 focus:border-pink-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scenario" className="text-slate-700 font-medium">
                    您最常使用 AI 的场景
                  </Label>
                  <Select
                    value={formData.scenario}
                    onValueChange={(value) => handleInputChange("scenario", value)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 focus:border-pink-300">
                      <SelectValue placeholder="请选择场景" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work">职场办公</SelectItem>
                      <SelectItem value="social">社交沟通</SelectItem>
                      <SelectItem value="study">学习教育</SelectItem>
                      <SelectItem value="life">生活助手</SelectItem>
                      <SelectItem value="other">其他场景</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="painPoint" className="text-slate-700 font-medium">
                    您在该场景中遇到的最大痛点
                  </Label>
                  <Textarea
                    id="painPoint"
                    value={formData.painPoint}
                    onChange={(e) => handleInputChange("painPoint", e.target.value)}
                    placeholder="请详细描述您遇到的问题，这将帮助我们开发更有针对性的 AI 小样..."
                    className="bg-white border-slate-200 focus:border-pink-300 min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expectations" className="text-slate-700 font-medium">
                    您对理想 AI 解决方案的期待
                  </Label>
                  <Textarea
                    id="expectations"
                    value={formData.expectations}
                    onChange={(e) => handleInputChange("expectations", e.target.value)}
                    placeholder="请描述您希望 AI 如何帮助您解决上述问题..."
                    className="bg-white border-slate-200 focus:border-pink-300 min-h-[100px]"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="joinCommunity"
                    checked={formData.joinCommunity}
                    onCheckedChange={(checked) => handleInputChange("joinCommunity", checked || false)}
                  />
                  <Label htmlFor="joinCommunity" className="text-slate-600">
                    我愿意加入阿一内测群，与其他内测官交流
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                >
                  开启第一次成功，成为内测官
                </Button>

                <p className="text-center text-sm text-slate-500">
                  开启成功后，我们将在 3 个工作日内与您联系
                </p>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* 内测群模态框 */}
        <JoinCommunityModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </section>
  );
}

