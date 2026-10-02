import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Pill } from '@/components/ui';
import { PRIORITY_LABEL, STATUS_LABEL, categoryMeta } from '@/data/catalog';
import { isDone } from '@/lib/insights';
import { colors, radius, spacing, type } from '@/theme';
import type { Item, Status } from '@/types';

const QUICK_STATUSES: Status[] = ['have', 'missing', 'want', 'not-needed'];

const priorityTint: Record<Item['priority'], { tint: string; soft: string }> = {
  important: { tint: colors.warm, soft: colors.warmSoft },
  'can-wait': { tint: colors.wait, soft: colors.sunSoft },
  optional: { tint: colors.optional, soft: colors.bgAlt },
};

export function ItemRow({
  item,
  onStatus,
  onQuantity,
  onOpen,
  showCategory = true,
  dimmed = false,
}: {
  item: Item;
  onStatus: (status: Status) => void;
  onQuantity?: (quantity: number) => void;
  onOpen?: () => void;
  showCategory?: boolean;
  dimmed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const meta = categoryMeta(item.category);
  const done = isDone(item);
  const prio = priorityTint[item.priority];

  return (
    <View style={[styles.wrap, dimmed && styles.wrapDimmed]}>
      <View style={styles.row}>
        <Pressable
          onPress={() => onStatus(done ? 'missing' : 'have')}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={`${item.name}, ${done ? 'har' : 'mangler'}`}
          style={[styles.check, done && styles.checkDone]}
        >
          {done ? <MaterialCommunityIcons name="check" size={16} color={colors.surface} /> : null}
        </Pressable>

        <Pressable style={styles.body} onPress={() => setOpen((v) => !v)}>
          <Text style={[styles.name, item.status === 'not-needed' && styles.struck]} numberOfLines={2}>
            {item.name}
          </Text>
          <View style={styles.metaRow}>
            {showCategory ? (
              <View style={styles.metaChip}>
                <MaterialCommunityIcons name={meta.icon as any} size={12} color={meta.tint} />
                <Text style={[type.tiny, { color: meta.tint }]}>{meta.label}</Text>
              </View>
            ) : null}
            {item.quantity > 1 ? <Text style={styles.meta}>{item.quantity} stk</Text> : null}
            {item.size ? <Text style={styles.meta}>str. {item.size}</Text> : null}
            {item.place ? <Text style={styles.meta}>{item.place}</Text> : null}
            <Text style={[styles.meta, done && styles.metaDone]}>{STATUS_LABEL[item.status]}</Text>
          </View>
        </Pressable>

        <Pill label={PRIORITY_LABEL[item.priority]} tint={prio.tint} soft={prio.soft} />
      </View>

      {open ? (
        <View style={styles.expand}>
          {item.why ? <Text style={styles.why}>{item.why}</Text> : null}
          <View style={styles.statusRow}>
            {QUICK_STATUSES.map((s) => (
              <Pressable
                key={s}
                onPress={() => onStatus(s)}
                style={[styles.statusChip, item.status === s && styles.statusChipActive]}
              >
                <Text style={[styles.statusText, item.status === s && styles.statusTextActive]}>
                  {STATUS_LABEL[s]}
                </Text>
              </Pressable>
            ))}
          </View>
          {onQuantity ? (
            <View style={styles.qtyRow}>
              <Text style={type.small}>Antall</Text>
              <View style={styles.stepper}>
                <Pressable onPress={() => onQuantity(item.quantity - 1)} hitSlop={8} style={styles.stepBtn}>
                  <MaterialCommunityIcons name="minus" size={16} color={colors.inkSoft} />
                </Pressable>
                <Text style={styles.qty}>{item.quantity}</Text>
                <Pressable onPress={() => onQuantity(item.quantity + 1)} hitSlop={8} style={styles.stepBtn}>
                  <MaterialCommunityIcons name="plus" size={16} color={colors.inkSoft} />
                </Pressable>
              </View>
            </View>
          ) : null}
          {onOpen ? (
            <Pressable onPress={onOpen} style={styles.openRow} hitSlop={6}>
              <Text style={styles.openText}>Åpne detaljer</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={colors.primary} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: spacing(3) },
  wrapDimmed: { opacity: 0.72 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  body: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink },
  struck: { textDecorationLine: 'line-through', color: colors.muted },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing(2), marginTop: 3 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  meta: { fontSize: 12, color: colors.muted },
  metaDone: { color: colors.primary, fontWeight: '600' },
  expand: {
    marginTop: spacing(3),
    marginLeft: spacing(9),
    gap: spacing(3),
  },
  why: { fontSize: 13, lineHeight: 19, color: colors.inkSoft, fontStyle: 'italic' },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  statusChip: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.pill,
    backgroundColor: colors.bgAlt,
  },
  statusChipActive: { backgroundColor: colors.ink },
  statusText: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
  statusTextActive: { color: colors.surface },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { fontSize: 15, fontWeight: '700', color: colors.ink, minWidth: 18, textAlign: 'center' },
  openRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  openText: { fontSize: 13, fontWeight: '600', color: colors.primary },
});
