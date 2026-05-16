# Standard-V1 PNG Base-Body Generation Report

Generated with gpt-image-1.5, size 1024x1024, quality low, background transparent, max attempts 2.

| Pet | Output | Status | Bounds | Notes |
| --- | --- | --- | --- | --- |
| akkigae | public/assets/pets/base-body-standard/akkigae.png | PASS | left=186, top=113, right=834, bottom=861, centerX=0.498, width=0.634, height=0.731 | automated frame QA passed |
| ttoosseunyang | public/assets/pets/base-body-standard/ttoosseunyang.png | PASS | left=254, top=109, right=779, bottom=899, centerX=0.504, width=0.514, height=0.772 | automated frame QA passed |
| kangchongmu | public/assets/pets/base-body-standard/kangchongmu.png | BEST_EFFORT | left=304, top=73, right=717, bottom=930, centerX=0.499, width=0.404, height=0.838 | width 0.404 outside 0.420-0.760 |

## QA Criteria

- Transparent PNG.
- Blank face only: no eyes, no nose, no mouth.
- Soft 3D pastel quality comparable to existing base-body PNG assets.
- Body, face, hands, feet, and framing follow standard-v1.
- Wearable anchors should match the shared profile.
- Automated QA currently checks PNG dimensions and alpha silhouette framing. Visual QA is still required for eye/face anchor quality.

## akkigae

Output: `public/assets/pets/base-body-standard/akkigae.png`

Selected QA: PASS

- Attempt 1: PASS / left=186, top=113, right=834, bottom=861, centerX=0.498, width=0.634, height=0.731 / automated frame QA passed

Prompt:

```text
Create a production-ready transparent PNG base-body layer for a mobile app pet avatar.

Reference role:
- Use the input image only for soft 3D pastel material quality, lighting, polish, and broad species identity.
- Do not preserve the current pose if it conflicts with the standard-v1 body rig below.

Standard-v1 body rig, non-negotiable:
- Canvas is exactly square. Generate for 1024x1024 transparent PNG, mapped to a 1254x1254 app asset coordinate system.
- Full-body centered, front-facing standing pose. No sitting, no rotated body, no leaning, no cropped parts.
- Overall character silhouette target in 1024 coordinates: left 200-300, right 724-824, top 70-180, bottom 835-950.
- Keep the body centerline at x=512. The visual center must not drift left or right.
- Head center target: x=512, y=350. Face area target: x=512, y=410.
- Eye/expression anchors must remain available at left x=443 y=413 and right x=614 y=413 in 1024 coordinates.
- Chest center target: x=521, y=630. Hands/paws must sit symmetrically around the upper torso.
- Feet must end near y=870-930 and remain symmetrical.
- Keep the face blank: no eyes, no eyebrows, no nose, no mouth, no facial lines.
- Same body size, face area, torso size, hand position, foot position, and framing for every species.
- Species traits may change ear shape, tail shape, fur markings, and colors only. They must not move the torso, head, face area, hands, feet, or framing.
- The result should look like one complete full base-body character, not detached overlay pieces.

Pet identity: soft floppy-eared puppy.
Allowed visual traits only: cream white fur, pink floppy ears, pink tail, tiny cream hair tuft, pink scarf body accent.
Generation pass: 1. If this is not pass 1, correct framing drift by making the body more centered and closer to the target coordinates.

Style:
- Same quality as the reference: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon character.
- Transparent background.
- No circular backdrop, no props, no accessories, no text, no watermark.
- Keep generous transparent padding and do not crop.
```

## ttoosseunyang

Output: `public/assets/pets/base-body-standard/ttoosseunyang.png`

Selected QA: PASS

- Attempt 1: PASS / left=254, top=109, right=779, bottom=899, centerX=0.504, width=0.514, height=0.772 / automated frame QA passed

Prompt:

```text
Create a production-ready transparent PNG base-body layer for a mobile app pet avatar.

Reference role:
- Use the input image only for soft 3D pastel material quality, lighting, polish, and broad species identity.
- Do not preserve the current pose if it conflicts with the standard-v1 body rig below.

Standard-v1 body rig, non-negotiable:
- Canvas is exactly square. Generate for 1024x1024 transparent PNG, mapped to a 1254x1254 app asset coordinate system.
- Full-body centered, front-facing standing pose. No sitting, no rotated body, no leaning, no cropped parts.
- Overall character silhouette target in 1024 coordinates: left 200-300, right 724-824, top 70-180, bottom 835-950.
- Keep the body centerline at x=512. The visual center must not drift left or right.
- Head center target: x=512, y=350. Face area target: x=512, y=410.
- Eye/expression anchors must remain available at left x=443 y=413 and right x=614 y=413 in 1024 coordinates.
- Chest center target: x=521, y=630. Hands/paws must sit symmetrically around the upper torso.
- Feet must end near y=870-930 and remain symmetrical.
- Keep the face blank: no eyes, no eyebrows, no nose, no mouth, no facial lines.
- Same body size, face area, torso size, hand position, foot position, and framing for every species.
- Species traits may change ear shape, tail shape, fur markings, and colors only. They must not move the torso, head, face area, hands, feet, or framing.
- The result should look like one complete full base-body character, not detached overlay pieces.

Pet identity: round kitten mascot.
Allowed visual traits only: cream white fur, upright cat ears with pink inner ears, soft pink heart belly mark, striped pink tail.
Generation pass: 1. If this is not pass 1, correct framing drift by making the body more centered and closer to the target coordinates.

Style:
- Same quality as the reference: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon character.
- Transparent background.
- No circular backdrop, no props, no accessories, no text, no watermark.
- Keep generous transparent padding and do not crop.
```

## kangchongmu

Output: `public/assets/pets/base-body-standard/kangchongmu.png`

Selected QA: BEST_EFFORT

- Attempt 1: FAIL / left=305, top=45, right=715, bottom=928, centerX=0.498, width=0.401, height=0.863 / width 0.401 outside 0.420-0.760
- Attempt 2: FAIL / left=304, top=73, right=717, bottom=930, centerX=0.499, width=0.404, height=0.838 / width 0.404 outside 0.420-0.760

Prompt:

```text
Create a production-ready transparent PNG base-body layer for a mobile app pet avatar.

Reference role:
- Use the input image only for soft 3D pastel material quality, lighting, polish, and broad species identity.
- Do not preserve the current pose if it conflicts with the standard-v1 body rig below.

Standard-v1 body rig, non-negotiable:
- Canvas is exactly square. Generate for 1024x1024 transparent PNG, mapped to a 1254x1254 app asset coordinate system.
- Full-body centered, front-facing standing pose. No sitting, no rotated body, no leaning, no cropped parts.
- Overall character silhouette target in 1024 coordinates: left 200-300, right 724-824, top 70-180, bottom 835-950.
- Keep the body centerline at x=512. The visual center must not drift left or right.
- Head center target: x=512, y=350. Face area target: x=512, y=410.
- Eye/expression anchors must remain available at left x=443 y=413 and right x=614 y=413 in 1024 coordinates.
- Chest center target: x=521, y=630. Hands/paws must sit symmetrically around the upper torso.
- Feet must end near y=870-930 and remain symmetrical.
- Keep the face blank: no eyes, no eyebrows, no nose, no mouth, no facial lines.
- Same body size, face area, torso size, hand position, foot position, and framing for every species.
- Species traits may change ear shape, tail shape, fur markings, and colors only. They must not move the torso, head, face area, hands, feet, or framing.
- The result should look like one complete full base-body character, not detached overlay pieces.

Pet identity: round rabbit mascot.
Allowed visual traits only: cream white fur, tall rabbit ears with pink inner ears, round cotton tail, pink scarf body accent.
Generation pass: 2. If this is not pass 1, correct framing drift by making the body more centered and closer to the target coordinates.

Style:
- Same quality as the reference: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon character.
- Transparent background.
- No circular backdrop, no props, no accessories, no text, no watermark.
- Keep generous transparent padding and do not crop.
```
