import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Card, Chip, Empty, ScreenHeader, SectionTitle } from '@/components/ui';
import { CATEGORIES, categoryMeta } from '@/data/catalog';
import { priceCheckItems } from '@/lib/offers';
import { PRICE_SOURCE, openPriceCheck } from '@/lib/prices';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { CategoryId, Item } from '@/types';

export default function Offers() {
  const router = useRouter();
  const { state } = useApp();
  const [filter, setFilter] = useState<CategoryId | 'all'>('all');

  const open = useMemo(() => priceCheckItems(state.items), [state.items]);

  const usedCategories = useMemo(
    () => CATEGORIES.filter((c) => open.some((i) => i.category === c.id)),
    [open],
  );

  const shown = filter === 'all' ? open : open.filter((i) => i.category === filter);
  const important = shown.filter((i) => i.priority === 'important');
  const rest = shown.filter((i) => i.priority !== 'important');

  const renderRow = (item: Item, i: number) => {
    const meta = categoryMeta(item.category);
    return (
      <Pressable
        key={item.id}
        onPress={() => openPriceCheck(item.name)}
        style={[styles.priceRow, i > 0 && styles.priceDivider]}
        accessibilityRole="link"
        accessibilityLabel={`Se dagens priser på ${item.name}`}
      >
        <View style={[styles.icon, { backgroundColor: meta.softTint }]}>
          <MaterialCommunityIcons name={meta.icon as any} size={18} color={meta.tint} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.bodyStrong}>{item.name}</Text>
          <Text style={type.small}>Se pris hos {PRICE_SOURCE}</Text>
        </View>
        <MaterialCommunityIcons name="open-in-new" size={18} color={colors.primary} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Sammenlign priser" onBack={() => router.navigate('/')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={{ gap: spacing(2), backgroundColor: colors.bgAlt, borderColor: colors.border }}>
          <Text style={type.bodyStrong}>Ekte priser, ingen reklame</Text>
          <Text style={type.small}>
            Vi oppgir aldri en pris selv. Hver lenke åpner et søk hos {PRICE_SOURCE} på akkurat den
            tingen, så dere ser dagens priser fra ekte butikker — aldri utdaterte. Vi viser bare ting
            dere allerede har markert som manglende eller planlagt.
          </Text>
        </Card>

        <Pressable onPress={() => router.push('/favorites')} style={styles.favLink}>
          <MaterialCommunityIcons name="star-check-outline" size={18} color={colors.primaryDark} />
          <View style={{ flex: 1 }}>
            <Text style={type.bodyStrong}>Usikker på hva du skal velge?</Text>
            <Text style={type.small}>Se trygge favoritter for bilstol, vogn og bæresele.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.inkSoft} />
        </Pressable>

        {open.length ? (
          <View style={styles.filters}>
            <Chip label="Alle" selected={filter === 'all'} onPress={() => setFilter('all')} />
            {usedCategories.map((c) => (
              <Chip
                key={c.id}
                label={c.label}
                icon={c.icon as any}
                selected={filter === c.id}
                onPress={() => setFilter(c.id)}
              />
            ))}
          </View>
        ) : null}

        {!open.length ? (
          <Empty
            icon="tag-search-outline"
            title="Ingenting å sammenligne ennå"
            body="Når dere markerer ting som mangler eller ønskes, kan dere sjekke dagens priser her."
          />
        ) : !shown.length ? (
          <Empty
            icon="filter-variant"
            title="Ingenting i denne kategorien"
            body="Velg en annen kategori eller «Alle»."
          />
        ) : (
          <>
            {important.length ? (
              <>
                <SectionTitle>Viktig nå</SectionTitle>
                <Card style={{ paddingVertical: spacing(2) }}>{important.map(renderRow)}</Card>
              </>
            ) : null}

            {rest.length ? (
              <>
                <SectionTitle>Kan vente</SectionTitle>
                <Card style={{ paddingVertical: spacing(2) }}>{rest.map(renderRow)}</Card>
              </>
            ) : null}
          </>
        )}

        <Text style={styles.footnote}>
          BabyKlar tjener ingenting på disse lenkene i denne demoen. Målet er å hjelpe dere å kjøpe
          smartere — ikke mer.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12) },
  icon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(2),
  },
  priceDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2), marginTop: spacing(4) },
  favLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    marginTop: spacing(4),
    padding: spacing(4),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  footnote: { ...type.small, fontSize: 12, marginTop: spacing(6), textAlign: 'center' },
});
