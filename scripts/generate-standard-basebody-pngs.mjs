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
const maxAttempts = Number(env.OPENAI_IMAGE_MAX_ATTEMPTS ?? 3);
const candidatesPerAttempt = Number(env.STANDARD_CANDIDATES_PER_ATTEMPT ?? 3);
const apiRetryLimit = Number(env.OPENAI_IMAGE_API_RETRY_LIMIT ?? 4);
const apiRetryDelayMs = Number(env.OPENAI_IMAGE_API_RETRY_DELAY_MS ?? 15000);
const onlyPetId = getArgValue("--pet");
const referencePetId = env.STANDARD_REFERENCE_PET_ID ?? "akkigae";
const alignmentTolerance = Number(env.STANDARD_ALIGNMENT_TOLERANCE ?? 0.02);
const structuralRegions = {
  core: { bottom: 0.86, left: 0.3, right: 0.7, top: 0.24 },
  head: { bottom: 0.54, left: 0.27, right: 0.73, top: 0.22 },
  torso: { bottom: 0.86, left: 0.3, right: 0.7, top: 0.48 },
};

const pets = [
  {
    id: "akkigae",
    species: "soft floppy-eared puppy",
    traits: "cream white fur, pink floppy ears, pink tail, tiny cream hair tuft, pink scarf body accent",
  },
  {
    id: "ttoosseunyang",
    referenceId: "akkigae",
    referencePath: "public/assets/pets/base-body-standard/akkigae.png",
    species: "round kitten mascot",
    traits: "cream white fur, upright cat ears with pink inner ears, soft pink heart belly mark, striped pink tail",
    speciesOnlyChange:
      "Change ONLY the ears (floppy dog ears → upright cat ears with pink inner), the tail (pink dog tail → striped pink cat tail), and the belly mark (pink scarf body accent → soft pink heart belly mark). Every other pixel — torso, arms, legs, feet, paws, body width, body height, head position, and face area — must be copied exactly from the reference image.",
  },
  {
    id: "kangchongmu",
    referenceId: "akkigae",
    referencePath: "public/assets/pets/base-body-standard/akkigae.png",
    species: "round rabbit mascot",
    traits: "cream white fur, tall rabbit ears with pink inner ears, round cotton tail, pink scarf body accent",
    speciesOnlyChange:
      "Change ONLY the ears (floppy dog ears → tall upright rabbit ears with pink inner) and the tail (pink dog tail → small round cotton tail). Every other pixel — torso, arms, legs, feet, paws, belly, scarf, body width, body height — must be copied exactly from the reference image.",
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
  const [expectedWidth, expectedHeight] = size.split("x").map(Number);
  const attempts = [];
  let selected = null;
  let previousFailures = [];

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const prompt = buildPrompt(pet, attempt, previousFailures);

    // Generate N candidates in parallel and score each one
    const outputBuffers = await generateBaseBodyBatch({ prompt, sourcePath, n: candidatesPerAttempt });

    const scoredCandidates = outputBuffers.map((outputBuffer, i) => {
      const qa = inspectPngFrame(outputBuffer, { expectedHeight, expectedWidth });
      const regions = inspectPngRegions(outputBuffer, structuralRegions, { expectedHeight, expectedWidth });
      const outerAlignment =
        pet.id === referencePetId
          ? { diffsText: "reference body frame", failures: [], passed: true, status: "REFERENCE" }
          : compareFrameMetrics(qa.metrics, referenceMetrics, alignmentTolerance);
      const alignment = {
        diffsText: pet.id === referencePetId ? "reference body frame" : "outer silhouette drift is advisory; ears/tail may change",
        failures: [],
        passed: true,
        status: pet.id === referencePetId ? "REFERENCE" : "ADVISORY",
      };
      const structuralAlignment =
        pet.id === referencePetId
          ? { failures: [], passed: true, status: "REFERENCE", summary: "reference body frame" }
          : compareRegionMetrics(regions, referenceRegions, alignmentTolerance);

      qa.alignment = alignment;
      qa.outerAlignment = outerAlignment;
      qa.structuralAlignment = structuralAlignment;

      if (!alignment.passed || !structuralAlignment.passed) {
        qa.passed = false;
        qa.status = "FAIL";
        qa.notes = [...qa.notes, ...alignment.failures, ...structuralAlignment.failures];
        qa.score -= (alignment.failures.length + structuralAlignment.failures.length) * 30;
      }

      return { candidateIndex: i + 1, outputBuffer, qa };
    });

    // Pick the best candidate by score
    const best = scoredCandidates.reduce((a, b) => (scoreQa(a.qa) >= scoreQa(b.qa) ? a : b));
    const passCount = scoredCandidates.filter((c) => c.qa.passed).length;

    console.log(
      `${pet.id} attempt ${attempt}: ${passCount}/${candidatesPerAttempt} passed — best=${best.qa.passed ? "PASS" : "FAIL"} score=${scoreQa(best.qa).toFixed(1)} structural=${best.qa.structuralAlignment?.status ?? "n/a"}`,
    );

    if (!selected || scoreQa(best.qa) > scoreQa(selected.qa)) {
      selected = { outputBuffer: best.outputBuffer, prompt, qa: best.qa };
    }

    attempts.push({
      attempt,
      candidateCount: candidatesPerAttempt,
      passCount,
      candidates: scoredCandidates.map((c) => ({
        index: c.candidateIndex,
        passed: c.qa.passed,
        score: scoreQa(c.qa).toFixed(1),
        structural: c.qa.structuralAlignment?.summary ?? "n/a",
        bounds: c.qa.boundsText,
      })),
      prompt,
      qa: best.qa,
    });

    if (best.qa.passed) break;

    // Feed exact failure info into the next retry prompt
    previousFailures = [
      ...(best.qa.structuralAlignment?.failures ?? []).map((f) => `structural ${f}`),
      ...(best.qa.alignment?.failures ?? []).map((f) => `frame ${f}`),
      ...best.qa.notes.filter((n) => n !== "automated frame QA passed"),
    ];
  }

  await writeFile(outputPath, selected.outputBuffer);
  results.push({
    ...pet,
    attempts,
    outputPath: outputPath.replace(`${rootDir}/`, ""),
    prompt: selected.prompt,
    qa: selected.qa,
  });
  console.log(`Saved ${outputPath}`);
}

await writeFile(resolve(reportDir, "standard-v1-png-generation-report.md"), buildReport(results));

// Generate N candidates in parallel via separate API calls (guaranteed compatibility)
async function generateBaseBodyBatch({ prompt, sourcePath, n }) {
  return Promise.all(Array.from({ length: n }, () => generateBaseBody({ prompt, sourcePath })));
}

async function generateBaseBody({ prompt, sourcePath }) {
  const sourceBuffer = await readFile(sourcePath);

  let response = null;
  let body = "";

  for (let attempt = 1; attempt <= apiRetryLimit; attempt += 1) {
    const form = new FormData();
    form.append("model", model);
    form.append("prompt", prompt);
    form.append("size", size);
    form.append("quality", quality);
    form.append("background", background);
    form.append("input_fidelity", "high");
    form.append("image", new Blob([sourceBuffer], { type: "image/png" }), basename(sourcePath));

    response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: form,
    });

    if (response.ok) break;

    body = await response.text();
    if (response.status !== 429 || attempt === apiRetryLimit) break;

    console.log(`OpenAI image edit rate limited. Retrying in ${Math.round(apiRetryDelayMs / 1000)}s (${attempt}/${apiRetryLimit})...`);
    await sleep(apiRetryDelayMs);
  }

  if (!response?.ok) {
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

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function buildPrompt(pet, attempt, previousFailures = []) {
  const isReference = pet.id === referencePetId;

  // Exact pixel frame contract — shared by all pets
  const frameContract = [
    "BODY FRAME CONTRACT — all values are for a 1024×1024 px transparent PNG canvas:",
    "- Body centerline: x=512 (±10 px). Left-right drift is a hard failure.",
    "- Full silhouette bounds: left=200–300, right=724–824, top=70–180, bottom=835–950.",
    "- Body width span: ~520 px (~51% of canvas). Body height span: ~780 px (~76% of canvas).",
    "- Head center: x=512, y=350. Face area center: x=512, y=410.",
    "- Eye anchor (left): x=443, y=413. Eye anchor (right): x=614, y=413.",
    "- Chest center: x=521, y=630. Hands/paws symmetrical around upper torso.",
    "- Feet bottom: y=870–930, symmetrical left and right.",
    "- Face must be BLANK: no eyes, no eyebrows, no nose, no mouth, no facial marks of any kind.",
    "- Full-body, front-facing, upright standing pose. No sitting, tilting, leaning, or cropped parts.",
  ];

  const speciesSection = isReference
    ? [
        `Species: ${pet.species}.`,
        `Visual traits: ${pet.traits}.`,
        "Generate this character to precisely match the body frame contract above.",
      ]
    : [
        // Non-reference: structural frame comes from the input image
        "INPUT IMAGE ROLE:",
        "- The input image defines the EXACT body frame. It is the structural template.",
        "- Copy the body silhouette (torso width, arm positions, leg positions, paw positions, feet, head position and size) EXACTLY from the input image.",
        "- Do NOT resize, shrink, widen, raise, or lower the body in any way.",
        "- Do NOT invent a new body shape for this species. Use the input body shape as-is.",
        "",
        "WHAT YOU MAY CHANGE:",
        `- ${pet.speciesOnlyChange ?? `Change only species-specific traits: ear shape, tail shape, fur markings, and colors. Species: ${pet.species}. Traits: ${pet.traits}.`}`,
        "",
        "WHAT YOU MUST NOT CHANGE:",
        "- Torso width and height.",
        "- Arm positions, hand/paw positions.",
        "- Leg positions, foot positions, foot width.",
        "- Head position, head size, and face area location.",
        "- Body centerline, body framing, or overall silhouette bounds.",
      ];

  const retrySection =
    previousFailures.length > 0
      ? [
          "",
          `CORRECTION REQUIRED (attempt ${attempt} — previous generation failed these checks):`,
          ...previousFailures.map((f) => `  - ${f}`),
          "Fix the above issues. Do not change species identity. Prioritize matching the exact pixel targets in the frame contract.",
        ]
      : [];

  return [
    "Generate a production-ready transparent PNG full-body pet avatar for a mobile app.",
    "",
    ...frameContract,
    "",
    ...speciesSection,
    ...retrySection,
    "",
    "Style: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon quality.",
    "Background: fully transparent PNG. No backdrop, no props, no accessories, no text, no watermark.",
    "Keep generous transparent padding on all sides. Do not crop any part of the body.",
  ].join("\n");
}

function buildReport(results) {
  const rows = results
    .map((result) => {
      const totalCandidates = result.attempts.reduce((sum, a) => sum + a.candidateCount, 0);
      const totalPassed = result.attempts.reduce((sum, a) => sum + a.passCount, 0);
      return `| ${result.id} | ${result.outputPath} | ${result.qa.status} | ${result.qa.structuralAlignment?.status ?? "n/a"} | ${result.qa.structuralAlignment?.summary ?? "n/a"} | ${result.qa.boundsText} | ${totalPassed}/${totalCandidates} | ${result.qa.notes.join("<br>")} ${result.qa.warnings.join("<br>")} |`;
    })
    .join("\n");

  const prompts = results
    .map((result) => {
      const attemptLines = result.attempts
        .map((attempt) => {
          const candidateLines = attempt.candidates
            .map((c) => `  - candidate ${c.index}: ${c.passed ? "PASS" : "FAIL"} score=${c.score} structural=${c.structural} bounds=${c.bounds}`)
            .join("\n");
          return `- Attempt ${attempt.attempt} (${attempt.passCount}/${attempt.candidateCount} passed):\n${candidateLines}`;
        })
        .join("\n");

      return `## ${result.id}

Output: \`${result.outputPath}\`

Selected QA: ${result.qa.status} | structural=${result.qa.structuralAlignment?.status ?? "n/a"} | ${result.qa.structuralAlignment?.summary ?? "n/a"}

${attemptLines}

Prompt:

\`\`\`text
${result.prompt}
\`\`\``;
    })
    .join("\n\n");

  return `# Standard-V1 PNG Base-Body Generation Report

Generated with ${model}, size ${size}, quality ${quality}, background ${background}, maxAttempts ${maxAttempts}, candidatesPerAttempt ${candidatesPerAttempt}, reference ${referencePetId}, tolerance ${(alignmentTolerance * 100).toFixed(1)}%.

| Pet | Output | Status | Structural | Region Diffs | Bounds | Passed/Total | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows}

## QA Criteria

- Transparent PNG.
- Blank face: no eyes, no nose, no mouth.
- Soft 3D pastel quality comparable to reference assets.
- Body frame matches standard-v1: centerline, silhouette bounds, structural region alignment within ${(alignmentTolerance * 100).toFixed(0)}%.
- Wearable anchors should match the shared profile.
- Automated QA checks: PNG dimensions, alpha silhouette framing, structural region alignment (core/head/torso) against reference body.
- Manual QA still required for visual quality, expression anchor placement, and wearable fit.

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
