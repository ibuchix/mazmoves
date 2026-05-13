import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  location: string;
  rating: number;
  text: string;
}

export const TestimonialCard = ({ name, location, rating, text }: TestimonialCardProps) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 fill-brand-green text-brand-green" />
          ))}
        </div>
        <Quote className="w-8 h-8 text-brand-orange mb-4" />
        <p className="text-gray-700 mb-6">{text}</p>
        <div className="mt-auto">
          <p className="font-semibold text-brand-slate">{name}</p>
          <p className="text-sm text-brand-slateLight">{location}</p>
        </div>
      </CardContent>
    </Card>
  );
};