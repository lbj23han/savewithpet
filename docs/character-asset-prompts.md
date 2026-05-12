# Character Asset Prompts

## Base-Body Prompt

Use this prompt when creating a `base-body` layer for the composable pet system.

The goal is not to create a finished character face. The goal is a clean body/head layer that can receive separate SVG face parts.

```text
Use the provided pet mascot as the identity reference. Create a production-ready base-body asset for a composable pet character system.

Asset purpose: base-body layer only. The face will be assembled later with separate SVG parts.

MUST preserve from the reference:
- same animal species and same mascot identity
- same head silhouette, ears, top hair tuft if present, body, paws, chest detail, and tail
- same soft pastel 3D mobile game mascot style
- same front-facing full-body standing pose
- same cute proportions and app icon polish
- same soft cheek blush areas only if they are part of the body style, but keep them subtle

ABSOLUTE FACE REMOVAL REQUIREMENTS:
- Do NOT draw eyes.
- Do NOT draw eyebrows.
- Do NOT draw nose.
- Do NOT draw mouth.
- Do NOT draw teeth, tongue, smile, muzzle line, nostrils, lips, or any lower-mouth detail.
- The center face area must be smooth clean fur with gentle shading only.
- The lower face/chin area must be clean and simple.
- No weird lower lip, no mouth remnant, no curved smile, no dark line.
- Keep only the head shape, ears, blush, body, paws, chest detail, and tail.

Output requirements:
- Full body centered, same scale as reference.
- Clean transparent PNG-style asset.
- If transparency is unavailable, use a perfectly flat solid #00ff00 chroma-key background with no shadows, gradients, texture, or floor.
- No circular backdrop, no glow circle, no UI, no text, no watermark.
- No extra accessories.
- Do not crop.
- Smooth polished edges suitable for layering SVG face parts on top.

Negative prompt:
eyes, eyebrows, nose, mouth, smile, tongue, teeth, lips, muzzle line, nostril, facial expression, circular background, glow, shadow, text, watermark, checkerboard background
```

## Preset Base-Body V1 Notes

The current preset base-body assets were generated with the base-body prompt above using the original preset PNGs as identity references.

- `public/assets/pets/base-body/akkigae.png`
- `public/assets/pets/base-body/ttoosseunyang.png`
- `public/assets/pets/base-body/kangchongmu.png`

Post-processing:

- Generated on a flat `#00ff00` chroma-key background.
- Removed the chroma key locally with `remove_chroma_key.py`.
- Saved as transparent PNG.
- Original `public/assets/pets/*.png` files remain unchanged.

Quality notes:

- Face feature removal is much cleaner than manual erasing.
- The lower mouth artifact from the previous Akkigae SVG overlay was fixed by simplifying the mouth paths in `public/assets/pet-parts/akkigae/*.svg`.
- Expression overlays are nudged slightly up-left in `src/components/PetStage.tsx` because the first SVG parts sat a little down-right on the regenerated base-body assets.
- `kangchongmu` is the first rabbit preset and should be used as the reference for future upright-ear item placement such as hats, crowns, ribbons, and wings.
- This is still an MVP asset. Final production should generate or draw `base-body`, `neutral`, `happy`, `sad`, and `wink` as one coordinated style set.
