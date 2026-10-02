import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card, Note, ScreenHeader, SectionTitle } from '@/components/ui';
import { STATUS_LABEL } from '@/data/catalog';
import { FEATURES } from '@/lib/features';
import { colors, radius, spacing, type } from '@/theme';
import type { Status } from '@/types';

const FIRST_TIME: { title: string; body: string; icon: string }[] = [
  {
    icon: 'calendar-heart',
    title: 'Svar på de fem spørsmålene',
    body: 'Termin eller fødselsdato, om dere har bil, arvede ting og hva dere vil ha hjelp med. Det tar under ett minutt, og planen tilpasses svarene. Alt kan endres senere under Baby.',
  },
  {
    icon: 'package-variant-closed',
    title: 'Gå gjennom «Ting» én gang',
    body: 'Her ligger alt et nyfødt barn vanligvis trenger. Trykk på en ting og sett status: Har, Mangler, Ønsker eller Trenger ikke. Bruk 10–15 minutter på de viktigste — resten kan vente.',
  },
  {
    icon: 'line-scan',
    title: 'Eller skann en bunke',
    body: 'Har dere fått en pose med klær eller en eske? Trykk på den runde skanneknappen midt i menyen og ta bilde. Sjekk forslagene før de lagres — ting dere manglet krysses av automatisk.',
  },
  {
    icon: 'home-variant-outline',
    title: 'Sjekk Hjem',
    body: 'Nå viser Hjem hvor klare dere er, hva som er viktigst nå, og hvor mange ting som mangler i hver kategori. Prosenten er bare et hjelpemiddel — den skal ikke stresse dere.',
  },
  {
    icon: 'gift-outline',
    title: 'Del ønskelista',
    body: 'Alt dere setter til «Ønsker» havner automatisk på ønskelista. Del lenken med familien — de kan reservere uten å laste ned noe.',
  },
];

const EVERY_DAY: { title: string; body: string; icon: string; on?: boolean }[] = [
  {
    icon: 'clipboard-check-outline',
    title: 'Plan',
    body: 'Huk av oppgaver etter hvert. Lista sorteres etter hvor nær termin dere er, så det som haster ligger øverst.',
  },
  {
    icon: 'plus-circle-outline',
    title: 'Legg til det dere får',
    body: 'Får dere noe i gave eller kjøper noe? Legg det inn med «Legg til», eller bare endre status på tingen fra Mangler til Har.',
  },
  {
    icon: 'tshirt-crew-outline',
    title: FEATURES.sizes ? 'Garderobe og størrelser' : 'Garderobe',
    body: FEATURES.sizes
      ? 'Garderoben teller klærne dere har registrert og sier fra hvis dere mangler noe i den størrelsen barnet bruker nå — og hva som trengs i neste.'
      : 'Garderoben teller klærne dere har registrert i hver størrelse og sier fra hvis dere mangler noe.',
  },
  {
    icon: 'bag-personal-outline',
    title: 'Sykehusbag',
    body: 'Fra uke 34 er det lurt å starte. Pakkemodus gir én ting av gangen, så dere slipper å scrolle med bagen i fanget.',
  },
  {
    icon: 'wallet-outline',
    title: 'Budsjett',
    body: 'Hver ting kan ha en anslått pris. Budsjettet viser hva dere har brukt og hva som gjenstår, slik at store kjøp kan planlegges.',
    on: FEATURES.budget,
  },
].filter((s) => s.on !== false);

const STATUS_HELP: { status: Status; body: string }[] = [
  { status: 'have', body: 'Dere har den, også om den ligger i boden. Teller som klar.' },
  { status: 'missing', body: 'Mangler fortsatt. Havner i planen.' },
  { status: 'want', body: 'Legges automatisk på ønskelista.' },
  { status: 'not-needed', body: 'Dere dropper den bevisst. Trekkes helt ut av regnestykket.' },
];

export default function Help() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Slik bruker du BabyKlar" onBack={() => router.navigate('/')} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={{ gap: spacing(2) }}>
          <Text style={type.title}>Kort fortalt</Text>
          <Text style={type.body}>
            BabyKlar svarer på tre ting: hva trenger vi, hva har vi allerede, og hva trenger barnet
            snart? Appen skal hjelpe dere å kjøpe smartere — ikke mer. «Trenger ikke» er et like godt
            svar som «Har».
          </Text>
        </Card>

        <SectionTitle>Første gang · ca. 15 minutter</SectionTitle>
        <View style={{ gap: spacing(3) }}>
          {FIRST_TIME.map((s, i) => (
            <Card key={s.title} style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={styles.stepTitleRow}>
                  <MaterialCommunityIcons name={s.icon as any} size={16} color={colors.primary} />
                  <Text style={type.bodyStrong}>{s.title}</Text>
                </View>
                <Text style={type.body}>{s.body}</Text>
              </View>
            </Card>
          ))}
        </View>

        <Note tone="ok">
          Dere trenger ikke gjøre alt på én gang. Ta de viktigste tingene først, så fyller dere på
          etter hvert som dere rydder, arver og handler.
        </Note>

        <SectionTitle>Videre bruk</SectionTitle>
        <Card style={{ gap: spacing(4) }}>
          {EVERY_DAY.map((s) => (
            <View key={s.title} style={styles.row}>
              <View style={styles.rowIcon}>
                <MaterialCommunityIcons name={s.icon as any} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={type.bodyStrong}>{s.title}</Text>
                <Text style={type.body}>{s.body}</Text>
              </View>
            </View>
          ))}
        </Card>

        <SectionTitle>Hva statusene betyr</SectionTitle>
        <Card style={{ gap: spacing(3) }}>
          {STATUS_HELP.map((s) => (
            <View key={s.status} style={styles.statusRow}>
              <View style={styles.statusTag}>
                <Text style={styles.statusTagText}>{STATUS_LABEL[s.status]}</Text>
              </View>
              <Text style={[type.body, { flex: 1 }]}>{s.body}</Text>
            </View>
          ))}
        </Card>

        <SectionTitle>Godt å vite</SectionTitle>
        <Card style={{ gap: spacing(3) }}>
          <Text style={type.body}>
            · Chevron-knappen øverst til venstre tar dere alltid tilbake til Hjem.
          </Text>
          {FEATURES.priceCheck ? (
            <Text style={type.body}>
              · «Sammenlign priser» går rett til Prisjakt. Vi oppgir ingen pris selv, så det dere ser er
              alltid dagens — og vi tjener ingenting på lenkene.
            </Text>
          ) : null}
          <Text style={type.body}>
            · Alt ligger kun på denne enheten. Ta en sikkerhetskopi under Baby → Avansert før dere
            bytter telefon.
          </Text>
          <Text style={type.body}>
            · Vi gir aldri medisinske råd. Anbefalingene er mengder og tidspunkter, ikke helsefaglige
            vurderinger.
          </Text>
        </Card>

        <Pressable onPress={() => router.push('/items')} style={styles.cta}>
          <MaterialCommunityIcons name="arrow-right" size={18} color={colors.surface} />
          <Text style={styles.ctaText}>Start med å gå gjennom Ting</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12), gap: spacing(3) },
  step: { flexDirection: 'row', gap: spacing(3), alignItems: 'flex-start' },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { fontSize: 13, fontWeight: '800', color: colors.surface },
  stepTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  row: { flexDirection: 'row', gap: spacing(3), alignItems: 'flex-start' },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  statusTag: {
    minWidth: 96,
    paddingVertical: 4,
    paddingHorizontal: spacing(3),
    borderRadius: radius.pill,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
  },
  statusTagText: { ...type.tiny, color: colors.inkSoft },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 50,
    marginTop: spacing(4),
  },
  ctaText: { fontSize: 15, fontWeight: '700', color: colors.surface },
});
