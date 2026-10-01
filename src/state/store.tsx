import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

import { CATALOG, TASKS, WARDROBE, WISHES } from '@/data/catalog';
import { personalizeItems, personalizeTasks } from '@/lib/plan';
import type {
  AppState,
  CategoryId,
  FocusArea,
  Household,
  Item,
  Priority,
  Situation,
  Status,
  Task,
  WishItem,
} from '@/types';

// v6 dropped the pre-filled example home from the default seed; older keys are left behind.
const STORAGE_KEY = 'babyklar.state.v6';

let counter = 0;
const uid = (prefix: string) => `${prefix}_${Date.now().toString(36)}_${(counter++).toString(36)}`;

const defaultDueDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 63); // approx. 9 weeks to due date
  return d.toISOString().slice(0, 10);
};

/**
 * The seed lists are the same in both modes – what differs is whether the
 * pre-filled example answers (statuses, owned quantities, ticked tasks, wishes)
 * come along. Demo mode is for showing the app to someone; clean mode is what a
 * real family starts with.
 */
const seedItems = (demo: boolean): Item[] =>
  CATALOG.map((c) =>
    demo
      ? { ...c, id: uid('item') }
      : { ...c, id: uid('item'), status: 'missing', origin: undefined, place: undefined, note: undefined },
  );

const seedTasks = (demo: boolean): Task[] =>
  TASKS.map((t) => ({ ...t, id: uid('task'), done: demo ? t.done : false }));

const seedWishes = (demo: boolean): WishItem[] =>
  demo ? WISHES.map((w) => ({ ...w, id: uid('wish') })) : [];

const seedWardrobe = (demo: boolean): AppState['wardrobe'] => (demo ? WARDROBE : {});

export const initialState: AppState = {
  household: {
    onboarded: false,
    situation: 'first',
    dueDate: defaultDueDate(),
    hasCar: true,
    hasHandMeDowns: true,
    sharesWithPartner: true,
    focus: ['equipment', 'clothes'],
    currentSize: '50',
    demoData: false,
  },
  items: seedItems(false),
  tasks: seedTasks(false),
  wishes: seedWishes(false),
  wardrobe: seedWardrobe(false),
};

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'importState'; raw: unknown }
  | { type: 'completeOnboarding'; household: Partial<Household> }
  | { type: 'setStatus'; id: string; status: Status }
  | { type: 'setQuantity'; id: string; quantity: number }
  | { type: 'updateItem'; id: string; patch: Partial<Item> }
  | { type: 'addItems'; items: Omit<Item, 'id'>[] }
  | { type: 'removeItem'; id: string }
  | { type: 'toggleTask'; id: string }
  | { type: 'addWish'; wish: Omit<WishItem, 'id'> }
  | { type: 'toggleWishReserved'; id: string; by: string }
  | { type: 'removeWish'; id: string }
  | { type: 'setHousehold'; patch: Partial<Household> }
  | { type: 'setDemoData'; on: boolean }
  | { type: 'reset' };

const asArray = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

const CATEGORY_IDS: CategoryId[] = ['sleep', 'clothes', 'care', 'transport', 'food', 'hospitalBag', 'other'];
const PRIORITIES: Priority[] = ['important', 'can-wait', 'optional'];
const STATUSES: Status[] = ['have', 'missing', 'want', 'to-buy', 'ordered', 'not-needed', 'stored', 'outgrown'];
const SITUATIONS: Situation[] = ['first', 'has-child', 'born'];
const FOCUS_AREAS: FocusArea[] = ['equipment', 'clothes', 'hospitalBag', 'wishlist', 'owned', 'tasks', 'budget'];
const WISH_PRIORITIES: WishItem['priority'][] = ['high', 'medium', 'low'];

const isValidItem = (i: Item) =>
  CATEGORY_IDS.includes(i.category) && PRIORITIES.includes(i.priority) && STATUSES.includes(i.status);

/** Adds an item to the wishlist if it isn't already there (deduped by name). */
const ensureWish = (wishes: WishItem[], name: string, size?: string): WishItem[] => {
  const exists = wishes.some((w) => w.name.trim().toLowerCase() === name.trim().toLowerCase());
  return exists ? wishes : [{ id: uid('wish'), name, size, priority: 'medium', usedOk: true }, ...wishes];
};

/**
 * Validates and normalizes an imported or persisted state. Returns null when the
 * data is missing the essentials or uses an incompatible (old) schema, so the
 * caller can fall back to a fresh seed instead of rendering NaN/garbage.
 */
export function sanitizeState(raw: unknown): AppState | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Partial<AppState>;
  if (!Array.isArray(r.items) || !Array.isArray(r.tasks)) return null;

  const rawItems = asArray<Item>(r.items).filter(
    (i) => !!i && typeof i === 'object' && typeof i.id === 'string' && typeof i.name === 'string',
  );
  const items = rawItems.filter(isValidItem);
  // Items present but none schema-compatible → old/incompatible data, reseed fresh.
  if (rawItems.length && !items.length) return null;

  const tasks = asArray<Task>(r.tasks).filter(
    (t) => !!t && typeof t === 'object' && typeof t.id === 'string' && typeof t.title === 'string',
  );
  const wishes = asArray<WishItem>(r.wishes).filter(
    (w) =>
      !!w &&
      typeof w === 'object' &&
      typeof w.id === 'string' &&
      typeof w.name === 'string' &&
      WISH_PRIORITIES.includes(w.priority),
  );
  const wardrobe =
    r.wardrobe && typeof r.wardrobe === 'object' && !Array.isArray(r.wardrobe)
      ? (r.wardrobe as AppState['wardrobe'])
      : {};

  const household: Household = {
    ...initialState.household,
    ...(r.household && typeof r.household === 'object' ? (r.household as Partial<Household>) : {}),
  };
  if (typeof household.dueDate !== 'string') household.dueDate = initialState.household.dueDate;
  if (typeof household.currentSize !== 'string') household.currentSize = initialState.household.currentSize;
  if (!SITUATIONS.includes(household.situation)) household.situation = initialState.household.situation;
  if (typeof household.demoData !== 'boolean') household.demoData = false;
  household.focus = Array.isArray(household.focus)
    ? household.focus.filter((f) => FOCUS_AREAS.includes(f))
    : initialState.household.focus;

  // Keep the wishlist in sync: every item marked "want" should be on the gift list.
  let syncedWishes = wishes;
  items
    .filter((i) => i.status === 'want')
    .forEach((i) => {
      syncedWishes = ensureWish(syncedWishes, i.name, i.size);
    });

  return { household, items, tasks, wishes: syncedWishes, wardrobe };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;

    case 'importState': {
      const clean = sanitizeState(action.raw);
      return clean ?? state;
    }

    case 'completeOnboarding': {
      const household = { ...state.household, ...action.household, onboarded: true };
      return {
        ...state,
        household,
        items: personalizeItems(state.items, household),
        tasks: personalizeTasks(state.tasks, household),
      };
    }

    case 'setStatus': {
      const items = state.items.map((i) => (i.id === action.id ? { ...i, status: action.status } : i));
      const target = state.items.find((i) => i.id === action.id);
      const wishes =
        action.status === 'want' && target
          ? ensureWish(state.wishes, target.name, target.size)
          : state.wishes;
      return { ...state, items, wishes };
    }

    case 'setQuantity':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: Math.max(0, action.quantity) } : i,
        ),
      };

    case 'updateItem': {
      const items = state.items.map((i) => (i.id === action.id ? { ...i, ...action.patch } : i));
      const updated = items.find((i) => i.id === action.id);
      const wishes =
        action.patch.status === 'want' && updated
          ? ensureWish(state.wishes, updated.name, updated.size)
          : state.wishes;
      return { ...state, items, wishes };
    }

    case 'addItems': {
      const created = action.items.map((i) => ({ ...i, id: uid('item') }));
      let wishes = state.wishes;
      created
        .filter((i) => i.status === 'want')
        .forEach((i) => {
          wishes = ensureWish(wishes, i.name, i.size);
        });
      return { ...state, items: [...created, ...state.items], wishes };
    }

    case 'removeItem':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };

    case 'toggleTask':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.id ? { ...t, done: !t.done } : t)),
      };

    case 'addWish':
      return { ...state, wishes: [{ ...action.wish, id: uid('wish') }, ...state.wishes] };

    case 'toggleWishReserved':
      return {
        ...state,
        wishes: state.wishes.map((w) =>
          w.id === action.id ? { ...w, reservedBy: w.reservedBy ? undefined : action.by } : w,
        ),
      };

    case 'removeWish':
      return { ...state, wishes: state.wishes.filter((w) => w.id !== action.id) };

    case 'setHousehold':
      return { ...state, household: { ...state.household, ...action.patch } };

    case 'setDemoData': {
      const household = { ...state.household, demoData: action.on };
      return {
        household,
        items: personalizeItems(seedItems(action.on), household),
        tasks: personalizeTasks(seedTasks(action.on), household),
        wishes: seedWishes(action.on),
        wardrobe: seedWardrobe(action.on),
      };
    }

    case 'reset': {
      const demo = state.household.demoData;
      return {
        household: { ...initialState.household, demoData: demo },
        items: seedItems(demo),
        tasks: seedTasks(demo),
        wishes: seedWishes(demo),
        wardrobe: seedWardrobe(demo),
      };
    }

    default:
      return state;
  }
}

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  ready: boolean;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = React.useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const clean = sanitizeState(JSON.parse(raw));
            dispatch({ type: 'hydrate', state: clean ?? initialState });
          } catch {
            // Ignore corrupt cache and start over.
          }
        }
      })
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, ready]);

  const value = useMemo(() => ({ state, dispatch, ready }), [state, ready]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
