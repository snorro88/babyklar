import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Note, Pill } from '@/components/ui';
import { AI_SUGGESTIONS, categoryMeta } from '@/data/catalog';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { CategoryId } from '@/types';

type Phase = 'ready' | 'scanning' | 'result';

interface Suggestion {
  name: string;
  category: CategoryId;
  size?: string;
  quantity: number;
  keep: boolean;
}

const tap = () => {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

export default function Scan() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [phase, setPhase] = useState<Phase>('ready');
  const [label, setLabel] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const scanLine = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase !== 'scanning') return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLine, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scanLine, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    anim.start();
    const timer = setTimeout(() => {
      const pick = AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)];
      setLabel(pick.label);
      setSuggestions(pick.items.map((i) => ({ ...i, keep: true })));
      setPhase('result');
      tap();
    }, 1900);
    return () => {
      anim.stop();
      clearTimeout(timer);
    };
  }, [phase, scanLine]);

  const startScan = () => {
    tap();
    setPhase('scanning');
  };

  const save = () => {
    const keep = suggestions.filter((s) => s.keep);
    dispatch({
      type: 'addItems',
      items: keep.map((s) => ({
        name: s.size ? `${s.name} str. ${s.size}` : s.name,
        category: s.category,
        priority: 'important' as const,
        status: 'have' as const,
        quantity: s.quantity,
        size: s.size,
        custom: true,
        origin: 'bought' as const,
      })),
    });
    tap();
    router.back();
  };

  const patch = (index: number, next: Partial<Suggestion>) =>
    setSuggestions((s) => s.map((item, i) => (i === index ? { ...item, ...next } : item)));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={type.title}>Skann</Text>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.close}>
          <MaterialCommunityIcons name="close" size={20} color={colors.inkSoft} />
        </Pressable>
      </View>

      {phase !== 'result' ? (
        <View style={styles.viewfinderWrap}>
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.tl]} />
            <View style={[styles.corner, styles.tr]} />
            <View style={[styles.corner, styles.bl]} />
            <View style={[styles.corner, styles.br]} />
            {phase === 'scanning' ? (
              <Animated.View
                style={[
                  styles.scanLine,
                  { transform: [{ translateY: scanLine.interpolate({ inputRange: [0, 1], outputRange: [8, 224] }) }] },
                ]}
              />
            ) : (
              <View style={styles.viewfinderContent}>
                <MaterialCommunityIcons name="camera-outline" size={38} color={colors.muted} />
                <Text style={[type.small, { textAlign: 'center', marginTop: spacing(2) }]}>
                  Ta bilde av klær, en bunke eller en produkteske
                </Text>
              </View>
            )}
          </View>

          <Text style={[type.body, { textAlign: 'center', marginTop: spacing(6) }]}>
            {phase === 'scanning' ? 'Ser på bildet …' : 'BabyKlar foreslår — dere bestemmer.'}
          </Text>

          <View style={{ paddingHorizontal: spacing(5), width: '100%', marginTop: spacing(6), gap: spacing(3) }}>
            <Text style={[type.small, { textAlign: 'center' }]}>
              Skanning er gratis og ubegrenset.
            </Text>
            <Button
              label={phase === 'scanning' ? 'Analyserer …' : 'Ta bilde'}
              icon="camera"
              onPress={startScan}
              disabled={phase === 'scanning'}
            />
          </View>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false}>
            <Note tone="ok">{`Vi tror dette er en ${label.toLowerCase()}. Sjekk gjerne over før dere lagrer.`}</Note>

            <View style={{ gap: spacing(3), marginTop: spacing(4) }}>
              {suggestions.map((s, i) => {
                const meta = categoryMeta(s.category);
                return (
                  <Card key={`${s.name}-${i}`} style={[styles.row, !s.keep && styles.rowOff]}>
                    <Pressable onPress={() => patch(i, { keep: !s.keep })} hitSlop={8}>
                      <MaterialCommunityIcons
                        name={s.keep ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                        size={24}
                        color={s.keep ? colors.primary : colors.muted}
                      />
                    </Pressable>
                    <View style={{ flex: 1, gap: 4 }}>
                      <Text style={type.bodyStrong}>
                        {s.quantity} × {s.name}
                        {s.size ? ` str. ${s.size}` : ''}
                      </Text>
                      <Pill label={meta.label} tint={meta.tint} soft={meta.softTint} icon={meta.icon as any} style={{ alignSelf: 'flex-start' }} />
                    </View>
                    <View style={styles.stepper}>
                      <Pressable onPress={() => patch(i, { quantity: Math.max(1, s.quantity - 1) })} hitSlop={6} style={styles.stepBtn}>
                        <MaterialCommunityIcons name="minus" size={16} color={colors.inkSoft} />
                      </Pressable>
                      <Text style={styles.qty}>{s.quantity}</Text>
                      <Pressable onPress={() => patch(i, { quantity: s.quantity + 1 })} hitSlop={6} style={styles.stepBtn}>
                        <MaterialCommunityIcons name="plus" size={16} color={colors.inkSoft} />
                      </Pressable>
                    </View>
                  </Card>
                );
              })}
            </View>

            <Text style={[type.small, { marginTop: spacing(5) }]}>
              Forslagene lagres som «Har». Dere kan endre alt etterpå.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <Button label="Skann på nytt" variant="ghost" onPress={() => setPhase('ready')} style={{ flex: 1 }} />
            <Button
              label={`Lagre ${suggestions.filter((s) => s.keep).length}`}
              onPress={save}
              disabled={!suggestions.some((s) => s.keep)}
              style={{ flex: 1 }}
            />
          </View>
        </>
      )}
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
  viewfinderWrap: { flex: 1, alignItems: 'center', paddingTop: spacing(6) },
  viewfinder: {
    width: 260,
    height: 260,
    borderRadius: radius.xl,
    backgroundColor: colors.bgAlt,
    overflow: 'hidden',
  },
  viewfinderContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing(8) },
  corner: { position: 'absolute', width: 26, height: 26, borderColor: colors.primary },
  tl: { top: 14, left: 14, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 10 },
  tr: { top: 14, right: 14, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 10 },
  bl: { bottom: 14, left: 14, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 10 },
  br: { bottom: 14, right: 14, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 10 },
  scanLine: {
    position: 'absolute',
    left: 20,
    right: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
    opacity: 0.8,
  },
  results: { paddingHorizontal: spacing(5), paddingBottom: spacing(6) },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing(3) },
  rowOff: { opacity: 0.45 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing(2) },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qty: { fontSize: 15, fontWeight: '700', color: colors.ink, minWidth: 16, textAlign: 'center' },
  footer: { flexDirection: 'row', gap: spacing(3), paddingHorizontal: spacing(5), paddingBottom: spacing(3) },
});
