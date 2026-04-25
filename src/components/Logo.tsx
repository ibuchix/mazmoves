// Logo.tsx - Reusable HouseMove logo component
// Created: Renders the new HouseMove logo image with optional brand text.
// Props: size, withText, linkToHome, className for flexible reuse across the app.

import { Link } from "react-router-dom";
import logo from "@/assets/housemove-logo.png";

type LogoSize = "sm" | "md" | "lg" | "xl";

interface LogoProps {
  size?: LogoSize;
  withText?: boolean;
  linkToHome?: boolean;
  className?: string;
}

const sizeMap: Record<LogoSize, { img: string; text: string }> = {
  sm: { img: "h-8 w-8", text: "text-lg" },
  md: { img: "h-12 w-12", text: "text-2xl" },
  lg: { img: "h-16 w-16", text: "text-3xl" },
  xl: { img: "h-24 w-24", text: "text-4xl" },
};

export default function Logo({
  size = "md",
  withText = true,
  linkToHome = true,
  className = "",
}: LogoProps) {
  const sizes = sizeMap[size];

  const content = (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src={logo}
        alt="HouseMove logo"
        className={`${sizes.img} object-contain`}
        loading="eager"
      />
      {withText && (
        <span
          className={`${sizes.text} font-bold tracking-tight text-[#040480]`}
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          HouseMove
        </span>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" aria-label="HouseMove home" className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}
