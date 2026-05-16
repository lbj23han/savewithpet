import { inflateSync } from "node:zlib";
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
    const qa = inspectPngFrame(outputBuffer);
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
        `| ${result.id} | ${result.outputPath} | ${result.qa.passed ? "PASS" : "BEST_EFFORT"} | ${result.qa.boundsText} | ${result.qa.notes.join("<br>")} |`,
    )
    .join("\n");
  const prompts = results
    .map(
      (result) => `## ${result.id}

Output: \`${result.outputPath}\`

Selected QA: ${result.qa.passed ? "PASS" : "BEST_EFFORT"}

${result.attempts
  .map(
    (attempt) =>
      `- Attempt ${attempt.attempt}: ${attempt.qa.passed ? "PASS" : "FAIL"} / ${attempt.qa.boundsText} / ${attempt.qa.notes.join("; ")}`,
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

function inspectPngFrame(buffer) {
  const png = decodePng(buffer);
  const notes = [];
  const [expectedWidth, expectedHeight] = size.split("x").map(Number);

  if (png.width !== expectedWidth || png.height !== expectedHeight) {
    notes.push(`dimensions ${png.width}x${png.height}, expected ${expectedWidth}x${expectedHeight}`);
  }

  const bounds = getAlphaBounds(png);
  if (!bounds) {
    return {
      bounds: null,
      boundsText: "no visible alpha",
      notes: ["no visible alpha"],
      passed: false,
      score: -100,
    };
  }

  const centerX = (bounds.left + bounds.right) / 2 / png.width;
  const top = bounds.top / png.height;
  const bottom = bounds.bottom / png.height;
  const widthRatio = (bounds.right - bounds.left + 1) / png.width;
  const heightRatio = (bounds.bottom - bounds.top + 1) / png.height;

  if (Math.abs(centerX - 0.5) > 0.045) notes.push(`centerX ${centerX.toFixed(3)} outside 0.455-0.545`);
  if (top < 0.04 || top > 0.22) notes.push(`top ${top.toFixed(3)} outside 0.040-0.220`);
  if (bottom < 0.78 || bottom > 0.96) notes.push(`bottom ${bottom.toFixed(3)} outside 0.780-0.960`);
  if (widthRatio < 0.42 || widthRatio > 0.76) notes.push(`width ${widthRatio.toFixed(3)} outside 0.420-0.760`);
  if (heightRatio < 0.66 || heightRatio > 0.93) notes.push(`height ${heightRatio.toFixed(3)} outside 0.660-0.930`);

  return {
    bounds,
    boundsText: `left=${bounds.left}, top=${bounds.top}, right=${bounds.right}, bottom=${bounds.bottom}, centerX=${centerX.toFixed(3)}, width=${widthRatio.toFixed(3)}, height=${heightRatio.toFixed(3)}`,
    notes: notes.length ? notes : ["automated frame QA passed"],
    passed: notes.length === 0,
    score:
      100 -
      Math.abs(centerX - 0.5) * 400 -
      Math.abs(top - 0.12) * 120 -
      Math.abs(bottom - 0.88) * 120 -
      Math.abs(widthRatio - 0.58) * 80 -
      Math.abs(heightRatio - 0.78) * 80 -
      notes.length * 20,
  };
}

function scoreQa(qa) {
  return qa.score;
}

function getAlphaBounds(png) {
  let left = png.width;
  let right = -1;
  let top = png.height;
  let bottom = -1;

  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const index = (y * png.width + x) * 4;
      if (png.data[index + 3] <= 12) continue;

      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) return null;
  return { bottom, left, right, top };
}

function decodePng(buffer) {
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("Output is not a PNG file.");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idatParts = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += 12 + length;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      const bitDepth = data[8];
      colorType = data[9];
      if (bitDepth !== 8) throw new Error(`Unsupported PNG bit depth: ${bitDepth}`);
      if (![2, 6].includes(colorType)) throw new Error(`Unsupported PNG color type: ${colorType}`);
    }

    if (type === "IDAT") idatParts.push(data);
    if (type === "IEND") break;
  }

  const channels = colorType === 6 ? 4 : 3;
  const raw = inflateSync(Buffer.concat(idatParts));
  const stride = width * channels;
  const scanlines = Buffer.alloc(height * stride);
  let inputOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[inputOffset];
    inputOffset += 1;
    const rowStart = y * stride;

    for (let x = 0; x < stride; x += 1) {
      const value = raw[inputOffset + x];
      const left = x >= channels ? scanlines[rowStart + x - channels] : 0;
      const up = y > 0 ? scanlines[rowStart + x - stride] : 0;
      const upLeft = y > 0 && x >= channels ? scanlines[rowStart + x - stride - channels] : 0;
      scanlines[rowStart + x] = unfilter(filter, value, left, up, upLeft);
    }

    inputOffset += stride;
  }

  const data = Buffer.alloc(width * height * 4);
  for (let i = 0, j = 0; i < scanlines.length; i += channels, j += 4) {
    data[j] = scanlines[i];
    data[j + 1] = scanlines[i + 1];
    data[j + 2] = scanlines[i + 2];
    data[j + 3] = colorType === 6 ? scanlines[i + 3] : 255;
  }

  return { data, height, width };
}

function unfilter(filter, value, left, up, upLeft) {
  if (filter === 0) return value;
  if (filter === 1) return (value + left) & 0xff;
  if (filter === 2) return (value + up) & 0xff;
  if (filter === 3) return (value + Math.floor((left + up) / 2)) & 0xff;
  if (filter === 4) return (value + paeth(left, up, upLeft)) & 0xff;
  throw new Error(`Unsupported PNG filter: ${filter}`);
}

function paeth(left, up, upLeft) {
  const p = left + up - upLeft;
  const pa = Math.abs(p - left);
  const pb = Math.abs(p - up);
  const pc = Math.abs(p - upLeft);

  if (pa <= pb && pa <= pc) return left;
  if (pb <= pc) return up;
  return upLeft;
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
