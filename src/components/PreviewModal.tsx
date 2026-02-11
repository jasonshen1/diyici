import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: {
    title: string;
    previewInput: string;
    previewOutput: string;
  } | null;
  onUse: () => void;
}

export function PreviewModal({ isOpen, onClose, scenario, onUse }: PreviewModalProps) {
  const isMobile = useIsMobile();

  if (!scenario) return null;

  const Content = (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-1">
        <div className="flex flex-col md:flex-row gap-4 h-full">
          {/* 输入区 (Before) */}
          <div className="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100">
            <div className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-300"></span>
              你的原始素材
            </div>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-mono">
              {scenario.previewInput}
            </p>
          </div>

          {/* 转换箭头 */}
          <div className="flex items-center justify-center text-muted-foreground/30 py-2 md:py-0">
            {isMobile ? <ArrowDown size={24} /> : <ArrowRight size={24} />}
          </div>

          {/* 输出区 (After) */}
          <div className="flex-1 bg-[#F0F0E8]/50 rounded-2xl p-5 border border-[#91A398]/20 relative overflow-hidden">
            {/* 装饰印章 */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#91A398]/10 rounded-bl-3xl -mr-4 -mt-4" />
            
            <div className="text-xs font-bold text-[#91A398] mb-3 uppercase tracking-wider flex items-center gap-2 relative z-10">
              <span className="w-2 h-2 rounded-full bg-[#91A398]"></span>
              阿一搞定后
            </div>
            <p className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium relative z-10">
              {scenario.previewOutput}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-800">
          再看看别的
        </Button>
        <Button
          onClick={() => {
            onClose();
            onUse();
          }}
          className="bg-[#91A398] hover:bg-[#7e8f84] text-white rounded-xl px-8 shadow-md hover:shadow-lg transition-all"
        >
          这就去拿捏
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="bg-white max-h-[90vh]">
          <DrawerHeader className="text-left">
            <DrawerTitle>{scenario.title} · 效果预览</DrawerTitle>
            <DrawerDescription>看看阿一怎么化腐朽为神奇</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-8 overflow-y-auto">
            {Content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-3xl p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-[#91A398]">👁️</span> {scenario.title} · 效果预览
          </DialogTitle>
          <DialogDescription>
            左边是平时让人头疼的碎碎念，右边是阿一帮你搞定后的成品。
          </DialogDescription>
        </DialogHeader>
        {Content}
      </DialogContent>
    </Dialog>
  );
}
