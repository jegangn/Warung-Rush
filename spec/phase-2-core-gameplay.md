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

## Order card design — with customer characters

Each order card has a CUSTOMER CHARACTER that reacts in real-time based on patience remaining and serve quality. This is the emotional heartbeat of the game — customers aren't just timers, they're people you're trying to make happy.

### Customer avatar system

When an order spawns, it is assigned a random customer from a pool of 12 avatar characters. Each avatar is a combination of:
- **Base face emoji** (the character's identity)
- **Mood emoji** (changes based on patience state)
- **Name** (randomly assigned Malaysian name for flavour)

#### Avatar pool (12 characters):
```js
const CUSTOMER_AVATARS = [
  { base: '👨', name: 'Ah Kow' },
  { base: '👩', name: 'Siti' },
  { base: '👴', name: 'Uncle Lim' },
  { base: '👵', name: 'Makcik Ros' },
  { base: '👦', name: 'Amir' },
  { base: '👧', name: 'Priya' },
  { base: '🧑', name: 'Hafiz' },
  { base: '👨‍🦱', name: 'Raju' },
  { base: '👩‍🦰', name: 'Mei Ling' },
  { base: '🧔', name: 'Pak Samad' },
  { base: '👩‍🦳', name: 'Aunty Chong' },
  { base: '👨‍🦳', name: 'Tok Wan' },
];
```

#### Mood states (5 stages based on patience %):

| Patience % | Mood | Mood emoji | Card border | Animation | Behaviour |
|------------|------|-----------|------------|-----------|-----------|
| 100-80% | Happy | 😊 | default `#8a6e52` | Gentle idle bounce (subtle, 3s loop) | Just arrived, content to wait |
| 80-60% | Neutral | 😐 | default | No animation (still) | Starting to notice the wait |
| 60-40% | Impatient | 😤 | `#e8842a` (orange) | Foot-tap animation (card shifts left-right 2px, 0.5s loop) | Visibly annoyed |
| 40-15% | Angry | 😠 | `#d4392e` (red) | Head shake (card rotates ±2deg, 0.3s loop) + steam puffs above card | Getting furious |
| 15-0% | Furious | 🤬 | `#d4392e` flashing | Aggressive shake (card rotates ±4deg, 0.2s loop) + face turns red bg | About to leave |
| 0% (expired) | Left | 😡💢 | — | Slam animation: card jerks up then flies off-screen to the side (300ms) | Gone — order lost |

#### Serve reactions (shown briefly on the card before it disappears):

| Serve quality | Reaction emoji | Floating text | Animation | Duration |
|--------------|---------------|--------------|-----------|----------|
| PERFECT serve | 😍 or 🤩 | "PERFECT! 🌟" (yellow) | Customer jumps up with hearts ❤️ particles | 800ms |
| Good serve (with mistakes) | 😊 | "+[score]" (white) | Nod animation (card bobs down then up) | 500ms |
| Overcooked serve | 😕 | "Overcooked..." (orange) | Slight head shake | 500ms |
| BURNT (auto-trash) | 🤢 | "BURNT! 🔥" (red) | Disgusted recoil (card jumps back) then poof | 600ms |
| Expired (walked away) | 😡💨 | "EXPIRED -50" (red) | Slam + storm off (card flies left/right off-screen) | 500ms |

### Order card layout (updated with customer):
```
┌──────────────────────┐
│ 😊 Siti              │  ← mood emoji (24px) + customer name (Nunito 12px, muted)
│                      │
│  🍵  Teh Tarik       │  ← dish emoji (28px) + name (Nunito 14px bold)
│  ⚡ Instant           │  ← cook type badge (11px, muted)
│                      │
│  ▓▓▓▓▓▓▓░░░░░░░░░  │  ← patience bar (height 6px, rounded)
└──────────────────────┘
```

- Customer name adds personality — "Uncle Lim wants Char Kuey Teow" feels different from an anonymous timer
- Mood emoji updates every frame based on patience % (use CSS transitions for smooth swaps)
- Card border colour matches mood state
- Card animation matches mood state (idle bounce → foot tap → head shake → aggressive shake)

### CSS animations for customer moods:
```css
@keyframes idleBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}
@keyframes footTap {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(2px); }
}
@keyframes headShake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-2deg); }
  75% { transform: rotate(2deg); }
}
@keyframes angryShake {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(-4deg); }
  75% { transform: rotate(4deg); }
}
@keyframes serveJump {
  0% { transform: translateY(0); }
  40% { transform: translateY(-15px) scale(1.1); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes stormOff {
  0% { transform: translateX(0); opacity: 1; }
  30% { transform: translateX(10px); }
  100% { transform: translateX(200px); opacity: 0; }
}
```

### VIP customer special treatment:
VIP orders (⭐) get a special avatar treatment:
- Gold background tint on the card (`rgba(245, 197, 66, 0.15)`)
- Gold shimmer animation on the border
- VIP badge "⭐ VIP" in the name row
- Mood stages are the same but patience drains 2× faster (they're important and impatient)
- Perfect serve reaction: 🤩 with gold sparkle ✨ particles instead of red hearts

### Implementation notes:
- Store `customer` on the order object: `order.customer = CUSTOMER_AVATARS[Math.floor(Math.random() * CUSTOMER_AVATARS.length)]`
- Update mood in the game loop based on `order.patienceRemaining / order.patienceTotal` ratio
- Apply CSS animation class changes based on mood state (remove old class, add new)
- On serve: swap mood emoji to reaction emoji, play reaction animation, THEN remove card after animation completes (don't remove instantly)

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

### Customer characters
- [ ] Each order card shows a customer avatar (mood emoji + name)
- [ ] Customer names are randomly picked from the 12-name pool
- [ ] Mood updates in real-time: 😊 (>80%) → 😐 (60-80%) → 😤 (40-60%) → 😠 (15-40%) → 🤬 (<15%)
- [ ] Card border colour changes with mood (default → orange → red → flashing red)
- [ ] Card animation changes with mood (idle bounce → foot tap → head shake → angry shake)
- [ ] Perfect serve: customer shows 😍/🤩, card jumps up with hearts
- [ ] Good serve (with mistakes): customer shows 😊, nod animation
- [ ] Expired: customer shows 😡💢, card storms off screen
- [ ] Reaction animation plays BEFORE card is removed (not instant removal)

### Core gameplay
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
- [ ] Expired order: −50 points, combo resets, card removed with storm-off animation
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
