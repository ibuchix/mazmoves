import { Link } from "react-router-dom";

export default function FooterLogo() {
  return (
    <Link to="/">
      <img
        src="/lovable-uploads/b700dde9-463e-4b6e-8523-ec9f718b3beb.png"
        alt="MAZ Moves"
        className="h-12 md:h-14 aspect-square object-contain bg-white p-2 rounded-lg w-fit mb-4 md:mb-6 hover:scale-105 transition-transform"
        loading="lazy"
      />
    </Link>
  );
}