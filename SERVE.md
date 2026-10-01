# Run BabyKlar

## Install on iPhone (standalone app)

Built in the cloud with EAS — no Mac needed. Requires a paid
[Apple Developer Program](https://developer.apple.com/programs/) membership and a free
[Expo account](https://expo.dev/signup).

In PowerShell:

```powershell
cd C:\dev\test\babyklar
npx eas-cli@latest login
npx eas-cli@latest init
npx eas-cli@latest build -p ios --profile production --auto-submit
```

- `init` links the project to your Expo account (adds `extra.eas.projectId` to `app.json`).
- During `build`: log in with your Apple ID and let EAS create certificates and
  provisioning profiles. Answer **no** to setting up push notifications.
- The build takes ~15–30 min, then uploads to App Store Connect / TestFlight.
- First time only: in [App Store Connect](https://appstoreconnect.apple.com) → BabyKlar →
  TestFlight, add yourself to an internal testing group.
- On the iPhone: install **TestFlight** from the App Store → install BabyKlar.

New version: run the `build` command again (build number is incremented automatically).

If `no.babyklar.app` is already taken on Apple's side, change `ios.bundleIdentifier` in
`app.json` (e.g. `no.<yourname>.babyklar`).

**Alternative without TestFlight** (ad hoc, installs straight from a link):

```powershell
npx eas-cli@latest device:create        # open the link on the iPhone, install the profile
npx eas-cli@latest build -p ios --profile preview
```

Open the build link on the iPhone. Requires Developer Mode
(Settings → Privacy & Security → Developer Mode).

## Dev server

```powershell
npx expo start --lan
```

Phone and PC must be on the same Wi-Fi (`--localhost` is unreachable from a phone).

## Web check

```powershell
npx expo start --web --localhost --port 8082
```

Open [http://localhost:8082](http://localhost:8082).
