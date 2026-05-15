import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

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
  const prompt = buildPrompt(pet);
  const outputBuffer = await generateBaseBody({ outputPath, prompt, sourcePath });
  await writeFile(outputPath, outputBuffer);
  results.push({ ...pet, outputPath: outputPath.replace(`${rootDir}/`, ""), prompt });
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

function buildPrompt(pet) {
  return [
    "Create a production-ready transparent PNG base-body layer for a mobile app pet avatar.",
    "",
    "Reference role:",
    "- Use the input image only for soft 3D pastel material quality, lighting, polish, and broad species identity.",
    "- Do not preserve the current pose if it conflicts with the standard-v1 body rig below.",
    "",
    "Standard-v1 body rig, non-negotiable:",
    "- Canvas is square, full-body centered, front-facing standing pose.",
    "- The character must fit a 1254x1254 app asset coordinate system.",
    "- Keep the face blank: no eyes, no eyebrows, no nose, no mouth, no facial lines.",
    "- Eye anchors must remain available for overlay at left (542,506) and right (752,506).",
    "- Head anchor top center: (627,356).",
    "- Chest center: (638,772).",
    "- Back/wing center: (627,732).",
    "- Same body size, face area, torso size, hand position, foot position, and framing for every species.",
    "",
    `Pet identity: ${pet.species}.`,
    `Allowed visual traits only: ${pet.traits}.`,
    "",
    "Style:",
    "- Same quality as the reference: soft premium 3D mascot, smooth rounded forms, gentle pastel shading, polished app icon character.",
    "- Transparent background.",
    "- No circular backdrop, no props, no accessories, no text, no watermark.",
    "- Keep generous transparent padding and do not crop.",
  ].join("\n");
}

function buildReport(results) {
  const rows = results.map((result) => `| ${result.id} | ${result.outputPath} | generated candidate | needs visual QA |`).join("\n");
  const prompts = results
    .map((result) => `## ${result.id}\n\nOutput: \`${result.outputPath}\`\n\nPrompt:\n\n\`\`\`text\n${result.prompt}\n\`\`\``)
    .join("\n\n");

  return `# Standard-V1 PNG Base-Body Generation Report

Generated with ${model}, size ${size}, quality ${quality}, background ${background}.

These are candidates and were not copied over the existing production PNGs automatically.

| Pet | Output | Status | Next Step |
| --- | --- | --- | --- |
${rows}

## QA Criteria

- Transparent PNG.
- Blank face only: no eyes, no nose, no mouth.
- Soft 3D pastel quality comparable to existing base-body PNG assets.
- Body, face, hands, feet, and framing follow standard-v1.
- Wearable anchors should match the shared profile.

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
