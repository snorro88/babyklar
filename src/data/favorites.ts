import type { Favorite, FavoriteGroup } from '@/types';

/**
 * "Safe favourites" is an INDEPENDENT editorial/test-based selection.
 * No commercial deal affects who is listed or the ordering.
 * DEMO DATA in the MVP — test and user numbers are illustrative, not real measurements.
 * For safety-critical groups it leads with test/safety, not stars.
 */
export const FAVORITE_GROUPS: FavoriteGroup[] = [
  {
    id: 'carSeat',
    label: 'Bilstol (0–13 kg)',
    category: 'transport',
    keywords: ['bilstol'],
    lookFor:
      'Se etter godkjenning etter R129 (i-Size) og gode kollisjonstester. Kjøp alltid ny – brukt bilstol med ukjent historikk frarådes.',
    safetyCritical: true,
  },
  {
    id: 'stroller',
    label: 'Vogn / trillevogn',
    category: 'transport',
    keywords: ['vogn', 'trille'],
    lookFor:
      'Se etter liggeflate egnet for nyfødt, god demping og en vekt som passer hverdagen deres. Brukt er ofte helt greit.',
    safetyCritical: false,
  },
  {
    id: 'carrier',
    label: 'Bæresele / bæretørkle',
    category: 'transport',
    keywords: ['bæresele', 'bæretørkle'],
    lookFor:
      'Se etter ergonomisk M-stilling for hoftene og god nakkestøtte for nyfødt.',
    safetyCritical: false,
  },
];

export const FAVORITES: Favorite[] = [
  // Car seat — safety-critical, leads with test/approval
  {
    id: 'fav_carseat_besafe',
    groupId: 'carSeat',
    product: 'iZi Go Modular X2 i-Size',
    brand: 'BeSafe',
    editorialBadge: 'Testvinner 2026',
    testSource: 'NAF / Forbrukerrådet 2026',
    rating: 4.7,
    reviewCount: 1240,
    priceFrom: 3990,
    why: 'Topp kollisjonsbeskyttelse og tydelig merking som gjør riktig montering enkel.',
    demo: true,
  },
  {
    id: 'fav_carseat_cybex',
    groupId: 'carSeat',
    product: 'Cloud T i-Size',
    brand: 'Cybex',
    editorialBadge: 'Godkjent (i-Size)',
    testSource: 'Delvis test 2025',
    rating: 4.6,
    reviewCount: 860,
    priceFrom: 4490,
    why: 'God sidekollisjonsbeskyttelse og ligger tilnærmet flatt for nyfødt.',
    demo: true,
  },
  {
    id: 'fav_carseat_maxicosi',
    groupId: 'carSeat',
    product: 'Pebble 360 Pro',
    brand: 'Maxi-Cosi',
    editorialBadge: 'Godkjent (i-Size)',
    rating: 4.5,
    reviewCount: 2100,
    priceFrom: 3790,
    why: 'Roterer mot bildøra for enklere i- og utløfting av barnet.',
    demo: true,
  },
  // Stroller — not safety-critical in the same way, editorial selection
  {
    id: 'fav_stroller_emmaljunga',
    groupId: 'stroller',
    product: 'NXT',
    brand: 'Emmaljunga',
    editorialBadge: 'Populær i Norge',
    rating: 4.5,
    reviewCount: 1500,
    priceFrom: 10990,
    why: 'Robust for vinter og ulendt underlag – bygget for norsk klima.',
    demo: true,
  },
  {
    id: 'fav_stroller_bugaboo',
    groupId: 'stroller',
    product: 'Fox 5',
    brand: 'Bugaboo',
    rating: 4.6,
    reviewCount: 980,
    priceFrom: 12990,
    why: 'Myk demping og lett å manøvrere med én hånd.',
    demo: true,
  },
  {
    id: 'fav_stroller_stokke',
    groupId: 'stroller',
    product: 'Xplory X',
    brand: 'Stokke',
    editorialBadge: 'Redaksjonens favoritt',
    rating: 4.4,
    reviewCount: 540,
    priceFrom: 9990,
    why: 'Høy sittehøyde gir tettere kontakt med barnet.',
    demo: true,
  },
  // Carrier — editorial, ergonomics in focus
  {
    id: 'fav_carrier_babybjorn',
    groupId: 'carrier',
    product: 'Harmony',
    brand: 'BabyBjörn',
    editorialBadge: 'Best på ergonomi',
    rating: 4.7,
    reviewCount: 1600,
    priceFrom: 2290,
    why: 'God rygg- og hoftestøtte som holder for lange turer.',
    demo: true,
  },
  {
    id: 'fav_carrier_ergobaby',
    groupId: 'carrier',
    product: 'Omni 360',
    brand: 'Ergobaby',
    rating: 4.6,
    reviewCount: 1300,
    priceFrom: 1990,
    why: 'Vokser med barnet og støtter flere bæremåter.',
    demo: true,
  },
  {
    id: 'fav_carrier_najell',
    groupId: 'carrier',
    product: 'Original',
    brand: 'Najell',
    rating: 4.5,
    reviewCount: 720,
    priceFrom: 1490,
    why: 'Enkel ergonomisk M-stilling med lite justering.',
    demo: true,
  },
];
