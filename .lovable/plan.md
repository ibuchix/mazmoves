## Goal
Add a persistent navbar (off-white background, with logo) and a thin slate grey footer to every page, including all steps of the move-request form.

## Changes

### 1. Replace logo asset
- Overwrite `src/assets/housemove-logo.png` with the uploaded illustration (mover carrying house). The existing `Logo` component already imports from this path, so it updates everywhere automatically.

### 2. Create `src/components/layout/Navbar.tsx`
- Sticky top bar (`sticky top-0 z-40`), background `bg-background` (off-white) with subtle bottom border.
- Left: `<Logo size="sm" withText />` linking to `/`.
- Right (desktop): "Home" and "Contact" links (text `text-brand-slate`, hover `text-brand-slateLight`), plus an orange CTA button "Start Your Move" → `/request-move?step=1` using `bg-brand-orange hover:bg-brand-orange/90 text-white`.
- Mobile (`<md`): hamburger icon opens a Sheet/dropdown with the same links + CTA.
- Active route highlighted via `NavLink`.

### 3. Create `src/components/layout/Footer.tsx`
- Thin bar (`py-3`), `bg-brand-slate text-white text-sm`.
- Single row, responsive: left side `© {year} HouseMove`, right side links: Privacy Policy (`/privacy-policy`), Terms & Conditions (`/terms-and-conditions`), Contact (`/contact`). Stacks on mobile.
- No logo (per request).

### 4. Wire into `src/components/layout/MainLayout.tsx`
- Render `<Navbar />` above `<main>` and `<Footer />` below it, keeping the existing `flex flex-col min-h-screen` so the footer sits at the bottom on short pages.
- Since `MainLayout` already wraps every route in `App.tsx`, this automatically covers the homepage, Contact, Privacy, Terms, and every step of the move-request form.

### 5. Remove now-redundant Home button in form
- `src/components/move-request/FormNavigation.tsx` step 1 currently shows a "Home" button as the back affordance. Since the navbar provides Home navigation, replace it with a disabled "Previous" button (consistent with later steps) — keeps layout stable without duplicating navigation.

## Files
- Replace: `src/assets/housemove-logo.png`
- Create: `src/components/layout/Navbar.tsx`, `src/components/layout/Footer.tsx`
- Edit: `src/components/layout/MainLayout.tsx`, `src/components/move-request/FormNavigation.tsx`

## Notes
- All colors use existing brand tokens (`brand-slate`, `brand-slateLight`, `brand-orange`, `background`) — no hardcoded hex.
- Navbar is sticky so it stays visible while scrolling; footer is non-sticky and sits naturally at page bottom.
