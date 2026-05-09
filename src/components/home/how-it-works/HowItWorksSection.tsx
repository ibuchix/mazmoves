import { ArrowRight, ClipboardList, BarChart3, Calendar, CheckCircle } from "lucide-react";
import { StepCard } from "./StepCard";

const steps = [
  {
    step: "1",
    title: "Request a Quote",
    description: "Fill out our simple form with your moving details",
    icon: ClipboardList
  },
  {
    step: "2",
    title: "Compare Movers",
    description: "Review quotes from verified moving companies",
    icon: BarChart3
  },
  {
    step: "3",
    title: "Book Your Move",
    description: "Select your preferred mover and schedule the date",
    icon: Calendar
  },
  {
    step: "4",
    title: "Move with Confidence",
    description: "Enjoy a smooth, professional moving experience",
    icon: CheckCircle
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#334155]/5 via-[#475569]/5 to-[#84d21f]/5" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#334155] mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your journey to a seamless move in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <StepCard
              key={index}
              {...item}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};