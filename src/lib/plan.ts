import type { CategoryId, FocusArea, Household, Item, Task } from '@/types';

export type Season = 'vinter' | 'var' | 'sommer' | 'host';

export const SEASON_LABEL: Record<Season, string> = {
  vinter: 'vinter',
  var: 'vår',
  sommer: 'sommer',
  host: 'høst',
};

export function seasonOf(iso: string): Season {
  const month = new Date(`${iso}T00:00:00`).getMonth();
  if (month === 11 || month <= 1) return 'vinter';
  if (month <= 4) return 'var';
  if (month <= 7) return 'sommer';
  return 'host';
}

/** The family likely has items to reuse — either inherited or from a previous child. */
export function reusesGear(h: Pick<Household, 'situation' | 'hasHandMeDowns'>): boolean {
  return h.hasHandMeDowns || h.situation === 'has-child';
}

/**
 * Adapts the seeded list to the onboarding answers. Idempotent: runs once when
 * onboarding completes, but produces the same result if run again.
 */
export function personalizeItems(
  items: Item[],
  h: Pick<Household, 'situation' | 'hasCar' | 'hasHandMeDowns'>,
): Item[] {
  const reuse = reusesGear(h);
  return items.map((it) => {
    if (!h.hasCar && it.category === 'transport' && /bilstol/i.test(it.name) && it.priority === 'important') {
      return { ...it, priority: 'can-wait', why: 'Uten egen bil kan bilstol lånes eller leies til hjemreisen.' };
    }
    if (reuse && it.category === 'clothes' && it.status === 'missing' && it.priority === 'important') {
      return { ...it, priority: 'can-wait', why: 'Sjekk arvede plagg og boden før dere kjøper nytt.' };
    }
    return it;
  });
}

/** Without a car, "Get a car seat" is rarely an urgent task. */
export function personalizeTasks(tasks: Task[], h: Pick<Household, 'hasCar'>): Task[] {
  if (h.hasCar) return tasks;
  return tasks.filter((t) => !/bilstol/i.test(t.title));
}

const FOCUS_CATEGORY: Partial<Record<FocusArea, CategoryId>> = {
  equipment: 'transport',
  clothes: 'clothes',
  hospitalBag: 'hospitalBag',
};

/** The categories the user said they want the most help with, in chosen order. */
export function focusCategories(focus: FocusArea[]): CategoryId[] {
  const out: CategoryId[] = [];
  focus.forEach((f) => {
    const c = FOCUS_CATEGORY[f];
    if (c && !out.includes(c)) out.push(c);
  });
  return out;
}
