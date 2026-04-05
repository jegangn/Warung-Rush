# Phase 2 Patch — Recipe Stacking + Chef Avatar

## What to add
Two visual features on top of existing Phase 2 gameplay. Do NOT rebuild anything — patch these into the existing code.

---

## Feature 1: Recipe Builder — Visual Ingredient Stacking

Replace the current text-based assembly area (the checklist with ✅ and step highlights) with a VISUAL plate where ingredients physically stack on top of each other as the player adds them.

### Layout
The centre prep station middle area becomes a visual assembly zone:

```
┌─────────────────────────────────────┐
│  🍚 Nasi Lemak      Step 3 of 5    │  ← dish name + progress (unchanged)
│                                     │
│         ┌─────────────────┐         │
│         │                 │         │
│         │    🥒 ← newest  │         │
│         │    🐟           │         │
│         │    🌶️           │         │
│         │    🍚 ← base    │         │
│         │   ═══════════   │  plate  │
│         └─────────────────┘         │
│                                     │
│  [ingredient buttons grid below]    │
└─────────────────────────────────────┘
```

### Implementation

#### Plate container
```html
<div id="plate-area" style="
  position: relative;
  width: 200px;
  height: 220px;
  margin: 0 auto;
">
  <!-- Plate base: a CSS oval at the bottom -->
  <div id="plate-base" style="
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 180px;
    height: 24px;
    background: #8a6e52;
    border-radius: 50%;
    border: 2px solid #c4a882;
  "></div>
  
  <!-- Ingredients stack here, positioned absolutely from bottom up -->
  <div id="ingredient-stack" style="
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
  ">
    <!-- Ingredients are appended here dynamically -->
  </div>
</div>
```

#### Ingredient sprite (created when player taps correct ingredient)
Each ingredient added to the stack is a `<div>` with:
```js
function addIngredientToStack(step) {
  const sprite = document.createElement('div');
  sprite.className = 'stacked-ingredient';
  sprite.textContent = step.emoji;
  sprite.style.fontSize = '36px';
  sprite.style.height = '38px';
  sprite.style.lineHeight = '38px';
  sprite.style.textAlign = 'center';
  sprite.style.width = '100%';
  
  // Entry animation: ingredient drops in from above
  sprite.style.animation = 'ingredientDrop 0.3s ease-out';
  
  document.getElementById('ingredient-stack').appendChild(sprite);
}
```

#### Stacking Y-offsets
Each ingredient occupies 38px of vertical height. They stack using `flex-direction: column-reverse` so the first ingredient (base) is at the bottom and each new ingredient appears on top. The plate container has a max height of 220px, which accommodates up to 5 visible layers (38px × 5 = 190px above the plate base).

For dishes with 6+ ingredients: when the stack exceeds the visible area, the entire stack smoothly scrolls down so the newest ingredient is always visible:
```js
if (stackElement.scrollHeight > stackElement.clientHeight) {
  stackElement.scrollTop = stackElement.scrollHeight;
}
```

#### Drop animation
```css
@keyframes ingredientDrop {
  0% {
    opacity: 0;
    transform: translateY(-30px) scale(1.3);
  }
  60% {
    opacity: 1;
    transform: translateY(5px) scale(0.95);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.stacked-ingredient {
  animation: ingredientDrop 0.3s ease-out forwards;
}
```

#### Wrong ingredient — wobble the stack
When the player taps a WRONG ingredient, the entire plate + stack wobbles:
```css
@keyframes stackWobble {
  0%, 100% { transform: translateX(-50%) rotate(0deg); }
  20% { transform: translateX(-50%) rotate(-3deg); }
  40% { transform: translateX(-50%) rotate(3deg); }
  60% { transform: translateX(-50%) rotate(-2deg); }
  80% { transform: translateX(-50%) rotate(1deg); }
}
```
Apply to `#plate-area` for 400ms, then remove.

#### Serve animation — plate flies to the order card
When the player taps SERVE:
1. The plate + stack scales down slightly (0.9) and lifts up (translateY -10px) over 200ms
2. Then flies toward the order card position using CSS `transition` with absolute coordinates
3. As it reaches the card: plate fades out, order card plays its serve reaction
4. Then plate area resets to empty for next order

```css
@keyframes plateServe {
  0% { transform: scale(1) translateY(0); opacity: 1; }
  30% { transform: scale(0.9) translateY(-10px); opacity: 1; }
  100% { transform: scale(0.3) translateY(-100px) translateX(var(--serve-x)); opacity: 0; }
}
```

#### Clear stack on order switch
When the player taps a different order card, the stack must update:
- Save current stack state to the order object: `order.stackEmojis = [...]`
- Load the new order's stack state (or empty if fresh)
- Stack rebuilds instantly (no animation) from saved state

---

## Feature 2: Chef Avatar — Dynamic Feedback Character

A chef character displayed in the top-left corner of the gameplay screen that reacts to the player's performance in real-time. This is NOT a customer — it's YOUR avatar, the cook running the food truck.

### Chef avatar placement
```
┌──────────────────────────────────────────────────┐
│ 👨‍🍳      SCORE 1250   💰 RM 320   ×2    ⏱ 0:45  ⏸│
│ "Sedap!"                                         │
└──────────────────────────────────────────────────┘
```
Position: left side of HUD bar, 48×48px area. Below the avatar: a small speech bubble text (Nunito 11px, max 60px wide, fades after 2 seconds).

### Chef states (6 moods)

Each state has an emoji face and a set of Malaysian catchphrases that appear in the speech bubble:

| State | Emoji | Trigger | Speech bubble (random pick) | Duration |
|-------|-------|---------|---------------------------|----------|
| **Idle** | 👨‍🍳 | Default / no active order | "..." | Persistent |
| **Cooking** | 😊 | Player is actively prepping (tapping ingredients) | "Masak!" / "Jom!" / "Boleh!" | While prepping |
| **Exhilarated** | 🤩 | Perfect serve completed in < 5 seconds | "SEDAP!" / "Terbaik!" / "Power!" / "Gempak!" | 2 seconds |
| **Stressed** | 😰 | Level timer > 50% elapsed AND score < 50% of silver medal target | "Alamak..." / "Cepat!" / "Aduh..." | Persistent while condition met |
| **Panic** | 😱 | Wrong ingredient tapped OR order about to expire (<15% patience) | "AIYOOO!" / "Salah!" / "Tak betul!" | 1.5 seconds |
| **Devastated** | 😭 | Dish burnt OR order expired | "Habis..." / "Mampus..." / "Rosak..." | 2 seconds |

### State priority (highest wins when multiple conditions are true)
```
Devastated > Panic > Exhilarated > Stressed > Cooking > Idle
```

### Implementation

```js
const CHEF_STATES = {
  idle:         { emoji: '👨‍🍳', phrases: ['...'] },
  cooking:      { emoji: '😊',  phrases: ['Masak!', 'Jom!', 'Boleh!', 'Cun!'] },
  exhilarated:  { emoji: '🤩',  phrases: ['SEDAP!', 'Terbaik!', 'Power!', 'Gempak!', 'Syok!'] },
  stressed:     { emoji: '😰',  phrases: ['Alamak...', 'Cepat!', 'Aduh...', 'Susah ni...'] },
  panic:        { emoji: '😱',  phrases: ['AIYOOO!', 'Salah!', 'Tak betul!', 'Eh eh eh!'] },
  devastated:   { emoji: '😭',  phrases: ['Habis...', 'Mampus...', 'Rosak...', 'Hancur...'] },
};

let chefState = 'idle';
let chefStateTimer = null;  // for timed states (exhilarated, panic, devastated)

function setChefState(newState, durationMs = null) {
  // Priority check: don't downgrade from a higher priority timed state
  const priority = ['idle', 'cooking', 'stressed', 'exhilarated', 'panic', 'devastated'];
  const currentPriority = priority.indexOf(chefState);
  const newPriority = priority.indexOf(newState);
  
  // Only upgrade or replace expired states
  if (newPriority < currentPriority && chefStateTimer) return;
  
  chefState = newState;
  const state = CHEF_STATES[newState];
  
  // Update avatar emoji
  document.getElementById('chef-emoji').textContent = state.emoji;
  
  // Show random speech bubble
  const phrase = state.phrases[Math.floor(Math.random() * state.phrases.length)];
  showChefBubble(phrase);
  
  // Timed state: revert after duration
  if (chefStateTimer) clearTimeout(chefStateTimer);
  if (durationMs) {
    chefStateTimer = setTimeout(() => {
      chefStateTimer = null;
      // Revert to contextual state
      updateChefContextualState();
    }, durationMs);
  }
}

function updateChefContextualState() {
  // Called by game loop to set the "background" state
  if (chefStateTimer) return; // don't override timed states
  
  const timerRatio = levelTimeRemaining / levelDuration;
  const scoreRatio = score / silverMedalThreshold;
  
  if (timerRatio < 0.5 && scoreRatio < 0.5) {
    setChefState('stressed');
  } else if (activeOrder) {
    setChefState('cooking');
  } else {
    setChefState('idle');
  }
}
```

### When to trigger each state:

```js
// In the correct ingredient tap handler:
// Track time when order was first selected
if (order.mistakes === 0) {
  setChefState('cooking'); // already cooking, stays cooking
}

// In the wrong ingredient tap handler:
setChefState('panic', 1500);

// In the serve handler:
const serveTime = (performance.now() - order.firstInteractionTime) / 1000;
if (order.mistakes === 0 && serveTime < 5) {
  setChefState('exhilarated', 2000);
} else if (order.mistakes === 0) {
  setChefState('exhilarated', 1500);
}

// In the order expired handler:
setChefState('devastated', 2000);

// In the burnt dish handler:
setChefState('devastated', 2000);

// In the game loop (called every frame):
updateChefContextualState();
```

### Chef avatar UI

```html
<div id="chef-container" style="
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 56px;
  position: relative;
">
  <div id="chef-emoji" style="
    font-size: 36px;
    line-height: 40px;
    transition: transform 0.2s;
  ">👨‍🍳</div>
  <div id="chef-bubble" style="
    font-family: 'Nunito', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: #f5c542;
    text-align: center;
    max-width: 70px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s;
  "></div>
</div>
```

### Chef avatar animations per state:
```css
/* Exhilarated: chef bounces with joy */
@keyframes chefBounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-6px) rotate(-5deg); }
  75% { transform: translateY(-6px) rotate(5deg); }
}

/* Panic: chef shakes head rapidly */
@keyframes chefPanic {
  0%, 100% { transform: rotate(0deg); }
  20% { transform: rotate(-8deg); }
  40% { transform: rotate(8deg); }
  60% { transform: rotate(-6deg); }
  80% { transform: rotate(6deg); }
}

/* Stressed: chef sweats (slight tremble) */
@keyframes chefStress {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(1px); }
}

/* Devastated: chef droops */
@keyframes chefDroop {
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(4px) scale(0.95); }
  100% { transform: translateY(2px) scale(0.97); }
}
```

Apply the matching animation to `#chef-emoji` when the state changes. Remove the old animation class and add the new one.

### Speech bubble behaviour:
```js
function showChefBubble(text) {
  const bubble = document.getElementById('chef-bubble');
  bubble.textContent = text;
  bubble.style.opacity = '1';
  
  // Clear previous fade timer
  if (bubble._fadeTimer) clearTimeout(bubble._fadeTimer);
  
  // Fade out after 2 seconds
  bubble._fadeTimer = setTimeout(() => {
    bubble.style.opacity = '0';
  }, 2000);
}
```

---

## Verification checklist

### Recipe stacking
- [ ] Plate visual appears in centre of prep station (oval base + stack area)
- [ ] Tapping correct ingredient: emoji drops onto stack from above with bounce animation
- [ ] Ingredients stack bottom-to-top (first ingredient = base of plate)
- [ ] Each ingredient is visually distinct (36px emoji, 38px height per layer)
- [ ] Stack accommodates up to 8 ingredients (scrolls if needed)
- [ ] Tapping wrong ingredient: entire plate + stack wobbles (rotate animation)
- [ ] SERVE: plate shrinks, lifts, flies toward order card, fades out
- [ ] Switching between orders: stack saves/restores correctly per order
- [ ] Empty prep station shows plate without any ingredients

### Chef avatar
- [ ] Chef emoji (👨‍🍳) visible in HUD area, left side
- [ ] Idle state when no order selected
- [ ] Cooking state (😊 + "Masak!"/"Jom!") when actively prepping
- [ ] Exhilarated state (🤩 + "SEDAP!"/"Terbaik!") when perfect serve < 5 seconds
- [ ] Stressed state (😰 + "Alamak...") when timer > 50% gone AND score is low
- [ ] Panic state (😱 + "AIYOOO!") when wrong ingredient tapped
- [ ] Devastated state (😭 + "Habis...") when dish burnt or order expired
- [ ] Speech bubble appears with random Malay phrase, fades after 2 seconds
- [ ] State priority works: devastated overrides panic overrides exhilarated etc.
- [ ] Chef animations play: bounce (exhilarated), shake (panic), tremble (stressed), droop (devastated)
- [ ] States revert to contextual state after their timer expires
