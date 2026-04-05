# Phase 2 — Core Gameplay

## What to build in this phase
Implement the basic gameplay loop: Tier 1 dishes with Instant Serve mechanic, order queue with patience timers, scoring with combo multiplier, and the HUD. After this phase, Level 1 should be fully playable with 11 Tier 1 dishes.

## Prerequisites
Phase 1 complete — HTML skeleton, screens, PWA files all working.

---

## Game data: Tier 1 dishes (11 dishes, all ⚡ Instant Serve)

Each dish is a JS object. Define all 11 in a `DISHES` array:

```js
const DISHES = [
  { id: 1,  name: 'Teh Tarik',      emoji: '🍵', tier: 1, cookType: 'instant', prepSteps: [{emoji:'☕',label:'Tea'},{emoji:'🥛',label:'Condensed milk'},{emoji:'👋',label:'Pull'}], basePoints: 60, basePatienceSec: 15 },
  { id: 2,  name: 'Kopi O',         emoji: '☕', tier: 1, cookType: 'instant', prepSteps: [{emoji:'☕',label:'Coffee'},{emoji:'🫗',label:'Hot water'},{emoji:'🥄',label:'Stir'}], basePoints: 60, basePatienceSec: 15 },
  { id: 3,  name: 'Milo Dinosaur',  emoji: '🥤', tier: 1, cookType: 'instant', prepSteps: [{emoji:'🥛',label:'Milo'},{emoji:'🧊',label:'Ice'},{emoji:'🥛',label:'Milk'},{emoji:'🍫',label:'Milo powder'}], basePoints: 70, basePatienceSec: 16 },
  { id: 4,  name: 'Teh O Ais',      emoji: '🧊', tier: 1, cookType: 'instant', prepSteps: [{emoji:'☕',label:'Tea'},{emoji:'🍬',label:'Sugar'},{emoji:'🧊',label:'Ice'}], basePoints: 60, basePatienceSec: 15 },
  { id: 5,  name: 'Air Bandung',    emoji: '🌸', tier: 1, cookType: 'instant', prepSteps: [{emoji:'🌹',label:'Rose syrup'},{emoji:'🥛',label:'Condensed milk'},{emoji:'🧊',label:'Ice'}], basePoints: 60, basePatienceSec: 15 },
  { id: 6,  name: 'Sirap Limau',    emoji: '🍹', tier: 1, cookType: 'instant', prepSteps: [{emoji:'🌹',label:'Rose syrup'},{emoji:'🍋',label:'Lime'},{emoji:'🧊',label:'Ice'},{emoji:'🫗',label:'Water'}], basePoints: 65, basePatienceSec: 15 },
  { id: 7,  name: 'Pisang Goreng',  emoji: '🍌', tier: 1, cookType: 'instant', prepSteps: [{emoji:'🍌',label:'Banana'},{emoji:'🫙',label:'Batter'},{emoji:'🔥',label:'Fry'}], basePoints: 70, basePatienceSec: 16 },
  { id: 8,  name: 'Keropok Lekor',  emoji: '🐟', tier: 1, cookType: 'instant', prepSteps: [{emoji:'🐟',label:'Fish paste'},{emoji:'🫙',label:'Shape'},{emoji:'🔥',label:'Fry'}], basePoints: 70, basePatienceSec: 16 },
  { id: 9,  name: 'Cucur Udang',    emoji: '🦐', tier: 1, cookType: 'instant', prepSteps: [{emoji:'🦐',label:'Prawns'},{emoji:'🫙',label:'Batter'},{emoji:'🧅',label:'Onions'},{emoji:'🔥',label:'Fry'}], basePoints: 75, basePatienceSec: 17 },
  { id: 10, name: 'Onde-Onde',      emoji: '🟢', tier: 1, cookType: 'instant', prepSteps: [{emoji:'🥥',label:'Pandan dough'},{emoji:'🍬',label:'Gula melaka'},{emoji:'🫕',label:'Boil'},{emoji:'🥥',label:'Coconut'}], basePoints: 75, basePatienceSec: 17 },
  { id: 11, name: 'Kuih Koci',      emoji: '🟩', tier: 1, cookType: 'instant', prepSteps: [{emoji:'🥥',label:'Glutinous dough'},{emoji:'🥥',label:'Coconut fill'},{emoji:'🌿',label:'Banana leaf'},{emoji:'🫕',label:'Steam'}], basePoints: 75, basePatienceSec: 17 },
];
```

---

## Level 1 configuration (hardcode for now, expand in Phase 4)

```js
const LEVEL_CONFIG = {
  level: 1,
  name: 'Subang Jaya',
  subtitle: 'Morning Market',
  duration: 90,          // seconds
  availableTiers: [1],
  spawnIntervalMin: 5,   // seconds
  spawnIntervalMax: 7,
  maxActiveOrders: 4,    // left queue 2 + right queue 2
  rushCount: 1,
  modifiers: [],
  hazards: [],
};
```

---

## Gameplay screen layout (`#screen-playing`)

Build the PLAYING screen with this exact layout:

### Top bar (HUD) — fixed 56px height
```
┌──────────────────────────────────────────────────┐
│ SCORE  1250     💰 RM 320    ×2 COMBO    ⏱ 0:45  ⏸│
└──────────────────────────────────────────────────┘
```
- Left: "SCORE" label (12px dim, uppercase) + value (Fredoka 28px yellow)
- Left-centre: RM earned this level (Fredoka 18px gold "💰 RM 320")
- Centre: Combo pill (Fredoka 22px, orange bg `#e8842a`, dark text, rounded 20px, "×1")
- Right: Timer (Fredoka 28px, turns `#d4392e` + CSS pulse when < 20s)
- Far right: Pause button "⏸" (40×40px tap target)

### Main area — flex row

#### Left order queue (20% width)
- Vertical stack of order cards (max 2 in this phase, half of maxActiveOrders)
- Empty state: dim dashed border, "Waiting..." text

#### Centre prep station (60% width)
- **Empty state**: "Tap an order to start cooking!" with pulsing ← → arrows
- **Active state** (when order is selected):
  - Top: dish emoji (48px) + dish name (Fredoka 24px) + "Step 2 of 4" (Nunito 14px muted)
  - Middle: Assembly area — vertically stacked list showing completed steps (✅ checkmark + greyed emoji + label) and the CURRENT step (highlighted with yellow border, full colour)
  - Bottom: Ingredient button grid — shows ALL ingredients for this dish's prepSteps. Grid layout: auto-fit columns, min 70px, gap 12px. Each button: 70×70px, rounded 12px, `#3d2218` bg, emoji (28px) + label (11px) below. Active button state: `transform: scale(0.95)` on tap.

#### Right order queue (20% width)
- Same as left queue (max 2 cards)

---

## Order card design

Each order card in the queue:
```
┌──────────────────┐
│  🍵  Teh Tarik   │  ← emoji (28px) + name (Nunito 14px bold)
│  ⚡ Instant       │  ← cook type badge (11px, muted)
│  ▓▓▓▓▓▓▓░░░░░░  │  ← patience bar (height 6px, rounded)
└──────────────────┘
```
- Card: `#3d2218` bg, rounded 12px, padding 10px, border 2px solid `#8a6e52`
- Selected card: border colour changes to `#f5c542`
- Patience bar colours: green `#4caf50` (>60%) → yellow `#f5c542` (30-60%) → red `#d4392e` (<30%) → flashing red (<10%)
- Expired: card shakes (CSS animation), turns red, emoji flashes 😡, then fades out and is removed

Tap behaviour: tapping a card selects it as the active order and loads its recipe in the prep station. Tapping a different card switches to that order (current prep progress is NOT lost — it resumes when you switch back).

---

## Order spawning system

```js
// Order object structure
const order = {
  id: uniqueId++,
  dish: DISHES[randomIndex],        // reference to dish object
  patienceTotal: dish.basePatienceSec * 1000,  // in ms
  patienceRemaining: dish.basePatienceSec * 1000,
  startTime: performance.now(),
  currentStep: 0,                    // which ingredient step the player is on
  mistakes: 0,
  state: 'waiting',                  // 'waiting' | 'active' | 'expired'
};
```

Spawn logic:
- Use `setTimeout` with random delay between `spawnIntervalMin` and `spawnIntervalMax` (in seconds)
- Randomly pick a dish from `DISHES.filter(d => LEVEL_CONFIG.availableTiers.includes(d.tier))`
- Alternate placement: left queue first, then right, filling available slots
- If all slots full (maxActiveOrders reached), skip this spawn cycle
- After spawning, schedule the next spawn with a new random delay

---

## Instant Serve mechanic

When a selected order is in the prep station:

1. Show all `dish.prepSteps` as ingredient buttons in the grid
2. The grid shows buttons in a SHUFFLED order (not the same as the recipe order — player must read the recipe steps)
3. Highlight the current step in the assembly area
4. On ingredient button tap:
   - **Correct** (matches `prepSteps[currentStep]`): green flash on button (200ms), checkmark appears on assembly step, `currentStep++`, play rising tone sound
   - **Wrong**: red flash on button + shake animation (300ms), `mistakes++`, play buzz sound. Do NOT advance the step.
5. When `currentStep === prepSteps.length`:
   - Hide ingredient grid
   - Show large "SERVE ✅" button (green `#4caf50` bg, Fredoka 24px, slide-up animation)
6. On SERVE tap:
   - Calculate score and RM
   - Show floating text feedback
   - Remove order from queue
   - Clear prep station back to empty state

**CRITICAL**: The ingredient buttons must be SHUFFLED randomly each time an order is loaded. Do NOT display them in recipe order — the player must read the recipe in the assembly area and find the correct button in the grid.

---

## Scoring system

```js
const COMBO_MULTIPLIERS = [1, 1.5, 2, 2.5, 3]; // index = consecutive perfect count (capped at 4)

function calculateScore(order, comboIndex) {
  const basePoints = order.dish.basePoints;
  const multiplier = COMBO_MULTIPLIERS[Math.min(comboIndex, COMBO_MULTIPLIERS.length - 1)];
  
  if (order.mistakes === 0) {
    // Perfect serve
    return {
      score: Math.round(basePoints * multiplier),
      rm: Math.round(basePoints * 0.5 * 1.5),  // 1.5× RM for perfect
      isPerfect: true
    };
  } else {
    // Imperfect serve
    return {
      score: Math.round(basePoints * 0.5),
      rm: Math.round(basePoints * 0.2),
      isPerfect: false
    };
  }
}
```

Combo logic:
- Start at 0 (×1 multiplier)
- Each consecutive perfect serve: increment combo (max index 4 = ×3)
- Any mistake, expired order, or imperfect serve: reset combo to 0
- Combo pill in HUD updates with pop animation (CSS scale 1→1.3→1 over 300ms)

Expired order:
- Score: −50 points
- Combo: reset to 0
- RM: 0

---

## Patience timer system

Update every frame via `requestAnimationFrame`:

```js
function updateOrders(now) {
  activeOrders.forEach(order => {
    if (order.state === 'expired') return;
    
    const elapsed = now - order.startTime;
    order.patienceRemaining = Math.max(0, order.patienceTotal - elapsed);
    
    // Update patience bar width and colour
    const ratio = order.patienceRemaining / order.patienceTotal;
    updatePatienceBar(order.id, ratio);
    
    if (order.patienceRemaining <= 0) {
      expireOrder(order);
    }
  });
}
```

---

## Level timer

- Counts DOWN from `LEVEL_CONFIG.duration` seconds
- Displayed in HUD as `M:SS` format
- When < 20 seconds: text turns `#d4392e`, CSS pulse animation
- When reaches 0: stop spawning orders, let active orders resolve for 3 more seconds, then transition to LEVEL_COMPLETE screen

---

## Floating text feedback

Create a floating text system that shows score events:

```js
function showFloatingText(text, colour, x, y) {
  const el = document.createElement('div');
  el.className = 'floating-text';
  el.textContent = text;
  el.style.color = colour;
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  document.getElementById('screen-playing').appendChild(el);
  // CSS animation handles the float-up and fade-out (1 second)
  el.addEventListener('animationend', () => el.remove());
}
```

CSS for floating text:
```css
.floating-text {
  position: absolute;
  font-family: 'Fredoka', sans-serif;
  font-size: 24px;
  font-weight: 700;
  pointer-events: none;
  z-index: 50;
  animation: floatUp 1s ease-out forwards;
}
@keyframes floatUp {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-60px) scale(1.2); }
}
```

Feedback messages:
- Perfect serve: "PERFECT! 🌟 +[score]" in `#f5c542`, larger (28px)
- Normal serve: "+[score]" in `#fef3e0`
- Expired: "EXPIRED 😡 -50" in `#d4392e`
- Combo up: "COMBO ×[n]!" in `#e8842a`, large (32px), separate from score text

---

## Level complete screen

When the level timer reaches 0, show `#screen-level-complete` with:

1. "ROUTE COMPLETE!" — Fredoka 40px `#f5c542`
2. Location name — Fredoka 24px white
3. Score — large animated counter that counts up from 0 to final score over 1.5 seconds (Fredoka 48px yellow)
4. RM earned — animated counter (Fredoka 28px gold, "💰 RM [amount]")
5. Stats row (4 items, horizontal, Nunito 14px):
   - "Dishes served: N" | "Perfect: N" | "Mistakes: N" | "Expired: N"
6. Medal — determined by score thresholds:
   - Bronze (🥉): ≥ 600
   - Silver (🥈): ≥ 1000
   - Gold (🥇): ≥ 1500
   - Medal emoji bounces in (CSS animation), "NEW BEST!" flash if it exceeds saved medal
7. Buttons: "Retry 🔄" | "Menu 🏠" (in Phase 5, add "Shop 🛒" and "Next Route →")

---

## Save system (basic, expanded in Phase 6)

```js
const SAVE_KEY = 'warung-rush-save';

const SaveManager = {
  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return this.defaults();
      return { ...this.defaults(), ...JSON.parse(raw) };
    } catch (e) { return this.defaults(); }
  },
  save(data) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch (e) {}
  },
  reset() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
  },
  defaults() {
    return {
      version: 2,
      tutorialCompleted: false,
      levelsUnlocked: 1,
      bestScores: new Array(12).fill(0),
      bestMedals: new Array(12).fill(0),
      totalRM: 0,
      lifetimeRM: 0,
      unlockedTiers: [1],
      upgrades: { extraBurner:0, holdingStationPlus:0, patientCustomers:0, tipJar:0, crowdPleaser:0, precisionChef:0, truckReliability:0 },
      settings: { soundEnabled: true },
      totalDishesServed: 0,
      totalPerfectDishes: 0,
      totalPlayTimeSeconds: 0,
      lastPlayedLevel: null,
      lastPlayedDate: null,
    };
  }
};
```

Save after level complete. Load on page load.

---

## Phase 2 verification checklist

- [ ] Level 1 is playable from start to finish (90 seconds)
- [ ] Orders spawn every 5-7 seconds with random dishes from Tier 1
- [ ] Order cards appear in left queue, then right queue
- [ ] Tapping an order selects it and loads recipe in prep station
- [ ] Ingredient buttons are SHUFFLED — not in recipe order
- [ ] Assembly area shows completed steps (✅) and current step (highlighted)
- [ ] Correct tap: green flash, step advances, rising tone
- [ ] Wrong tap: red flash + shake, mistake counted, buzz sound
- [ ] All steps complete: SERVE button slides up
- [ ] Perfect serve (0 mistakes): "PERFECT!" floating text, combo increases
- [ ] Imperfect serve: reduced score, combo resets
- [ ] Patience bar depletes in real-time (green → yellow → red)
- [ ] Expired order: shake, 😡, -50 points, combo resets, card removed
- [ ] Combo pill shows correct multiplier and pops on increase
- [ ] HUD score and RM update in real-time
- [ ] Timer counts down, turns red + pulses when < 20s
- [ ] Timer reaches 0 → level complete screen
- [ ] Score counter animates up from 0
- [ ] Medal awarded based on thresholds (600/1000/1500)
- [ ] Retry button restarts Level 1
- [ ] Menu button returns to title screen
- [ ] Save data persists: close tab, reopen, best score/medal visible
- [ ] Switching between orders preserves prep progress (currentStep not lost)
- [ ] Pause button pauses all timers, resume unpauses
- [ ] Cannot spawn more orders than maxActiveOrders (4)
