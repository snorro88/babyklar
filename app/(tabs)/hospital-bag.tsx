import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemRow } from '@/components/ItemRow';
import { Bar, Button, Card, Empty, Note, ScreenHeader, SectionTitle } from '@/components/ui';
import { BAG_SECTIONS } from '@/data/catalog';
import { isCounted, isDone, weeksUntil } from '@/lib/insights';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { Item } from '@/types';

const TINT = '#B0688A';
const SOFT = '#F7E8EE';

export default function Sykehusbag() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const weeks = weeksUntil(state.household.dueDate);

  const items = useMemo(
    () => state.items.filter((i) => i.category === 'hospitalBag'),
    [state.items],
  );
  const counted = items.filter(isCounted);
  const packed = counted.filter(isDone).length;
  const percent = counted.length ? (packed / counted.length) * 100 : 0;

  const groups = useMemo(() => {
    const known = BAG_SECTIONS.map((s) => ({
      key: s.id as string,
      label: s.label,
      icon: s.icon,
      items: items.filter((i) => i.bagFor === s.id),
    }));
    const rest = items.filter((i) => !BAG_SECTIONS.some((s) => s.id === i.bagFor));
    if (rest.length) {
      known.push({ key: 'annet', label: 'Annet', icon: 'dots-horizontal', items: rest });
    }
    return known.filter((g) => g.items.length);
  }, [items]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Sykehusbag" onBack={() => router.navigate('/')} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={{ gap: spacing(3) }}>
          <View style={styles.summaryRow}>
            <View style={styles.icon}>
              <MaterialCommunityIcons name="bag-personal-outline" size={22} color={TINT} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyStrong}>
                {packed} av {counted.length} pakket
              </Text>
              <Text style={type.small}>
                {packed === counted.length
                  ? 'Bagen er klar.'
                  : `Bør være ferdig rundt 5 uker før termin – dere har ${weeks} uker igjen.`}
              </Text>
            </View>
          </View>
          <Bar value={percent} tint={TINT} />
        </Card>

        <Note tone="ok" style={{ marginTop: spacing(4) }}>
          Sykehuset har mye av det dere trenger. Dette er det de fleste savner å ha med selv.
        </Note>

        <Button
          label="Start pakkemodus"
          icon="play-circle-outline"
          style={{ marginTop: spacing(4) }}
          onPress={() => router.push('/packing-mode')}
        />

        {groups.map((g) => {
          const groupCounted = g.items.filter(isCounted);
          const groupPacked = groupCounted.filter(isDone).length;
          return (
            <View key={g.key}>
              <SectionTitle>{g.label}</SectionTitle>
              <Card style={{ paddingVertical: spacing(1) }}>
                {g.items.map((item: Item, i: number) => (
                  <View key={item.id} style={i > 0 ? styles.divider : undefined}>
                    <ItemRow
                      item={item}
                      showCategory={false}
                      onStatus={(status) => dispatch({ type: 'setStatus', id: item.id, status })}
                      onQuantity={(quantity) => dispatch({ type: 'setQuantity', id: item.id, quantity })}
                    />
                  </View>
                ))}
                <Text style={styles.groupFooter}>
                  {groupPacked} av {groupCounted.length} pakket
                </Text>
              </Card>
            </View>
          );
        })}

        {!items.length ? (
          <Empty
            icon="bag-personal-outline"
            title="Ingen ting i bagen"
            body="Legg til ting via «Legg til», så dukker de opp her under riktig del av bagen."
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12) },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  icon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  groupFooter: { ...type.small, paddingVertical: spacing(2) },
});
