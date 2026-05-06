import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const env = await loadEnv();

const options = parseArgs(process.argv.slice(2));
const petId = options.pet ?? "ttoosseunyang";
const eventType = options.event ?? "record_complete";
const mood = options.mood ?? defaultMoodByEvent(eventType);
const outputDir = resolve(rootDir, env.OPENAI_CUTSCENE_OUTPUT_DIR ?? "public/assets/cutscenes");
const sourceImagePath = resolve(rootDir, options.image ?? `public/assets/pets/${petId}.png`);

const apiKey = env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is missing. Add it to .env.local first.");
}

const prompt = buildCutscenePrompt({ eventType, mood, petId });
const imageModel = env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5";
const imageSize = env.OPENAI_IMAGE_SIZE ?? "1024x1024";
const imageQuality = env.OPENAI_IMAGE_QUALITY ?? "medium";
const imageBackground = env.OPENAI_IMAGE_BACKGROUND ?? "transparent";

console.log(`Generating cutscene with ${imageModel}`);
console.log(`pet=${petId} event=${eventType} mood=${mood}`);

const imageBuffer = await readFile(sourceImagePath);
const form = new FormData();
form.append("model", imageModel);
form.append("prompt", prompt);
form.append("size", imageSize);
form.append("quality", imageQuality);
form.append("background", imageBackground);
form.append("image", new Blob([imageBuffer], { type: "image/png" }), basename(sourceImagePath));

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

let outputBuffer;
if (firstImage.b64_json) {
  outputBuffer = Buffer.from(firstImage.b64_json, "base64");
} else if (firstImage.url) {
  const imageResponse = await fetch(firstImage.url);
  if (!imageResponse.ok) throw new Error(`Could not download generated image: ${imageResponse.status}`);
  outputBuffer = Buffer.from(await imageResponse.arrayBuffer());
} else {
  throw new Error(`Unsupported image response: ${JSON.stringify(firstImage)}`);
}

await mkdir(outputDir, { recursive: true });
const outputName = `${petId}-${eventType}-${Date.now()}.png`;
const outputPath = join(outputDir, outputName);
await writeFile(outputPath, outputBuffer);

console.log(`Saved ${outputPath}`);
console.log(`Prompt:\n${prompt}`);

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

function parseArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    if (!token.startsWith("--")) continue;

    const key = token.slice(2);
    const next = args[index + 1];
    if (!next || next.startsWith("--")) {
      parsed[key] = "true";
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function defaultMoodByEvent(eventType) {
  const moods = {
    budget_over: "worried",
    daily_checkin: "happy",
    feed_treat: "delighted",
    level_up: "proud",
    outfit_share: "confident",
    record_complete: "happy",
  };

  return moods[eventType] ?? "happy";
}

function buildCutscenePrompt({ eventType, mood, petId }) {
  const petName = petId === "akkigae" ? "아끼개" : petId === "ttoosseunyang" ? "또쓰냥" : "the pet";
  const eventScene = describeEvent(eventType);

  return [
    "Use the provided pet character image as the identity reference.",
    `Pet name: ${petName}.`,
    `Event: ${eventType}.`,
    `Scene direction: ${eventScene}`,
    `Mood: ${mood}.`,
    "Create one polished mobile game cutscene image.",
    "Keep the same face shape, body proportion, soft pastel palette, and cute rounded style as the reference pet.",
    "The result should feel like the same character in a new expressive moment, not a different animal.",
    "Bright clean app-friendly composition, centered character, no UI chrome.",
    "No text, no watermark, no logos.",
    "If the background is transparent, keep the character fully visible with clean edges.",
  ].join("\n");
}

function describeEvent(eventType) {
  const scenes = {
    budget_over: "The pet gently worries while looking at an overflowing coin jar and a soft warning sparkle.",
    daily_checkin: "The pet greets the user cheerfully with small morning sparkles.",
    feed_treat: "The pet happily receives a tiny snack and hearts float around it.",
    level_up: "The pet celebrates a level up with confetti, glow, and a proud pose.",
    outfit_share: "The pet poses proudly like a cute outfit showcase.",
    record_complete: "The pet celebrates that the user recorded spending, with tiny coins and happy sparkles.",
  };

  return scenes[eventType] ?? "The pet reacts warmly in a cute mobile game moment.";
}
