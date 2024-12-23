import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <Link to="/">
              <img 
                src="/lovable-uploads/b700dde9-463e-4b6e-8523-ec9f718b3beb.png" 
                alt="MAZ Moves" 
                className="h-16 transform hover:scale-105 transition-transform duration-200" 
              />
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[#040480] hover:text-[#1f3dd2] font-medium text-lg">Home</Link>
            <Link to="/services" className="text-[#040480] hover:text-[#1f3dd2] font-medium text-lg">Services</Link>
            <Link to="/about" className="text-[#040480] hover:text-[#1f3dd2] font-medium text-lg">About</Link>
            <Link to="/contact" className="text-[#040480] hover:text-[#1f3dd2] font-medium text-lg">Contact</Link>
          </div>
          <div>
            <Button className="bg-[#d2491f] hover:bg-[#84d21f] text-white border-none text-lg px-8 py-6 h-auto font-semibold">
              Work with us
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}