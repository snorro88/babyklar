import type { BagSectionId, CategoryId, GarmentRow, Item, Priority, Status, Task, WishItem } from '@/types';

export const CATEGORIES: {
  id: CategoryId;
  label: string;
  icon: string;
  tint: string;
  softTint: string;
}[] = [
  { id: 'sleep', label: 'Søvn', icon: 'moon-waning-crescent', tint: '#8279BE', softTint: '#EDEAF8' },
  { id: 'clothes', label: 'Klær', icon: 'tshirt-crew-outline', tint: '#4E8D7C', softTint: '#E4F0EC' },
  { id: 'care', label: 'Stell', icon: 'water-outline', tint: '#4E86A0', softTint: '#E3EEF3' },
  { id: 'transport', label: 'Transport', icon: 'baby-carriage', tint: '#DE8A63', softTint: '#FBEAE0' },
  { id: 'food', label: 'Mat', icon: 'cup-outline', tint: '#C08457', softTint: '#F7EBE0' },
  { id: 'hospitalBag', label: 'Sykehusbag', icon: 'bag-personal-outline', tint: '#B0688A', softTint: '#F7E8EE' },
  { id: 'other', label: 'Annet', icon: 'dots-horizontal-circle-outline', tint: '#6E7B8A', softTint: '#EAEDF1' },
];

export const categoryMeta = (id: CategoryId) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

export const PRIORITY_LABEL: Record<Priority, string> = {
  important: 'Viktig',
  'can-wait': 'Kan vente',
  optional: 'Valgfritt',
};

export const STATUS_LABEL: Record<Status, string> = {
  have: 'Har',
  missing: 'Mangler',
  want: 'Ønsker',
  'to-buy': 'Skal kjøpe',
  ordered: 'Bestilt',
  'not-needed': 'Trenger ikke',
  stored: 'Lagret',
  outgrown: 'Vokst ut av',
};

/** Statuses that count as "in the bag" toward progress. */
export const DONE_STATUSES: Status[] = ['have', 'ordered', 'stored'];

export const BAG_SECTIONS: { id: BagSectionId; label: string; icon: string }[] = [
  { id: 'mother', label: 'Til mor', icon: 'human-female' },
  { id: 'baby', label: 'Til baby', icon: 'baby-face-outline' },
  { id: 'partner', label: 'Til partner', icon: 'account-outline' },
  { id: 'practical', label: 'Praktisk', icon: 'bag-checked' },
];

type Seed = Omit<Item, 'id'>;

const seed = (
  name: string,
  category: CategoryId,
  priority: Priority,
  status: Status,
  quantity = 1,
  extra: Partial<Item> = {},
): Seed => ({ name, category, priority, status, quantity, ...extra });

export const CATALOG: Seed[] = [
  // Sleep
  seed('Bedside crib', 'sleep', 'important', 'have', 1, { why: 'Et trygt sovested er noe av det første dere trenger.', origin: 'bought', price: 3200 }),
  seed('Madrass', 'sleep', 'important', 'have', 1, { why: 'Skal være fast og passe sengen uten mellomrom.', price: 900 }),
  seed('Laken', 'sleep', 'important', 'have', 3, { why: 'Regn 2–3 stk. Uhell skjer om natten.', price: 150 }),
  seed('Sovepose 0–6 mnd', 'sleep', 'important', 'missing', 2, { why: 'Tryggere enn dyne de første månedene.', price: 450 }),
  seed('Nattlys', 'sleep', 'optional', 'missing', 1, { why: 'Kjekt ved nattamming og bleieskift.', price: 300 }),
  seed('Babycall', 'sleep', 'can-wait', 'missing', 1, { why: 'Trengs først når barnet sover i eget rom.', price: 1200 }),

  // Clothes
  seed('Body str. 56', 'clothes', 'important', 'have', 6, { size: '56', why: '6–8 stk holder i starten.', origin: 'inherited' }),
  seed('Pysj str. 56', 'clothes', 'important', 'missing', 3, { size: '56', why: 'Dere har 2 – anbefalt er 3–5.' }),
  seed('Bukse str. 56', 'clothes', 'important', 'have', 4, { size: '56' }),
  seed('Ullbody str. 56', 'clothes', 'important', 'missing', 2, { size: '56', why: 'Ull under klærne holder temperaturen stabil.' }),
  seed('Sokker', 'clothes', 'important', 'have', 6, { size: '56' }),
  seed('Lue str. 56', 'clothes', 'important', 'have', 2, { size: '56' }),
  seed('Yttertøy / dress', 'clothes', 'can-wait', 'missing', 1, { why: 'Kjøp når dere vet årstid og størrelse.' }),
  seed('Votter', 'clothes', 'can-wait', 'missing', 2),
  seed('Selskapsantrekk', 'clothes', 'optional', 'not-needed', 1, { why: 'Koselig, men helt unødvendig.' }),

  // Care
  seed('Bleier str. 1', 'care', 'important', 'have', 1, { note: '1 pakke – ikke hamstre, barnet vokser fort.' }),
  seed('Stellematte', 'care', 'important', 'have', 1),
  seed('Vaskekluter', 'care', 'important', 'have', 10, { why: 'Vann og klut holder lenge – trenger ikke våtservietter.' }),
  seed('Digitalt termometer', 'care', 'important', 'missing', 1),
  seed('Neglefil for baby', 'care', 'important', 'missing', 1, { why: 'Fil er tryggere enn saks de første ukene.' }),
  seed('Badekar', 'care', 'can-wait', 'missing', 1, { why: 'Vasken funker fint i begynnelsen.', price: 400 }),
  seed('Stellebord', 'care', 'can-wait', 'missing', 1, { price: 2000 }),
  seed('Babyolje og kremer', 'care', 'optional', 'missing', 1, { why: 'Sjelden nødvendig på nyfødt hud.' }),

  // Transport
  seed('Bilstol gr. 0+', 'transport', 'important', 'missing', 1, { why: 'Må være på plass før hjemreise fra sykehuset.', price: 3500 }),
  seed('Vogn med bag', 'transport', 'important', 'have', 1, { origin: 'inherited', place: 'Boden', price: 7000 }),
  seed('Regntrekk til vogn', 'transport', 'important', 'missing', 1, { price: 350 }),
  seed('Myggnetting', 'transport', 'optional', 'missing', 1, { price: 200 }),
  seed('Bæresele / bæretørkle', 'transport', 'can-wait', 'missing', 1, { why: 'Mange venter til barnet er født og prøver først.', price: 1800 }),
  seed('Vognpose', 'transport', 'can-wait', 'missing', 1, { price: 900 }),

  // Food
  seed('Smekker', 'food', 'can-wait', 'missing', 4),
  seed('Tåteflaske', 'food', 'optional', 'missing', 2, { why: 'Kjøp én først – dere vet ikke hva som passer ennå.' }),
  seed('Ammepute / støttepute', 'food', 'optional', 'have', 1, { origin: 'gift', price: 600 }),
  seed('Sterilisator', 'food', 'optional', 'not-needed', 1, { why: 'Vanlig oppvask holder i de aller fleste tilfeller.' }),
  seed('Høystol', 'food', 'can-wait', 'missing', 1, { why: 'Først aktuelt rundt 6 måneder.', price: 1500 }),

  // Hospital bag
  seed('Bag: klær til mor', 'hospitalBag', 'important', 'missing', 1, { bagFor: 'mother', note: 'Behagelig, løst og med god åpning foran.' }),
  seed('Bag: toalettsaker', 'hospitalBag', 'important', 'missing', 1, { bagFor: 'mother' }),
  seed('Bag: bind til barsel', 'hospitalBag', 'important', 'missing', 1, { bagFor: 'mother' }),
  seed('Bag: body og lue til baby', 'hospitalBag', 'important', 'have', 2, { bagFor: 'baby', size: '50' }),
  seed('Bag: hjemreisetøy til baby', 'hospitalBag', 'important', 'missing', 1, { bagFor: 'baby' }),
  seed('Bag: snacks og drikke', 'hospitalBag', 'can-wait', 'missing', 1, { bagFor: 'practical' }),
  seed('Bag: ladekabel (lang)', 'hospitalBag', 'can-wait', 'missing', 1, { bagFor: 'practical' }),
  seed('Bag: klær til partner', 'hospitalBag', 'can-wait', 'missing', 1, { bagFor: 'partner' }),
];

export const TASKS: Omit<Task, 'id'>[] = [
  { title: 'Skaff bilstol', done: false, dueWeeksBefore: 6, category: 'transport' },
  { title: 'Bestem sovested', done: false, dueWeeksBefore: 8, category: 'sleep' },
  { title: 'Begynn på sykehusbagen', done: false, dueWeeksBefore: 5, category: 'hospitalBag' },
  { title: 'Vask babyklær', done: false, dueWeeksBefore: 4, category: 'clothes' },
  { title: 'Monter vogn og sjekk hjul', done: true, dueWeeksBefore: 8, category: 'transport' },
  { title: 'Meld fra til arbeidsgiver om permisjon', done: true, dueWeeksBefore: 12 },
  { title: 'Finn fram tingene fra boden', done: false, dueWeeksBefore: 10 },
  { title: 'Del ønskeliste med familien', done: false, dueWeeksBefore: 7 },
];

export const WISHES: Omit<WishItem, 'id'>[] = [
  { name: 'Ullbody str. 62', size: '62', priority: 'high', usedOk: true, note: 'Gjerne merino.' },
  { name: 'Regntrekk til vogn', priority: 'high', usedOk: true },
  { name: 'Bæresele', priority: 'medium', usedOk: true, note: 'Helst en vi kan prøve først.', reservedBy: 'Mormor' },
  { name: 'Pysj str. 62', size: '62', priority: 'medium', usedOk: true },
  { name: 'Bok: «God natt, alle sammen»', priority: 'low', usedOk: false },
];

export const WARDROBE: Record<string, GarmentRow[]> = {
  '50': [
    { type: 'Body', have: 4, min: 4, max: 6 },
    { type: 'Pysj', have: 2, min: 2, max: 4 },
    { type: 'Lue', have: 2, min: 1, max: 2 },
  ],
  '56': [
    { type: 'Body', have: 6, min: 6, max: 8 },
    { type: 'Bukse', have: 4, min: 4, max: 6 },
    { type: 'Pysj', have: 2, min: 3, max: 5 },
    { type: 'Ullbody', have: 0, min: 1, max: 2 },
    { type: 'Sokker', have: 6, min: 4, max: 8 },
  ],
  '62': [
    { type: 'Body', have: 7, min: 6, max: 8 },
    { type: 'Bukse', have: 4, min: 4, max: 6 },
    { type: 'Pysj', have: 2, min: 3, max: 5 },
    { type: 'Ullbody', have: 0, min: 1, max: 2 },
    { type: 'Yttertøy', have: 0, min: 1, max: 1 },
  ],
  '68': [
    { type: 'Body', have: 3, min: 6, max: 8 },
    { type: 'Bukse', have: 2, min: 4, max: 6 },
    { type: 'Pysj', have: 1, min: 3, max: 5 },
    { type: 'Ullbody', have: 0, min: 1, max: 2 },
  ],
  '74': [
    { type: 'Body', have: 0, min: 6, max: 8 },
    { type: 'Bukse', have: 0, min: 4, max: 6 },
    { type: 'Pysj', have: 0, min: 3, max: 5 },
  ],
};

export const SIZES = ['50', '56', '62', '68', '74', '80'];

/** Recommended minimum per size, used when the wardrobe is not yet registered. */
export const GARMENT_TEMPLATE: GarmentRow[] = [
  { type: 'Body', have: 0, min: 6, max: 8 },
  { type: 'Bukse', have: 0, min: 4, max: 6 },
  { type: 'Pysj', have: 0, min: 3, max: 5 },
  { type: 'Ullbody', have: 0, min: 1, max: 2 },
  { type: 'Sokker', have: 0, min: 4, max: 8 },
];

/** Simulated AI matches for the demo. */
export const AI_SUGGESTIONS: { label: string; items: { name: string; category: CategoryId; size?: string; quantity: number }[] }[] = [
  {
    label: 'Bunke med klær',
    items: [
      { name: 'Body', category: 'clothes', size: '56', quantity: 4 },
      { name: 'Bukse', category: 'clothes', size: '56', quantity: 2 },
      { name: 'Ullbody', category: 'clothes', size: '62', quantity: 1 },
    ],
  },
  {
    label: 'Produkteske',
    items: [{ name: 'Bilstol gr. 0+', category: 'transport', quantity: 1 }],
  },
  {
    label: 'Boks fra boden',
    items: [
      { name: 'Pysj', category: 'clothes', size: '62', quantity: 3 },
      { name: 'Sovepose 0–6 mnd', category: 'sleep', quantity: 1 },
      { name: 'Smekker', category: 'food', quantity: 5 },
    ],
  },
];
