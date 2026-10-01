# BabyKlar

> Praktisk assistent for kommende foreldre og småbarnsforeldre.

## 1. Produktidé

**BabyKlar** hjelper kommende foreldre med å få oversikt over:

- hva de trenger før babyen kommer
- hva de allerede har
- hva som mangler
- hva som kan vente
- klær og størrelser
- ønskelister
- oppgaver og forberedelser
- hva barnet kommer til å trenge snart

Appen skal ikke være enda en generell graviditetsapp med uke-for-uke-informasjon.

Kjernen er:

> **Hva trenger vi? Hva har vi allerede? Hva mangler vi? Hva trenger barnet snart?**

---

## 2. Målgruppe

### Primær målgruppe
- førstegangsforeldre
- gravide og partner
- familier som forbereder seg på baby
- foreldre med barn 0–3 år

### Sekundær målgruppe
- foreldre som venter barn nummer 2+
- familier som vil gjenbruke klær og utstyr
- besteforeldre/familie som bruker delt ønskeliste

---

## 3. Problemet BabyKlar løser

Kommende foreldre møter ofte:

- enorme og generiske utstyrslister
- usikkerhet rundt hva som faktisk er nødvendig
- mange unødvendige innkjøp
- dårlig oversikt over hva de allerede har
- klær i mange størrelser
- ting som ligger lagret i bokser
- familie som spør hva de ønsker seg
- partner som ikke nødvendigvis har samme oversikt
- behov som endres raskt etter fødselen

BabyKlar skal redusere stress og unødvendige kjøp ved å samle dette på ett sted.

---

## 4. Produktløfte

BabyKlar skal kunne fortelle brukeren:

### Dette trenger dere sannsynligvis
Eksempel:
- bilstol
- sovested
- klær i riktig størrelse
- bleier
- stelleutstyr

### Dette har dere allerede
Eksempel:
- 7 bodyer str. 56
- 4 pysjer
- vogn
- bilstol

### Dette mangler dere
Eksempel:
- 2 pysjer str. 56
- regntrekk til vogn
- ullbody str. 62

### Dette kan vente
Eksempel:
- høystol
- større klær
- enkelte typer matutstyr

### Dette trenger dere kanskje ikke
Appen skal aktivt unngå å presse foreldrene til å kjøpe alt mulig.

Dette er viktig for tillit.

---

## 5. Onboarding

Onboarding skal være kort.

1. Hva passer best?
   - Vi venter vårt første barn
   - Vi venter barn og har barn fra før
   - Babyen er allerede født

2. Termindato eller fødselsdato

3. Har dere:
   - bil
   - ting fra tidligere barn
   - partner dere vil dele appen med

4. Hva ønsker dere mest hjelp med?
   - utstyr
   - klær og størrelser
   - sykehusbag
   - ønskeliste
   - ting dere allerede eier
   - oppgaver
   - budsjett

### Resultat etter onboarding

> ## Dere er 42 % BabyKlar
>
> 12 viktige ting gjenstår  
> 7 ting kan vente  
> 3 oppgaver bør gjøres snart

---

## 6. Hovedskjerm

Eksempel:

# 9 uker til termin

**Dere er 64 % klare**

### Viktigst nå
- [ ] Skaff bilstol
- [ ] Bestem sovested
- [ ] Begynn på sykehusbag

### Dere mangler mest innen
- Klær — 55 %
- Søvn — 80 %
- Transport — 70 %
- Stell — 65 %

### Snart
> Dere har 6 bodyer i str. 56. Det er sannsynligvis nok.

> Dere mangler 2–3 pysjer i str. 56.

### Hurtigknapper
- Legg til
- Skann
- Ønskeliste
- Plan

---

## 7. Personlig BabyKlar-plan

Planen tilpasses blant annet:

- termindato
- barnets alder
- første barn eller ikke
- årstid
- hva familien allerede har
- brukerens egne valg

### Kategorier

#### Søvn
- seng / bedside crib
- madrass
- laken
- sovepose etter behov

#### Klær
- body
- bukser
- pysj
- ull
- yttertøy
- sokker
- lue

#### Stell
- bleier
- stelleunderlag
- kluter
- termometer
- neglesaks / fil

#### Transport
- vogn
- bilstol hvis relevant
- bæresele
- regntrekk

#### Mat
Hold anbefalingene nøytrale og ikke anta amming eller flaskemating.

#### Sykehusbag
Egen sjekkliste for:
- mor
- baby
- partner

---

## 8. Prioritet på elementer

Alle standardelementer bør kategoriseres som:

### Viktig
Ting de fleste i denne situasjonen trenger.

### Kan vente
Ting som ikke trenger å kjøpes før behovet oppstår.

### Valgfritt
Kjekt for noen, unødvendig for andre.

Merkevareidé:

> **BabyKlar hjelper deg å kjøpe smartere, ikke mer.**

---

## 9. Ting familien allerede har

Hvert element kan inneholde:

- navn
- kategori
- bilde
- antall
- størrelse
- merke
- status
- pris
- notat
- lagringssted
- kjøpt / arvet / gave

### Status
- Har
- Mangler
- Ønsker
- Skal kjøpe
- Bestilt
- Kan vente
- Trenger ikke
- Lagret til senere
- Vokst ut av

---

## 10. AI-skanning

AI skal brukes for å redusere manuelt arbeid.

Ikke bygg en generell AI-chat som hovedfunksjon.

### Eksempel – klær

Brukeren tar bilde av klær eller etiketter.

AI foreslår:

> 4 × body str. 56  
> 2 × bukse str. 56  
> 1 × ullbody str. 62

Brukeren godkjenner før lagring.

### Eksempel – produkt

Brukeren tar bilde av en produkteske.

AI foreslår:

- produktnavn
- kategori
- merke
- eventuell størrelse/modell

AI-resultater skal alltid være forslag som brukeren enkelt kan korrigere.

---

## 11. Smart garderobe

Appen bør etter hvert vite:

- størrelse barnet bruker nå
- neste størrelse
- hva familien har
- hva som ligger lagret
- hvilke typer klær de mangler

Eksempel:

## Str. 62

| Type | Har | Anbefalt |
|---|---:|---:|
| Body | 7 | 6–8 |
| Bukser | 4 | 4–6 |
| Pysj | 2 | 3–5 |
| Ullbody | 0 | 1–2 |

> Dere har nok bodyer. Dere mangler sannsynligvis 1–3 pysjer.

---

## 12. Ønskeliste

Ønskelisten kan være en viktig gratis vekstmotor.

Foreldrene kan legge inn:

- produkt
- fritekst
- størrelse
- lenke
- bilde
- prioritet
- om brukt er OK

Familie og venner får en lenke og kan:

- se ønsker
- reservere gave
- markere kjøpt
- spleise senere

Det bør være mulig å bruke ønskelisten uten å installere appen.

---

## 13. Partnerdeling

BabyKlar+ bør støtte delt husholdning.

Begge foreldrene ser samme:

- plan
- fremdrift
- produkter
- klær
- oppgaver
- ønskeliste

---

## 14. Etter fødselen

BabyKlar skal fortsette å være relevant.

Fokus endres fra:

> **Hva må vi ha klart før babyen kommer?**

til:

> **Hva trenger barnet nå og snart?**

Eksempel:

> Barnet bruker str. 62 nå.

> Dere har allerede 14 plagg i str. 68.

> Det nærmer seg vinter. Dere mangler yttertøy i neste størrelse.

---

## 15. Ikke bygg dette i MVP

- medisinsk rådgivning
- symptomvurdering
- graviditetsdiagnostikk
- søvntracker
- ammetracker
- bleietracker
- sparketeller
- rieteller
- forum
- sosialt nettverk
- full graviditetskalender
- nettbutikk

---

## 16. Navigasjon

Forslag:

### Hjem
Oversikt, fremdrift og viktigst akkurat nå.

### Plan
Personlig sjekkliste.

### Ting
Alt familien har og mangler.

### Ønsker
Ønskeliste og deling.

### Baby
Barn, størrelser, familie og innstillinger.

### Skann
Sentral kamera-knapp tilgjengelig fra flere steder.

---

## 17. MVP

### Må være med

- [ ] brukerregistrering
- [ ] household/familie
- [ ] termin/fødselsdato
- [ ] onboarding
- [ ] personlig basisplan
- [ ] kategorier
- [ ] har/mangler
- [ ] viktig / kan vente / valgfritt
- [ ] egne elementer
- [ ] bilder
- [ ] klær og størrelser
- [ ] enkel fremdrift
- [ ] ønskeliste
- [ ] delbar ønskeliste
- [ ] enkel AI-skanning
- [ ] varsler
- [ ] betalingsvegg
- [ ] BabyKlar+

### Etter MVP

- [ ] partnerinvitasjon
- [ ] flere elementer fra samme AI-bilde
- [ ] smart garderobe
- [ ] neste størrelse
- [ ] sesongtilpasning
- [ ] budsjett
- [ ] gave-reservasjon
- [ ] historikk
- [ ] flere barn
- [ ] arv mellom søsken
- [ ] lagringssteder
- [ ] selg/gi bort
- [ ] affiliate
- [ ] internasjonalisering

---

## 18. Pris

### Gratis

- personlig basisplan
- har/mangler
- enkel garderobe
- ønskeliste
- deling av ønskeliste
- begrenset AI, for eksempel 5 skanninger

### BabyKlar+

**Forslag: 349 kr/år**

Alternativ:

**49 kr/mnd**

Mulig introduksjonspris:

**199 kr første år**

Premium kan inneholde:

- partnerdeling
- full smart garderobe
- høy AI-kvote
- avansert personalisering
- flere barn
- budsjett
- historikk
- sesong- og størrelsesvarsler

---

## 19. Forretningsmodell

### Gratis app + affiliate (primær retning)
Alle funksjoner er gratis – ingen betalingsmur. Inntekten kommer fra tydelig merkede
affiliate-lenker: når familien uansett skal kjøpe noe de mangler, kan BabyKlar vise
relevante tilbud og tjene provisjon uten at brukeren betaler mer.

Forenklet potensial:

```
inntekt = aktive brukere × klikkrate × kjøpsrate × ordreverdi × provisjon
```

Eksempel: 10 000 aktive × 20 % klikk × 5 % kjøp × 1 500 kr × 5 % ≈ 7 500 kr/mnd.

Ukrenkelige regler:

- Kommersielle avtaler påvirker aldri hva appen sier at familien trenger.
- Tilbud vises bare for ting brukeren allerede har markert som manglende/planlagt.
- Sikkerhetskritiske produkter (bilstol, madrass, seng) vises kun som nye og manuelt kuraterte.
- Ingen salg av brukerdata, ingen skjult sporing.

### Senere: sponsede plasseringer
Tydelig merkede kampanjer med fast betaling kan komme i tillegg – men butikker kan
aldri kjøpe seg inn i behovslisten eller øverst i nøytrale resultater.

Betalt abonnement (BabyKlar+) er lagt bort til fordel for gratis app + affiliate.

---

## 20. Design

Appen skal føles:

- rolig
- trygg
- moderne
- enkel
- varm
- lite stressende

Unngå:

- aggressiv shopping
- dårlig samvittighet
- for mye rosa/blått
- «du ligger bak»
- konkurranse mot andre foreldre

---

## 21. Sikkerhet og personvern

- samle minst mulig data
- barnets navn bør være valgfritt
- termin/fødselsdato er nok for mye av personaliseringen
- ikke samle medisinske journaldata
- ikke gi diagnostiske råd
- enkel kontosletting
- sikre bilder og brukerdata
- tydelige tilgangsregler per familie

AI skal ikke improvisere sikkerhetskritiske råd om barn.

---

## 22. Teknisk forslag

### Mobil
- React Native
- Expo
- TypeScript

### Backend
For eksempel:
- Supabase
- Firebase

Behov:
- authentication
- database
- bildelagring
- serverfunksjoner
- tilgangskontroll

### Affiliate/tilbud
For eksempel:
- norske affiliate-nettverk / direkteavtaler med butikker
- feed-adapter med pris, `fetchedAt` og utløp
- automatisk deaktivering av utdaterte tilbud

### AI
AI-kall bør skje via backend.

Ikke legg hemmelige API-nøkler direkte i mobilappen.

---

## 23. Fireukers MVP-plan

### Uke 1
- prosjektoppsett
- auth
- database
- household
- termin/fødselsdato
- onboarding
- standard elementkatalog
- personlig basisplan

### Uke 2
- hjemskjerm
- har/mangler
- kategorier
- fremdrift
- egne produkter
- bilder
- størrelser
- søk/filter

### Uke 3
- kamera
- AI-skanning
- godkjenning av AI-resultat
- ønskeliste
- delbar ønskeliste
- push-varsler

### Uke 4
- tilbudsflate (affiliate)
- tydelig annonsemerking
- analytics
- crash reporting
- personvern
- sletting av lokale data
- UI-polish
- TestFlight
- App Store-materiale

---

## 24. Hva som skal måles

Ikke vurder appen kun på antall installs.

Viktigere:

- onboarding completion
- antall registrerte ting
- brukere tilbake etter 7 dager
- brukere tilbake etter 30 dager
- ønskelister som deles
- partnerinvitasjoner
- AI-skanninger
- klikk på tilbud
- churn

---

## 25. Tegn på at ideen fungerer

Bra signaler:

- folk registrerer mange ting
- de bruker appen flere ganger
- ønskelister deles
- partner inviteres
- AI brukes aktivt
- folk begynner å betale uten personlig overtalelse

Dårlige signaler:

- appen brukes én kveld og glemmes
- brukerne foretrekker Notater
- ingen gidder registrere klær/utstyr
- ønskelisten blir ikke delt
- ingen klikker på relevante tilbud

---

## 26. Navn

**BabyKlar** fungerer godt som arbeidsnavn fordi det er enkelt og forklarer produktet.

Før lansering bør navnet undersøkes mot:

- App Store
- Google Play
- norske varemerker
- domener
- sosiale medier
- eksisterende tjenester i Norden

Det finnes allerede bruk av «Babyklar» i Danmark, så navnet bør ikke låses før dette er avklart.

---

# North Star

BabyKlar skal kunne svare på tre spørsmål på noen sekunder:

## Hva trenger vi?

## Hva har vi allerede?

## Hva trenger barnet snart?

Hvis appen gjør disse tre tingene bedre enn Google + Notater + tilfeldige sjekklister, har den en tydelig grunn til å eksistere.

---

# Første produktbeslutning

Ikke bygg «alt for småbarnsforeldre».

Bygg først:

> **Den smarteste måten å bli praktisk klar for baby på.**

Kjerneflyt:

**Termin → personlig plan → har/mangler → AI-skann → ønskeliste → del.**
