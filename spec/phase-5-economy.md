# Phase 5 — Economy & Shop

## What to build in this phase
Implement the RM currency system, the Shop screen with tier unlocks and truck upgrades, and wire up all upgrade effects to gameplay. After this phase, the full progression loop works: play levels → earn RM → buy upgrades/tiers → unlock harder levels → repeat.

## Prerequisites
Phase 4 complete — all 55 dishes and 12 levels defined and playable.

---

## Currency: Ringgit (RM)

### Earning RM
- Every dish served: `dish.basePoints × 0.5 = base RM`
- Perfect dish bonus: ×1.5 RM (so a 100pt perfect dish = RM 75)
- Imperfect dish: ×0.4 RM (so a 100pt imperfect dish = RM 20)
- Overcooked dish: ×0.6 RM
- Level completion bonus: RM 200 (any), RM 400 (Silver), RM 600 (Gold)
- Tip Jar upgrade: +15% per level (multiplicative on all RM earnings)
- RM earned counter visible in HUD during gameplay (Fredoka 18px, gold "💰 RM 320")

### Spending RM
Only in the Shop screen. Cannot go negative.

### Persistence
- `totalRM` in save data = current spendable balance
- `lifetimeRM` in save data = total ever earned (for stats display only)
- Both auto-save at level complete and on visibility change

---

## Shop screen (`#screen-shop`)

### Layout
- Top: "SHOP" (Fredoka 36px yellow) + RM balance badge (Fredoka 24px gold, right-aligned)
- Below: 3 horizontal tab buttons → "🍜 Dishes" | "🚚 Upgrades" | (greyed out "🎨 Cosmetics — Coming Soon")
- Tab content area: scrollable grid
- Bottom: "← Back" button

### Tab 1: Dish tier unlocks (4 cards)

```js
const TIER_UNLOCKS = [
  { tier: 2, name: 'Street Staples',     cost: 500,   sampleDishes: ['🫓','🍚','🥞','🥟'] },
  { tier: 3, name: 'Hawker Mains',       cost: 1500,  sampleDishes: ['🍜','🍢','🫓','🍳'] },
  { tier: 4, name: 'Signature Dishes',   cost: 3000,  sampleDishes: ['🍜','🍖','🍛','🐟'] },
  { tier: 5, name: 'Chef Specials',      cost: 5000,  sampleDishes: ['🍛','🦴','🍝','🍗'] },
];
```

Each card shows:
- "TIER [N]: [name]" header (Fredoka 18px)
- Sample dish emojis (28px, horizontal row)
- "[N] dishes" count (Nunito 12px muted)
- Cost: "RM [cost]" (Fredoka 16px gold) OR "UNLOCKED ✅" (green)
- "UNLOCK" button (primary style) OR disabled if insufficient RM

On purchase: deduct RM, add tier to `saveData.unlockedTiers`, update card to "UNLOCKED", play chime.

### Tab 2: Truck upgrades (7 upgrades × 3 levels each)

```js
const TRUCK_UPGRADES = [
  {
    id: 'extraBurner', name: 'Extra Burner', icon: '🔥',
    costs: [400, 800, 1200],
    descriptions: [
      '3 cooking slots (base 2)',
      '4 cooking slots',
      '5 cooking slots'
    ]
  },
  {
    id: 'holdingStationPlus', name: 'Holding Station+', icon: '🍳',
    costs: [300, 600, 1000],
    descriptions: [
      '3 holding slots (base 2)',
      'Freshness lasts 45s (base 30s)',
      'Freshness lasts 60s'
    ]
  },
  {
    id: 'patientCustomers', name: 'Patient Customers', icon: '⏱️',
    costs: [300, 600, 1000],
    descriptions: [
      '+10% patience time',
      '+20% patience time',
      '+30% patience time'
    ]
  },
  {
    id: 'tipJar', name: 'Tip Jar', icon: '💰',
    costs: [500, 1000, 1500],
    descriptions: [
      '+15% RM earned',
      '+30% RM earned',
      '+45% RM earned'
    ]
  },
  {
    id: 'crowdPleaser', name: 'Crowd Pleaser', icon: '⭐',
    costs: [500, 1000, 1500],
    descriptions: [
      'Max combo ×4 (base ×3)',
      'Max combo ×5',
      'Max combo ×6'
    ]
  },
  {
    id: 'precisionChef', name: 'Precision Chef', icon: '🎯',
    costs: [400, 800, 1200],
    descriptions: [
      'PERFECT zone 30% (base 25%)',
      'PERFECT zone 35%',
      'PERFECT zone 40%'
    ]
  },
  {
    id: 'truckReliability', name: 'Truck Reliability', icon: '🔧',
    costs: [500, 1000, 2000],
    descriptions: [
      'Hazards −20%, fixes 1 tap shorter',
      'Hazards −35%, fixes 2 taps shorter',
      'Hazards −50%, most fixes 1-tap'
    ]
  },
];
```

Each card shows:
- Icon + name (16px)
- Level dots: ○○○ (empty) → ●○○ → ●●○ → ●●● (filled = owned, colour = orange)
- Current effect description (12px muted)
- Next level cost OR "MAX" badge if level 3
- "UPGRADE" button (primary) or disabled

On purchase: deduct RM, increment `saveData.upgrades[id]`, update dots and description, play chime.

### Wiring upgrade effects to gameplay

These MUST be applied during gameplay — not just stored:

```js
function getMaxCookingSlots() {
  return 2 + saveData.upgrades.extraBurner; // 2, 3, 4, or 5
}
function getMaxHoldingSlots() {
  return 2 + (saveData.upgrades.holdingStationPlus >= 1 ? 1 : 0); // 2 or 3
}
function getHoldingFreshness() {
  return [30, 30, 45, 60][saveData.upgrades.holdingStationPlus]; // seconds
}
function getPatienceMultiplier() {
  return 1 + (saveData.upgrades.patientCustomers * 0.10); // 1.0, 1.1, 1.2, 1.3
}
function getRMMultiplier() {
  return 1 + (saveData.upgrades.tipJar * 0.15); // 1.0, 1.15, 1.30, 1.45
}
function getMaxComboIndex() {
  return 4 + saveData.upgrades.crowdPleaser; // index into COMBO_MULTIPLIERS, expanded
}
function getPerfectZoneWidth() {
  return 0.25 + (saveData.upgrades.precisionChef * 0.05); // 0.25, 0.30, 0.35, 0.40
}
// Truck Reliability wiring is in Phase 6 (hazards)
```

### Tier-gating levels
Re-enable tier locking (Phase 4 had all tiers temporarily unlocked):
- Level 4 unlock condition: `saveData.unlockedTiers.includes(3)` — if not, show "Requires Tier 3 🔒" and a "🛒" tap-to-shop icon
- Level 7: requires Tier 4
- Level 10: requires Tier 5
- Level 12: requires gold on all previous 11 levels

---

## Phase 5 verification checklist

- [ ] RM earned during gameplay matches formula (basePoints × 0.5 × perfectBonus × tipJarBonus)
- [ ] RM counter visible in HUD and updates per dish served
- [ ] RM balance persists after closing and reopening the game
- [ ] Shop opens from title screen AND level select
- [ ] Shop shows correct RM balance at top
- [ ] Dishes tab: 4 tier cards with correct costs
- [ ] Tier unlock: tap → confirmation → RM deducted → card shows "UNLOCKED"
- [ ] After unlocking Tier 2, Tier 2 dishes appear in menu selection for eligible levels
- [ ] Insufficient RM: button is disabled, greyed out
- [ ] Upgrades tab: 7 upgrade cards with 3 levels each
- [ ] Upgrade purchase: RM deducted → dot fills → description updates
- [ ] Extra Burner: cooking slots increase from 2 to 3/4/5
- [ ] Holding Station+: slots increase to 3, freshness extends to 45s/60s
- [ ] Patient Customers: patience bars last 10/20/30% longer
- [ ] Tip Jar: RM earnings increase by 15/30/45%
- [ ] Crowd Pleaser: combo max extends to ×4/×5/×6
- [ ] Precision Chef: cook timer PERFECT zone visibly wider
- [ ] Maxed upgrades show "MAX" badge, no further purchase possible
- [ ] Level 4 is locked if Tier 3 not unlocked (shows requirement + shop link)
- [ ] Level 12 is locked if any previous level lacks gold medal
- [ ] Back button from Shop returns to previous screen correctly
- [ ] All purchases auto-save to localStorage
