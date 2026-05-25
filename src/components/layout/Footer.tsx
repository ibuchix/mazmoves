// Footer.tsx - Thin persistent footer across all pages.
// Slate grey background with copyright on the left and legal links on the right.
// Intentionally compact — no logo, single row on desktop.
// "For AI agents" link removed — /agents route still exists for agent discovery
// via /.well-known/ai-plugin.json, but is no longer surfaced in human navigation.

import { Link } from "react-router-dom";

export function Footer() {
  const year = new Date().getFullYear();
  const links = [
    { to: "/removals", label: "Locations" },
    { to: "/privacy-policy", label: "Privacy Policy" },
    { to: "/terms-and-conditions", label: "Terms & Conditions" },
    { to: "/contact", label: "Contact" },
  ];


  return (
    <footer className="w-full bg-brand-slate text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm font-roboto">
        <p>© {year} HouseMove. All rights reserved.</p>
        <nav className="flex items-center gap-4">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="hover:text-brand-green transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
