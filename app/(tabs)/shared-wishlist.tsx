import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, Note, Pill } from '@/components/ui';
import { useApp } from '@/state/store';
import { colors, radius, spacing, type } from '@/theme';

/** How the wishlist looks to family and friends — without the app and without login. */
export default function SharedWishlist() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const name = state.household.babyName?.trim();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.navigate('/')} hitSlop={10} style={styles.back}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.inkSoft} />
        </Pressable>
        <Text style={type.small}>Forhåndsvisning</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="gift-outline" size={26} color={colors.primary} />
          </View>
          <Text style={styles.h1}>Ønskeliste{name ? ` til ${name}` : ''}</Text>
          <Text style={[type.body, { textAlign: 'center' }]}>
            Vi har samlet det vi faktisk trenger. Brukt er som regel helt topp.
          </Text>
        </View>

        <Note tone="ok">Reserver gjerne, så unngår vi at noe blir kjøpt to ganger.</Note>

        <View style={{ gap: spacing(3), marginTop: spacing(5) }}>
          {state.wishes.map((w) => (
            <Card key={w.id} style={{ gap: spacing(3) }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing(3) }}>
                <View style={styles.thumb}>
                  <MaterialCommunityIcons name="package-variant-closed" size={20} color={colors.muted} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={type.bodyStrong}>{w.name}</Text>
                  <View style={styles.meta}>
                    {w.size ? <Text style={type.small}>str. {w.size}</Text> : null}
                    {w.usedOk ? <Pill label="Brukt er ok" tint={colors.primary} soft={colors.primarySoft} /> : null}
                    {w.priority === 'high' ? <Pill label="Trengs snart" tint={colors.warm} soft={colors.warmSoft} /> : null}
                  </View>
                  {w.note ? <Text style={type.small}>{w.note}</Text> : null}
                </View>
              </View>
              <Button
                label={w.reservedBy ? `Reservert av ${w.reservedBy}` : 'Reserver'}
                variant={w.reservedBy ? 'ghost' : 'soft'}
                icon={w.reservedBy ? 'check' : 'hand-heart-outline'}
                onPress={() => dispatch({ type: 'toggleWishReserved', id: w.id, by: 'Deg' })}
              />
            </Card>
          ))}
        </View>

        <Text style={styles.footerNote}>
          Laget med BabyKlar · Foreldrene ser ikke hvem som har reservert hva
        </Text>
      </ScrollView>
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
  hero: { alignItems: 'center', gap: spacing(3), paddingVertical: spacing(6) },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  h1: { ...type.title, fontSize: 26, textAlign: 'center' },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.bgAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), flexWrap: 'wrap' },
  footerNote: { ...type.small, textAlign: 'center', marginTop: spacing(8), fontSize: 11 },
});
