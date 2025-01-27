export const HeroContent = () => {
  return (
    <div className="text-white flex flex-col justify-center space-y-4 md:space-y-8 md:pl-8">
      <p className="text-lg md:text-2xl text-gray-100 font-light">
        Get instant quotes from trusted movers. Free to use, no obligations.
      </p>
      <div className="space-y-3 md:space-y-6">
        <div className="flex items-start space-x-3 md:space-x-4 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-lg">
          <svg className="w-5 h-5 md:w-8 md:h-8 text-[#84d21f] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="text-base md:text-xl leading-tight">Verified Professional Movers</span>
        </div>
        <div className="flex items-start space-x-3 md:space-x-4 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-lg">
          <svg className="w-5 h-5 md:w-8 md:h-8 text-[#84d21f] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="text-base md:text-xl leading-tight">Compare Multiple Quotes</span>
        </div>
        <div className="flex items-start space-x-3 md:space-x-4 bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-lg">
          <svg className="w-5 h-5 md:w-8 md:h-8 text-[#84d21f] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span className="text-base md:text-xl leading-tight">100% Free Service</span>
        </div>
      </div>
    </div>
  );
};