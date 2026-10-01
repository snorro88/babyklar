import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Empty, Note, Pill, ScreenHeader, SectionTitle } from '@/components/ui';
import { FavoriteCard } from '@/components/FavoriteCard';
import { PRIORITY_LABEL, STATUS_LABEL, categoryMeta } from '@/data/catalog';
import { confirm, notify } from '@/lib/dialog';
import { favoriteGroupForItem, favoritesForItem } from '@/lib/favorites';
import { isItemOpen } from '@/lib/offers';
import { PRICE_SOURCE, openPriceCheck } from '@/lib/prices';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { Item, Status } from '@/types';

const STATUSES: Status[] = [
  'have',
  'missing',
  'to-buy',
  'ordered',
  'want',
  'stored',
  'not-needed',
  'outgrown',
];

const ORIGIN_LABEL: Record<NonNullable<Item['origin']>, string> = {
  bought: 'Kjøpt',
  inherited: 'Arvet',
  gift: 'Gave',
};

export default function ItemDetail() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const { id } = useLocalSearchParams<{ id: string }>();

  const item = useMemo(() => state.items.find((i) => i.id === id), [state.items, id]);

  const goBack = () => router.navigate('/');

  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScreenHeader title="Vare" onBack={goBack} />
        <Empty
          icon="package-variant"
          title="Fant ikke tingen"
          body="Den kan ha blitt slettet. Gå tilbake til listen."
        />
      </SafeAreaView>
    );
  }

  const meta = categoryMeta(item.category);
  const patch = (p: Partial<Item>) => dispatch({ type: 'updateItem', id: item.id, patch: p });
  const favoriteGroup = favoriteGroupForItem(item);
  const favorites = favoriteGroup ? favoritesForItem(item).slice(0, 3) : [];

  const inWishlist = state.wishes.some(
    (w) => w.name.trim().toLowerCase() === item.name.trim().toLowerCase(),
  );
  const addToWishlist = () => {
    dispatch({
      type: 'addWish',
      wish: { name: item.name, size: item.size, priority: 'medium', usedOk: true },
    });
    notify('Lagt til i ønskelista.', 'Du finner den under Ønsker – der kan familien reservere.');
  };

  const remove = async () => {
    const ok = await confirm('Slette denne tingen?', `«${item.name}» fjernes fra listene deres.`, 'Slett');
    if (!ok) return;
    dispatch({ type: 'removeItem', id: item.id });
    goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Detaljer" onBack={goBack} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <View style={[styles.icon, { backgroundColor: meta.softTint }]}>
            <MaterialCommunityIcons name={meta.icon as any} size={22} color={meta.tint} />
          </View>
          <View style={{ flex: 1, gap: spacing(1) }}>
            <Text style={type.title}>{item.name}</Text>
            <View style={styles.pills}>
              <Pill label={meta.label} tint={meta.tint} soft={meta.softTint} />
              <Pill label={PRIORITY_LABEL[item.priority]} tint={colors.inkSoft} soft={colors.bgAlt} />
              {item.origin ? (
                <Pill label={ORIGIN_LABEL[item.origin]} tint={colors.lilac} soft={colors.lilacSoft} />
              ) : null}
            </View>
          </View>
        </View>

        {item.why ? <Note tone="ok">{item.why}</Note> : null}

        {inWishlist ? (
          <Note tone="ok">Denne står allerede på ønskelista deres.</Note>
        ) : (
          <Button
            label="Legg til i ønskeliste"
            variant="soft"
            icon="gift-outline"
            style={{ marginTop: spacing(2) }}
            onPress={addToWishlist}
          />
        )}

        <SectionTitle>Status</SectionTitle>
        <View style={styles.statusRow}>
          {STATUSES.map((s) => (
            <Pressable
              key={s}
              onPress={() => patch({ status: s })}
              style={[styles.statusChip, item.status === s && styles.statusChipActive]}
            >
              <Text style={[styles.statusText, item.status === s && styles.statusTextActive]}>
                {STATUS_LABEL[s]}
              </Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle>Antall</SectionTitle>
        <Card style={styles.qtyCard}>
          <Pressable
            onPress={() => dispatch({ type: 'setQuantity', id: item.id, quantity: item.quantity - 1 })}
            hitSlop={8}
            style={styles.stepBtn}
            accessibilityLabel="Færre"
          >
            <MaterialCommunityIcons name="minus" size={20} color={colors.inkSoft} />
          </Pressable>
          <Text style={styles.qty}>{item.quantity}</Text>
          <Pressable
            onPress={() => dispatch({ type: 'setQuantity', id: item.id, quantity: item.quantity + 1 })}
            hitSlop={8}
            style={styles.stepBtn}
            accessibilityLabel="Flere"
          >
            <MaterialCommunityIcons name="plus" size={20} color={colors.inkSoft} />
          </Pressable>
        </Card>

        <SectionTitle>Detaljer</SectionTitle>
        <Card style={{ gap: spacing(4) }}>
          <Field label="Navn" value={item.name} onChange={(v) => patch({ name: v })} />
          <Field
            label="Størrelse"
            value={item.size ?? ''}
            placeholder="f.eks. 62"
            onChange={(v) => patch({ size: v || undefined })}
          />
          <Field
            label="Merke"
            value={item.brand ?? ''}
            placeholder="Valgfritt"
            onChange={(v) => patch({ brand: v || undefined })}
          />
          <Field
            label="Pris per stk (kr)"
            value={item.price != null ? String(item.price) : ''}
            placeholder="Anslag"
            keyboardType="numeric"
            onChange={(v) => {
              const n = Number(v.replace(/[^\d]/g, ''));
              patch({ price: v.trim() && n > 0 ? n : undefined });
            }}
          />
          <Field
            label="Hvor ligger den?"
            value={item.place ?? ''}
            placeholder="f.eks. Boden"
            onChange={(v) => patch({ place: v || undefined })}
          />
          <Field
            label="Notat"
            value={item.note ?? ''}
            placeholder="Valgfritt"
            multiline
            onChange={(v) => patch({ note: v || undefined })}
          />
        </Card>

        {isItemOpen(item) ? (
          <Button
            label={`Sjekk dagens pris hos ${PRICE_SOURCE}`}
            variant="soft"
            icon="open-in-new"
            style={{ marginTop: spacing(4) }}
            onPress={() => openPriceCheck(item.name)}
          />
        ) : null}

        {favoriteGroup && favorites.length ? (
          <>
            <SectionTitle>Trygge favoritter</SectionTitle>
            <Text style={[type.small, { marginBottom: spacing(3) }]}>
              Uavhengig utvalg basert på test og erfaring – ikke betalte plasseringer.
            </Text>
            <View style={{ gap: spacing(3) }}>
              {favorites.map((f) => (
                <FavoriteCard key={f.id} favorite={f} group={favoriteGroup} />
              ))}
            </View>
          </>
        ) : null}

        <Button
          label="Slett tingen"
          variant="ghost"
          icon="trash-can-outline"
          style={{ marginTop: spacing(8) }}
          onPress={remove}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric';
}) {
  return (
    <View style={{ gap: spacing(1) }}>
      <Text style={type.small}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        keyboardType={keyboardType}
        style={[styles.input, multiline && { height: 72, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12) },
  titleRow: { flexDirection: 'row', gap: spacing(3), marginBottom: spacing(4) },
  icon: { width: 46, height: 46, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  statusChip: {
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(2),
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  statusText: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
  statusTextActive: { color: colors.surface },
  qtyCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing(6) },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { ...type.title, minWidth: 40, textAlign: 'center' },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    fontSize: 15,
    color: colors.ink,
  },
});
