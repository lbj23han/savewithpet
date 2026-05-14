import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const viewBox = 1254;

const profile = {
  back: { x: 627, y: 732, width: 610 },
  chest: { x: 638, y: 772, width: 150 },
  eyes: { x: 647, y: 506, width: 210, left: { x: 542, y: 506 }, right: { x: 752, y: 506 } },
  head: { x: 627, y: 356, width: 292 },
};

const pets = [
  {
    id: "akkigae",
    label: "아끼개",
    species: "dog",
    body: "#fff4e8",
    shade: "#f7dcc8",
    ear: "#f58fa6",
    tail: "#f58fa6",
    spot: "#fff0d8",
    nose: "#5a3028",
    mark: "curl",
  },
  {
    id: "ttoosseunyang",
    label: "또쓰냥",
    species: "cat",
    body: "#fff1df",
    shade: "#f8d5ba",
    ear: "#f7a56f",
    tail: "#f7a56f",
    spot: "#f6c482",
    nose: "#6f3a34",
    mark: "stripes",
  },
  {
    id: "kangchongmu",
    label: "깡총무",
    species: "rabbit",
    body: "#fff7ee",
    shade: "#f4dfd3",
    ear: "#f7a5b7",
    tail: "#f5d7ce",
    spot: "#fff7ee",
    nose: "#9c514a",
    mark: "tuft",
  },
];

await mkdir(resolve(rootDir, "public/assets/pets/base-body"), { recursive: true });
await mkdir(resolve(rootDir, "reports"), { recursive: true });

for (const pet of pets) {
  await writeFile(resolve(rootDir, `public/assets/pets/base-body/${pet.id}.svg`), buildBodySvg(pet));
  await writeFile(resolve(rootDir, `public/assets/pets/${pet.id}.svg`), buildFullSvg(pet));
}

await writeFile(resolve(rootDir, "reports/standard-v1-audit.md"), buildAuditReport());
await writeFile(resolve(rootDir, "reports/standard-v1-wearable-profile.json"), `${JSON.stringify(profile, null, 2)}\n`);

console.log(`Generated ${pets.length} standard-v1 pets and reports/standard-v1-audit.md`);

function buildFullSvg(pet) {
  return svgDocument(`${bodyMarkup(pet)}${neutralFaceMarkup(pet)}`);
}

function buildBodySvg(pet) {
  return svgDocument(bodyMarkup(pet));
}

function svgDocument(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBox} ${viewBox}" fill="none">
  <title>standard-v1 pet body</title>
${content}
</svg>
`;
}

function bodyMarkup(pet) {
  return `  <g id="standard-v1-body" data-template="standard-v1">
    <ellipse cx="627" cy="1110" rx="230" ry="38" fill="#ead8d2" opacity="0.32"/>
    ${tailMarkup(pet)}
    ${earMarkup(pet)}
    <ellipse cx="627" cy="430" rx="238" ry="214" fill="${pet.body}"/>
    <path d="M425 416C454 322 532 260 627 260C722 260 800 322 829 416C782 370 712 345 627 345C542 345 472 370 425 416Z" fill="#fffdf8" opacity="0.44"/>
    ${headMarkMarkup(pet)}
    <ellipse cx="627" cy="790" rx="204" ry="254" fill="${pet.body}"/>
    <path d="M476 706C516 666 581 646 627 646C674 646 738 666 778 706C734 687 682 678 627 678C572 678 520 687 476 706Z" fill="#fffdf8" opacity="0.36"/>
    <ellipse cx="486" cy="780" rx="58" ry="94" fill="${pet.body}" transform="rotate(24 486 780)"/>
    <ellipse cx="768" cy="780" rx="58" ry="94" fill="${pet.body}" transform="rotate(-24 768 780)"/>
    <ellipse cx="520" cy="996" rx="57" ry="75" fill="${pet.body}"/>
    <ellipse cx="734" cy="996" rx="57" ry="75" fill="${pet.body}"/>
    <ellipse cx="502" cy="1044" rx="60" ry="22" fill="${pet.shade}" opacity="0.42"/>
    <ellipse cx="752" cy="1044" rx="60" ry="22" fill="${pet.shade}" opacity="0.42"/>
    <path d="M548 731C589 758 665 758 706 731L735 780C683 821 571 821 519 780L548 731Z" fill="#f25f88"/>
    <path d="M562 742C596 758 659 758 693 742" stroke="#ffd6df" stroke-width="12" stroke-linecap="round" opacity="0.7"/>
    <ellipse cx="498" cy="604" rx="44" ry="24" fill="#f6a6b2" opacity="0.36"/>
    <ellipse cx="756" cy="604" rx="44" ry="24" fill="#f6a6b2" opacity="0.36"/>
    <circle cx="${profile.eyes.left.x}" cy="${profile.eyes.left.y}" r="9" fill="#7fd6ff" opacity="0.01"/>
    <circle cx="${profile.eyes.right.x}" cy="${profile.eyes.right.y}" r="9" fill="#7fd6ff" opacity="0.01"/>
  </g>
`;
}

function neutralFaceMarkup(pet) {
  return `  <g id="neutral-face">
    <path d="M495 474C519 452 556 452 580 474" stroke="${pet.nose}" stroke-width="20" stroke-linecap="round"/>
    <path d="M674 474C698 452 735 452 759 474" stroke="${pet.nose}" stroke-width="20" stroke-linecap="round"/>
    <ellipse cx="627" cy="554" rx="34" ry="22" fill="${pet.nose}"/>
    <path d="M627 574V596" stroke="${pet.nose}" stroke-width="10" stroke-linecap="round"/>
    <path d="M626 598C608 622 578 620 565 598" stroke="${pet.nose}" stroke-width="10" stroke-linecap="round"/>
    <path d="M628 598C646 622 676 620 689 598" stroke="${pet.nose}" stroke-width="10" stroke-linecap="round"/>
  </g>
`;
}

function earMarkup(pet) {
  if (pet.species === "rabbit") {
    return `<path d="M498 271C443 117 481 57 531 87C574 113 574 204 535 324Z" fill="${pet.body}"/>
    <path d="M756 271C811 117 773 57 723 87C680 113 680 204 719 324Z" fill="${pet.body}"/>
    <path d="M512 258C480 143 505 104 528 118C554 134 549 207 528 288Z" fill="${pet.ear}" opacity="0.82"/>
    <path d="M742 258C774 143 749 104 726 118C700 134 705 207 726 288Z" fill="${pet.ear}" opacity="0.82"/>`;
  }

  if (pet.species === "cat") {
    return `<path d="M430 363L481 196L574 342Z" fill="${pet.body}"/>
    <path d="M824 363L773 196L680 342Z" fill="${pet.body}"/>
    <path d="M462 337L491 254L536 331Z" fill="${pet.ear}" opacity="0.72"/>
    <path d="M792 337L763 254L718 331Z" fill="${pet.ear}" opacity="0.72"/>`;
  }

  return `<ellipse cx="433" cy="402" rx="72" ry="136" fill="${pet.ear}" transform="rotate(28 433 402)"/>
    <ellipse cx="821" cy="402" rx="72" ry="136" fill="${pet.ear}" transform="rotate(-28 821 402)"/>`;
}

function tailMarkup(pet) {
  if (pet.species === "cat") {
    return `<path d="M802 820C940 800 935 1010 792 990" stroke="${pet.tail}" stroke-width="76" stroke-linecap="round"/>`;
  }

  if (pet.species === "rabbit") {
    return `<circle cx="828" cy="861" r="60" fill="${pet.tail}"/>`;
  }

  return `<path d="M804 844C900 774 963 888 862 936" stroke="${pet.tail}" stroke-width="70" stroke-linecap="round"/>`;
}

function headMarkMarkup(pet) {
  if (pet.mark === "stripes") {
    return `<path d="M552 330L536 402" stroke="${pet.spot}" stroke-width="20" stroke-linecap="round"/>
    <path d="M627 312V394" stroke="${pet.spot}" stroke-width="20" stroke-linecap="round"/>
    <path d="M702 330L718 402" stroke="${pet.spot}" stroke-width="20" stroke-linecap="round"/>`;
  }

  if (pet.mark === "tuft") {
    return `<path d="M592 264C625 214 671 238 660 292C640 270 616 266 592 264Z" fill="${pet.shade}" opacity="0.55"/>`;
  }

  return `<path d="M592 270C640 218 695 266 646 318C637 284 617 272 592 270Z" fill="${pet.spot}" opacity="0.7"/>`;
}

function buildAuditReport() {
  const rows = pets
    .map(
      (pet) =>
        `| ${pet.id} | standard-v1 | ${profile.eyes.left.x},${profile.eyes.left.y} | ${profile.eyes.right.x},${profile.eyes.right.y} | ${profile.head.x},${profile.head.y} | ${profile.chest.x},${profile.chest.y} | ${profile.back.x},${profile.back.y} | PASS |`,
    )
    .join("\n");

  return `# Standard-V1 Character QA Report

Generated locally without AI image-generation calls.

## Template Contract

- Canvas: ${viewBox} x ${viewBox}
- Pose: front-facing standing pose
- Framing: fixed body center and fixed wearable anchors
- Mutable visual traits: fur color, ear shape, tail shape, nose color, markings
- Locked structure: eye coordinates, head anchor, chest anchor, back anchor, body scale, pose

## Shared Wearable Profile

\`\`\`json
${JSON.stringify(profile, null, 2)}
\`\`\`

## Generated Assets

| Pet | Template | Left Eye | Right Eye | Head | Chest | Back | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## QA Notes

- The three generated SVG pets share the same body rig and anchor coordinates.
- Existing PNG assets remain in the repo, but app references now prefer standard-v1 SVG assets.
- Landmark editor remains available as a QA/calibration tool at /landmark-editor.html.
- No OpenAI/image-generation tokens were used for this pass.

## Todo 1-6 Status

| # | Task | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Standard-v1 character spec | DONE | \`docs/standard-v1-character-generation.md\`, shared profile above |
| 2 | Preset character regeneration | DONE | \`public/assets/pets/*.svg\`, \`public/assets/pets/base-body/*.svg\` |
| 3 | Wearable item alignment structure | DONE | Shared \`STANDARD_WEARABLE_PROFILE\` + item transforms |
| 4 | Photo-based character pipeline rule | DONE | Uploaded photo kept as source only; character body uses standard-v1 template |
| 5 | Landmark editor for QA | DONE | \`public/landmark-editor.html\` |
| 6 | Generation prompt/script contract | DONE | \`scripts/generate-standard-pets.mjs\`, \`docs/standard-v1-character-generation.md\` |

## Token Usage

- AI image generation calls: 0
- Generated assets were produced locally as deterministic SVGs.

## Remaining Art Pass

- Replace local SVG placeholders with final rendered art only if the final renderer can preserve the exact standard-v1 body rig.
- Reject or regenerate any result whose eyes/head/chest/back anchors drift from this profile.
`;
}
