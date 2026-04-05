# Phase 3 — Advanced Cooking Mechanics

## What to build in this phase
Add Cook & Serve mechanic (cooking slots with burn timers), Custom Orders (choice-based assembly), holding stations, menu selection on the pre-level screen, trash mechanic, and rush events. After this phase, all THREE cooking mechanics work and multi-tasking gameplay is functional.

## Prerequisites
Phase 2 complete — Instant Serve mechanic, order queue, scoring, HUD all working.

---

## Cooking mechanic A recap: ⚡ Instant Serve (already built)
Tap ingredients in sequence → SERVE. No changes needed.

---

## Cooking mechanic B: 🔥 Cook & Serve

Two-phase cooking that creates multi-tasking.

### Phase 1 — PREP
Same as Instant Serve but with FEWER steps (2-4). Tap ingredients in sequence.

### Phase 2 — COOK
After prep is complete, instead of SERVE, show a "START COOKING 🔥" button. Tapping it:
1. Moves the dish to a **cooking slot** at the bottom of the screen
2. A timer bar begins filling left-to-right
3. The prep station clears — **player is free to work on other orders**

### Cooking slot UI
Add a cooking slot area at the bottom of the centre prep station (below the ingredient grid):

```
┌─────────────────────────────────────┐
│  COOKING SLOTS                      │
│  ┌───────────────────────────────┐  │
│  │ 🫓 Roti Canai [▓▓▓▓▓▓░░░░░] │  │
│  │              cooking...       │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ (empty slot — dashed border)  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Max 2 cooking slots** (base). If both are occupied, "START COOKING" button is disabled with "All slots full!" tooltip.

### Timer bar zones (this is EXACT — do not simplify):
The bar fills from 0% to 100% over `dish.cookTime` seconds.

| Progress | Zone name | Bar colour | Label | Tap result |
|----------|-----------|-----------|-------|------------|
| 0% – 60% | Raw | `#8a6e52` (dim grey) | "Cooking..." | "Not ready yet!" (no action) |
| 60% – 85% | PERFECT | `#4caf50` (green) pulsing glow | "PULL! 🟢" (button pulses) | Perfect serve — full points |
| 85% – 95% | Overcooked | `#e8842a` (orange) | "Overcooked! ⚠️" | Servable but ×0.7 points, combo resets |
| 95% – 100% | BURNT | `#d4392e` (red) + smoke particles | "BURNT! 🔥" | Auto-trash — order is LOST, −50 points |

**Cook times by tier (for future phases):**
- Tier 2: 4-6 seconds
- Tier 3: 6-8 seconds
- Tier 4: 8-10 seconds
- Tier 5: 10-12 seconds

### Cook slot interaction:
- Tapping a cooking slot while it's in the PERFECT zone: pull the dish, serve it immediately, apply score
- Tapping while in RAW zone: show "Not ready yet!" floating text, no action
- Tapping while in OVERCOOKED zone: pull it, serve at ×0.7 points, combo resets
- BURNT is automatic — no tap needed, the dish auto-trashes after reaching 100%

### Implementation:
```js
const cookingSlots = []; // array of { order, startTime, cookDuration, state }
const MAX_COOKING_SLOTS = 2; // base, modified by upgrade

function startCooking(order) {
  if (cookingSlots.length >= MAX_COOKING_SLOTS) {
    showFloatingText('All slots full!', '#d4392e', ...);
    return;
  }
  cookingSlots.push({
    order: order,
    startTime: performance.now(),
    cookDuration: order.dish.cookTime * 1000, // ms
  });
  removeOrderFromQueue(order); // order leaves the patience queue
  clearPrepStation();
}

// Called every frame in game loop:
function updateCookingSlots(now) {
  cookingSlots.forEach((slot, i) => {
    const progress = (now - slot.startTime) / slot.cookDuration;
    
    if (progress < 0.60) {
      slot.state = 'raw';
    } else if (progress < 0.85) {
      slot.state = 'perfect';
    } else if (progress < 0.95) {
      slot.state = 'overcooked';
    } else {
      // BURNT — auto-trash
      slot.state = 'burnt';
      showFloatingText('BURNT! 🔥 -50', '#d4392e', ...);
      score -= 50;
      combo = 0;
      cookingSlots.splice(i, 1);
      updateCookingSlotUI();
      return;
    }
    updateCookingSlotUI(i, progress, slot.state);
  });
}

function pullFromCooking(slotIndex) {
  const slot = cookingSlots[slotIndex];
  if (slot.state === 'raw') {
    showFloatingText('Not ready yet!', '#c4a882', ...);
    return;
  }
  if (slot.state === 'perfect') {
    serveOrder(slot.order, { perfect: slot.order.mistakes === 0, overcookPenalty: 1.0 });
  }
  if (slot.state === 'overcooked') {
    serveOrder(slot.order, { perfect: false, overcookPenalty: 0.7 });
  }
  cookingSlots.splice(slotIndex, 1);
  updateCookingSlotUI();
}
```

**CRITICAL**: Once a dish is in a cooking slot, its patience timer STOPS. The dish is committed to cooking. The only risk is burning.

---

## Cooking mechanic C: 📋 Custom Order

The customer orders a specific BUILD of a dish. The player must READ the order card and pick the exact choices.

### How custom orders are generated:
Each custom-capable dish defines `customSlots` — an array of choice points:

```js
// Example: Nasi Lemak custom schema
{
  id: 13, name: 'Nasi Lemak', emoji: '🍚', tier: 2,
  cookType: 'custom+cook', // custom assembly THEN cook
  cookTime: 4,
  baseAlwaysSteps: [{emoji:'🍚',label:'Coconut rice'}], // always first
  customSlots: [
    {
      name: 'Sambal',
      options: [
        {emoji:'🌶️', label:'Sambal', modifier: null},
        {emoji:'🌶️🌶️', label:'Extra sambal', modifier: 'EXTRA'},
        {emoji:'❌', label:'No sambal', modifier: 'SKIP'},
      ]
    },
    {
      name: 'Protein',
      options: [
        {emoji:'🥚', label:'Fried egg'},
        {emoji:'🍗', label:'Ayam goreng'},
        {emoji:'🦑', label:'Sambal sotong'},
        {emoji:'🍖', label:'Rendang'},
      ]
    },
    {
      name: 'Sides',
      multiSelect: true, pickCount: 2, // must pick exactly 2
      options: [
        {emoji:'🐟', label:'Ikan bilis'},
        {emoji:'🥒', label:'Timun'},
        {emoji:'🥜', label:'Peanuts'},
        {emoji:'🫓', label:'Papadom'},
      ]
    },
  ],
  finalAlwaysSteps: [], // nothing after custom
  basePoints: 100, basePatienceSec: 22,
}
```

### Order generation:
When spawning a custom order, randomly select one option per slot:
```js
function generateCustomBuild(dish) {
  const build = [];
  dish.baseAlwaysSteps.forEach(s => build.push({...s, type:'fixed'}));
  
  dish.customSlots.forEach(slot => {
    if (slot.multiSelect) {
      // Pick exactly `pickCount` random options
      const picks = shuffle(slot.options).slice(0, slot.pickCount);
      picks.forEach(p => build.push({...p, type:'choice', slotName: slot.name}));
    } else {
      const pick = slot.options[Math.floor(Math.random() * slot.options.length)];
      build.push({...pick, type:'choice', slotName: slot.name});
    }
  });
  
  dish.finalAlwaysSteps.forEach(s => build.push({...s, type:'fixed'}));
  return build;
}
```

### Custom order UI — the order card shows the EXACT build:
```
┌──────────────────────┐
│  🍚  Nasi Lemak      │
│  📋🔥 Custom + Cook  │
│  🍚 🌶️🌶️ 🍗 🐟 🥒  │  ← condensed recipe strip (small emoji showing exact build)
│  ▓▓▓▓▓▓▓░░░░░░░░░  │
└──────────────────────┘
```

### Custom order prep station:
When selected, the prep area shows:
1. **Recipe card** (top): Full readable list of the ordered build
   - "1. 🍚 Coconut rice" (greyed = fixed, can't change)
   - "2. 🌶️🌶️ EXTRA Sambal" ← customer's choice, highlighted
   - "3. 🍗 Ayam goreng"
   - "4. 🐟 Ikan bilis"
   - "5. 🥒 Timun"

2. **Choice buttons** (bottom): For the CURRENT step, show ALL OPTIONS from that customSlot:
   - If current step is a FIXED step: show only the correct ingredient as a single button
   - If current step is a CHOICE step: show all 2-4 options. Player must tap the one matching the order card.

3. **Modifier handling**:
   - `EXTRA`: Player must tap that ingredient TWICE. After first tap, button shows "1/2". After second tap, "✅"
   - `SKIP` / `NO`: A "SKIP ⏭" button appears alongside the options. Player taps SKIP to advance past this step.

4. After all steps: show SERVE (for pure 📋) or START COOKING (for 📋🔥)

### Wrong choice penalty:
Tapping the wrong option = `mistakes++`, red flash, buzz sound. The step does NOT advance. Player must tap the correct option.

---

## 📋🔥 Dual-type dishes
Some dishes are Custom + Cook. Flow:
1. Custom assembly (read order, pick choices) → 
2. "START COOKING 🔥" button →
3. Dish goes to cooking slot →
4. Player works on other orders →
5. Pull from cooking slot when ready

---

## Holding stations

2 holding station slots, shown between the prep station and cooking slots:

```
┌─────────────────────────────────────┐
│  HOLDING STATIONS                   │
│  ┌─────────────────┐ ┌───────────┐ │
│  │ 🍵 Teh Tarik    │ │  + PREP   │ │
│  │ [▓▓▓▓▓░░░░░░]  │ │  (empty)  │ │
│  │ 25s remaining   │ │           │ │
│  └─────────────────┘ └───────────┘ │
└─────────────────────────────────────┘
```

### How they work:
1. Tap an EMPTY holding slot → mini-dropdown shows all ⚡ Instant Serve dishes from the current level menu
2. Tap a dish to start prepping it (same Instant Serve mechanic — tap ingredients in sequence)
3. Once prepped, the dish sits in the holding slot with a **freshness bar** (30 seconds, depleting)
4. When a new order spawns for a MATCHING dish (same dish ID), an "AUTO-SERVE ⚡" button appears on that order card
5. Tapping AUTO-SERVE: instantly serves the order from the holding slot (one tap), awards points, holding slot becomes empty
6. If freshness reaches 0: dish spoils (greyed out, auto-removed, no penalty — just wasted time)

### Holding station rules:
- Only ⚡ Instant Serve dishes can be pre-prepped
- Freshness: 30 seconds base (upgradable)
- Base slots: 2 (upgradable to 3)
- Auto-serve counts as a PERFECT serve for combo purposes (no mistakes possible)

---

## Menu selection (PRE_LEVEL screen)

Before each level, the player CHOOSES which dishes to bring. Populate the `#screen-pre-level`:

### Layout:
1. "ROUTE [N]: [Location]" — Fredoka 32px yellow
2. "⏱ [duration] seconds" — Nunito 16px muted
3. **Dish selection grid**: all unlocked dishes, grouped by tier. Each dish tile (80×80px):
   - Emoji (32px) + name (10px) below
   - Cook type icon badge: ⚡/🔥/📋 in corner
   - Difficulty stars (tiny, below name)
   - Tap to toggle: yellow border = selected, dim = deselected
4. Counter: "4/6 dishes selected" (or whatever the level requires)
5. Constraint text: "Must include at least 1 ⚡ Instant Serve dish"
6. Medal targets: "🥉 [N] | 🥈 [N] | 🥇 [N]"
7. "START →" button (disabled until valid selection)
8. "← Back" button

### Rules for Phase 3:
- Level 1: pick 4 dishes from Tier 1 (all Instant Serve, so constraint is auto-met)
- For now, hardcode level 1 config. Phase 4 will add all 12 levels with tier requirements.

---

## Trash mechanic

A 🗑️ button on the prep area (top-right corner of prep station):
- Tap to discard the dish currently being prepped (resets prep station)
- Resets combo (penalty for wasting)
- Does NOT count as expired order (no −50 penalty)
- If trashing a dish already in a cooking slot: tap the cooking slot → "Trash 🗑️" sub-button appears → confirm tap trashes it and frees the slot
- Play thud sound on trash

---

## Rush events

During gameplay, 1-3 RUSH events occur at random intervals.

### Implementation:
```js
function scheduleRushEvents(rushCount, levelDuration) {
  for (let i = 0; i < rushCount; i++) {
    const minTime = levelDuration * 0.2;
    const maxTime = levelDuration * 0.8;
    const rushTime = minTime + Math.random() * (maxTime - minTime);
    setTimeout(() => startRush(), rushTime * 1000);
  }
}

function startRush() {
  isRushing = true;
  showRushBanner(); // "🔥 RUSH HOUR! 🔥" flashing red banner at top
  savedSpawnInterval = currentSpawnInterval;
  currentSpawnInterval = savedSpawnInterval * 0.5; // 2× faster
  
  const rushDuration = 15000 + Math.random() * 5000; // 15-20s
  setTimeout(() => endRush(), rushDuration);
}

function endRush() {
  isRushing = false;
  hideRushBanner();
  currentSpawnInterval = savedSpawnInterval * 1.5; // brief calm
  setTimeout(() => { currentSpawnInterval = savedSpawnInterval; }, 5000);
}
```

---

## Phase 3 verification checklist

### Cook & Serve
- [ ] 🔥 dish: prep steps → "START COOKING" button appears (not SERVE)
- [ ] Dish moves to cooking slot, timer bar begins filling
- [ ] Player can select and work on other orders while dish cooks
- [ ] Timer bar colours: grey (raw) → green PERFECT (pulsing) → orange overcooked → red BURNT
- [ ] Tap in RAW zone: "Not ready yet!" feedback
- [ ] Tap in PERFECT zone: serve at full points
- [ ] Tap in OVERCOOKED zone: serve at ×0.7 points, combo resets
- [ ] BURNT: auto-trash, −50 points, smoke effect
- [ ] Max 2 cooking slots. "All slots full!" when exceeded.
- [ ] Dish patience timer STOPS once cooking starts

### Custom Orders
- [ ] 📋 dish: order card shows condensed emoji recipe strip
- [ ] Prep area shows full recipe card with each step
- [ ] Choice steps show ALL options — player must pick the correct one
- [ ] EXTRA modifier: ingredient must be tapped twice (shows 1/2 → ✅)
- [ ] SKIP modifier: "SKIP ⏭" button must be tapped instead of any ingredient
- [ ] Wrong choice: red flash, mistakes++, step does NOT advance
- [ ] Same dish generates DIFFERENT custom builds each order
- [ ] 📋🔥 dual-type: custom assembly → START COOKING → cooking slot

### Holding stations
- [ ] 2 holding slots visible below prep area
- [ ] Tap empty slot → mini-menu of ⚡ dishes from current menu
- [ ] Prep dish into slot → freshness bar depletes (30s)
- [ ] Matching order spawns → "AUTO-SERVE ⚡" button appears on order card
- [ ] Auto-serve: one tap, instant, counts as perfect for combo
- [ ] Expired holding dish: greyed out, removed, no penalty

### Menu selection
- [ ] Pre-level screen shows dish grid
- [ ] Dishes can be toggled on/off with tap
- [ ] Counter shows "N/M dishes selected"
- [ ] Must include at least 1 ⚡ dish
- [ ] START button disabled until valid selection
- [ ] Only selected dishes appear as orders during gameplay

### Trash mechanic
- [ ] 🗑️ button on prep area discards current dish
- [ ] Trashing resets combo but no −50 penalty
- [ ] Can trash a cooking slot dish (frees the slot)

### Rush events
- [ ] "🔥 RUSH HOUR!" banner appears at random time
- [ ] Order spawn rate doubles during rush (15-20s)
- [ ] 5-second calm after rush ends
- [ ] Level 1: 1 rush event occurs
