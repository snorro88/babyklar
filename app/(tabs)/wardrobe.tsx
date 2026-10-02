import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bar, Card, Chip, Empty, Note, SectionTitle } from '@/components/ui';
import { SIZES } from '@/data/catalog';
import { FEATURES } from '@/lib/features';
import { daysUntil, garmentRowsForSize, nextSize, seasonHint, wardrobeInsights } from '@/lib/insights';
import { useApp } from '@/state/store';
import { colors, spacing, type } from '@/theme';

export default function Wardrobe() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [size, setSize] = useState(state.household.currentSize);

  const rows = useMemo(
    () => garmentRowsForSize(state.items, state.wardrobe, size),
    [state.items, state.wardrobe, size],
  );
  const insights = useMemo(() => wardrobeInsights(rows, size), [rows, size]);
  const next = nextSize(size, SIZES);
  const nextRows = next ? garmentRowsForSize(state.items, state.wardrobe, next) : [];
  const nextTotal = nextRows.reduce((sum, r) => sum + r.have, 0);
  const unborn = daysUntil(state.household.dueDate) > 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/')} hitSlop={10} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.inkSoft} />
        </Pressable>
        <Text style={type.title}>Smart garderobe</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={type.body}>
          Vi holder oversikt over hva dere har i hver størrelse — og hva som mangler.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sizes}
          style={{ marginHorizontal: -spacing(5) }}
        >
          {SIZES.map((s) => (
            <Chip key={s} label={`Str. ${s}`} selected={size === s} onPress={() => setSize(s)} />
          ))}
        </ScrollView>

        {size !== state.household.currentSize ? (
          <Pressable onPress={() => dispatch({ type: 'setHousehold', patch: { currentSize: size } })}>
            <Note tone="ok">{`Trykk her for å sette str. ${size} som størrelsen ${unborn ? 'barnet starter i' : 'barnet bruker nå'}.`}</Note>
          </Pressable>
        ) : (
          <Note tone="ok">
            {unborn ? `Barnet starter i str. ${size}.` : `Barnet bruker str. ${size} nå.`}
          </Note>
        )}

        <SectionTitle>{`Str. ${size}`}</SectionTitle>
        {rows.length ? (
          <Card style={{ gap: spacing(4) }}>
            <View style={styles.tableHead}>
              <Text style={[styles.cellType, type.section]}>TYPE</Text>
              <Text style={[styles.cellNum, type.section]}>HAR</Text>
              <Text style={[styles.cellNum, type.section]}>ANBEFALT</Text>
            </View>
            {rows.map((r) => {
              const ok = r.have >= r.min;
              const pct = Math.min(100, (r.have / r.max) * 100);
              return (
                <View key={r.type} style={{ gap: spacing(2) }}>
                  <View style={styles.tableRow}>
                    <Text style={[styles.cellType, type.bodyStrong]}>{r.type}</Text>
                    <Text style={[styles.cellNum, styles.num, { color: ok ? colors.primary : colors.warm }]}>
                      {r.have}
                    </Text>
                    <Text style={[styles.cellNum, styles.num, { color: colors.muted }]}>
                      {r.min}–{r.max}
                    </Text>
                  </View>
                  <Bar value={pct} tint={ok ? colors.primary : colors.warm} />
                </View>
              );
            })}
          </Card>
        ) : (
          <Empty
            icon="tshirt-crew-outline"
            title="Ingenting registrert"
            body={`Skann en bunke klær, så fyller vi ut str. ${size} for dere.`}
          />
        )}

        {insights.length ? (
          <>
            <SectionTitle>Hva betyr dette?</SectionTitle>
            <View style={{ gap: spacing(3) }}>
              {insights.map((i, idx) => (
                <Note key={idx} tone={i.tone}>
                  {i.text}
                </Note>
              ))}
            </View>
          </>
        ) : null}

        {next && FEATURES.sizes ? (
          <>
            <SectionTitle>Neste størrelse</SectionTitle>
            <Card style={{ gap: spacing(3) }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}>
                <View style={styles.nextIcon}>
                  <MaterialCommunityIcons name="arrow-up-right" size={20} color={colors.lilac} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={type.bodyStrong}>Str. {next}</Text>
                  <Text style={type.small}>
                    {nextTotal > 0 ? `Dere har allerede ${nextTotal} plagg klare` : 'Ingenting klart ennå'}
                  </Text>
                </View>
                <Pressable onPress={() => setSize(next)}>
                  <Text style={styles.link}>Se</Text>
                </Pressable>
              </View>
              <Note tone="heads-up">{seasonHint(state.household.dueDate)}</Note>
              <Pressable onPress={() => router.push('/sizes')}>
                <Text style={styles.link}>Se hele størrelsesløpet →</Text>
              </Pressable>
            </Card>
          </>
        ) : null}

        <Text style={[type.small, { textAlign: 'center', marginTop: spacing(8), fontStyle: 'italic' }]}>
          Anbefalingene er veiledende. Alle babyer og alle vaskerutiner er ulike.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
  },
  back: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12) },
  sizes: { gap: spacing(2), paddingHorizontal: spacing(5), paddingVertical: spacing(4) },
  tableHead: { flexDirection: 'row', alignItems: 'center' },
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  cellType: { flex: 1 },
  cellNum: { width: 78, textAlign: 'right' },
  num: { fontSize: 15, fontWeight: '700' },
  nextIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.lilacSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
