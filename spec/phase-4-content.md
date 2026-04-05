# Phase 4 — Full Content (55 Dishes + 12 Levels)

## What to build in this phase
Add all remaining dishes (Tier 2-5), all 12 level configurations, difficulty modifiers, and VIP/Double order mechanics. After this phase, all levels are playable with the full dish roster (assuming tiers are unlocked — economy comes in Phase 5).

## Prerequisites
Phase 3 complete — all three cooking mechanics working, holding stations, menu selection, rush events.

## IMPORTANT implementation notes
- Convert ALL dish tables below into JS objects in the DISHES array, following the same structure as the Tier 1 dishes from Phase 2
- For every 📋 Custom dish, create a `customSlots` array defining each choice point with all options, following the schema from Phase 3
- For every 🔥 Cook dish, include a `cookTime` property in seconds
- For Tier 5 dishes that say "generate custom schemas following the same pattern" — actually CREATE 4-6 customSlots per dish with 2-4 options each. Do NOT leave them as stubs.
- All 12 LEVELS must be defined as a `LEVELS` array with the exact configs from the tables below

## Temporary for this phase
- All dish tiers are temporarily unlocked (no shop/economy yet — Phase 5 adds that)
- Hazards are defined in level config but NOT implemented yet (Phase 6 adds that)
- Medal thresholds: calculate dynamically as `basePts × (levelDuration / avgSpawnInterval) × multiplier` with Bronze=35%, Silver=60%, Gold=85%

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

---

## Phase 4 verification checklist

### Dish data
- [ ] DISHES array contains exactly 55 entries
- [ ] Each dish has: id, name, emoji, tier, cookType, basePoints, basePatienceSec
- [ ] All ⚡ dishes have prepSteps array
- [ ] All 🔥 dishes have prepSteps + cookTime
- [ ] All 📋 dishes have customSlots with options arrays
- [ ] All 📋🔥 dishes have BOTH customSlots AND cookTime
- [ ] Tier 5 dishes have 4-6 customSlots each (not stubs)
- [ ] No duplicate dish IDs

### Level data
- [ ] LEVELS array contains exactly 12 entries
- [ ] Each level has: level, name, subtitle, duration, availableTiers, spawnInterval, maxActiveOrders, rushCount, modifiers, unlockCondition
- [ ] Level 1: Tier 1 only, no modifiers
- [ ] Level 4: requires Tier 3, adds Impatient Crowd modifier
- [ ] Level 7: requires Tier 4, adds VIP Customer
- [ ] Level 12: requires gold on all previous, Festival Frenzy
- [ ] Menu select shows correct dish pool per level's available tiers
- [ ] Pre-level screen shows correct modifiers per level

### Difficulty modifiers
- [ ] Impatient Crowd (Level 4+): patience bars deplete 20% faster
- [ ] Lunch Rush (Level 5+): spawn interval reduced by 25%
- [ ] Picky Eater (Level 6+): 30% of orders get custom variants
- [ ] VIP Customer (Level 7+): one gold-bordered order with ⭐, half patience, 2× points
- [ ] Double Order (Level 8+): 20% of orders show ×2 badge, must serve dish twice
- [ ] Level 12: all modifiers active simultaneously

### Playability
- [ ] Can play Level 1 through Level 12 (with all tiers temporarily unlocked)
- [ ] Each level feels progressively harder
- [ ] Spawn rates match level config
- [ ] Rush event count matches level config
- [ ] Medal thresholds are reasonable (achievable but not trivial)
