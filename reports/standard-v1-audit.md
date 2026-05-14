# Standard-V1 Character QA Report

Generated locally without AI image-generation calls.

## Template Contract

- Canvas: 1254 x 1254
- Pose: front-facing standing pose
- Framing: fixed body center and fixed wearable anchors
- Mutable visual traits: fur color, ear shape, tail shape, nose color, markings
- Locked structure: eye coordinates, head anchor, chest anchor, back anchor, body scale, pose

## Shared Wearable Profile

```json
{
  "back": {
    "x": 627,
    "y": 732,
    "width": 610
  },
  "chest": {
    "x": 638,
    "y": 772,
    "width": 150
  },
  "eyes": {
    "x": 647,
    "y": 506,
    "width": 210,
    "left": {
      "x": 542,
      "y": 506
    },
    "right": {
      "x": 752,
      "y": 506
    }
  },
  "head": {
    "x": 627,
    "y": 356,
    "width": 292
  }
}
```

## Generated Assets

| Pet | Template | Left Eye | Right Eye | Head | Chest | Back | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| akkigae | standard-v1 | 542,506 | 752,506 | 627,356 | 638,772 | 627,732 | PASS |
| ttoosseunyang | standard-v1 | 542,506 | 752,506 | 627,356 | 638,772 | 627,732 | PASS |
| kangchongmu | standard-v1 | 542,506 | 752,506 | 627,356 | 638,772 | 627,732 | PASS |

## QA Notes

- The three generated SVG pets share the same body rig and anchor coordinates.
- Existing PNG assets remain in the repo, but app references now prefer standard-v1 SVG assets.
- Landmark editor remains available as a QA/calibration tool at /landmark-editor.html.
- No OpenAI/image-generation tokens were used for this pass.

## Todo 1-6 Status

| # | Task | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Standard-v1 character spec | DONE | `docs/standard-v1-character-generation.md`, shared profile above |
| 2 | Preset character regeneration | DONE | `public/assets/pets/*.svg`, `public/assets/pets/base-body/*.svg` |
| 3 | Wearable item alignment structure | DONE | Shared `STANDARD_WEARABLE_PROFILE` + item transforms |
| 4 | Photo-based character pipeline rule | DONE | Uploaded photo kept as source only; character body uses standard-v1 template |
| 5 | Landmark editor for QA | DONE | `public/landmark-editor.html` |
| 6 | Generation prompt/script contract | DONE | `scripts/generate-standard-pets.mjs`, `docs/standard-v1-character-generation.md` |

## Token Usage

- AI image generation calls: 0
- Generated assets were produced locally as deterministic SVGs.

## Remaining Art Pass

- Replace local SVG placeholders with final rendered art only if the final renderer can preserve the exact standard-v1 body rig.
- Reject or regenerate any result whose eyes/head/chest/back anchors drift from this profile.
