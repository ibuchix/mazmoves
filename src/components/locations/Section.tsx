// Section.tsx - Standardised section wrapper for town pages.
// Provides consistent vertical rhythm, max-width, and tone (default vs muted background).
// Use this around every block in TownRemovals so spacing reads as a single, polished layout.
import { cn } from "@/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  tone?: "default" | "muted" | "dark";
  className?: string;
  innerClassName?: string;
  id?: string;
  as?: "section" | "div";
}

export function Section({
  children,
  tone = "default",
  className,
  innerClassName,
  id,
  as: Tag = "section",
}: SectionProps) {
  const toneClass =
    tone === "muted"
      ? "bg-gray-50/70"
      : tone === "dark"
        ? "bg-brand-slate text-white"
        : "bg-white";
  return (
    <Tag id={id} className={cn("py-14 md:py-20 px-4 sm:px-6 lg:px-8", toneClass, className)}>
      <div className={cn("max-w-5xl mx-auto", innerClassName)}>{children}</div>
    </Tag>
  );
}
