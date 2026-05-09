import { TestimonialCard } from "./TestimonialCard";

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "Stevington",
    rating: 5,
    text: "The most stress-free moving experience I've ever had. The team was professional, efficient, and careful with all my belongings.",
  },
  {
    name: "Michael Chen",
    location: "Cambridge",
    rating: 5,
    text: "Excellent service from start to finish. The online quote system was easy to use, and the movers were punctual and professional.",
  },
  {
    name: "Emily Rodriguez",
    location: "Warwick",
    rating: 5,
    text: "I was impressed by how smooth the entire process was. The pricing was transparent, and the moving crew was fantastic.",
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-bl from-[#84d21f]/5 to-[#d2491f]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#334155] mb-4">What Our Customers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Read about the experiences of customers who have trusted us with their moves
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};