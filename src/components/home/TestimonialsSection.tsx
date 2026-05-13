import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Sarah",
      location: "Stevington",
      rating: 5,
      text: "The most stress-free moving experience I've ever had. The team was professional, efficient, and careful with all my belongings.",
    },
    {
      name: "Chen",
      location: "Cambridge",
      rating: 5,
      text: "Excellent service from start to finish. The online quote system was easy to use, and the movers were punctual and professional.",
    },
    {
      name: "Emily",
      location: "Warwick",
      rating: 5,
      text: "I was impressed by how smooth the entire process was. The pricing was transparent, and the moving crew was fantastic.",
    }
  ];

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-brand-slate mb-4">What Our Customers Say</h2>
          <p className="text-brand-slateLight max-w-2xl mx-auto">
            Read about the experiences of customers who have trusted us with their moves
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-brand-green text-brand-green" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-brand-slateLight mb-4" />
                <p className="text-brand-slate mb-6">{testimonial.text}</p>
                <div className="mt-auto">
                  <p className="font-semibold text-brand-slate">{testimonial.name}</p>
                  <p className="text-sm text-brand-slateLight">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};