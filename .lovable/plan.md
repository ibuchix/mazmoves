## HouseMove Redesign Plan

### 1. Create reusable Logo component

- Copy uploaded logo from `user-uploads://housemove_logo.png` to `src/assets/housemove-logo.png`.
- Create `src/components/Logo.tsx` — a single reusable component:
  - Props: `size` (`sm` | `md` | `lg` | `xl`), `withText` (boolean, default true), `className`.
  - Imports the asset via ES6 (`import logo from "@/assets/housemove-logo.png"`).
  - Renders the image plus the brand text "HouseMove" (using Montserrat / brand navy `#040480`) when `withText` is true.
  - Wraps in a `Link to="/"` optionally via a `linkToHome` prop (default true).

### 2. Remove Navbar and Footer

- Edit `src/components/layout/MainLayout.tsx`:
  - Remove `<Navbar />`, the spacer `<div className="h-4" />`, and `<Footer />` and their imports.
  - Keep `CookieConsent` and `Toaster`.
- Delete the now-unused files:
  - `src/components/Navbar.tsx`
  - `src/components/Footer.tsx`
  - Entire `src/components/navbar/` folder (`AuthButton.tsx`, `MobileMenu.tsx`, `RoleLinks.tsx`).
  - Entire `src/components/footer/` folder (`BackToTop.tsx`, `ContactInfo.tsx`, `CookiePreferences.tsx`, `FooterLogo.tsx`, `LanguageSelector.tsx`, `LegalLinks.tsx`, `MobileCollapsibleSection.tsx`, `QuickLinks.tsx`, `SocialLinks.tsx`).

### 3. Remove all "MAZ Moves" references and rebrand to "HouseMove"

Replace text in:
- `index.html` — title, meta description, author, OG tags, twitter, canonical → "HouseMove". Update favicon/OG image path to the new logo (place a copy in `public/housemove-logo.png` for meta tags).
- `src/pages/Companies.tsx` — "MAZ Moves" → "HouseMove" (lines 14, 106).
- `src/pages/Contact.tsx` — `info@mazmoves.com` → `info@housemove.com`.
- `src/pages/PrivacyPolicy.tsx` — `ask@mazmoves.com` → `ask@housemove.com`.
- `src/pages/TermsAndConditions.tsx` — "MAZ Moves Ltd" → "HouseMove Ltd" (lines 12, 20).
- `src/pages/auth/Login.tsx` — `support@mazmoves.com` → `support@housemove.com`.
- `src/pages/company/Register.tsx` — "Join MAZ Moves Today" → "Join HouseMove Today".

### 4. Where the new Logo component is used

Since the navbar and footer are being removed, the brand logo no longer appears in the global chrome. The new `Logo` component is created for reuse on pages that need branding (e.g. auth pages, register page, hero section if desired later). It will not be inserted into MainLayout — leaving placement decisions for follow-up requests.

### Files touched

Created: `src/assets/housemove-logo.png`, `public/housemove-logo.png`, `src/components/Logo.tsx`
Edited: `index.html`, `src/components/layout/MainLayout.tsx`, `src/pages/Companies.tsx`, `src/pages/Contact.tsx`, `src/pages/PrivacyPolicy.tsx`, `src/pages/TermsAndConditions.tsx`, `src/pages/auth/Login.tsx`, `src/pages/company/Register.tsx`
Deleted: `src/components/Navbar.tsx`, `src/components/Footer.tsx`, all of `src/components/navbar/`, all of `src/components/footer/`

### Out of scope (not changing)

- No design/color changes elsewhere.
- No changes to backend, database, edge functions, or auth flows.
- The previous security migration is still pending separately and unaffected.
