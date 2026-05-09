
import { CheckCircle } from "lucide-react";

export const HeroContent = () => {
  return (
    <div className="text-white space-y-6 md:space-y-8">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
        Get Instant Quotes from 
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#84d21f] to-white ml-2">
          Trusted Movers
        </span>
      </h1>
      
      <p className="text-xl md:text-2xl text-gray-100 font-light">
        Free to use, no obligations.
      </p>

      <div className="space-y-4">
        <FeatureItem text="Verified Professional Movers" />
        <FeatureItem text="Compare Multiple Quotes" />
        <FeatureItem text="100% Free Service" />
      </div>
    </div>
  );
};

const FeatureItem = ({ text }: { text: string }) => (
  <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl transition-transform duration-300 hover:-translate-y-1">
    <CheckCircle className="w-6 h-6 text-[#84d21f] flex-shrink-0" />
    <span className="text-lg md:text-xl font-medium">{text}</span>
  </div>
);
