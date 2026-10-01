export type CategoryId = 'sleep' | 'clothes' | 'care' | 'transport' | 'food' | 'hospitalBag';

export type Priority = 'important' | 'can-wait' | 'optional';

export type Status =
  | 'have'
  | 'missing'
  | 'want'
  | 'to-buy'
  | 'ordered'
  | 'not-needed'
  | 'stored'
  | 'outgrown';

export type Situation = 'first' | 'has-child' | 'born';

export type BagSectionId = 'mother' | 'baby' | 'partner' | 'practical';

export type FocusArea =
  | 'equipment'
  | 'clothes'
  | 'hospitalBag'
  | 'wishlist'
  | 'owned'
  | 'tasks'
  | 'budget';

export interface Item {
  id: string;
  name: string;
  category: CategoryId;
  priority: Priority;
  status: Status;
  quantity: number;
  size?: string;
  brand?: string;
  note?: string;
  place?: string;
  origin?: 'bought' | 'inherited' | 'gift';
  custom?: boolean;
  /** Estimated or actual price in NOK, per unit. */
  price?: number;
  /** Which section of the hospital bag the item belongs to. */
  bagFor?: BagSectionId;
  /** Short explanation of why this is on the list — builds trust. */
  why?: string;
}

export interface Task {
  id: string;
  title: string;
  done: boolean;
  /** Weeks before the due date when the task should typically be done. */
  dueWeeksBefore: number;
  category?: CategoryId;
}

export interface WishItem {
  id: string;
  name: string;
  size?: string;
  note?: string;
  link?: string;
  priority: 'high' | 'medium' | 'low';
  usedOk: boolean;
  reservedBy?: string;
  bought?: boolean;
}

export interface GarmentRow {
  type: string;
  have: number;
  min: number;
  max: number;
}

export interface Household {
  onboarded: boolean;
  situation: Situation;
  /** ISO date for the due date or birth date. */
  dueDate: string;
  babyName?: string;
  hasCar: boolean;
  hasHandMeDowns: boolean;
  sharesWithPartner: boolean;
  focus: FocusArea[];
  currentSize: string;
  /** Fills the app with a pre-filled example home, for showing it to someone. */
  demoData: boolean;
}

export interface AppState {
  household: Household;
  items: Item[];
  tasks: Task[];
  wishes: WishItem[];
  wardrobe: Record<string, GarmentRow[]>;
}

/** Product type that "Safe favourites" are grouped by, e.g. car seat or stroller. */
export interface FavoriteGroup {
  id: string;
  label: string;
  category: CategoryId;
  /** Keywords (lowercase) to link the group to an item on the needs list. */
  keywords: string[];
  /** Short editorial guidance on what to look for. */
  lookFor: string;
  /** New-only and manually curated. Leads with test/safety rather than stars. */
  safetyCritical: boolean;
}

export interface Favorite {
  id: string;
  groupId: string;
  product: string;
  brand: string;
  /** Editorial/test signal (primary), e.g. "Test winner 2026". */
  editorialBadge?: string;
  /** Source of the test assessment. */
  testSource?: string;
  /** Popularity 0–5 (secondary, clearly labelled as a user rating). */
  rating?: number;
  reviewCount?: number;
  priceFrom?: number;
  why: string;
  /** Independent editorial selection — no payment affects placement. */
  demo: boolean;
}
