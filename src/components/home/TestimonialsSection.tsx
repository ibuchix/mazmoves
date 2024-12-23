import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "San Francisco",
      rating: 5,
      text: "The most stress-free moving experience I've ever had. The team was professional, efficient, and careful with all my belongings.",
    },
    {
      name: "Michael Chen",
      location: "Los Angeles",
      rating: 5,
      text: "Excellent service from start to finish. The online quote system was easy to use, and the movers were punctual and professional.",
    },
    {
      name: "Emily Rodriguez",
      location: "San Diego",
      rating: 5,
      text: "I was impressed by how smooth the entire process was. The pricing was transparent, and the moving crew was fantastic.",
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-bl from-[#84d21f]/5 to-[#d2491f]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#040480] mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read about the experiences of customers who have trusted us with their moves
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[#84d21f] text-[#84d21f]" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-[#d2491f] mb-4" />
                <p className="text-gray-700 mb-6">{testimonial.text}</p>
                <div className="mt-auto">
                  <p className="font-semibold text-[#040480]">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};