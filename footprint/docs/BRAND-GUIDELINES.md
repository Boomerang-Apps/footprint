# Footprint Brand Guidelines

> Your Story, Your Art — הסיפור שלך, האמנות שלך

---

## 1. Brand Identity

**Name:** Footprint

**Tagline:** Your Story, Your Art — הסיפור שלך, האמנות שלך

**Mission:** Transform personal photos into museum-quality art prints through AI-powered style transfer.

**Positioning:** Accessible fine art personalization for the Israeli market. Footprint is a Hebrew-first RTL e-commerce platform for AI-powered custom art prints.

---

## 2. Design Principles

### 2.1 Hebrew-First

RTL is the default. All UI flows run right-to-left. Every layout decision, icon direction, and reading order must be validated in Hebrew before any LTR adaptation.

### 2.2 Warm & Inviting

Vibrant gradients, soft shadows, and a premium feel. The platform should feel like stepping into a welcoming gallery, not a cold storefront.

### 2.3 Clean & Focused

Minimal chrome. Art takes center stage. UI elements support the artwork rather than compete with it.

### 2.4 Accessible & Inclusive

WCAG AA compliance, clear typography, and intuitive navigation. The platform serves everyone regardless of ability or technical proficiency.

---

## 3. Voice & Tone

- **Hebrew is the primary language.** Tone is warm and encouraging.
- **Use informal Hebrew** (not formal or academic). Speak to users like a knowledgeable friend, not an institution.
- **English is the secondary language**, matching the same warm tone.
- **Short, clear sentences.** Action-oriented CTAs.
- **Art-focused vocabulary:**
  - יצירה — creation
  - סגנון — style
  - אמנות — art
  - הדפס — print
  - עיצוב — design

### Tone Examples

| Context | Hebrew | English |
|---------|--------|---------|
| Upload CTA | העלו את התמונה שלכם | Upload your photo |
| Success | היצירה שלכם מוכנה! | Your creation is ready! |
| Encouragement | בואו נהפוך את הרגע לאמנות | Let's turn this moment into art |

---

## 4. Logo Usage

> **Note:** Logo design is TBD. The following rules apply once the logo is finalized.

- **Clear space:** Minimum 1x logo height on all sides.
- **Minimum size:** Do not render the logo smaller than 32px in height on screen.

### Don'ts

- Do not stretch or distort the logo.
- Do not rotate the logo.
- Do not add drop shadows, glows, or other effects.
- Do not place the logo on busy or low-contrast backgrounds.
- Do not alter the logo colors outside of approved variations.

---

## 5. Color System

### 5.1 Brand Colors

| Name | Hex | Usage |
|------|-----|-------|
| Purple | `#8b5cf6` | Interactive states, links, focus rings |
| Pink | `#ec4899` | Accent, gradient pairing |
| Cyan | `#22d3ee` | Highlights, accents, secondary actions |
| Orange | `#f59e0b` | Alerts, sale badges, warnings |

### 5.2 Brand Gradient

```css
background: linear-gradient(to left, #8b5cf6, #ec4899);
```

Used for primary CTAs, hero sections, and key interactive elements. The `to left` direction aligns with the RTL layout.

### 5.3 Text Colors

| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#1a1a1a` | Headings, body text |
| Secondary | `#525252` | Supporting text, descriptions |
| Muted | `#737373` | Captions, placeholders, metadata |

### 5.4 Background Colors

| Name | Hex | Usage |
|------|-----|-------|
| White | `#ffffff` | Cards, modals, primary surfaces |
| Light | `#fafafa` | Page background |
| Soft | `#f5f5f5` | Inset areas, input backgrounds |

### 5.5 Border Colors

| Name | Hex | Usage |
|------|-----|-------|
| Light | `#e5e5e5` | Card borders, dividers |
| Soft | `#ebebeb` | Subtle separators |

### 5.6 Usage Rules

- Use the **brand gradient** for primary CTAs and hero elements.
- Use **purple** for interactive states (hover, focus, active).
- Use **cyan** for accents and secondary highlights.
- Use **orange** for alerts, sale indicators, and warning states.
- Never rely on color alone to communicate state (see Accessibility).

---

## 6. Typography

### 6.1 Font Family

**Primary:** Heebo (Google Fonts)
**Fallback:** `system-ui, sans-serif`

```css
font-family: 'Heebo', system-ui, sans-serif;
```

Heebo is optimized for Hebrew characters and provides excellent readability in both Hebrew and Latin scripts.

### 6.2 Font Weights

| Weight | Name | Usage |
|--------|------|-------|
| 300 | Light | Decorative text, large display headings |
| 400 | Regular | Body text, paragraphs |
| 500 | Medium | UI labels, buttons, navigation |
| 600 | SemiBold | Section headings, emphasis |
| 700 | Bold | Hero text, prices, key figures |

### 6.3 Hebrew Considerations

- **Line height:** Use `1.7` for body text to ensure comfortable readability with Hebrew diacritics and character shapes.
- **Letter spacing:** Avoid adding letter-spacing to Hebrew text. Heebo handles spacing natively.
- **Alignment:** Default to `text-align: right` for Hebrew content.
- **Mixed content:** When Hebrew and English appear together, ensure `direction: rtl` is set on the container and use `unicode-bidi` where needed.

---

## 7. Iconography

### 7.1 Library

**Lucide React** is the icon library for all UI icons.

### 7.2 Specifications

| Property | Value |
|----------|-------|
| Default size | 20px |
| Stroke width | 2 |
| Style | Outlined (never filled) |

### 7.3 RTL Handling

Icons that imply direction must be mirrored in RTL layouts:

- Arrows (back, forward, expand)
- Chevrons (navigation, dropdowns)
- Progress indicators
- List/indent markers

Icons that should NOT be mirrored:

- Checkmarks
- Media controls (play, pause)
- Clocks
- Search magnifying glass

### 7.4 Usage

```tsx
import { ArrowRight } from 'lucide-react';

// In RTL context, this visually points left (correct for "forward" in RTL)
<ArrowRight className="rtl:rotate-180" size={20} strokeWidth={2} />
```

---

## 8. Layout & Spacing

### 8.1 Direction

RTL (`direction: rtl`) is the default for all layouts. The `<html>` element must include `dir="rtl"` and `lang="he"`.

```html
<html dir="rtl" lang="he">
```

### 8.2 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Small elements, tags, badges |
| md | 12px | Inputs, small cards |
| lg | 16px | Cards, panels |
| xl | 24px | Buttons, modals, hero cards |

### 8.3 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| sm | `0 1px 2px rgba(0, 0, 0, 0.05)` | Subtle depth, tags |
| md | `0 4px 12px rgba(0, 0, 0, 0.08)` | Cards, dropdowns |
| lg | `0 8px 24px rgba(0, 0, 0, 0.12)` | Modals, elevated panels |
| brand | `0 4px 16px rgba(139, 92, 246, 0.3)` | Purple glow on hover, focus |

### 8.4 Grid System

Tailwind CSS responsive grid system with the following breakpoints:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| sm | 640px | Large phones, small tablets |
| md | 768px | Tablets |
| lg | 1024px | Small laptops, landscape tablets |
| xl | 1280px | Desktops |

---

## 9. Component Patterns

### 9.1 Cards

- Background: white (`#ffffff`)
- Border: light (`#e5e5e5`)
- Border radius: lg (16px)
- Shadow: none at rest, md on hover
- Transition: smooth shadow and transform on hover

```css
.card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

### 9.2 Buttons

**Primary:** Brand gradient background, white text, rounded-xl (24px), medium font weight.

```css
.btn-primary {
  background: linear-gradient(to left, #8b5cf6, #ec4899);
  color: #ffffff;
  border-radius: 24px;
  font-weight: 500;
}
```

**Secondary:** Transparent background, light border, outlined style.

```css
.btn-secondary {
  background: transparent;
  border: 1px solid #e5e5e5;
  border-radius: 24px;
  color: #1a1a1a;
  font-weight: 500;
}
```

### 9.3 Inputs

- Background: soft (`#f5f5f5`)
- Border: light (`#e5e5e5`)
- Border radius: xl (24px)
- Focus: purple ring (`#8b5cf6`) with brand shadow

```css
.input {
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 24px;
  direction: rtl;
}
.input:focus {
  outline: none;
  border-color: #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
}
```

### 9.4 Glass Effect

Used for overlays, floating panels, and premium UI surfaces.

```css
.glass {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

---

## 10. Accessibility

### 10.1 Target Standard

**WCAG 2.1 Level AA** compliance across all pages and components.

### 10.2 Color Contrast

- Text primary (`#1a1a1a`) on white (`#ffffff`) achieves a contrast ratio exceeding 4.5:1.
- All text and interactive elements must meet minimum contrast requirements.
- Never rely on color alone to communicate state, errors, or information. Always pair color with text, icons, or patterns.

### 10.3 Focus Management

- All interactive elements must have a visible focus outline.
- Focus ring: 3px solid purple (`#8b5cf6`) with offset.
- Tab order must follow the RTL reading direction.

```css
:focus-visible {
  outline: 3px solid #8b5cf6;
  outline-offset: 2px;
}
```

### 10.4 Screen Reader Support

- All images require descriptive `alt` text.
- Use proper ARIA labels, especially for Hebrew content where assistive technologies may need guidance.
- Landmark roles (`nav`, `main`, `aside`, `footer`) must be present.
- Dynamic content changes must be announced with `aria-live` regions.
- Form inputs must have associated `<label>` elements.

### 10.5 RTL Accessibility

- Ensure `dir="rtl"` is set at the document level.
- Test with screen readers that support Hebrew (NVDA, VoiceOver).
- Logical properties (`margin-inline-start`, `padding-inline-end`) are preferred over physical properties (`margin-left`, `padding-right`).

---

## 11. Quick Reference

### CSS Custom Properties

```css
:root {
  /* Brand */
  --color-purple: #8b5cf6;
  --color-pink: #ec4899;
  --color-cyan: #22d3ee;
  --color-orange: #f59e0b;
  --gradient-brand: linear-gradient(to left, #8b5cf6, #ec4899);

  /* Text */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #525252;
  --color-text-muted: #737373;

  /* Backgrounds */
  --color-bg-white: #ffffff;
  --color-bg-light: #fafafa;
  --color-bg-soft: #f5f5f5;

  /* Borders */
  --color-border-light: #e5e5e5;
  --color-border-soft: #ebebeb;

  /* Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;

  /* Typography */
  --font-family: 'Heebo', system-ui, sans-serif;
  --line-height-body: 1.7;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.12);
  --shadow-brand: 0 4px 16px rgba(139, 92, 246, 0.3);
}
```

---

*Last updated: 2026-02-08*
