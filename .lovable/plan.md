## Plan

1. **Remove the inherited app shell constraint causing the narrow phone layout**
   - Update the global `#root` styling so the app is not capped, padded, or center-aligned by the old Vite default styles.
   - This should let the homepage and town-page heroes use the real phone viewport width instead of being squeezed inside an extra 32px root padding on each side.

2. **Tighten the mobile-only hero spacing for iPhone 11 Pro and smaller**
   - Adjust `HeroSection.tsx` and `TownHero.tsx` only below the `sm` breakpoint.
   - Reduce duplicated horizontal padding between the section, slate panel, and inner content so the form sits cleanly inside the slate background.
   - Keep existing `sm:`, `md:`, `lg:` spacing intact so iPhone 16 Pro, iPads, and desktop are not disturbed.

3. **Make the form/details content shrink safely on narrow phones**
   - Add `min-w-0`/responsive wrapping where needed around the hero grid, form card, and headline/details text.
   - Ensure the “Start Your Move” form and the “Get Instant Quotes…” details cannot overflow horizontally at 375px and 360px widths.

4. **Validate against key device widths**
   - Check homepage at `375x812` for iPhone 11 Pro, plus `390x844` / `414x896` for newer iPhones.
   - Confirm there is no horizontal overflow and the form/details remain visible.
   - Spot-check a town page hero because it reuses the same form pattern.

## Technical note

Using `useIsMobile` everywhere would not solve this. The issue is layout width/padding, so the correct fix is CSS/Tailwind responsive constraints. The hook should remain only for DOM-order changes, while spacing and overflow should be handled by mobile-first CSS.