import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, Truck, Users, Shield, Clock } from "lucide-react";

export default function Companies() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-[#040480] mb-6">
            Grow Your Moving Business with MAZ Moves
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join our platform for free and connect with customers actively looking for reliable moving services.
            Pay only when you get assigned to a move!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/company/register')}
              className="bg-[#d2491f] hover:bg-[#84d21f] text-white px-8 py-6 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Register Your Company Now
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-[#040480] text-[#040480] hover:bg-[#040480] hover:text-white px-8 py-6 rounded-lg text-lg font-semibold transition-all duration-300"
            >
              Company Login
            </Button>
          </div>
        </div>

      {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-[#040480] rounded-full flex items-center justify-center mb-6">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#040480] mb-4">Pay Per Lead</h3>
            <p className="text-gray-600">
              Only pay for the moves assigned to you. No subscription fees or hidden costs.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-[#1f3dd2] rounded-full flex items-center justify-center mb-6">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#040480] mb-4">Grow Your Business</h3>
            <p className="text-gray-600">
              Access a steady stream of verified customers and expand your business reach.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-[#84d21f] rounded-full flex items-center justify-center mb-6">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#040480] mb-4">Quality Customers</h3>
            <p className="text-gray-600">
              Connect with pre-screened customers who are ready to move.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-[#d2491f] rounded-full flex items-center justify-center mb-6">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#040480] mb-4">Flexible Operations</h3>
            <p className="text-gray-600">
              Choose your service areas and manage your availability with ease.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-[#040480] rounded-full flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#040480] mb-4">Trusted Platform</h3>
            <p className="text-gray-600">
              Join a professional network of verified moving companies.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-[#1f3dd2] rounded-full flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-[#040480] mb-4">Easy Management</h3>
            <p className="text-gray-600">
              Manage bookings and update your availability through our simple dashboard.
            </p>
          </div>
        </div>

      {/* CTA Section */}
      <div className="mt-16 bg-gradient-to-r from-[#040480] to-[#1f3dd2] rounded-2xl shadow-xl p-12 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">
          Ready to Expand Your Moving Business?
        </h2>
        <p className="text-xl text-gray-100 mb-8">
          Join MAZ Moves today - it's completely free! Start receiving quality leads and grow your business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/company/register')}
            className="bg-[#d2491f] hover:bg-[#84d21f] text-white px-8 py-6 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-105 whitespace-normal sm:whitespace-nowrap"
          >
            Register Now
          </Button>
          <Button 
            onClick={() => navigate('/login')}
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-[#040480] px-8 py-6 rounded-lg text-lg font-semibold transition-all duration-300"
          >
            Company Login
          </Button>
        </div>
      </div>
    </div>
  );
}
