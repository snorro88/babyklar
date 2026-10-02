import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bar, Card, Note, Pill, ScreenHeader, SectionTitle } from '@/components/ui';
import { PRIORITY_LABEL, categoryMeta } from '@/data/catalog';
import { FEATURES } from '@/lib/features';
import { isCounted, isDone } from '@/lib/insights';
import { priceCheckCount } from '@/lib/offers';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { Item, Priority } from '@/types';

const kr = (n: number) => `${Math.round(n).toLocaleString('nb-NO')} kr`;

const cost = (i: Item) => (i.price ?? 0) * Math.max(1, i.quantity);

const PRIORITY_TINT: Record<Priority, string> = {
  important: colors.warm,
  'can-wait': colors.wait,
  optional: colors.optional,
};

export default function Budget() {
  const router = useRouter();
  const { state } = useApp();

  const sums = useMemo(() => {
    const counted = state.items.filter(isCounted);
    const withPrice = counted.filter((i) => i.price);
    const done = withPrice.filter(isDone);

    const spent = done.filter((i) => !i.origin || i.origin === 'bought').reduce((s, i) => s + cost(i), 0);
    const saved = done.filter((i) => i.origin === 'inherited' || i.origin === 'gift').reduce((s, i) => s + cost(i), 0);

    const remaining = withPrice.filter((i) => !isDone(i));
    const byPriority = (p: Priority) =>
      remaining.filter((i) => i.priority === p).reduce((s, i) => s + cost(i), 0);

    return {
      spent,
      saved,
      remaining: remaining.reduce((s, i) => s + cost(i), 0),
      important: byPriority('important'),
      canWait: byPriority('can-wait'),
      optional: byPriority('optional'),
      biggest: [...remaining].sort((a, b) => cost(b) - cost(a)).slice(0, 6),
      missingPrice: counted.filter((i) => !isDone(i) && !i.price).length,
    };
  }, [state.items]);

  const total = sums.spent + sums.remaining;
  const offerCount = useMemo(() => priceCheckCount(state.items), [state.items]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Budsjett" onBack={() => router.navigate('/')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={{ gap: spacing(3) }}>
          <Text style={type.small}>Gjenstår å kjøpe</Text>
          <Text style={styles.big}>{kr(sums.remaining)}</Text>
          <Bar value={total ? (sums.spent / total) * 100 : 0} tint={colors.primary} />
          <Text style={type.small}>
            {kr(sums.spent)} brukt av {kr(total)} totalt
          </Text>
        </Card>

        {sums.saved > 0 ? (
          <Note tone="ok" style={{ marginTop: spacing(4) }}>
            {`Dere har spart rundt ${kr(sums.saved)} på arvede ting og gaver.`}
          </Note>
        ) : null}

        <SectionTitle>Fordelt på hva som haster</SectionTitle>
        <Card style={{ gap: spacing(4) }}>
          <Line label="Viktig" value={sums.important} total={sums.remaining} tint={colors.warm} />
          <Line label="Kan vente" value={sums.canWait} total={sums.remaining} tint={colors.wait} />
          <Line label="Valgfritt" value={sums.optional} total={sums.remaining} tint={colors.optional} />
        </Card>

        <SectionTitle>Størst utgifter igjen</SectionTitle>
        <Card style={{ paddingVertical: spacing(2) }}>
          {sums.biggest.map((item, i) => {
            const meta = categoryMeta(item.category);
            return (
              <Pressable
                key={item.id}
                onPress={() => router.push(`/item/${item.id}`)}
                style={[styles.row, i > 0 && styles.divider]}
              >
                <View style={[styles.icon, { backgroundColor: meta.softTint }]}>
                  <MaterialCommunityIcons name={meta.icon as any} size={16} color={meta.tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={type.bodyStrong}>{item.name}</Text>
                  <Text style={type.small}>
                    {item.quantity > 1 ? `${item.quantity} stk · ` : ''}
                    {kr(item.price ?? 0)} per stk
                  </Text>
                </View>
                <Pill
                  label={PRIORITY_LABEL[item.priority]}
                  tint={PRIORITY_TINT[item.priority]}
                  soft={colors.bgAlt}
                />
                <Text style={styles.amount}>{kr(cost(item))}</Text>
              </Pressable>
            );
          })}
          {!sums.biggest.length ? (
            <Text style={[type.small, { padding: spacing(3) }]}>
              Ingen prislapper lagt inn ennå.
            </Text>
          ) : null}
        </Card>

        {sums.missingPrice ? (
          <Note tone="heads-up" style={{ marginTop: spacing(4) }}>
            {`${sums.missingPrice} ting mangler pris. Åpne en ting og legg inn hva den koster, så blir estimatet bedre.`}
          </Note>
        ) : null}

        {FEATURES.priceCheck && offerCount > 0 ? (
          <Pressable onPress={() => router.push('/offers')} style={styles.offerLink}>
            <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
              <MaterialCommunityIcons name="tag-search-outline" size={16} color={colors.primaryDark} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyStrong}>Sammenlign priser</Text>
              <Text style={type.small}>
                Se dagens priser hos Prisjakt på tingene dere mangler.
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.inkSoft} />
          </Pressable>
        ) : null}

        <Text style={styles.footnote}>
          {FEATURES.priceCheck
            ? 'Prisene er anslag dere kan endre selv. «Sammenlign priser» går til Prisjakt, og BabyKlar tjener ingenting på det i denne demoen.'
            : 'Prisene er anslag dere kan endre selv.'}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Line({
  label,
  value,
  total,
  tint,
}: {
  label: string;
  value: number;
  total: number;
  tint: string;
}) {
  return (
    <View style={{ gap: spacing(2) }}>
      <View style={styles.lineRow}>
        <Text style={[type.bodyStrong, { flex: 1 }]}>{label}</Text>
        <Text style={[type.bodyStrong, { color: tint }]}>{kr(value)}</Text>
      </View>
      <Bar value={total ? (value / total) * 100 : 0} tint={tint} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12) },
  big: { ...type.display, fontSize: 36 },
  lineRow: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingVertical: spacing(3), paddingHorizontal: spacing(2) },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  icon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  amount: { ...type.bodyStrong, minWidth: 74, textAlign: 'right' },
  offerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    marginTop: spacing(5),
    padding: spacing(4),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  footnote: { ...type.small, textAlign: 'center', marginTop: spacing(8), fontStyle: 'italic' },
});
