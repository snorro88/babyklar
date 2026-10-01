import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarDateField } from '@/components/CalendarDateField';
import { Button, Card, Chip, Switch } from '@/components/ui';
import { daysUntil, formatDate, weeksUntil } from '@/lib/insights';
import { reusesGear } from '@/lib/plan';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { FocusArea, Situation } from '@/types';

const SITUATIONS: { id: Situation; label: string; hint: string; icon: string }[] = [
  { id: 'first', label: 'Vi venter vårt første barn', hint: 'Vi starter med det aller viktigste', icon: 'heart-outline' },
  { id: 'has-child', label: 'Vi venter barn og har barn fra før', hint: 'Vi tar hensyn til det dere allerede har', icon: 'account-child-outline' },
  { id: 'born', label: 'Babyen er allerede født', hint: 'Vi fokuserer på hva barnet trenger nå', icon: 'baby-face-outline' },
];

const FOCUS: { id: FocusArea; label: string; icon: string }[] = [
  { id: 'equipment', label: 'Utstyr', icon: 'baby-carriage' },
  { id: 'clothes', label: 'Klær og størrelser', icon: 'tshirt-crew-outline' },
  { id: 'hospitalBag', label: 'Sykehusbag', icon: 'bag-personal-outline' },
  { id: 'wishlist', label: 'Ønskeliste', icon: 'gift-outline' },
  { id: 'owned', label: 'Ting vi eier', icon: 'archive-outline' },
  { id: 'tasks', label: 'Oppgaver', icon: 'checkbox-marked-circle-outline' },
  { id: 'budget', label: 'Budsjett', icon: 'wallet-outline' },
];

const dateFromDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function Onboarding() {
  const router = useRouter();
  const { dispatch } = useApp();

  const [step, setStep] = useState(0);
  const [situation, setSituation] = useState<Situation>('first');
  const [dueDate, setDueDate] = useState(() => dateFromDays(9 * 7));
  const [hasCar, setHasCar] = useState(true);
  const [hasHandMeDowns, setHasHandMeDowns] = useState(false);
  const [sharesWithPartner, setSharesWithPartner] = useState(true);
  const [focus, setFocus] = useState<FocusArea[]>(['equipment', 'clothes']);

  const born = situation === 'born';
  const availableFocus = born ? FOCUS.filter((area) => area.id !== 'hospitalBag') : FOCUS;
  const weeks = born
    ? Math.max(0, Math.round(Math.abs(daysUntil(dueDate)) / 7))
    : weeksUntil(dueDate);
  const minimumDate = born ? dateFromDays(-3 * 365) : dateFromDays(0);
  const maximumDate = born ? dateFromDays(0) : dateFromDays(42 * 7);

  // Summary of the answers so far. We deliberately show no readiness percentage
  // here – the app knows nothing about what the family actually owns yet.
  const setupLines = useMemo(() => {
    const lines: { icon: string; text: string }[] = [
      {
        icon: 'calendar-heart',
        text: born
          ? `Vi regner fra fødselsdatoen ${formatDate(dueDate)}.`
          : `Vi følger dere fram til termin ${formatDate(dueDate)}.`,
      },
      hasCar
        ? { icon: 'car-child-seat', text: 'Bilstol står som viktig før hjemreise.' }
        : { icon: 'car-off', text: 'Uten bil flyttes bilstol lenger ned på lista.' },
    ];
    if (reusesGear({ situation, hasHandMeDowns }))
      lines.push({ icon: 'archive-outline', text: 'Vi minner om å sjekke arvede ting før dere kjøper nytt.' });
    if (sharesWithPartner)
      lines.push({ icon: 'account-multiple-outline', text: 'Planen er laget for å deles med partner.' });
    if (focus.length)
      lines.push({
        icon: 'target',
        text: `Vi starter med ${focus
          .map((f) => FOCUS.find((x) => x.id === f)?.label.toLowerCase())
          .filter(Boolean)
          .join(', ')}.`,
      });
    return lines;
  }, [born, dueDate, hasCar, hasHandMeDowns, situation, sharesWithPartner, focus]);

  const total = 5;

  const toggleFocus = (id: FocusArea) =>
    setFocus((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const chooseSituation = (next: Situation) => {
    const nextBorn = next === 'born';
    if (nextBorn !== born) setDueDate(dateFromDays(nextBorn ? -9 * 7 : 9 * 7));
    if (nextBorn) setFocus((areas) => areas.filter((area) => area !== 'hospitalBag'));
    setSituation(next);
  };

  const finish = () => {
    dispatch({
      type: 'completeOnboarding',
      household: { situation, dueDate, hasCar, hasHandMeDowns, sharesWithPartner, focus },
    });
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => setStep((s) => Math.max(0, s - 1))}
          hitSlop={10}
          style={{ opacity: step === 0 ? 0 : 1 }}
          disabled={step === 0}
        >
          <MaterialCommunityIcons name="chevron-left" size={26} color={colors.inkSoft} />
        </Pressable>
        <View style={styles.dots}>
          {Array.from({ length: total }).map((_, i) => (
            <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
          ))}
        </View>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {step === 0 ? (
          <>
            <View style={styles.logo}>
              <MaterialCommunityIcons name="teddy-bear" size={30} color={colors.primary} />
            </View>
            <Text style={styles.h1}>BabyKlar</Text>
            <Text style={styles.lead}>
              Vi hjelper dere å finne ut hva dere faktisk trenger — og hva dere trygt kan la være å kjøpe.
            </Text>
            <View style={{ gap: spacing(3), marginTop: spacing(8) }}>
              {['Hva trenger vi?', 'Hva har vi allerede?', 'Hva trenger barnet snart?'].map((q) => (
                <View key={q} style={styles.promise}>
                  <MaterialCommunityIcons name="check-circle-outline" size={18} color={colors.primary} />
                  <Text style={type.bodyStrong}>{q}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <Text style={styles.h2}>Hva passer best?</Text>
            <Text style={styles.sub}>Vi tilpasser planen deretter.</Text>
            <View style={{ gap: spacing(3), marginTop: spacing(6) }}>
              {SITUATIONS.map((s) => (
                <Pressable key={s.id} onPress={() => chooseSituation(s.id)}>
                  <Card style={[styles.option, situation === s.id && styles.optionActive]}>
                    <View style={styles.optionIcon}>
                      <MaterialCommunityIcons name={s.icon as any} size={22} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={type.bodyStrong}>{s.label}</Text>
                      <Text style={type.small}>{s.hint}</Text>
                    </View>
                    {situation === s.id ? (
                      <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} />
                    ) : null}
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Text style={styles.h2}>{born ? 'Når ble babyen født?' : 'Når er termin?'}</Text>
            <Text style={styles.sub}>Dette er nok til å personalisere det meste. Navn kan dere hoppe over.</Text>
            <Card style={styles.dateCard}>
              <Text style={styles.bigNumber}>{weeks}</Text>
              <Text style={type.small}>{born ? 'uker siden fødsel' : 'uker til termin'}</Text>
              <Text style={styles.selectedDate}>{formatDate(dueDate)}</Text>
              <CalendarDateField
                value={dueDate}
                onChange={setDueDate}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
              />
            </Card>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <Text style={styles.h2}>Har dere …</Text>
            <Text style={styles.sub}>Vi fjerner det som ikke er relevant for dere.</Text>
            <View style={{ gap: spacing(3), marginTop: spacing(6) }}>
              <Toggle label="Bil" hint="Da trenger dere bilstol før hjemreise" value={hasCar} onChange={setHasCar} icon="car-outline" />
              <Toggle label="Ting fra tidligere barn" hint="Arvet utstyr og klær" value={hasHandMeDowns} onChange={setHasHandMeDowns} icon="archive-outline" />
              <Toggle label="Partner å dele med" hint="Samme plan, samme oversikt" value={sharesWithPartner} onChange={setSharesWithPartner} icon="account-multiple-outline" />
            </View>
          </>
        ) : null}

        {step === 4 ? (
          <>
            <Text style={styles.h2}>Hva vil dere ha mest hjelp med?</Text>
            <Text style={styles.sub}>Velg gjerne flere.</Text>
            <View style={styles.chips}>
              {availableFocus.map((f) => (
                <Chip
                  key={f.id}
                  label={f.label}
                  icon={f.icon as any}
                  selected={focus.includes(f.id)}
                  onPress={() => toggleFocus(f.id)}
                />
              ))}
            </View>

            <Card style={{ marginTop: spacing(8), gap: spacing(4) }}>
              <Text style={type.title}>Slik setter vi opp planen</Text>
              <View style={{ gap: spacing(3) }}>
                {setupLines.map((l) => (
                  <View key={l.text} style={styles.setupLine}>
                    <View style={styles.setupIcon}>
                      <MaterialCommunityIcons name={l.icon as any} size={16} color={colors.primary} />
                    </View>
                    <Text style={[type.body, { flex: 1 }]}>{l.text}</Text>
                  </View>
                ))}
              </View>
              <Text style={type.small}>
                Vi vet ennå ingenting om hva dere har hjemme — det fyller dere inn etterpå. Da regner
                vi ut hvor klare dere er.
              </Text>
            </Card>
          </>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={step === total - 1 ? 'Kom i gang' : 'Fortsett'}
          onPress={() => (step === total - 1 ? finish() : setStep((s) => s + 1))}
          icon={step === total - 1 ? 'arrow-right' : undefined}
        />
        {step === 0 ? (
          <Text style={styles.legal}>
            Vi samler minst mulig. Barnets navn er valgfritt, og du kan slette alle lokale data når som helst.
          </Text>
        ) : null}
        {step === total - 1 ? (
          <Text style={styles.legal}>
            Etterpå finner du «Slik bruker du BabyKlar» på Hjem — en kort oppskrift på to minutter.
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
  icon,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon: string;
}) {
  return (
    <Pressable onPress={() => onChange(!value)}>
      <Card style={[styles.option, value && styles.optionActive]}>
        <View style={styles.optionIcon}>
          <MaterialCommunityIcons name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={type.bodyStrong}>{label}</Text>
          <Text style={type.small}>{hint}</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Switch value={value} onChange={onChange} accessibilityLabel={label} />
          <Text style={[type.tiny, { color: value ? colors.primaryDark : colors.inkSoft }]}>
            {value ? 'JA' : 'NEI'}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(5),
    paddingTop: spacing(2),
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 20, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary },
  content: { paddingHorizontal: spacing(5), paddingTop: spacing(8), paddingBottom: spacing(10) },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(5),
  },
  h1: { ...type.display, fontSize: 38 },
  h2: type.display,
  lead: { ...type.body, fontSize: 17, lineHeight: 25, marginTop: spacing(3) },
  sub: { ...type.body, marginTop: spacing(2) },
  promise: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  optionActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigNumber: { fontSize: 56, fontWeight: '800', color: colors.primary, letterSpacing: -2 },
  dateCard: { marginTop: spacing(6), alignItems: 'center', gap: spacing(3) },
  selectedDate: { ...type.bodyStrong, marginBottom: spacing(2) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2), marginTop: spacing(6) },
  setupLine: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  setupIcon: {
    width: 30,
    height: 30,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: spacing(5), paddingBottom: spacing(3), gap: spacing(3) },
  legal: { ...type.small, textAlign: 'center', fontSize: 12 },
});
