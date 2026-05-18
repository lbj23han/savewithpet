# Standard-V1 PNG Base-Body Generation Report

Generated with gpt-image-1.5, size 1024x1024, quality low, background transparent, max attempts 3, reference akkigae, tolerance 2.0%.

| Pet | Output | Status | Alignment | Alignment Diffs | Bounds | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| kangchongmu | public/assets/pets/base-body-standard/kangchongmu.png | FAIL | DRIFT | bottom=0.3%, centerX=0.0%, heightRatio=4.7%, top=4.4%, widthRatio=24.0% | left=309, top=68, right=711, bottom=864, centerX=0.498, width=0.394, height=0.778 | width 0.394 outside 0.400-0.780<br>heightRatio drift 4.7% > 2.0%<br>top drift 4.4% > 2.0%<br>widthRatio drift 24.0% > 2.0% width 0.394 below preferred 0.420 |

## QA Criteria

- Transparent PNG.
- Blank face only: no eyes, no nose, no mouth.
- Soft 3D pastel quality comparable to existing base-body PNG assets.
- Body, face, hands, feet, and framing follow standard-v1.
- Wearable anchors should match the shared profile.
- Automated QA currently checks PNG dimensions and alpha silhouette framing. Visual QA is still required for eye/face anchor quality.

## kangchongmu

Output: `public/assets/pets/base-body-standard/kangchongmu.png`

Selected QA: FAIL

- Attempt 1: FAIL / DRIFT / bottom=0.3%, centerX=0.0%, heightRatio=4.7%, top=4.4%, widthRatio=24.0% / left=309, top=68, right=711, bottom=864, centerX=0.498, width=0.394, height=0.778 / width 0.394 outside 0.400-0.780; heightRatio drift 4.7% > 2.0%; top drift 4.4% > 2.0%; widthRatio drift 24.0% > 2.0% width 0.394 below preferred 0.420
- Attempt 2: FAIL / DRIFT / bottom=1.6%, centerX=0.8%, heightRatio=8.2%, top=6.6%, widthRatio=27.0% / left=332, top=45, right=704, bottom=877, centerX=0.506, width=0.364, height=0.813 / width 0.364 outside 0.400-0.780; heightRatio drift 8.2% > 2.0%; top drift 6.6% > 2.0%; widthRatio drift 27.0% > 2.0% width 0.364 below preferred 0.420
- Attempt 3: FAIL / DRIFT / bottom=7.9%, centerX=0.1%, heightRatio=15.0%, top=7.1%, widthRatio=10.3% / left=240, top=40, right=783, bottom=942, centerX=0.500, width=0.531, height=0.882 / top 0.039 outside 0.040-0.220; bottom drift 7.9% > 2.0%; heightRatio drift 15.0% > 2.0%; top drift 7.1% > 2.0%; widthRatio drift 10.3% > 2.0% 

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
- If the input image already has a good body frame, preserve that frame exactly.
- For non-reference species, change only species traits while keeping the input body frame and proportions.
- Keep the body centerline at x=512. The visual center must not drift left or right.
- Head center target: x=512, y=350. Face area target: x=512, y=410.
- Eye/expression anchors must remain available at left x=443 y=413 and right x=614 y=413 in 1024 coordinates.
- Chest center target: x=521, y=630. Hands/paws must sit symmetrically around the upper torso.
- Feet must end near y=870-930 and remain symmetrical.
- Keep the face blank: no eyes, no eyebrows, no nose, no mouth, no facial lines.
- Same body size, face area, torso size, hand position, foot position, and framing for every species.
- Body width, torso width, arm positions, and foot positions must be visually identical to the reference character.
- Species traits may change ear shape, tail shape, fur markings, and colors only. They must not move the torso, head, face area, hands, feet, or framing.
- The result should look like one complete full base-body character, not detached overlay pieces.

Pet identity: round rabbit mascot.
Allowed visual traits only: cream white fur, tall rabbit ears with pink inner ears, round cotton tail, pink scarf body accent.
Species-specific frame lock: Use the input puppy image as the exact body-frame reference. Preserve the alpha silhouette and size from neck down exactly. Keep the same head width, torso width, arm positions, leg positions, foot positions, chest height, body centerline, and bottom baseline. Only convert species traits to rabbit by replacing floppy ears with tall rabbit ears and changing the tail to a small round cotton tail. Do not shrink the body. Do not create a slim rabbit body. Do not move the paws, torso, feet, or head silhouette inward.
Generation pass: 1. If this is not pass 1, correct framing drift by making the body more centered and closer to the target coordinates.
Strict visual alignment target: match akkigae's body frame within 2% for center, top, bottom, width, and height.

Style:
- Same quality as the reference: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon character.
- Transparent background.
- No circular backdrop, no props, no accessories, no text, no watermark.
- Keep generous transparent padding and do not crop.
```
