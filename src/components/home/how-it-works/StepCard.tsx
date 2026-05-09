import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StepCardProps {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
  isLast?: boolean;
}

export const StepCard = ({ step, title, description, icon: Icon, isLast = false }: StepCardProps) => {
  return (
    <div className="relative flex items-stretch">
      {!isLast && (
        <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-brand-green transform -translate-y-1/2 z-0">
          <ArrowRight className="absolute right-0 text-brand-green -translate-y-1/2 translate-x-1/2 animate-pulse" />
        </div>
      )}
      
      <Card className="relative z-10 group hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-none w-full">
        <CardContent className="flex flex-col items-center p-8 h-full">
          <div className="w-10 h-10 mb-6 flex items-center justify-center bg-gradient-to-r from-brand-slate to-brand-slateLight text-white rounded-full font-semibold group-hover:scale-110 transition-transform duration-300">
            {step}
          </div>
          
          <div className="mb-6 text-brand-slateLight group-hover:scale-110 transition-transform duration-300 group-hover:text-brand-green">
            <Icon className="w-12 h-12" />
          </div>
          
          <div className="text-center flex-grow flex flex-col justify-between">
            <h3 className="text-xl font-semibold text-brand-slate mb-3 group-hover:text-brand-slateLight transition-colors">
              {title}
            </h3>
            <p className="text-gray-600">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};