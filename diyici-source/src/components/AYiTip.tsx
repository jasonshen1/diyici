import { Sparkles } from "lucide-react";

interface AYiTipProps {
  scenarioId: string | null;
}

export function AYiTip({ scenarioId }: AYiTipProps) {
  // 差异化的“阿一的叮嘱”内容
  const getTipContent = () => {
    switch (scenarioId) {
      case "weekly":
        return "阿一提醒：褶皱已抹平，但发给领导前，一定要确认他的称呼没写错哦！\n\n职场如战场，细节定成败。这份除皱后的周报，逻辑清晰、重点突出，定能让你在领导面前脱颖而出。记得保存好这份配方，下次使用更顺手哦！";
      case "social":
        return "社交场合，得体为先。这份隔离乳为你过滤了多余情绪，让你的表达更加优雅得体。阿一建议你在发送前再默读一遍，确保语气恰到好处。";
      case "logic":
        return "逻辑是表达的基石。这份遮瑕膏为你修饰了逻辑漏洞，让你的方案更加严谨有力。阿一相信，有了这份武器，你定能在会议上一鸣惊人！";
      case "meeting":
        return "会议时间宝贵，提炼要点很重要。这份提纯乳为你节省了大量时间，让你能快速抓住会议重点。阿一建议你在分享前再检查一遍，确保没有遗漏关键信息哦！";
      case "emotion":
        return "高情商表达是人际关系的润滑剂。这份精华为你提升了表达效果，让你的沟通更加顺畅。阿一希望你能将这种表达方式融入日常生活，成为更好的自己！";
      case "terms":
        return "复杂条款往往隐藏着重要信息。这份拆解液为你简化了理解过程，让你能轻松掌握条款内容。阿一提醒你，在签署任何协议前，一定要仔细阅读所有条款哦！";
      default:
        return "阿一希望这份结果能帮到你。每一次尝试都是成长，每一次成功都是新的开始。记住，智能只有零次和无数次，而你已经迈出了第一步！";
    }
  };

  return (
    <div className="mt-6 p-5 bg-[#FFF9C4] rounded-3xl border border-yellow-200 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-[#91A398]" />
        </div>
        <div>
          <h4 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2 font-serif">
            <span>阿一的叮嘱</span>
            <span className="text-xs font-normal text-[#91A398]">新品体验</span>
          </h4>
          <p className="text-gray-700 leading-relaxed font-light">
            {getTipContent()}
          </p>
        </div>
      </div>
    </div>
  );
}
