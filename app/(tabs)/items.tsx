import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemRow } from '@/components/ItemRow';
import { Card, Chip, Empty, HomeButton, SectionTitle } from '@/components/ui';
import { CATEGORIES } from '@/data/catalog';
import { isCounted, isDone } from '@/lib/insights';
import { useApp } from '@/state/store';
import { colors, radius, shadow, spacing, type } from '@/theme';
import type { CategoryId } from '@/types';

type StatusFilter = 'all' | 'have' | 'missing';

export default function Items() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const params = useLocalSearchParams<{ category?: string }>();

  const [query, setQuery] = useState('');
  const [view, setView] = useState<StatusFilter>('all');
  const [category, setCategory] = useState<CategoryId | 'all'>(
    (params.category as CategoryId) ?? 'all',
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return state.items.filter((i) => {
      if (category !== 'all' && i.category !== category) return false;
      if (view === 'have' && !isDone(i)) return false;
      if (view === 'missing' && (isDone(i) || !isCounted(i))) return false;
      if (q && !`${i.name} ${i.size ?? ''} ${i.brand ?? ''}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [state.items, category, view, query]);

  const counts = useMemo(() => {
    const counted = state.items.filter(isCounted);
    return {
      have: counted.filter(isDone).length,
      missing: counted.filter((i) => !isDone(i)).length,
    };
  }, [state.items]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <HomeButton />
        <Text style={styles.h1}>Ting</Text>
        <Text style={type.body}>
          {counts.have} ting dere har · {counts.missing} dere mangler
        </Text>

        <View style={styles.search}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Søk etter body, vogn, str. 62 …"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.muted} />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.segment}>
          {(['all', 'have', 'missing'] as StatusFilter[]).map((v) => (
            <Pressable
              key={v}
              onPress={() => setView(v)}
              style={[styles.segmentItem, view === v && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, view === v && styles.segmentTextActive]}>
                {v === 'all' ? 'Alle' : v === 'have' ? 'Har' : 'Mangler'}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
          style={{ marginHorizontal: -spacing(5) }}
        >
          <Chip label="Alle" selected={category === 'all'} onPress={() => setCategory('all')} />
          {CATEGORIES.map((c) => (
            <Chip
              key={c.id}
              label={c.label}
              icon={c.icon as any}
              selected={category === c.id}
              onPress={() => setCategory(c.id)}
            />
          ))}
        </ScrollView>

        <SectionTitle>{`${filtered.length} treff`}</SectionTitle>
        {filtered.length ? (
          <Card style={{ paddingVertical: spacing(1) }}>
            {filtered.map((item, i) => (
              <View key={item.id} style={i > 0 ? styles.divider : undefined}>
                <ItemRow
                  item={item}
                  onStatus={(status) => dispatch({ type: 'setStatus', id: item.id, status })}
                  onQuantity={(quantity) => dispatch({ type: 'setQuantity', id: item.id, quantity })}
                  onOpen={() => router.push(`/item/${item.id}`)}
                />
              </View>
            ))}
          </Card>
        ) : (
          <Empty
            icon="package-variant"
            title="Ingen treff"
            body="Prøv et annet søk, eller legg til noe dere har liggende."
          />
        )}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push('/add-item')} accessibilityLabel="Legg til ting">
        <MaterialCommunityIcons name="plus" size={26} color={colors.surface} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingTop: spacing(3), paddingBottom: spacing(14) },
  h1: { ...type.display, marginBottom: spacing(1) },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(4),
    height: 46,
    marginTop: spacing(4),
  },
  input: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.bgAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginTop: spacing(3),
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: spacing(2), borderRadius: radius.pill },
  segmentActive: { backgroundColor: colors.surface, ...shadow.card },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.muted },
  segmentTextActive: { color: colors.ink },
  catRow: { gap: spacing(2), paddingHorizontal: spacing(5), paddingTop: spacing(3) },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  fab: {
    position: 'absolute',
    right: spacing(5),
    bottom: spacing(6),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.warm,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
});
