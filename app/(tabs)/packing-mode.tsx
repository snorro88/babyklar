import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Bar, Button, Card, Pill, ScreenHeader } from '@/components/ui';
import { BAG_SECTIONS } from '@/data/catalog';
import { confirm } from '@/lib/dialog';
import { isCounted, isDone } from '@/lib/insights';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';

/**
 * One item at a time. The queue is locked on open so the list doesn't jump
 * when the status changes along the way.
 */
export default function PackingMode() {
  const router = useRouter();
  const { state, dispatch } = useApp();

  const [queue] = useState(() =>
    state.items
      .filter((i) => i.category === 'hospitalBag' && isCounted(i) && !isDone(i))
      .map((i) => i.id),
  );
  const [index, setIndex] = useState(0);
  const [packed, setPacked] = useState(0);

  const item = useMemo(
    () => state.items.find((i) => i.id === queue[index]),
    [state.items, queue, index],
  );
  const section = BAG_SECTIONS.find((s) => s.id === item?.bagFor);
  const finished = index >= queue.length || !item;

  const next = () => setIndex((i) => i + 1);

  const pack = () => {
    if (!item) return;
    dispatch({ type: 'setStatus', id: item.id, status: 'have' });
    setPacked((p) => p + 1);
    next();
  };

  const skipForever = async () => {
    if (!item) return;
    const ok = await confirm(
      'Trenger dere ikke denne?',
      `«${item.name}» merkes som «Trenger ikke» og tas ut av bagen.`,
      'Trenger ikke',
    );
    if (!ok) return;
    dispatch({ type: 'setStatus', id: item.id, status: 'not-needed' });
    next();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Pakkemodus" onBack={() => router.navigate('/')} />

      {finished ? (
        <View style={styles.center}>
          <View style={styles.doneIcon}>
            <MaterialCommunityIcons name="check" size={34} color={colors.surface} />
          </View>
          <Text style={[type.title, { marginTop: spacing(5), textAlign: 'center' }]}>
            {queue.length ? 'Gjennomgangen er ferdig' : 'Alt er allerede pakket'}
          </Text>
          <Text style={[type.body, { textAlign: 'center', marginTop: spacing(2) }]}>
            {packed > 0
              ? `Dere pakket ${packed} ting. Resten kan vente – sykehuset har mer enn de fleste tror.`
              : 'Ingenting å gå gjennom akkurat nå.'}
          </Text>
          <Button
            label="Tilbake til sykehusbagen"
            style={{ marginTop: spacing(6), alignSelf: 'stretch' }}
            onPress={() => router.navigate('/hospital-bag')}
          />
        </View>
      ) : (
        <View style={styles.body}>
          <View style={{ gap: spacing(2) }}>
            <View style={styles.progressRow}>
              <Text style={type.small}>
                {index + 1} av {queue.length}
              </Text>
              <Text style={type.small}>{packed} pakket</Text>
            </View>
            <Bar value={(index / queue.length) * 100} tint="#B0688A" />
          </View>

          <Card style={styles.card}>
            {section ? (
              <Pill label={section.label} tint="#B0688A" soft="#F7E8EE" icon={section.icon as any} />
            ) : null}
            <Text style={styles.name}>{item.name}</Text>
            {item.quantity > 1 ? <Text style={type.small}>{item.quantity} stk.</Text> : null}
            {item.note ? <Text style={[type.body, { textAlign: 'center' }]}>{item.note}</Text> : null}
            {item.why ? <Text style={styles.why}>{item.why}</Text> : null}
            {item.priority === 'important' ? (
              <Pill label="Viktig" tint={colors.warm} soft={colors.warmSoft} icon="star" />
            ) : null}
          </Card>

          <View style={{ gap: spacing(3) }}>
            <Button label="Pakket" icon="check" onPress={pack} />
            <Button label="Hopp over" variant="ghost" icon="chevron-right" onPress={next} />
            <Button
              label="Vi trenger ikke denne"
              variant="ghost"
              icon="close"
              onPress={skipForever}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: spacing(5), paddingBottom: spacing(4), gap: spacing(5) },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing(8),
  },
  doneIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(3),
    paddingHorizontal: spacing(6),
  },
  name: { ...type.display, textAlign: 'center' },
  why: { ...type.small, textAlign: 'center', fontStyle: 'italic' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
