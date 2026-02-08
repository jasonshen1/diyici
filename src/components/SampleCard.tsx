import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

interface SampleCardProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  params: {
    label: string;
    placeholder: string;
    defaultValue: string;
  }[];
  onClaim: (id: string, data: any) => void;
}

export function SampleCard({ id, title, description, icon, params, onClaim }: SampleCardProps) {
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>(
    params.reduce((acc, param) => {
      acc[param.label] = param.defaultValue;
      return acc;
    }, {} as Record<string, string>)
  );

  const handleInputChange = (label: string, value: string) => {
    setInputValues(prev => ({
      ...prev,
      [label]: value
    }));
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onClaim(id, inputValues);
      setIsClaimed(true);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="group h-full flex flex-col rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white/60 backdrop-blur-lg border border-white/20 hover:border-pink-200/50 relative">
      {/* Floating Badge */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
        3分钟见效
      </div>
      {/* Header with Icon */}
      <div className="p-6 pb-2">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-pink-50/80 to-purple-50/80 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300 shadow-inner">
          <img 
            src={icon} 
            alt={title} 
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-400 mt-1">
          AI 小样
        </p>
      </div>

      {/* Description */}
      <div className="px-6 flex-grow">
        <p className="text-slate-500 text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* Input Fields */}
        <div className="space-y-3 mb-4">
          {params.map((param, index) => (
            <div key={index} className="space-y-1">
              <label className="text-xs font-medium text-slate-500 block">
                {param.label}
              </label>
              <input
                type="text"
                value={inputValues[param.label]}
                onChange={(e) => handleInputChange(param.label, e.target.value)}
                placeholder={param.placeholder}
                className="w-full px-3 py-2 rounded-lg border border-white/50 bg-white/50 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-transparent transition-all text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 pt-2">
        <Button 
          onClick={handleClaim}
          disabled={isClaiming || isClaimed}
          className="w-full h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg hover:shadow-pink-500/20 transition-all duration-300 font-medium animate-pulse-slow"
        >
          {isClaimed ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              已领取
            </>
          ) : isClaiming ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              立即领取
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
