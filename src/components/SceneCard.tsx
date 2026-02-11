import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface SceneCardProps {
  title: string;
  description: string;
  iconName: string; // Filename without extension
  ctaText?: string;
}

export function SceneCard({ title, description, iconName, ctaText = "立即领取" }: SceneCardProps) {
  // Dynamic import for assets is tricky in Vite with variable names if not handled carefully.
  // We'll assume the parent passes the full imported URL or handle it via a mapping in Home.
  // For now, let's assume we pass the src directly or use a known path if assets are in public (which they aren't, they are in src/assets).
  // Better approach: Parent component imports images and passes the src.
  
  return (
    <Card className="group h-full flex flex-col border border-border shadow-[0_2px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white/90 backdrop-blur-sm rounded-3xl">
      <CardHeader className="p-6 pb-2">
        <div className="w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-3 group-hover:scale-110 transition-transform duration-300">
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
        <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
          {title}
        </h3>
      </CardHeader>
      <CardContent className="px-6 flex-grow">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all shadow-sm hover:shadow-md rounded-2xl" variant="default">
          {ctaText}
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardFooter>
    </Card>
  );
}
