/**
 * Designspråk for BabyKlar: rolig, varmt og lite stressende.
 * Bevisst nøytral palett – ingen «gutte-blå» eller «jente-rosa».
 */

import { Platform } from 'react-native';

export const colors = {
  bg: '#FBF7F3',
  bgAlt: '#F4EEE7',
  surface: '#FFFFFF',
  ink: '#2E2A26',
  inkSoft: '#5B534B',
  muted: '#8C837A',
  border: '#EDE4DA',

  primary: '#4E8D7C',
  primaryDark: '#3A6C5F',
  primarySoft: '#E4F0EC',

  warm: '#DE8A63',
  warmSoft: '#FBEAE0',

  lilac: '#8279BE',
  lilacSoft: '#EDEAF8',

  sun: '#E2B455',
  sunSoft: '#FBF0D9',

  ok: '#4E8D7C',
  wait: '#B79A6B',
  optional: '#9AA0A6',

  /** Off position on a switch – warm grey, distinct from the disabled look of `border`. */
  switchTrack: '#BFB3A5',
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
} as const;

export const spacing = (n: number) => n * 4;

export const shadow = {
  card: Platform.select({
    web: { boxShadow: '0 6px 14px rgba(91, 70, 54, 0.06)' },
    default: {
      shadowColor: '#5B4636',
      shadowOpacity: 0.06,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
  }),
  floating: Platform.select({
    web: { boxShadow: '0 8px 16px rgba(46, 42, 38, 0.18)' },
    default: {
      shadowColor: '#2E2A26',
      shadowOpacity: 0.18,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
  }),
} as const;

export const type = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '700' as const, color: colors.ink },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const, color: colors.ink },
  section: { fontSize: 13, lineHeight: 16, fontWeight: '700' as const, letterSpacing: 0.8, color: colors.muted },
  body: { fontSize: 15, lineHeight: 22, color: colors.inkSoft },
  bodyStrong: { fontSize: 15, lineHeight: 22, fontWeight: '600' as const, color: colors.ink },
  small: { fontSize: 13, lineHeight: 18, color: colors.muted },
  tiny: { fontSize: 11, lineHeight: 14, fontWeight: '600' as const, letterSpacing: 0.4 },
};
