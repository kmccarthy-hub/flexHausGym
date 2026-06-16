# FlexHaus "The Comeback" — Booking Page

A scroll-driven three.js WebGL experience for FlexHaus Gym's member-retention campaign. Built from Mateo's design spec and Tara's data diagnosis.

## Live URL

_Add your GitHub Pages URL here after deployment._

## Quick Start

Serve locally with any static file server:

```bash
# Using Python
python -m http.server 8080 --directory site

# Using Node
npx serve site

# Using VS Code Live Server
# Right-click index.html → Open with Live Server
```

Open `http://localhost:8080` in a browser.

## File Structure

```
site/
  index.html           # Single-page application
  assets/
    style.css          # Brand tokens, layout, states, fallbacks
    main.js            # Three.js scene, scroll choreography, form logic
    fallback.js        # WebGL detection and reduced-motion routing
  README.md            # This file
```

## Dependencies

- **Three.js r160** (CDN via importmap) — `https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js`
- **Google Fonts** — Anton (display) + Inter (body)
- Zero other dependencies. Vanilla JS.

## Features

- **4 scroll-driven 3D scenes:** Hero pulse, fly-through, proof cards, comeback card
- **Mobile-first:** Renders at 50% then upscales, DPR capped at 1.5, < 2.5s interactive
- **Accessible:** Keyboard-reachable, screen-reader-friendly, AA contrast, skip link
- **`prefers-reduced-motion`:** Falls back to static page with no animations
- **No-WebGL fallback:** Full booking functionality with zero 3D
- **Booking form:** Pre-selected Tuesday afternoon Strength with Marta, inline picker to change
- **Form states:** Loading spinner, success (checkmark + confirmation), error (inline + mailto fallback)

## Deployment (GitHub Pages)

1. Create a GitHub repository (e.g. `flexhaus-comeback`)
2. Push the `site/` directory contents to the `gh-pages` branch (or the root of your repo)
3. In GitHub repo settings → Pages → select branch and `/` (root)
4. Your URL will be `https://<username>.github.io/<repo>/`

### Quick deploy using gh CLI:

```bash
# From the project root (not site/)
git init
git add site/
git commit -m "Initial: FlexHaus Comeback booking page"
git remote add origin https://github.com/<username>/flexhaus-comeback.git
git branch -M main
git subtree push --prefix site origin main

# Or use gh:
gh repo create flexhaus-comeback --public --source=site --remote=origin --push
```

## Wiring the Form

The booking form uses a **mailto: fallback** by default (`hello@flexhaus.ie`). To wire Formspree:

1. Create a free Formspree form at https://formspree.io
2. Add `data-formspree="https://formspree.io/f/yourFormID"` to the `<form>` element in `index.html`
3. The form will POST to Formspree first, falling back to mailto:

## Performance Notes

- **Postprocessing bloom:** Replaced with additive-blended sprites for mobile perf
- **Particles:** Max 120 GPU particles, dynamically scaled by scroll section
- **Geometry:** InstancedMesh for columns (10 draw calls vs 10 individual meshes)
- **Lighting:** Point lights instead of shadow-casting spotlights

## Brand

| Token | Hex | Usage |
|-------|-----|-------|
| Carbon | `#0E1116` | Primary background |
| Chalk | `#F5F5F2` | Card bg, body text on dark |
| Volt | `#C6F24E` | Pulse line, CTA, accents |
| Ember | `#FF5A3C` | Success mark, error states |

## Accessibility

- Skip link to form as first tab stop
- Canvas `aria-hidden="true"` — all copy in real DOM
- `:focus-visible` outlines (2px Volt)
- Real `<label>`s on all inputs
- Error messages use `role="alert"` with `aria-live="polite"`
- Success message uses `role="status"`
- AA contrast on all text combinations
- Reduced-motion media query support
