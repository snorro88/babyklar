import type { Item, Priority } from '@/types';

/** Statuses where comparing prices is relevant — the item is missing or planned. */
const OPEN_STATUS: Item['status'][] = ['missing', 'to-buy', 'want'];

export const isItemOpen = (item: Item) => OPEN_STATUS.includes(item.status);

const PRIORITY_RANK: Record<Priority, number> = { important: 0, 'can-wait': 1, optional: 2 };

/** Open items worth a price comparison, most important first. */
export function priceCheckItems(items: Item[]): Item[] {
  return items
    .filter(isItemOpen)
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
}

export const priceCheckCount = (items: Item[]) => items.filter(isItemOpen).length;
