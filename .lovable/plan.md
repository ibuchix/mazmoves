## What I found

- The live site does have the base Google tag on every SPA route because `index.html` is shared across `/`, `/request-move`, `/removals/:slug`, and `/move-calculator`.
- The required conversion label `AW-18198179087/zqK-CKHAnL4cEI_ayOVD` is present in the published JavaScript bundle, but it only fires after a successful form submission.
- The Google instruction you pasted expects an **event snippet on the conversion page**. This app currently shows a success dialog on the same page, not a real thank-you/conversion page, so Google Tag Assistant may never see a dedicated conversion-page snippet.
- The current Google loader URL has extra parameters (`&l=dataLayer&cx=c`) compared with Google’s exact recommended snippet. It should be simplified to the official format.
- Cloudflare is present on the custom domain. If Google Tag Assistant still times out after the app-side fix, the remaining likely cause is Cloudflare/bot protection blocking Tag Assistant’s browser session.

## Plan

1. **Make the base Google tag match Google’s exact guidance**
   - In `index.html`, change the loader to exactly:
     `https://www.googletagmanager.com/gtag/js?id=AW-18198179087`
   - Keep:
     `gtag('js', new Date());`
     `gtag('config', 'AW-18198179087');`
   - Keep it in `<head>` so it is present on every route.

2. **Add a real conversion route for Google’s “conversion page” model**
   - Add a lightweight route such as `/move-request-success`.
   - This page will fire the Google Ads event snippet on page load:
     `gtag('event', 'conversion', { send_to: 'AW-18198179087/zqK-CKHAnL4cEI_ayOVD' })`
   - This directly matches Google’s instruction to install the event snippet on the page customers reach after converting.

3. **Redirect successful submissions to that conversion page**
   - For the main move-request wizard, after a successful request, show/route to the success page instead of relying only on a modal-based conversion event.
   - Pass the submitted request ID as the transaction ID where available, so repeated test submissions are easier to distinguish.

4. **Keep existing conversion tracking as a backup where appropriate**
   - Keep the current `trackAdsConversion(...)` helper, but ensure the new success page is the primary Google Ads conversion signal.
   - For the Move Calculator booking dialog, either route to the same success page after successful booking or call the same shared conversion helper from its success state.

5. **Improve diagnostics without changing the site design**
   - Add safe console diagnostics only when `gtag` is unavailable or when the conversion event is sent.
   - No visual design changes.

6. **Verify before handing back**
   - Check that the live/published HTML includes the exact Google tag.
   - Check that all key routes still share the tag.
   - Check that the success route contains/fires the conversion event.
   - After you publish, re-test in Google Tag Assistant on `https://housemove.co/`, then submit a test lead and confirm the `House Move Lead` conversion event appears.

## Important note

If this still times out after the above changes and republishing, the app code will likely no longer be the issue; the next place to check is Cloudflare/security settings for `housemove.co`, because Tag Assistant must be able to open and inspect the site without being challenged or blocked.