import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Chip } from '@/components/ui';
import { CATEGORIES, PRIORITY_LABEL, SIZES, STATUS_LABEL } from '@/data/catalog';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { CategoryId, Item, Priority, Status } from '@/types';

const STATUSES: Status[] = ['have', 'missing', 'want', 'to-buy', 'ordered', 'stored'];
const PRIORITIES: Priority[] = ['important', 'can-wait', 'optional'];
const ORIGINS: { id: NonNullable<Item['origin']>; label: string }[] = [
  { id: 'bought', label: 'Kjøpt' },
  { id: 'inherited', label: 'Arvet' },
  { id: 'gift', label: 'Gave' },
];

export default function AddItem() {
  const router = useRouter();
  const { dispatch } = useApp();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<CategoryId>('clothes');
  const [priority, setPriority] = useState<Priority>('important');
  const [status, setStatus] = useState<Status>('have');
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<string | undefined>();
  const [place, setPlace] = useState('');
  const [origin, setOrigin] = useState<Item['origin']>('bought');
  const [note, setNote] = useState('');

  const save = () => {
    if (!name.trim()) return;
    dispatch({
      type: 'addItems',
      items: [
        {
          name: name.trim(),
          category,
          priority,
          status,
          quantity,
          size,
          place: place.trim() || undefined,
          origin,
          note: note.trim() || undefined,
          custom: true,
        },
      ],
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={type.title}>Legg til</Text>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.close}>
          <MaterialCommunityIcons name="close" size={20} color={colors.inkSoft} />
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Card style={{ gap: spacing(4) }}>
            <View style={{ gap: spacing(2) }}>
              <Text style={styles.label}>Hva er det?</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="F.eks. Ullbody, bilstol, sovepose"
                placeholderTextColor={colors.muted}
                style={styles.input}
                autoFocus
              />
            </View>

            <View style={{ gap: spacing(2) }}>
              <Text style={styles.label}>Kategori</Text>
              <View style={styles.wrap}>
                {CATEGORIES.map((c) => (
                  <Chip
                    key={c.id}
                    label={c.label}
                    icon={c.icon as any}
                    selected={category === c.id}
                    onPress={() => setCategory(c.id)}
                  />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing(2) }}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.wrap}>
                {STATUSES.map((s) => (
                  <Chip key={s} label={STATUS_LABEL[s]} selected={status === s} onPress={() => setStatus(s)} />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing(2) }}>
              <Text style={styles.label}>Prioritet</Text>
              <View style={styles.wrap}>
                {PRIORITIES.map((p) => (
                  <Chip key={p} label={PRIORITY_LABEL[p]} selected={priority === p} onPress={() => setPriority(p)} />
                ))}
              </View>
            </View>

            <View style={styles.rowBetween}>
              <Text style={styles.label}>Antall</Text>
              <View style={styles.stepper}>
                <Pressable onPress={() => setQuantity((q) => Math.max(1, q - 1))} style={styles.stepBtn}>
                  <MaterialCommunityIcons name="minus" size={18} color={colors.inkSoft} />
                </Pressable>
                <Text style={styles.qty}>{quantity}</Text>
                <Pressable onPress={() => setQuantity((q) => q + 1)} style={styles.stepBtn}>
                  <MaterialCommunityIcons name="plus" size={18} color={colors.inkSoft} />
                </Pressable>
              </View>
            </View>

            {category === 'clothes' ? (
              <View style={{ gap: spacing(2) }}>
                <Text style={styles.label}>Størrelse</Text>
                <View style={styles.wrap}>
                  {SIZES.map((s) => (
                    <Chip key={s} label={s} selected={size === s} onPress={() => setSize(size === s ? undefined : s)} />
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ gap: spacing(2) }}>
              <Text style={styles.label}>Hvor kommer det fra?</Text>
              <View style={styles.wrap}>
                {ORIGINS.map((o) => (
                  <Chip key={o.id} label={o.label} selected={origin === o.id} onPress={() => setOrigin(o.id)} />
                ))}
              </View>
            </View>

            <View style={{ gap: spacing(2) }}>
              <Text style={styles.label}>Lagringssted</Text>
              <TextInput
                value={place}
                onChangeText={setPlace}
                placeholder="F.eks. Boden, kommoden, bilen"
                placeholderTextColor={colors.muted}
                style={styles.input}
              />
            </View>

            <View style={{ gap: spacing(2) }}>
              <Text style={styles.label}>Notat</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Valgfritt"
                placeholderTextColor={colors.muted}
                style={[styles.input, { height: 80, paddingTop: spacing(3) }]}
                multiline
              />
            </View>
          </Card>

          <Text style={[type.small, { textAlign: 'center', marginTop: spacing(4) }]}>
            Slipper du å skrive? Bruk skanning og ta et bilde i stedet.
          </Text>
        </ScrollView>

        <View style={styles.footer}>
          <Button label="Lagre" onPress={save} disabled={!name.trim()} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(4),
  },
  close: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(6) },
  label: { ...type.section, color: colors.muted },
  input: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(4),
    minHeight: 46,
    fontSize: 15,
    color: colors.ink,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { fontSize: 16, fontWeight: '700', color: colors.ink, minWidth: 20, textAlign: 'center' },
  footer: { paddingHorizontal: spacing(5), paddingBottom: spacing(3), paddingTop: spacing(2) },
});
