
import { CheckCircle } from "lucide-react";

export const HeroContent = () => {
  return (
    <div className="text-white flex flex-col justify-between h-full">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
          Get Instant Quotes from 
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-brand-green to-white ml-2">
            Trusted Movers
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-100 font-light">
          Free to use, no obligations.
        </p>
      </div>

      <div className="space-y-3">
        <FeatureItem text="Verified Professional Movers" />
        <FeatureItem text="Compare Multiple Quotes" />
        <FeatureItem text="100% Free Service" />
      </div>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl transition-transform duration-300 hover:-translate-y-1">
    <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0" />
    <span className="text-base md:text-lg font-medium">{text}</span>
  </div>
);
