## What I checked

- The published `housemove.co` HTML does contain the Google Ads base tag:
  - `https://www.googletagmanager.com/gtag/js?id=AW-18198179087`
  - `gtag('config', 'AW-18198179087')`
- It is present on the homepage, `www` domain, a location page, and `/move-calculator` because this is a single-page Vite app and all routes share `index.html`.
- Successful move-request submissions already call the new conversion action `AW-18198179087/zqK-CKHAnL4cEI_ayOVD`.
- Move Calculator bookings also call the same conversion action.

## Likely issue

Google Tag Assistant is not connecting to the page even though the tag is in the HTML. The most likely remaining blocker is the current Content Security Policy. It uses a restrictive `frame-ancestors` rule and does not include every Google debug/measurement endpoint Tag Assistant commonly uses. Because `frame-ancestors` controls who may embed/debug the page, a `<meta http-equiv="Content-Security-Policy">` is also not the best place for that directive.

## Plan

1. **Make the Google tag easier for Google to detect**
   - Keep the Google Ads base tag in `index.html`.
   - Add the standard compatibility form using `https://www.googletagmanager.com/gtag/js?id=AW-18198179087&l=dataLayer&cx=c`.
   - Keep the existing `gtag('config', 'AW-18198179087')` initialization.

2. **Fix the CSP for Google Ads and Tag Assistant**
   - Update the `Content-Security-Policy` meta tag to allow the common Google Ads / Tag Assistant endpoints:
     - `googletagmanager.com`
     - `googleadservices.com`
     - `google.com`
     - `google.co.uk`
     - `doubleclick.net`
     - `g.doubleclick.net`
     - `stats.g.doubleclick.net`
     - `tagassistant.google.com`
   - Remove `frame-ancestors` from the meta CSP because browsers ignore or inconsistently apply it from meta tags; it should be an HTTP header, not a meta directive.

3. **Add a diagnostic-only Google Ads ping helper**
   - Update the Google Ads tracking wrapper so conversion calls log a clear console warning if `window.gtag` is not available.
   - Keep tracking non-blocking so a failed ad script never breaks form submission.

4. **Confirm all intended submission paths are covered**
   - Standard move request flow: homepage hero, `/request-move`, and all 34 town/location pages route through `useSubmitMoveRequest`, so they fire conversion after successful submission.
   - Move Calculator flow: `BookEstimateDialog` fires conversion after successful booking.

5. **After implementation**
   - Re-check the published/preview HTML contains the updated tag and CSP.
   - You will need to publish again, then retry Tag Assistant. If it still times out after this, the remaining cause is likely outside app code, such as Cloudflare/Bot protection/challenge behavior blocking Google’s debugger session.