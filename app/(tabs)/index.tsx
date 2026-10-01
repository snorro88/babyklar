import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProgressRing } from '@/components/ProgressRing';
import { Bar, Card, Note, Pill, SectionTitle } from '@/components/ui';
import { CATEGORIES, SIZES } from '@/data/catalog';
import {
  categoryReadiness,
  garmentRowsForSize,
  nextSize,
  seasonHint,
  summary,
  topTasks,
  wardrobeInsights,
  weeksUntil,
} from '@/lib/insights';
import { priceCheckCount } from '@/lib/offers';
import { useApp } from '@/state/store';
import { colors, radius, shadow, spacing, type } from '@/theme';

const QUICK = [
  { label: 'Legg til', icon: 'plus', href: '/add-item' },
  { label: 'Skann', icon: 'line-scan', href: '/scan' },
  { label: 'Garderobe', icon: 'tshirt-crew-outline', href: '/wardrobe' },
  { label: 'Sykehusbag', icon: 'bag-personal-outline', href: '/hospital-bag' },
  { label: 'Størrelser', icon: 'calendar-clock', href: '/sizes' },
  { label: 'Budsjett', icon: 'wallet-outline', href: '/budget' },
] as const;

export default function Home() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const { household, items, tasks, wardrobe } = state;

  const weeks = weeksUntil(household.dueDate);
  const born = household.situation === 'born';
  const result = useMemo(() => summary(state), [state]);
  const nextTasks = useMemo(() => topTasks(tasks, weeks), [tasks, weeks]);

  const categoryScores = useMemo(
    () =>
      CATEGORIES.map((c) => ({ ...c, score: categoryReadiness(items, c.id) })).sort(
        (a, b) => a.score - b.score,
      ),
    [items],
  );

  const insights = useMemo(
    () =>
      wardrobeInsights(
        garmentRowsForSize(items, wardrobe, household.currentSize),
        household.currentSize,
      ),
    [items, wardrobe, household.currentSize],
  );

  const upcoming = nextSize(household.currentSize, SIZES);
  const offerCount = useMemo(() => priceCheckCount(items), [items]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={type.small}>{born ? 'Babyen er født' : 'Snart er dere tre'}</Text>
            <Text style={styles.h1}>
              {born ? `${weeksSince(household.dueDate)} uker gammel` : `${weeks} uker til termin`}
            </Text>
          </View>
          <Pressable onPress={() => router.push('/baby')} style={styles.avatar} accessibilityLabel="Baby og innstillinger">
            <MaterialCommunityIcons name="teddy-bear" size={22} color={colors.primary} />
          </Pressable>
        </View>

        <Card style={styles.hero}>
          <ProgressRing value={result.percent} caption="klare" />
          <View style={{ flex: 1, gap: spacing(2) }}>
            <Text style={type.title}>Dere er {result.percent} % klare</Text>
            <Text style={type.small}>{result.owned} ting registrert</Text>
            <View style={{ gap: 6, marginTop: spacing(1) }}>
              <Pill label={`${result.importantMissing} viktige mangler`} tint={colors.warm} soft={colors.warmSoft} icon="alert-circle-outline" />
              <Pill label={`${result.canWait} kan vente`} tint={colors.wait} soft={colors.sunSoft} icon="clock-outline" />
            </View>
          </View>
        </Card>

        <SectionTitle
          action={
            <Pressable onPress={() => router.push('/plan')}>
              <Text style={styles.link}>Se hele planen</Text>
            </Pressable>
          }
        >
          Viktigst nå
        </SectionTitle>
        <Card style={{ paddingVertical: spacing(2) }}>
          {nextTasks.map((t, i) => (
            <Pressable
              key={t.id}
              onPress={() => dispatch({ type: 'toggleTask', id: t.id })}
              style={[styles.task, i > 0 && styles.divider]}
            >
              <View style={[styles.check, t.done && styles.checkDone]}>
                {t.done ? <MaterialCommunityIcons name="check" size={15} color={colors.surface} /> : null}
              </View>
              <Text style={[type.bodyStrong, t.done && styles.taskDone]}>{t.title}</Text>
            </Pressable>
          ))}
          {!nextTasks.length ? (
            <Text style={[type.body, { padding: spacing(3) }]}>Alt på lista er gjort. Fint jobbet.</Text>
          ) : null}
        </Card>

        <SectionTitle>Dere mangler mest innen</SectionTitle>
        <Card style={{ gap: spacing(4) }}>
          {categoryScores.slice(0, 4).map((c) => (
            <Pressable key={c.id} onPress={() => router.push({ pathname: '/items', params: { category: c.id } })}>
              <View style={styles.catRow}>
                <View style={[styles.catIcon, { backgroundColor: c.softTint }]}>
                  <MaterialCommunityIcons name={c.icon as any} size={16} color={c.tint} />
                </View>
                <Text style={[type.bodyStrong, { flex: 1 }]}>{c.label}</Text>
                <Text style={styles.catScore}>{c.score} %</Text>
              </View>
              <View style={{ marginTop: spacing(2), marginLeft: spacing(9) }}>
                <Bar value={c.score} tint={c.tint} />
              </View>
            </Pressable>
          ))}
        </Card>

        <SectionTitle
          action={
            <Pressable onPress={() => router.push('/wardrobe')}>
              <Text style={styles.link}>Garderobe</Text>
            </Pressable>
          }
        >
          Snart
        </SectionTitle>
        <View style={{ gap: spacing(3) }}>
          {insights.map((i, idx) => (
            <Note key={idx} tone={i.tone}>
              {i.text}
            </Note>
          ))}
          {upcoming ? (
            <Note tone="heads-up">{`${seasonHint(household.dueDate)} Neste størrelse blir ${upcoming}.`}</Note>
          ) : null}
        </View>

        <SectionTitle>Hurtigknapper</SectionTitle>
        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <Pressable key={q.label} onPress={() => router.push(q.href as any)} style={styles.quick}>
              <View style={styles.quickIcon}>
                <MaterialCommunityIcons name={q.icon as any} size={20} color={colors.primaryDark} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </Pressable>
          ))}
        </View>

        {offerCount > 0 ? (
          <Pressable onPress={() => router.push('/offers')} style={{ marginTop: spacing(6) }}>
            <View style={styles.promo}>
              <MaterialCommunityIcons name="tag-search-outline" size={20} color={colors.surface} />
              <View style={{ flex: 1 }}>
                <Text style={styles.promoTitle}>Sammenlign priser før dere kjøper</Text>
                <Text style={styles.promoBody}>
                  Se dagens priser hos Prisjakt på tingene dere mangler. Vi tjener ingenting på det.
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.surface} />
            </View>
          </Pressable>
        ) : null}

        <Pressable onPress={() => router.push('/favorites')} style={styles.favLink}>
          <View style={styles.favIcon}>
            <MaterialCommunityIcons name="star-check-outline" size={18} color={colors.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.bodyStrong}>Trygge favoritter</Text>
            <Text style={type.small}>Hjelp til å velge bilstol, vogn og bæresele.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.inkSoft} />
        </Pressable>

        <Pressable onPress={() => router.push('/help')} style={styles.favLink}>
          <View style={styles.favIcon}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={colors.primaryDark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.bodyStrong}>Slik bruker du BabyKlar</Text>
            <Text style={type.small}>Kort oppskrift — første gang og videre bruk.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.inkSoft} />
        </Pressable>

        <Text style={styles.footerNote}>BabyKlar hjelper deg å kjøpe smartere, ikke mer.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const weeksSince = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(`${iso}T00:00:00`).getTime()) / 86_400_000);
  return Math.max(0, Math.floor(days / 7));
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12) },
  topRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing(3) },
  h1: { ...type.display, marginTop: 2 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing(4), marginTop: spacing(5) },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
  task: { flexDirection: 'row', alignItems: 'center', gap: spacing(3), paddingVertical: spacing(3.5), paddingHorizontal: spacing(2) },
  divider: { borderTopWidth: 1, borderTopColor: colors.border },
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
  catRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  catIcon: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catScore: { ...type.small, fontWeight: '700', color: colors.inkSoft },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(3), rowGap: spacing(4) },
  quick: { width: '30%', alignItems: 'center', gap: 6 },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  quickLabel: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: spacing(4),
  },
  promoTitle: { fontSize: 16, fontWeight: '800', color: colors.surface },
  promoBody: { fontSize: 13, lineHeight: 18, color: '#DDECE6', marginTop: 2 },
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
  favIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNote: { ...type.small, textAlign: 'center', marginTop: spacing(8), fontStyle: 'italic' },
});
