import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ItemRow } from '@/components/ItemRow';
import { Bar, Card, Chip, HomeButton, Note, SectionTitle } from '@/components/ui';
import { CATEGORIES } from '@/data/catalog';
import { isDone, isCounted, readiness, weeksUntil } from '@/lib/insights';
import { focusCategories, reusesGear } from '@/lib/plan';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { Priority } from '@/types';

const FILTERS: { id: Priority | 'all'; label: string }[] = [
  { id: 'all', label: 'Alle' },
  { id: 'important', label: 'Viktig' },
  { id: 'can-wait', label: 'Kan vente' },
  { id: 'optional', label: 'Valgfritt' },
];

export default function Plan() {
  const { state, dispatch } = useApp();
  const { household } = state;
  const [filter, setFilter] = useState<Priority | 'all'>('important');
  const [openCategory, setOpenCategory] = useState<string | null>(
    () => focusCategories(household.focus)[0] ?? 'sleep',
  );
  const weeks = weeksUntil(household.dueDate);

  const subtitle = useMemo(() => {
    const bits = [`termin om ${weeks} uker`, 'årstid'];
    if (reusesGear(household)) bits.push('ting dere har fra før');
    if (!household.hasCar) bits.push('at dere ikke har egen bil');
    return `Tilpasset ${bits.join(', ')}.`;
  }, [weeks, household]);

  const openTasks = useMemo(() => state.tasks.filter((t) => !t.done), [state.tasks]);
  const doneTasks = state.tasks.length - openTasks.length;

  const filterSummary = useMemo(() => {
    const scope = state.items.filter((i) => filter === 'all' || i.priority === filter);
    const counted = scope.filter(isCounted);
    const missing = counted.filter((i) => !isDone(i)).length;
    const label = FILTERS.find((f) => f.id === filter)?.label.toLowerCase() ?? 'alle';
    if (!counted.length) return `Ingen ting er markert som «${label}».`;
    return missing === 0
      ? `Alt som er «${label}» er på plass.`
      : `${missing} av ${counted.length} ting gjenstår${filter === 'all' ? '' : ` som er «${label}»`}.`;
  }, [state.items, filter]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HomeButton />
        <Text style={styles.h1}>Deres plan</Text>
        <Text style={type.body}>{subtitle}</Text>

        <Note tone="ok" style={{ marginTop: spacing(4) }}>
          Vi lister ikke alt som finnes. Bare det som gir mening for dere nå.
        </Note>

        <SectionTitle>Oppgaver</SectionTitle>
        <Card style={{ paddingVertical: spacing(2) }}>
          {state.tasks.map((t, i) => (
            <Pressable
              key={t.id}
              onPress={() => dispatch({ type: 'toggleTask', id: t.id })}
              style={[styles.task, i > 0 && styles.divider]}
            >
              <View style={[styles.check, t.done && styles.checkDone]}>
                {t.done ? <MaterialCommunityIcons name="check" size={15} color={colors.surface} /> : null}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[type.bodyStrong, t.done && styles.taskDone]}>{t.title}</Text>
                <Text style={type.small}>
                  {t.done ? 'Ferdig' : `Bør være gjort ${t.dueWeeksBefore} uker før termin`}
                </Text>
              </View>
            </Pressable>
          ))}
          <View style={styles.taskFooter}>
            <Bar value={(doneTasks / Math.max(1, state.tasks.length)) * 100} tint={colors.lilac} />
            <Text style={[type.small, { marginTop: spacing(2) }]}>
              {doneTasks} av {state.tasks.length} oppgaver ferdig
            </Text>
          </View>
        </Card>

        <SectionTitle>Sjekkliste</SectionTitle>
        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Chip key={f.id} label={f.label} selected={filter === f.id} onPress={() => setFilter(f.id)} />
          ))}
        </View>
        <Text style={[type.small, { marginTop: spacing(3) }]}>{filterSummary}</Text>

        <View style={{ gap: spacing(3), marginTop: spacing(4) }}>
          {CATEGORIES.map((c) => {
            const all = state.items.filter((i) => i.category === c.id);
            const visible = all.filter((i) => filter === 'all' || i.priority === filter);
            const remaining = visible.filter((i) => !isDone(i));
            const finished = visible.filter(isDone);
            // Counts and progress follow the filter, so the numbers match what is listed.
            const counted = visible.filter(isCounted);
            const missing = counted.filter((i) => !isDone(i)).length;
            const score = readiness(visible);
            const allDone = counted.length > 0 && missing === 0;
            const expanded = openCategory === c.id;

            return (
              <Card key={c.id} style={{ padding: 0, overflow: 'hidden' }}>
                <Pressable
                  onPress={() => setOpenCategory(expanded ? null : c.id)}
                  style={[styles.catHeader, allDone && styles.catHeaderDone]}
                >
                  <View style={[styles.catIcon, { backgroundColor: allDone ? colors.bg : c.softTint }]}>
                    <MaterialCommunityIcons
                      name={allDone ? 'check' : (c.icon as any)}
                      size={20}
                      color={allDone ? colors.primary : c.tint}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[type.bodyStrong, allDone && styles.catLabelDone]}>{c.label}</Text>
                    <Text style={[type.small, allDone && styles.catSubtextDone]}>
                      {!counted.length
                        ? 'Ingenting med dette filteret'
                        : `${allDone ? '✓ Alt på plass' : `${missing} ting gjenstår`} · ${score} %`}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={expanded ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color={colors.muted}
                  />
                </Pressable>
                <View style={styles.catBar}>
                  <Bar value={score} tint={c.tint} />
                </View>

                {expanded ? (
                  <View style={styles.catBody}>
                    {remaining.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        showCategory={false}
                        onStatus={(status) => dispatch({ type: 'setStatus', id: item.id, status })}
                        onQuantity={(quantity) => dispatch({ type: 'setQuantity', id: item.id, quantity })}
                      />
                    ))}

                    {finished.length ? (
                      <View style={styles.doneHeader}>
                        <MaterialCommunityIcons name="check-circle" size={14} color={colors.primary} />
                        <Text style={styles.doneHeaderText}>Ferdig · {finished.length}</Text>
                      </View>
                    ) : null}
                    {finished.map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        dimmed
                        showCategory={false}
                        onStatus={(status) => dispatch({ type: 'setStatus', id: item.id, status })}
                        onQuantity={(quantity) => dispatch({ type: 'setQuantity', id: item.id, quantity })}
                      />
                    ))}

                    {!visible.length ? (
                      <Text style={[type.small, { paddingVertical: spacing(4) }]}>
                        Ingenting i denne kategorien med valgt filter.
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingTop: spacing(3), paddingBottom: spacing(12) },
  h1: { ...type.display, marginBottom: spacing(2) },
  task: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingVertical: spacing(3), paddingHorizontal: spacing(2) },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
  taskFooter: { paddingHorizontal: spacing(2), paddingTop: spacing(3), paddingBottom: spacing(2) },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  taskDone: { textDecorationLine: 'line-through', color: colors.muted },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  catHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), padding: spacing(4) },
  catHeaderDone: { backgroundColor: colors.primarySoft },
  catBar: { paddingHorizontal: spacing(4), paddingBottom: spacing(4) },
  catLabelDone: { color: colors.primaryDark },
  catSubtextDone: { color: colors.primary, fontWeight: '600' },
  catIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  catBody: { paddingHorizontal: spacing(4), paddingBottom: spacing(4) },
  doneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(2),
    paddingTop: spacing(3),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  doneHeaderText: { ...type.tiny, color: colors.primary, textTransform: 'uppercase' },
});
