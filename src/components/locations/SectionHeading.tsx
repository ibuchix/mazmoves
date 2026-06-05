// SectionHeading.tsx - Consistent eyebrow + h2 + optional lede heading for town page sections.
// Eyebrow uses brand-green uppercase tracking-wide; h2 uses brand-slate Montserrat.
// On dark sections, pass tone="dark" to flip h2 + lede to white.
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  lede?: string;
  tone?: "default" | "dark";
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "default",
  align = "left",
  className,
}: SectionHeadingProps) {
  const titleColor = tone === "dark" ? "text-white" : "text-brand-slate";
  const ledeColor = tone === "dark" ? "text-white/80" : "text-gray-700";
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={cn("mb-8 max-w-3xl", alignClass, className)}>
      {eyebrow && (
        <p className="text-brand-green font-montserrat font-semibold tracking-[0.15em] text-xs uppercase mb-3">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-3xl md:text-4xl font-bold font-montserrat leading-tight",
          titleColor,
        )}
      >
        {title}
      </h2>
      {lede && (
        <p className={cn("mt-4 text-base md:text-lg font-roboto leading-relaxed", ledeColor)}>
          {lede}
        </p>
      )}
    </div>
  );
}
