import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            不靠卖焦虑，只为价值付费
          </h2>
          <p className="text-lg text-slate-500">
            A 版全功能免费，只为让你体验第一次成功。<br className="hidden md:block"/>
            当你需要长期、稳定、个性化的生产力时，可以选择升级 B 版。
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* A 版 - Free */}
          <Card className="border-slate-200 shadow-sm hover:shadow-lg transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-bl-lg">
              当前入口
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-slate-900">A 版 · 极速入口</CardTitle>
              <div className="mt-4 flex items-baseline justify-center text-slate-900">
                <span className="text-5xl font-extrabold tracking-tight">¥0</span>
                <span className="ml-1 text-xl font-semibold text-slate-500">/ 永久</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {[
                  "所有 10 个首胜场景免费使用",
                  "无需注册，即用即走",
                  "极简填空式交互",
                  "单次生成结果可复制导出"
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mr-2" />
                    <span className="text-slate-600 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-slate-100 text-slate-900 hover:bg-slate-200" variant="secondary">
                正在使用中
              </Button>
            </CardFooter>
          </Card>

          {/* B 版 - Pro */}
          <Card className="border-blue-200 bg-blue-50/30 shadow-md hover:shadow-xl transition-all relative overflow-hidden ring-1 ring-blue-500/20">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              推荐升级
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-slate-900">B 版 · 能力成长</CardTitle>
              <div className="mt-4 flex items-baseline justify-center text-slate-900">
                <span className="text-5xl font-extrabold tracking-tight">¥19</span>
                <span className="ml-1 text-xl font-semibold text-slate-500">/ 月</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {[
                  "包含 A 版所有功能",
                  "浏览器侧边栏伴随式服务",
                  "沉淀个人偏好 (语气/格式/禁忌)",
                  "自定义场景模版库",
                  "多平台账号同步 (手机/PC)"
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-blue-600 shrink-0 mr-2" />
                    <span className="text-slate-700 text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/10">
                预约 B 版内测 (限量)
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
