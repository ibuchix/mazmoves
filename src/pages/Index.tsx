import { Button } from "@/components/ui/button";
import { MoveTypeStep } from "@/components/move-request/MoveTypeStep";
import { useState } from "react";
import { MoveType } from "@/types/move-request";

export default function Index() {
  const [moveType, setMoveType] = useState<MoveType | null>(null);

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#040480] to-[#1f3dd2] py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Professional Moving Solutions for Your Peace of Mind
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                Expert moving services tailored to your needs. Let us handle your move while you focus on what matters most.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-xl">
              <h2 className="text-2xl font-bold text-[#040480] mb-6">Start Your Move</h2>
              <MoveTypeStep
                value={moveType}
                onChange={(value) => setMoveType(value)}
              />
              <Button 
                className="w-full mt-6 bg-[#d2491f] hover:bg-[#84d21f] text-white text-lg px-8 py-6 h-auto"
                onClick={() => {
                  if (moveType) {
                    window.location.href = '/request-move';
                  }
                }}
                disabled={!moveType}
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
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

      {/* Why Choose Us Section */}
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

      {/* CTA Section */}
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