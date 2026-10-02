import { DONE_STATUSES, GARMENT_TEMPLATE } from '@/data/catalog';
import type { AppState, CategoryId, GarmentRow, Item, Task } from '@/types';

/** Item name → wardrobe "type", e.g. "Body str. 56" → "body". */
export const garmentType = (name: string) => name.replace(/\s*str\.?\s*\d+\s*$/i, '').trim().toLowerCase();

/**
 * Derives the garment rows for one size from the items the user has actually
 * registered, so status changes, quantities and deletions take effect
 * immediately. Sizes with nothing registered fall back to the curated data, or
 * to the recommended minimums with zero owned.
 */
export function garmentRowsForSize(
  items: Item[],
  wardrobe: Record<string, GarmentRow[]>,
  size: string,
): GarmentRow[] {
  const owned = items.filter(
    (i) => i.category === 'clothes' && i.size === size && DONE_STATUSES.includes(i.status),
  );
  const base = wardrobe[size]?.length ? wardrobe[size] : GARMENT_TEMPLATE;
  if (!owned.length) return base;

  const counts = new Map<string, number>();
  owned.forEach((i) => {
    const t = garmentType(i.name);
    counts.set(t, (counts.get(t) ?? 0) + i.quantity);
  });

  const rows: GarmentRow[] = base.map((r) => ({ ...r, have: counts.get(r.type.toLowerCase()) ?? 0 }));
  counts.forEach((have, t) => {
    if (!rows.some((r) => r.type.toLowerCase() === t)) {
      rows.push({ type: t.charAt(0).toUpperCase() + t.slice(1), have, min: 2, max: 4 });
    }
  });
  return rows;
}

const WEIGHT: Record<Item['priority'], number> = {
  important: 3,
  'can-wait': 1,
  optional: 0.4,
};

export const isDone = (item: Item) => DONE_STATUSES.includes(item.status);
export const isCounted = (item: Item) => item.status !== 'not-needed';

export function readiness(items: Item[]): number {
  const counted = items.filter(isCounted);
  if (!counted.length) return 0;
  const total = counted.reduce((sum, i) => sum + (WEIGHT[i.priority] ?? 0), 0);
  const done = counted.filter(isDone).reduce((sum, i) => sum + (WEIGHT[i.priority] ?? 0), 0);
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function categoryReadiness(items: Item[], category: CategoryId): number {
  return readiness(items.filter((i) => i.category === category));
}

export function daysUntil(iso: string): number {
  const target = new Date(`${iso}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** Today plus `days`, as a local YYYY-MM-DD date. */
export function dateFromDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function weeksUntil(iso: string): number {
  return Math.max(0, Math.round(daysUntil(iso) / 7));
}

export function summary(state: AppState) {
  const counted = state.items.filter(isCounted);
  const missing = counted.filter((i) => !isDone(i));
  return {
    percent: readiness(state.items),
    importantMissing: missing.filter((i) => i.priority === 'important').length,
    canWait: missing.filter((i) => i.priority === 'can-wait').length,
    optional: missing.filter((i) => i.priority === 'optional').length,
    openTasks: state.tasks.filter((t) => !t.done).length,
    owned: counted.filter(isDone).reduce((sum, i) => sum + i.quantity, 0),
  };
}

/** "Most important now": open tasks sorted by how close the deadline is. */
export function topTasks(tasks: Task[], weeksLeft: number, limit = 3): Task[] {
  return [...tasks]
    .filter((t) => !t.done)
    .sort((a, b) => Math.abs(a.dueWeeksBefore - weeksLeft) - Math.abs(b.dueWeeksBefore - weeksLeft))
    .slice(0, limit);
}

export function missingByCategory(items: Item[]) {
  const map = new Map<CategoryId, Item[]>();
  items
    .filter((i) => isCounted(i) && !isDone(i) && i.priority === 'important')
    .forEach((i) => map.set(i.category, [...(map.get(i.category) ?? []), i]));
  return map;
}

export interface Insight {
  tone: 'ok' | 'heads-up';
  text: string;
}

export function wardrobeInsights(rows: GarmentRow[] | undefined, size: string): Insight[] {
  if (!rows?.length) return [];
  const out: Insight[] = [];
  const enough = rows.filter((r) => r.have >= r.min);
  const short = rows.filter((r) => r.have < r.min);

  if (enough.length) {
    const r = enough.sort((a, b) => b.have - a.have)[0];
    out.push({
      tone: 'ok',
      text: `Dere har ${r.have} ${r.type.toLowerCase()} i str. ${size}. Det er sannsynligvis nok.`,
    });
  }
  short.slice(0, 2).forEach((r) => {
    const from = r.min - r.have;
    const to = r.max - r.have;
    out.push({
      tone: 'heads-up',
      text: `Dere mangler ${from}${to > from ? `–${to}` : ''} ${r.type.toLowerCase()} i str. ${size}.`,
    });
  });
  return out;
}

export function nextSize(size: string, sizes: string[]): string | undefined {
  const i = sizes.indexOf(size);
  return i >= 0 ? sizes[i + 1] : undefined;
}

export function seasonHint(dueDate: string): string {
  const month = new Date(`${dueDate}T00:00:00`).getMonth();
  if ([8, 9, 10].includes(month)) return 'Det nærmer seg høst. Tenk ull og regntøy i neste størrelse.';
  if ([11, 0, 1].includes(month)) return 'Det blir vinter. Dere trenger dress og ull i neste størrelse.';
  if ([2, 3, 4].includes(month)) return 'Våren kommer. Et lett yttertøy holder lenge.';
  return 'Sommerfødsel – dere trenger mindre yttertøy enn mange lister påstår.';
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
