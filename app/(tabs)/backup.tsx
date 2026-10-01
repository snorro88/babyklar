import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Platform, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Note, ScreenHeader, SectionTitle } from '@/components/ui';
import { confirm, notify } from '@/lib/dialog';
import { sanitizeState, useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';

export default function Backup() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [paste, setPaste] = useState('');

  const backup = useMemo(() => JSON.stringify(state), [state]);
  const size = `${Math.round(backup.length / 1024)} kB`;

  const copy = async () => {
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(backup);
        notify('Kopiert. Lim inn i en fil eller en melding til deg selv.');
      } else {
        await Share.share({ message: backup });
      }
    } catch {
      notify('Klarte ikke å dele. Marker teksten under og kopier manuelt.');
    }
  };

  const restore = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(paste);
    } catch {
      notify('Dette ser ikke ut som en gyldig sikkerhetskopi.');
      return;
    }
    const clean = sanitizeState(parsed);
    if (!clean) {
      notify('Sikkerhetskopien mangler viktig informasjon (ting og oppgaver) og kan ikke gjenopprettes.');
      return;
    }
    const ok = await confirm(
      'Gjenopprett data?',
      `Alt du har i appen nå blir erstattet: ${clean.items.length} ting, ${clean.tasks.length} oppgaver og ${clean.wishes.length} ønsker.`,
      'Gjenopprett',
    );
    if (!ok) return;
    dispatch({ type: 'importState', raw: parsed });
    setPaste('');
    notify('Dataene er gjenopprettet.');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Sikkerhetskopi" onBack={() => router.navigate('/')} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Note tone="ok">
          Alt ligger bare på denne enheten. Ta en kopi før du bytter telefon, så slipper du å
          registrere ting på nytt.
        </Note>

        <SectionTitle>Innhold</SectionTitle>
        <Card style={{ gap: spacing(2) }}>
          <Row label="Ting" value={state.items.length} />
          <Row label="Oppgaver" value={state.tasks.length} />
          <Row label="Ønsker" value={state.wishes.length} />
          <Row label="Størrelser i garderoben" value={Object.keys(state.wardrobe).length} />
          <Text style={[type.small, { marginTop: spacing(2) }]}>Filstørrelse ca. {size}</Text>
        </Card>

        <SectionTitle>Ta en kopi</SectionTitle>
        <Card style={{ gap: spacing(3) }}>
          <TextInput
            value={backup}
            editable={false}
            multiline
            style={styles.code}
            selectTextOnFocus
          />
          <Button
            label={Platform.OS === 'web' ? 'Kopier til utklippstavlen' : 'Del sikkerhetskopien'}
            icon="content-copy"
            onPress={copy}
          />
        </Card>

        <SectionTitle>Gjenopprett</SectionTitle>
        <Card style={{ gap: spacing(3) }}>
          <TextInput
            value={paste}
            onChangeText={setPaste}
            multiline
            placeholder="Lim inn en sikkerhetskopi her"
            placeholderTextColor={colors.muted}
            style={[styles.code, { color: colors.ink }]}
          />
          <Button
            label="Gjenopprett fra kopi"
            variant="soft"
            icon="backup-restore"
            onPress={restore}
            disabled={!paste.trim()}
          />
        </Card>

        <Text style={styles.footerNote}>
          Sikkerhetskopien inneholder alt du har lagt inn, inkludert navn hvis du har fylt det ut.
          Del den bare med deg selv eller partneren din.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.row}>
      <Text style={[type.body, { flex: 1 }]}>{label}</Text>
      <Text style={type.bodyStrong}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12) },
  row: { flexDirection: 'row', alignItems: 'center' },
  code: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing(3),
    height: 120,
    fontSize: 11,
    lineHeight: 15,
    color: colors.muted,
    textAlignVertical: 'top',
  },
  footerNote: { ...type.small, textAlign: 'center', marginTop: spacing(8), fontStyle: 'italic' },
});
