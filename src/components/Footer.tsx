import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#040480] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img src="/lovable-uploads/b700dde9-463e-4b6e-8523-ec9f718b3beb.png" alt="MAZ Moves" className="h-12 bg-white p-2 rounded" />
            <p className="mt-4 text-sm">Professional moving services for homes and businesses.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-[#84d21f]">Home</Link></li>
              <li><Link to="/services" className="hover:text-[#84d21f]">Services</Link></li>
              <li><Link to="/about" className="hover:text-[#84d21f]">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#84d21f]">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><Link to="/services/residential" className="hover:text-[#84d21f]">Residential Moving</Link></li>
              <li><Link to="/services/commercial" className="hover:text-[#84d21f]">Commercial Moving</Link></li>
              <li><Link to="/services/packing" className="hover:text-[#84d21f]">Packing Services</Link></li>
              <li><Link to="/services/storage" className="hover:text-[#84d21f]">Storage Solutions</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li>Email: info@mazmoves.com</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 Moving Street</li>
              <li>City, State 12345</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} MAZ Moves. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}