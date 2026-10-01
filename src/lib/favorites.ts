import { FAVORITES, FAVORITE_GROUPS } from '@/data/favorites';
import type { Favorite, FavoriteGroup, Item } from '@/types';

export interface FavoriteSection {
  group: FavoriteGroup;
  items: Favorite[];
}

export function favoriteSections(): FavoriteSection[] {
  return FAVORITE_GROUPS.map((group) => ({
    group,
    items: FAVORITES.filter((f) => f.groupId === group.id),
  })).filter((s) => s.items.length > 0);
}

/** The group that fits an item on the needs list, if any. */
export function favoriteGroupForItem(item: Item): FavoriteGroup | undefined {
  const name = item.name.toLowerCase();
  return FAVORITE_GROUPS.find(
    (g) => g.category === item.category && g.keywords.some((k) => name.includes(k)),
  );
}

/** Safe favourites for a specific item. */
export function favoritesForItem(item: Item): Favorite[] {
  const group = favoriteGroupForItem(item);
  if (!group) return [];
  return FAVORITES.filter((f) => f.groupId === group.id);
}
