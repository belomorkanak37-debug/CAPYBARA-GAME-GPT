# Yandex Games draft notes

Run locally:

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

Upload the contents of `dist` as a zip archive. `index.html` must be at the archive root.

Implemented integration points:

- `src/systems/YandexSDK.ts` initializes the SDK, reads language, calls LoadingAPI.ready, wraps player saves and ads, and falls back to mock mode locally.
- `src/systems/SaveSystem.ts` stores guest progress in localStorage and tries cloud save when SDK/player data is available.
- `src/systems/AdSystem.ts` pauses audio, saves progress, and then calls SDK ads.

Assets to replace before release:

- final texture atlas for cafe, capybaras, dishes, visitors and UI icons;
- short mp3/ogg music loop and sfx;
- 512x512 icon, cover art and real screenshots.

Moderation checklist:

- build passes;
- no external links;
- no third-party ads;
- game works without authorization;
- rewarded bonuses are optional;
- localStorage save works;
- SDK mock mode works in local development;
- LoadingAPI.ready is called after preload;
- archive size is below 100 MB.
