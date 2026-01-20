# Nano Banana Style Configuration

**Version**: 1.0
**Last Updated**: 2025-01-20
**Model**: Gemini 2.5 Flash Image (Nano Banana)

---

## Overview

This document defines the 6 artistic styles used by Footprint for AI-powered photo transformation. Each style is configured with:

- **Prompt Template**: The exact prompt sent to Gemini API
- **Anchor Tokens**: Specific style descriptors for consistency
- **Quality Checklist**: Visual criteria for QA validation
- **Negative Guidance**: What to avoid in outputs
- **Reference Images**: Recommended images to establish style baseline

### Consistency Best Practices

1. **Use Reference Images**: Upload 5-6 reference images per style to establish visual baseline
2. **Be Hyper-Specific**: More detail = more control over output
3. **Use Anchor Tokens**: Medium, era, palette, texture, lighting
4. **Iterate in Conversation**: Use follow-up prompts to refine without losing style
5. **Restart on Drift**: If style drifts after many edits, start fresh with full description

---

## Style 1: Original (No Filter)

**ID**: `original`
**Hebrew**: ללא פילטר
**Processing Time**: 0 seconds (passthrough)

### Prompt Template
```
Keep the original photo exactly as-is with no artistic transformation applied.
Maintain all original colors, lighting, composition, and details unchanged.
```

### Anchor Tokens
- Medium: photograph
- Style: unaltered, authentic
- Processing: none, passthrough

### Quality Checklist
- [ ] Identical to input image
- [ ] No color shifts
- [ ] No artifacts introduced
- [ ] Original resolution preserved

### Negative Guidance
- No enhancement
- No color grading
- No sharpening
- No filters of any kind

### Notes
This style bypasses AI transformation entirely and uses the original uploaded image.

---

## Style 2: Watercolor

**ID**: `watercolor`
**Hebrew**: צבעי מים
**Processing Time**: ~10 seconds

### Prompt Template
```
Transform this photograph into a beautiful watercolor painting.

Style characteristics:
- Soft, flowing edges with gentle color bleeds
- Translucent color washes with visible paper texture showing through
- Wet-on-wet watercolor technique with organic color mixing
- Delicate brushstrokes that follow the natural forms
- Light, airy feel with areas of white/light showing through
- Subtle granulation effects typical of watercolor pigments

Color palette: Keep colors soft and slightly desaturated, with gentle transitions.
Preserve the subject's likeness and key features while applying artistic interpretation.
The result should look like a hand-painted watercolor artwork suitable for framing.
```

### Anchor Tokens
- Medium: watercolor, aquarelle
- Texture: wet-on-wet, granulation, paper texture
- Palette: soft, translucent, desaturated
- Edges: soft, bleeding, feathered
- Finish: artistic, hand-painted, gallery-quality

### Quality Checklist
- [ ] Soft, bleeding edges visible
- [ ] Color washes appear translucent
- [ ] Paper texture subtly visible
- [ ] Subject likeness preserved (70%+ recognizable)
- [ ] No harsh lines or digital artifacts
- [ ] Colors appropriately soft/muted
- [ ] Suitable for print at 300 DPI

### Negative Guidance
- Avoid: harsh edges, oversaturated colors
- Avoid: photorealistic details, sharp focus
- Avoid: digital/vector appearance
- Avoid: uniform flat colors (should have variation)

### Reference Image Recommendations
1. Traditional watercolor portrait by John Singer Sargent
2. Botanical watercolor illustration
3. Loose watercolor landscape
4. Portrait with soft color washes
5. Watercolor with visible paper texture

---

## Style 3: Line Art

**ID**: `line_art`
**Hebrew**: ציור קווי
**Processing Time**: ~6 seconds

### Prompt Template
```
Transform this photograph into elegant minimalist line art.

Style characteristics:
- Clean, precise contour lines with consistent weight
- Single color (black) on white/cream background
- Minimal detail - capture only essential forms and features
- Elegant simplicity with purposeful negative space
- Vector-like quality with smooth, confident strokes
- Focus on capturing the essence and character of the subject

Line weight: Medium-fine lines, consistent throughout.
Preserve the subject's likeness through careful selection of defining features.
The result should look like a professional illustration suitable for high-end printing.
```

### Anchor Tokens
- Medium: ink drawing, contour drawing, illustration
- Technique: line drawing, outline, contour
- Palette: monochrome, black and white
- Style: minimalist, elegant, clean
- Finish: vector-like, professional, print-ready

### Quality Checklist
- [ ] Clean, unbroken contour lines
- [ ] Consistent line weight throughout
- [ ] True black and white (no gray tones)
- [ ] Subject clearly recognizable
- [ ] Elegant negative space usage
- [ ] No sketchy or rough lines
- [ ] Print-ready at high resolution

### Negative Guidance
- Avoid: shading, hatching, cross-hatching
- Avoid: gray tones or gradients
- Avoid: sketchy, unfinished appearance
- Avoid: overly detailed or busy composition
- Avoid: colored lines

### Reference Image Recommendations
1. Minimalist portrait line drawing
2. Fashion illustration contour style
3. Architectural line drawing
4. Single-line continuous portrait
5. Professional ink illustration

---

## Style 4: Line Art + Watercolor

**ID**: `line_art_watercolor`
**Hebrew**: קווי + צבעי מים
**Processing Time**: ~12 seconds

### Prompt Template
```
Transform this photograph into a beautiful combination of line art and watercolor.

Style characteristics:
- Clean, precise ink outlines defining the main forms
- Soft watercolor washes filling inside the line work
- Lines should be confident and slightly looser than pure line art
- Watercolor fills should be soft, translucent, and slightly imperfect
- Colors should bleed slightly beyond lines in places (artistic touch)
- Balance between the precision of line work and fluidity of watercolor

Technique: Ink and wash, pen and watercolor illustration style.
The outlines anchor the composition while watercolor adds warmth and life.
Preserve the subject's likeness while creating an artistic, hand-crafted feel.
The result should look like a professional illustration suitable for premium printing.
```

### Anchor Tokens
- Medium: ink and wash, pen and watercolor
- Technique: mixed media, illustration
- Lines: ink, confident, defining
- Fills: watercolor, soft, translucent
- Style: artistic, hand-crafted, illustrative
- Finish: gallery-quality, premium print

### Quality Checklist
- [ ] Clean ink outlines visible
- [ ] Soft watercolor fills inside lines
- [ ] Some intentional color bleed beyond lines
- [ ] Subject clearly recognizable
- [ ] Balance between line and color
- [ ] Hand-crafted, artistic appearance
- [ ] Suitable for premium printing

### Negative Guidance
- Avoid: perfectly contained colors (too digital)
- Avoid: harsh, solid color fills
- Avoid: sketchy, unfinished lines
- Avoid: overly precise/mechanical appearance
- Avoid: lack of integration between line and wash

### Reference Image Recommendations
1. Fashion illustration with ink and wash
2. Botanical illustration with watercolor fills
3. Portrait sketch with color washes
4. Urban sketching style artwork
5. Children's book illustration style

---

## Style 5: Oil Painting

**ID**: `oil_painting`
**Hebrew**: ציור שמן
**Processing Time**: ~12 seconds

### Prompt Template
```
Transform this photograph into a classical oil painting masterpiece.

Style characteristics:
- Rich, thick impasto brushstrokes with visible texture
- Deep, luminous colors with masterful color mixing
- Classical painting technique with attention to light and shadow
- Painterly quality with visible brush marks adding character
- Museum-quality finish suitable for fine art reproduction
- Chiaroscuro lighting effects enhancing depth and drama

Technique: Traditional oil painting, reminiscent of Old Masters.
Color palette: Rich, deep colors with warm undertones.
Preserve the subject's likeness while elevating to fine art status.
The result should look like a hand-painted oil portrait worthy of a gallery.
```

### Anchor Tokens
- Medium: oil painting, oils, oil on canvas
- Technique: impasto, alla prima, glazing
- Texture: thick brushstrokes, canvas texture
- Palette: rich, deep, luminous, warm
- Lighting: chiaroscuro, dramatic, classical
- Style: Old Masters, Renaissance, classical
- Finish: museum-quality, gallery-worthy

### Quality Checklist
- [ ] Visible brushstroke texture
- [ ] Rich, deep color palette
- [ ] Dramatic light and shadow
- [ ] Subject likeness preserved
- [ ] Painterly, non-photographic quality
- [ ] Canvas/painting texture visible
- [ ] Gallery-worthy presentation

### Negative Guidance
- Avoid: flat, uniform colors
- Avoid: photorealistic details
- Avoid: digital/smooth appearance
- Avoid: harsh edges (should be painterly)
- Avoid: washed out or pale colors

### Reference Image Recommendations
1. Rembrandt portrait (lighting reference)
2. John Singer Sargent portrait (brushwork)
3. Contemporary oil portrait
4. Classical Renaissance portrait
5. Impressionist portrait (color mixing)

---

## Style 6: Avatar Cartoon

**ID**: `avatar_cartoon`
**Hebrew**: אווטאר קרטון
**Processing Time**: ~10 seconds

### Prompt Template
```
Transform this photograph into a charming 3D cartoon avatar character.

Style characteristics:
- Pixar/Disney-inspired 3D character design
- Smooth, stylized skin with soft subsurface scattering
- Big, expressive eyes with life and personality
- Slightly exaggerated but appealing proportions
- Vibrant, saturated colors with good contrast
- Professional 3D render quality with soft lighting
- Friendly, approachable, and appealing character design

Technical: High-quality 3D render appearance, smooth surfaces.
Expression: Capture the subject's personality and essence.
The result should look like a professional Pixar-style character portrait.
Maintain recognizable features while stylizing into cartoon form.
```

### Anchor Tokens
- Medium: 3D render, CGI, digital character
- Style: Pixar, Disney, DreamWorks, cartoon
- Features: big eyes, stylized, expressive
- Skin: smooth, soft, subsurface scattering
- Palette: vibrant, saturated, cheerful
- Lighting: soft, studio, three-point
- Finish: professional render, high-quality

### Quality Checklist
- [ ] Recognizable as the subject (stylized likeness)
- [ ] Big, expressive eyes with life
- [ ] Smooth, appealing skin texture
- [ ] Vibrant, cheerful colors
- [ ] Professional 3D render quality
- [ ] Friendly, approachable appearance
- [ ] Suitable for merchandise/products

### Negative Guidance
- Avoid: realistic skin pores and wrinkles
- Avoid: harsh shadows or lighting
- Avoid: uncanny valley appearance
- Avoid: creepy or unsettling expressions
- Avoid: low-poly or cheap 3D look
- Avoid: anime style (should be Western 3D)

### Reference Image Recommendations
1. Pixar character portraits (Inside Out, Coco)
2. Disney 3D characters (Frozen, Tangled)
3. DreamWorks character style
4. Professional 3D character renders
5. Stylized portrait commissions

---

## Implementation Notes

### Updating Prompts in Code

The prompts are defined in `lib/ai/replicate.ts` in the `STYLE_PROMPTS` object. To update:

```typescript
export const STYLE_PROMPTS: Record<StyleType, string> = {
  original: 'Keep the original photo...',
  watercolor: 'Transform this photograph into a beautiful watercolor...',
  // ... etc
};
```

### Testing Style Consistency

1. **Batch Testing**: Run same style on 10 different photos
2. **Consistency Score**: Rate visual similarity 1-10
3. **Likeness Score**: Rate subject recognition 1-10
4. **Quality Score**: Rate print-readiness 1-10
5. **Document**: Save results with timestamps

### Version Control

When updating styles:
1. Increment version number at top of this file
2. Document changes in git commit
3. Run consistency tests before deploying
4. Keep backup of previous working prompts

---

## Appendix: Prompt Engineering Principles

### The SCALELIT Framework

For consistent results, structure prompts using:

- **S**ubject: Who/what is being transformed
- **C**omposition: How elements are arranged
- **A**rtistic style: The target aesthetic
- **L**ighting: Light quality and direction
- **E**nvironment: Background/context
- **L**evel of detail: How much detail to preserve
- **I**ntensity: How strong the transformation
- **T**echnical specs: Resolution, aspect ratio

### Reference Image Best Practices

1. Use 5-6 images per style for consistency
2. Include variety (different subjects, lighting)
3. All references should exemplify the target style
4. Store references in `/public/style-references/`
5. Document image sources and licenses

### Iteration Strategy

When a style produces inconsistent results:

1. Identify the variance (color? texture? likeness?)
2. Add more specific anchor tokens for that aspect
3. Test with 5 new images
4. If still inconsistent, add negative guidance
5. Document what worked for future reference
