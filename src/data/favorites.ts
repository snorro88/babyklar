import type { Favorite, FavoriteGroup } from '@/types';

/**
 * "Safe favourites" is an INDEPENDENT editorial selection based on well-known,
 * widely available products. No commercial deal affects who is listed or the ordering.
 * Deliberately carries NO invented star ratings, review counts or prices — the
 * `lookFor` guidance and a live Prisjakt link are the honest signals.
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
  // Car seat — safety-critical
  {
    id: 'fav_carseat_besafe',
    groupId: 'carSeat',
    product: 'iZi Go Modular X2 i-Size',
    brand: 'BeSafe',
    why: 'Topp kollisjonsbeskyttelse og tydelig merking som gjør riktig montering enkel.',
    demo: true,
  },
  {
    id: 'fav_carseat_cybex',
    groupId: 'carSeat',
    product: 'Cloud T i-Size',
    brand: 'Cybex',
    why: 'God sidekollisjonsbeskyttelse og ligger tilnærmet flatt for nyfødt.',
    demo: true,
  },
  {
    id: 'fav_carseat_maxicosi',
    groupId: 'carSeat',
    product: 'Pebble 360 Pro',
    brand: 'Maxi-Cosi',
    why: 'Roterer mot bildøra for enklere i- og utløfting av barnet.',
    demo: true,
  },
  // Stroller — editorial selection
  {
    id: 'fav_stroller_emmaljunga',
    groupId: 'stroller',
    product: 'NXT',
    brand: 'Emmaljunga',
    why: 'Robust for vinter og ulendt underlag – bygget for norsk klima.',
    demo: true,
  },
  {
    id: 'fav_stroller_bugaboo',
    groupId: 'stroller',
    product: 'Fox 5',
    brand: 'Bugaboo',
    why: 'Myk demping og lett å manøvrere med én hånd.',
    demo: true,
  },
  {
    id: 'fav_stroller_stokke',
    groupId: 'stroller',
    product: 'Xplory X',
    brand: 'Stokke',
    why: 'Høy sittehøyde gir tettere kontakt med barnet.',
    demo: true,
  },
  // Carrier — editorial, ergonomics in focus
  {
    id: 'fav_carrier_babybjorn',
    groupId: 'carrier',
    product: 'Harmony',
    brand: 'BabyBjörn',
    why: 'God rygg- og hoftestøtte som holder for lange turer.',
    demo: true,
  },
  {
    id: 'fav_carrier_ergobaby',
    groupId: 'carrier',
    product: 'Omni 360',
    brand: 'Ergobaby',
    why: 'Vokser med barnet og støtter flere bæremåter.',
    demo: true,
  },
  {
    id: 'fav_carrier_najell',
    groupId: 'carrier',
    product: 'Original',
    brand: 'Najell',
    why: 'Enkel ergonomisk M-stilling med lite justering.',
    demo: true,
  },
];
