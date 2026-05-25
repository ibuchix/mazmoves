// locations.ts - Data for 34 town landing pages under /removals/[slug].
// Each town carries unique copy, FAQs, common routes, price hooks, and a
// list of variant section blocks so pages render differently across the set
// (anti-doorway / anti-thin-content signal).

export type VariantBlock =
  | "coastal"
  | "commuter"
  | "student"
  | "historic"
  | "rural"
  | "city";

export interface PriceRoute {
  to: string;
  oneBedBand: string; // e.g. "£420-£580"
  notes?: string;
}

export interface TownFaq {
  q: string;
  a: string;
}

export interface Location {
  slug: string;
  name: string;
  county: string;
  region: string;
  population?: string;
  titleVariant: "removals" | "manAndVan";
  metaDescription: string;
  intro: string; // 60-90 words
  workedExample: string; // pricing worked example, town-specific
  pricingNote: string; // additional town-specific pricing nuance
  commonRoutes: PriceRoute[];
  trustPoints: string[]; // 3-4 town-flavoured points
  faqs: TownFaq[]; // 4-6 unique
  sections: VariantBlock[];
  nearby: string[]; // slugs
  // Variant block copy (only used if listed in sections)
  variantCopy?: Partial<Record<VariantBlock, string>>;
}

const baseTrust = (town: string) => [
  `Vetted removal companies covering ${town} and surrounding postcodes.`,
  "Multiple quotes side by side — pick on price, reviews, or availability.",
  "Free to use for customers. You pay the mover you choose, not us.",
  "No obligation: ignore quotes you don't like, no chasing calls.",
];

export const locations: Location[] = [
  // ===================== BUCKINGHAMSHIRE =====================
  {
    slug: "milton-keynes",
    name: "Milton Keynes",
    county: "Buckinghamshire",
    region: "Home Counties",
    population: "~290,000",
    titleVariant: "removals",
    metaDescription:
      "Free, no-obligation removal quotes from vetted Milton Keynes movers. Compare prices for house moves, flat moves and man and van across MK postcodes.",
    intro:
      "Milton Keynes is one of the fastest-growing cities in the UK and one of the busiest local moving markets. Between new-build estates in Brooklands and Western Expansion, conversions in Central Milton Keynes, and steady commuter turnover to London Euston, removal companies here see everything from studio flats to four-bed family moves. HouseMove connects you with vetted movers across all MK postcodes so you can compare quotes without picking up the phone.",
    workedExample:
      "A 2-bed flat move within Milton Keynes typically lands around £380-£560 with a small crew and a Luton van. A 3-bed house from MK to north London usually runs £750-£1,150 depending on access at both ends and whether packing is included. Add a piano or large gym equipment and expect £150-£300 on top.",
    pricingNote:
      "Final pricing depends on volume, item intricacy (pianos, safes, antiques), mileage, parking distance at both properties, stairs or lift access, and whether you book midweek or weekend.",
    commonRoutes: [
      { to: "London (N/NW)", oneBedBand: "£520-£780", notes: "M1 corridor, 60-70 min run" },
      { to: "Bedford", oneBedBand: "£320-£480" },
      { to: "Northampton", oneBedBand: "£340-£500" },
      { to: "Luton", oneBedBand: "£330-£470" },
      { to: "Leighton Buzzard", oneBedBand: "£260-£380" },
    ],
    trustPoints: baseTrust("Milton Keynes"),
    faqs: [
      {
        q: "How do movers handle the Milton Keynes grid road system with larger vans?",
        a: "Most local crews know the grid roads and roundabouts well — the bigger consideration is access on the residential 'V' and 'H' street estates, where some closes are tight for 7.5-tonne vehicles. If you're on a narrow close, mention it when requesting quotes so movers can plan vehicle size.",
      },
      {
        q: "Do you cover Central Milton Keynes apartment blocks with lift restrictions?",
        a: "Yes. Several Central MK blocks have booked lift slots or service-lift-only rules. Flag your block name when you request a quote so the mover can confirm time windows and any porter requirements.",
      },
      {
        q: "Can I book a Saturday move in MK without paying a big premium?",
        a: "Saturdays are the busiest day for local removals, so weekend rates are typically 10-20% higher. Booking 2-3 weeks ahead usually keeps the premium small.",
      },
      {
        q: "How quickly will I get quotes after submitting?",
        a: "Most customers receive 3-5 quotes from MK-based movers within 24 hours.",
      },
    ],
    sections: ["city", "commuter"],
    nearby: ["bedford", "luton", "leighton-buzzard", "dunstable"],
    variantCopy: {
      city:
        "Milton Keynes mixes high-rise apartment moves in Central MK with sprawling family moves in Shenley, Westcroft and Tattenhoe. Movers here are used to both ends of the spectrum on the same day.",
      commuter:
        "MK to London is one of the most common routes in our network — typically a 60-70 minute drive up the M1, with movers often able to do same-day completions if both properties are ready by mid-morning.",
    },
  },

  // ===================== CAMBRIDGESHIRE =====================
  {
    slug: "peterborough",
    name: "Peterborough",
    county: "Cambridgeshire",
    region: "East of England",
    population: "~215,000",
    titleVariant: "removals",
    metaDescription:
      "Compare free quotes from vetted Peterborough removal companies. House, flat and man and van services across PE postcodes — no obligation, no chasing calls.",
    intro:
      "Peterborough is a fast-growing cathedral city with a busy housing market across Hampton, Werrington, Orton and the city centre. The local removal scene handles a steady mix of family moves, buy-to-let turnovers, and longer-distance jobs north to Lincolnshire and south to Cambridge or London. HouseMove gives you multiple PE-area quotes in one place so you can compare without making cold calls.",
    workedExample:
      "A 3-bed semi within Peterborough usually costs around £480-£720. The same property moving down to north London tends to be £950-£1,400 with packing. A studio flat across the city can be as low as £220-£320 with a man-and-van crew.",
    pricingNote:
      "Cost variables: size of property, item complexity (pianos, ornate furniture, garden equipment), mileage, parking permits in the Cathedral Quarter, and weekend vs midweek timing.",
    commonRoutes: [
      { to: "Cambridge", oneBedBand: "£380-£560" },
      { to: "London (N)", oneBedBand: "£580-£860", notes: "A1(M) corridor" },
      { to: "Stamford", oneBedBand: "£240-£360" },
      { to: "Huntingdon", oneBedBand: "£250-£380" },
      { to: "Wisbech", oneBedBand: "£280-£420" },
    ],
    trustPoints: baseTrust("Peterborough"),
    faqs: [
      {
        q: "Any specific access notes for the Cathedral Quarter or Cowgate area?",
        a: "Yes — parts of the Cathedral precinct and Cowgate are pedestrianised with restricted vehicle access. Movers typically need to apply for a short access window or use the nearest loading bay. Mention your street when quoting.",
      },
      {
        q: "Do movers handle Hampton and Hampton East new-build estates?",
        a: "Regularly. The estate roads are wide enough for larger vans, but some closes off Beadle Avenue and Hartley Avenue have parking restrictions worth flagging.",
      },
      {
        q: "Can I include a long-distance leg, e.g. Peterborough to Edinburgh?",
        a: "Yes. Several Peterborough firms run long-distance jobs and some quote shared-load rates if you have flexibility on day.",
      },
      {
        q: "What's the typical lead time for a Saturday move in PE postcodes?",
        a: "2-3 weeks ahead is comfortable. Booking same week is possible but you may pay a short-notice premium.",
      },
    ],
    sections: ["city", "historic"],
    nearby: ["huntingdon", "wisbech", "cambridge", "ely"],
    variantCopy: {
      city:
        "Peterborough's high-rise developments around the station and Fletton Quays sit alongside family streets in Werrington and Orton — movers here switch between lift-managed flat moves and full-house jobs all week.",
      historic:
        "The Cathedral Quarter's narrow lanes and conservation rules mean some streets need a smaller van or a kerbside-only load. Plan a 30-minute parking window where possible.",
    },
  },
  {
    slug: "cambridge",
    name: "Cambridge",
    county: "Cambridgeshire",
    region: "East of England",
    population: "~145,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Cambridge removal companies, free quotes in 24 hours. House, flat, student and college moves across CB postcodes. No obligation, no chasing calls.",
    intro:
      "Cambridge is one of the most distinctive moving markets in the UK — high-value family homes in Newnham and Trumpington sit alongside intense student and academic turnover around the colleges every Michaelmas, Lent and Easter term. Add a strong commuter pull to London King's Cross and a constant stream of relocations into the Biomedical Campus, and movers here stay busy year-round.",
    workedExample:
      "A 1-bed flat within Cambridge typically runs £280-£420. A 4-bed family move to north London is usually £1,400-£2,100 with packing. Student moves (single room) often sit between £140 and £260.",
    pricingNote:
      "Cambridge pricing is sensitive to college access windows, narrow city-centre lanes, and term-end demand spikes in late June and late September.",
    commonRoutes: [
      { to: "London (N/NE)", oneBedBand: "£560-£820", notes: "A14 + M11" },
      { to: "Peterborough", oneBedBand: "£380-£560" },
      { to: "Bury St Edmunds", oneBedBand: "£320-£460" },
      { to: "Ely", oneBedBand: "£220-£340" },
      { to: "Newmarket", oneBedBand: "£240-£360" },
    ],
    trustPoints: baseTrust("Cambridge"),
    faqs: [
      {
        q: "Do movers know college access rules for student moves?",
        a: "Yes — many Cambridge crews work term-end weeks every year. They'll usually liaise with the porters' lodge for a delivery slot and use trolleys where vehicle access is restricted (Trinity, King's, St John's etc.).",
      },
      {
        q: "Can a mover handle a move from a Newnham or Chesterton property with no driveway?",
        a: "Yes. Movers will typically request a temporary parking suspension from Cambridgeshire County Council where on-street loading is tight. Allow 5-10 working days for the permit.",
      },
      {
        q: "How early should I book for a late-June or late-September student move?",
        a: "Book at least 4-6 weeks ahead — term-end weeks are the single busiest period of the year for Cambridge movers.",
      },
      {
        q: "Do you cover moves to and from the Biomedical Campus area?",
        a: "Yes. Movers regularly handle relocations into Trumpington, Great Kneighton and Eddington for incoming academic and clinical staff.",
      },
      {
        q: "What about cycle access — is there special handling for bikes?",
        a: "Cambridge crews are used to transporting multiple bikes per household. Mention quantity when quoting so vans are loaded with bike protection in mind.",
      },
    ],
    sections: ["student", "city", "historic"],
    nearby: ["ely", "newmarket", "bury-st-edmunds", "st-neots"],
    variantCopy: {
      student:
        "Student moves are a huge slice of Cambridge removals. Many movers offer per-room rates, short notice availability in term-end weeks, and porter-friendly trolley access for college rooms.",
      city:
        "Movers handle everything from a single room at Jesus Lane to a 5-bed Newnham family home — different crews, different van sizes, all bookable in one quote request.",
      historic:
        "Conservation areas around the historic core have strict access and loading windows. Smaller vans plus extra trolley runs are common — factor an extra 30-60 minutes vs a standard suburban move.",
    },
  },
  {
    slug: "st-neots",
    name: "St Neots",
    county: "Cambridgeshire",
    region: "East of England",
    population: "~33,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted St Neots removal companies. House, flat and man and van moves across PE19 — no obligation, compare prices in one place.",
    intro:
      "St Neots is the largest town in Cambridgeshire by population and one of the busiest commuter spots on the East Coast Main Line. Loves Farm, Wintringham and Eynesbury all see steady removal activity, with frequent moves out to London King's Cross and across to Cambridge or Bedford. HouseMove brings together quotes from local PE19 movers in one place.",
    workedExample:
      "A 2-bed flat move within St Neots typically runs £340-£500. The same flat moving to north London is around £580-£840. A 3-bed family home to Cambridge usually lands at £580-£850.",
    pricingNote:
      "Mileage matters here — St Neots sits between Cambridge, Bedford and London, so route choice can swing a quote by £50-£100.",
    commonRoutes: [
      { to: "London (N)", oneBedBand: "£480-£700" },
      { to: "Cambridge", oneBedBand: "£300-£440" },
      { to: "Bedford", oneBedBand: "£260-£400" },
      { to: "Huntingdon", oneBedBand: "£220-£340" },
      { to: "Peterborough", oneBedBand: "£320-£480" },
    ],
    trustPoints: baseTrust("St Neots"),
    faqs: [
      {
        q: "Do movers cover the newer Loves Farm and Wintringham estates?",
        a: "Yes — these are standard runs. Roads are wide and parking is generally easy, but mention if you're on a private access road so the mover can confirm vehicle size.",
      },
      {
        q: "Can I get a same-week quote for a midweek London commute move?",
        a: "Often, yes. Midweek runs to London are easier to slot in than weekends.",
      },
      {
        q: "Is the A1 commute usually factored into pricing?",
        a: "Yes. Movers price by total mileage and time including traffic patterns on the A1 and A428.",
      },
      {
        q: "Do you handle moves across the river to Eaton Socon?",
        a: "Yes — Eaton Socon, Eaton Ford and Eynesbury are all served by the same local crews.",
      },
    ],
    sections: ["commuter"],
    nearby: ["huntingdon", "bedford", "cambridge", "st-ives"],
    variantCopy: {
      commuter:
        "St Neots sits on the A1 and the East Coast Main Line, making it one of the most popular commuter towns in the region. Movers here regularly run early-morning loads to make London completion deadlines.",
    },
  },
  {
    slug: "wisbech",
    name: "Wisbech",
    county: "Cambridgeshire",
    region: "Fens",
    population: "~33,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Wisbech removal companies, free quotes in 24 hours. Local and long-distance moves across PE13 with rural access experience.",
    intro:
      "Wisbech sits at the heart of the Fens, with a moving market shaped by rural properties, long driveways, agricultural community moves, and longer trips to King's Lynn, Peterborough or down to London. Local removal companies here are used to single-track roads, farmhouse loads and tight historic-centre access around the Brinks.",
    workedExample:
      "A 3-bed farmhouse move within the Wisbech area typically runs £520-£780. A long-distance job to Greater London is more likely £1,100-£1,650 due to mileage. Single-room or man-and-van moves around town can start as low as £160.",
    pricingNote:
      "Rural pickups often add 30-60 minutes of loading time — most quotes price by total hours, not just distance.",
    commonRoutes: [
      { to: "King's Lynn", oneBedBand: "£260-£400" },
      { to: "Peterborough", oneBedBand: "£280-£420" },
      { to: "Cambridge", oneBedBand: "£420-£620" },
      { to: "London", oneBedBand: "£780-£1,150" },
    ],
    trustPoints: baseTrust("Wisbech"),
    faqs: [
      {
        q: "Do movers handle long farmhouse driveways and outbuildings?",
        a: "Yes. Several Wisbech crews specifically advertise farm and smallholding experience — they'll bring extra crew or a second vehicle if outbuildings are involved.",
      },
      {
        q: "Can a large van get into the historic Brink streets?",
        a: "Not easily. The Brinks have narrow access and parking restrictions; smaller vans or a shuttle plan from a nearby loading bay are common.",
      },
      {
        q: "Do you cover the surrounding villages — Friday Bridge, Outwell, Tydd?",
        a: "Yes, all standard pickups for local Wisbech movers.",
      },
      {
        q: "How is pricing affected by tractor / agricultural equipment?",
        a: "Large agricultural items usually need a specialist mover or a separate transport quote — flag any in your request.",
      },
    ],
    sections: ["rural", "historic"],
    nearby: ["kings-lynn", "peterborough", "ely", "huntingdon"],
    variantCopy: {
      rural:
        "Fenland properties often mean long single-track approaches and gravel driveways. Movers here factor extra crew and slower loading time into quotes — ask for total hours, not just mileage.",
      historic:
        "The Brinks and North Brink conservation area limit van size and parking. Expect a shuttle plan if your property is in the historic core.",
    },
  },
  {
    slug: "huntingdon",
    name: "Huntingdon",
    county: "Cambridgeshire",
    region: "East of England",
    population: "~25,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Huntingdon removal companies. PE28/PE29 moves with experience of A14 corridor relocations.",
    intro:
      "Huntingdon sits on the A14, making it a busy crossroads for moves heading to Cambridge, Peterborough, the Midlands or down to London via the A1(M). Hinchingbrooke, Hartford and Oxmoor see regular family-home turnover, with steady commuter activity into London King's Cross from Huntingdon station.",
    workedExample:
      "A 3-bed semi within Huntingdon usually costs £420-£640. To Cambridge it's around £480-£720. A move to north London with packing is typically £950-£1,400.",
    pricingNote:
      "A14 traffic can add 30-60 minutes to a Cambridge or Felixstowe run — movers will price total hours, not theoretical mileage.",
    commonRoutes: [
      { to: "Cambridge", oneBedBand: "£340-£500" },
      { to: "Peterborough", oneBedBand: "£260-£400" },
      { to: "St Neots", oneBedBand: "£220-£340" },
      { to: "London (N)", oneBedBand: "£560-£820" },
    ],
    trustPoints: baseTrust("Huntingdon"),
    faqs: [
      {
        q: "Do movers cover Hinchingbrooke Park and the newer estates?",
        a: "Yes — standard runs. Roads are wide and parking is generally easy.",
      },
      {
        q: "Can I get a quote that factors in A14 delays?",
        a: "Yes. Local movers price by total time including expected traffic on the A14 between Huntingdon and Cambridge.",
      },
      {
        q: "Do you handle moves to and from St Ives and Godmanchester?",
        a: "Yes — both are served by Huntingdon-based crews as part of normal coverage.",
      },
      {
        q: "Are weekend moves more expensive in PE28/PE29?",
        a: "Typically 10-15% more on Saturdays. Sundays are quieter and sometimes cheaper.",
      },
    ],
    sections: ["commuter", "rural"],
    nearby: ["st-neots", "st-ives", "peterborough", "cambridge"],
    variantCopy: {
      commuter:
        "Huntingdon is a serious commuter base for London King's Cross — movers regularly do early-morning loads so families can complete in town before evening.",
      rural:
        "Surrounding villages like Brampton, Buckden and Wyton mean rural pickups are common. Allow extra loading time for properties with long driveways or limited turning space.",
    },
  },
  {
    slug: "ely",
    name: "Ely",
    county: "Cambridgeshire",
    region: "Fens",
    population: "~20,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Ely removal companies, free quotes within 24 hours. House and flat moves across CB6/CB7 with historic-centre and Fenland experience.",
    intro:
      "Ely is a small cathedral city with a moving market shaped by family homes around the cathedral, surrounding Fenland villages, and a strong commuter pull to Cambridge. Removals here range from historic-centre flat moves with narrow access to large rural pickups with outbuildings to clear.",
    workedExample:
      "A 2-bed terrace within Ely typically runs £320-£480. A 3-bed move to Cambridge is usually £420-£620. A long-distance job to London is around £900-£1,300 including packing.",
    pricingNote:
      "Historic-centre properties near the cathedral often need a smaller van plus a shuttle plan — confirm with the mover before booking.",
    commonRoutes: [
      { to: "Cambridge", oneBedBand: "£280-£420" },
      { to: "Newmarket", oneBedBand: "£260-£400" },
      { to: "Bury St Edmunds", oneBedBand: "£340-£500" },
      { to: "Peterborough", oneBedBand: "£300-£440" },
      { to: "London", oneBedBand: "£640-£940" },
    ],
    trustPoints: baseTrust("Ely"),
    faqs: [
      {
        q: "Can a large van access streets near the cathedral?",
        a: "Some streets — yes; others, no. Movers familiar with Ely will usually request a smaller van plus a couple of trolley runs for the tightest spots.",
      },
      {
        q: "Do movers cover Soham, Littleport and Sutton?",
        a: "Yes, all standard coverage from Ely-based crews.",
      },
      {
        q: "Is the Cambridge commute factored into pricing?",
        a: "Yes. Movers will price by total time including the A10 run.",
      },
      {
        q: "How early should I book a summer move?",
        a: "3-4 weeks ahead is comfortable for July and August.",
      },
    ],
    sections: ["historic", "rural"],
    nearby: ["cambridge", "newmarket", "bury-st-edmunds", "wisbech"],
    variantCopy: {
      historic:
        "The cathedral conservation area limits vehicle size on several streets. Plan extra time for trolley access from a nearby loading point.",
      rural:
        "Fenland pickups around Soham and Littleport often add loading time — quotes are usually priced by hour, not just mileage.",
    },
  },
  {
    slug: "st-ives",
    name: "St Ives",
    county: "Cambridgeshire",
    region: "East of England",
    population: "~17,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted St Ives removal companies. PE27 house and flat moves with historic-centre and busway-commuter experience.",
    intro:
      "St Ives in Cambridgeshire is a market town with strong commuter links to Cambridge via the Guided Busway. Moves here mix family homes in Hemingfords and Houghton, riverside flats near The Quay, and steady traffic out to Cambridge and Huntingdon. Local movers know the narrow market-square access well.",
    workedExample:
      "A 2-bed terrace in St Ives typically runs £340-£500. To Cambridge it's £300-£440. A 3-bed move within town with packing is around £600-£850.",
    pricingNote:
      "Market-square and Bridge Street properties may need a smaller van and a shuttle to a nearby car park — flag this when quoting.",
    commonRoutes: [
      { to: "Cambridge", oneBedBand: "£260-£400", notes: "Guided busway corridor" },
      { to: "Huntingdon", oneBedBand: "£220-£340" },
      { to: "St Neots", oneBedBand: "£220-£340" },
      { to: "London", oneBedBand: "£640-£940" },
    ],
    trustPoints: baseTrust("St Ives"),
    faqs: [
      {
        q: "Can a removal van get onto The Waits or near the Old Bridge?",
        a: "Access is tight and time-restricted. Movers typically use the Waitrose or Bus Station car park as a loading point and shuttle in.",
      },
      {
        q: "Do you cover the Hemingfords and Houghton?",
        a: "Yes — both are standard pickups.",
      },
      {
        q: "Are flood-zone properties handled differently?",
        a: "Movers can usually still access riverside properties but will check forecasts; in active flood warnings they may reschedule for safety.",
      },
      {
        q: "Is there a discount for midweek moves?",
        a: "Often, yes — Tuesday to Thursday tends to be cheapest.",
      },
    ],
    sections: ["historic", "commuter"],
    nearby: ["huntingdon", "cambridge", "st-neots", "ely"],
    variantCopy: {
      historic:
        "St Ives' historic core around the Old Bridge and market square has restricted vehicle access. Plan a kerbside loading point and short trolley runs.",
      commuter:
        "The Guided Busway makes St Ives a popular Cambridge commuter base. Movers regularly time loads to fit the morning commute window.",
    },
  },

  // ===================== NORFOLK =====================
  {
    slug: "norwich",
    name: "Norwich",
    county: "Norfolk",
    region: "East of England",
    population: "~145,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Norwich removal companies, free quotes within 24 hours. House, flat and student moves across NR postcodes — no obligation, compare in one place.",
    intro:
      "Norwich is Norfolk's economic centre, with a removal market shaped by historic lanes inside the inner ring, family suburbs in Thorpe St Andrew and Eaton, and a strong UEA student turnover each summer. The A11 corridor sees regular runs down to Cambridge and London, while local moves dominate weekday bookings.",
    workedExample:
      "A 2-bed flat in central Norwich usually runs £340-£500. A 4-bed family move from Norwich to London is typically £1,400-£2,100 with packing. UEA student room moves often sit between £140 and £260.",
    pricingNote:
      "Historic lanes inside the city walls (Elm Hill, Tombland, around the Cathedral) often need a smaller van and trolley runs — expect a small uplift vs a standard suburban move.",
    commonRoutes: [
      { to: "Cambridge", oneBedBand: "£480-£700", notes: "A11 corridor" },
      { to: "London", oneBedBand: "£780-£1,150" },
      { to: "Great Yarmouth", oneBedBand: "£260-£400" },
      { to: "Ipswich", oneBedBand: "£420-£620" },
      { to: "King's Lynn", oneBedBand: "£380-£560" },
    ],
    trustPoints: baseTrust("Norwich"),
    faqs: [
      {
        q: "Do movers handle UEA student moves at the end of the academic year?",
        a: "Yes — late June is the single busiest week. Book 4-6 weeks ahead for student rooms or shared houses near UEA, Earlham or Eaton.",
      },
      {
        q: "Can a large van access Elm Hill or Tombland?",
        a: "Not comfortably. Movers will typically use a smaller van plus trolley runs from the closest legal loading point.",
      },
      {
        q: "Do you cover Thorpe St Andrew, Sprowston and Hellesdon?",
        a: "Yes, all standard pickups for Norwich-based crews.",
      },
      {
        q: "What's the typical lead time for a 3-bed family move?",
        a: "2-3 weeks usually gives good choice of crews. Same-week is possible at a small premium.",
      },
      {
        q: "Is there a charge for stairs in tall Norwich townhouses?",
        a: "Some firms add a small per-floor surcharge for narrow stair access. Confirm at quote stage rather than on the day.",
      },
    ],
    sections: ["student", "city", "historic"],
    nearby: ["great-yarmouth", "wymondham", "dereham", "attleborough"],
    variantCopy: {
      student:
        "UEA's student turnover is one of the biggest demand spikes of the Norwich moving calendar. Many local movers offer per-room and shared-house rates.",
      city:
        "Norwich movers handle everything from a city-centre flat behind the Forum to a 5-bed family move in Eaton — different crew sizes, same booking process.",
      historic:
        "Inside the medieval city walls, narrow lanes and bollards limit vehicle access. Plan a shuttle to a loading bay for properties near the cathedral or Elm Hill.",
    },
  },
  {
    slug: "great-yarmouth",
    name: "Great Yarmouth",
    county: "Norfolk",
    region: "Norfolk Coast",
    population: "~39,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Great Yarmouth removal companies. Coastal moves across NR30/NR31 with seafront access experience.",
    intro:
      "Great Yarmouth's removal market mixes coastal moves around the seafront and South Quay with steady family-home turnover in Gorleston and Bradwell. Long-distance jobs inland to Norwich, Cambridge or London are also common. Movers here know the seafront's parking restrictions and seasonal traffic patterns.",
    workedExample:
      "A 2-bed flat near the seafront usually costs £320-£480. A 3-bed move from Yarmouth to Norwich is around £480-£700. A long-distance run to London is typically £1,000-£1,500.",
    pricingNote:
      "Summer (June-August) is the busiest season for Yarmouth movers due to seasonal demand — book early and expect a small uplift.",
    commonRoutes: [
      { to: "Norwich", oneBedBand: "£260-£400" },
      { to: "Lowestoft", oneBedBand: "£220-£340" },
      { to: "Ipswich", oneBedBand: "£480-£700" },
      { to: "London", oneBedBand: "£900-£1,350" },
    ],
    trustPoints: baseTrust("Great Yarmouth"),
    faqs: [
      {
        q: "Can movers handle seafront and Marine Parade access?",
        a: "Yes — but parking is restricted in peak summer. Movers may request a temporary suspension or use a side-street loading point.",
      },
      {
        q: "Do you cover Gorleston and Bradwell?",
        a: "Yes — both are standard pickups for Yarmouth-based crews.",
      },
      {
        q: "Are summer weekend moves significantly more expensive?",
        a: "Typically 15-25% more in July and August. Midweek summer moves are usually cheaper.",
      },
      {
        q: "How is sand and coastal damp handled during loading?",
        a: "Movers usually bring extra protective covers and floor runners for coastal properties — flag any sensitive items.",
      },
    ],
    sections: ["coastal"],
    nearby: ["norwich", "lowestoft", "kings-lynn"],
    variantCopy: {
      coastal:
        "Seafront and Marine Parade access requires planning — movers often arrange a temporary parking suspension or work from a side-street loading point. Allow extra time during summer peak.",
    },
  },
  {
    slug: "kings-lynn",
    name: "King's Lynn",
    county: "Norfolk",
    region: "Fens",
    population: "~43,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted King's Lynn removal companies, free quotes within 24 hours. PE30/PE31 house and flat moves across town and surrounding Fenland villages.",
    intro:
      "King's Lynn's removal market spans the historic Tuesday Market Place area, family suburbs in Gaywood and South Wootton, and rural pickups across the surrounding Fens. Long-distance jobs to Cambridge, Peterborough and London are common, and the local crews know the town's narrow medieval lanes well.",
    workedExample:
      "A 3-bed family home within King's Lynn usually runs £480-£720. A move to Cambridge is around £580-£860. A long-distance job to London tends to be £1,000-£1,500 with packing.",
    pricingNote:
      "Properties inside the historic core often need a smaller van — confirm vehicle size when quoting.",
    commonRoutes: [
      { to: "Cambridge", oneBedBand: "£420-£620" },
      { to: "Peterborough", oneBedBand: "£320-£480" },
      { to: "Norwich", oneBedBand: "£380-£560" },
      { to: "London", oneBedBand: "£900-£1,350" },
      { to: "Wisbech", oneBedBand: "£260-£400" },
    ],
    trustPoints: baseTrust("King's Lynn"),
    faqs: [
      {
        q: "Can a large van access the historic Tuesday Market Place?",
        a: "Restricted at times. Movers usually plan a loading window outside market days and may use a side street.",
      },
      {
        q: "Do you cover Gaywood, North Wootton and South Wootton?",
        a: "Yes, all standard coverage.",
      },
      {
        q: "Are rural Fenland villages around Lynn handled?",
        a: "Yes — pickups across Terrington, Clenchwarton and Watlington are common. Allow extra loading time for long driveways.",
      },
      {
        q: "How early should I book in summer?",
        a: "3-4 weeks ahead is comfortable for July-August.",
      },
    ],
    sections: ["historic", "rural"],
    nearby: ["wisbech", "norwich", "great-yarmouth", "ely"],
    variantCopy: {
      historic:
        "The Tuesday Market Place and surrounding medieval streets have time-restricted vehicle access. Movers will plan around market days.",
      rural:
        "Fenland villages around King's Lynn often involve long farm-track approaches. Quotes are usually priced by total hours.",
    },
  },
  {
    slug: "thetford",
    name: "Thetford",
    county: "Norfolk",
    region: "Brecks",
    population: "~25,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Thetford removal companies. IP24 moves across town and the surrounding Brecks villages.",
    intro:
      "Thetford sits on the A11 between Cambridge and Norwich, with a moving market shaped by family suburbs in Redcastle Furze and Abbey, rural pickups across the Brecks, and steady relocation traffic in and out of the town. Movers here are used to mixing urban estates with single-track rural runs.",
    workedExample:
      "A 3-bed semi within Thetford usually runs £440-£660. To Norwich it's around £380-£560. A long-distance run to London is typically £950-£1,400.",
    pricingNote:
      "Some Breckland properties have unsurfaced approaches — flag if your driveway is gravel or grass so movers can plan vehicle choice.",
    commonRoutes: [
      { to: "Norwich", oneBedBand: "£280-£420" },
      { to: "Cambridge", oneBedBand: "£380-£560" },
      { to: "Bury St Edmunds", oneBedBand: "£240-£360" },
      { to: "London", oneBedBand: "£840-£1,240" },
    ],
    trustPoints: baseTrust("Thetford"),
    faqs: [
      {
        q: "Do movers cover surrounding villages — Brandon, East Harling, Mundford?",
        a: "Yes, all standard coverage for Thetford-based crews.",
      },
      {
        q: "Are there A11 traffic considerations for Norwich runs?",
        a: "Yes — movers price by total time and plan around peak windows.",
      },
      {
        q: "Can I book for a Sunday move?",
        a: "Some crews offer Sundays, sometimes at a small discount vs Saturday.",
      },
      {
        q: "Is military housing handled?",
        a: "Yes — local movers regularly serve MOD relocations around Thetford and the wider area.",
      },
    ],
    sections: ["rural"],
    nearby: ["norwich", "attleborough", "bury-st-edmunds", "wymondham"],
    variantCopy: {
      rural:
        "Breckland properties often involve unsurfaced approaches and longer loading times. Quotes are typically priced by total hours.",
    },
  },
  {
    slug: "wymondham",
    name: "Wymondham",
    county: "Norfolk",
    region: "East of England",
    population: "~14,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Wymondham removal companies, free quotes in 24 hours. NR18 house and flat moves with historic-centre and commuter experience.",
    intro:
      "Wymondham is a market town just south of Norwich with a removal market shaped by the historic centre around the Abbey, newer estates off Norwich Common Road, and a steady commuter pull to Norwich and beyond. Movers here are used to narrow market-square access and family-home turnover in equal measure.",
    workedExample:
      "A 3-bed family home within Wymondham usually costs £440-£660. A move to Norwich is around £280-£420.",
    pricingNote:
      "Market-place properties may need smaller vans and short shuttle runs — flag location when quoting.",
    commonRoutes: [
      { to: "Norwich", oneBedBand: "£260-£400" },
      { to: "Attleborough", oneBedBand: "£220-£340" },
      { to: "Thetford", oneBedBand: "£280-£420" },
      { to: "Cambridge", oneBedBand: "£420-£620" },
    ],
    trustPoints: baseTrust("Wymondham"),
    faqs: [
      {
        q: "Can a large van access the Market Place and surrounding lanes?",
        a: "Restricted on market days. Movers will plan around timings.",
      },
      {
        q: "Do you cover Hethersett, Spooner Row and the newer estates?",
        a: "Yes — all standard coverage.",
      },
      {
        q: "Is the Norwich commute factored into pricing?",
        a: "Yes. Movers price by total hours.",
      },
      {
        q: "When should I book for an end-of-month move?",
        a: "End of month is busiest. Book 3-4 weeks ahead where possible.",
      },
    ],
    sections: ["historic", "commuter"],
    nearby: ["norwich", "attleborough", "thetford", "dereham"],
    variantCopy: {
      historic:
        "Wymondham's market square and abbey conservation area have restricted access on certain days. Plan loading windows around the market.",
      commuter:
        "Strong Norwich commuter links mean movers often time loads to clear the morning peak on the A11.",
    },
  },
  {
    slug: "dereham",
    name: "Dereham",
    county: "Norfolk",
    region: "East of England",
    population: "~20,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Dereham removal companies. NR19 house and flat moves across town and the wider mid-Norfolk area.",
    intro:
      "Dereham is mid-Norfolk's main market town, with a removal market that mixes town-centre moves around the market place with rural pickups across the surrounding villages. Norwich is a frequent destination, and longer jobs to Cambridge or London are also common.",
    workedExample:
      "A 3-bed home in Dereham usually costs £440-£660. A move to Norwich is around £320-£480.",
    pricingNote:
      "Rural pickups often add an hour or more of loading — quotes are priced by total time, not just distance.",
    commonRoutes: [
      { to: "Norwich", oneBedBand: "£300-£440" },
      { to: "King's Lynn", oneBedBand: "£340-£500" },
      { to: "Thetford", oneBedBand: "£300-£440" },
      { to: "Cambridge", oneBedBand: "£480-£700" },
    ],
    trustPoints: baseTrust("Dereham"),
    faqs: [
      {
        q: "Do you cover surrounding villages — Mattishall, Swanton Morley, Beetley?",
        a: "Yes, all standard pickups.",
      },
      {
        q: "Are there access issues in the historic centre?",
        a: "Market Place can be tight on market days. Movers will plan around it.",
      },
      {
        q: "Can I get a same-week midweek quote?",
        a: "Often, yes — Tuesday to Thursday is the easiest window.",
      },
      {
        q: "Do movers handle barn conversions and outbuildings?",
        a: "Yes — common around Dereham. Mention outbuildings up front so crew size is right.",
      },
    ],
    sections: ["rural", "historic"],
    nearby: ["norwich", "wymondham", "attleborough", "kings-lynn"],
    variantCopy: {
      rural:
        "Mid-Norfolk villages around Dereham often involve barn conversions and long driveways. Allow extra loading time.",
      historic:
        "Market Place access is restricted on market days.",
    },
  },
  {
    slug: "attleborough",
    name: "Attleborough",
    county: "Norfolk",
    region: "East of England",
    population: "~11,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Attleborough removal companies, free quotes in 24 hours. NR17 moves across town with strong A11 commuter links.",
    intro:
      "Attleborough sits on the A11 between Thetford and Wymondham, with a moving market shaped by family homes around the new western expansion, town-centre flats, and steady commuter activity to Norwich and Cambridge. Local movers know the A11 timings inside out.",
    workedExample:
      "A 3-bed home in Attleborough usually costs £420-£620. A move to Norwich is around £320-£480.",
    pricingNote:
      "A11 traffic shapes pricing on Norwich and Cambridge runs — early starts often work out cheaper.",
    commonRoutes: [
      { to: "Norwich", oneBedBand: "£280-£420" },
      { to: "Thetford", oneBedBand: "£220-£340" },
      { to: "Cambridge", oneBedBand: "£420-£620" },
      { to: "Wymondham", oneBedBand: "£220-£340" },
    ],
    trustPoints: baseTrust("Attleborough"),
    faqs: [
      {
        q: "Do you cover the newer estates off London Road?",
        a: "Yes — all standard coverage.",
      },
      {
        q: "Are weekend moves significantly more expensive?",
        a: "Typically 10-15% more.",
      },
      {
        q: "Do movers offer packing as an add-on?",
        a: "Most do — full or partial packing services are bookable at quote stage.",
      },
      {
        q: "How early should I book for a summer move?",
        a: "3-4 weeks ahead is comfortable.",
      },
    ],
    sections: ["commuter", "rural"],
    nearby: ["wymondham", "thetford", "norwich", "dereham"],
    variantCopy: {
      commuter:
        "A11 commuter links to Norwich and beyond make early-morning load timing valuable. Movers often suggest pre-7am starts.",
      rural:
        "Surrounding villages mean rural pickups are common.",
    },
  },

  // ===================== SUFFOLK =====================
  {
    slug: "ipswich",
    name: "Ipswich",
    county: "Suffolk",
    region: "East of England",
    population: "~140,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Ipswich removal companies, free quotes within 24 hours. IP1-IP5 house, flat and man and van moves — no obligation, compare in one place.",
    intro:
      "Ipswich is Suffolk's largest town with a moving market that spans waterfront flats, family suburbs in Rushmere and Kesgrave, and steady commuter traffic to London Liverpool Street. Movers here handle everything from single-room waterfront moves to full 5-bed family relocations.",
    workedExample:
      "A 2-bed flat on the waterfront usually costs £360-£540. A 4-bed family move from Ipswich to London is typically £1,300-£1,950 with packing.",
    pricingNote:
      "Waterfront flat moves often need pre-booked lift slots and porter coordination — flag your building when quoting.",
    commonRoutes: [
      { to: "London (E)", oneBedBand: "£640-£940", notes: "A12 corridor" },
      { to: "Colchester", oneBedBand: "£280-£420" },
      { to: "Felixstowe", oneBedBand: "£240-£360" },
      { to: "Bury St Edmunds", oneBedBand: "£320-£480" },
      { to: "Norwich", oneBedBand: "£480-£700" },
    ],
    trustPoints: baseTrust("Ipswich"),
    faqs: [
      {
        q: "Do you handle waterfront apartment moves with lift restrictions?",
        a: "Yes — Mill, Regatta Quay and similar developments are routine. Movers will pre-book lift slots.",
      },
      {
        q: "Are weekend Liverpool Street commuter moves more expensive?",
        a: "Typically 10-20% more on Saturdays.",
      },
      {
        q: "Do you cover Kesgrave, Rushmere and Martlesham?",
        a: "Yes, all standard coverage.",
      },
      {
        q: "Can movers handle moves to and from Felixstowe port-area housing?",
        a: "Yes — Felixstowe and Trimleys are regular runs.",
      },
      {
        q: "How early should I book a summer move?",
        a: "3-4 weeks ahead is comfortable.",
      },
    ],
    sections: ["city", "commuter"],
    nearby: ["felixstowe", "colchester", "bury-st-edmunds", "stowmarket"],
    variantCopy: {
      city:
        "Movers in Ipswich handle waterfront flats, suburban semis and large family homes all in the same week. Different crew sizes, same booking flow.",
      commuter:
        "London Liverpool Street commuters drive a steady demand for weekday moves. Movers often time loads to clear the morning rush on the A12.",
    },
  },
  {
    slug: "lowestoft",
    name: "Lowestoft",
    county: "Suffolk",
    region: "Suffolk Coast",
    population: "~70,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Lowestoft removal companies. NR32/NR33 coastal moves with seafront access and long-distance experience.",
    intro:
      "Lowestoft, the UK's most easterly town, has a removal market shaped by coastal moves around the seafront and South Beach, family suburbs around Oulton Broad, and longer inland runs to Norwich and Ipswich. Movers here know the seafront's parking patterns and tidal road timings.",
    workedExample:
      "A 2-bed flat near the seafront usually costs £320-£480. A 3-bed move from Lowestoft to Norwich is around £380-£560.",
    pricingNote:
      "Summer demand peaks — book ahead in July and August.",
    commonRoutes: [
      { to: "Norwich", oneBedBand: "£300-£440" },
      { to: "Great Yarmouth", oneBedBand: "£220-£340" },
      { to: "Ipswich", oneBedBand: "£420-£620" },
      { to: "London", oneBedBand: "£960-£1,420" },
    ],
    trustPoints: baseTrust("Lowestoft"),
    faqs: [
      {
        q: "Can movers handle seafront and South Beach access?",
        a: "Yes — parking is restricted in summer. Movers may request a temporary suspension or use a side-street loading point.",
      },
      {
        q: "Do you cover Oulton Broad and Pakefield?",
        a: "Yes — both are standard pickups.",
      },
      {
        q: "Is the bascule bridge timing a factor on move days?",
        a: "It can add 10-15 minutes occasionally — movers familiar with Lowestoft will plan around it.",
      },
      {
        q: "Are coastal damp considerations factored in?",
        a: "Movers will bring extra protective covers for sensitive items.",
      },
    ],
    sections: ["coastal"],
    nearby: ["great-yarmouth", "norwich", "ipswich"],
    variantCopy: {
      coastal:
        "Seafront and South Beach properties involve summer parking restrictions and occasional bridge-lift timings. Movers will plan around both.",
    },
  },
  {
    slug: "bury-st-edmunds",
    name: "Bury St Edmunds",
    county: "Suffolk",
    region: "East of England",
    population: "~42,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Bury St Edmunds removal companies, free quotes in 24 hours. IP32/IP33 historic-centre and family-home moves across Suffolk.",
    intro:
      "Bury St Edmunds is a historic Suffolk market town with a removal market shaped by Georgian townhouses around the Abbey, family suburbs in Moreton Hall and Westley, and rural pickups in surrounding villages. Movers here handle narrow historic-centre access weekly.",
    workedExample:
      "A 3-bed townhouse near the historic centre usually runs £520-£780. A move to Cambridge is around £380-£560.",
    pricingNote:
      "Conservation-area properties often need smaller vans and short shuttles — flag location when quoting.",
    commonRoutes: [
      { to: "Cambridge", oneBedBand: "£320-£460" },
      { to: "Ipswich", oneBedBand: "£320-£480" },
      { to: "Newmarket", oneBedBand: "£240-£360" },
      { to: "London", oneBedBand: "£780-£1,150" },
      { to: "Norwich", oneBedBand: "£480-£700" },
    ],
    trustPoints: baseTrust("Bury St Edmunds"),
    faqs: [
      {
        q: "Can a large van access streets near the Abbey?",
        a: "Some — others have time-restricted bollards. Movers will plan around them.",
      },
      {
        q: "Do you cover Moreton Hall and Westley estates?",
        a: "Yes — both are standard pickups.",
      },
      {
        q: "Are surrounding villages — Ixworth, Stanton, Pakenham — covered?",
        a: "Yes.",
      },
      {
        q: "How early should I book a summer move?",
        a: "3-4 weeks ahead is comfortable.",
      },
    ],
    sections: ["historic"],
    nearby: ["newmarket", "stowmarket", "ipswich", "haverhill"],
    variantCopy: {
      historic:
        "Georgian townhouses around the Abbey have restricted vehicle access. Plan a shuttle to a nearby loading bay.",
    },
  },
  {
    slug: "haverhill",
    name: "Haverhill",
    county: "Suffolk",
    region: "East of England",
    population: "~28,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Haverhill removal companies. CB9 house and flat moves with Cambridge commuter and Stansted access experience.",
    intro:
      "Haverhill sits on the Suffolk-Cambridgeshire border with a moving market shaped by family suburbs, a steady commuter pull to Cambridge, and easy access to Stansted. Movers here handle a high volume of family-home turnover plus regular long-distance runs.",
    workedExample:
      "A 3-bed home in Haverhill usually costs £460-£680. A move to Cambridge is around £340-£500.",
    pricingNote:
      "Cambridge commute runs are common — movers usually quote total time including A1307 traffic.",
    commonRoutes: [
      { to: "Cambridge", oneBedBand: "£280-£420" },
      { to: "Bury St Edmunds", oneBedBand: "£260-£400" },
      { to: "London", oneBedBand: "£720-£1,060" },
      { to: "Stansted", oneBedBand: "£320-£480" },
    ],
    trustPoints: baseTrust("Haverhill"),
    faqs: [
      {
        q: "Do you cover surrounding villages — Kedington, Withersfield, Steeple Bumpstead?",
        a: "Yes, all standard pickups.",
      },
      {
        q: "Are A1307 traffic delays factored into Cambridge runs?",
        a: "Yes — movers price by total time.",
      },
      {
        q: "Can I book a same-week midweek move?",
        a: "Often, yes — Tuesday to Thursday is the easiest window.",
      },
      {
        q: "Do you handle moves to Stansted relocations?",
        a: "Yes — frequent route for aviation-sector relocations.",
      },
    ],
    sections: ["commuter", "rural"],
    nearby: ["bury-st-edmunds", "newmarket", "cambridge"],
    variantCopy: {
      commuter:
        "Haverhill is a strong Cambridge commuter base via the A1307. Movers often suggest early starts to clear the morning peak.",
      rural:
        "Surrounding Suffolk villages mean rural pickups are common.",
    },
  },
  {
    slug: "felixstowe",
    name: "Felixstowe",
    county: "Suffolk",
    region: "Suffolk Coast",
    population: "~24,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Felixstowe removal companies, free quotes within 24 hours. IP11 coastal house and flat moves with port-area and seafront experience.",
    intro:
      "Felixstowe's removal market combines coastal moves around the seafront and Hamilton Road area with steady family-home turnover near the Trimleys and Walton. Proximity to the UK's busiest container port also drives regular relocations into and out of the area for port-sector staff.",
    workedExample:
      "A 2-bed flat near the seafront usually costs £320-£480. A 3-bed family move to Ipswich is around £340-£500.",
    pricingNote:
      "Summer-peak demand and port-shift timing patterns can affect availability — book ahead in July and August.",
    commonRoutes: [
      { to: "Ipswich", oneBedBand: "£240-£360" },
      { to: "Colchester", oneBedBand: "£340-£500" },
      { to: "London", oneBedBand: "£720-£1,060" },
      { to: "Bury St Edmunds", oneBedBand: "£420-£620" },
    ],
    trustPoints: baseTrust("Felixstowe"),
    faqs: [
      {
        q: "Can movers handle seafront properties with restricted parking?",
        a: "Yes — temporary parking suspensions or side-street loading are common.",
      },
      {
        q: "Do you cover Walton, Old Felixstowe and the Trimleys?",
        a: "Yes, all standard coverage.",
      },
      {
        q: "Are port-relocation moves handled?",
        a: "Yes — regular relocations into and out of Felixstowe for port-sector staff.",
      },
      {
        q: "Is summer demand a factor on pricing?",
        a: "Yes — July and August typically run 15-25% above off-peak.",
      },
    ],
    sections: ["coastal"],
    nearby: ["ipswich", "colchester"],
    variantCopy: {
      coastal:
        "Seafront and Hamilton Road properties often need a temporary parking suspension or a side-street loading point. Allow extra time during summer peak.",
    },
  },
  {
    slug: "newmarket",
    name: "Newmarket",
    county: "Suffolk",
    region: "East of England",
    population: "~21,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Newmarket removal companies. CB8 house and flat moves with equestrian-area and historic-centre experience.",
    intro:
      "Newmarket, the home of British horse racing, has a removal market shaped by equestrian-sector relocations, period properties around the High Street, and a strong commuter pull to Cambridge. Movers here are used to large country homes with outbuildings as well as town-centre flats.",
    workedExample:
      "A 3-bed home in Newmarket usually costs £460-£680. A move to Cambridge is around £280-£420.",
    pricingNote:
      "Large country properties with stables or outbuildings often need a larger crew — flag at quote stage.",
    commonRoutes: [
      { to: "Cambridge", oneBedBand: "£260-£400" },
      { to: "Bury St Edmunds", oneBedBand: "£240-£360" },
      { to: "Ely", oneBedBand: "£260-£400" },
      { to: "London", oneBedBand: "£720-£1,060" },
    ],
    trustPoints: baseTrust("Newmarket"),
    faqs: [
      {
        q: "Do movers handle equestrian-sector relocations with outbuildings?",
        a: "Yes — common in the Newmarket area. Flag stables and tack rooms when quoting.",
      },
      {
        q: "Can a large van access the High Street area?",
        a: "Most of it — but race-day timing may require planning around traffic management.",
      },
      {
        q: "Do you cover Exning and Burwell?",
        a: "Yes, standard coverage.",
      },
      {
        q: "Is Cambridge commute traffic factored in?",
        a: "Yes — movers price by total time.",
      },
    ],
    sections: ["historic", "rural"],
    nearby: ["cambridge", "bury-st-edmunds", "ely", "haverhill"],
    variantCopy: {
      historic:
        "High Street and surrounding period properties have conservation considerations. Race-day timing can also affect access.",
      rural:
        "Country properties with stables and outbuildings are common — larger crews and longer loading times are standard.",
    },
  },
  {
    slug: "stowmarket",
    name: "Stowmarket",
    county: "Suffolk",
    region: "East of England",
    population: "~19,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Stowmarket removal companies, free quotes in 24 hours. IP14 house and flat moves with strong A14 and rail commuter links.",
    intro:
      "Stowmarket sits on the A14 between Ipswich and Bury St Edmunds, with a moving market shaped by family suburbs, town-centre flats and steady rail-commuter activity to London Liverpool Street. Movers here handle a mix of urban and rural pickups across mid-Suffolk.",
    workedExample:
      "A 3-bed home in Stowmarket usually costs £440-£660. A move to Ipswich is around £260-£400.",
    pricingNote:
      "A14 traffic can affect Ipswich and Bury runs — movers price by total time.",
    commonRoutes: [
      { to: "Ipswich", oneBedBand: "£240-£360" },
      { to: "Bury St Edmunds", oneBedBand: "£260-£400" },
      { to: "London", oneBedBand: "£780-£1,150" },
      { to: "Cambridge", oneBedBand: "£420-£620" },
    ],
    trustPoints: baseTrust("Stowmarket"),
    faqs: [
      {
        q: "Do you cover Needham Market and Stowupland?",
        a: "Yes, standard coverage.",
      },
      {
        q: "Is the rail commuter pattern factored into pricing?",
        a: "Yes — early loads help avoid station-area congestion.",
      },
      {
        q: "Can I get a same-week midweek quote?",
        a: "Often, yes.",
      },
      {
        q: "Are surrounding mid-Suffolk villages covered?",
        a: "Yes — standard coverage from Stowmarket-based crews.",
      },
    ],
    sections: ["commuter", "rural"],
    nearby: ["ipswich", "bury-st-edmunds"],
    variantCopy: {
      commuter:
        "Rail commuting to London Liverpool Street is a major demand driver. Movers often time loads to fit the commute window.",
      rural:
        "Mid-Suffolk villages mean rural pickups are common.",
    },
  },

  // ===================== ESSEX =====================
  {
    slug: "southend-on-sea",
    name: "Southend-on-Sea",
    county: "Essex",
    region: "Essex Coast",
    population: "~183,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Southend-on-Sea removal companies, free quotes in 24 hours. SS1-SS3 coastal flat and house moves with seafront access experience.",
    intro:
      "Southend-on-Sea has one of the most varied removal markets in Essex — seafront flats around Marine Parade, terraced family homes inland in Westcliff and Leigh-on-Sea, and steady commuter activity to London Fenchurch Street. Movers here know the seafront's parking restrictions and seasonal traffic patterns inside out.",
    workedExample:
      "A 2-bed seafront flat usually costs £360-£540. A 4-bed family move from Southend to London is typically £1,100-£1,650 with packing.",
    pricingNote:
      "Marine Parade and Western Esplanade have seasonal parking restrictions — temporary suspensions take 5-10 working days from Southend-on-Sea City Council.",
    commonRoutes: [
      { to: "London (E)", oneBedBand: "£540-£800", notes: "Fenchurch St line" },
      { to: "Basildon", oneBedBand: "£260-£400" },
      { to: "Chelmsford", oneBedBand: "£340-£500" },
      { to: "Brentwood", oneBedBand: "£380-£560" },
      { to: "Colchester", oneBedBand: "£480-£700" },
    ],
    trustPoints: baseTrust("Southend-on-Sea"),
    faqs: [
      {
        q: "Can movers handle seafront access restrictions on Marine Parade?",
        a: "Yes — movers familiar with the seafront will arrange a temporary parking suspension where needed, or work from a side-street loading point. Allow extra time during summer.",
      },
      {
        q: "Do you cover Leigh-on-Sea and the Old Town?",
        a: "Yes — Leigh Old Town has narrow lanes; movers will usually use a smaller van plus trolley runs.",
      },
      {
        q: "Are Fenchurch Street commuter moves common?",
        a: "Yes — Southend is one of the busier c2c commuter towns. Midweek moves to London are very common.",
      },
      {
        q: "Is summer demand a real factor?",
        a: "Yes. Seafront-area moves in July and August are 15-25% more than off-peak. Book early.",
      },
      {
        q: "Do you handle moves out of seafront apartment blocks with lift bookings?",
        a: "Yes — movers will pre-book a lift slot and confirm with the building manager.",
      },
    ],
    sections: ["coastal", "commuter"],
    nearby: ["basildon", "chelmsford", "brentwood", "colchester"],
    variantCopy: {
      coastal:
        "Seafront access along Marine Parade and Western Esplanade involves seasonal parking restrictions and temporary suspension permits. Movers here plan around it routinely.",
      commuter:
        "Southend's c2c line into Fenchurch Street drives a steady flow of weekday moves into and out of east London. Movers often time loads around the morning peak.",
    },
  },
  {
    slug: "colchester",
    name: "Colchester",
    county: "Essex",
    region: "East of England",
    population: "~195,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Colchester removal companies. CO1-CO4 house, flat and student moves with historic-centre and garrison-area experience.",
    intro:
      "Colchester, Britain's oldest recorded town, has a moving market shaped by the historic centre's narrow Roman-era lanes, family suburbs in Highwoods and Stanway, a major university student turnover at Essex, and steady relocations into the garrison community. Movers here handle a remarkably mixed weekly load.",
    workedExample:
      "A 2-bed flat near the town centre usually costs £340-£500. A 4-bed family move from Colchester to London is typically £1,200-£1,800 with packing. Student rooms at Essex often sit at £140-£260.",
    pricingNote:
      "Historic-centre access around the High Street and Castle Park is restricted — smaller vans plus trolley runs are common.",
    commonRoutes: [
      { to: "London (E)", oneBedBand: "£560-£820", notes: "Liverpool St line" },
      { to: "Chelmsford", oneBedBand: "£320-£480" },
      { to: "Ipswich", oneBedBand: "£280-£420" },
      { to: "Braintree", oneBedBand: "£260-£400" },
      { to: "Cambridge", oneBedBand: "£480-£700" },
    ],
    trustPoints: baseTrust("Colchester"),
    faqs: [
      {
        q: "Do movers handle University of Essex student moves at term-end?",
        a: "Yes — late June is a major demand week. Book 4-6 weeks ahead.",
      },
      {
        q: "Can a large van access historic-centre streets?",
        a: "Some — others have time-restricted bollards. Movers will plan around them and often use a shuttle from the closest loading point.",
      },
      {
        q: "Do you cover Highwoods, Stanway and Mile End?",
        a: "Yes, all standard coverage.",
      },
      {
        q: "Are garrison relocations handled?",
        a: "Yes — local movers regularly serve military families relocating to and from the garrison.",
      },
      {
        q: "Is Liverpool Street commuter pricing different?",
        a: "Weekday loads tend to be cheaper than weekends. Saturdays are the busiest day.",
      },
    ],
    sections: ["student", "city", "historic"],
    nearby: ["chelmsford", "ipswich", "braintree", "felixstowe"],
    variantCopy: {
      student:
        "University of Essex term-end weeks are a major demand spike. Per-room and per-house student rates are common.",
      city:
        "Movers handle waterfront-style new builds at Hythe, suburban semis in Highwoods, and historic-centre flats all in the same week.",
      historic:
        "Roman-era street widths near the town centre limit vehicle size. Plan a shuttle to a loading point.",
    },
  },
  {
    slug: "chelmsford",
    name: "Chelmsford",
    county: "Essex",
    region: "East of England",
    population: "~120,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Chelmsford removal companies, free quotes in 24 hours. CM1-CM3 house and flat moves with strong London commuter links.",
    intro:
      "Chelmsford is one of the strongest London commuter cities in Essex, with a moving market dominated by family homes around Springfield, Beaulieu and Great Baddow, and city-centre flats near the station. Movers here handle a heavy weekly flow of relocations both into and out of London.",
    workedExample:
      "A 2-bed flat near the station usually costs £340-£500. A 3-bed family move from Chelmsford to north London is typically £900-£1,350 with packing.",
    pricingNote:
      "City-centre flats often need lift coordination — flag building name when quoting.",
    commonRoutes: [
      { to: "London (E/NE)", oneBedBand: "£520-£780", notes: "Liverpool St line" },
      { to: "Brentwood", oneBedBand: "£260-£400" },
      { to: "Colchester", oneBedBand: "£320-£480" },
      { to: "Basildon", oneBedBand: "£280-£420" },
      { to: "Cambridge", oneBedBand: "£480-£700" },
    ],
    trustPoints: baseTrust("Chelmsford"),
    faqs: [
      {
        q: "Are Liverpool Street commuter moves expensive on weekends?",
        a: "Saturdays are typically 10-20% more than midweek.",
      },
      {
        q: "Do you cover Beaulieu and Springfield new-builds?",
        a: "Yes, all standard pickups.",
      },
      {
        q: "Can movers handle lift-managed apartment blocks near the station?",
        a: "Yes — pre-booked lift slots are routine.",
      },
      {
        q: "How early should I book an end-of-month family move?",
        a: "3-4 weeks ahead.",
      },
    ],
    sections: ["commuter", "city"],
    nearby: ["brentwood", "colchester", "basildon", "braintree"],
    variantCopy: {
      commuter:
        "Chelmsford to London is one of the busiest commuter routes in the East — movers run loads on the A12 daily.",
      city:
        "City-centre flats around the station mix with sprawling family homes in Beaulieu. Different crew sizes, same booking flow.",
    },
  },
  {
    slug: "basildon",
    name: "Basildon",
    county: "Essex",
    region: "East of England",
    population: "~107,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Basildon removal companies. SS13-SS16 house and flat moves with strong London Fenchurch Street commuter links.",
    intro:
      "Basildon's removal market is dominated by family-home turnover across Pitsea, Laindon and Vange, with steady commuter activity to London Fenchurch Street and frequent moves to neighbouring Brentwood and Chelmsford. Movers here keep busy with weekday and weekend bookings year-round.",
    workedExample:
      "A 3-bed semi in Basildon usually costs £460-£680. A move to east London is around £540-£800.",
    pricingNote:
      "End-of-month dates are particularly busy — book 3-4 weeks ahead where possible.",
    commonRoutes: [
      { to: "London (E)", oneBedBand: "£480-£700" },
      { to: "Southend", oneBedBand: "£260-£400" },
      { to: "Chelmsford", oneBedBand: "£280-£420" },
      { to: "Brentwood", oneBedBand: "£240-£360" },
    ],
    trustPoints: baseTrust("Basildon"),
    faqs: [
      {
        q: "Do you cover Pitsea, Laindon and Vange?",
        a: "Yes, all standard pickups.",
      },
      {
        q: "Are weekend Fenchurch Street commuter moves more expensive?",
        a: "Typically 10-15% more.",
      },
      {
        q: "Can I book a same-week midweek move?",
        a: "Often, yes.",
      },
      {
        q: "Do movers handle larger semi-detached family homes?",
        a: "Yes — standard work for Basildon-based crews.",
      },
    ],
    sections: ["commuter"],
    nearby: ["southend-on-sea", "chelmsford", "brentwood"],
    variantCopy: {
      commuter:
        "Fenchurch Street commuters drive a steady flow of weekday moves. Movers often time loads around the morning peak.",
    },
  },
  {
    slug: "harlow",
    name: "Harlow",
    county: "Essex",
    region: "East of England",
    population: "~93,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Harlow removal companies, free quotes in 24 hours. CM17-CM20 house and flat moves with strong London Liverpool Street commuter links.",
    intro:
      "Harlow's removal market spans the original new-town estates, newer developments around Newhall and Gilden Park, and steady commuter activity to London Liverpool Street and Stansted. Movers here handle a high volume of family-home turnover plus regular long-distance jobs.",
    workedExample:
      "A 3-bed home in Harlow usually costs £440-£660. A move to north London is around £460-£680.",
    pricingNote:
      "Stansted relocations are common — flag if you need the mover to handle airport-area pickups.",
    commonRoutes: [
      { to: "London (NE)", oneBedBand: "£440-£640" },
      { to: "Stansted area", oneBedBand: "£260-£400" },
      { to: "Chelmsford", oneBedBand: "£280-£420" },
      { to: "Cambridge", oneBedBand: "£420-£620" },
    ],
    trustPoints: baseTrust("Harlow"),
    faqs: [
      {
        q: "Do you cover Newhall and Gilden Park?",
        a: "Yes, all standard coverage.",
      },
      {
        q: "Are Stansted relocations handled?",
        a: "Yes — regular runs.",
      },
      {
        q: "Can movers handle lift-managed apartment blocks?",
        a: "Yes — pre-booked lift slots are routine.",
      },
      {
        q: "How early should I book a summer move?",
        a: "3-4 weeks ahead.",
      },
    ],
    sections: ["commuter"],
    nearby: ["chelmsford", "brentwood", "braintree"],
    variantCopy: {
      commuter:
        "Liverpool Street and Stansted relocations drive weekday demand. Early-morning loads are common.",
    },
  },
  {
    slug: "braintree",
    name: "Braintree",
    county: "Essex",
    region: "East of England",
    population: "~46,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Braintree removal companies. CM7 house and flat moves with strong A12 and rail commuter links.",
    intro:
      "Braintree sits on the A12 between Chelmsford and Colchester, with a moving market shaped by family suburbs, town-centre flats and steady commuter activity to London Liverpool Street. Movers here handle a mix of urban and surrounding-village pickups.",
    workedExample:
      "A 3-bed home in Braintree usually costs £440-£660. A move to north London is around £540-£800.",
    pricingNote:
      "Surrounding villages can add loading time — flag if you have a long driveway.",
    commonRoutes: [
      { to: "London", oneBedBand: "£500-£740" },
      { to: "Chelmsford", oneBedBand: "£260-£400" },
      { to: "Colchester", oneBedBand: "£260-£400" },
      { to: "Cambridge", oneBedBand: "£480-£700" },
    ],
    trustPoints: baseTrust("Braintree"),
    faqs: [
      {
        q: "Do you cover Witham and Bocking?",
        a: "Yes, standard pickups.",
      },
      {
        q: "Are weekend moves more expensive?",
        a: "Typically 10-15% more on Saturdays.",
      },
      {
        q: "Can I book a same-week midweek move?",
        a: "Often, yes.",
      },
      {
        q: "How early should I book an end-of-month move?",
        a: "3-4 weeks ahead.",
      },
    ],
    sections: ["commuter", "rural"],
    nearby: ["chelmsford", "colchester", "harlow"],
    variantCopy: {
      commuter:
        "Rail commuter activity to Liverpool Street drives weekday demand.",
      rural:
        "Surrounding Essex villages mean rural pickups are common.",
    },
  },
  {
    slug: "brentwood",
    name: "Brentwood",
    county: "Essex",
    region: "East of England",
    population: "~76,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Brentwood removal companies, free quotes in 24 hours. CM13-CM15 house and flat moves with Elizabeth Line commuter links.",
    intro:
      "Brentwood has become one of the most popular London commuter towns thanks to the Elizabeth Line, with a strong removal market for high-value family homes in Shenfield, Hutton and Warley. Movers here handle frequent west-bound runs into east and central London.",
    workedExample:
      "A 3-bed family home in Brentwood usually costs £520-£780. A move to east or central London is typically £700-£1,050.",
    pricingNote:
      "Hutton Mount and Shenfield properties are often larger — confirm room count and item complexity (pianos, art) when quoting.",
    commonRoutes: [
      { to: "London (E/Central)", oneBedBand: "£480-£700", notes: "Elizabeth Line" },
      { to: "Chelmsford", oneBedBand: "£260-£400" },
      { to: "Basildon", oneBedBand: "£240-£360" },
      { to: "Romford", oneBedBand: "£240-£360" },
    ],
    trustPoints: baseTrust("Brentwood"),
    faqs: [
      {
        q: "Do you cover Shenfield, Hutton and Warley?",
        a: "Yes, all standard pickups for Brentwood-based crews.",
      },
      {
        q: "Are large-home moves with pianos and art handled?",
        a: "Yes — common in Hutton Mount. Specialist handling is bookable at quote stage.",
      },
      {
        q: "Are weekend Elizabeth Line commuter moves more expensive?",
        a: "Typically 10-15% more on Saturdays.",
      },
      {
        q: "How early should I book a summer move?",
        a: "3-4 weeks ahead.",
      },
    ],
    sections: ["commuter"],
    nearby: ["chelmsford", "basildon", "harlow"],
    variantCopy: {
      commuter:
        "The Elizabeth Line has made Brentwood one of the most desirable commuter towns east of London. Movers see steady demand year-round.",
    },
  },

  // ===================== BEDFORDSHIRE =====================
  {
    slug: "luton",
    name: "Luton",
    county: "Bedfordshire",
    region: "Home Counties",
    population: "~225,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Luton removal companies, free quotes in 24 hours. LU1-LU4 house, flat and student moves with airport-area and commuter experience.",
    intro:
      "Luton's removal market is one of the busiest in the East — a mix of town-centre flats, family homes across Stopsley and Bushmead, University of Bedfordshire student turnover, and steady relocations driven by London commuting and Luton Airport employment. Movers here handle the full mix weekly.",
    workedExample:
      "A 2-bed flat in central Luton usually costs £340-£500. A 3-bed family move from Luton to north London is typically £750-£1,150. Student room moves around the University of Bedfordshire campus often sit at £140-£260.",
    pricingNote:
      "Airport-area pickups and shift-pattern timings can affect availability — flag if you need an evening or early-morning load.",
    commonRoutes: [
      { to: "London (N)", oneBedBand: "£480-£700", notes: "M1/Thameslink" },
      { to: "Bedford", oneBedBand: "£280-£420" },
      { to: "Milton Keynes", oneBedBand: "£320-£480" },
      { to: "St Albans", oneBedBand: "£260-£400" },
      { to: "Dunstable", oneBedBand: "£220-£340" },
    ],
    trustPoints: baseTrust("Luton"),
    faqs: [
      {
        q: "Do you cover student moves around the University of Bedfordshire campus?",
        a: "Yes — late June and early September are the busiest weeks. Many movers offer per-room rates.",
      },
      {
        q: "Are airport-area or shift-worker pickups handled?",
        a: "Yes — early morning and late evening loads are bookable, sometimes at a small premium.",
      },
      {
        q: "Do you cover Stopsley, Bushmead and Wigmore?",
        a: "Yes, all standard coverage.",
      },
      {
        q: "Is M1 traffic factored into London pricing?",
        a: "Yes — movers price by total time.",
      },
      {
        q: "How early should I book an end-of-month family move?",
        a: "3-4 weeks ahead.",
      },
    ],
    sections: ["student", "commuter"],
    nearby: ["bedford", "dunstable", "leighton-buzzard", "milton-keynes"],
    variantCopy: {
      student:
        "University of Bedfordshire term-end and freshers' weeks are major demand spikes. Per-room rates are common.",
      commuter:
        "Thameslink to St Pancras and the M1 to north London drive a heavy weekday flow. Movers often suggest early starts to make completion deadlines.",
    },
  },
  {
    slug: "bedford",
    name: "Bedford",
    county: "Bedfordshire",
    region: "East of England",
    population: "~106,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Bedford removal companies. MK40-MK45 house, flat and student moves with strong London commuter and East-Midlands experience.",
    intro:
      "Bedford has a varied removal market — riverside flats around the Embankment, family homes in Putnoe and Brickhill, University of Bedfordshire student turnover, and a strong London commuter pull via Thameslink. Movers here handle around 50-60% local moves and 40-50% longer-distance jobs.",
    workedExample:
      "A 1-bed flat move from Bedford to London usually costs £470-£650. Add a piano and that can jump £150-£250. A 3-bed family move from Bedford to Cambridge is around £580-£860.",
    pricingNote:
      "Embankment and riverside flats can have parking restrictions — flag location when quoting.",
    commonRoutes: [
      { to: "London (St Pancras)", oneBedBand: "£470-£650", notes: "Thameslink corridor" },
      { to: "Milton Keynes", oneBedBand: "£300-£440" },
      { to: "Cambridge", oneBedBand: "£420-£620" },
      { to: "Luton", oneBedBand: "£280-£420" },
      { to: "Northampton", oneBedBand: "£340-£500" },
    ],
    trustPoints: baseTrust("Bedford"),
    faqs: [
      {
        q: "Do you cover student moves at the University of Bedfordshire Bedford campus?",
        a: "Yes — busiest in late June and early September.",
      },
      {
        q: "Are Embankment flats handled with parking restrictions?",
        a: "Yes — temporary suspensions or side-street loading are common.",
      },
      {
        q: "Do you cover Kempston, Putnoe and Brickhill?",
        a: "Yes, all standard pickups.",
      },
      {
        q: "Are Thameslink commuter moves common?",
        a: "Yes — a significant share of weekday work.",
      },
      {
        q: "How is a piano or specialty item priced?",
        a: "Pianos typically add £150-£250 depending on type and access. Flag at quote stage.",
      },
    ],
    sections: ["student", "commuter"],
    nearby: ["milton-keynes", "luton", "dunstable", "st-neots"],
    variantCopy: {
      student:
        "University of Bedfordshire's Bedford campus drives student demand spikes in late June and early September.",
      commuter:
        "Thameslink commuter routes to St Pancras give Bedford a steady weekday move flow. Movers often time loads around the morning peak.",
    },
  },
  {
    slug: "dunstable",
    name: "Dunstable",
    county: "Bedfordshire",
    region: "Home Counties",
    population: "~38,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Dunstable removal companies, free quotes in 24 hours. LU5-LU6 house and flat moves with strong M1 and London commuter links.",
    intro:
      "Dunstable sits on the M1 corridor with a moving market shaped by family-home turnover, steady commuter activity to London via Luton, and frequent relocations to and from neighbouring Houghton Regis and Toddington. Movers here handle a high volume of weekday and weekend bookings.",
    workedExample:
      "A 3-bed home in Dunstable usually costs £440-£660. A move to north London is around £540-£800.",
    pricingNote:
      "M1 timing matters — early starts often save 30-60 minutes vs mid-morning loads.",
    commonRoutes: [
      { to: "London (N)", oneBedBand: "£500-£740" },
      { to: "Luton", oneBedBand: "£220-£340" },
      { to: "Milton Keynes", oneBedBand: "£280-£420" },
      { to: "Bedford", oneBedBand: "£280-£420" },
    ],
    trustPoints: baseTrust("Dunstable"),
    faqs: [
      {
        q: "Do you cover Houghton Regis and Toddington?",
        a: "Yes, standard coverage.",
      },
      {
        q: "Are weekend M1 commuter moves more expensive?",
        a: "Typically 10-15% more on Saturdays.",
      },
      {
        q: "Can I book a same-week midweek move?",
        a: "Often, yes.",
      },
      {
        q: "How early should I book an end-of-month move?",
        a: "3-4 weeks ahead.",
      },
    ],
    sections: ["commuter"],
    nearby: ["luton", "leighton-buzzard", "milton-keynes", "bedford"],
    variantCopy: {
      commuter:
        "M1 corridor activity drives a heavy weekday flow. Early starts are commonly suggested.",
    },
  },
  {
    slug: "ampthill",
    name: "Ampthill",
    county: "Bedfordshire",
    region: "East of England",
    population: "~8,000",
    titleVariant: "removals",
    metaDescription:
      "Free quotes from vetted Ampthill removal companies. MK45 house moves with historic-centre and rural-village experience.",
    intro:
      "Ampthill is a small Bedfordshire market town with a removal market shaped by Georgian period properties around the centre, family homes in surrounding villages, and steady commuter activity to Bedford, Milton Keynes and beyond. Movers here often handle conservation-area access and rural pickups in the same week.",
    workedExample:
      "A 3-bed period home in Ampthill usually costs £480-£720. A move to Bedford is around £260-£400.",
    pricingNote:
      "Period properties may need extra protective handling — flag fragile features when quoting.",
    commonRoutes: [
      { to: "Bedford", oneBedBand: "£240-£360" },
      { to: "Milton Keynes", oneBedBand: "£280-£420" },
      { to: "Luton", oneBedBand: "£260-£400" },
      { to: "London", oneBedBand: "£640-£940" },
    ],
    trustPoints: baseTrust("Ampthill"),
    faqs: [
      {
        q: "Do you cover Flitwick and Maulden?",
        a: "Yes, standard pickups.",
      },
      {
        q: "Are Georgian period property features handled with care?",
        a: "Yes — protective covers and corner pads are standard.",
      },
      {
        q: "Can I book a same-week midweek move?",
        a: "Often, yes.",
      },
      {
        q: "Are larger country homes handled?",
        a: "Yes — common around Ampthill.",
      },
    ],
    sections: ["historic", "rural"],
    nearby: ["bedford", "luton", "milton-keynes", "leighton-buzzard"],
    variantCopy: {
      historic:
        "Georgian period properties in the centre require extra care. Movers typically allow protective covers and corner pads.",
      rural:
        "Surrounding villages mean rural pickups are common.",
    },
  },
  {
    slug: "leighton-buzzard",
    name: "Leighton Buzzard",
    county: "Bedfordshire",
    region: "Home Counties",
    population: "~38,000",
    titleVariant: "removals",
    metaDescription:
      "Vetted Leighton Buzzard removal companies, free quotes in 24 hours. LU7 house and flat moves with strong London Euston commuter links.",
    intro:
      "Leighton Buzzard is a busy commuter town with steady Euston-line rail traffic, family-home turnover across Linslade and Heath and Reach, and frequent moves to neighbouring Milton Keynes and Dunstable. Movers here handle high weekday volumes throughout the year.",
    workedExample:
      "A 3-bed home in Leighton Buzzard usually costs £440-£660. A move to north London is around £580-£860.",
    pricingNote:
      "Linslade station-area pickups often need parking coordination — flag location when quoting.",
    commonRoutes: [
      { to: "London (Euston)", oneBedBand: "£500-£740" },
      { to: "Milton Keynes", oneBedBand: "£240-£360" },
      { to: "Luton", oneBedBand: "£260-£400" },
      { to: "Dunstable", oneBedBand: "£220-£340" },
      { to: "Bedford", oneBedBand: "£280-£420" },
    ],
    trustPoints: baseTrust("Leighton Buzzard"),
    faqs: [
      {
        q: "Do you cover Linslade and Heath and Reach?",
        a: "Yes, all standard pickups.",
      },
      {
        q: "Are weekend Euston commuter moves more expensive?",
        a: "Typically 10-15% more.",
      },
      {
        q: "Can I book a same-week midweek move?",
        a: "Often, yes.",
      },
      {
        q: "How early should I book an end-of-month move?",
        a: "3-4 weeks ahead.",
      },
    ],
    sections: ["commuter"],
    nearby: ["milton-keynes", "dunstable", "luton", "bedford"],
    variantCopy: {
      commuter:
        "London Euston commuter activity drives a steady weekday flow. Early starts are commonly suggested for London completions.",
    },
  },
];

export function getLocationBySlug(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}

export function getLocationsByCounty() {
  return locations.reduce<Record<string, Location[]>>((acc, loc) => {
    (acc[loc.county] ||= []).push(loc);
    return acc;
  }, {});
}
