
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ClipboardList, BarChart3, Calendar, CheckCircle, PoundSterling } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const HowItWorksSection = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: "1",
      title: "Request a Quote",
      description: "Fill out our simple form with your moving details",
      icon: <ClipboardList className="w-12 h-12" />
    },
    {
      step: "2",
      title: "Compare Movers",
      description: "Review quotes from verified moving companies",
      icon: <BarChart3 className="w-12 h-12" />
    },
    {
      step: "3",
      title: "Book Your Move",
      description: "Select your preferred mover and schedule the date",
      icon: <Calendar className="w-12 h-12" />
    },
    {
      step: "4",
      title: "Move with Confidence",
      description: "Enjoy a smooth, professional moving experience",
      icon: <CheckCircle className="w-12 h-12" />
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Enhanced gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#040480]/10 via-transparent to-[#84d21f]/10" />
      <div className="absolute inset-0 bg-[url('/lovable-uploads/707ca792-48a2-4427-9149-26c38ef7ecd3.png')] opacity-5" />
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#040480] mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your journey to a seamless move in four simple steps
          </p>
          
          {/* Free Service Badge */}
          <div className="mt-6 inline-flex items-center gap-2 bg-[#84d21f]/20 px-4 py-2 rounded-full">
            <PoundSterling className="w-5 h-5 text-[#84d21f]" />
            <span className="text-[#040480] font-semibold">100% Free Service for Customers</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative flex items-stretch">
              {/* Enhanced Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8">
                  <div className="h-[2px] bg-gradient-to-r from-[#84d21f] to-[#1f3dd2] w-full" />
                  <ArrowRight className="absolute right-0 text-[#1f3dd2] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                </div>
              )}
              
              {/* Enhanced Card */}
              <Card className="group hover:shadow-lg transition-all duration-300 bg-white/95 backdrop-blur-sm border-none w-full hover:scale-105">
                <CardContent className="flex flex-col items-center p-8 h-full">
                  {/* Step Number with enhanced styling */}
                  <div className="w-12 h-12 mb-6 flex items-center justify-center bg-gradient-to-r from-[#040480] to-[#1f3dd2] text-white rounded-full font-semibold text-lg group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {item.step}
                  </div>
                  
                  {/* Icon with enhanced animation */}
                  <div className="mb-6 text-[#1f3dd2] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:text-[#84d21f]">
                    {item.icon}
                  </div>
                  
                  {/* Content with enhanced typography */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-[#040480] mb-3 group-hover:text-[#1f3dd2] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Enhanced Call to Action */}
        <div className="mt-16 text-center">
          <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg">
            <h3 className="text-2xl font-semibold text-[#040480] mb-4">
              Ready to Start Your Moving Journey?
            </h3>
            <p className="text-gray-600 mb-8">
              Get matched with professional movers at no cost to you. Our service is completely free for customers!
            </p>
            <Button 
              onClick={() => navigate('/request-move')}
              className="bg-[#d2491f] hover:bg-[#84d21f] text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Get Your Free Moving Quote Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
