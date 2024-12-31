import { Link } from "react-router-dom";
import { Facebook, Twitter, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#040480] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <img src="/lovable-uploads/b700dde9-463e-4b6e-8523-ec9f718b3beb.png" alt="MAZ Moves" className="h-10 bg-white p-2 rounded" />
            <p className="mt-2 text-sm">Professional moving services for homes and businesses.</p>
            <div className="flex space-x-4 mt-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#84d21f]">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#84d21f]">
                <Twitter size={20} />
              </a>
              <a href="https://wa.me/447388449110" target="_blank" rel="noopener noreferrer" className="hover:text-[#84d21f]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-[#84d21f]">Home</Link></li>
              <li><Link to="/services" className="hover:text-[#84d21f]">Services</Link></li>
              <li><Link to="/about" className="hover:text-[#84d21f]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#84d21f]">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="hover:text-[#84d21f]">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-[#84d21f]">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={16} />
                <a href="mailto:ask@mazmoves.com" className="hover:text-[#84d21f]">ask@mazmoves.com</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} />
                <a href="tel:+447388449110" className="hover:text-[#84d21f]">+44 738 844 9110</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} />
                <span>124 City Road, London, EC1V 2NX</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-6 pt-6 text-center text-sm">
          <p>&copy; 2025 MAZ Moves Ltd. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}