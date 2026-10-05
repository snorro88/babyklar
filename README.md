# BabyKlar — demo

Klikkbar demo av BabyKlar bygget med Expo (React Native) og TypeScript.
Alt kjører lokalt uten backend: data ligger i en React-context og lagres i AsyncStorage.

## Kom i gang

```powershell
npm install
npm start        # velg i, a eller w i menyen
npm run web      # åpner direkte i nettleser
```

Trykk `w` for web, `a` for Android-emulator, `i` for iOS-simulator, eller skann QR-koden med Expo Go.

> Merk: `.npmrc` peker mot offentlig npm-registry, siden den globale konfigurasjonen på denne maskinen bruker et privat Artifactory-repo.

## Hva som er med i demoen

| Skjerm | Fil | Innhold |
|---|---|---|
| Onboarding | [app/onboarding.tsx](app/onboarding.tsx) | 5 steg → «Dere er X % BabyKlar» |
| Hjem | [app/(tabs)/index.tsx](app/(tabs)/index.tsx) | Uker til termin, fremdriftsring, «viktigst nå», kategorier, «snart» |
| Plan | [app/(tabs)/plan.tsx](app/(tabs)/plan.tsx) | Oppgaver + sjekkliste per kategori, filter viktig/kan vente/valgfritt |
| Ting | [app/(tabs)/items.tsx](app/(tabs)/items.tsx) | Søk, har/mangler, kategorifilter, statusendring |
| Ønsker | [app/(tabs)/wishes.tsx](app/(tabs)/wishes.tsx) | Ønskeliste, delbar lenke, legg til ønske |
| Delt ønskeliste | [app/shared-wishlist.tsx](app/shared-wishlist.tsx) | Slik ser familien lista uten app — med reservasjon |
| Ta bilde | [app/scan.tsx](app/scan.tsx) | Bildegjenkjenning (OpenAI) med godkjenning før lagring |
| Legg til | [app/add-item.tsx](app/add-item.tsx) | Manuell registrering av ting |
| Garderobe | [app/wardrobe.tsx](app/wardrobe.tsx) | Har vs. anbefalt per størrelse, neste størrelse, sesong |
| Baby | [app/baby.tsx](app/baby.tsx) | Navn (valgfritt), størrelse, familie, personvern, nullstill |
| Sammenlign priser | [app/offers.tsx](app/offers.tsx) | Ekte Prisjakt-søk på ting du allerede mangler |
| Trygge favoritter | [app/favorites.tsx](app/favorites.tsx) | Uavhengig test-/redaksjonelt utvalg for bilstol, vogn og bæresele |

## Struktur

```
app/            expo-router-ruter (filbasert navigasjon)
src/theme.ts    designtokens: farger, radius, spacing, typografi
src/types.ts    domenemodell
src/data/       standardkatalog, kategorier, demodata
src/lib/        beregning av fremdrift, garderobe-innsikt, sesong
src/state/      global state (reducer + AsyncStorage)
src/components/ gjenbrukbare UI-byggeklosser
```

## Designvalg

- Rolig, varm palett (salvie/terrakotta) — bevisst ikke rosa/blått.
- Hvert forslag kan ha en `why`-tekst som forklarer hvorfor det står på lista.
- Statusen «Trenger ikke» er like synlig som «Har» — appen skal ikke presse fram kjøp.
- Anbefalinger vises som intervall (f.eks. 3–5 pysjer), ikke som fasit.

## Inntektsmodell

Alle funksjoner er gratis. Ingen betalingsmur. «Sammenlign priser» åpner Prisjakt med et
søk på tingen brukeren mangler — appen oppgir aldri en pris selv, så prisene er alltid
dagens og fra ekte butikker. Kommersielle avtaler påvirker aldri hva appen anbefaler at
familien trenger. Ekte affiliate-inntekt (f.eks. via Adtraction/Partner-ads) er ikke koblet
på i denne demoen — én tracking-ID i [src/lib/prices.ts](src/lib/prices.ts) er alt som skal til senere.

## Ikke bygget (bevisst)

Ingen innlogging, ingen database, ingen betaling, ingen ekte provisjon eller klikksporing.
Eneste serverdel er bildegjenkjenningen i [app/api/scan+api.ts](app/api/scan+api.ts); uten
`OPENAI_API_KEY` vises eksempelforslag fra [src/data/catalog.ts](src/data/catalog.ts).
Prislenkene går til Prisjakt via [src/lib/prices.ts](src/lib/prices.ts).

## Neste steg

1. Supabase eller Firebase for auth, database, bildelagring og tilgangskontroll per husholdning.
2. Ekte kamera med `expo-camera` og AI-kall via backend (aldri API-nøkler i appen).
3. Delbar ønskeliste som web-side utenfor appen.
4. Ekte affiliate-feed: avtaler med norske butikker, oppdaterte priser med `fetchedAt`/utløp,
   juridisk gjennomgang av markedsføringsmerking, samtykkebasert analyse og automatisk
   deaktivering av utdaterte tilbud.
