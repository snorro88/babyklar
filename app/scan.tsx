import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Note, Pill } from '@/components/ui';
import { AI_SUGGESTIONS, SIZES, categoryMeta } from '@/data/catalog';
import { notify } from '@/lib/dialog';
import { analyzePhoto, matchFor, type Photo, ScanError } from '@/lib/scan';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';
import type { Item, ScanResult, ScanSuggestion } from '@/types';

type Phase = 'ready' | 'scanning' | 'result' | 'error';

interface Suggestion extends ScanSuggestion {
  keep: boolean;
}

const PHASE_TEXT: Record<Exclude<Phase, 'result'>, string> = {
  ready: 'BabyKlar foreslår — dere bestemmer.',
  scanning: 'Ser på bildet …',
  error: 'Fikk ikke analysert bildet. Sjekk nettet og prøv igjen.',
};

const tap = () => {
  if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
};

const displayName = (s: ScanSuggestion) => (s.size ? `${s.name} str. ${s.size}` : s.name);

/** What saving will do with this suggestion, in plain words. */
function outcome(s: ScanSuggestion, match: Item | undefined): string {
  if (match?.status === 'have') return `Legges til «${match.name}» · ${match.quantity} → ${match.quantity + s.quantity}`;
  if (match) return `Krysser av «${match.name}» som Har`;
  if (s.category === 'clothes' && !s.size) return 'Ny ting · velg størrelse om dere vet den';
  return 'Legges til som ny ting';
}

export default function Scan() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [phase, setPhase] = useState<Phase>('ready');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [label, setLabel] = useState('');
  const [example, setExample] = useState(false);
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
    return () => anim.stop();
  }, [phase, scanLine]);

  const show = (result: ScanResult, isExample: boolean) => {
    setLabel(result.label);
    setExample(isExample);
    setSuggestions(result.items.map((i) => ({ ...i, keep: true })));
    setPhase('result');
    tap();
  };

  const scan = async (next: Photo) => {
    setPhoto(next);
    setPhase('scanning');
    try {
      show(await analyzePhoto(next, state.items), false);
    } catch (e) {
      if (e instanceof ScanError && e.reason === 'not-configured') {
        show(AI_SUGGESTIONS[Math.floor(Math.random() * AI_SUGGESTIONS.length)], true);
      } else {
        setPhase('error');
      }
    }
  };

  const pick = async (source: 'camera' | 'library') => {
    tap();
    try {
      if (source === 'camera' && Platform.OS !== 'web') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          notify(
            'Kameraet er ikke tilgjengelig',
            'Gi BabyKlar tilgang til kameraet i Innstillinger, eller velg et bilde fra biblioteket.',
          );
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
      const res =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);
      const asset = res.canceled ? undefined : res.assets[0];
      if (asset) scan({ uri: asset.uri, width: asset.width, height: asset.height });
    } catch {
      notify('Fikk ikke åpnet kameraet', 'Prøv igjen, eller velg et bilde fra biblioteket.');
    }
  };

  const restart = () => {
    setPhoto(null);
    setPhase('ready');
  };

  const save = () => {
    const patches = new Map<string, Partial<Item>>();
    const created: Omit<Item, 'id'>[] = [];
    suggestions
      .filter((s) => s.keep)
      .forEach((s) => {
        const match = matchFor(s, state.items);
        if (!match) {
          created.push({
            name: displayName(s),
            category: s.category,
            priority: 'important',
            status: 'have',
            quantity: s.quantity,
            size: s.size,
            custom: true,
          });
          return;
        }
        // Something already owned gets more; something missing is ticked off with what was seen.
        const base = patches.get(match.id)?.quantity ?? (match.status === 'have' ? match.quantity : 0);
        patches.set(match.id, { status: 'have', quantity: base + s.quantity });
      });
    patches.forEach((patch, id) => dispatch({ type: 'updateItem', id, patch }));
    if (created.length) dispatch({ type: 'addItems', items: created });
    tap();
    router.back();
  };

  const patch = (index: number, next: Partial<Suggestion>) =>
    setSuggestions((s) => s.map((item, i) => (i === index ? { ...item, ...next } : item)));

  const keepCount = suggestions.filter((s) => s.keep).length;

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
            {photo ? (
              <Image
                source={{ uri: photo.uri }}
                style={[StyleSheet.absoluteFill, phase === 'error' && { opacity: 0.4 }]}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.viewfinderContent}>
                <MaterialCommunityIcons name="camera-outline" size={38} color={colors.muted} />
                <Text style={[type.small, { textAlign: 'center', marginTop: spacing(2) }]}>
                  Ta bilde av klær, en bunke eller en produkteske
                </Text>
              </View>
            )}
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
            ) : null}
          </View>

          <Text style={[type.body, { textAlign: 'center', marginTop: spacing(6), paddingHorizontal: spacing(8) }]}>
            {PHASE_TEXT[phase]}
          </Text>

          <View style={styles.actions}>
            {phase === 'error' ? (
              <>
                <Button label="Prøv igjen" icon="refresh" onPress={() => photo && scan(photo)} />
                <Button label="Ta et nytt bilde" variant="ghost" onPress={restart} />
              </>
            ) : (
              <>
                <Button
                  label={phase === 'scanning' ? 'Analyserer …' : 'Ta bilde'}
                  icon="camera"
                  onPress={() => pick('camera')}
                  disabled={phase === 'scanning'}
                />
                <Button
                  label="Velg fra bilder"
                  icon="image-outline"
                  variant="ghost"
                  onPress={() => pick('library')}
                  disabled={phase === 'scanning'}
                />
                <Text style={[type.small, { textAlign: 'center' }]}>
                  Bildet analyseres av OpenAI og lagres ikke av BabyKlar.
                </Text>
              </>
            )}
          </View>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false}>
            <View style={styles.summary}>
              {photo ? <Image source={{ uri: photo.uri }} style={styles.thumb} /> : null}
              <Note tone={example ? 'heads-up' : 'ok'} style={{ flex: 1 }}>
                {example
                  ? 'Eksempelforslag – AI-skanning er ikke satt opp ennå.'
                  : suggestions.length
                    ? `Det ser ut som ${label}. Sjekk gjerne over før dere lagrer.`
                    : `Det ser ut som ${label}, men vi fant ingen babyting. Prøv et nytt bilde.`}
              </Note>
            </View>

            <View style={{ gap: spacing(3), marginTop: spacing(4) }}>
              {suggestions.map((s, i) => {
                const meta = categoryMeta(s.category);
                const match = matchFor(s, state.items);
                return (
                  <Card key={`${s.name}-${i}`} style={[styles.suggestion, !s.keep && styles.rowOff]}>
                    <View style={styles.row}>
                      <Pressable onPress={() => patch(i, { keep: !s.keep })} hitSlop={8}>
                        <MaterialCommunityIcons
                          name={s.keep ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                          size={24}
                          color={s.keep ? colors.primary : colors.muted}
                        />
                      </Pressable>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={type.bodyStrong}>
                          {s.quantity} × {displayName(s)}
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
                    </View>

                    {s.category === 'clothes' ? (
                      <View style={styles.sizes}>
                        {SIZES.map((size) => {
                          const on = s.size === size;
                          return (
                            <Pressable
                              key={size}
                              onPress={() => patch(i, { size: on ? undefined : size })}
                              style={[styles.size, on && styles.sizeOn]}
                              accessibilityLabel={`Størrelse ${size}`}
                              accessibilityState={{ selected: on }}
                            >
                              <Text style={[styles.sizeText, on && styles.sizeTextOn]}>{size}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    ) : null}

                    <View style={styles.outcome}>
                      <MaterialCommunityIcons
                        name={match ? 'check-circle-outline' : 'plus-circle-outline'}
                        size={14}
                        color={match ? colors.primary : colors.muted}
                      />
                      <Text style={[type.small, { flex: 1 }, match && { color: colors.primaryDark }]}>
                        {outcome(s, match)}
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </View>

            {suggestions.length ? (
              <Text style={[type.small, { marginTop: spacing(5) }]}>
                Alt lagres som «Har». Dere kan endre alt etterpå.
              </Text>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <Button label="Skann på nytt" variant="ghost" onPress={restart} style={{ flex: 1 }} />
            {suggestions.length ? (
              <Button label={`Lagre ${keepCount}`} onPress={save} disabled={!keepCount} style={{ flex: 1 }} />
            ) : null}
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
  actions: { paddingHorizontal: spacing(5), width: '100%', marginTop: spacing(6), gap: spacing(3) },
  results: { paddingHorizontal: spacing(5), paddingBottom: spacing(6) },
  summary: { flexDirection: 'row', alignItems: 'stretch', gap: spacing(3) },
  thumb: { width: 64, borderRadius: radius.md, backgroundColor: colors.bgAlt },
  suggestion: { gap: spacing(3) },
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
  sizes: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(1.5), paddingLeft: 36 },
  size: {
    minWidth: 40,
    paddingVertical: 5,
    paddingHorizontal: spacing(2),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  sizeOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  sizeText: { fontSize: 13, fontWeight: '600', color: colors.inkSoft },
  sizeTextOn: { color: colors.surface },
  outcome: { flexDirection: 'row', alignItems: 'center', gap: spacing(1.5), paddingLeft: 36 },
  footer: { flexDirection: 'row', gap: spacing(3), paddingHorizontal: spacing(5), paddingBottom: spacing(3) },
});
