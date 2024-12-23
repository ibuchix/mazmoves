import { Card, CardContent } from "@/components/ui/card";

export const HowItWorksSection = () => {
  const steps = [
    {
      step: "1",
      title: "Request a Quote",
      description: "Fill out our simple form with your moving details",
      icon: (
        <svg className="w-12 h-12 text-[#d2491f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
      )
    },
    {
      step: "2",
      title: "Compare Movers",
      description: "Review quotes from verified moving companies",
      icon: (
        <svg className="w-12 h-12 text-[#84d21f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      )
    },
    {
      step: "3",
      title: "Book Your Move",
      description: "Select your preferred mover and schedule the date",
      icon: (
        <svg className="w-12 h-12 text-[#1f3dd2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      step: "4",
      title: "Move with Confidence",
      description: "Enjoy a smooth, professional moving experience",
      icon: (
        <svg className="w-12 h-12 text-[#d2491f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      )
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-[#040480]/5 to-[#1f3dd2]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-[#040480] mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <Card key={index} className="flex flex-col items-center text-center p-6 hover:shadow-md transition-shadow">
              <CardContent className="flex flex-col items-center pt-6">
                <div className="mb-4">{item.icon}</div>
                <div className="w-8 h-8 mb-4 flex items-center justify-center bg-[#040480] text-white rounded-full">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-[#040480] mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};