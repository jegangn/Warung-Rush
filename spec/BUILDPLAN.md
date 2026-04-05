# Warung Rush — Master Build Plan

## READ THIS FIRST — Instructions for Claude Code

This game is built in 6 sequential phases. Each phase has its own spec file in `/spec/`. You MUST:

1. **Read the current phase spec file COMPLETELY before writing any code**
2. **Build ONLY what that phase specifies — no more, no less**
3. **Run the verification checklist at the end of each phase** before moving to the next
4. **Never simplify, skip, or paraphrase game mechanics.** If the spec says "25% chance of registering the adjacent button", implement EXACTLY that — not a simpler version.
5. **Ask me to confirm each phase is complete before starting the next one**

## Project structure

```
warung-rush/
├── index.html                ← The game (all CSS + JS inline)
├── manifest.json             ← Web app manifest for PWA install
├── sw.js                     ← Service worker for offline play
├── icons/
│   ├── icon-192.png          ← Generated via helper page
│   ├── icon-512.png
│   └── apple-touch-icon.png
├── generate-icons.html       ← One-time helper to create icon PNGs
└── spec/                     ← Build spec files (reference only, not deployed)
    ├── phase-1-scaffold.md
    ├── phase-2-core-gameplay.md
    ├── phase-3-cooking-mechanics.md
    ├── phase-4-content.md
    ├── phase-5-economy.md
    └── phase-6-hazards-polish.md
```

All game code goes in `index.html` (inline CSS + JS). No build tools, no npm.

## Build phases

| Phase | Scope | Depends on |
|-------|-------|------------|
| 1 | Project scaffold: PWA files, HTML skeleton, screen state machine, visual theme, iPad lockdown | Nothing |
| 2 | Core gameplay: Tier 1 dishes (11), Instant Serve mechanic, order queue, patience timers, scoring, combo, basic HUD | Phase 1 |
| 3 | Advanced cooking: Cook & Serve (cooking slots + burn timers), Custom Orders (choice UI + EXTRA/NO), holding stations, menu selection, trash, rush events | Phase 2 |
| 4 | Full content: All 55 dishes (Tiers 1-5) with cook types + custom order schemas, 12 levels across Malaysia, difficulty modifiers | Phase 3 |
| 5 | Economy: RM currency, Shop screen (3 tabs), tier unlocks, 7 truck upgrades with gameplay effects | Phase 4 |
| 6 | Hazards + polish: 7 kitchen hazards, interactive tutorial, procedural audio (17 sounds), auto-save system, final testing | Phase 5 |

## How to start each phase

Say to Claude Code:
```
Read spec/phase-N-<name>.md completely, then implement everything it specifies.
Do not skip or simplify any mechanic. Build exactly what the spec describes.
When done, run through the verification checklist at the bottom of the spec file.
```

## Critical rules (apply to ALL phases)

### Target device
- iPad landscape (1024×768 minimum), touch only, 60×60px min tap targets
- Prevent zoom/scroll/bounce: viewport meta + `touch-action: none` + `overscroll-behavior: none`
- Safe area padding: `env(safe-area-inset-*)`

### External resources
- Google Fonts ONLY: `Fredoka` (400-700) + `Nunito` (400-800)
- NO other CDN, library, or external asset

### Visual theme
- Dark warm palette: `#1a0e0a` / `#2d1810` / `#3d2218` / `#4a2a1c`
- Accents: `#f5c542` (yellow) / `#e8842a` (orange) / `#d4392e` (red) / `#4caf50` (green)
- Text: `#fef3e0` (primary) / `#c4a882` (muted) / `#8a6e52` (dim)
- Fredoka for headings/scores/buttons, Nunito for body/labels
- Emoji for all icons — no SVG, no icon libraries
- CSS-only animations, GPU-accelerated (transforms/opacity only)

### Code quality
- All JS logically sectioned with `// ===== SECTION NAME =====` comment headers
- Cache DOM element references — never query the same element twice
- Clean up intervals/timeouts on screen transitions
- 60fps target — use requestAnimationFrame, avoid layout thrashing
