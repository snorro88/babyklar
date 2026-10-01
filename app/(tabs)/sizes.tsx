import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Note, Pill, ScreenHeader } from '@/components/ui';
import { SIZES } from '@/data/catalog';
import { formatDate, garmentRowsForSize } from '@/lib/insights';
import { monthLabel, sizeAlert, sizeTimeline, type SizePhase, type SizeWindow } from '@/lib/sizes';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';

const PHASE: Record<SizePhase, { label: string; tint: string; soft: string }> = {
  ferdig: { label: 'Ferdig', tint: colors.muted, soft: colors.bgAlt },
  na: { label: 'Nå', tint: colors.primary, soft: colors.primarySoft },
  neste: { label: 'Neste', tint: colors.lilac, soft: colors.lilacSoft },
  senere: { label: 'Senere', tint: colors.optional, soft: colors.bgAlt },
};

export default function Sizes() {
  const router = useRouter();
  const { state } = useApp();
  const { dueDate } = state.household;

  const wardrobe = useMemo(
    () =>
      Object.fromEntries(SIZES.map((s) => [s, garmentRowsForSize(state.items, state.wardrobe, s)])),
    [state.items, state.wardrobe],
  );
  const windows = useMemo(() => sizeTimeline(dueDate, wardrobe), [dueDate, wardrobe]);
  const next = windows.find((w) => w.phase === 'neste');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Størrelser" onBack={() => router.navigate('/')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={type.body}>
          Framskrevet ut fra {formatDate(dueDate)}. Vi krysser hver periode mot årstiden og det dere
          har registrert i garderoben.
        </Text>

        {next ? (
          <Note tone={next.gaps.length ? 'heads-up' : 'ok'} style={{ marginTop: spacing(4) }}>
            {sizeAlert(next)}
          </Note>
        ) : null}

        <View style={{ gap: spacing(3), marginTop: spacing(5) }}>
          {windows.map((w) => (
            <Row key={w.size} window={w} />
          ))}
        </View>

        <Text style={styles.footnote}>
          Barn vokser i ulikt tempo. Bruk dette som en pekepinn, ikke en fasit.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ window: w }: { window: SizeWindow }) {
  const phase = PHASE[w.phase];
  const gaps = w.gaps
    .slice(0, 3)
    .map((g) => `${g.count} ${g.type.toLowerCase()}`)
    .join(', ');

  return (
    <Card style={[styles.card, w.phase === 'ferdig' && styles.cardDone]}>
      <View style={styles.head}>
        <View style={[styles.size, { backgroundColor: phase.soft }]}>
          <Text style={[styles.sizeText, { color: phase.tint }]}>{w.size}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.bodyStrong}>
            {monthLabel(w.from)} – {monthLabel(w.to)}
          </Text>
          <Text style={type.small}>{w.seasonLabel}</Text>
        </View>
        <Pill label={phase.label} tint={phase.tint} soft={phase.soft} />
      </View>

      <Text style={type.small}>
        {w.registered
          ? `${w.have} plagg registrert`
          : 'Ingenting registrert – vi regner med et vanlig minimum'}
      </Text>

      {gaps ? (
        <View style={styles.gapRow}>
          <MaterialCommunityIcons name="alert-circle-outline" size={15} color={colors.warm} />
          <Text style={[type.small, { color: colors.warm, flex: 1 }]}>Mangler {gaps}</Text>
        </View>
      ) : null}

      {w.needsWarmClothes ? (
        <View style={styles.gapRow}>
          <MaterialCommunityIcons name="snowflake" size={15} color={colors.lilac} />
          <Text style={[type.small, { color: colors.lilac, flex: 1 }]}>
            Perioden er {w.seasonLabel} – ingenting varmt registrert i denne størrelsen.
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12) },
  card: { gap: spacing(2) },
  cardDone: { opacity: 0.6 },
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  size: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  sizeText: { fontSize: 16, fontWeight: '700' },
  gapRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  footnote: { ...type.small, textAlign: 'center', marginTop: spacing(8), fontStyle: 'italic' },
});
