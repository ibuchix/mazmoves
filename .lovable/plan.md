## Plan: Install Google Ads tag (AW-18198179087) site-wide + conversion-ready submission

### 1. Add gtag to `index.html`
Insert the Google tag snippet inside `<head>` (loads on every route, including the 34 `/removals/:slug` pages and `/go/:code` redirects — they all use the same `index.html` shell in this SPA). Place it just after the TikTok pixel.

### 2. Update Content Security Policy in `index.html`
The current CSP only allows TikTok and Supabase. Extend it so Google Ads/Tag Manager isn't blocked:
- `script-src`: add `https://www.googletagmanager.com https://www.google-analytics.com`
- `img-src`: add `https://www.google.com https://www.google.co.uk https://www.googletagmanager.com https://www.google-analytics.com` (Google Ads fires 1×1 conversion pixels from these)
- `connect-src`: add `https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com`
- `frame-src`: add `https://td.doubleclick.net` (conversion linker iframe)

### 3. Create `src/utils/tracking/google-ads.ts`
Small typed helper with two functions:
- `gtagEvent(eventName, params)` — generic wrapper around `window.gtag` with a safety check.
- `trackAdsConversion(params: { sendTo: string; value?: number; currency?: string; transactionId?: string })` — fires `gtag('event', 'conversion', { send_to, value, currency: 'GBP', transaction_id })`.

Declare `window.gtag` and `window.dataLayer` in the file (or in `src/vite-env.d.ts`) so TypeScript is happy.

### 4. Wire the conversion into `src/hooks/use-submit-move-request.tsx`
After a successful insert (right next to the existing TikTok `trackEvent("SubmitForm", ...)` block), call `trackAdsConversion({ sendTo: GOOGLE_ADS_CONVERSION_ID, transactionId: moveRequestId, currency: "GBP" })`.

Store the `send_to` value as a single constant in `google-ads.ts`:
```ts
// Replace with the full AW-18198179087/XXXX label once provided
export const GOOGLE_ADS_CONVERSION_SEND_TO = "AW-18198179087/REPLACE_WITH_LABEL";
```
Until the real label is pasted, the conversion call is a no-op-safe placeholder (Google will simply not record a conversion for an unknown label). When you share the value, it's a one-line edit.

### 5. Verification
- DevTools → Network filter `googletagmanager.com` on `/`, `/removals/bedford`, `/go/...` — confirm `gtag/js?id=AW-18198179087` loads on each.
- Submit a test move request, confirm a `collect` / `conversion` request fires with the `send_to` parameter.
- Google Ads → Tag Assistant for live validation once the label is in.

### Notes
- All 34 location pages and the campaign redirect are part of the same SPA, so a single `<script>` in `index.html` covers them — no per-page wiring needed.
- The `<noscript>` fallback for Google Ads is intentionally omitted because CSP rules + our SPA's JS-required nature already preclude meaningful no-JS tracking, and we follow the project rule of not adding pixel `<noscript>` to `<head>`.
