import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, Pill } from '@/components/ui';
import { categoryMeta } from '@/data/catalog';
import { colors, radius, spacing, type } from '@/theme';
import type { Favorite, FavoriteGroup } from '@/types';

const kr = (n: number) => `${Math.round(n).toLocaleString('nb-NO')} kr`;

export function FavoriteCard({ favorite, group }: { favorite: Favorite; group: FavoriteGroup }) {
  const meta = categoryMeta(group.category);

  return (
    <Card style={{ gap: spacing(3) }}>
      <View style={styles.top}>
        <View style={[styles.icon, { backgroundColor: meta.softTint }]}>
          <MaterialCommunityIcons name={meta.icon as any} size={22} color={meta.tint} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={type.bodyStrong}>
            {favorite.brand} {favorite.product}
          </Text>
          {favorite.priceFrom ? <Text style={type.small}>Fra {kr(favorite.priceFrom)}</Text> : null}
        </View>
      </View>

      {favorite.editorialBadge ? (
        <View style={styles.badgeRow}>
          <Pill
            label={favorite.editorialBadge}
            tint={colors.primaryDark}
            soft={colors.primarySoft}
            icon="shield-check-outline"
          />
          {favorite.testSource ? <Text style={type.tiny}>Kilde: {favorite.testSource}</Text> : null}
        </View>
      ) : null}

      <Text style={type.small}>{favorite.why}</Text>

      {favorite.rating ? (
        <View style={styles.ratingRow}>
          <MaterialCommunityIcons name="star" size={15} color={colors.sun} />
          <Text style={styles.rating}>{favorite.rating.toFixed(1)}</Text>
          {favorite.reviewCount ? (
            <Text style={type.tiny}>
              Brukervurdering · {favorite.reviewCount.toLocaleString('nb-NO')} vurderinger
            </Text>
          ) : (
            <Text style={type.tiny}>Brukervurdering</Text>
          )}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  icon: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), flexWrap: 'wrap' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  rating: { fontSize: 14, fontWeight: '800', color: colors.ink },
});
