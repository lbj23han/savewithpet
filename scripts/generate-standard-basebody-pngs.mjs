import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { compareFrameMetrics, compareRegionMetrics, inspectPngFrame, inspectPngRegions, scoreQa } from "./lib/png-frame-qa.mjs";

const rootDir = resolve(import.meta.dirname, "..");
const env = await loadEnv();

const apiKey = env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is missing. Add it to .env.local first.");
}

const outputDir = resolve(rootDir, "public/assets/pets/base-body-standard");
const reportDir = resolve(rootDir, "reports");
const model = env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5";
const size = env.OPENAI_IMAGE_SIZE ?? "1024x1024";
const quality = env.OPENAI_IMAGE_QUALITY ?? "low";
const background = env.OPENAI_IMAGE_BACKGROUND ?? "transparent";
const maxAttempts = Number(env.OPENAI_IMAGE_MAX_ATTEMPTS ?? 2);
const onlyPetId = getArgValue("--pet");
const referencePetId = env.STANDARD_REFERENCE_PET_ID ?? "akkigae";
const alignmentTolerance = Number(env.STANDARD_ALIGNMENT_TOLERANCE ?? 0.02);
const structuralRegions = {
  core: { bottom: 0.92, left: 0.18, right: 0.82, top: 0.18 },
  head: { bottom: 0.54, left: 0.18, right: 0.82, top: 0.08 },
  torso: { bottom: 0.92, left: 0.26, right: 0.74, top: 0.42 },
};

const pets = [
  {
    id: "akkigae",
    species: "soft floppy-eared puppy",
    traits: "cream white fur, pink floppy ears, pink tail, tiny cream hair tuft, pink scarf body accent",
  },
  {
    id: "ttoosseunyang",
    species: "round kitten mascot",
    traits: "cream white fur, upright cat ears with pink inner ears, soft pink heart belly mark, striped pink tail",
  },
  {
    id: "kangchongmu",
    referenceId: "akkigae",
    referencePath: "public/assets/pets/base-body-standard/akkigae.png",
    species: "round rabbit mascot",
    traits:
      "cream white fur, tall rabbit ears with pink inner ears, round cotton tail, pink scarf body accent",
    frameNotes:
      "Use the input puppy image as the exact body-frame reference. Preserve the alpha silhouette and size from neck down exactly. Keep the same head width, torso width, arm positions, leg positions, foot positions, chest height, body centerline, and bottom baseline. Only convert species traits to rabbit by replacing floppy ears with tall rabbit ears and changing the tail to a small round cotton tail. Do not shrink the body. Do not create a slim rabbit body. Do not move the paws, torso, feet, or head silhouette inward.",
  },
];

await mkdir(outputDir, { recursive: true });
await mkdir(reportDir, { recursive: true });

const results = [];
const selectedPets = onlyPetId ? pets.filter((pet) => pet.id === onlyPetId) : pets;
if (!selectedPets.length) {
  throw new Error(`Unknown pet id: ${onlyPetId}`);
}

const referenceMetrics = await loadReferenceMetrics();
const referenceRegions = await loadReferenceRegions();

for (const pet of selectedPets) {
  const sourcePath = resolve(rootDir, pet.referencePath ?? `public/assets/pets/base-body/${pet.referenceId ?? pet.id}.png`);
  const outputPath = resolve(outputDir, `${pet.id}.png`);
  const attempts = [];
  let selected = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const prompt = buildPrompt(pet, attempt);
    const outputBuffer = await generateBaseBody({ prompt, sourcePath });
    const [expectedWidth, expectedHeight] = size.split("x").map(Number);
    const qa = inspectPngFrame(outputBuffer, { expectedHeight, expectedWidth });
    const regions = inspectPngRegions(outputBuffer, structuralRegions, { expectedHeight, expectedWidth });
    const alignment =
      pet.id === referencePetId
        ? { diffsText: "reference body frame", failures: [], passed: true, status: "REFERENCE" }
        : compareFrameMetrics(qa.metrics, referenceMetrics, alignmentTolerance);
    const structuralAlignment =
      pet.id === referencePetId
        ? { failures: [], passed: true, status: "REFERENCE", summary: "reference body frame" }
        : compareRegionMetrics(regions, referenceRegions, alignmentTolerance);
    qa.alignment = alignment;
    qa.structuralAlignment = structuralAlignment;
    if (!alignment.passed || !structuralAlignment.passed) {
      qa.passed = false;
      qa.status = "FAIL";
      qa.notes = [...qa.notes, ...alignment.failures, ...structuralAlignment.failures];
      qa.score -= (alignment.failures.length + structuralAlignment.failures.length) * 30;
    }
    attempts.push({ attempt, prompt, qa });
    console.log(`${pet.id} attempt ${attempt}: ${qa.passed ? "PASS" : "FAIL"} - ${qa.notes.join("; ")}`);

    if (!selected || scoreQa(qa) > scoreQa(selected.qa)) {
      selected = { outputBuffer, prompt, qa };
    }

    if (qa.passed) break;
  }

  await writeFile(outputPath, selected.outputBuffer);
  results.push({ ...pet, attempts, outputPath: outputPath.replace(`${rootDir}/`, ""), prompt: selected.prompt, qa: selected.qa });
  console.log(`Saved ${outputPath}`);
}

await writeFile(resolve(reportDir, "standard-v1-png-generation-report.md"), buildReport(results));

async function generateBaseBody({ prompt, sourcePath }) {
  const sourceBuffer = await readFile(sourcePath);
  const form = new FormData();
  form.append("model", model);
  form.append("prompt", prompt);
  form.append("size", size);
  form.append("quality", quality);
  form.append("background", background);
  form.append("input_fidelity", "high");
  form.append("image", new Blob([sourceBuffer], { type: "image/png" }), basename(sourcePath));

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI image edit failed (${response.status}): ${body}`);
  }

  const result = await response.json();
  const firstImage = result.data?.[0];
  if (!firstImage) {
    throw new Error(`OpenAI image edit returned no image: ${JSON.stringify(result)}`);
  }

  if (firstImage.b64_json) return Buffer.from(firstImage.b64_json, "base64");
  if (firstImage.url) {
    const imageResponse = await fetch(firstImage.url);
    if (!imageResponse.ok) throw new Error(`Could not download generated image: ${imageResponse.status}`);
    return Buffer.from(await imageResponse.arrayBuffer());
  }

  throw new Error(`Unsupported image response: ${JSON.stringify(firstImage)}`);
}

function buildPrompt(pet, attempt) {
  return [
    "Create a production-ready transparent PNG base-body layer for a mobile app pet avatar.",
    "",
    "Reference role:",
    "- Use the input image only for soft 3D pastel material quality, lighting, polish, and broad species identity.",
    "- Do not preserve the current pose if it conflicts with the standard-v1 body rig below.",
    "",
    "Standard-v1 body rig, non-negotiable:",
    "- Canvas is exactly square. Generate for 1024x1024 transparent PNG, mapped to a 1254x1254 app asset coordinate system.",
    "- Full-body centered, front-facing standing pose. No sitting, no rotated body, no leaning, no cropped parts.",
    "- Overall character silhouette target in 1024 coordinates: left 200-300, right 724-824, top 70-180, bottom 835-950.",
    "- If the input image already has a good body frame, preserve that frame exactly.",
    "- For non-reference species, change only species traits while keeping the input body frame and proportions.",
    "- Keep the body centerline at x=512. The visual center must not drift left or right.",
    "- Head center target: x=512, y=350. Face area target: x=512, y=410.",
    "- Eye/expression anchors must remain available at left x=443 y=413 and right x=614 y=413 in 1024 coordinates.",
    "- Chest center target: x=521, y=630. Hands/paws must sit symmetrically around the upper torso.",
    "- Feet must end near y=870-930 and remain symmetrical.",
    "- Keep the face blank: no eyes, no eyebrows, no nose, no mouth, no facial lines.",
    "- Same body size, face area, torso size, hand position, foot position, and framing for every species.",
    "- Body width, torso width, arm positions, and foot positions must be visually identical to the reference character.",
    "- Species traits may change ear shape, tail shape, fur markings, and colors only. They must not move the torso, head, face area, hands, feet, or framing.",
    "- The result should look like one complete full base-body character, not detached overlay pieces.",
    "",
    `Pet identity: ${pet.species}.`,
    `Allowed visual traits only: ${pet.traits}.`,
    pet.frameNotes ? `Species-specific frame lock: ${pet.frameNotes}` : "",
    `Generation pass: ${attempt}. If this is not pass 1, correct framing drift by making the body more centered and closer to the target coordinates.`,
    `Strict visual alignment target: match ${referencePetId}'s body frame within ${(alignmentTolerance * 100).toFixed(0)}% for center, top, bottom, width, and height.`,
    "",
    "Style:",
    "- Same quality as the reference: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon character.",
    "- Transparent background.",
    "- No circular backdrop, no props, no accessories, no text, no watermark.",
    "- Keep generous transparent padding and do not crop.",
  ].join("\n");
}

function buildReport(results) {
  const rows = results
    .map(
      (result) =>
    `| ${result.id} | ${result.outputPath} | ${result.qa.status} | ${result.qa.structuralAlignment?.status ?? "n/a"} | ${result.qa.structuralAlignment?.summary ?? "n/a"} | ${result.qa.boundsText} | ${result.qa.notes.join("<br>")} ${result.qa.warnings.join("<br>")} |`,
    )
    .join("\n");
  const prompts = results
    .map(
      (result) => `## ${result.id}

Output: \`${result.outputPath}\`

Selected QA: ${result.qa.status}

${result.attempts
  .map(
    (attempt) =>
      `- Attempt ${attempt.attempt}: ${attempt.qa.status} / ${attempt.qa.structuralAlignment?.status ?? "n/a"} / ${attempt.qa.structuralAlignment?.summary ?? "n/a"} / ${attempt.qa.boundsText} / ${attempt.qa.notes.join("; ")} ${attempt.qa.warnings.join("; ")}`,
  )
  .join("\n")}

Prompt:

\`\`\`text
${result.prompt}
\`\`\``,
    )
    .join("\n\n");

  return `# Standard-V1 PNG Base-Body Generation Report

Generated with ${model}, size ${size}, quality ${quality}, background ${background}, max attempts ${maxAttempts}, reference ${referencePetId}, tolerance ${(alignmentTolerance * 100).toFixed(1)}%.

| Pet | Output | Status | Structural Alignment | Region Diffs | Bounds | Notes |
| --- | --- | --- | --- | --- | --- | --- |
${rows}

## QA Criteria

- Transparent PNG.
- Blank face only: no eyes, no nose, no mouth.
- Soft 3D pastel quality comparable to existing base-body PNG assets.
- Body, head, torso, face anchor, hands, feet, and framing follow standard-v1.
- Wearable anchors should match the shared profile.
- Automated QA checks PNG dimensions, full alpha silhouette framing, and structural region alignment against the reference body.

${prompts}
`;
}

async function loadReferenceMetrics() {
  const referencePath = resolve(outputDir, `${referencePetId}.png`);
  const buffer = await readFile(referencePath);
  return inspectPngFrame(buffer).metrics;
}

async function loadReferenceRegions() {
  const referencePath = resolve(outputDir, `${referencePetId}.png`);
  const buffer = await readFile(referencePath);
  return inspectPngRegions(buffer, structuralRegions);
}

function getArgValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  return process.argv[index + 1] ?? null;
}

async function loadEnv() {
  const envFiles = [".env.local", ".env"];
  const loaded = { ...process.env };

  for (const envFile of envFiles) {
    try {
      const content = await readFile(resolve(rootDir, envFile), "utf8");
      content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#") && line.includes("="))
        .forEach((line) => {
          const index = line.indexOf("=");
          const key = line.slice(0, index).trim();
          const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
          loaded[key] = value;
        });
    } catch {
      // Missing env files are fine.
    }
  }

  return loaded;
}
