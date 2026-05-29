
## Goal

Produce `/mnt/documents/uk_movers_east_england.csv` with up to 500 moving companies across your 34 East-of-England towns, columns: `name, phone, website, email, location`.

## Approach

This is a one-off data-gathering task — no app changes. I'll use the **Firecrawl** connector (search + scrape) because it's the only realistic way to get verified phone/email straight from each company's own website.

### Steps

1. **Connect Firecrawl** (if not already linked to this project) so `FIRECRAWL_API_KEY` is available to a short Deno/Node script.
2. **For each of the 34 towns**, run a Firecrawl `search` for queries like `"removals company {town} UK"` and `"man and van {town}"` to collect ~20–25 candidate company sites per town.
3. **Deduplicate** by root domain so national chains don't dominate.
4. **Scrape each candidate site** (`/`, `/contact`, `/about`) with Firecrawl, extracting:
   - `name` → from `<title>` / OpenGraph / H1
   - `phone` → regex for UK formats (`+44`, `0xxxx`)
   - `email` → regex for `mailto:` and visible addresses (skip role addresses like `noreply@`)
   - `website` → final URL
   - `location` → the town the search came from
5. **Quality rules** (since you said 100% accuracy):
   - Drop any row where phone OR email can't be verified on the company's own site.
   - Drop directory/aggregator domains (yell.com, checkatrade.com, reallymoving.com, compareremovals.com, etc.).
   - Validate UK phone format; normalise to `+44`.
6. **Cap at 500 total**, distributed roughly evenly across towns (~15 per town, more for big cities like Milton Keynes/Norwich/Cambridge/Peterborough/Ipswich/Chelmsford if smaller towns run dry).
7. **Output** CSV to `/mnt/documents/` and surface it as a `<presentation-artifact>` for download. I'll also report the actual row count and per-town breakdown.

### Honest expectations

- Hitting **exactly 500 with all 4 fields verified** is unlikely. Many small movers don't publish an email — they use contact forms. Realistic deliverable: **300–500 rows**, with email present on ~60–70% of them. I will not invent or guess any value — blank beats wrong.
- Firecrawl credits: ~34 searches + ~600–900 scrapes. Make sure your Firecrawl plan has headroom (or has the managed `LOVABLE50` coupon room).

### Out of scope

No code changes to the customer app. This is purely a script run that writes a CSV artifact.

---

Approve this plan and I'll connect Firecrawl (if needed), run the script, and hand back the CSV.
