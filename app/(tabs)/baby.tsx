import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarDateField } from '@/components/CalendarDateField';
import { Button, Card, Chip, Note, Pill, SectionTitle, Switch } from '@/components/ui';
import { SIZES } from '@/data/catalog';
import { confirm } from '@/lib/dialog';
import { dateFromDays, daysUntil, formatDate, summary, weeksUntil } from '@/lib/insights';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { Household, Situation } from '@/types';

const SITUATIONS: { id: Situation; label: string }[] = [
  { id: 'first', label: 'Første barn' },
  { id: 'has-child', label: 'Har barn fra før' },
  { id: 'born', label: 'Babyen er født' },
];

export default function Baby() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const { household } = state;
  const [name, setName] = useState(household.babyName ?? '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  // Hidden on purpose: tap the version line five times to reveal the demo switch.
  const [versionTaps, setVersionTaps] = useState(0);
  const showDemoPanel = versionTaps >= 5;
  const result = summary(state);
  const unborn = daysUntil(household.dueDate) > 0;
  const born = household.situation === 'born';

  const setFamily = (patch: Partial<Household>) => dispatch({ type: 'setHousehold', patch });

  const chooseSituation = (situation: Situation) => {
    const patch: Partial<Household> = { situation };
    // Keep the date when it still fits; otherwise move it to the right side of today.
    if (situation === 'born' && unborn) patch.dueDate = dateFromDays(0);
    if (situation !== 'born' && daysUntil(household.dueDate) < 0) patch.dueDate = dateFromDays(9 * 7);
    setFamily(patch);
  };

  const confirmReset = async () => {
    const ok = await confirm(
      'Nullstill demoen?',
      'Alt du har lagt inn i denne demoen slettes.',
      'Nullstill',
    );
    if (!ok) return;
    dispatch({ type: 'reset' });
    router.replace('/onboarding');
  };

  const toggleDemoData = async (on: boolean) => {
    const ok = await confirm(
      on ? 'Fyll appen med eksempeldata?' : 'Slå av eksempeldata?',
      on
        ? 'Appen fylles med et ferdig utfylt eksempelhjem, slik at du kan vise den fram. Alt du har lagt inn selv forsvinner.'
        : 'Appen tømmes tilbake til en blank plan. Eksempeldataene forsvinner.',
      on ? 'Slå på' : 'Slå av',
    );
    if (!ok) return;
    dispatch({ type: 'setDemoData', on });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/')} hitSlop={10} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.inkSoft} />
        </Pressable>
        <Text style={type.title}>Baby</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Card style={{ alignItems: 'center', gap: spacing(2) }}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="teddy-bear" size={30} color={colors.primary} />
          </View>
          <Text style={type.title}>{name.trim() || 'Babyen'}</Text>
          <Text style={type.small}>
            {born
              ? `Født ${formatDate(household.dueDate)}`
              : `Termin ${formatDate(household.dueDate)} · ${weeksUntil(household.dueDate)} uker igjen`}
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing(2), marginTop: spacing(2) }}>
            <Pill label={`${result.percent} % klare`} />
            <Pill label={`${result.owned} ting`} tint={colors.lilac} soft={colors.lilacSoft} />
          </View>
        </Card>

        <SectionTitle>Navn (valgfritt)</SectionTitle>
        <Card>
          <TextInput
            value={name}
            onChangeText={(v) => {
              setName(v);
              dispatch({ type: 'setHousehold', patch: { babyName: v.trim() || undefined } });
            }}
            placeholder="Kallenavn eller ingenting"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          <Text style={[type.small, { marginTop: spacing(2) }]}>
            Termin- eller fødselsdato er nok for det meste av personaliseringen.
          </Text>
        </Card>

        <SectionTitle>Situasjon</SectionTitle>
        <View style={styles.wrap}>
          {SITUATIONS.map((s) => (
            <Chip
              key={s.id}
              label={s.label}
              selected={household.situation === s.id}
              onPress={() => chooseSituation(s.id)}
            />
          ))}
        </View>

        <SectionTitle>{born ? 'Fødselsdato' : 'Termin'}</SectionTitle>
        <Card>
          <CalendarDateField
            value={household.dueDate}
            onChange={(dueDate) => dueDate && setFamily({ dueDate })}
            minimumDate={born ? dateFromDays(-3 * 365) : dateFromDays(0)}
            maximumDate={born ? dateFromDays(0) : dateFromDays(42 * 7)}
          />
        </Card>

        <SectionTitle>{unborn ? 'Størrelse å starte i' : 'Størrelse nå'}</SectionTitle>
        <View style={styles.wrap}>
          {SIZES.map((s) => (
            <Chip
              key={s}
              label={s}
              selected={household.currentSize === s}
              onPress={() => dispatch({ type: 'setHousehold', patch: { currentSize: s } })}
            />
          ))}
        </View>

        <SectionTitle>Familie</SectionTitle>
        <Card style={{ gap: spacing(4) }}>
          <ToggleRow
            icon="car-outline"
            title="Bil"
            hint={household.hasCar ? 'Bilstol står som viktig før hjemreise' : 'Bilstol kan vente – den kan lånes til hjemreisen'}
            value={household.hasCar}
            onChange={(hasCar) => setFamily({ hasCar })}
          />
          <ToggleRow
            icon="archive-outline"
            title="Ting fra tidligere barn"
            hint="Arvet utstyr og klær"
            value={household.hasHandMeDowns}
            onChange={(hasHandMeDowns) => setFamily({ hasHandMeDowns })}
          />
          <ToggleRow
            icon="account-multiple-outline"
            title="Partner å dele med"
            hint="Samme plan, samme oversikt"
            value={household.sharesWithPartner}
            onChange={(sharesWithPartner) => setFamily({ sharesWithPartner })}
          />
          {household.sharesWithPartner ? (
            <Note tone="ok">
              Partnerdeling er valgt for denne demoen. Ekte synk mellom to enheter kommer senere.
            </Note>
          ) : null}
        </Card>

        <Pressable onPress={() => setShowAdvanced((v) => !v)} style={styles.advancedHeader} hitSlop={8}>
          <Text style={type.bodyStrong}>Avansert</Text>
          <MaterialCommunityIcons
            name={showAdvanced ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.inkSoft}
          />
        </Pressable>
        {showAdvanced ? (
          <Card style={{ gap: spacing(4), marginBottom: spacing(3) }}>
            <Pressable onPress={() => router.push('/backup')} style={styles.advancedLink}>
              <View style={styles.advancedIcon}>
                <MaterialCommunityIcons name="cloud-upload-outline" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type.bodyStrong}>Sikkerhetskopi</Text>
                <Text style={type.small}>Alt ligger bare på denne enheten. Ta en kopi før du bytter telefon.</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color={colors.inkSoft} />
            </Pressable>
          </Card>
        ) : null}

        <SectionTitle>Personvern</SectionTitle>
        <Card style={{ gap: spacing(3) }}>
          <Text style={type.body}>
            Vi samler minst mulig. Ingen helsedata, ingen medisinske råd, ingen deling med tredjepart.
            Bilder brukes bare til å gjenkjenne ting dere selv legger inn.
          </Text>
          <Button label="Slett alle lokale data" variant="ghost" icon="trash-can-outline" onPress={confirmReset} />
        </Card>

        <Pressable onPress={() => router.push('/help')} style={styles.guideLink}>
          <View style={styles.rowIcon}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={type.bodyStrong}>Slik bruker du BabyKlar</Text>
            <Text style={type.small}>Kort oppskrift for første gang og videre bruk.</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.inkSoft} />
        </Pressable>

        {showDemoPanel ? (
          <Card style={{ marginTop: spacing(4), gap: spacing(3) }}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialCommunityIcons name="presentation" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={type.bodyStrong}>Eksempeldata</Text>
                <Text style={type.small}>
                  Fyller appen med et ferdig utfylt hjem for demonstrasjon.
                </Text>
              </View>
              <Switch
                value={household.demoData}
                onChange={toggleDemoData}
                accessibilityLabel="Eksempeldata"
              />
            </View>
            <Text style={[type.small, { fontSize: 11 }]}>
              Bytter du, erstattes alt innhold. Termin, navn og innstillinger beholdes.
            </Text>
          </Card>
        ) : null}

        <Pressable onPress={confirmReset} style={{ marginTop: spacing(8) }}>
          <Text style={[type.small, { textAlign: 'center' }]}>Nullstill demoen</Text>
        </Pressable>
        <Pressable onPress={() => setVersionTaps((t) => t + 1)}>
          <Text style={[type.small, { textAlign: 'center', marginTop: spacing(2), fontSize: 11 }]}>
            BabyKlar demo 0.1 · {household.demoData ? 'eksempeldata på' : 'lokale data'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  icon,
  title,
  hint,
  value,
  onChange,
}: {
  icon: string;
  title: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable onPress={() => onChange(!value)} style={styles.row}>
      <View style={styles.rowIcon}>
        <MaterialCommunityIcons name={icon as any} size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={type.bodyStrong}>{title}</Text>
        <Text style={type.small}>{hint}</Text>
      </View>
      <Switch value={value} onChange={onChange} accessibilityLabel={title} />
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
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(4),
    height: 46,
    fontSize: 15,
    color: colors.ink,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  guideLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    marginTop: spacing(4),
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.bgAlt,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advancedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
    marginTop: spacing(4),
  },
  advancedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingVertical: spacing(2),
  },
  advancedIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
