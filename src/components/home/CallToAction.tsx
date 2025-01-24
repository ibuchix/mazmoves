import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const CallToAction = () => {
  const navigate = useNavigate();

  const handleGetQuotes = () => {
    navigate('/request-move');
  };

  return (
    <section className="bg-gradient-to-r from-[#d2491f] to-[#84d21f] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Move?</h2>
        <p className="text-xl mb-8">Contact us today for a free, no-obligation quote</p>
        <Button 
          onClick={handleGetQuotes}
          className="bg-white text-[#040480] hover:bg-gray-100 text-lg px-8 py-6 h-auto"
        >
          Get Free Quotes
        </Button>
      </div>
    </section>
  );
};