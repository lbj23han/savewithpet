# Standard-V1 Character Generation Contract

All generated pet characters must use the same body rig. User photos are feature references only; the uploaded photo must never become the character body.

## Locked Structure

- Canvas: `1254 x 1254`
- Pose: front-facing standing pose
- Body center, face center, eye centers, head top, chest center, and back center are fixed
- Hands, feet, torso, and framing stay in the same position
- The output must be compatible with `STANDARD_WEARABLE_PROFILE`

## Mutable Visual Traits

- Fur/base color
- Ear shape and ear color
- Tail shape and tail color
- Nose color
- Fur markings and simple breed-like details
- Cheek tint and subtle fur texture

## Forbidden Changes

- Moving eye positions
- Changing eye distance
- Changing body scale or crop
- Rotating the head or body
- Changing pose
- Moving chest/back/head anchors
- Using the uploaded photo as the final character image

## Prompt Seed

Use this when a final raster renderer is introduced:

```text
Create a cute app pet character using the fixed standard-v1 body template.
The character must be front-facing, centered, full-body, and use the exact same pose, body size, framing, face center, eye positions, head top, chest center, and back center as the standard-v1 reference.
Only visual traits may vary: fur color, ear shape, tail shape, nose color, simple markings, cheek tint, and subtle fur texture.
Do not change the body rig, pose, crop, eye position, eye distance, face location, torso size, hands, feet, or anchor positions.
The result must fit wearable items using the shared STANDARD_WEARABLE_PROFILE.
```

## QA Gate

Generated art is accepted only when:

- Left/right eye coordinates match the standard profile
- Head, chest, and back anchors match the standard profile
- Sunglasses, hat, pendant, ribbon, crown, and wings align without per-pet overrides
- The uploaded photo is stored only as `sourcePhotoUrl`

## Current Base-Body Asset Rule

The deterministic SVG assets are QA scaffolding only. The app renders PNG/WebP `base-body` assets.

Current active review path:

- `public/assets/pets/base-body-standard/*.png`

Legacy high-quality reference path:

- `public/assets/pets/base-body/*.png`

The current candidates are documented in `reports/standard-v1-png-generation-report.md`.
