import { Button } from "@/components/ui/button";
import { MoveTypeStep } from "@/components/move-request/MoveTypeStep";
import { useState } from "react";
import { MoveType } from "@/types/move-request";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const [moveType, setMoveType] = useState<MoveType | null>(null);
  const navigate = useNavigate();

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#040480] to-[#1f3dd2] py-20">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-8">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Moving Made Simple
              </h1>
              <p className="text-xl text-gray-100 leading-relaxed">
                Get instant quotes from trusted movers in your area. Our service is completely free to use.
              </p>
              <div className="flex items-center space-x-2 text-lg text-gray-100">
                <svg className="w-6 h-6 text-[#84d21f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Free to use</span>
              </div>
              <div className="flex items-center space-x-2 text-lg text-gray-100">
                <svg className="w-6 h-6 text-[#84d21f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Verified movers only</span>
              </div>
              <div className="flex items-center space-x-2 text-lg text-gray-100">
                <svg className="w-6 h-6 text-[#84d21f]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Instant quotes</span>
              </div>
            </div>
            <div className="bg-white/95 backdrop-blur-sm p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold text-[#040480] mb-6">Start Your Move</h2>
              <MoveTypeStep
                value={moveType}
                onChange={(value) => setMoveType(value)}
              />
              <Button 
                className="w-full mt-6 bg-[#d2491f] hover:bg-[#84d21f] text-white text-base px-6 py-2"
                onClick={() => {
                  if (moveType) {
                    navigate('/request-move');
                  }
                }}
                disabled={!moveType}
              >
                Get Free Quotes
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#040480] mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Residential Moving",
                description: "Professional home moving services tailored to your needs"
              },
              {
                title: "Commercial Moving",
                description: "Efficient business relocation with minimal disruption"
              },
              {
                title: "Packing Services",
                description: "Expert packing and unpacking for a worry-free move"
              }
            ].map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-[#040480] mb-4">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-[#040480] mb-12">Why Choose MAZ Moves</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { title: "Professional Team", description: "Experienced and trained movers" },
              { title: "Reliable Service", description: "On-time and efficient moving" },
              { title: "Affordable Rates", description: "Competitive pricing and free quotes" },
              { title: "Full Insurance", description: "Your belongings are protected" }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <h3 className="text-xl font-semibold text-[#040480] mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-[#d2491f] to-[#84d21f] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Move?</h2>
          <p className="text-xl mb-8">Contact us today for a free, no-obligation quote</p>
          <Button className="bg-white text-[#040480] hover:bg-gray-100 text-lg px-8 py-6 h-auto">
            Contact Us Now
          </Button>
        </div>
      </section>
    </div>
  );
}
