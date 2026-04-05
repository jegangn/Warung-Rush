# Phase 1 — Project Scaffold

## What to build in this phase
Set up the complete project structure, all PWA files, the HTML page with screen state machine, visual theme CSS, and iPad-specific lockdown. After this phase, you should have a working app that shows all screen shells (empty but styled), installs to iPad home screen, and works offline.

## Files to create

### 1. `manifest.json`
```json
{
  "name": "Warung Rush",
  "short_name": "Warung Rush",
  "description": "Malaysian street food cooking game",
  "start_url": "./",
  "scope": "./",
  "display": "standalone",
  "orientation": "landscape",
  "background_color": "#1a0e0a",
  "theme_color": "#1a0e0a",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### 2. `sw.js` — Service worker for offline play
```js
const CACHE_NAME = 'warung-rush-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('fonts.googleapis.com') || e.request.url.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(response => {
            cache.put(e.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
```

### 3. `generate-icons.html`
A one-time helper page the developer opens in Chrome to generate icon PNGs:
- Uses `<canvas>` to draw a warm brown rounded square (`#2d1810` fill, `#f5c542` border)
- Centres a 🚚 emoji rendered large
- Adds "WR" text below in yellow
- Renders at 512×512, 192×192, and 180×180
- Provides download links for each PNG
- User downloads the 3 files into an `icons/` folder

### 4. `index.html` — main game file

#### `<head>` — MUST include ALL of these:
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Warung Rush">
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#1a0e0a">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="manifest" href="manifest.json">

<!-- Splash screens: solid dark bg to prevent white flash -->
<link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2732' height='2048'%3E%3Crect fill='%231a0e0a' width='100%25' height='100%25'/%3E%3C/svg%3E">
<link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2388' height='1668'%3E%3Crect fill='%231a0e0a' width='100%25' height='100%25'/%3E%3C/svg%3E">
<link rel="apple-touch-startup-image" media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2360' height='1640'%3E%3Crect fill='%231a0e0a' width='100%25' height='100%25'/%3E%3C/svg%3E">
<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2048' height='1536'%3E%3Crect fill='%231a0e0a' width='100%25' height='100%25'/%3E%3C/svg%3E">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
<title>Warung Rush</title>
```

#### iPad lockdown CSS (inline in `<style>`):
```css
* {
  margin: 0; padding: 0; box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: none;
}
html, body {
  width: 100%; height: 100%;
  overflow: hidden;
  overscroll-behavior: none;
  position: fixed;
  background: #1a0e0a;
  font-family: 'Nunito', sans-serif;
  color: #fef3e0;
}
body {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

#### Screen state machine

The game has these screens, implemented as full-screen `<div>` elements. Only one is visible at a time via an `.active` class.

```
TITLE → TUTORIAL (first time) → LEVEL_SELECT → PRE_LEVEL → COUNTDOWN → PLAYING → LEVEL_COMPLETE
         ↕                          ↕                                                    ↕
        SHOP ←←←←←←←←←←←←←←←←←←← SHOP ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←← SHOP
```

HTML structure:
```html
<div id="screen-title" class="screen active">...</div>
<div id="screen-tutorial" class="screen">...</div>
<div id="screen-shop" class="screen">...</div>
<div id="screen-level-select" class="screen">...</div>
<div id="screen-pre-level" class="screen">...</div>
<div id="screen-countdown" class="screen">...</div>
<div id="screen-playing" class="screen">...</div>
<div id="screen-level-complete" class="screen">...</div>
<div id="overlay-pause" class="overlay">...</div>
<div id="overlay-rotate" class="overlay">...</div>
```

CSS:
```css
.screen { display: none; width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
.screen.active { display: flex; }
.overlay { display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 100; }
.overlay.active { display: flex; }
```

JS state machine:
```js
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + screenId).classList.add('active');
}
```

#### Screen contents for Phase 1 (placeholder layouts):

**TITLE** — centred column:
1. "WARUNG RUSH" — Fredoka 72px bold, `#f5c542`, text-shadow, gentle CSS scale pulse animation (2s infinite)
2. "MALAYSIAN STREET FOOD" — Nunito 22px, `#c4a882`, uppercase, letter-spacing 4px
3. 🚚 — 80px, CSS bounce animation
4. "Masak cepat, serve laju!" — Nunito 16px italic, `#c4a882`
5. "START GAME" — button with yellow-to-orange gradient bg, `#1a0e0a` text, `box-shadow: 0 6px 0 #b8650a`, Fredoka 24px
6. "SHOP 🛒" — secondary button (`#3d2218` bg, border `#8a6e52`)
7. "HOW TO PLAY" — text-only button
8. "Add to Home Screen" hint — subtle banner, only visible when `window.navigator.standalone !== true`
9. "Reset Progress" — small muted text, bottom corner

**LEVEL SELECT** — placeholder grid of 12 cards
**SHOP** — placeholder with 3 tabs
**PRE_LEVEL** — placeholder centred card
**COUNTDOWN** — centred area for 3-2-1 numbers
**PLAYING** — placeholder with left queue, centre prep area, right queue, bottom cooking slots
**LEVEL COMPLETE** — placeholder results card
**TUTORIAL** — placeholder stepped overlay

**PAUSE overlay** — semi-transparent dark bg, centred card with "PAUSED", Resume button, Quit button
**ROTATE overlay** — full dark bg, rotation animation icon, "Rotate your iPad to play" text

#### Landscape lock detection:
```js
const portraitQuery = window.matchMedia("(orientation: portrait)");
function handleOrientation(e) {
  document.getElementById('overlay-rotate').classList.toggle('active', e.matches);
}
portraitQuery.addEventListener("change", handleOrientation);
handleOrientation(portraitQuery);
```

#### Wake lock:
```js
let wakeLock = null;
async function requestWakeLock() {
  try { if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen'); } catch(e) {}
}
async function releaseWakeLock() {
  if (wakeLock) { await wakeLock.release(); wakeLock = null; }
}
```

#### Service worker registration — END of `<body>`:
```html
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
</script>
```

---

## Phase 1 verification checklist

- [ ] `manifest.json` exists and is valid JSON
- [ ] `sw.js` exists and caches all assets
- [ ] `generate-icons.html` opens in browser and generates 3 downloadable PNGs
- [ ] `index.html` opens in browser without errors
- [ ] Title screen is visible by default with correct styling
- [ ] All 8 screen divs exist in HTML (title, tutorial, shop, level-select, pre-level, countdown, playing, level-complete)
- [ ] Both overlay divs exist (pause, rotate)
- [ ] `showScreen('level-select')` works via browser console — switches screens
- [ ] No scrolling, no zoom, no bounce when testing on mobile viewport
- [ ] Rotate overlay appears when browser is in portrait mode
- [ ] Fonts load (Fredoka for title, Nunito for subtitle)
- [ ] Title animation plays (gentle scale pulse)
- [ ] Truck emoji bounces
- [ ] Buttons are styled correctly (primary = gradient + shadow, secondary = card bg)
- [ ] "Add to Home Screen" hint is visible in normal browser, hidden in standalone mode
- [ ] Service worker registers (check DevTools → Application → Service Workers)
- [ ] All files cached (check DevTools → Application → Cache Storage)
- [ ] Page works after going offline (DevTools → Network → Offline checkbox)
