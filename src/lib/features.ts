/**
 * Parts of the app that are switched off for now to keep the demo simple. The
 * screens still exist; flipping a flag back on restores every entry point to it.
 */
export const FEATURES = {
  /** «Sammenlign priser» – Prisjakt links on Hjem, item detail and budget. */
  priceCheck: false,
  /** «Trygge favoritter» – editorial product picks. */
  favorites: false,
  /** «Snart» on Hjem – wardrobe and next-size hints. */
  upcoming: false,
  /** Budget screen, price field on items and the budget focus in onboarding. */
  budget: false,
  /** Size timeline and next-size predictions – babies grow too differently. */
  sizes: false,
} as const;
