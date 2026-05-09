// HowItWorksSection: Redesigned as a connected flowchart (no card boxes).
// Heading and step titles use slate grey. Numbered nodes connect with lines/arrows.
import { ClipboardList, BarChart3, Calendar, CheckCircle, ArrowRight, ArrowDown } from "lucide-react";

export const HowItWorksSection = () => {
  const steps = [
    {
      step: "1",
      title: "Request a Quote",
      description: "Fill out our simple form with your moving details",
      icon: ClipboardList,
    },
    {
      step: "2",
      title: "Compare Movers",
      description: "Review quotes from verified moving companies",
      icon: BarChart3,
    },
    {
      step: "3",
      title: "Book Your Move",
      description: "Select your preferred mover and schedule the date",
      icon: Calendar,
    },
    {
      step: "4",
      title: "Move with Confidence",
      description: "Enjoy a smooth, professional moving experience",
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-700 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your journey to a seamless move in four simple steps
          </p>

          <div className="mt-6 inline-flex items-center gap-2 bg-[#84d21f]/20 px-4 py-2 rounded-full">
            <span className="text-[#334155] font-semibold">100% Free Service for Customers</span>
          </div>
        </div>

        {/* Flowchart */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-2 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === steps.length - 1;
            return (
              <div
                key={index}
                className="flex flex-col md:flex-row items-center w-full md:flex-1"
              >
                {/* Node */}
                <div className="group flex flex-col items-center text-center max-w-xs mx-auto px-2">
                  {/* Circle with number */}
                  <div className="relative mb-4">
                    <div className="absolute inset-0 rounded-full bg-slate-700/20 blur-xl group-hover:bg-slate-700/30 transition-all" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-9 h-9" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border-2 border-slate-700 text-slate-700 font-bold text-sm flex items-center justify-center shadow">
                      {item.step}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Connector */}
                {!isLast && (
                  <>
                    {/* Desktop: horizontal */}
                    <div className="hidden md:flex items-center justify-center px-2 pt-8">
                      <div className="flex items-center">
                        <div className="h-[2px] w-10 bg-gradient-to-r from-slate-700 to-slate-400" />
                        <ArrowRight className="w-5 h-5 text-slate-600 -ml-1" />
                      </div>
                    </div>
                    {/* Mobile: vertical */}
                    <div className="flex md:hidden items-center justify-center py-2">
                      <ArrowDown className="w-6 h-6 text-slate-600" />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
