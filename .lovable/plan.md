## Findings

- A dedicated mobile hook already exists: `src/hooks/use-mobile.tsx` exports `useIsMobile()` (breakpoint 768px). No new hook needed.
- In `src/components/home/hero/HeroSection.tsx`, the two columns currently use Tailwind `order-1` / `order-2` with `md:` overrides. On mobile this places the written content (HeroContent) on top and the move request box (HeroForm) below — the opposite of what's wanted.

## Plan

1. Import `useIsMobile` into `src/components/home/hero/HeroSection.tsx`.
2. Use the hook to determine mobile vs. desktop layout.
3. On mobile (vertical phone screens, <768px): render HeroForm first, HeroContent second.
4. On tablet/desktop (≥768px): keep the current layout exactly as-is — HeroForm on the left, HeroContent on the right, with the same alignment behaviour we just fixed.

No changes to HeroForm or HeroContent themselves. The move request box stays untouched — only the column order changes responsively.

## Files to edit

- `src/components/home/hero/HeroSection.tsx` — wire up `useIsMobile` and conditionally swap the two columns' order on mobile only.
