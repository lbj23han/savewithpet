# Standard-V1 PNG Base-Body Generation Report

Generated with gpt-image-1.5, size 1024x1024, quality low, background transparent.

These are candidates and were not copied over the existing production PNGs automatically.

## QA Result

Status: **ACTIVE REVIEW CANDIDATE - visually weak, but wired for preset base-body review**

Reasons:

- Outputs are 1024x1024, while production assets are 1254x1254.
- The images visually include a gray/glow background instead of a clean transparent-looking cutout.
- They are useful as review candidates, but not final production art.
- The app has been wired to `public/assets/pets/base-body-standard/*.png` for preset base-body review.
- Existing high-quality `public/assets/pets/base-body/*.png` files remain as legacy references.

| Pet | Output | Status | Next Step |
| --- | --- | --- | --- |
| akkigae | public/assets/pets/base-body-standard/akkigae.png | REVIEW | regenerate before production |
| ttoosseunyang | public/assets/pets/base-body-standard/ttoosseunyang.png | REVIEW | regenerate before production |
| kangchongmu | public/assets/pets/base-body-standard/kangchongmu.png | REVIEW | regenerate before production |

## QA Criteria

- Transparent PNG.
- Blank face only: no eyes, no nose, no mouth.
- Soft 3D pastel quality comparable to existing base-body PNG assets.
- Body, face, hands, feet, and framing follow standard-v1.
- Wearable anchors should match the shared profile.

## akkigae

Output: `public/assets/pets/base-body-standard/akkigae.png`

Prompt:

```text
Create a production-ready transparent PNG base-body layer for a mobile app pet avatar.

Reference role:
- Use the input image only for soft 3D pastel material quality, lighting, polish, and broad species identity.
- Do not preserve the current pose if it conflicts with the standard-v1 body rig below.

Standard-v1 body rig, non-negotiable:
- Canvas is square, full-body centered, front-facing standing pose.
- The character must fit a 1254x1254 app asset coordinate system.
- Keep the face blank: no eyes, no eyebrows, no nose, no mouth, no facial lines.
- Eye anchors must remain available for overlay at left (542,506) and right (752,506).
- Head anchor top center: (627,356).
- Chest center: (638,772).
- Back/wing center: (627,732).
- Same body size, face area, torso size, hand position, foot position, and framing for every species.

Pet identity: soft floppy-eared puppy.
Allowed visual traits only: cream white fur, pink floppy ears, pink tail, tiny cream hair tuft, pink scarf body accent.

Style:
- Same quality as the reference: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon character.
- Transparent background.
- No circular backdrop, no props, no accessories, no text, no watermark.
- Keep generous transparent padding and do not crop.
```

## ttoosseunyang

Output: `public/assets/pets/base-body-standard/ttoosseunyang.png`

Prompt:

```text
Create a production-ready transparent PNG base-body layer for a mobile app pet avatar.

Reference role:
- Use the input image only for soft 3D pastel material quality, lighting, polish, and broad species identity.
- Do not preserve the current pose if it conflicts with the standard-v1 body rig below.

Standard-v1 body rig, non-negotiable:
- Canvas is square, full-body centered, front-facing standing pose.
- The character must fit a 1254x1254 app asset coordinate system.
- Keep the face blank: no eyes, no eyebrows, no nose, no mouth, no facial lines.
- Eye anchors must remain available for overlay at left (542,506) and right (752,506).
- Head anchor top center: (627,356).
- Chest center: (638,772).
- Back/wing center: (627,732).
- Same body size, face area, torso size, hand position, foot position, and framing for every species.

Pet identity: round kitten mascot.
Allowed visual traits only: cream white fur, upright cat ears with pink inner ears, soft pink heart belly mark, striped pink tail.

Style:
- Same quality as the reference: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon character.
- Transparent background.
- No circular backdrop, no props, no accessories, no text, no watermark.
- Keep generous transparent padding and do not crop.
```

## kangchongmu

Output: `public/assets/pets/base-body-standard/kangchongmu.png`

Prompt:

```text
Create a production-ready transparent PNG base-body layer for a mobile app pet avatar.

Reference role:
- Use the input image only for soft 3D pastel material quality, lighting, polish, and broad species identity.
- Do not preserve the current pose if it conflicts with the standard-v1 body rig below.

Standard-v1 body rig, non-negotiable:
- Canvas is square, full-body centered, front-facing standing pose.
- The character must fit a 1254x1254 app asset coordinate system.
- Keep the face blank: no eyes, no eyebrows, no nose, no mouth, no facial lines.
- Eye anchors must remain available for overlay at left (542,506) and right (752,506).
- Head anchor top center: (627,356).
- Chest center: (638,772).
- Back/wing center: (627,732).
- Same body size, face area, torso size, hand position, foot position, and framing for every species.

Pet identity: round rabbit mascot.
Allowed visual traits only: cream white fur, tall rabbit ears with pink inner ears, round cotton tail, pink scarf body accent.

Style:
- Same quality as the reference: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon character.
- Transparent background.
- No circular backdrop, no props, no accessories, no text, no watermark.
- Keep generous transparent padding and do not crop.
```
