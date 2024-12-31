import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/">
              <img 
                src="/lovable-uploads/b700dde9-463e-4b6e-8523-ec9f718b3beb.png" 
                alt="MAZ Moves" 
                className="h-14 transform hover:scale-105 transition-transform duration-200" 
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[#040480] hover:text-[#1f3dd2] font-medium">Home</Link>
            <Link to="/services" className="text-[#040480] hover:text-[#1f3dd2] font-medium">Services</Link>
            <Link to="/about" className="text-[#040480] hover:text-[#1f3dd2] font-medium">About</Link>
            <Link to="/contact" className="text-[#040480] hover:text-[#1f3dd2] font-medium">Contact</Link>
          </div>

          <div className="hidden md:block">
            <Button className="bg-[#d2491f] hover:bg-[#84d21f] text-white px-4 py-1 h-8 text-sm font-medium">
              Work with us
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-[#040480] hover:text-[#1f3dd2] p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                className="block px-3 py-2 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/services" 
                className="block px-3 py-2 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Services
              </Link>
              <Link 
                to="/about" 
                className="block px-3 py-2 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                to="/contact" 
                className="block px-3 py-2 rounded-md text-[#040480] hover:text-[#1f3dd2] hover:bg-gray-50 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="mt-4">
                <Button className="w-full bg-[#d2491f] hover:bg-[#84d21f] text-white px-4 py-1 h-8 text-sm font-medium">
                  Work with us
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}