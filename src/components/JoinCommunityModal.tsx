import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { FlaskConical, Mail } from "lucide-react";
import { useState, useEffect } from "react";

interface JoinCommunityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinCommunityModal({ isOpen, onClose }: JoinCommunityModalProps) {
  const isMobile = useIsMobile();
  const [successCount, setSuccessCount] = useState(1284);

  // 动态更新成功人数
  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setSuccessCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const ModalContent = () => (
    <>
      {/* 顶部 Logo */}
      <div className="flex justify-center pt-8 pb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#A47864] to-[#6B5345] flex items-center justify-center shadow-lg relative">
          <span className="text-white text-3xl font-bold">1</span>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#91A398" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
      </div>

      {/* 标题和副标题 */}
      <div className="text-center px-6 mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-[#4A4A4A] mb-3 leading-tight">
          diyici.ai 首席首胜官招募
        </h2>
        <p className="text-[#6B6B6B] text-sm leading-relaxed max-w-md mx-auto">
          你是前 100 位发现这里的幸运儿。加入内测群，第一时间试用阿一的新配方。
        </p>
        {/* 成功人数计数器 */}
        <div className="mt-4 text-sm font-semibold text-[#91A398] animate-pulse">
          当前已有 <span className="font-bold text-[#A47864]">{successCount}</span> 位完成首胜
        </div>
      </div>

      {/* 二维码区域 */}
      <div className="flex flex-col items-center gap-6 mb-8 px-4">
        {/* 二维码 */}
        <div className="w-64 h-64 bg-white rounded-2xl p-4 border border-[#91A398]/30 shadow-lg">
          {/* 真实内测群二维码 */}
          <div className="w-full h-full flex items-center justify-center">
            <img 
              src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=QR%20code%20with%20chat%20bubbles%20icon%20in%20the%20center%2C%20black%20background%2C%20white%20QR%20code%20pattern%2C%20clear%20and%20scannable&image_size=square_hd" 
              alt="内测群二维码" 
              className="max-w-full max-h-full rounded-3xl"
            />
          </div>
        </div>
        
        {/* 倒计时限量 */}
        <div className="text-center">
          <div className="text-sm font-semibold text-[#91A398] mb-2">倒计时限量</div>
          <div className="text-xl font-bold text-[#A47864] animate-pulse mb-3">
            当前名额：剩 <span className="text-red-500">17</span> / 100
          </div>
          <p className="text-[#6B6B6B] text-sm font-medium">扫码添加阿一的首席助理</p>
        </div>
      </div>

      {/* 底部温情语 */}
      <div className="text-center px-8 pb-10">
        <p className="text-[#9E9E9E] text-sm italic">
          阿一说：实验室的门永远为好奇心敞开。
        </p>
      </div>
    </>
  );

  return (
    <>
      {isMobile ? (
        <Drawer open={isOpen} onOpenChange={onClose} direction="bottom">
          <DrawerContent className="bg-[#F0F0E8] border-t-[#91A398]/30 rounded-t-3xl">
            <ModalContent />
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-lg bg-[#F0F0E8] border-[#91A398]/30 rounded-3xl">
            <ModalContent />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
