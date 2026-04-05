# Warung Rush — Build Prompt for Claude Extension (VS Code)

## What to build
A web game inspired by Cook Serve Delicious 3, themed around Malaysian street food. The player runs a food truck, receives orders with countdown timers, prepares dishes by tapping ingredients in the correct sequence, and serves them for points. The game must be fully playable on iPad in landscape orientation, deployed via GitHub Pages, and installable to the iPad home screen as a fullscreen PWA app. Auto-saves progress after every level so nothing is ever lost.

## Output — Project structure

```
warung-rush/
├── index.html                ← The game (all CSS + JS inline)
├── manifest.json             ← Web app manifest for PWA install
├── sw.js                     ← Service worker for offline play
└── icons/
    ├── icon-192.png          ← PWA icon (see generation instructions)
    ├── icon-512.png          ← PWA icon large
    └── apple-touch-icon.png  ← 180×180 iPad home screen icon
```

No build tools, no frameworks, no npm. All game code is in `index.html` with inline CSS and JS.

### Deployment: GitHub Pages
Push the repo, enable GitHub Pages (Settings → Pages → Source: main branch). URL will be `https://<username>.github.io/warung-rush/`. User opens URL on iPad Safari → Share (⬆️) → "Add to Home Screen" → launches fullscreen.

---

## PWA configuration (makes it feel like a native iPad app)

### manifest.json
Create this file at the project root:
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

### sw.js — Service worker (offline play after first load)
Create this file at the project root:
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
  // Cache Google Fonts on first use
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
  // Serve everything else from cache, fallback to network
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
```

### Icon generation
For the icon PNGs, create a one-time helper file `generate-icons.html` that:
1. Uses `<canvas>` to draw a warm brown rounded square (#2d1810 fill, #f5c542 border, 🚚 emoji centred, "WR" text below)
2. Renders at 512×512, 192×192, and 180×180
3. Provides download links for each as PNG
4. User opens this file once in Chrome, downloads the three PNGs, and places them in `icons/`

### index.html `<head>` — required meta tags for iPad app behaviour
These MUST all be present in `<head>`:
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">

<!-- PWA: fullscreen standalone app on iPad home screen -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Warung Rush">
<meta name="mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#1a0e0a">

<!-- Icons -->
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">

<!-- Manifest -->
<link rel="manifest" href="manifest.json">

<!-- Splash screens: solid dark background to prevent white flash on launch -->
<link rel="apple-touch-startup-image" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2732' height='2048'%3E%3Crect fill='%231a0e0a' width='100%25' height='100%25'/%3E%3C/svg%3E">
<link rel="apple-touch-startup-image" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2388' height='1668'%3E%3Crect fill='%231a0e0a' width='100%25' height='100%25'/%3E%3C/svg%3E">
<link rel="apple-touch-startup-image" media="(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2360' height='1640'%3E%3Crect fill='%231a0e0a' width='100%25' height='100%25'/%3E%3C/svg%3E">
<link rel="apple-touch-startup-image" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2048' height='1536'%3E%3Crect fill='%231a0e0a' width='100%25' height='100%25'/%3E%3C/svg%3E">

<!-- Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">

<title>Warung Rush</title>
```

### Service worker registration — add at the END of `<body>`:
```html
<script>
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
</script>
```

### Landscape lock + "please rotate" overlay
If the player is holding the iPad in portrait, show a fullscreen overlay with a rotation icon (CSS animated phone rotating 90°) and the text "Rotate your iPad to play". Detect via:
```js
const portraitQuery = window.matchMedia("(orientation: portrait)");
portraitQuery.addEventListener("change", e => toggleRotateOverlay(e.matches));
```

### Screen wake lock (prevent dimming during gameplay)
```js
let wakeLock = null;
async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch (e) {}
}
async function releaseWakeLock() {
  if (wakeLock) { await wakeLock.release(); wakeLock = null; }
}
```
Request when entering PLAYING state. Release when pausing, completing level, or returning to menu.

### "Add to Home Screen" hint
When running in Safari (not standalone), show a subtle dismissible banner on the title screen:
"For the best experience: tap ⬆️ Share → Add to Home Screen"
Detect standalone: `window.navigator.standalone === true` on iOS. If standalone, hide the banner.

---

## Target device
- iPad (landscape, 1024×768 minimum)
- Touch input only — no hover states, no right-click, no keyboard shortcuts
- Minimum tap target: 60×60px
- All interactions via tap (no drag, no swipe — keep it simple)

## External resources allowed
- Google Fonts: `Fredoka` (display/headings, weights 400-700) and `Nunito` (body/UI, weights 400-800)
- NO other CDN, library, or external asset

## iPad-specific CSS (apply to index.html)
```css
* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: none;
}
html, body {
  overflow: hidden;
  overscroll-behavior: none;
  position: fixed;
  width: 100%; height: 100%;
}
body {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

---

## Visual style
- **Theme**: Malaysian hawker stall / food truck — warm, vibrant, appetising
- **Palette**:
  - Backgrounds: `#1a0e0a` (darkest), `#2d1810` (warm dark), `#3d2218` (card), `#4a2a1c` (card hover)
  - Accents: `#f5c542` (yellow/gold), `#e8842a` (orange), `#d4392e` (red/danger), `#4caf50` (green/success), `#26a69a` (teal)
  - Text: `#fef3e0` (primary), `#c4a882` (muted), `#8a6e52` (dim)
- **Typography**: Fredoka for all headings, scores, buttons. Nunito for body text, labels, descriptions.
- **Borders/Cards**: Rounded corners (12-16px), subtle borders using palette dim colours, no drop shadows except on primary action buttons (use solid offset shadow like `0 6px 0 #b8650a`)
- **Animations**: CSS only. Smooth transitions on taps (scale 0.95 on active), pulse on low timer, pop on combo increase, shake on wrong ingredient, bounce on dish serve.
- **Icons**: Use emoji throughout — no SVG icons, no icon libraries. Food emoji for dishes and ingredients. Keep emoji at explicit sizes (font-size set, never inherited).

---

## Game states (implement as a state machine)

```
TITLE → TUTORIAL (first time only) → LEVEL_SELECT → PRE_LEVEL → COUNTDOWN → PLAYING → LEVEL_COMPLETE → (LEVEL_SELECT or SHOP)
         ↕                              ↕
        SHOP ←←←←←←←←←←←←←←←←←←←←←← SHOP
```

Each state is a full-screen `<div>`. Only one visible at a time (use `.active` class with `display:flex`, others `display:none`).

New states vs previous version:
- `TUTORIAL` — interactive tutorial, shown on first launch (or accessible via title screen)
- `SHOP` — upgrade/unlock store, accessible from title screen and level select
- `PRE_LEVEL` — shows level info, modifiers, and medal targets before countdown

---

## Screen 1: Title screen (`TITLE`)

Layout (centred column):
1. Game title "WARUNG RUSH" — Fredoka 72px bold, yellow with text-shadow, gentle scale pulse animation (2s infinite)
2. Subtitle "MALAYSIAN STREET FOOD" — Nunito 22px, muted, uppercase, letter-spacing 4px
3. Food truck emoji (🚚) — 80px, gentle bounce animation
4. Tagline: "Masak cepat, serve laju!" — Nunito 16px italic, muted
5. "START GAME" button — large primary button (yellow-to-orange gradient, dark text, solid offset shadow). If first launch (no save data), this triggers TUTORIAL first. Otherwise goes to LEVEL_SELECT.
6. "SHOP 🛒" button — secondary button, shows current RM balance badge
7. "HOW TO PLAY" button — smaller tertiary button (text-only style)
8. "Add to Home Screen" hint banner — only shows if NOT running in standalone mode (see PWA section)
9. "Reset Progress" — small muted text link, bottom corner

---

## Screen 1b: Tutorial (`TUTORIAL`) — interactive, not just text

The tutorial plays like a guided mini-level. It walks the player through ONE complete dish (Teh Tarik) with hand-holding, then lets them try ONE dish solo, then proceeds to the game. Total duration: ~60 seconds.

### Tutorial flow (5 steps):

**Step 1 — "Orders come in!"**
- A single Teh Tarik order card appears on the left queue with a patience bar
- A large pulsing arrow points to it
- Floating text: "Tap the order to start cooking"
- Game is PAUSED until player taps the order
- On tap: order highlights, prep station loads → advance to step 2

**Step 2 — "Follow the recipe!"**
- Prep station shows Teh Tarik recipe: ☕ Tea → 🥛 Condensed milk → 👋 Pull
- The CORRECT ingredient button pulses/glows with a golden highlight
- Floating text: "Tap the highlighted ingredient"
- All other buttons are dimmed and disabled
- On tap: ingredient adds with green flash → arrow moves to next ingredient
- Repeat for all 3 ingredients (guided, can't make mistakes)

**Step 3 — "Serve the dish!"**
- SERVE button appears with pulsing glow
- Floating text: "Tap SERVE to complete the order!"
- On tap: "PERFECT! +60" floating text, chime plays

**Step 4 — "Now try one on your own!"**
- Floating text: "A new order is coming… this time you're on your own! Watch out for wrong ingredients!"
- A Kopi O order spawns (simple 3-step dish)
- No guided highlights — player must read the recipe and tap correct ingredients
- If they make a mistake: red shake + "Oops! Wrong ingredient. Try again!" (no penalty in tutorial)
- If they succeed: "Great job! You're ready!" with green checkmark
- If patience expires: order respawns (can't fail tutorial)

**Step 5 — "Let's go!"**
- Brief summary card:
  - ✅ Tap orders to cook
  - ✅ Follow the recipe steps
  - ✅ Serve before time runs out
  - ✅ Chain combos for bonus points
  - 💰 Earn RM to unlock new dishes and upgrades
- "START COOKING →" button → transitions to LEVEL_SELECT
- Tutorial completion saved to localStorage so it only shows once

### Tutorial re-access
"How to Play" button on title screen replays the tutorial at any time.

---

## Screen 1c: Shop (`SHOP`)

Full-screen shop with the player's RM balance shown large at the top.

Layout: three horizontal tab buttons at top: "🍜 Dishes" | "🚚 Upgrades" | (future: "🎨 Cosmetics")

### Dishes tab
Grid of tier unlock cards (4 cards for Tier 2-5):
- Each card shows: tier number, tier name, sample dish emojis (3-4 from that tier), price, "UNLOCK" button
- Already unlocked tiers show a green checkmark and "UNLOCKED" label
- Locked tiers with insufficient RM: greyed out price, disabled button
- Tapping UNLOCK: RM deducted, card animates to "UNLOCKED", all dishes in that tier become available

### Upgrades tab
Grid of upgrade cards (5 upgrades × 3 levels each):
- Each card shows: icon, name, current level (○○○ → ●○○ → ●●○ → ●●●), next level cost, effect description
- Maxed upgrades show "MAX" badge
- Tapping "UPGRADE": RM deducted, level pip fills, effect description updates

### Navigation
- "Back ←" button → returns to previous screen (title or level select)
- RM balance updates in real-time as purchases are made

---

## Screen 2: Level select (`LEVEL_SELECT`)

Header: "SELECT ROUTE" — Fredoka 36px yellow
Subheader: current RM balance (tappable → goes to Shop)

Scrollable grid of 12 level cards (3 rows × 4 columns, or horizontal scroll if screen is tight):

Each card shows:
- Level number (large, yellow)
- Location name + subtitle (muted, small) e.g., "Penang — Gurney Drive"
- Available tier badge(s): coloured dots showing which dish tiers appear
- Modifier icons (if any): 😤🏃🤔 etc.
- Medal earned (emoji: 🥉🥈🥇 or empty)
- Best score (small text)
- Locked cards: 40% opacity, lock emoji overlay, pointer-events none. If locked because a tier isn't purchased, show "Requires Tier X" text + "🛒" icon that taps to Shop

Back button → Title screen.
Shop button (🛒) → Shop screen.

---

## Screen 2b: Pre-level screen (`PRE_LEVEL`)

Shown after tapping a level card, before the countdown. Gives the player intel on what's coming.

Layout (centred card):
1. "ROUTE [N]" — Fredoka 32px yellow
2. Location name — Fredoka 24px white
3. Duration: "⏱ 120 seconds"
4. Dishes available: grid of dish emojis + names that can appear in this level
5. Active modifiers: row of modifier badges with labels (e.g., "😤 Impatient Crowd: Patience −20%")
6. Medal targets: "🥉 1200 | 🥈 2000 | 🥇 3400"
7. "START →" button (large primary)
8. "Back ←" button (returns to level select)

---

## Screen 3: Countdown (`COUNTDOWN`)

Brief 3-2-1 countdown before gameplay starts. Large centred numbers, Fredoka 120px, scale-in animation each second. After "1", flash "GO!" in green, then transition to PLAYING.

---

## Screen 4: Gameplay (`PLAYING`)

This is the core screen and where CSD3's fun lives. The key design principle: **the player must always be juggling multiple things simultaneously**. Never let them wait. The moment one dish is cooking, another order is expiring, and a third needs assembly.

### Layout (landscape, flex column):

### Top bar (HUD) — fixed 56px height
Left: SCORE (Fredoka 28px yellow) + RM earned (smaller gold "💰 RM 320")
Centre: COMBO pill (orange bg, "×1"/"×2"/"×3") + RUSH indicator (red pulse, only during rush events)
Right: TIMER (Fredoka 28px, red + pulse when <20s) + Pause (⏸)

### Main area — flex row, fills remaining height

```
┌──────────┬─────────────────────────────────┬──────────┐
│  ORDER   │        PREP / COOK AREA         │  ORDER   │
│  QUEUE   │                                 │  QUEUE   │
│  (left)  │  ┌─────────────────────────┐    │  (right) │
│          │  │   ACTIVE ORDER RECIPE   │    │          │
│  🟡 CKT  │  │   Customer wants:       │    │  🟢 Sat  │
│  🔴 NLmk │  │   [specific order card] │    │  🟡 Mee  │
│  🟢 Teh  │  │                         │    │  🔴 Ren  │
│          │  ├─────────────────────────┤    │          │
│          │  │   INGREDIENT BUTTONS    │    │          │
│          │  │   (context-sensitive)   │    │          │
│          │  └─────────────────────────┘    │          │
│          ├─────────────────────────────────┤          │
│          │     🔥 COOKING SLOTS (1-3)      │          │
│          │  [Satay 🟢▓▓▓▓▓░░] [Roti ▓▓▓░] │          │
│          │     PULL!          cooking...    │          │
└──────────┴─────────────────────────────────┴──────────┘
```

---

### Three cooking mechanics (the heart of the game)

Every dish uses ONE of these three mechanics. This is what creates variety and multi-tasking pressure:

#### Type A: INSTANT SERVE (Tier 1 drinks, simple snacks)
- Tap ingredient buttons in the correct sequence → SERVE button appears → tap to serve
- No cooking timer — fastest to complete
- Low points but keeps combos alive
- **Strategic role**: filler between complex dishes, combo maintainers

#### Type B: COOK & SERVE (grilled, fried, boiled dishes — Tier 2+)
Two phases that create multi-tasking:

**Phase 1 — PREP**: Tap ingredients to prepare the dish (like Type A but shorter, 2-4 steps)
**Phase 2 — COOK**: Dish moves to a **cooking slot** at the bottom of the screen. A timer bar fills over time:

```
Cooking slot UI:
┌──────────────────────────────────┐
│ 🍢 Satay  [▓▓▓▓▓▓▓▓▓▓░░░░░░░]  │
│           raw → PERFECT → BURNT  │
│                    ↑              │
│              [PULL! button]       │
└──────────────────────────────────┘
```

Timer bar zones:
- **Grey (0-60%)**: Still cooking… "Not ready" if tapped
- **GREEN/GOLD (60-85%)**: PERFECT zone — tap "PULL!" to serve at full points. A pulsing glow signals readiness.
- **ORANGE (85-95%)**: Overcooked — still servable but −30% points
- **RED (95-100%)**: BURNT — dish is trashed. Order lost. Penalty. The slot smokes and flashes.

**While a dish cooks, the player is FREE to work on other orders.** This is the core multi-tasking loop: prep → start cooking → switch to another order → pull when ready → serve.

**Max cooking slots**: 2 base (upgradable to 3 via Bigger Griddle upgrade). If all slots are occupied, the player MUST pull or trash a dish before starting another cook.

Cook times by tier:
- Tier 2: 4-6 seconds
- Tier 3: 6-8 seconds
- Tier 4: 8-10 seconds
- Tier 5: 10-12 seconds

#### Type C: CUSTOM ORDER (assembly dishes — Tier 3+)
The customer orders a dish with SPECIFIC CHOICES from a set of options. The player must READ the order card and select the correct options.

**How it works:**
- The order card displays the exact build: e.g., "Nasi Lemak: Coconut rice → EXTRA sambal → Ayam goreng → Ikan bilis → NO timun → Add papadom"
- At each step, the ingredient grid shows 2-4 OPTIONS (not just one correct answer)
- The player must tap the EXACT ingredient/modifier shown on the order card
- Keywords that change the recipe:
  - **"EXTRA"** — tap the ingredient TWICE
  - **"NO"** — SKIP that ingredient (tap a "Skip/Next" button instead)
  - **"Add [extra item]"** — tap an additional ingredient not in the base recipe
  - **"Kurang [less]"** — tap a "Less" variant of the ingredient
- Wrong selection = mistake (red flash), correct = advance (green flash)

**This prevents autopilot.** Even for the same dish, every order is different. Players must READ every order card carefully.

---

### Order card detail (what the player reads)

Each order card in the queue shows:
- Dish emoji + name
- Cooking type icon: ⚡ (Instant) / 🔥 (Cook) / 📋 (Custom)
- **Recipe strip**: A condensed row of small emoji showing the EXACT ingredient sequence for this specific order (including EXTRA/NO modifiers)
- Patience bar (green → yellow → red)
- Special badges: ⭐ VIP / 👥 Double / 😤 Impatient

When tapped/selected, the order card EXPANDS in the prep area showing the full recipe in large readable format with each step numbered.

---

### Holding stations (strategic pre-prep)

**2 holding station slots** shown above the cooking slots:

```
┌─────────────────────────────────┐
│  HOLDING STATIONS               │
│  [1: 🍵 Teh Tarik ▓▓▓▓▓░░]    │
│  [2: Empty — tap to prep]       │
└─────────────────────────────────┘
```

- The player can TAP an empty holding station slot to open a mini-menu of their current level's Instant Serve dishes
- They prep the dish (tap ingredients) and it sits in the holding station with a FRESHNESS bar (30 seconds)
- When a matching order appears in the queue, a "AUTO-SERVE" button flashes on the order card — one tap serves it instantly from the holding station
- If freshness expires: dish is wasted (greyed out, must trash)
- **Strategic value**: Pre-prep Teh Tariks during calm moments so you can auto-serve them during rushes, freeing time for complex dishes

**Holding station upgrades** (via Shop):
- Base: 2 holding slots
- Upgrade 1: 3 holding slots
- Upgrade 2: Freshness lasts 45 seconds instead of 30
- Upgrade 3: Freshness lasts 60 seconds

---

### Menu selection — before each level (`PRE_LEVEL` screen addition)

Before each level, the player CHOOSES which dishes to bring. This is a core strategy layer.

**Rules:**
- Pick **4 to 6 dishes** from your unlocked pool (depends on level — early levels allow 4, later levels require 6)
- Must include at least 1 Instant Serve dish (for holding stations and combo maintenance)
- Some levels have a **required dish** that must be in your menu (shown with a lock icon)
- Higher-tier dishes = more points per serve but harder to execute
- Menu diversity bonus: +10% RM if your menu spans 3+ tiers

**Menu select UI** (part of PRE_LEVEL screen):
- Grid of all unlocked dishes, grouped by tier
- Each dish tile shows: emoji, name, cooking type icon (⚡/🔥/📋), difficulty stars, base points
- Tap to toggle selection (yellow border = selected)
- Counter shows "4/6 dishes selected"
- "CONFIRM MENU" button → proceed to countdown

---

### Rush events (mid-level intensity spikes)

During a level, 1-3 **RUSH** events occur at random intervals:

- HUD flashes "🔥 RUSH HOUR! 🔥" in red
- For 15-20 seconds: order spawn rate DOUBLES
- Rush music plays (tempo increase in background beat)
- After rush ends: brief 5-second calm (slower spawns) to recover

Rush events per level:
- Levels 1-3: 1 rush event
- Levels 4-7: 2 rush events
- Levels 8-12: 3 rush events

---

### Trash mechanic

A small 🗑️ button on the prep area lets the player TRASH a dish in progress:
- Tapping it discards the current prep (resets the prep area)
- Useful when: you started the wrong order, a cook timer is about to burn and you'd rather cut your losses, or you need to switch to a more urgent order
- Trashing does NOT count as an expired order (no patience penalty) but does reset combo
- Trashed cooking slot dishes free up the slot

---

### Kitchen hazards & maintenance — the truck breaks down

The food truck is a beat-up old machine. Equipment randomly malfunctions mid-level, forcing the player to choose: fix it now (lose time) or work around it (lose capability). This is the final multi-tasking layer — you're juggling orders, cook timers, holding stations, AND a truck that fights back.

#### Hazard types (7 total, introduced progressively)

| # | Hazard | Icon | What breaks | Effect while broken | Fix action | Introduced |
|---|--------|------|-------------|---------------------|------------|------------|
| 1 | Burner Jam | 🔧 | One cooking slot | Slot is locked — cannot start cooking. Dishes already cooking in OTHER slots continue normally. | 3-tap wrench sequence: 🔧→🔩→✅ | Level 2 |
| 2 | Fridge Door | 🧊 | Holding stations | ALL holding station freshness timers drain 3× faster. Food spoils rapidly. | 3-tap fix: 🧊→🔧→✅ (slam the door shut) | Level 3 |
| 3 | Gas Leak | 💨 | All cooking slots | Cook timers run at 1.5× speed — dishes burn faster. PERFECT zone shrinks. | 4-tap fix: 💨→🔧→🔩→✅ | Level 5 |
| 4 | Spill | 💧 | Prep station | Ingredient buttons become slippery — tapping a button has a 25% chance of registering the ADJACENT button instead (random misfire). | 3-tap fix: 💧→🧹→✅ | Level 6 |
| 5 | Power Flicker | ⚡ | HUD display | Score and combo counter DISAPPEAR — player flies blind for 10 seconds. Timer and orders still visible. | Auto-resolves after 10s OR 2-tap fix: ⚡→🔧 | Level 8 |
| 6 | Pest Alert | 🐀 | One order queue | Rats! One entire order queue (left or right) is BLOCKED — no new orders appear on that side, existing orders' patience drains 2× faster. | 4-tap fix: 🐀→🧹→🧹→✅ | Level 9 |
| 7 | Engine Stall | 🚚 | Everything | ALL timers FREEZE for 3 seconds (dramatic stall sound), then resume at 1.3× speed for 15 seconds. Cannot be fixed — you ride it out. | No fix — endure it | Level 11 |

#### Hazard spawn rules
- **Frequency**: Hazards spawn via a separate interval timer, independent of order spawns
- **Base interval**: One hazard every 25-40 seconds (randomised)
- **Scaling**: Later levels reduce the interval (Level 12: every 15-25 seconds)
- **Cap**: Maximum 2 active hazards at once (never 3 — that would be unfair)
- **Grace period**: No hazards in the first 15 seconds of a level, or during the 3-2-1 countdown
- **Rush interaction**: Hazards CAN spawn during Rush events (this is intentional — it's chaos)
- **Level 1**: No hazards at all (tutorial-safe)

#### Hazard UI — how it appears on screen

When a hazard triggers:
1. **Alert flash**: A large hazard icon + name flashes centre-screen for 1 second ("🔧 BURNER JAM!") with a warning sound
2. **Affected area visual**: The broken element gets a red pulsing border and a semi-transparent red overlay (e.g., cooking slot gets a red "X" overlay)
3. **Fix button**: A flashing "🔧 FIX" button appears ON the broken element. Tapping it opens the fix sequence.
4. **Fix sequence**: A mini Instant-Serve-style tap sequence appears as an overlay in the centre of the screen (does NOT pause the game — orders and cook timers keep running while you fix). Large tap targets (80×80px each). Each correct tap plays a wrench-click sound. Final tap plays a satisfying "clank + ding" repair complete sound.
5. **Fixed feedback**: Green flash on the repaired element, "FIXED! ✅" floating text, element returns to normal.

#### Strategic decisions hazards create:
- **Fix now vs fix later**: Fixing takes 2-4 taps and ~2 seconds. During that time, you can't prep dishes. Is it worth fixing NOW or can you survive without that cooking slot for a few more seconds while you finish a VIP order?
- **Fridge door during rush**: If holding stations are spoiling fast, do you fix the fridge or manually serve the orders instead?
- **Gas leak with Tier 5 dishes**: Cook timers are already 10-12 seconds. At 1.5× speed, the PERFECT zone shrinks dramatically — fix immediately or risk burning a 200pt dish?
- **Spill + Custom Order**: A 25% misfire on custom order choices is devastating — almost guaranteed mistakes. Fix the spill before touching any custom orders.

#### Hazard + truck upgrade synergy

The "Truck Reliability" upgrade (see Shop upgrades below) reduces hazard frequency. This creates a meaningful progression arc: early levels feel chaotic and janky, but as you invest in your truck, it becomes a well-oiled machine.

Additionally, specific upgrades interact with hazards:
- **Extra Burner** upgrade: If you have 4-5 cooking slots, losing one to a Burner Jam is less devastating
- **Holding Station+** upgrade: Longer freshness means Fridge Door hazards are less punishing
- **Precision Chef** upgrade: Wider PERFECT zone means Gas Leak is more survivable

---

### Pause overlay
Triggered by pause button. Dims game, shows overlay with:
- "PAUSED" title
- "Resume" button
- "Quit to Menu" button (warns: "Progress for this level will be lost")
- Game timer stops while paused. Cooking timers, patience timers, hazard timers, and rush timers ALL freeze. Active hazards remain on screen but their effects are suspended.

---

## Dish definitions — 55 Malaysian dishes

Each dish object: `{ id, name, emoji, category, tier (1-5), cookType ('instant'|'cook'|'custom'), prepSteps (array), cookTime (seconds, for cook type), customSlots (array of choice arrays, for custom type), basePoints, basePatienceSeconds, unlockCost }`

### Cooking type assignment rules:
- **Instant (⚡)**: All Tier 1 drinks and simple snacks. Tap sequence → serve.
- **Cook & Serve (🔥)**: Dishes that involve grilling, frying, boiling, or steaming. Short prep → timer → pull.
- **Custom Order (📋)**: Assembly dishes where the customer picks specific toppings/sides/variants. Read the order card carefully.

Some dishes are DUAL-TYPE: they have a cook phase AND custom choices (e.g., Nasi Goreng has custom toppings AND requires wok cooking). For dual-type, the player does custom assembly first, then starts the cook timer.

### TIER 1 — Drinks & Simple Snacks (⚡ Instant, unlocked from start)
| # | Name | Emoji | Type | Prep steps | Pts | Patience |
|---|------|-------|------|------------|-----|----------|
| 1 | Teh Tarik | 🍵 | ⚡ | ☕ Tea → 🥛 Condensed milk → 👋 Pull | 60 | 15s |
| 2 | Kopi O | ☕ | ⚡ | ☕ Coffee → 🫗 Hot water → 🥄 Stir | 60 | 15s |
| 3 | Milo Dinosaur | 🥤 | ⚡ | 🥛 Milo → 🧊 Ice → 🥛 Milk → 🍫 Milo powder | 70 | 16s |
| 4 | Teh O Ais | 🧊 | ⚡ | ☕ Tea → 🍬 Sugar → 🧊 Ice | 60 | 15s |
| 5 | Air Bandung | 🌸 | ⚡ | 🌹 Rose syrup → 🥛 Condensed milk → 🧊 Ice | 60 | 15s |
| 6 | Sirap Limau | 🍹 | ⚡ | 🌹 Rose syrup → 🍋 Lime → 🧊 Ice → 🫗 Water | 65 | 15s |
| 7 | Pisang Goreng | 🍌 | ⚡ | 🍌 Banana → 🫙 Batter → 🔥 Fry | 70 | 16s |
| 8 | Keropok Lekor | 🐟 | ⚡ | 🐟 Fish paste → 🫙 Shape → 🔥 Fry | 70 | 16s |
| 9 | Cucur Udang | 🦐 | ⚡ | 🦐 Prawns → 🫙 Batter → 🧅 Onions → 🔥 Fry | 75 | 17s |
| 10 | Onde-Onde | 🟢 | ⚡ | 🥥 Pandan dough → 🍬 Gula melaka → 🫕 Boil → 🥥 Coconut | 75 | 17s |
| 11 | Kuih Koci | 🟩 | ⚡ | 🥥 Glutinous dough → 🥥 Coconut fill → 🌿 Banana leaf → 🫕 Steam | 75 | 17s |

**Tier 1 custom order variants** (for drinks, applied when Custom Order modifier is active):
- Sweetness: default / kurang manis (less sweet) / extra manis → player taps 🥛 once (default), skips 🥛 (kurang), or taps 🥛 twice (extra)
- Ice: default / no ice / extra ice → tap 🧊 zero, once, or twice
- These are shown on the order card as modifiers: "Teh Tarik — Kurang Manis, No Ice"

### TIER 2 — Street Staples (🔥 Cook & Serve, unlock: RM 500)
| # | Name | Emoji | Type | Prep steps | Cook time | Pts | Patience |
|---|------|-------|------|------------|-----------|-----|----------|
| 12 | Roti Canai | 🫓 | 🔥 | 🫓 Dough → 🧈 Ghee → ✋ Flatten | 5s | 100 | 22s |
| 13 | Nasi Lemak | 🍚 | 📋🔥 | (custom assembly + cook) | 4s | 100 | 22s |
| 14 | Apam Balik | 🥞 | 🔥 | 🫙 Batter → 🥜 Peanuts → 🌽 Corn | 5s | 100 | 22s |
| 15 | Karipap | 🥟 | 🔥 | 🫓 Pastry → 🥔 Curry fill → ➡️ Fold → 🔒 Crimp | 5s | 105 | 22s |
| 16 | Cakoi | 🥖 | 🔥 | 🫙 Dough → 🫙 Shape | 4s | 90 | 20s |
| 17 | Popiah | 🌯 | 📋 | (custom — see below) | — | 105 | 22s |
| 18 | Rojak | 🥗 | 📋 | (custom — see below) | — | 100 | 22s |
| 19 | Cendol | 🍧 | ⚡ | 🧊 Ice → 🟢 Pandan jelly → 🥥 Coconut milk → 🍬 Gula melaka → 🫘 Red beans | 100 | 20s |
| 20 | Ais Kacang | 🍨 | 📋 | (custom — see below) | — | 100 | 22s |
| 21 | Kuih Lapis | 🟫 | 🔥 | 🥥 Coconut milk → 🍚 Rice flour → 🎨 Layer | 6s | 110 | 23s |

**Tier 2 Custom Order recipes:**

**Nasi Lemak (📋🔥)** — Customer picks protein + extras:
- Base: 🍚 Coconut rice (always)
- Sambal: 🌶️ Standard / 🌶️🌶️ Extra pedas / ❌ No sambal
- Protein (PICK ONE): 🥚 Fried egg / 🍗 Ayam goreng / 🦑 Sambal sotong / 🍖 Rendang
- Sides (PICK 1-2): 🐟 Ikan bilis / 🥒 Timun / 🥜 Peanuts / 🫓 Papadom
- Then cook (4s steam)

**Popiah (📋)** — Customer picks fillings:
- Base: 🫓 Wrapper → 🫙 Sweet sauce (always)
- Fillings (PICK 2-3): 🥬 Jicama / 🥚 Egg / 🦐 Prawns / 🫘 Bean sprouts / 🥕 Carrot
- Finish: ➡️ Roll (always)

**Rojak (📋)** — Customer picks fruit/veg combo:
- Pick 3-4 from: 🥒 Cucumber / 🍍 Pineapple / 🥭 Mango / 🫘 Bean sprouts / 🌰 Cakoi bits / 🥜 Peanuts
- Always finish: 🫙 Rojak sauce

**Ais Kacang (📋)** — Customer picks toppings:
- Base: 🧊 Shaved ice (always)
- Pick 3-4 from: 🫘 Red beans / 🌽 Corn / 🟢 Cendol jelly / 🍬 Attap chee / 🥥 Coconut milk / 🌹 Rose syrup / 🍫 Chocolate syrup
- Always finish: 🥛 Evaporated milk top

### TIER 3 — Hawker Mains (🔥📋 Cook + Custom, unlock: RM 1500)
| # | Name | Emoji | Type | Prep steps + custom | Cook time | Pts | Patience |
|---|------|-------|------|---------------------|-----------|-----|----------|
| 22 | Char Kuey Teow | 🍜 | 🔥📋 | Custom protein/spice → cook | 7s | 140 | 25s |
| 23 | Mee Goreng | 🍝 | 🔥📋 | Custom toppings → cook | 7s | 130 | 24s |
| 24 | Nasi Goreng | 🍛 | 🔥📋 | Custom protein/spice → cook | 7s | 130 | 24s |
| 25 | Satay | 🍢 | 🔥 | 🥩 Thread → 🫙 Marinade → (choose meat) | 8s | 140 | 26s |
| 26 | Mee Rebus | 🍜 | 🔥📋 | Custom toppings → cook | 7s | 135 | 25s |
| 27 | Mee Hoon Soup | 🥣 | 🔥 | 🍜 Mee hoon → 🍗 Chicken → 🥬 Veg | 6s | 120 | 23s |
| 28 | Roti John | 🥖 | 🔥 | 🥖 Bread → 🥩 Meat → 🥚 Egg → 🧅 Onion | 7s | 140 | 25s |
| 29 | Murtabak | 🫓 | 🔥📋 | Custom filling → fold → cook | 8s | 140 | 26s |
| 30 | Nasi Goreng Pattaya | 🍳 | 🔥 | 🍚 Fried rice → 🥚 Egg wrap → ➡️ Wrap | 7s | 135 | 25s |
| 31 | Lok Lok | 🍢 | 📋🔥 | Pick 3-4 skewers → boil | 5s | 130 | 24s |
| 32 | Otak-Otak | 🐟 | 🔥 | 🐟 Fish paste → 🌶️ Spice → 🌿 Wrap | 8s | 130 | 25s |
| 33 | Yong Tau Foo | 🥬 | 📋🔥 | Pick 3-4 items → blanch | 5s | 135 | 25s |

**Tier 3 Custom Order recipes:**

**Char Kuey Teow (🔥📋):**
- Base: 🍜 Flat noodles (always)
- Heat: 🔥 Standard / 🔥🔥 Extra wok hei
- Protein (PICK 1-2): 🦐 Prawns / 🦑 Sotong / 🥚 Egg / 🫘 Bean sprouts / 🐚 Cockles
- Spice: Standard / 🌶️ Extra pedas / ❌ No chilli
- Cook 7s

**Nasi Goreng (🔥📋):**
- Base: 🍚 Rice → 🔥 Wok (always)
- Protein (PICK 1): 🥚 Telur mata / 🍗 Ayam / 🦐 Udang / 🥩 Daging
- Sauce: 🫙 Kicap manis / 🌶️ Sambal / 🫙 Belacan
- Extra: 🧅 Garnish / 🥒 Timun / 🍋 Lime / ❌ None
- Cook 7s

**Murtabak (🔥📋):**
- Dough: 🫓 (always)
- Filling: 🥩 Mutton / 🍗 Chicken / 🧀 Cheese / 🥩+🧀 Mutton cheese
- Extras: 🧅 Extra onion / 🥚 Extra egg / Standard
- Fold + Cook 8s

**Lok Lok (📋🔥):**
- Pick 3-4 skewers from: 🦐 Prawn / 🥩 Beef ball / 🐟 Fish cake / 🥬 Kangkung / 🫘 Tofu / 🦑 Sotong / 🌽 Corn / 🥚 Quail egg
- Boil 5s
- Sauce (PICK 1): 🥜 Satay / 🌶️ Chilli / 🫙 Sweet chilli

**Yong Tau Foo (📋🔥):**
- Pick 3-4 items from: 🥬 Bitter gourd / 🫘 Tofu puff / 🌶️ Chilli (stuffed) / 🍆 Brinjal / 🥦 Lady finger / 🐟 Fish ball
- Blanch 5s
- Serve style (PICK 1): 🥣 Soup / 🔥 Dry with sauce

### TIER 4 — Signature Dishes (🔥📋 complex, unlock: RM 3000)
| # | Name | Emoji | Type | Cook time | Pts | Patience |
|---|------|-------|------|-----------|-----|----------|
| 34 | Asam Laksa | 🍜 | 📋🔥 | 9s | 170 | 28s |
| 35 | Curry Laksa | 🍜 | 📋🔥 | 9s | 170 | 28s |
| 36 | Rendang | 🍖 | 🔥 | 11s | 180 | 30s |
| 37 | Nasi Kandar | 🍛 | 📋 | — | 180 | 28s |
| 38 | Ayam Percik | 🍗 | 🔥 | 10s | 175 | 28s |
| 39 | Claypot Chicken Rice | 🍚 | 🔥 | 11s | 175 | 30s |
| 40 | Bak Kut Teh | 🍖 | 🔥📋 | 10s | 170 | 28s |
| 41 | Hokkien Mee | 🍜 | 🔥📋 | 9s | 175 | 28s |
| 42 | Pan Mee | 🍜 | 🔥📋 | 8s | 170 | 27s |
| 43 | Prawn Mee | 🦐 | 🔥📋 | 9s | 175 | 28s |
| 44 | Ikan Bakar | 🐟 | 🔥📋 | 11s | 180 | 30s |

**Tier 4 Custom Order recipes:**

**Asam Laksa (📋🔥):**
- Base: 🍜 Thick noodles + 🥣 Tamarind broth (always)
- Fish: 🐟 Standard mackerel / 🐟🐟 Extra fish
- Toppings (PICK 2-3): 🧅 Onion / 🌿 Mint / 🍍 Pineapple / 🌸 Torch ginger / 🌶️ Chilli paste / 🥒 Cucumber
- Shrimp paste: ✅ With / ❌ Without
- Cook 9s

**Nasi Kandar (📋)** — pure custom assembly, no cooking:
- Base: 🍚 Rice (always)
- Protein (PICK 1-2): 🍗 Fried chicken / 🐟 Fried fish / 🦐 Prawn / 🥚 Telur bungkus / 🍖 Mutton
- Kuah (PICK 1-2): 🥣 Kuah campur / 🍛 Dalca / 🫙 Fish curry / 🥣 Dhal
- Sides (PICK 1-2): 🥬 Okra / 🌶️ Acar / 🥒 Timun / 🫘 Kacang buncis
- Pour kuah over rice (final step — always)

**Ikan Bakar (🔥📋):**
- Fish type: 🐟 Stingray / 🐟 Tilapia / 🦐 Prawn (large)
- Sambal: 🌶️ Standard / 🌶️🌶️ Extra pedas / 🫙 Kicap
- Cook 11s (grill)
- Sides: 🍋 Lime / 🥒 Ulam / 🧅 Onion

### TIER 5 — Chef Specials (🔥📋 max complexity, unlock: RM 5000)
| # | Name | Emoji | Type | Cook time | Pts | Patience |
|---|------|-------|------|-----------|-----|----------|
| 45 | Nasi Biryani | 🍛 | 🔥📋 | 12s | 200 | 32s |
| 46 | Nasi Kerabu | 🍚 | 📋 | — | 200 | 30s |
| 47 | Nasi Dagang | 🍚 | 🔥📋 | 10s | 200 | 30s |
| 48 | Sup Tulang | 🦴 | 🔥📋 | 11s | 210 | 32s |
| 49 | Roti Tissue | 🫓 | 🔥 | 8s | 190 | 28s |
| 50 | Laksa Johor | 🍝 | 🔥📋 | 10s | 200 | 30s |
| 51 | Lontong | 🍚 | 📋🔥 | 9s | 200 | 30s |
| 52 | Kambing Soup | 🐐 | 🔥📋 | 11s | 200 | 32s |
| 53 | Sambal Petai Udang | 🦐 | 🔥📋 | 10s | 210 | 30s |
| 54 | Bubur Cha Cha | 🍠 | 🔥📋 | 9s | 190 | 28s |
| 55 | Ayam Goreng Berempah | 🍗 | 🔥 | 12s | 200 | 30s |

**Tier 5 has the most custom order combinations.** Each dish should have 4-6 choice points with 2-4 options each. Generate these following the same pattern as Tier 3-4: base always → customer picks protein/toppings/spice level/sides → cook if applicable.

### Implementation rule for all custom orders:
When spawning an order for a 📋 dish, the game randomly generates a SPECIFIC build by picking one option per choice slot. This build is stored in the order object and displayed on the order card as a sequence of emoji. The ingredient buttons shown in the prep area MUST include ALL possible options for each slot (not just the correct one), so the player has to READ the order card and pick correctly. Wrong picks = mistake.

---

## Upgrade / Unlock Economy

### Currency: Ringgit (RM)
- Earned from every dish served: `dish.basePoints × 0.5 = RM earned` (e.g., 100pt dish = RM 50)
- Perfect dish bonus: +50% RM (so RM 75 for a 100pt dish)
- Level completion bonus: RM 200 (Bronze), RM 400 (Silver), RM 600 (Gold)
- RM persists across sessions via auto-save

### Shop screen (`SHOP`) — accessible from title screen and level select
Layout: scrollable grid of upgrade cards, organised into three tabs:

#### Tab 1: Unlock Dish Tiers
| Item | Cost | Effect |
|------|------|--------|
| Tier 2 Dishes | RM 500 | Unlock Roti Canai, Nasi Lemak, Apam Balik, etc. |
| Tier 3 Dishes | RM 1,500 | Unlock Char Kuey Teow, Satay, Murtabak, etc. |
| Tier 4 Dishes | RM 3,000 | Unlock Asam Laksa, Rendang, Nasi Kandar, etc. |
| Tier 5 Dishes | RM 5,000 | Unlock Nasi Biryani, Sup Tulang, Laksa Johor, etc. |

When a tier is unlocked, ALL dishes in that tier become available in eligible levels.

#### Tab 2: Truck Upgrades (each has 3 levels)
| Upgrade | Lvl 1 cost | Lvl 2 cost | Lvl 3 cost | Effect per level |
|---------|-----------|-----------|-----------|-----------------|
| 🔥 Extra Burner | RM 400 | RM 800 | RM 1,200 | +1 cooking slot per level (base 2 → 3 → 4 → 5) |
| 🍳 Holding Station+ | RM 300 | RM 600 | RM 1,000 | Lvl 1: 3 slots (base 2), Lvl 2: freshness 45s (base 30s), Lvl 3: freshness 60s |
| ⏱️ Patient Customers | RM 300 | RM 600 | RM 1,000 | +10% patience time per level |
| 💰 Tip Jar | RM 500 | RM 1,000 | RM 1,500 | +15% RM earned per level |
| ⭐ Crowd Pleaser | RM 500 | RM 1,000 | RM 1,500 | Combo max increases: ×3 → ×4 → ×5 → ×6 |
| 🎯 Precision Chef | RM 400 | RM 800 | RM 1,200 | Cook timer PERFECT zone widens: 25% → 30% → 35% → 40% of cook time |
| 🔧 Truck Reliability | RM 500 | RM 1,000 | RM 2,000 | Reduces hazard frequency: Lvl 1: −20%, Lvl 2: −35%, Lvl 3: −50%. Also reduces fix sequence by 1 tap per level (3-tap fixes become 2-tap at Lvl 1, 1-tap at Lvl 2; 4-tap fixes become 3-tap at Lvl 1, etc.) |

#### Tab 3: Cosmetics (optional stretch goal)
Truck paint colours, plate styles — purely visual. Low priority. Skip for v1 if needed.

### Shop UI design
- Each card shows: icon, name, current level (if upgrade), cost, short description
- Greyed out if insufficient RM
- Tap to buy → confirmation → RM deducted → card updates to show new level
- Current RM balance shown prominently at top of shop screen
- "Back" button returns to previous screen

---

## Level configuration — 12 Routes across Malaysia

Each level defines: which dish tiers are available, duration, spawn rate, difficulty modifiers, and unlock condition.

| Level | Location | Duration | Available tiers | Spawn interval | Unlock condition |
|-------|----------|----------|----------------|----------------|-----------------|
| 1 | Subang Jaya — Morning Market | 90s | Tier 1 only | 5-7s | Always unlocked |
| 2 | Petaling Jaya — Office Lunch | 90s | Tier 1-2 | 4.5-6.5s | Complete Level 1 |
| 3 | KL Sentral — Train Station Rush | 100s | Tier 1-2 | 4-6s | Complete Level 2 |
| 4 | Bangsar — Night Market | 100s | Tier 1-3 | 4-5.5s | Complete Level 3 + Tier 3 unlocked |
| 5 | Penang — Gurney Drive | 110s | Tier 1-3 | 3.5-5s | Complete Level 4 |
| 6 | Ipoh — Old Town | 110s | Tier 1-3 | 3.5-5s | Complete Level 5 |
| 7 | Malacca — Jonker Street | 120s | Tier 1-4 | 3-4.5s | Complete Level 6 + Tier 4 unlocked |
| 8 | Kuching — Waterfront | 120s | Tier 1-4 | 3-4.5s | Complete Level 7 |
| 9 | Kota Bharu — Pasar Siti Khadijah | 120s | Tier 1-4 | 2.5-4s | Complete Level 8 |
| 10 | Langkawi — Beach Festival | 130s | Tier 1-5 | 2.5-4s | Complete Level 9 + Tier 5 unlocked |
| 11 | KLCC — Food Festival | 140s | All tiers | 2-3.5s | Complete Level 10 |
| 12 | Putrajaya — Jemputan Perdana | 150s | All tiers | 1.5-3s | Gold medal on all previous levels |

### Difficulty modifiers per level
Each level can apply one or more modifiers that the player sees before starting:

| Modifier | Icon | Effect | Applied from |
|----------|------|--------|-------------|
| Impatient Crowd | 😤 | Patience −20% | Level 4+ |
| Lunch Rush | 🏃 | Spawn rate +25% faster | Level 5+ |
| Picky Eater | 🤔 | 30% of orders are custom-varied (otherwise 15%) | Level 6+ |
| Double Order | 👥 | 20% chance an order requires cooking the dish TWICE | Level 8+ |
| VIP Customer | ⭐ | 1 VIP order per level — 2× points but half patience | Level 7+ |
| Festival Frenzy | 🎉 | All modifiers + all hazards active, max frequency | Level 12 only |

### Kitchen hazards per level
Hazards are introduced gradually alongside difficulty modifiers:

| Level | New hazards introduced | Max concurrent | Hazard interval |
|-------|----------------------|----------------|-----------------|
| 1 | None | 0 | — |
| 2 | 🔧 Burner Jam | 1 | 35-45s |
| 3 | 🧊 Fridge Door | 1 | 30-40s |
| 4 | (no new) | 1 | 28-38s |
| 5 | 💨 Gas Leak | 1 | 26-36s |
| 6 | 💧 Spill | 2 | 24-34s |
| 7 | (no new) | 2 | 22-32s |
| 8 | ⚡ Power Flicker | 2 | 20-30s |
| 9 | 🐀 Pest Alert | 2 | 18-28s |
| 10 | (no new) | 2 | 16-26s |
| 11 | 🚚 Engine Stall | 2 | 15-25s |
| 12 | All hazards, max frequency | 2 | 12-20s |

Modifiers and hazards are shown on the pre-level screen so the player knows what's coming. The player sees: "ROUTE 7: Malacca — Jonker Street" + modifier badges + hazard warning icons + medal targets + "START" button.

### Medal thresholds
Calculate dynamically per level: `threshold = basePts × expectedDishCount × multiplier`
- Bronze: 35% of estimated max score
- Silver: 60% of estimated max score  
- Gold: 85% of estimated max score
- Display the threshold numbers on the pre-level screen so the player knows the targets

---

## Scoring system

- **Perfect dish** (no mistakes): `basePoints × comboMultiplier`
- **Dish with mistakes**: `basePoints × 0.5` (combo resets)
- **Combo multiplier**: starts at ×1. Each consecutive perfect dish: ×1 → ×1.5 → ×2 → ×2.5 → ×3 (max, upgradable via Crowd Pleaser). Any mistake or expired order resets to ×1.
- **Expired order**: −50 points, combo resets
- **VIP order bonus**: 2× base points if served perfectly
- **Double order bonus**: 1.5× base points for completing both servings
- **Level complete bonus**: RM 200 (any completion), RM 400 (Silver), RM 600 (Gold)
- **No-expire bonus**: +200 points if zero expired orders in the level

### RM earnings per dish
`RM earned = (basePoints × 0.5) × (1 + tipJarBonus)`
- Perfect bonus: +50% RM
- Accumulated RM shown in HUD during gameplay (small counter next to score)

---

## Screen 5: Level complete (`LEVEL_COMPLETE`)

Overlay/screen showing:
1. "ROUTE COMPLETE!" — Fredoka 40px, yellow
2. Location name + modifier badges + hazard icons that were active
3. Final score — large animated counter (count up from 0)
4. RM earned — animated counter below score (gold colour, with RM prefix)
5. Stats grid:
   - Dishes served | Perfect dishes | Overcooked | Mistakes | Expired orders
   - Hazards fixed | Dishes burnt | Holding station auto-serves
6. Medal earned (large emoji, bounce-in animation). If new best, show "NEW BEST!" flash
7. Star rating (★★★)
8. Buttons: "Next Route →" (if next level unlocked) | "Retry 🔄" | "Shop 🛒" | "Menu 🏠"

---

## Game logic implementation details

### Core multi-tasking loop
The player should ALWAYS have something to do. The game loop simultaneously tracks:
1. Order patience timers (multiple orders counting down)
2. Cooking slot timers (1-3 dishes cooking)
3. Holding station freshness timers (1-3 pre-prepped dishes expiring)
4. Level timer (overall countdown)
5. Active prep (the dish currently being assembled)

### Order spawning
- `setInterval` with the level's spawn interval + random jitter (±20%)
- Randomly pick a dish from the player's SELECTED MENU (not all unlocked dishes)
- For 📋 (Custom) dishes: generate random build by picking one option per choice slot. Store this as `order.customBuild` array
- Create order object: `{ id, dish, cookType, customBuild (if applicable), patience, startTime, mistakes: 0, isVIP: false, isDouble: false }`
- Apply modifier badges (VIP, Double, Impatient) based on level config and probability
- Add to the first available queue slot (left first, then right)
- If all slots full, skip this spawn

### Patience timer
- Each order has a patience bar depleting in real-time via `requestAnimationFrame`
- Bar colour: green (>60%), yellow (30-60%), red (<30%), flashing red (<10%)
- At 0%: order expires — shake animation, angry emoji flash (😡), penalty applied
- VIP orders: patience is halved but points are doubled

### Cooking station logic
```
cookingSlots = [] // max 2 (upgradable to 3)

startCooking(order, prepResult):
  if cookingSlots.length >= maxSlots:
    show "All slots full!" warning
    return
  slot = { order, startTime: now, cookDuration: dish.cookTime, state: 'cooking' }
  cookingSlots.push(slot)
  // Player is now FREE to work on other orders

// In game loop, update each slot every frame:
updateCookingSlots():
  for each slot in cookingSlots:
    elapsed = now - slot.startTime
    progress = elapsed / (slot.cookDuration * 1000)
    
    if progress < 0.60:
      slot.state = 'raw'          // grey bar, "Cooking..." label
    else if progress < 0.85:
      slot.state = 'perfect'      // GREEN/GOLD bar, "PULL!" button pulses
    else if progress < 0.95:
      slot.state = 'overcooked'   // ORANGE bar, "Overcooked!" warning
    else:
      slot.state = 'burnt'        // RED bar, smoke effect, auto-trash
      trashCookingSlot(slot)      // order is lost, penalty

pullFromCooking(slotIndex):
  slot = cookingSlots[slotIndex]
  if slot.state === 'raw':
    show "Not ready yet!" feedback
    return
  if slot.state === 'perfect':
    serveOrder(slot.order, perfectBonus: true)
  if slot.state === 'overcooked':
    serveOrder(slot.order, perfectBonus: false, overcookPenalty: 0.7)
  cookingSlots.splice(slotIndex, 1)
```

### Cooking slot UI update
Each cooking slot at the bottom of the screen shows:
- Dish emoji + name
- Animated progress bar (grey → green → orange → red)
- State label: "Cooking..." → "PULL!" (pulsing gold) → "Overcooked!" → "BURNT!"
- Tappable: player taps the slot to pull the dish
- If burnt: slot shows smoke particles, auto-clears after 1 second

### Prep station logic — handles all 3 cooking types

```
onOrderTapped(order):
  activeOrder = order
  if order.cookType === 'instant':
    showIngredientGrid(order.dish.prepSteps)
    // Player taps in sequence → SERVE button appears
  
  if order.cookType === 'cook':
    showIngredientGrid(order.dish.prepSteps)
    // Player taps prep steps → then "START COOKING" button → moves to cooking slot
  
  if order.cookType === 'custom':
    showCustomOrderCard(order.customBuild)
    showChoiceGrid(currentChoiceSlot)
    // Player makes choices → after all choices → SERVE or START COOKING
  
  if order.cookType === 'custom+cook':
    // Custom choices first, then start cooking
    showCustomOrderCard(order.customBuild)
    showChoiceGrid(currentChoiceSlot)
    // After all choices → "START COOKING" button → moves to cooking slot

onIngredientTapped(ingredientId):
  if order.cookType === 'instant' || order.cookType === 'cook':
    // Same as before: check sequence
    if ingredientId === currentStep.expected:
      advance()
    else:
      mistake()
  
  if order.cookType === 'custom' || order.cookType === 'custom+cook':
    // Check against customBuild for current choice slot
    if ingredientId === order.customBuild[currentChoiceIndex]:
      advanceChoice()
    else:
      mistake()
      // Do NOT advance — player must try again (or skip if it's a NO/skip modifier)
```

### Custom order choice UI
When a custom order is active, the prep area shows:
- **Top**: The full order card with all choices listed (scrollable if long)
- **Current step highlight**: The step being assembled is highlighted with a yellow border
- **Choice buttons**: 2-4 large buttons showing the available options for this step
- **EXTRA modifier**: If the order says "EXTRA [item]", the player must tap that item TWICE. The first tap shows "1/2", second shows "✓"
- **NO modifier**: If the order says "NO [item]", a "SKIP ⏭" button appears alongside the ingredients. Player must tap SKIP instead of any ingredient.
- **After all choices**: show SERVE (for pure custom) or START COOKING (for custom+cook)

### Holding station logic
```
holdingSlots = [] // max 2 (upgradable to 3)

onHoldingSlotTapped(slotIndex):
  if holdingSlots[slotIndex] is empty:
    // Show mini-menu of Instant Serve dishes from current level menu
    showHoldingPrepMenu()
  if holdingSlots[slotIndex] is occupied:
    // Show held dish info (can trash with 🗑️ button)

onHoldingDishPrepped(dishId):
  holdingSlots[slotIndex] = { dish: dishId, freshness: 30, startTime: now }

// In game loop:
updateHoldingSlots():
  for each slot in holdingSlots:
    elapsed = now - slot.startTime
    if elapsed > slot.freshness * 1000:
      slot = empty // dish expired, greyed out briefly then cleared

// When an order spawns that matches a holding station dish:
onOrderSpawned(order):
  if order is Instant Serve AND holdingSlots has matching dish:
    // Show "AUTO-SERVE ⚡" button on the order card
    // If player taps it: instantly serve from holding station, one-tap serve
    // Holding slot becomes empty, order is completed
```

### Serving
```
serveOrder(order, options):
  if order.mistakes === 0 AND options.perfectBonus:
    combo++
    score += basePoints × comboMultiplier × (isVIP ? 2 : 1)
    rmEarned += (basePoints × 0.5) × (1 + tipJarBonus) × 1.5 // perfect RM bonus
    show "PERFECT! 🌟" floating text (yellow, animated, with score)
    play perfectChime()
  else if order.mistakes === 0 AND options.overcookPenalty:
    // No mistakes but overcooked
    score += basePoints × options.overcookPenalty
    rmEarned += basePoints × 0.3
    combo = 0 // overcooked breaks combo
    show "Overcooked..." floating text (orange)
  else:
    combo = 0
    score += basePoints × 0.5
    rmEarned += basePoints × 0.2
    show "+[score]" floating text (white, smaller)
  
  remove order from queue
  clear prep station
  play serveChime()
  
  if isDouble:
    // Double order: after first serve, the order reappears with "2/2" badge
    // Player must cook it again. Full bonus only if both servings are perfect.
```

### Rush event logic
```
// Schedule rush events at random intervals during the level
scheduleRushEvents(levelConfig):
  for i in range(levelConfig.rushCount):
    randomTime = random between 20% and 80% of level duration
    setTimeout(() => startRush(), randomTime)

startRush():
  isRushing = true
  showRushBanner() // "🔥 RUSH HOUR! 🔥" flashing red banner
  originalSpawnRate = currentSpawnRate
  currentSpawnRate = originalSpawnRate × 0.5 // 2× faster spawns
  playRushMusic() // faster tempo
  setTimeout(() => endRush(), 15000 + random(5000)) // 15-20s

endRush():
  isRushing = false
  hideRushBanner()
  currentSpawnRate = originalSpawnRate × 1.5 // brief calm period
  setTimeout(() => { currentSpawnRate = originalSpawnRate }, 5000) // 5s calm
```

### Hazard system logic
```
activeHazards = [] // max 2 concurrent
hazardTimerId = null

// Called at level start (after countdown)
startHazardTimer(levelConfig):
  if levelConfig.level === 1: return // no hazards on level 1
  
  baseInterval = 25000 + random(15000) // 25-40s
  reductionFromUpgrade = [0, 0.20, 0.35, 0.50][upgrades.truckReliability]
  adjustedInterval = baseInterval × (1 - reductionFromUpgrade)
  
  // Apply level scaling (later levels = more frequent)
  levelSpeedFactor = 1 - ((levelConfig.level - 2) × 0.04) // Level 2: 1.0, Level 12: 0.6
  adjustedInterval = adjustedInterval × Math.max(0.4, levelSpeedFactor)
  
  // Schedule first hazard after grace period (15s)
  setTimeout(() => scheduleNextHazard(adjustedInterval), 15000)

scheduleNextHazard(interval):
  hazardTimerId = setTimeout(() => {
    if activeHazards.length < 2 AND gameState === 'PLAYING':
      spawnHazard()
    scheduleNextHazard(interval + random(5000) - 2500) // ±2.5s jitter
  }, interval)

spawnHazard():
  // Pick a hazard type available at this level
  availableHazards = HAZARD_TYPES.filter(h => h.introducedAtLevel <= currentLevel)
  // Don't spawn the same hazard type that's already active
  availableHazards = availableHazards.filter(h => !activeHazards.some(a => a.type === h.type))
  if availableHazards.length === 0: return
  
  hazard = randomPick(availableHazards)
  
  // Calculate fix taps (reduced by Truck Reliability upgrade)
  baseTaps = hazard.fixTaps
  tapReduction = Math.min(baseTaps - 1, upgrades.truckReliability) // never less than 1 tap
  actualTaps = baseTaps - tapReduction
  
  activeHazard = {
    type: hazard.type,
    icon: hazard.icon,
    name: hazard.name,
    fixSequence: generateFixSequence(hazard, actualTaps),
    fixProgress: 0,
    autoResolveTime: hazard.autoResolveTime || null, // only for Power Flicker
    startTime: now
  }
  
  activeHazards.push(activeHazard)
  showHazardAlert(activeHazard) // flash icon + name + warning sound
  applyHazardEffect(activeHazard) // apply the negative effect

onFixButtonTapped(hazardIndex):
  hazard = activeHazards[hazardIndex]
  if hazard.type === 'engineStall': return // can't fix engine stall
  showFixOverlay(hazard) // centre screen, large tap targets

onFixSequenceTap(hazardIndex, tapIndex):
  hazard = activeHazards[hazardIndex]
  if tapIndex === hazard.fixSequence[hazard.fixProgress]:
    hazard.fixProgress++
    playWrenchClick()
    if hazard.fixProgress >= hazard.fixSequence.length:
      // FIXED!
      removeHazardEffect(hazard)
      activeHazards.splice(hazardIndex, 1)
      hideFixOverlay()
      showFloatingText("FIXED! ✅", 'green')
      playRepairComplete()
  else:
    // Wrong tap during fix — small delay penalty (200ms lockout)
    playBuzz()
    showFixError()
```

### Game loop
```
gameLoop (via requestAnimationFrame):
  if gameState !== 'PLAYING': return
  
  update level timer
  update all order patience timers (apply hazard modifiers: Pest Alert 2× drain)
  update all cooking slot timers (apply hazard modifiers: Gas Leak 1.5× speed)
  update all holding station freshness timers (apply hazard modifiers: Fridge Door 3× drain)
  check for burnt cooking slots
  check for expired orders
  check for spoiled holding station dishes
  check for auto-resolving hazards (Power Flicker 10s timer)
  update HUD (score, combo, timer, RM, rush indicator, active hazard icons)
  check if level timer has elapsed → trigger LEVEL_COMPLETE
```

### Scoring feedback — floating text system
Every score event spawns a floating text that rises and fades:
- "PERFECT! 🌟 +140" — large, yellow, with star burst particle effect
- "+70" — medium, white
- "BURNT! 🔥 -50" — medium, red, with smoke
- "EXPIRED 😡 -50" — medium, red
- "COMBO ×3! 🔥" — when combo increases, large orange pulse
- Floating texts stack vertically if multiple fire at once

---

## Audio (Web Audio API — procedural, no external files)

Generate all sounds using OscillatorNode + GainNode. No external audio files.

| Event | Sound | Implementation |
|-------|-------|----------------|
| Correct ingredient | Short rising tone (200→400Hz, 100ms) | Sine wave, quick fade |
| Wrong ingredient | Low buzz (100Hz, 200ms) | Square wave, harsh |
| Dish served (normal) | Pleasant chime (600Hz→800Hz, 200ms) | Sine, quick attack/decay |
| PERFECT serve | Double chime + sparkle (600→800→1000Hz, 100ms each) | Three ascending sine tones |
| Order expired | Descending tone (400→100Hz, 300ms) | Sawtooth, slow decay |
| Combo increase | Ascending two-note (500Hz→700Hz, 100ms each) | Sine, staccato |
| **Cook timer: ready** | Ding-ding bell (800Hz, two short pulses) | Sine, 50ms on, 50ms off, 50ms on |
| **Cook timer: overcooked** | Warning buzz (300Hz, 150ms) | Square wave, medium |
| **Cook timer: BURNT** | Harsh alarm (150Hz + 200Hz, 400ms) | Dual square wave, jarring |
| **Rush event start** | Rising siren (200→600Hz, 500ms) | Sawtooth, dramatic sweep |
| **Rush event end** | Falling siren (600→200Hz, 300ms) | Sawtooth, release |
| **Holding station auto-serve** | Quick pop (1200Hz, 30ms) | Sine, instant |
| **Custom order choice correct** | Soft click + rise (400→500Hz, 80ms) | Sine, subtle |
| Level complete | Ascending arpeggio (C-E-G-C, 100ms each) | Sine, four notes |
| Countdown tick | Click (1000Hz, 50ms) | Sine, very short |
| **Trash dish** | Low thud (80Hz, 100ms) | Sine, quick decay |
| **Hazard alert** | Metallic clang + alarm (300Hz→150Hz, two hits, 100ms each) | Square wave, harsh staccato |
| **Wrench click (fix step)** | Mechanical click (500Hz, 40ms) + ratchet (300Hz, 30ms) | Sine + triangle, crisp |
| **Repair complete** | Satisfying clank + rising ding (200Hz hit → 800Hz chime, 300ms) | Square thud + sine resolve |
| **Engine stall** | Deep rumble dying (80Hz→30Hz, 800ms) | Sawtooth, slow decay with vibrato |
| **Spill splat** | Wet splash (noise burst, 100ms, bandpass 200-400Hz) | White noise through filter |

Create an `AudioManager` class that initialises `AudioContext` on first user interaction (required by Safari autoplay policy). Each sound is a method. Add a global mute toggle (🔊/🔇 button in HUD) that persists to localStorage.

---

## Data persistence — auto-save (localStorage)

The game must NEVER lose progress. Save automatically at every meaningful state change. The player should be able to close the browser tab, reopen the game, and find all their progress intact.

### Save data structure
```js
const SAVE_KEY = 'warung-rush-save';

const defaultSave = {
  version: 2,                  // for future migration
  tutorialCompleted: false,    // show tutorial on first launch
  // Progress
  levelsUnlocked: 1,           // int, 1-12
  bestScores: new Array(12).fill(0),
  bestMedals: new Array(12).fill(0), // 0=none, 1=bronze, 2=silver, 3=gold
  // Economy
  totalRM: 0,                  // current spendable balance
  lifetimeRM: 0,               // total ever earned (for stats)
  unlockedTiers: [1],          // array of unlocked tier numbers, starts with [1]
  upgrades: {
    extraBurner: 0,            // 0-3 (cooking slots)
    holdingStationPlus: 0,     // 0-3 (holding station improvements)
    patientCustomers: 0,       // 0-3
    tipJar: 0,                 // 0-3
    crowdPleaser: 0,           // 0-3
    precisionChef: 0,          // 0-3 (cook timer perfect zone)
    truckReliability: 0        // 0-3 (hazard frequency + fix speed)
  },
  settings: {
    soundEnabled: true         // mute toggle
  },
  // Lifetime stats
  totalDishesServed: 0,
  totalPerfectDishes: 0,
  totalPlayTimeSeconds: 0,
  lastPlayedLevel: null,
  lastPlayedDate: null
};
```

### SaveManager — required methods
```js
SaveManager = {
  load()           // Read from localStorage, return merged with defaults (handles missing keys from older versions)
  save(data)       // Write to localStorage as JSON, called automatically
  reset()          // Clear all save data (for Settings/reset button on title screen)
}
```

### Auto-save trigger points (ALL of these must call SaveManager.save):
1. **Level complete** — update bestScores, bestMedals, levelsUnlocked, totalDishesServed, totalPerfectDishes, totalPlayTimeSeconds, lastPlayedLevel, lastPlayedDate
2. **Level failed / quit to menu mid-level** — update totalPlayTimeSeconds and lastPlayedDate (don't record a score for incomplete levels, but don't lose the play time stat)
3. **visibilitychange event** — when the browser tab becomes hidden (user switched apps, went to home screen, or Safari was backgrounded), IMMEDIATELY save current state. This is the most critical trigger because iOS Safari will kill the page in the background without warning.
4. **beforeunload event** — final save attempt on page close (unreliable on iOS but add as fallback)
5. **pagehide event** — more reliable than beforeunload on iOS Safari. Add this as a save trigger.

### Implementation pattern for visibility-based save
```js
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    // If currently in a level, pause the game and save accumulated stats
    if (gameState === 'PLAYING') {
      pauseGame();
    }
    SaveManager.save(currentSaveData);
  }
});

window.addEventListener('pagehide', () => {
  SaveManager.save(currentSaveData);
});
```

### On game load behaviour
When the game loads (DOMContentLoaded):
1. Call `SaveManager.load()`
2. Apply loaded data: unlock correct levels, show best medals/scores on level select
3. Go to TITLE screen (never auto-resume into a level — just preserve progress)

### Reset option
Add a small "Reset Progress" button on the title screen (bottom corner, muted colour, requires confirmation tap: "Are you sure? Tap again to reset"). Calls `SaveManager.reset()` and reloads the page.

---

## Performance requirements
- 60fps during gameplay (use `requestAnimationFrame`, avoid layout thrashing)
- No memory leaks (clean up intervals/timeouts on screen transitions)
- Efficient DOM updates (cache element references, batch reads/writes)
- All animations via CSS transforms/opacity (GPU accelerated, no top/left/width/height animations)

---

## Code organisation

Structure the JS cleanly with these objects/modules (all in one file, but logically separated with comment headers):

```
// ===== CONFIGURATION =====
// Dish definitions (55 dishes), level configs (12 levels), medal thresholds,
// hazard definitions, upgrade costs, timing constants, custom order schemas

// ===== AUDIO MANAGER =====
// Web Audio API sound generation, mute toggle

// ===== SAVE MANAGER =====
// localStorage read/write, auto-save triggers, data migration

// ===== UI MANAGER =====
// DOM element creation, screen transitions, HUD updates, floating text,
// fix overlay, rush banner, hazard alerts

// ===== COOKING MANAGER =====
// Cooking slot timers, burn detection, pull logic, holding station freshness

// ===== HAZARD MANAGER =====
// Hazard spawn scheduling, effect application/removal, fix sequences,
// interaction with cooking/holding/prep systems, upgrade-based reduction

// ===== ORDER MANAGER =====
// Order spawning, custom order generation, patience timers, variation logic,
// VIP/double order handling, auto-serve from holding stations

// ===== GAME ENGINE =====
// State machine, game loop (requestAnimationFrame), scoring, combo,
// rush events, menu selection, level progression, RM economy

// ===== INITIALISATION =====
// DOMContentLoaded setup, event binding, service worker registration,
// orientation detection, wake lock, PWA standalone detection
```

---

## Testing checklist (verify these work)

### Tutorial
- [ ] First launch (no save data) → START triggers tutorial, not level select
- [ ] Tutorial Step 1: order appears, arrow points to it, tapping loads prep station
- [ ] Tutorial Step 2: correct ingredient is highlighted/pulsing, tapping advances recipe
- [ ] Tutorial Step 3: SERVE button appears and works
- [ ] Tutorial Step 4: unguided dish — wrong taps show error feedback but don't penalise
- [ ] Tutorial Step 5: summary card appears, "START COOKING" goes to level select
- [ ] Tutorial only shows once (saved to localStorage)
- [ ] "How to Play" on title screen replays tutorial at any time

### Three cooking mechanics
- [ ] ⚡ Instant Serve: tap ingredient sequence → SERVE appears → one tap to serve
- [ ] 🔥 Cook & Serve: prep steps → START COOKING → dish moves to cooking slot → timer bar fills → tap PULL in green zone → serve
- [ ] 📋 Custom Order: order card shows specific build → player picks correct option at each step → wrong pick = mistake
- [ ] 📋🔥 Dual-type: custom assembly first → then cooking slot → pull → serve
- [ ] Cook timer zones: grey (raw) → green (PERFECT) → orange (overcooked, −30%) → red (BURNT, dish lost)
- [ ] Tapping PULL on raw dish shows "Not ready yet!" and does nothing
- [ ] Burnt dish auto-trashes with smoke animation and penalty
- [ ] Max 2 cooking slots active (upgradable). "All slots full!" warning if exceeded
- [ ] Player can freely switch between orders while dishes are cooking
- [ ] Custom orders: EXTRA modifier requires tapping ingredient twice
- [ ] Custom orders: NO modifier requires tapping SKIP button
- [ ] Same dish generates different custom builds each time

### Holding stations
- [ ] Tap empty holding slot → mini-menu of Instant Serve dishes from current menu
- [ ] Prep a dish into holding slot → freshness bar depletes (30s base)
- [ ] When matching order spawns → "AUTO-SERVE ⚡" button appears on order card
- [ ] Tapping AUTO-SERVE instantly serves from holding slot (one tap)
- [ ] Expired holding dish greys out and auto-clears
- [ ] Holding Station+ upgrade extends freshness and adds slots

### Menu selection
- [ ] Pre-level screen shows dish grid for player to select 4-6 dishes
- [ ] Must include at least 1 Instant Serve dish
- [ ] Some levels have a required dish (locked in, can't deselect)
- [ ] Only selected dishes appear as orders during gameplay
- [ ] CONFIRM MENU → proceed to countdown

### Kitchen hazards
- [ ] Level 1 has no hazards
- [ ] Level 2+: Burner Jam — one cooking slot gets locked, 🔧 FIX button appears
- [ ] Level 3+: Fridge Door — holding station freshness drains 3× faster
- [ ] Level 5+: Gas Leak — cook timers run 1.5× faster, PERFECT zone shrinks
- [ ] Level 6+: Spill — ingredient taps have 25% chance of registering adjacent button
- [ ] Level 8+: Power Flicker — score/combo HUD disappears for 10 seconds
- [ ] Level 9+: Pest Alert — one order queue blocked, remaining orders drain 2× faster
- [ ] Level 11+: Engine Stall — all timers freeze 3s then run 1.3× for 15s (unfixable)
- [ ] Hazard alert flashes centre-screen with icon + name + warning sound
- [ ] Broken element shows red pulsing border + "🔧 FIX" button
- [ ] Fix sequence: tapping correct sequence of 3-4 icons repairs the equipment
- [ ] Game does NOT pause during fix — orders and cook timers keep running
- [ ] Wrong tap during fix: small delay penalty + error sound
- [ ] Truck Reliability upgrade reduces hazard frequency and fix sequence length
- [ ] Max 2 concurrent hazards (never 3)
- [ ] No hazards in first 15 seconds of a level
- [ ] Hazards CAN spawn during Rush events
- [ ] Pause freezes hazard timers and effects

### Rush events
- [ ] "🔥 RUSH HOUR!" banner flashes during rush
- [ ] Order spawn rate doubles during rush (15-20 seconds)
- [ ] Brief 5-second calm period after rush ends
- [ ] Levels 1-3: 1 rush, Levels 4-7: 2 rushes, Levels 8-12: 3 rushes

### Trash mechanic
- [ ] 🗑️ button on prep area discards current dish in progress
- [ ] Trashing resets combo but does not count as expired order
- [ ] Trashing a cooking slot dish frees the slot

### Core gameplay flow
- [ ] Title screen loads, buttons respond to tap
- [ ] Level 1 is unlocked, levels 2-12 are locked
- [ ] Level select → pre-level screen (menu select + modifiers + hazards + medals) → countdown → gameplay
- [ ] Orders appear in queues with depleting patience bars
- [ ] VIP orders: gold border, shimmer, half patience, 2× points
- [ ] Double orders: "×2" badge, must cook dish twice
- [ ] Serving perfect dish → "PERFECT! 🌟" + combo increase + RM bonus
- [ ] Expired order → shake + 😡 + −50 points + combo reset
- [ ] Timer reaches 0 → level complete screen with stats + RM + medal
- [ ] Level complete shows: dishes served, perfects, overcooked, mistakes, expired, hazards fixed, burnt, auto-serves
- [ ] Mute toggle (🔊/🔇) in HUD, persists to localStorage
- [ ] Pause freezes ALL timers (level, patience, cooking, holding, hazards)

### Economy & Shop
- [ ] RM earned per dish = basePoints × 0.5 × (1 + tipJarBonus) × perfectMultiplier
- [ ] RM earned counter shows in HUD during gameplay
- [ ] RM earned displays on level complete screen
- [ ] RM accumulates across levels and persists in save data
- [ ] Shop accessible from title screen and level select
- [ ] Tier unlock: RM deducted → tier dishes available in eligible levels
- [ ] Extra Burner upgrade: +1 cooking slot per level
- [ ] Holding Station+ upgrade: more slots + longer freshness
- [ ] Patient Customers upgrade: +10% patience per level
- [ ] Tip Jar upgrade: +15% RM earned per level
- [ ] Crowd Pleaser upgrade: combo max increases (×3 → ×6)
- [ ] Precision Chef upgrade: PERFECT zone widens (25% → 40%)
- [ ] Truck Reliability upgrade: hazard frequency −20/35/50% + fewer fix taps
- [ ] Insufficient RM → purchase button disabled/greyed
- [ ] Level 4 requires Tier 3 unlocked, Level 7 requires Tier 4, Level 10 requires Tier 5

### Difficulty modifiers
- [ ] Pre-level screen shows active modifiers AND hazards with descriptions
- [ ] Impatient Crowd (Level 4+): patience −20%
- [ ] Lunch Rush (Level 5+): spawns +25% faster
- [ ] Picky Eater (Level 6+): more custom-varied orders
- [ ] VIP Customer (Level 7+): 1 gold VIP order per level
- [ ] Double Order (Level 8+): 20% chance of double orders
- [ ] Level 12: all modifiers + all hazards + max frequency

### Auto-save
- [ ] Complete a level → close tab → reopen → score, medal, RM, upgrades preserved
- [ ] Buy upgrade → close tab → reopen → upgrade level preserved
- [ ] Mid-level, switch to another app → return → game is paused, no data lost
- [ ] Reset Progress clears ALL data (levels, RM, upgrades, tiers, tutorial, settings)

### PWA / iPad app experience
- [ ] manifest.json loads without errors
- [ ] Service worker registers and caches all assets
- [ ] Game works fully offline after first load
- [ ] "Add to Home Screen" creates app icon, launches fullscreen
- [ ] Dark splash screen (no white flash) on launch
- [ ] No scrolling, no zoom, no bounce
- [ ] Landscape fills screen; portrait shows "Please rotate" overlay
- [ ] Screen does not dim during gameplay (wake lock)

