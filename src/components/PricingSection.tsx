import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            加入阿一内测群
          </h2>
          <p className="text-lg text-slate-500">
            成为 diyici.ai 的首批内测用户，优先体验全新功能。<br className="hidden md:block"/>
            我们期待与您一起打造更美好的 AI 体验。
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-xl font-bold text-slate-900">内测群加入</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-6">
                <p className="text-center text-slate-600">
                  扫描下方二维码，加入阿一内测群，获取更多 AI 小样和专属福利。
                </p>
                <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-slate-500">二维码占位</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600">
                  加入内测群
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
