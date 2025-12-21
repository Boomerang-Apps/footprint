# CTO Decision: Light Theme for Footprint

**Decision ID**: CTO-002
**Date**: 2025-12-20
**Status**: APPROVED
**Author**: CTO Agent

---

## Decision

**Footprint will use a LIGHT THEME** inspired by Whitespace.co.il, replacing the current dark theme.

## Rationale

1. **Brand Positioning**: Light theme conveys premium, clean, gift-worthy aesthetic
2. **Market Fit**: Israeli e-commerce (Whitespace.co.il) demonstrates light themes perform well
3. **Product Presentation**: Art prints look better on white/neutral backgrounds
4. **Trust & Warmth**: Light themes feel more welcoming for gift-giving context
5. **Hebrew Typography**: Heebo font renders cleaner on light backgrounds

## Design System

### Color Palette

```css
:root {
  /* Brand Colors - Unchanged */
  --brand-purple: #8b5cf6;
  --brand-pink: #ec4899;
  --brand-gradient: linear-gradient(to left, #8b5cf6, #ec4899);

  /* Text - NEW */
  --text-primary: #1a1a1a;
  --text-secondary: #525252;
  --text-muted: #737373;

  /* Backgrounds - NEW */
  --bg-white: #ffffff;
  --bg-light: #fafafa;
  --bg-soft: #f5f5f5;

  /* Borders - NEW */
  --border-light: #e5e5e5;
  --border-soft: #ebebeb;

  /* Shadows - NEW */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);
}
```

### Tailwind Mapping

| Token | Tailwind Class |
|-------|---------------|
| `--bg-white` | `bg-white` |
| `--bg-light` | `bg-zinc-50` |
| `--bg-soft` | `bg-zinc-100` |
| `--text-primary` | `text-zinc-900` |
| `--text-secondary` | `text-zinc-600` |
| `--text-muted` | `text-zinc-500` |
| `--border-light` | `border-zinc-200` |

### Component Updates Required

| Component | Change |
|-----------|--------|
| `body` | `bg-white text-zinc-900` |
| Cards | `bg-white border-zinc-200 shadow-sm` |
| Buttons Secondary | `bg-white border-zinc-200 text-zinc-900` |
| Navigation | `bg-white/95 backdrop-blur border-zinc-200` |
| Footer | `bg-zinc-50 border-zinc-200` |
| Inputs | `bg-white border-zinc-200` |

## Branding Update

| Element | Old | New |
|---------|-----|-----|
| Brand Name | Footprint | **פוטפרינט** |
| AI Badge | "AI Powered" | **מונע בינה מלאכותית** |
| Copyright | © 2024 Footprint | © 2025 פוטפרינט |

## Reference Implementation

Full light theme HTML: `footprint/footprint-light-theme.html`

## Migration Steps

1. Update `globals.css` with new CSS variables
2. Update `tailwind.config.js` extend colors
3. Update `layout.tsx` body classes
4. Update `page.tsx` (landing page)
5. Update `create/page.tsx` and all create flow pages
6. QA visual regression testing

---

**[CTO-DECISION] Light theme approved for immediate implementation.**

*Document created by CTO Agent - 2025-12-20*
