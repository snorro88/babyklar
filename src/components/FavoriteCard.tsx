import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { categoryMeta } from '@/data/catalog';
import { PRICE_SOURCE, openPriceSearch } from '@/lib/prices';
import { colors, radius, spacing, type } from '@/theme';
import type { Favorite, FavoriteGroup } from '@/types';

export function FavoriteCard({ favorite, group }: { favorite: Favorite; group: FavoriteGroup }) {
  const meta = categoryMeta(group.category);

  return (
    <Card style={{ gap: spacing(3) }} onPress={() => openPriceSearch(`${favorite.brand} ${favorite.product}`)}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: meta.softTint }]}>
          <MaterialCommunityIcons name={meta.icon as any} size={22} color={meta.tint} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={type.bodyStrong}>
            {favorite.brand} {favorite.product}
          </Text>
        </View>
      </View>

      <Text style={type.small}>{favorite.why}</Text>

      <View style={styles.linkRow}>
        <MaterialCommunityIcons name="open-in-new" size={14} color={colors.primary} />
        <Text style={styles.linkText}>Se dagens priser hos {PRICE_SOURCE}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  icon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    paddingTop: spacing(3),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  linkText: { fontSize: 13, fontWeight: '600', color: colors.primary },
});
