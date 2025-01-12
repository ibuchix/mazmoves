import { Link } from "react-router-dom";
import { MapPin, Mail, Phone, Facebook, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#040480] text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Logo and Description */}
          <div className="flex flex-col items-start space-y-2">
            <img 
              src="/lovable-uploads/b700dde9-463e-4b6e-8523-ec9f718b3beb.png" 
              alt="MAZ Moves" 
              className="h-6 bg-white p-1 rounded" 
            />
            <p className="text-sm text-gray-300">
              Professional moving services for homes and businesses.
            </p>
            <div className="flex items-center space-x-3 mt-2">
              <a 
                href="https://wa.me/447388449110" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
              </a>
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-300 hover:text-[#84d21f] transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="flex flex-col items-start space-y-1">
            <h3 className="text-xs font-medium mb-1 text-gray-300">Quick Links</h3>
            <div className="flex flex-col space-y-1">
              <Link to="/" className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors">
                Home
              </Link>
              <Link to="/services" className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors">
                Services
              </Link>
              <Link to="/about" className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors">
                About Us
              </Link>
              <Link to="/companies" className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors">
                Partner With Us
              </Link>
            </div>
          </div>
          
          {/* Legal */}
          <div className="flex flex-col items-start space-y-1">
            <h3 className="text-xs font-medium mb-1 text-gray-300">Legal</h3>
            <div className="flex flex-col space-y-1">
              <Link to="/terms-and-conditions" className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors">
                Terms & Conditions
              </Link>
              <Link to="/privacy-policy" className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
          
          {/* Contact */}
          <div className="flex flex-col items-start space-y-1">
            <h3 className="text-xs font-medium mb-1 text-gray-300">Contact Us</h3>
            <div className="flex flex-col space-y-1">
              <a 
                href="mailto:ask@mazmoves.com" 
                className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors flex items-center"
              >
                <Mail className="w-3 h-3 mr-1.5" />
                ask@mazmoves.com
              </a>
              <a 
                href="tel:+447388449110" 
                className="text-sm text-gray-300 hover:text-[#84d21f] transition-colors flex items-center"
              >
                <Phone className="w-3 h-3 mr-1.5" />
                +44 738 844 9110
              </a>
              <div className="flex items-start text-sm text-gray-300">
                <MapPin className="w-3 h-3 mr-1.5 mt-0.5" />
                <span>124 City Road, London, EC1V 2NX</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-white/5 mt-4 pt-3">
          <p className="text-xs text-center text-gray-400">
            &copy; {new Date().getFullYear()} MAZ Moves Ltd. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}