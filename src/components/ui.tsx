import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radius, shadow, spacing, type } from '@/theme';

/** Rund tilbake-til-hjem-knapp øverst til venstre på sider uten egen tilbake-knapp. */
export function HomeButton({ style }: { style?: StyleProp<ViewStyle> }) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.navigate('/')}
      hitSlop={10}
      style={[styles.homeBtn, style]}
      accessibilityRole="button"
      accessibilityLabel="Til hjem"
    >
      <MaterialCommunityIcons name="chevron-left" size={24} color={colors.inkSoft} />
    </Pressable>
  );
}

export function Card({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

export function ScreenHeader({
  title,
  onBack,
  action,
}: {
  title: string;
  onBack?: () => void;
  action?: React.ReactNode;
}) {
  return (
    <View style={styles.screenHeader}>
      <View style={styles.headerSide}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={10}
            style={styles.headerBack}
            accessibilityRole="button"
            accessibilityLabel="Tilbake"
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors.inkSoft} />
          </Pressable>
        ) : null}
      </View>
      <Text style={[type.title, styles.headerTitle]} numberOfLines={1}>
        {title}
      </Text>
      <View style={[styles.headerSide, { alignItems: 'flex-end' }]}>{action}</View>
    </View>
  );
}

export function SectionTitle({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.section}>{children.toUpperCase()}</Text>
      {action}
    </View>
  );
}

export function Pill({
  label,
  tint = colors.primary,
  soft = colors.primarySoft,
  icon,
  style,
}: {
  label: string;
  tint?: string;
  soft?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: soft }, style]}>
      {icon ? <MaterialCommunityIcons name={icon} size={12} color={tint} /> : null}
      <Text style={[type.tiny, { color: tint }]}>{label}</Text>
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
    >
      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={15}
          color={selected ? colors.surface : colors.inkSoft}
        />
      ) : null}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  style,
  disabled,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'soft' | 'ghost';
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}) {
  const palette: Record<string, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.surface },
    soft: { bg: colors.primarySoft, fg: colors.primaryDark },
    ghost: { bg: 'transparent', fg: colors.inkSoft, border: colors.border },
  };
  const p = palette[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: p.bg, borderColor: p.border ?? 'transparent', borderWidth: p.border ? 1 : 0 },
        disabled && { opacity: 0.4 },
        pressed && styles.pressed,
        style,
      ]}
    >
      {icon ? <MaterialCommunityIcons name={icon} size={18} color={p.fg} /> : null}
      <Text style={[styles.buttonText, { color: p.fg }]}>{label}</Text>
    </Pressable>
  );
}

export function Switch({
  value,
  onChange,
  accessibilityLabel,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.switch,
        value ? styles.switchOn : styles.switchOff,
        pressed && { opacity: 0.8 },
      ]}
    >
      <View style={[styles.knob, value && styles.knobOn]} />
    </Pressable>
  );
}

export function Bar({ value, tint = colors.primary }: { value: number; tint?: string }) {
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.min(100, Math.max(2, value))}%`, backgroundColor: tint }]} />
    </View>
  );
}

export function Note({
  children,
  tone = 'ok',
  style,
}: {
  children: string;
  tone?: 'ok' | 'heads-up';
  style?: StyleProp<ViewStyle>;
}) {
  const tint = tone === 'ok' ? colors.primary : colors.warm;
  const bg = tone === 'ok' ? colors.primarySoft : colors.warmSoft;
  return (
    <View style={[styles.note, { backgroundColor: bg, borderLeftColor: tint }, style]}>
      <Text style={[type.body, { color: colors.ink }]}>{children}</Text>
    </View>
  );
}

export function Empty({ icon, title, body }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; title: string; body: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <MaterialCommunityIcons name={icon} size={26} color={colors.primary} />
      </View>
      <Text style={[type.bodyStrong, { marginTop: spacing(3) }]}>{title}</Text>
      <Text style={[type.small, { textAlign: 'center', marginTop: spacing(1) }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing(4),
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  switch: { width: 48, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' },
  switchOff: { backgroundColor: colors.switchTrack },
  switchOn: { backgroundColor: colors.primary },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    ...shadow.card,
  },
  knobOn: { alignSelf: 'flex-end' },
  pressed: { opacity: 0.7, transform: [{ scale: 0.995 }] },
  homeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(2),
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(3),
  },
  headerSide: { width: 34 },
  headerBack: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(2),
    marginTop: spacing(6),
  },
  section: type.section,
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(1),
    borderRadius: radius.pill,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing(3.5),
    paddingVertical: spacing(2.5),
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: '600', color: colors.inkSoft },
  chipTextSelected: { color: colors.surface },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: spacing(5),
    paddingVertical: spacing(4),
    borderRadius: radius.pill,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  barTrack: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.bgAlt,
    overflow: 'hidden',
  },
  barFill: { height: 8, borderRadius: radius.pill },
  note: {
    borderLeftWidth: 3,
    borderRadius: radius.md,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(3.5),
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing(10),
    paddingHorizontal: spacing(8),
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
