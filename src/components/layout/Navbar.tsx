// Navbar.tsx - Persistent top navigation across all pages.
// Off-white background, brand logo on the left, Home/Contact links and an orange
// "Start Your Move" CTA on the right. Mobile view collapses links into a Sheet.

import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/contact", label: "Contact", end: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-montserrat font-semibold transition-colors ${
      isActive
        ? "text-brand-slate"
        : "text-brand-slateLight hover:text-brand-slate"
    }`;

  return (
    <header className="relative z-40 w-full bg-transparent border-b border-brand-slate/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Logo size="lg" withText={false} linkToHome />

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
          <Button
            asChild
            size="sm"
            className="bg-brand-orange hover:bg-brand-orange/90 text-white font-montserrat font-semibold text-xs shadow-sm"
          >
            <Link to="/request-move?step=1">Start Your Move</Link>
          </Button>
        </nav>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-6 w-6 text-brand-slate" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background w-64">
              <nav className="flex flex-col gap-6 mt-8">
                {navLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    onClick={() => setOpen(false)}
                    className={linkClass}
                  >
                    {l.label}
                  </NavLink>
                ))}
                <Button
                  asChild
                  className="bg-brand-orange hover:bg-brand-orange/90 text-white font-montserrat font-semibold"
                  onClick={() => setOpen(false)}
                >
                  <Link to="/request-move?step=1">Start Your Move</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
