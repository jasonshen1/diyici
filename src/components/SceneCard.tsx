import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye } from "lucide-react";

interface SceneProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface SceneCardProps {
  scene: SceneProps;
  onClick: () => void;
  onPreview: () => void; // 新增预览回调
}

export function SceneCard({ scene, onClick, onPreview }: SceneCardProps) {
  return (
    <div
      className="group relative bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#91A398]/30 flex flex-col h-full cursor-pointer"
      onClick={onClick} // 整个卡片点击依然触发主功能
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110 duration-300",
        scene.color
      )}>
        {scene.icon}
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[#91A398] transition-colors">
        {scene.title}
      </h3>
      
      <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">
        {scene.description}
      </p>
      
      <div className="flex items-center gap-2 mt-auto">
        {/* 预览按钮 (阻止冒泡，避免触发主卡片点击) */}
        <Button
          variant="outline"
          className="flex-1 rounded-3xl border-gray-200 text-[#91A398] hover:text-[#91A398] hover:bg-[#91A398]/5 hover:border-[#91A398]/30 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onPreview();
          }}
        >
          <Eye size={16} className="mr-2" />
          看看效果
        </Button>

        {/* 主按钮 */}
        <Button
          className="flex-1 rounded-3xl bg-gray-50 text-gray-900 group-hover:bg-[#91A398] group-hover:text-white transition-all shadow-none group-hover:shadow-md"
        >
          搞定
          <ArrowRight size={16} className="ml-2 opacity-50 group-hover:opacity-100" />
        </Button>
      </div>
    </div>
  );
}
