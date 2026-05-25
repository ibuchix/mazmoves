## On the URL structure (`/removals/[slug]`)

Short answer: **yes, this structure is correct and is what ranks**. It's the same pattern Compare My Move, Reallymoving, AnyVan and Shiply use for their location pages. Google reads `/removals/cambridge` as a clean, hierarchical service-in-location URL — it groups the 34 pages under a single topical hub (`/removals`), which strengthens internal link equity and gives the hub itself a shot at ranking for broader terms like "house removals east of england".

What actually decides whether we rank is not the URL — it's:
1. Per-page content depth and uniqueness (already done — 500-word intros, unique FAQs, varied section blocks).
2. Internal linking (hub → towns, town → nearby towns — already done).
3. The sitemap entries (already done).
4. Backlinks over time (nothing the code can fix).

Slug structure is a solved problem here. I'd leave it as-is.

## Content edits across all 34 town pages + hub

Four passes over `src/data/locations.ts`, `src/pages/Removals.tsx`, `src/pages/TownRemovals.tsx`, and the components under `src/components/locations/`:

### 1. Remove every em-dash (—)

Every `—` character gets replaced with a natural alternative depending on context:
- Mid-sentence parenthetical → comma or full stop ("Yes, late June is the busiest week").
- List joins → comma or "and" ("price, reviews, or availability").
- Range hyphens stay as regular hyphens (already `-`, not affected).

Applies to: intros, worked examples, pricing notes, FAQ answers, variant copy, trust points, hub copy, page titles ("Man and Van in {Town} | Free Quotes…" instead of " — "), and the breadcrumb-area copy.

No em-dashes left anywhere in the public-facing town content.

### 2. Mix "verified" and "vetted" across pages

Currently every page says "vetted". I'll alternate roughly 50/50 based on town, so the corpus reads less templated:
- "Verified" towns (example split): Cambridge, Milton Keynes, Norwich, Ipswich, Colchester, Chelmsford, Southend-on-Sea, Luton, Bedford, Peterborough, Brentwood, Basildon, Harlow, Bury St Edmunds, Felixstowe, King's Lynn, Leighton Buzzard.
- "Vetted" towns: St Neots, Wisbech, Huntingdon, Ely, St Ives, Great Yarmouth, Thetford, Wymondham, Dereham, Attleborough, Lowestoft, Haverhill, Newmarket, Stowmarket, Braintree, Dunstable, Ampthill.

Hub page (`/removals`) uses "verified". The `TownHero` component already says "vetted" — I'll make it accept a `trustWord: "verified" | "vetted"` prop so each town renders its assigned word in the H1 supporting line, bullets, meta description, and intro.

### 3. Add insurance messaging

Add a single short line to every town page's trust points (and the hub's intro paragraph):

> "All movers in our network carry public liability and goods-in-transit insurance, so your property is protected throughout the move."

Each town keeps its existing 3-4 trust points and gains this one as a standard fifth point. The hub page gets a single matching sentence in its intro paragraph. No new component — uses the existing `TrustPoints` list and the existing hub intro paragraph.

### 4. Soften "flag at quote stage" / "flag when quoting" phrasing

Every variant of "flag this when quoting", "mention when requesting quotes", "flag in your request" gets rewritten to sound human:

> "Let the moving company know when you're discussing your quote, so they can plan the right van size and crew."

Or shorter variants depending on the FAQ context, e.g.:
> "Just mention it to the moving company while you're discussing the quote."

Same meaning, friendlier tone, no instructional "flag" verb.

## Files touched

- `src/data/locations.ts` — all 34 records: rewrite intros, worked examples, pricing notes, FAQ answers, variant copy. Add insurance trust point. Replace em-dashes. Apply verified/vetted assignment via a new optional `trustWord` field on each record (defaults to "vetted" if unset, but every record gets one explicitly).
- `src/components/locations/TownHero.tsx` — accept and render `trustWord` in the bullets and supporting line.
- `src/components/locations/TrustPoints.tsx` — unchanged structurally; just rendering the now-5-point list.
- `src/pages/TownRemovals.tsx` — pass `trustWord` through to `TownHero`; clean em-dashes from the title template ("House Removals in {Town} | Free Quotes from {Word} Movers | HouseMove").
- `src/pages/Removals.tsx` — em-dash sweep, insurance line in intro, "verified" wording.

## What I will NOT change

- URL structure, route config, sitemap entries.
- DB, move-request form, submission flow.
- Design tokens, layout, components' visual structure.
- The 34-town list, slugs, or county groupings.

Approve and I'll run the edits.