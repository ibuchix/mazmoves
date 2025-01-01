import { RegisterCompanyForm } from "@/components/company/RegisterCompanyForm";
import { CheckCircle, DollarSign, Users, Truck, Heart } from "lucide-react";

export default function RegisterCompany() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#040480] to-[#1f3dd2] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Join MAZ Moves Today
          </h1>
          <p className="text-xl md:text-2xl text-center text-gray-100 max-w-3xl mx-auto">
            Partner with us for free and only pay when you receive qualified moving leads
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Registration Form Section */}
        <div className="max-w-2xl mx-auto mb-16">
          <RegisterCompanyForm />
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <CheckCircle className="w-8 h-8 text-[#84d21f] mr-3" />
              <h3 className="text-xl font-semibold text-[#040480]">Free to Join</h3>
            </div>
            <p className="text-gray-600">
              No upfront costs or monthly fees. Register your company and start receiving leads immediately.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <DollarSign className="w-8 h-8 text-[#84d21f] mr-3" />
              <h3 className="text-xl font-semibold text-[#040480]">Pay Per Lead</h3>
            </div>
            <p className="text-gray-600">
              Only pay for the leads assigned to you. No hidden charges or subscription fees.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <Users className="w-8 h-8 text-[#84d21f] mr-3" />
              <h3 className="text-xl font-semibold text-[#040480]">Qualified Customers</h3>
            </div>
            <p className="text-gray-600">
              Access pre-qualified moving requests from customers actively looking for services.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <Truck className="w-8 h-8 text-[#84d21f] mr-3" />
              <h3 className="text-xl font-semibold text-[#040480]">Flexible Operations</h3>
            </div>
            <p className="text-gray-600">
              Choose your service areas and the types of moves you want to handle.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <Heart className="w-8 h-8 text-[#84d21f] mr-3" />
              <h3 className="text-xl font-semibold text-[#040480]">Dedicated Support</h3>
            </div>
            <p className="text-gray-600">
              Get personalized support and resources to help grow your business with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}