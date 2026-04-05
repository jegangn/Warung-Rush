# Phase 6 — Hazards, Tutorial, Audio & Polish

## What to build in this phase
Implement the 7 kitchen hazards with fix mechanics, the interactive tutorial, all 17+ procedural sounds, the hardened auto-save system, and final polish. After this phase, the game is COMPLETE and ready for GitHub Pages deployment.

## Prerequisites
Phase 5 complete — economy, shop, upgrades, tier-gating all working.

---

## Kitchen hazards & maintenance

The food truck malfunctions mid-level. The player must fix equipment while orders and cook timers keep running. This is the final multi-tasking layer.

### 7 hazard types

| # | Hazard | Icon | What breaks | Effect while broken | Base fix taps | Fix sequence | Introduced |
|---|--------|------|-------------|---------------------|---------------|-------------|------------|
| 1 | Burner Jam | 🔧 | One cooking slot | Slot locked — cannot start cooking. Active cooks in OTHER slots continue. | 3 | 🔧→🔩→✅ | Level 2 |
| 2 | Fridge Door | 🧊 | Holding stations | ALL holding freshness drains 3× faster | 3 | 🧊→🔧→✅ | Level 3 |
| 3 | Gas Leak | 💨 | All cooking slots | Cook timers run 1.5× speed — dishes burn faster, PERFECT zone shrinks | 4 | 💨→🔧→🔩→✅ | Level 5 |
| 4 | Spill | 💧 | Prep station | 25% chance each ingredient tap registers the ADJACENT button instead | 3 | 💧→🧹→✅ | Level 6 |
| 5 | Power Flicker | ⚡ | HUD | Score + combo counter DISAPPEAR for 10s. Timer and orders still visible. | 2 (or auto 10s) | ⚡→🔧 | Level 8 |
| 6 | Pest Alert | 🐀 | One order queue | Queue BLOCKED (random left or right). Existing orders drain 2× faster. | 4 | 🐀→🧹→🧹→✅ | Level 9 |
| 7 | Engine Stall | 🚚 | Everything | ALL timers freeze 3s, then run 1.3× for 15s | UNFIXABLE | — | Level 11 |

### Spawn rules (implement EXACTLY):
- Separate interval timer from order spawns
- Base interval: 25,000-40,000ms (randomised)
- Truck Reliability upgrade reduction: `interval × (1 - [0, 0.20, 0.35, 0.50][upgradeLevel])`
- Level scaling: multiply by `Math.max(0.4, 1 - ((level - 2) × 0.04))`
- Grace period: no hazards in first 15 seconds of level
- Max 2 active hazards simultaneously (never 3)
- Cannot spawn same hazard type that's already active
- CAN spawn during rush events
- Level 1: no hazards at all

### Fix taps reduced by Truck Reliability upgrade:
```js
const actualTaps = Math.max(1, baseTaps - saveData.upgrades.truckReliability);
```

### Hazard UI implementation:
1. **Alert**: Large icon + name flashes centre-screen for 1s ("🔧 BURNER JAM!"), warning sound plays
2. **Affected element**: Red pulsing border (`2px solid #d4392e`, CSS pulse), semi-transparent red overlay
3. **Fix button**: Flashing "🔧 FIX" button appears ON the broken element (60×60px, yellow bg, pulse animation)
4. **Fix overlay**: When fix button is tapped, show fix sequence as large buttons (80×80px each) in a centred row overlay. Game does NOT pause — orders/timers continue behind the overlay.
5. **Each correct fix tap**: wrench-click sound, button turns green, next button highlights
6. **Wrong fix tap**: buzz sound, 200ms lockout delay
7. **Fix complete**: "FIXED! ✅" floating text (green), repair sound, element returns to normal, overlay closes

### Hazard effects — implementation per type:

**Burner Jam**: Pick a random occupied (or first available) cooking slot. Add `disabled` flag. Its UI shows red X overlay. `startCooking()` must check for non-disabled slots.

**Fridge Door**: Set `fridgeDoorBroken = true`. In holding station update loop: multiply freshness drain by 3.

**Gas Leak**: Set `gasLeakActive = true`. In cooking slot update loop: multiply elapsed time by 1.5. Recalculate PERFECT zone boundaries: `perfectStart = 0.60 - gasLeakShift, perfectEnd = 0.60 + getPerfectZoneWidth() - gasLeakShift` (the zone itself is narrower because time moves faster).

**Spill**: Set `spillActive = true`. In ingredient tap handler: `if (spillActive && Math.random() < 0.25) { actualTappedIndex = adjacentRandomIndex; }`

**Power Flicker**: Set `powerFlickerActive = true`. Hide score and combo display elements. Auto-resolve after 10s OR immediately on 2-tap fix.

**Pest Alert**: Pick random queue (left or right). Set `blockedQueue = 'left'|'right'`. No new orders placed on that side. Patience drain ×2 for existing orders on that side.

**Engine Stall**: Freeze all timers (set `engineStallFrozen = true`). After 3s: unfreeze with 1.3× time multiplier on ALL systems for 15s. Then return to normal. Cannot be fixed.

---

## Interactive tutorial

### When it triggers:
- First launch (no save data, `tutorialCompleted === false`): START button goes to tutorial
- "How to Play" button on title: replays tutorial anytime

### 5-step guided flow (~60 seconds total):

**Step 1 — "Orders come in!"** (10s)
- Single Teh Tarik order appears in left queue
- Large pulsing yellow arrow points at it
- Floating text: "Tap the order to start cooking"
- ALL other inputs disabled. Game is paused.
- On tap: order highlights, prep station loads → Step 2

**Step 2 — "Follow the recipe!"** (15s)
- Prep station shows Teh Tarik: ☕ Tea → 🥛 Condensed milk → 👋 Pull
- The CORRECT ingredient button has golden pulsing glow border
- All OTHER buttons disabled (cannot make mistakes in this step)
- Floating text: "Tap the highlighted ingredient"
- On each correct tap: ingredient adds with green flash, arrow moves to next
- After all 3 taps → Step 3

**Step 3 — "Serve the dish!"** (5s)
- SERVE button appears with pulsing golden glow
- Floating text: "Tap SERVE to complete the order!"
- On tap: "PERFECT! +60" floating text, chime sound
- Brief pause (1s), then → Step 4

**Step 4 — "Now on your own!"** (20s)
- Floating text: "A new order is coming. Watch out for wrong ingredients!"
- Kopi O order spawns (3-step dish)
- No guided highlights — player must READ the recipe and pick
- All buttons enabled — mistakes possible
- Wrong tap: red flash + "Oops! Try again!" (no penalty counted)
- Patience bar is frozen (cannot expire during tutorial)
- On successful serve → Step 5
- If they somehow get stuck (15s of no taps), show hint highlighting correct button

**Step 5 — "You're ready!"** (10s)
- Summary card overlay:
  - ✅ Tap orders to cook
  - ✅ Follow the recipe steps
  - ✅ Serve before time runs out
  - ✅ Chain combos for bonus points
  - 💰 Earn RM to unlock new dishes and upgrades
  - 🔥 Some dishes need cooking time — manage multiple orders!
- "START COOKING →" button (primary style)
- On tap: set `saveData.tutorialCompleted = true`, save, transition to LEVEL_SELECT

### Tutorial overlay styling:
- Semi-transparent dark background behind floating text/arrows
- Floating text: Fredoka 20px, white with dark shadow, centred
- Arrows: CSS animated, yellow, pulsing
- Summary card: `#3d2218` bg, rounded 16px, padding 24px

---

## Audio — all 17+ sounds via Web Audio API

**NO external audio files.** All sounds generated procedurally using OscillatorNode + GainNode.

### AudioManager implementation:
```js
const AudioManager = {
  ctx: null,
  enabled: true,
  
  init() {
    // Called on first user tap (Safari requires user gesture)
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.enabled = saveData.settings.soundEnabled;
  },
  
  play(type, freq, duration, waveform = 'sine') {
    if (!this.ctx || !this.enabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = waveform;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },
  
  toggle() {
    this.enabled = !this.enabled;
    saveData.settings.soundEnabled = this.enabled;
    SaveManager.save(saveData);
  },
  
  // === Individual sound methods ===
  correctTap()    { this.play('sine', 200, 0.1); setTimeout(() => this.play('sine', 400, 0.1), 50); },
  wrongTap()      { this.play('square', 100, 0.2); },
  serve()         { this.play('sine', 600, 0.1); setTimeout(() => this.play('sine', 800, 0.15), 80); },
  perfectServe()  { this.play('sine', 600, 0.08); setTimeout(() => this.play('sine', 800, 0.08), 60); setTimeout(() => this.play('sine', 1000, 0.15), 120); },
  orderExpired()  { /* descending 400→100Hz sawtooth 300ms */ },
  comboUp()       { this.play('sine', 500, 0.1); setTimeout(() => this.play('sine', 700, 0.12), 80); },
  cookReady()     { this.play('sine', 800, 0.05); setTimeout(() => this.play('sine', 800, 0.05), 100); },
  cookOvercooked(){ this.play('square', 300, 0.15); },
  cookBurnt()     { this.play('square', 150, 0.2); setTimeout(() => this.play('square', 200, 0.2), 100); },
  rushStart()     { /* rising sawtooth 200→600Hz 500ms */ },
  rushEnd()       { /* falling sawtooth 600→200Hz 300ms */ },
  holdingAutoServe(){ this.play('sine', 1200, 0.03); },
  customCorrect() { this.play('sine', 400, 0.05); setTimeout(() => this.play('sine', 500, 0.06), 40); },
  levelComplete() { [262,330,392,523].forEach((f,i) => setTimeout(() => this.play('sine',f,0.15), i*120)); },
  countdownTick() { this.play('sine', 1000, 0.05); },
  trash()         { this.play('sine', 80, 0.1); },
  hazardAlert()   { this.play('square', 300, 0.1); setTimeout(() => this.play('square', 150, 0.1), 80); },
  wrenchClick()   { this.play('sine', 500, 0.04); setTimeout(() => this.play('triangle', 300, 0.03), 30); },
  repairComplete(){ this.play('square', 200, 0.05); setTimeout(() => this.play('sine', 800, 0.2), 60); },
  engineStall()   { /* deep sawtooth 80→30Hz 800ms with vibrato */ },
  spillSplat()    { /* noise burst — create buffer with random values, 100ms, bandpass */ },
};
```

### Mute toggle:
Add 🔊/🔇 button in HUD (next to pause). Taps `AudioManager.toggle()`. State persists via `saveData.settings.soundEnabled`.

---

## Auto-save hardening

### Save data structure (final version):
```js
defaults() {
  return {
    version: 2,
    tutorialCompleted: false,
    levelsUnlocked: 1,
    bestScores: new Array(12).fill(0),
    bestMedals: new Array(12).fill(0), // 0=none, 1=bronze, 2=silver, 3=gold
    totalRM: 0,
    lifetimeRM: 0,
    unlockedTiers: [1],
    upgrades: {
      extraBurner: 0, holdingStationPlus: 0, patientCustomers: 0,
      tipJar: 0, crowdPleaser: 0, precisionChef: 0, truckReliability: 0
    },
    settings: { soundEnabled: true },
    totalDishesServed: 0,
    totalPerfectDishes: 0,
    totalPlayTimeSeconds: 0,
    lastPlayedLevel: null,
    lastPlayedDate: null,
  };
}
```

### Auto-save triggers (ALL must call SaveManager.save):
1. Level complete
2. Level quit/fail
3. Shop purchase
4. Tutorial completion
5. `visibilitychange` → `document.visibilityState === 'hidden'` (MOST CRITICAL — iOS kills background tabs)
6. `pagehide` event (more reliable on iOS Safari)
7. `beforeunload` event (fallback)

### Visibility-based save with auto-pause:
```js
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    if (gameState === 'PLAYING') pauseGame();
    SaveManager.save(saveData);
  }
});
window.addEventListener('pagehide', () => SaveManager.save(saveData));
```

### Reset Progress:
"Reset Progress" on title screen → first tap changes text to "Tap again to confirm reset" (red) → second tap within 3 seconds calls `SaveManager.reset()` (clears localStorage, reloads page).

---

## Final polish checklist

### Level complete screen (ensure all stats tracked):
- Dishes served, Perfect dishes, Overcooked, Mistakes, Expired
- Hazards fixed, Dishes burnt, Holding station auto-serves
- Show all stats even if 0

### Pre-level screen refinement:
- Show modifier badges with tooltips (tap to see description)
- Show hazard warning icons for that level's introduced hazards
- Show medal targets (calculated dynamically)
- Show "Required dish" if level has one (locked in menu selection)

### Performance:
- Verify 60fps during Level 12 (max chaos: all modifiers + hazards + rush + max orders)
- No DOM memory leaks — remove floating text elements after animation ends
- Cancel all setTimeouts/setIntervals when leaving PLAYING screen

---

## Phase 6 verification checklist

### Kitchen hazards
- [ ] Level 1: no hazards spawn
- [ ] Level 2+: Burner Jam spawns — cooking slot gets red X, cannot cook in it
- [ ] Level 3+: Fridge Door — holding freshness drains 3× faster
- [ ] Level 5+: Gas Leak — cook timers run 1.5× speed, PERFECT zone shrinks
- [ ] Level 6+: Spill — 25% of taps misfire to adjacent button
- [ ] Level 8+: Power Flicker — score/combo HUD vanishes 10 seconds
- [ ] Level 9+: Pest Alert — one queue blocked, patience drains 2× on that side
- [ ] Level 11+: Engine Stall — freeze 3s then 1.3× for 15s (unfixable)
- [ ] Hazard alert flashes with icon + name + sound
- [ ] Fix button appears on broken element
- [ ] Fix sequence overlay: game runs behind it (not paused)
- [ ] Wrong fix tap: buzz + 200ms lockout
- [ ] Fix complete: "FIXED! ✅" + repair sound + element restored
- [ ] Max 2 concurrent hazards
- [ ] 15-second grace period at level start
- [ ] Truck Reliability upgrade reduces frequency and fix tap count
- [ ] Pause freezes hazard timers and effects

### Tutorial
- [ ] First launch → START triggers tutorial
- [ ] Step 1: arrow points at order, all else disabled, tapping loads prep
- [ ] Step 2: correct button highlighted/pulsing, wrong buttons disabled
- [ ] Step 3: SERVE button works
- [ ] Step 4: unguided — mistakes show error but no penalty, patience frozen
- [ ] Step 5: summary card → START COOKING → level select
- [ ] tutorialCompleted saved to localStorage
- [ ] "How to Play" replays tutorial

### Audio
- [ ] AudioContext initialised on first user tap
- [ ] All 17+ sounds play at correct events
- [ ] Mute button (🔊/🔇) in HUD toggles all sounds
- [ ] Mute state persists across sessions
- [ ] No audio errors in console

### Auto-save
- [ ] Complete level → close tab → reopen → ALL data preserved (scores, RM, upgrades, tiers, medals)
- [ ] Mid-level → switch apps (background Safari) → return → game paused, no data lost
- [ ] Shop purchase → close tab → reopen → purchase preserved
- [ ] Reset Progress requires double-tap confirmation, clears EVERYTHING

### Final integration
- [ ] All 12 levels playable with full systems (cooking, custom, hazards, economy)
- [ ] Level 12 is the ultimate challenge (all modifiers + all hazards + fastest spawns)
- [ ] Progression feels satisfying: early levels easy, final levels genuinely challenging
- [ ] Game works fully offline after first load
- [ ] iPad home screen launch: fullscreen, dark splash, no Safari chrome
- [ ] 60fps sustained during Level 12 with max chaos
