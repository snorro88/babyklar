import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoriteCard } from '@/components/FavoriteCard';
import { Card, Note, ScreenHeader, SectionTitle } from '@/components/ui';
import { favoriteSections } from '@/lib/favorites';
import { PRICE_SOURCE } from '@/lib/prices';
import { colors, spacing, type } from '@/theme';

export default function Favorites() {
  const router = useRouter();
  const sections = favoriteSections();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Trygge favoritter"
        onBack={() => (router.canGoBack() ? router.back() : router.navigate('/'))}
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={{ gap: spacing(2), backgroundColor: colors.bgAlt, borderColor: colors.border }}>
          <Text style={type.bodyStrong}>Uavhengig utvalg</Text>
          <Text style={type.small}>
            Et redaksjonelt utvalg av kjente, lett tilgjengelige produkter – ikke betalte
            plasseringer. Vi viser bevisst ingen stjerner eller påståtte testtall. Bruk «se etter»-
            rådene under, og trykk et produkt for å se dagens priser hos {PRICE_SOURCE}.
          </Text>
        </Card>

        {sections.map(({ group, items }) => (
          <View key={group.id}>
            <SectionTitle>{group.label}</SectionTitle>
            <Text style={[type.small, { marginBottom: spacing(3) }]}>{group.lookFor}</Text>
            {group.safetyCritical ? (
              <Note tone="heads-up" style={{ marginBottom: spacing(3) }}>
                Sikkerhetsutstyr: velg alltid nytt og monter etter anvisning. Populær er ikke det
                samme som trygg – se etter test og godkjenning.
              </Note>
            ) : null}
            <View style={{ gap: spacing(3) }}>
              {items.map((f) => (
                <FavoriteCard key={f.id} favorite={f} group={group} />
              ))}
            </View>
          </View>
        ))}

        <Pressable onPress={() => router.push('/offers')} style={styles.offerLink}>
          <Text style={type.bodyStrong}>Klar til å kjøpe?</Text>
          <Text style={type.small}>Sammenlign dagens priser på tingene dere mangler.</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing(5), paddingBottom: spacing(12) },
  offerLink: {
    marginTop: spacing(6),
    padding: spacing(4),
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: 2,
  },
});
