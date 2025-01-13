import { Link } from "react-router-dom";

export default function FooterLogo() {
  return (
    <Link to="/">
      <img
        src="/lovable-uploads/b700dde9-463e-4b6e-8523-ec9f718b3beb.png"
        alt="MAZ Moves"
        className="h-16 md:h-20 bg-white p-2 rounded-lg w-fit mb-6 md:mb-8 hover:scale-105 transition-transform"
        loading="lazy"
      />
    </Link>
  );
}