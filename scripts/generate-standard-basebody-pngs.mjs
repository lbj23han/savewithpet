import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { inspectPngFrame, scoreQa } from "./lib/png-frame-qa.mjs";

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
    species: "round rabbit mascot",
    traits: "cream white fur, tall rabbit ears with pink inner ears, round cotton tail, pink scarf body accent",
  },
];

await mkdir(outputDir, { recursive: true });
await mkdir(reportDir, { recursive: true });

const results = [];
for (const pet of pets) {
  const sourcePath = resolve(rootDir, `public/assets/pets/base-body/${pet.id}.png`);
  const outputPath = resolve(outputDir, `${pet.id}.png`);
  const attempts = [];
  let selected = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const prompt = buildPrompt(pet, attempt);
    const outputBuffer = await generateBaseBody({ prompt, sourcePath });
    const [expectedWidth, expectedHeight] = size.split("x").map(Number);
    const qa = inspectPngFrame(outputBuffer, { expectedHeight, expectedWidth });
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
    "- Keep the body centerline at x=512. The visual center must not drift left or right.",
    "- Head center target: x=512, y=350. Face area target: x=512, y=410.",
    "- Eye/expression anchors must remain available at left x=443 y=413 and right x=614 y=413 in 1024 coordinates.",
    "- Chest center target: x=521, y=630. Hands/paws must sit symmetrically around the upper torso.",
    "- Feet must end near y=870-930 and remain symmetrical.",
    "- Keep the face blank: no eyes, no eyebrows, no nose, no mouth, no facial lines.",
    "- Same body size, face area, torso size, hand position, foot position, and framing for every species.",
    "- Species traits may change ear shape, tail shape, fur markings, and colors only. They must not move the torso, head, face area, hands, feet, or framing.",
    "- The result should look like one complete full base-body character, not detached overlay pieces.",
    "",
    `Pet identity: ${pet.species}.`,
    `Allowed visual traits only: ${pet.traits}.`,
    `Generation pass: ${attempt}. If this is not pass 1, correct framing drift by making the body more centered and closer to the target coordinates.`,
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
        `| ${result.id} | ${result.outputPath} | ${result.qa.status} | ${result.qa.boundsText} | ${result.qa.notes.join("<br>")} ${result.qa.warnings.join("<br>")} |`,
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
      `- Attempt ${attempt.attempt}: ${attempt.qa.status} / ${attempt.qa.boundsText} / ${attempt.qa.notes.join("; ")} ${attempt.qa.warnings.join("; ")}`,
  )
  .join("\n")}

Prompt:

\`\`\`text
${result.prompt}
\`\`\``,
    )
    .join("\n\n");

  return `# Standard-V1 PNG Base-Body Generation Report

Generated with ${model}, size ${size}, quality ${quality}, background ${background}, max attempts ${maxAttempts}.

| Pet | Output | Status | Bounds | Notes |
| --- | --- | --- | --- | --- |
${rows}

## QA Criteria

- Transparent PNG.
- Blank face only: no eyes, no nose, no mouth.
- Soft 3D pastel quality comparable to existing base-body PNG assets.
- Body, face, hands, feet, and framing follow standard-v1.
- Wearable anchors should match the shared profile.
- Automated QA currently checks PNG dimensions and alpha silhouette framing. Visual QA is still required for eye/face anchor quality.

${prompts}
`;
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
