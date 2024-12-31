import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Companies() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#040480] mb-8">Join MAZ Moves as a Moving Company</h1>
        
        <div className="space-y-8 mb-12">
          <section className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-[#1f3dd2] mb-4">Why Partner with MAZ Moves?</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[#84d21f]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#040480]">Increased Visibility</h3>
                    <p className="text-gray-600">Get discovered by customers actively looking for moving services in your area.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[#84d21f]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#040480]">Steady Flow of Leads</h3>
                    <p className="text-gray-600">Access a constant stream of moving requests from verified customers.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[#84d21f]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#040480]">Simple Management</h3>
                    <p className="text-gray-600">Easy-to-use dashboard to manage bookings and update your availability.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[#84d21f]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#040480]">Professional Platform</h3>
                    <p className="text-gray-600">Showcase your services on a trusted, professional moving platform.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[#84d21f]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#040480]">Flexible Operations</h3>
                    <p className="text-gray-600">Choose your service areas and manage your availability with ease.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-[#84d21f]">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#040480]">Growth Opportunities</h3>
                    <p className="text-gray-600">Expand your business reach and build a strong online presence.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-r from-[#040480] to-[#1f3dd2] rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-2xl font-semibold mb-4">Ready to Grow Your Moving Business?</h2>
            <p className="mb-6">Join our network of professional moving companies and start receiving quality leads today.</p>
            <Button 
              onClick={() => navigate('/company/register')}
              className="bg-[#d2491f] hover:bg-[#84d21f] text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors duration-200"
            >
              Register Your Company
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}