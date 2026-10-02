# AI_HANDOFF — BabyKlar

Handoff for a fresh coding agent. Verified against the repo on 2026-09-14. **The code is the source of truth**; this doc captures what is hard to infer from the code. `npx tsc --noEmit` currently passes clean.

## 1. Purpose & main flows

BabyKlar is a **clickable demo** (no backend) helping expecting/new parents (**Norwegian UI**) answer: *what do we need, what do we already have, what's missing, what will the baby need soon?* It deliberately avoids being a generic pregnancy app and avoids pushing purchases (the "Trenger ikke" status is as prominent as "Har").

Main flows: **Onboarding** (5 steps → "Dere er X % BabyKlar") · **Hjem** (weeks-to-due, progress ring, "viktigst nå", category readiness, "snart" insights) · **Plan** (tasks + per-category checklist, priority filter) · **Ting** (inventory, status changes, search, category filter) · **Ønsker** (wishlist + shareable link + no-app "delt ønskeliste" preview with reservations) · **Skann** (simulated AI, approve-before-save) · **Legg til** (manual) · **Garderobe/Størrelser**, **Sykehusbag/Pakkemodus**, **Tilbud** (labeled affiliate demo data), **Trygge favoritter** (editorial picks), **Budsjett**, **Baby** (settings), **Sikkerhetskopi** (export/import). Full product spec in `README.md` and `BabyKlar.md`.

## 2. Architecture & tech stack

- **Expo SDK 57**, **React Native 0.86.3**, **React 19.2.3**, **TypeScript 6**, **expo-router v6** (file-based routing under `app/`; no React Navigation code directly). Path alias `@/*` → `src/*`.
- **State**: single global store, React Context + `useReducer` in `src/state/store.tsx` (`useApp()` hook). No Redux/Zustand.
- **Persistence**: AsyncStorage key **`babyklar.state.v5`**. On mount the JSON is parsed and passed through `sanitizeState()` (validates enum values against the current schema, drops/reseeds incompatible data); every state change is written back. Old `v2`–`v4` keys may linger in web localStorage — do not reuse.
- **No backend / auth / DB / payments / analytics.** All data seeded from `src/data/`, mutated locally. The one server piece is the **photo scan API route** (below).
- **Photo scan (real AI)**: `app/scan.tsx` → `src/lib/scan.ts` (expo-image-picker, downscale + JPEG via expo-image-manipulator) → **`app/api/scan+api.ts`** (Expo Router API route; OpenAI Chat Completions with a strict JSON schema; `OPENAI_API_KEY`/`OPENAI_MODEL` from `.env`, see `.env.example`). This is why `web.output` is `"server"`. Base URL: same origin on web, the dev server (`Constants.expoConfig.hostUri`) in dev, else `EXPO_PUBLIC_API_URL` (EAS Hosting). Matching: clothes on garment type + size locally (`matchFor`), other things on the AI's pick from the list sent. A match ticks a missing item to `have` (or adds to an owned one) instead of creating a duplicate. No key/server → 503 → falls back to the `AI_SUGGESTIONS` examples, labelled as such.
- Platform-specific files use RN resolution `.native.tsx` / `.web.tsx` / `.web.css` (see `CalendarDateField.*`).

## 3. Language & naming convention (critical, non-obvious)

The codebase went through a **full English refactor**. Rule: **all identifiers, enum VALUES, comments, file names, and component names are English. Only user-facing display text stays Norwegian** (`<Text>` content, `notify`/`confirm` messages, placeholders, chip/label/screen titles, accessibility labels). **Exception:** `Offer.matchKeywords` and `FavoriteGroup.keywords` stay Norwegian because they match against Norwegian product names.

Enum values (see `src/types.ts`):
- `CategoryId`: `sleep | clothes | care | transport | food | hospitalBag`
- `Priority`: `important | can-wait | optional`
- `Status`: `have | missing | want | not-needed` (cut from 8; `sanitizeState` maps old `to-buy`→`missing`, `ordered`/`stored`→`have`, `outgrown`→`not-needed`)
- `Situation`: `first | has-child | born` · `BagSectionId`: `mother | baby | partner | practical`
- `FocusArea`: `equipment | clothes | hospitalBag | wishlist | owned | tasks | budget`
- `WishItem.priority`: `high | medium | low` · `Item.origin`: `bought | inherited | gift` · `Offer.condition`: `new | used`
- Display labels live in `STATUS_LABEL` / `PRIORITY_LABEL` in `src/data/catalog.ts`. Note: status `want` shows as **"Ønsker"**.

## 4. Routing & navigation (non-obvious)

- **The bottom tab bar is meant to show on ALL normal pages.** Detail screens therefore live **inside `app/(tabs)/`** and are hidden from the bar via `<Tabs.Screen name="..." options={{ href: null }} />` in `app/(tabs)/_layout.tsx`. Group `(tabs)` does not affect URLs (e.g. `/wardrobe` still works).
  - Visible tabs: `index` (Hjem), `plan`, `camera` (center scan button → pushes `/scan`), `items` (Ting), `wishes` (Ønsker).
  - Hidden-but-in-tab-group: `wardrobe`, `sizes`, `hospital-bag`, `packing-mode`, `offers`, `favorites`, `budget`, `shared-wishlist`, `backup`, `baby`, `item/[id]`.
- **Root stack** (`app/_layout.tsx`): `onboarding` + `(tabs)` + **`scan`** and **`add-item`** as modals (no tab bar; they use a close ✕). Root gates on `state.household.onboarded` to redirect to/from `/onboarding`; wraps app in `GestureHandlerRootView` + `SafeAreaProvider` + `AppProvider`.
- **Back-to-home button**: circular chevron top-left on every page except Hjem, calls `router.navigate('/')`. Detail screens use `ScreenHeader onBack` or a custom back; tab pages Plan/Ting/Ønsker use the shared **`HomeButton`** component in `src/components/ui.tsx`.

## 5. Important files

- `src/types.ts` — domain model (`Item`, `Task`, `WishItem`, `GarmentRow`, `Household`, `AppState`, `Offer`, `Favorite`). Read first.
- `src/state/store.tsx` — reducer, actions, hydration/persistence, `sanitizeState`, `ensureWish` (wishlist auto-sync), `initialState`.
- `src/data/` — `catalog.ts` (`CATALOG`/`TASKS`/`WARDROBE`/`WISHES` seed, `CATEGORIES`, labels, `AI_SUGGESTIONS`), `offers.ts`, `favorites.ts`.
- `src/lib/` — `insights.ts` (`readiness`, `summary`, `weeksUntil`, `formatDate`, `garmentRowsForSize`), `plan.ts` (`seasonOf`, personalization: `personalizeItems`/`personalizeTasks`/`focusCategories`/`reusesGear`), `sizes.ts`, `offers.ts`, `favorites.ts`, `dialog.ts` (`confirm`/`notify`).
- `src/theme.ts` — design tokens (`colors`, `radius`, `spacing`, `type`, `shadow`). `src/components/ui.tsx` — shared UI kit (`Card`, `Button`, `Chip`, `Pill`, `Note`, `Bar`, `Empty`, `SectionTitle`, `ScreenHeader`, `HomeButton`).
- `src/components/CalendarDateField.*` — date picker (web = HTML input, native = community datetimepicker). `src/css.d.ts` — ambient `declare module '*.css'` for the web CSS side-effect import.
- `.npmrc` (public registry + `legacy-peer-deps=true`), `.node-version` (Node **24.15.0** via `fnm`), `app.json` (splash via `expo-splash-screen` plugin; `typedRoutes: false`).

## 6. Key implementation decisions (preserve)

- **Wardrobe is derived from items, not stored incrementally.** `garmentRowsForSize(items, wardrobe, size)` in `insights.ts` computes counts from owned clothing items (so edits/deletes reflect immediately), falling back to curated `WARDROBE` seed for sizes with no tracked items. (The old `addToWardrobe` mutation was removed.) Consumers: `index.tsx`, `wardrobe.tsx`, `sizes.tsx`.
- **Personalization runs at `completeOnboarding` and again when Baby edits `hasCar`/`hasHandMeDowns`/`situation`** (`personalizeItems`/`personalizeTasks`, `setHousehold` in the store): no car → car seat drops from important + "Skaff bilstol" task removed; hand-me-downs/existing child → important missing clothes soften to "kan vente". It is two-way: the `why` text marks an adjustment, so flipping an answer back restores the seeded priority (and the car seat task). `custom` items are never touched. Onboarding step-4 previews this; Plan opens the top focus category and shows a personalized subtitle.
- **Feature flags** in `src/lib/features.ts` hide price check, favourites, «Snart», budget and size predictions to keep the demo simple. The screens still exist; a flag gates every entry point.
- **Wishlist ↔ item status sync.** Setting an item's status to `want` ("Ønsker") auto-adds it to the wishlist via `ensureWish` (dedup by name) in `setStatus`/`updateItem`/`addItems`; `sanitizeState` also reconciles all `want` items on load. **Add-only** (not removed automatically). The Ønsker page ✕ opens a **reason modal** ("…fjerne «X» fordi:" → status chips excl. `want`, Avbryt/Bekreft); confirming removes the wish and, if the wish came from an item (name match), sets that item's status to the chosen reason.
- **Date picker = `@react-native-community/datetimepicker@9.1.0`.** Do NOT switch to the `@expo/ui` drop-in — its SwiftUI `.graphical` calendar didn't register day taps on iPhone (tried & reverted).
- **`legacy-peer-deps=true` is mandatory** in `.npmrc`: datetimepicker's optional `react-native-windows` peer otherwise pins RN to 0.84 → ERESOLVE.
- **`Alert.alert` with multiple buttons doesn't work on react-native-web** → use `src/lib/dialog.ts` (`confirm`/`notify`, falls back to `window.confirm`/`window.alert`). For multi-option prompts use an in-app `Modal` (see the Ønsker reason modal).
- **Shadows**: use `shadow.card`/`shadow.floating` from theme (Platform.select: `boxShadow` web, `shadow*`+elevation native). Residual `shadow*` deprecation warning comes from expo-router/react-navigation, not app code.
- **RN 0.86**: use `StyleSheet.absoluteFill` (not `absoluteFillObject`). **`@expo/vector-icons`** must stay an explicit dependency (SDK 56 removed it from `expo`).
- Onboarding stores exact `dueDate` as `YYYY-MM-DD`; `weeksUntil()` rounds to whole weeks for display only.
- **Product/UX guardrails** (`BabyKlar.md` §15): no medical advice, no trackers, no forum, no store. Recommendations are ranges; items may carry `why` text; affiliate offers only for items marked missing; safety-critical products (car seat, mattress, crib) are new-only + manually reviewed.

## 7. Current working state

- Typecheck clean; app runs on web and bundles for native. SDK 54→57 upgrade complete (`app.json` migrated: no `newArchEnabled`/`edgeToEdgeEnabled`/top-level `splash`).
- Installed-but-unused packages: `expo-camera`, `expo-notifications`, `expo-device`. (`expo-image-picker` + `expo-image-manipulator` + `expo-constants` are used by the scan; camera/photos permission strings are set via the image-picker plugin in `app.json`.)
- No automated test suite.

## 8. Known issues (address early)

1. **Duplicate route — fix first.** `app/item/[id].tsx` is a stale, byte-identical copy of `app/(tabs)/item/[id].tsx`; both resolve to `/item/[id]` (route collision). Keep the `(tabs)` one (it keeps the tab bar) and delete the root one: `Remove-Item 'app\item\[id].tsx'` then remove the empty `app\item` folder.
2. **Renames leave stray old-named duplicates.** After `Move-Item` renames, old-named files have reappeared before (e.g. `ting.tsx`/`onsker.tsx`/`kamera.tsx`), producing extra auto-tabs/routes — likely an editor/file-sync restoring them. After any rename, re-list the directory and delete leftovers, then restart Metro with `-c`.
3. **Not a git repository** (`git status` → fatal). No version control; consider `git init` before further work.
4. iOS on-device onboarding calendar day-taps **unverified** (dev is on Windows).
5. Wishlist reconcile is **add-only**: removing a wish whose item is still `want` re-adds it on next load — the Ønsker reason modal avoids this by updating the item's status. Two-way removal is not implemented.
6. `scan` and `add-item` are modals and intentionally **do not show the tab bar** (they have a close ✕).
7. Leftover, non-essential dirs: `dist/`, `.expo-export-android-check/`, `.backup-sdk53/` (pre-upgrade snapshot).

## 9. Most recent work & logical next steps

Most recent: full English refactor + storage bump to v5 with `sanitizeState`; navigation restructure so the tab bar shows on all pages + `HomeButton`; wishlist auto-sync (`want` → Ønsker) with reconcile; and the **Ønsker "remove reason" modal** (the newest change).

Next steps (suggested): (1) delete the duplicate `app/item/[id].tsx`; (2) `git init`; (3) verify onboarding calendar on a physical iPhone; (4) optionally make Skann/Legg til editable (`expo-camera`/`expo-image-picker` are installed) and/or add real item photos; (5) longer-term from README: Supabase/Firebase backend + auth, server-side AI scan, standalone web wishlist, real affiliate feed with expiry.

## 10. Run / build / test

From repo root (`c:\dev\test\babyklar`), PowerShell:

```powershell
npm install            # respects .npmrc (public registry + legacy-peer-deps)
npm run web            # web in browser
npx expo start -c      # dev server, cleared Metro cache (preferred for device)
npm run typecheck      # tsc --noEmit  (currently clean)
```

- **AI scan locally**: put `OPENAI_API_KEY` in `.env` and restart the dev server; the phone calls `/api/scan` on the dev server. **For installed builds** the route must be deployed: `eas env:create --name OPENAI_API_KEY --value <key> --environment production --visibility sensitive`, then `npx expo export -p web` and `eas deploy --prod --environment production`. Deployed at **<https://babyklar.expo.app>**, which is already set as `EXPO_PUBLIC_API_URL` in the `eas.json` build profiles. Changing the key or prompt only needs a redeploy, not a new app build.
- **Use LAN, not tunnel** when phone + PC share Wi-Fi (tunnel stalls Expo Go on the ~4 MB bundle). Port 8081 may be busy → CLI offers 8082.
- **Always restart with `-c` after renaming/moving route files** (Metro/expo-router caches routes; stale caches show ghost tabs).
- Expo Go for SDK 57 is not on the iOS App Store; use `eas go` (TestFlight) for iPhone, or Expo CLI for Android/simulator.
- No tests — verify manually: onboarding → home %, status changes in Ting (incl. `want` → appears in Ønsker), Ønsker remove-reason modal, scan approve-before-save. Bundle sanity: `npx expo export -p web --output-dir .expo-export-check` (delete `.expo-export-*` after).
