import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Loader2, Eye } from "lucide-react";

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
  onPreview?: () => void;
}

export function SampleCard({ id, title, description, icon, params, onClaim, onPreview }: SampleCardProps) {
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
    <div className="group h-full flex flex-col rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white/90 backdrop-blur-sm border border-border relative">
      {/* Floating Badge */}
      <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
        3分钟见效
      </div>
      {/* Header with Icon */}
      <div className="p-6 pb-2">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300">
          <img 
            src={icon} 
            alt={title} 
            className="w-full h-full object-contain drop-shadow-sm"
          />
        </div>
        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          功效小样
        </p>
      </div>

      {/* Description */}
      <div className="px-6 flex-grow">
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* Input Fields */}
        <div className="space-y-3 mb-4">
          {params.map((param, index) => (
            <div key={index} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground block">
                {param.label}
              </label>
              <input
                type="text"
                value={inputValues[param.label]}
                onChange={(e) => handleInputChange(param.label, e.target.value)}
                placeholder={param.placeholder}
                className="w-full px-3 py-2 rounded-3xl border border-border bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <div className="p-6 pt-2 space-y-3">
        <Button 
          onClick={handleClaim}
          disabled={isClaiming || isClaimed}
          className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-300 font-medium"
        >
          {isClaimed ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              已领取
            </>
          ) : isClaiming ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              调配中...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              立即领取
            </>
          )}
        </Button>
        {onPreview && (
          <Button 
            className="w-full h-12 border border-[#91A398] text-[#91A398] hover:bg-[#91A398]/10 transition-all rounded-2xl"
            variant="outline"
            onClick={onPreview}
          >
            <Eye className="w-4 h-4 mr-2" />
            看看效果
          </Button>
        )}
      </div>
    </div>
  );
}
