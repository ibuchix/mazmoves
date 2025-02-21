
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ClipboardList, BarChart3, Calendar, CheckCircle } from "lucide-react";
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
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#040480]/5 via-[#1f3dd2]/5 to-[#84d21f]/5" />
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#040480] mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your journey to a seamless move in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="relative flex items-stretch">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-[2px] bg-[#84d21f] transform -translate-y-1/2 z-0">
                  <ArrowRight className="absolute right-0 text-[#84d21f] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                </div>
              )}
              
              {/* Card */}
              <Card className="relative z-10 group hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-none w-full">
                <CardContent className="flex flex-col items-center p-8 h-full">
                  {/* Step Number */}
                  <div className="w-10 h-10 mb-6 flex items-center justify-center bg-gradient-to-r from-[#040480] to-[#1f3dd2] text-white rounded-full font-semibold group-hover:scale-110 transition-transform duration-300">
                    {item.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="mb-6 text-[#1f3dd2] group-hover:scale-110 transition-transform duration-300 group-hover:text-[#84d21f]">
                    {item.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="text-center flex-grow flex flex-col justify-between">
                    <h3 className="text-xl font-semibold text-[#040480] mb-3 group-hover:text-[#1f3dd2] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-semibold text-[#040480] mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Our service is completely free for movers. Join our network and start receiving moving requests today!
          </p>
          <Button 
            onClick={() => navigate('/request-move')}
            className="bg-[#d2491f] hover:bg-[#84d21f] text-white font-semibold px-8 py-3 text-lg rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
          >
            Request Your Move Now
          </Button>
        </div>
      </div>
    </section>
  );
};
