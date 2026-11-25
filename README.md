# BabyKlar — demo

Klikkbar demo av BabyKlar bygget med Expo (React Native) og TypeScript.
Data ligger i en React-context og lagres i AsyncStorage på enheten. Bare to ting går
via en server: valgfri bildegjenkjenning (Expo-API-et i `app/api/`) og ønskelister
som foreldrene selv velger å dele ([babyklar.app](https://babyklar.app), se under).

## Kom i gang

```powershell
npm install
npm start        # velg i, a eller w i menyen
npm run web      # åpner direkte i nettleser
```

Trykk `w` for web, `a` for Android-emulator, `i` for iOS-simulator, eller skann QR-koden med Expo Go.

> Merk: `.npmrc` peker mot offentlig npm-registry, siden den globale konfigurasjonen på denne maskinen bruker et privat Artifactory-repo.

## Bygg og last opp til TestFlight

Versjonen for neste binærfil settes i `expo.version` i [app.json](app.json).
Produksjonsprofilen i [eas.json](eas.json) øker iOS-buildnummeret automatisk på EAS
og peker innsendingen til BabyKlar i App Store Connect.

```powershell
npm run typecheck
npx eas-cli@25.2.0 build --platform ios --profile production --auto-submit --non-interactive
```

Kommandoen krever innlogging hos Expo og ferdig konfigurerte signerings- og
innsendingsopplysninger. Den bruker EAS-buildkvote og laster den ferdige builden
opp til App Store Connect/TestFlight, **ikke til offentlig App Review**.
En Git-push alene starter ingen build i dette repoet.

Vent til Apple har prosessert builden, test den i TestFlight, og velg deretter den
nye builden i App Store-utkastet. Eksisterende opplastede binærfiler kan ikke
omdøpes. Et nytt versjonsnummer løser ikke de kjente lanseringsmanglene som er
beskrevet i [innsendingspakken](app-store/innsendingspakke.html).

## Nettstedet babyklar.app og delt ønskeliste

[web/](web/) er en Cloudflare Worker på domenet `babyklar.app` (kjøpt via Cloudflare
Registrar 25. november 2026). Den serverer:

- forsiden, [personvern](https://babyklar.app/personvern) og [support](https://babyklar.app/support)
  fra [web/public/](web/public/)
- delte ønskelister på `https://babyklar.app/l/<kode>`, der familie og venner kan
  reservere gaver uten app eller konto ([web/src/guest.ts](web/src/guest.ts))
- API-et appen bruker under Ønsker → **Lag lenke** ([web/src/api.ts](web/src/api.ts),
  klient i [src/lib/share.ts](src/lib/share.ts))

Listene ligger i D1-databasen `babyklar`, opprettet med `--jurisdiction eu`. Appen
lagrer lenken og en hemmelig eiernøkkel i appdataene (og i sikkerhetskopien);
serveren lagrer bare en hash av nøkkelen. Gjester er anonyme: en reservasjon lagrer
tidspunkt og en hash av en tilfeldig nettleserkode, slik at samme nettleser kan
angre. Appen får vite *at* noe er reservert, aldri av hvem. Lister appen ikke har
vært i kontakt med på 12 måneder, slettes av en nattlig cron.

```powershell
cd web
npm install
npm run dev          # http://localhost:8787 med lokal D1 (kjør npm run db:migrate:local først)
npm run typecheck
npm run deploy       # migrerer D1 og publiserer til babyklar.app
```

Appen peker mot `https://babyklar.app`. Sett `EXPO_PUBLIC_WEB_URL=http://127.0.0.1:8787`
for å teste appens nettversjon mot `npm run dev`.

## Support og personvern på nett

[Supportsiden](public/support.html) og [personvernsiden](public/personvern.html)
kopieres automatisk med når nettstedet eksporteres med
`npx expo export --platform web`. Begge er publisert under det varige aliaset
`support`, som nå peker på deploymenten `nmit7ndzfw`:
[BabyKlar support](https://babyklar--support.expo.app/support.html) ·
[BabyKlar personvern](https://babyklar--support.expo.app/personvern.html).
Aliaset hindrer at forhåndsvisningen utløper etter 90 dager og er separat fra
produksjon; API-adressen som er brukt av de installerte appene er ikke endret.
Bruk `npx eas-cli@27.2.0 deploy --non-interactive --alias support` etter en ny
`expo export` for å oppdatere begge sidene under samme aliaset. Verifisert
30. oktober 2026: begge adressene svarer HTTP 200. Alias-tilordning kan ta opp
til ca. ett minutt å spre seg; test på nytt før du konkluderer at noe er feil.

Personvernsiden under `public/` er en ryddet, publiseringsklar versjon av det
tidligere utkastet i [app-store/nettside/personvern.html](app-store/nettside/personvern.html)
(beholdt som internt kontrollnotat). Den fjerner redaksjonelle advarsler/TODO-er
og fyller behandlingsgrunnlag med et forsvarlig standardsvar for en gratis app
uten konto, men endrer ikke de underliggende, ennå urettede funnene i
[innsendingspakken](app-store/innsendingspakke.html) — blant annet at
[Baby-skjermen](<app/(tabs)/baby.tsx>) fortsatt påstår «ingen deling med
tredjepart» mens build 5 faktisk sender bilder til OpenAI uten en egen
tillatelsesdialog. En nettside endrer ikke tillatelsesflyten i en allerede
opplastet iOS-build.

## Native App Store-skjermbilder

Profilen `store-screenshots` bygger en simulatorvariant av 1.0.0 uten å øke
buildnummeret eller laste opp til TestFlight. Den kjører tre Maestro-flyter på
en medium iPhone og en 13-tommers iPad i samme macOS-build. Bare fiktive, lokale
testdata brukes; bildegjenkjenning og OpenAI kalles ikke.
Byggestegene setter eksplisitt buildnummer 5 i det genererte simulatorprosjektet:
EAS sitt standardsteg for simulatorer utelater synkronisering av buildnummer.
Derfor brukes Xcodes `agvtool new-version -all 5` før kompilering, uten å endre
appkonfigurasjonen i kilderepositoriet. Den ferdige appens Info.plist kontrolleres.
Appkilde, ressurser og avhengigheter skal være uendret fra `3643dc5`.

Kontroller tilgjengelig byggekreditt før kjøring:

```powershell
npx --yes eas-cli@27.2.0 account:usage snorre.olimstad --non-interactive
npx --yes eas-cli@27.2.0 build --platform ios --profile store-screenshots --non-interactive
```

Dette bruker dokumenterte custom-build-steg, ikke separat fakturerte
Maestro-jobber i EAS Workflows. App Store-utkastets build 5 endres ikke.
Jobben feiler ved testfeil, manglende bilder eller feil pikselmål.

**Verifisert 30. oktober 2026** (EAS-build `77e24352-ce68-4412-a942-498e3045aa6c`):
3/3 flyter bestod på iPhone 16 Pro og iPad Pro 13-inch (M5), iOS 26.5-simulator,
Xcode 26.6. Seks PNG-er per enhet ligger i
[app-store/bilder/native/](app-store/bilder/native/): iPhone 1206 × 2622 og
iPad 2064 × 2752, RGB, kontrollert visuelt, med
[bevisfil](app-store/bilder/native/capture-evidence.json).

Erfaringer som flytene og profilen nå tar hensyn til:

- Profilen er låst til `macos-tahoe-26.5-xcode-26.6`, samme image som build 5.
  Med iOS 27-SDK krasjer appen ved oppstart («UIScene life cycle is required»),
  og skriptet stopper hvis `DTXcode` ikke er 26.x.
- EAS-arbeiderne har ingen Simulator.app; `simctl boot` + `bootstatus` holder.
- JS-splashen dekker skjermen ~2,5 s og sluker trykk. Flytene gjentar første trykk
  til skjermen faktisk endrer seg.
- Knapper og rader uten egen `accessibilityLabel` eksponerer
  «ikon, tekst, …» som én etikett, og Maestro matcher tekst uten hensyn til
  store/små bokstaver. Velgerne er skrevet for dette.
- `hideKeyboard` virker ikke på søkefeltet; Return lukker tastaturet.

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
