import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, StyleSheet, useWindowDimensions } from 'react-native';

import { colors } from '@/theme';

const SHOW_MS = 2000;
const SLIDE_MS = 500;
/** Must match `imageWidth` and `backgroundColor` of the expo-splash-screen plugin in app.json. */
const ICON_SIZE = 120;
const BACKGROUND = colors.primarySoft;

/**
 * Takes over from the native launch screen with the same background and icon size and position,
 * adds the name, and slides down after two seconds. The root layout keeps the native screen up
 * until the icon here has loaded, so the swap is invisible.
 */
export function Splash() {
  const { height } = useWindowDimensions();
  const slide = useRef(new Animated.Value(0)).current;
  const name = useRef(new Animated.Value(0)).current;
  const [loaded, setLoaded] = useState(false);
  const [gone, setGone] = useState(false);

  // Never leave the app covered if the image events don't arrive.
  useEffect(() => {
    const fallback = setTimeout(() => setLoaded(true), 1000);
    return () => clearTimeout(fallback);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    SplashScreen.hide();
    let reduceMotion = false;
    AccessibilityInfo.isReduceMotionEnabled().then((on) => {
      reduceMotion = on;
      if (on) name.setValue(1);
      else
        Animated.timing(name, {
          toValue: 1,
          duration: 500,
          delay: 150,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
    });
    const leave = setTimeout(() => {
      if (reduceMotion) return setGone(true);
      Animated.timing(slide, {
        toValue: 1,
        duration: SLIDE_MS,
        easing: Easing.bezier(0.4, 0, 1, 1),
        useNativeDriver: true,
      }).start(() => setGone(true));
    }, SHOW_MS);
    return () => clearTimeout(leave);
  }, [loaded, name, slide]);

  if (gone) return null;
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        styles.splash,
        { transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [0, height] }) }] },
      ]}
    >
      <Image
        source={require('../../assets/splash-icon.png')}
        style={styles.icon}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
      <Animated.Text
        style={[
          styles.name,
          {
            opacity: name,
            transform: [{ translateY: name.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
          },
        ]}
      >
        BabyKlar
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFill,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BACKGROUND,
  },
  icon: { width: ICON_SIZE, height: ICON_SIZE },
  // Positioned below the centred icon so the icon stays exactly where the native screen had it.
  name: {
    position: 'absolute',
    top: '50%',
    marginTop: ICON_SIZE / 2 + 16,
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
  },
});
