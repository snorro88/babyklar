import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Chip, Empty, HomeButton, Note, Pill, SectionTitle } from '@/components/ui';
import { STATUS_LABEL } from '@/data/catalog';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { Status, WishItem } from '@/types';

const PRIORITIES: { id: WishItem['priority']; label: string; tint: string; soft: string }[] = [
  { id: 'high', label: 'Høy', tint: colors.warm, soft: colors.warmSoft },
  { id: 'medium', label: 'Middels', tint: colors.wait, soft: colors.sunSoft },
  { id: 'low', label: 'Lav', tint: colors.optional, soft: colors.bgAlt },
];

/** Grunner til å fjerne noe fra ønskelista – uten «al Ønsker», som ville lagt tingen tilbake. */
const REMOVE_REASONS: Status[] = ['have', 'missing', 'to-buy', 'ordered', 'not-needed'];

const SHARE_URL = 'https://babyklar.no/o/demo-4f2a';

export default function Wishes() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [priority, setPriority] = useState<WishItem['priority']>('medium');
  const [usedOk, setUsedOk] = useState(true);
  const [removing, setRemoving] = useState<WishItem | null>(null);
  const [reason, setReason] = useState<Status | null>(null);

  const reserved = state.wishes.filter((w) => w.reservedBy).length;
  const removingMatch = removing
    ? state.items.find((i) => i.name.trim().toLowerCase() === removing.name.trim().toLowerCase())
    : undefined;

  const add = () => {
    if (!name.trim()) return;
    dispatch({
      type: 'addWish',
      wish: { name: name.trim(), size: size.trim() || undefined, priority, usedOk },
    });
    setName('');
    setSize('');
    setAdding(false);
  };

  const share = () =>
    Share.share({
      message: `Vi har laget en ønskeliste til babyen i BabyKlar: ${SHARE_URL}`,
    }).catch(() => {});

  const closeRemove = () => {
    setRemoving(null);
    setReason(null);
  };

  const confirmRemove = () => {
    if (!removing || !reason) return;
    if (removingMatch) dispatch({ type: 'setStatus', id: removingMatch.id, status: reason });
    dispatch({ type: 'removeWish', id: removing.id });
    closeRemove();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <HomeButton />
        <Text style={styles.h1}>Ønskeliste</Text>
        <Text style={type.body}>
          Familie og venner kan se lista og reservere gaver — uten å installere appen.
        </Text>

        <Card style={{ marginTop: spacing(5), gap: spacing(3) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing(3) }}>
            <View style={styles.linkIcon}>
              <MaterialCommunityIcons name="link-variant" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={type.bodyStrong}>Delbar lenke</Text>
              <Text style={type.small} numberOfLines={1}>
                {SHARE_URL}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing(2) }}>
            <Button label="Del lenke" icon="share-variant" onPress={share} style={{ flex: 1 }} />
            <Button
              label="Forhåndsvis"
              variant="ghost"
              onPress={() => router.push('/shared-wishlist')}
              style={{ flex: 1 }}
            />
          </View>
          {reserved > 0 ? (
            <Note tone="ok">{`${reserved} gave${reserved > 1 ? 'r er' : ' er'} reservert. Vi skjuler hvem – det skal være en overraskelse.`}</Note>
          ) : null}
        </Card>

        <SectionTitle
          action={
            <Pressable onPress={() => setAdding((v) => !v)}>
              <Text style={styles.link}>{adding ? 'Avbryt' : 'Legg til ønske'}</Text>
            </Pressable>
          }
        >
          {`${state.wishes.length} ønsker`}
        </SectionTitle>

        {adding ? (
          <Card style={{ gap: spacing(3), marginBottom: spacing(3) }}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Hva ønsker dere dere?"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoFocus
            />
            <TextInput
              value={size}
              onChangeText={setSize}
              placeholder="Størrelse (valgfritt)"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', gap: spacing(2) }}>
              {PRIORITIES.map((p) => (
                <Chip key={p.id} label={p.label} selected={priority === p.id} onPress={() => setPriority(p.id)} />
              ))}
            </View>
            <Pressable onPress={() => setUsedOk((v) => !v)} style={styles.checkboxRow}>
              <MaterialCommunityIcons
                name={usedOk ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={20}
                color={usedOk ? colors.primary : colors.muted}
              />
              <Text style={type.body}>Brukt er helt greit</Text>
            </Pressable>
            <Button label="Legg til" onPress={add} disabled={!name.trim()} />
          </Card>
        ) : null}

        <View style={{ gap: spacing(3) }}>
          {state.wishes.map((w) => {
            const p = PRIORITIES.find((x) => x.id === w.priority)!;
            return (
              <Card key={w.id} style={styles.wish}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={type.bodyStrong}>{w.name}</Text>
                  <View style={styles.wishMeta}>
                    <Pill label={p.label} tint={p.tint} soft={p.soft} />
                    {w.size ? <Text style={type.small}>str. {w.size}</Text> : null}
                    {w.usedOk ? <Text style={type.small}>brukt er ok</Text> : null}
                  </View>
                  {w.note ? <Text style={type.small}>{w.note}</Text> : null}
                  {w.reservedBy ? (
                    <Text style={[type.small, { color: colors.primary, fontWeight: '600' }]}>
                      Reservert · vi skjuler hvem
                    </Text>
                  ) : null}
                </View>
                <Pressable onPress={() => setRemoving(w)} hitSlop={8} accessibilityLabel={`Fjern ønsket ${w.name}`}>
                  <MaterialCommunityIcons name="close" size={18} color={colors.muted} />
                </Pressable>
              </Card>
            );
          })}
          {!state.wishes.length ? (
            <Empty
              icon="gift-outline"
              title="Ingen ønsker ennå"
              body="Legg inn noen få ting dere faktisk trenger. Det gjør det enklere for familien."
            />
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={!!removing} transparent animationType="fade" onRequestClose={closeRemove}>
        <Pressable style={styles.backdrop} onPress={closeRemove}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Fjerne fra ønskelisten?</Text>
            <Text style={type.body}>
              Jeg ønsker å fjerne «{removing?.name}» fra ønskelisten fordi:
            </Text>
            <View style={styles.reasonWrap}>
              {REMOVE_REASONS.map((s) => (
                <Chip key={s} label={STATUS_LABEL[s]} selected={reason === s} onPress={() => setReason(s)} />
              ))}
            </View>
            {removingMatch ? (
              <Text style={type.small}>Vi oppdaterer også statusen på «{removingMatch.name}» i Ting.</Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: spacing(2), marginTop: spacing(1) }}>
              <Button label="Avbryt" variant="ghost" onPress={closeRemove} style={{ flex: 1 }} />
              <Button label="Bekreft" onPress={confirmRemove} disabled={!reason} style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingTop: spacing(3), paddingBottom: spacing(12) },
  h1: { ...type.display, marginBottom: spacing(1) },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
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
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  wish: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing(3) },
  wishMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), flexWrap: 'wrap' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: spacing(5),
  },
  sheet: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(5),
    gap: spacing(3),
  },
  sheetTitle: { ...type.title },
  reasonWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
});
