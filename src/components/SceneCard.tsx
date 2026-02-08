import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SceneCardProps {
  title: string;
  description: string;
  iconName: string; // Filename without extension
  ctaText?: string;
}

export function SceneCard({ title, description, iconName, ctaText = "立即生成" }: SceneCardProps) {
  // Dynamic import for assets is tricky in Vite with variable names if not handled carefully.
  // We'll assume the parent passes the full imported URL or handle it via a mapping in Home.
  // For now, let's assume we pass the src directly or use a known path if assets are in public (which they aren't, they are in src/assets).
  // Better approach: Parent component imports images and passes the src.
  
  return (
    <Card className="group h-full flex flex-col border border-white/20 shadow-sm hover:shadow-xl hover:border-pink-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white/60 backdrop-blur-lg">
      <CardHeader className="p-6 pb-2">
        <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-pink-50/80 to-purple-50/80 flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-300 shadow-inner">
           {/* We will rely on an img tag here. The parent will pass the mapped image. */}
           <img 
             src={`/assets/${iconName}.png`} 
             alt={title} 
             className="w-full h-full object-contain drop-shadow-sm"
             onError={(e) => {
               // Fallback if image fails (though we processed them)
               (e.target as HTMLImageElement).src = "https://placehold.co/100x100?text=Icon";
             }}
           />
        </div>
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="px-6 flex-grow">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-purple-500 group-hover:text-white transition-all shadow-none group-hover:shadow-lg group-hover:shadow-pink-500/20 animate-pulse-slow" variant="secondary">
          {ctaText}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}
