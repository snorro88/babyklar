import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { colors, shadow } from '@/theme';

function ScanButton() {
  const router = useRouter();
  return (
    <View style={styles.scanWrap}>
      <Pressable
        onPress={() => router.push('/scan')}
        accessibilityRole="button"
        accessibilityLabel="Ta bilde"
        style={({ pressed }) => [styles.scan, pressed && { transform: [{ scale: 0.94 }] }]}
      >
        <MaterialCommunityIcons name="camera" size={26} color={colors.surface} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIconStyle: { marginTop: 2 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: Platform.select({ ios: 90, default: 82 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: 28, default: 18 }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hjem',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-variant-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="clipboard-check-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: '',
          tabBarButton: () => <ScanButton />,
        }}
      />
      <Tabs.Screen
        name="items"
        options={{
          title: 'Ting',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="package-variant-closed" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wishes"
        options={{
          title: 'Ønsker',
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="gift-outline" size={size} color={color} />,
        }}
      />

      {/* Detail screens live in the tab group so the tab bar stays visible, but are hidden from the bar. */}
      <Tabs.Screen name="wardrobe" options={{ href: null }} />
      <Tabs.Screen name="sizes" options={{ href: null }} />
      <Tabs.Screen name="hospital-bag" options={{ href: null }} />
      <Tabs.Screen name="packing-mode" options={{ href: null }} />
      <Tabs.Screen name="offers" options={{ href: null }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
      <Tabs.Screen name="budget" options={{ href: null }} />
      <Tabs.Screen name="shared-wishlist" options={{ href: null }} />
      <Tabs.Screen name="backup" options={{ href: null }} />
      <Tabs.Screen name="baby" options={{ href: null }} />
      <Tabs.Screen name="help" options={{ href: null }} />
      <Tabs.Screen name="item/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanWrap: { width: 72, alignItems: 'center', justifyContent: 'center' },
  scan: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadow.floating,
  },
});
