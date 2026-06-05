// town-extras.ts - Per-town bespoke lines woven into the price-guide content.
// Two short sentences per slug:
//   - accessNote: local access reality, surfaced in PriceExplainer
//   - surveyTip:  what to flag in a pre-move survey, surfaced in WhatAffectsYourQuote
// Keeps the shared section structure consistent while giving each town its own voice.

export interface TownExtras {
  accessNote: string;
  surveyTip: string;
}

export const TOWN_EXTRAS: Record<string, TownExtras> = {
  "milton-keynes": {
    accessNote:
      "Grid roads keep journeys quick, but estate cul-de-sacs and Central Milton Keynes loading bays fill fast on Saturdays, so most local crews prefer an early start.",
    surveyTip:
      "Flag garage-to-house parking distance and any new-build estate width restrictions when you book the survey.",
  },
  peterborough: {
    accessNote:
      "Cathedral Square loading windows are tight and several city-centre streets are permit-only, so timing matters as much as crew size.",
    surveyTip:
      "Mention loft access in older Victorian terraces and lift booking windows in city-centre apartment blocks.",
  },
  cambridge: {
    accessNote:
      "Many college-area streets are permit-only with narrow Georgian staircases, so a small Luton van and an experienced two- or three-person crew often beats a 7.5-tonne lorry.",
    surveyTip:
      "Flag listed-building stair turns and any college porter access windows in your survey.",
  },
  "st-neots": {
    accessNote:
      "High-street parking restrictions and weekend market days around the Market Square shape what time most crews like to load.",
    surveyTip:
      "Note riverside cottage access and any narrow lane approaches when the surveyor visits.",
  },
  wisbech: {
    accessNote:
      "Georgian terraces along the Brinks have narrow doorways and listed-building rules, so movers often pad frames and remove banister rails carefully.",
    surveyTip:
      "Mention any listed-building consents in place and flag tight stair turns up front.",
  },
  huntingdon: {
    accessNote:
      "One-way systems around the High Street and limited loading on weekdays mean most movers prefer an early or mid-morning start.",
    surveyTip:
      "Point out townhouse rear-courtyard parking and any pedestrianised zones near your address.",
  },
  ely: {
    accessNote:
      "The cathedral conservation area and surrounding cobbled lanes restrict large vehicles, so most local crews use a smaller van and shuttle if needed.",
    surveyTip:
      "Flag any listed-building items, low door heads, and consented alterations during the survey.",
  },
  "st-ives": {
    accessNote:
      "The Quay and one-way Crown Street loop need careful timing, especially on market days when loading bays are at a premium.",
    surveyTip:
      "Mention cottage stair widths and whether items will need to come out through a window or French door.",
  },
  norwich: {
    accessNote:
      "The Lanes are pedestrianised and many medieval-centre streets are permit-only, so a small van plus a short shuttle from the nearest legal load point is the norm.",
    surveyTip:
      "Flag tight medieval doorways, cobbled approaches, and any flat conversions with shared stairwells.",
  },
  "great-yarmouth": {
    accessNote:
      "Seafront and Marine Parade parking is permit- and meter-controlled in summer, so most movers prefer early starts to secure a loading spot.",
    surveyTip:
      "Mention tall terrace stair counts and loft conversion access when booking the survey.",
  },
  "kings-lynn": {
    accessNote:
      "Historic quayside streets and listed merchants' houses around Tuesday Market Place limit van size, so shuttle loading is common.",
    surveyTip:
      "Flag cellar removals, low ceilings, and any conservation-area consent restrictions.",
  },
  thetford: {
    accessNote:
      "Forest-edge villages around Thetford often have long unmade driveways, so confirm the surface and turning room when you book.",
    surveyTip:
      "Mention driveway gradient and any soft verges that would slow a loaded van.",
  },
  wymondham: {
    accessNote:
      "Market town one-way systems and weekend market loading mean a midweek slot is usually the quickest and cheapest.",
    surveyTip:
      "Flag cottage stair turns and any low-beamed rooms during the pre-move survey.",
  },
  dereham: {
    accessNote:
      "Loading bays around the Market Place are time-restricted, so most crews stage a smaller van and shuttle from a nearby car park.",
    surveyTip:
      "Mention rural cottage approaches, gravel drives, and any sheds or outbuildings included in the move.",
  },
  attleborough: {
    accessNote:
      "Village lanes around Attleborough are narrow with limited passing places, so larger vans need a confirmed turning point.",
    surveyTip:
      "Flag verge softness, overhanging hedges, and whether the lorry can reverse to the door.",
  },
  ipswich: {
    accessNote:
      "Waterfront one-way systems and town-centre permit zones change with the time of day, so confirm the loading window with your mover the day before.",
    surveyTip:
      "Mention Victorian terrace bay-window access and any loft or cellar items in the survey.",
  },
  lowestoft: {
    accessNote:
      "Seafront promenade parking is tightly controlled in season, and many tall terrace houses have steep stairs that need an extra crew member.",
    surveyTip:
      "Flag stair counts, loft conversions, and any items that will need to come out through a sash window.",
  },
  "bury-st-edmunds": {
    accessNote:
      "Georgian streets in the conservation area limit van size, and Saturday market days close several loading streets entirely.",
    surveyTip:
      "Mention listed-building consents, low door heads, and any antique pieces during the survey.",
  },
  haverhill: {
    accessNote:
      "Weekday markets shut off parts of the town centre, and new-build estates around the edge of town have narrow shared driveways.",
    surveyTip:
      "Flag estate parking restrictions and any items needing dismantling, such as flat-pack wardrobes.",
  },
  felixstowe: {
    accessNote:
      "Seafront resident-permit zones run year-round, so movers usually arrange a temporary suspension or load from a nearby pay-and-display.",
    surveyTip:
      "Mention ground-floor apartment access, lift availability, and any storage outbuildings.",
  },
  newmarket: {
    accessNote:
      "Race-day road closures and stable-area restrictions change the best loading time week to week, so confirm the booking against the racing calendar.",
    surveyTip:
      "Flag any tack, equestrian, or studio cottage items that need specialist handling.",
  },
  stowmarket: {
    accessNote:
      "Tuesday and Saturday market days close parts of the town centre, and many older properties have narrow front doorways.",
    surveyTip:
      "Mention any items that may need to come out through a back garden gate or French doors.",
  },
  "southend-on-sea": {
    accessNote:
      "Seafront and cliff-top parking is permit- and meter-controlled, and many converted flats have top-floor access without a lift.",
    surveyTip:
      "Flag floor counts, lift availability, and any pianos or large furniture in upper-floor flats.",
  },
  colchester: {
    accessNote:
      "Roman-era lanes in the Dutch Quarter and around the High Street are narrow and one-way, so most movers use a smaller van and shuttle.",
    surveyTip:
      "Mention period-property stair turns and any listed-building constraints during the survey.",
  },
  chelmsford: {
    accessNote:
      "City-centre permit zones and new-build apartment blocks both require loading windows to be booked in advance.",
    surveyTip:
      "Confirm lift dimensions, concierge access, and any out-of-hours move-in restrictions with your building.",
  },
  basildon: {
    accessNote:
      "Estate cul-de-sacs and town-centre tower blocks dominate local moves, so lift bookings and tight reversing spots are the usual constraints.",
    surveyTip:
      "Flag lift size, communal corridor turns, and any items that may need to be dismantled.",
  },
  harlow: {
    accessNote:
      "Many Harlow new-town courtyards have narrow service roads and shared parking, so movers usually confirm a loading spot with neighbours in advance.",
    surveyTip:
      "Mention high-rise lift booking windows and any items that will need to come through internal stairwells.",
  },
  braintree: {
    accessNote:
      "Town-centre market days and surrounding village cottage access shape what time most crews prefer to load.",
    surveyTip:
      "Flag cottage stair widths, low beams, and any garage or outbuilding contents to include in the move.",
  },
  brentwood: {
    accessNote:
      "High Street pay-and-display bays fill quickly on weekdays, and many large detached properties have long gravel driveways.",
    surveyTip:
      "Mention driveway surface, gate widths, and any items in detached garages or studios.",
  },
  luton: {
    accessNote:
      "Town-centre one-way systems and dense terraced-street parking mean an early or midweek slot usually saves the most time.",
    surveyTip:
      "Flag terrace stair turns, bay-window furniture, and any items in loft or cellar spaces.",
  },
  bedford: {
    accessNote:
      "Embankment and town-centre loading bays are time-restricted, and many Victorian terraces have narrow hallways and steep stairs.",
    surveyTip:
      "Mention any pianos, large wardrobes, or items that will need to come out through a sash window.",
  },
  dunstable: {
    accessNote:
      "Town centre A5 traffic shapes load timing, and many post-war townhouses have integral garages that double as load-out points.",
    surveyTip:
      "Flag garage access, stair turns, and any items still in the loft when the surveyor visits.",
  },
  ampthill: {
    accessNote:
      "The Georgian Market Square and surrounding narrow lanes restrict van size, so movers often stage a smaller vehicle and shuttle.",
    surveyTip:
      "Mention listed-building constraints, low door heads, and any antique items during the survey.",
  },
  "leighton-buzzard": {
    accessNote:
      "High Street market day and canal-side cottage access mean confirming the loading point with your mover the day before pays off.",
    surveyTip:
      "Flag canal-side approaches, cottage stair widths, and any garden or towpath access in the survey.",
  },
};

export function getTownExtras(slug: string): TownExtras | undefined {
  return TOWN_EXTRAS[slug];
}
