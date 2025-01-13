import { Link } from "react-router-dom";

export default function FooterLogo() {
  return (
    <Link to="/">
      <img
        src="/lovable-uploads/707ca792-48a2-4427-9149-26c38ef7ecd3.png"
        alt="MAZ Moves"
        className="h-12 md:h-14 aspect-square object-contain bg-white p-2 rounded-lg w-fit mb-4 md:mb-6 hover:scale-105 transition-transform"
        loading="lazy"
      />
    </Link>
  );
}