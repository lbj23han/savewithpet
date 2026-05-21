# Standard-V1 PNG Base-Body Generation Report

Generated with gpt-image-1.5, size 1024x1024, quality low, background transparent, maxAttempts 3, candidatesPerAttempt 3, reference akkigae, tolerance 2.0%.

| Pet | Output | Status | Structural | Region Diffs | Bounds | Passed/Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ttoosseunyang | public/assets/pets/base-body-standard/ttoosseunyang.png | FAIL | DRIFT | core: alphaCenterX=0.1%, alphaCenterY=1.1%, bottom=1.9%, centerX=0.0%, coverageRatio=4.2%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | head: alphaCenterX=0.2%, alphaCenterY=0.5%, bottom=0.0%, centerX=0.1%, coverageRatio=2.6%, heightRatio=0.0%, top=0.0%, widthRatio=0.8% | torso: alphaCenterX=0.2%, alphaCenterY=0.9%, bottom=1.9%, centerX=0.0%, coverageRatio=6.7%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | left=268, top=65, right=828, bottom=921, centerX=0.535, width=0.548, height=0.837 | 0/9 | automated frame QA passed<br>torso.coverageRatio drift 6.7% > 6.0%  |

## QA Criteria

- Transparent PNG.
- Blank face: no eyes, no nose, no mouth.
- Soft 3D pastel quality comparable to reference assets.
- Body frame matches standard-v1: centerline, silhouette bounds, structural region alignment within 2%.
- Wearable anchors should match the shared profile.
- Automated QA checks: PNG dimensions, alpha silhouette framing, structural region alignment (core/head/torso) against reference body.
- Manual QA still required for visual quality, expression anchor placement, and wearable fit.

## ttoosseunyang

Output: `public/assets/pets/base-body-standard/ttoosseunyang.png`

Selected QA: FAIL | structural=DRIFT | core: alphaCenterX=0.1%, alphaCenterY=1.1%, bottom=1.9%, centerX=0.0%, coverageRatio=4.2%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | head: alphaCenterX=0.2%, alphaCenterY=0.5%, bottom=0.0%, centerX=0.1%, coverageRatio=2.6%, heightRatio=0.0%, top=0.0%, widthRatio=0.8% | torso: alphaCenterX=0.2%, alphaCenterY=0.9%, bottom=1.9%, centerX=0.0%, coverageRatio=6.7%, heightRatio=1.9%, top=0.0%, widthRatio=0.0%

- Attempt 1 (0/3 passed):
  - candidate 1: FAIL score=-45.8 structural=core: alphaCenterX=0.2%, alphaCenterY=0.8%, bottom=1.9%, centerX=0.0%, coverageRatio=2.1%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | head: alphaCenterX=0.0%, alphaCenterY=0.4%, bottom=0.0%, centerX=0.0%, coverageRatio=12.7%, heightRatio=0.0%, top=0.0%, widthRatio=6.0% | torso: alphaCenterX=0.2%, alphaCenterY=0.3%, bottom=1.9%, centerX=2.5%, coverageRatio=1.7%, heightRatio=1.9%, top=0.0%, widthRatio=5.0% bounds=left=296, top=83, right=784, bottom=890, centerX=0.527, width=0.478, height=0.789
  - candidate 2: FAIL score=-51.3 structural=core: alphaCenterX=0.1%, alphaCenterY=0.7%, bottom=1.9%, centerX=0.1%, coverageRatio=2.5%, heightRatio=1.9%, top=0.0%, widthRatio=0.3% | head: alphaCenterX=0.0%, alphaCenterY=0.5%, bottom=0.0%, centerX=0.1%, coverageRatio=12.0%, heightRatio=0.0%, top=0.0%, widthRatio=6.3% | torso: alphaCenterX=0.3%, alphaCenterY=0.3%, bottom=1.9%, centerX=2.1%, coverageRatio=0.7%, heightRatio=1.9%, top=0.0%, widthRatio=4.2% bounds=left=304, top=73, right=798, bottom=899, centerX=0.538, width=0.483, height=0.808
  - candidate 3: FAIL score=39.7 structural=core: alphaCenterX=0.1%, alphaCenterY=1.1%, bottom=1.9%, centerX=0.0%, coverageRatio=4.2%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | head: alphaCenterX=0.2%, alphaCenterY=0.5%, bottom=0.0%, centerX=0.1%, coverageRatio=2.6%, heightRatio=0.0%, top=0.0%, widthRatio=0.8% | torso: alphaCenterX=0.2%, alphaCenterY=0.9%, bottom=1.9%, centerX=0.0%, coverageRatio=6.7%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% bounds=left=268, top=65, right=828, bottom=921, centerX=0.535, width=0.548, height=0.837
- Attempt 2 (0/3 passed):
  - candidate 1: FAIL score=-15.3 structural=core: alphaCenterX=0.3%, alphaCenterY=1.2%, bottom=1.9%, centerX=0.0%, coverageRatio=5.3%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | head: alphaCenterX=0.0%, alphaCenterY=0.5%, bottom=0.0%, centerX=0.0%, coverageRatio=1.0%, heightRatio=0.0%, top=0.0%, widthRatio=0.0% | torso: alphaCenterX=0.5%, alphaCenterY=0.5%, bottom=1.9%, centerX=1.1%, coverageRatio=8.6%, heightRatio=1.9%, top=0.0%, widthRatio=2.2% bounds=left=254, top=40, right=843, bottom=932, centerX=0.536, width=0.576, height=0.872
  - candidate 2: FAIL score=9.8 structural=core: alphaCenterX=0.1%, alphaCenterY=1.2%, bottom=1.9%, centerX=0.0%, coverageRatio=0.6%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | head: alphaCenterX=0.0%, alphaCenterY=0.4%, bottom=0.0%, centerX=0.1%, coverageRatio=10.2%, heightRatio=0.0%, top=0.0%, widthRatio=4.9% | torso: alphaCenterX=0.1%, alphaCenterY=0.9%, bottom=1.9%, centerX=0.8%, coverageRatio=4.0%, heightRatio=1.9%, top=0.0%, widthRatio=1.7% bounds=left=293, top=69, right=807, bottom=902, centerX=0.537, width=0.503, height=0.814
  - candidate 3: FAIL score=-7.8 structural=core: alphaCenterX=0.0%, alphaCenterY=0.8%, bottom=1.9%, centerX=0.0%, coverageRatio=1.0%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | head: alphaCenterX=0.0%, alphaCenterY=0.5%, bottom=0.0%, centerX=0.2%, coverageRatio=7.8%, heightRatio=0.0%, top=0.0%, widthRatio=2.4% | torso: alphaCenterX=0.0%, alphaCenterY=0.7%, bottom=1.9%, centerX=1.2%, coverageRatio=2.4%, heightRatio=1.9%, top=0.0%, widthRatio=2.4% bounds=left=280, top=89, right=763, bottom=890, centerX=0.509, width=0.473, height=0.783
- Attempt 3 (0/3 passed):
  - candidate 1: FAIL score=-41.7 structural=core: alphaCenterX=0.1%, alphaCenterY=0.9%, bottom=1.9%, centerX=0.0%, coverageRatio=1.1%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | head: alphaCenterX=0.1%, alphaCenterY=0.6%, bottom=0.0%, centerX=0.0%, coverageRatio=8.8%, heightRatio=0.0%, top=0.0%, widthRatio=4.7% | torso: alphaCenterX=0.2%, alphaCenterY=0.7%, bottom=1.9%, centerX=2.1%, coverageRatio=3.0%, heightRatio=1.9%, top=0.0%, widthRatio=4.1% bounds=left=291, top=83, right=760, bottom=888, centerX=0.513, width=0.459, height=0.787
  - candidate 2: FAIL score=15.0 structural=core: alphaCenterX=0.2%, alphaCenterY=0.7%, bottom=1.9%, centerX=0.0%, coverageRatio=0.5%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | head: alphaCenterX=0.1%, alphaCenterY=0.2%, bottom=0.0%, centerX=0.0%, coverageRatio=8.5%, heightRatio=0.0%, top=0.0%, widthRatio=0.6% | torso: alphaCenterX=0.4%, alphaCenterY=0.5%, bottom=1.9%, centerX=1.2%, coverageRatio=2.0%, heightRatio=1.9%, top=0.0%, widthRatio=2.4% bounds=left=266, top=82, right=816, bottom=921, centerX=0.528, width=0.538, height=0.820
  - candidate 3: FAIL score=21.5 structural=core: alphaCenterX=0.0%, alphaCenterY=1.1%, bottom=1.9%, centerX=0.0%, coverageRatio=4.5%, heightRatio=1.9%, top=0.0%, widthRatio=0.0% | head: alphaCenterX=0.0%, alphaCenterY=0.6%, bottom=0.0%, centerX=0.0%, coverageRatio=1.0%, heightRatio=0.0%, top=0.0%, widthRatio=0.9% | torso: alphaCenterX=0.0%, alphaCenterY=1.0%, bottom=1.9%, centerX=1.2%, coverageRatio=6.4%, heightRatio=1.9%, top=0.0%, widthRatio=2.4% bounds=left=276, top=85, right=774, bottom=899, centerX=0.513, width=0.487, height=0.796

Prompt:

```text
Generate a production-ready transparent PNG full-body pet avatar for a mobile app.

BODY FRAME CONTRACT — all values are for a 1024×1024 px transparent PNG canvas:
- Body centerline: x=512 (±10 px). Left-right drift is a hard failure.
- Full silhouette bounds: left=200–300, right=724–824, top=70–180, bottom=835–950.
- Body width span: ~520 px (~51% of canvas). Body height span: ~780 px (~76% of canvas).
- Head center: x=512, y=350. Face area center: x=512, y=410.
- Eye anchor (left): x=443, y=413. Eye anchor (right): x=614, y=413.
- Chest center: x=521, y=630. Hands/paws symmetrical around upper torso.
- Feet bottom: y=870–930, symmetrical left and right.
- Face must be BLANK: no eyes, no eyebrows, no nose, no mouth, no facial marks of any kind.
- Full-body, front-facing, upright standing pose. No sitting, tilting, leaning, or cropped parts.

INPUT IMAGE ROLE:
- The input image defines the EXACT body frame. It is the structural template.
- Copy the body silhouette (torso width, arm positions, leg positions, paw positions, feet, head position and size) EXACTLY from the input image.
- Do NOT resize, shrink, widen, raise, or lower the body in any way.
- Do NOT invent a new body shape for this species. Use the input body shape as-is.

WHAT YOU MAY CHANGE:
- Change ONLY the ears (floppy dog ears → upright cat ears with pink inner), the tail (pink dog tail → striped pink cat tail), and the belly mark (pink scarf body accent → soft pink heart belly mark). Every other pixel — torso, arms, legs, feet, paws, body width, body height, head position, and face area — must be copied exactly from the reference image.

WHAT YOU MUST NOT CHANGE:
- Torso width and height.
- Arm positions, hand/paw positions.
- Leg positions, foot positions, foot width.
- Head position, head size, and face area location.
- Body centerline, body framing, or overall silhouette bounds.

Style: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon quality.
Background: fully transparent PNG. No backdrop, no props, no accessories, no text, no watermark.
Keep generous transparent padding on all sides. Do not crop any part of the body.
```
