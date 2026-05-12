import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const env = await loadEnv();

const options = parseArgs(process.argv.slice(2));
const petId = options.pet ?? "ttoosseunyang";
const eventType = options.event ?? "record_complete";
const mood = options.mood ?? defaultMoodByEvent(eventType);
const mode = options.mode ?? (isMicroInteraction(eventType) ? "variant" : env.OPENAI_CUTSCENE_MODE) ?? "scene";
const species = options.species ?? inferSpecies(petId);
const traitNotes = options.traits ?? "";
const outputDir = resolve(rootDir, env.OPENAI_CUTSCENE_OUTPUT_DIR ?? "public/assets/cutscenes");
const sourceImagePath = resolve(rootDir, options.image ?? `public/assets/pets/${petId}.png`);
const maskImagePath = options.mask ? resolve(rootDir, options.mask) : undefined;
const hasMask = Boolean(maskImagePath);

const prompt = buildCutscenePrompt({ eventType, mode, mood, petId, species, traitNotes, hasMask });
if (options["print-prompt"] === "true") {
  console.log(prompt);
  process.exit(0);
}

const apiKey = env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OPENAI_API_KEY is missing. Add it to .env.local first.");
}

const imageModel = env.OPENAI_IMAGE_MODEL ?? "gpt-image-1.5";
const imageSize = env.OPENAI_IMAGE_SIZE ?? "1024x1024";
const imageQuality = env.OPENAI_IMAGE_QUALITY ?? "medium";
const imageBackground = env.OPENAI_IMAGE_BACKGROUND ?? "transparent";
const imageInputFidelity = env.OPENAI_IMAGE_INPUT_FIDELITY ?? "high";

console.log(`Generating cutscene with ${imageModel}`);
console.log(`pet=${petId} event=${eventType} mood=${mood} mode=${mode}`);

const imageBuffer = await readFile(sourceImagePath);
const form = new FormData();
form.append("model", imageModel);
form.append("prompt", prompt);
form.append("size", imageSize);
form.append("quality", imageQuality);
form.append("background", imageBackground);
form.append("input_fidelity", imageInputFidelity);
form.append("image", new Blob([imageBuffer], { type: "image/png" }), basename(sourceImagePath));
if (maskImagePath) {
  const maskBuffer = await readFile(maskImagePath);
  form.append("mask", new Blob([maskBuffer], { type: "image/png" }), basename(maskImagePath));
}

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
await updateManifest({
  outputDir,
  petId,
  eventType,
  outputName,
});

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
    sad_eyes: "sad",
    one_hand_wave: "friendly",
    wink: "playful",
  };

  return moods[eventType] ?? "happy";
}

function inferSpecies(petId) {
  if (petId === "akkigae") return "dog";
  if (petId === "ttoosseunyang") return "cat";
  if (petId === "kangchongmu") return "rabbit";
  return "unknown";
}

function isMicroInteraction(eventType) {
  return ["one_hand_wave", "sad_eyes", "wink"].includes(eventType);
}

async function updateManifest({ outputDir, petId, eventType, outputName }) {
  const manifestPath = join(outputDir, "scene-manifest.json");
  let manifest = {};

  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    manifest = {};
  }

  manifest[petId] ??= {
    baseImageUrl: `/assets/pets/${petId}.png?v=2`,
    scenes: {},
  };
  manifest[petId].baseImageUrl = `/assets/pets/${petId}.png?v=2`;
  manifest[petId].scenes ??= {};
  manifest[petId].scenes[eventType] = `/assets/cutscenes/${outputName}`;

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function buildCutscenePrompt({ eventType, mode, mood, petId, species, traitNotes, hasMask }) {
  const petName = petId === "akkigae" ? "아끼개" : petId === "ttoosseunyang" ? "또쓰냥" : petId === "kangchongmu" ? "깡총무" : "the pet";
  const eventScene = describeEvent(eventType);
  const interaction = interactionSpec(eventType, species);
  const profile = petIdentityProfile({ petId, species, traitNotes });
  const lockedRegions = lockedRegionSpec(interaction.editRegion);
  const promptContract = generationContract({ mode, eventType, editRegion: interaction.editRegion, hasMask });

  if (mode === "variant") {
    return [
      "TASK",
      "Create an identity-preserving micro-interaction variant from the provided pet PNG.",
      "This is a local edit of an existing app character asset. It is not a character redesign, not a new illustration, and not a full redraw.",
      `Pet name: ${petName}.`,
      `Species branch: ${species}.`,
      `Requested state: ${eventType}.`,
      `Target mood: ${mood}.`,
      "",
      "NON-NEGOTIABLE CONTRACT",
      ...promptContract,
      "",
      "PRIORITY ORDER",
      ...priorityOrder(),
      "",
      "IDENTITY PROFILE",
      ...profile,
      "",
      "ALLOWED EDIT",
      ...interaction.allowed,
      "",
      "LOCKED REGIONS",
      ...lockedRegions,
      "",
      "FACE PATCH PRESERVATION",
      ...facePatchPreservationRules({ species, editRegion: interaction.editRegion }),
      "",
      "FACIAL SAFETY RULES",
      ...facialSafetyRules(species),
      "",
      "STYLE AND OUTPUT RULES",
      ...styleAndOutputRules(),
      "",
      "QUALITY CHECK BEFORE FINAL IMAGE",
      ...qualityChecklist(interaction.editRegion),
    ].join("\n");
  }

  return [
    "TASK",
    "Create a mobile game scene while preserving the provided pet PNG identity.",
    "Prefer changing surrounding effects and props. Do not repaint the character unless a tiny local edit is explicitly requested.",
    `Pet name: ${petName}.`,
    `Species branch: ${species}.`,
    `Event: ${eventType}.`,
    `Scene direction: ${eventScene}`,
    `Mood: ${mood}.`,
    "",
    "NON-NEGOTIABLE CONTRACT",
    ...promptContract,
    "",
    "PRIORITY ORDER",
    ...priorityOrder(),
    "",
    "IDENTITY PROFILE",
    ...profile,
    "",
    "SCENE RULES",
    "Keep the pet full-body, front-facing, centered, and recognizably identical to the reference.",
    "Express the event with external props, small non-circular effects, and layout around the pet.",
    "Do not rely on repainting the pet's face, nose, mouth, eyes, ears, tail, or body to communicate the event.",
    "",
    "FACIAL SAFETY RULES",
    ...facialSafetyRules(species),
    "",
    "FACE PATCH PRESERVATION",
    ...facePatchPreservationRules({ species, editRegion: interaction.editRegion }),
    "",
    "STYLE AND OUTPUT RULES",
    ...styleAndOutputRules(),
  ].join("\n");
}

function petIdentityProfile({ petId, species, traitNotes }) {
  const baseProfile =
    petId === "ttoosseunyang"
      ? [
          "Known preset: 또쓰냥, a white kitten character.",
          "Must preserve: large round brown eyes, exact eye spacing, white head, pink inner ears, tiny pink nose, tiny curved cat mouth, cheek blush, pink heart belly mark, curled tail, soft pastel line art.",
          "The cat mouth is a tiny simple curved mark below the nose. It must not become a human smile, open mouth, muzzle, heart nose, or complex line cluster.",
        ]
      : petId === "akkigae"
        ? [
            "Known preset: 아끼개, a white puppy character.",
            "Must preserve: round brown eyes, exact eye spacing, white rounded head, floppy pink ears, tiny dark nose, tiny simple smiling mouth, cheek blush, pink neck/chest detail, tiny round paws, soft pastel line art.",
            "The puppy mouth is small and simple. It must not become a large anime mouth, human mouth, muzzle, tongue-forward mouth, or complex line cluster.",
          ]
        : petId === "kangchongmu"
          ? [
              "Known preset: 깡총무, a white rabbit character.",
              "Must preserve: long upright pink inner ears, rounded white head, tiny pink rabbit nose, tiny simple rabbit mouth, cheek blush, pink chest detail, small rounded paws, cotton tail, soft pastel line art.",
              "The rabbit mouth is small and simple. It must not become a large anime mouth, human mouth, puppy muzzle, cat mouth, or complex line cluster.",
            ]
          : [
              `User-generated ${species} character from an input pet photo.`,
              "Must preserve all distinctive identity traits visible in the source: species, breed impression, coat color, patches, markings, ear shape, eye color, muzzle length, nose color, face proportions, body proportions, tail shape, and accessory-like natural markings.",
              "If a trait is visible in the reference, treat it as locked unless the requested edit explicitly names that exact trait.",
              "Do not average the pet into a generic cute dog/cat/rabbit. Keep asymmetry, unique markings, uncommon colors, scars, spots, stripes, socks, muzzle color, eye color, and ear shape from the reference.",
            ];

  return [
    ...baseProfile,
    ...speciesProfile(species),
    traitNotes ? `Additional user/photo traits to preserve: ${traitNotes}.` : "Additional user/photo traits: none provided; infer only from the source image.",
  ];
}

function generationContract({ mode, eventType, editRegion, hasMask }) {
  const lines = [
    "The input image is the canonical source. The output must look like the same exact character asset after a tiny local state change.",
    "Identity preservation is more important than the requested gesture, mood, cuteness, polish, or dramatic readability.",
    "If you cannot perform the requested edit while preserving identity, output a near-identical copy of the input with no character redesign.",
    "For any gesture outside the face, copy the original face patch as-is from the source image.",
    "Do not invent a new face, new mouth, new nose, new eyes, new head shape, new body shape, new lighting style, new background, or new pose.",
    "Do not add circular glow, radial glow, halo, spotlight, vignette, stage circle, round backdrop, dark corner shading, or any self-invented decorative background.",
  ];

  if (mode === "variant") {
    lines.push(
      "For this micro-interaction, at least 95% of the character design should remain visually identical to the source.",
      `The only allowed change region is: ${editRegion}.`,
      "All other regions must be treated as immutable.",
      "If the allowed region is not part of the face, the entire face patch must remain unchanged.",
    );
  }

  if (hasMask) {
    lines.push(
      "A mask is provided. Treat opaque/white mask areas as locked and transparent mask areas as editable.",
      "Never modify visible pixels outside the editable mask area.",
      "If the mask does not expose enough area for the requested change, keep the original character unchanged rather than expanding the edit.",
    );
  } else if (isMicroInteraction(eventType)) {
    lines.push(
      "No mask is provided for this micro-interaction. Make the smallest possible visual change and do not alter locked facial or body regions.",
      "If the edit would require moving multiple body parts, skip the motion and keep the character nearly identical.",
    );
  }

  return lines;
}

function priorityOrder() {
  return [
    "1. Preserve the exact character identity and species.",
    "2. Preserve the face patch, especially nose, mouth, eyes, cheeks, markings, and eye spacing.",
    "3. Preserve the silhouette, body proportions, palette, line style, and transparent background.",
    "4. Apply only the explicitly allowed local edit region.",
    "5. Express mood only if it does not violate priorities 1-4.",
  ];
}

function speciesProfile(species) {
  if (species === "cat") {
    return [
      "Cat-specific locks: triangular ear identity, whisker placement if present, small nose bridge, short cat muzzle, cheek roundness, tail curve, and cat-like eye spacing.",
      "Do not make the cat look like a puppy, bear, rabbit, fox, or generic mascot.",
    ];
  }

  if (species === "dog") {
    return [
      "Dog-specific locks: ear type and attachment point, nose/muzzle shape, cheek roundness, puppy eye spacing, paw shape, tail shape, and breed-like silhouette.",
      "Do not make the dog look like a cat, bear, rabbit, fox, or generic mascot.",
    ];
  }

  if (species === "rabbit") {
    return [
      "Rabbit-specific locks: long upright ear identity, pink inner-ear shape, tiny rabbit nose, short rabbit muzzle, cheek roundness, compact paw shape, cotton tail, and rabbit-like eye spacing.",
      "Do not make the rabbit look like a cat, dog, bear, fox, or generic mascot.",
    ];
  }

  return [
    "Species-specific locks: preserve the input animal's species and all visible anatomical identity cues.",
    "Do not convert the animal into another species or a generic mascot.",
  ];
}

function interactionSpec(eventType, species) {
  const catMouthLock =
    species === "cat"
      ? "Keep the cat mouth tiny and curved; do not open it."
      : species === "rabbit"
        ? "Keep the rabbit mouth tiny and simple; do not open it."
        : "Keep the mouth tiny and simple unless the requested edit explicitly requires a small smile.";

  const specs = {
    wink: {
      editRegion: "one_eye",
      allowed: [
        "Change exactly one eye into a cute wink by replacing that eye with a simple curved closed-eye mark in the same line color and softness.",
        "Do not move the eye position. Do not change the brow, cheek, nose, mouth, head, or body.",
        "Keep the other eye identical to the reference, including size, color, highlight, outline, position, and spacing.",
        "Keep nose, mouth, cheeks, ears, head, body, paws, tail, colors, and silhouette unchanged.",
        catMouthLock,
      ],
    },
    sad_eyes: {
      editRegion: "eyes_only",
      allowed: [
        "Make both eyes slightly sad by subtly lowering the upper eyelids or adding a gentle worried eyebrow angle above each eye.",
        "Do not resize, recolor, or move the eyes. Preserve original eye highlights and spacing.",
        "Keep nose, mouth, cheeks, ears, head, body, paws, tail, colors, and silhouette unchanged.",
        "No tears unless explicitly requested. No exaggerated crying face. No open mouth.",
      ],
    },
    one_hand_wave: {
      editRegion: "one_front_paw",
      allowed: [
        "Move exactly one front paw a small amount into a friendly greeting pose, no more than a subtle local lift.",
        "Keep the face completely unchanged by copying the original face patch. Keep both eyes, nose, mouth, cheeks, ears, head, body, and tail identical.",
        "Do not redraw the whole arm, shoulder, torso, head, or body. The pose change must be subtle and local.",
        "Do not make the mouth happier, larger, open, darker, or more expressive. The greeting must come only from the paw pose.",
        "The result should still look like the same base standing pose with one paw slightly greeting.",
      ],
    },
  };

  return (
    specs[eventType] ?? {
      editRegion: "external_effects_only",
      allowed: [
        "Do not change the pet's face or body.",
        "Add only tiny external non-circular mood marks near the pet if needed.",
        "Keep the source character visually identical.",
      ],
    }
  );
}

function lockedRegionSpec(editRegion) {
  const commonLocks = [
    "Never change species, face proportions, eye spacing, nose position, mouth position, head outline, body proportions, color palette, line style, or silhouette.",
    "Do not crop, zoom, rotate, relight, repaint, restyle, blur, sharpen, simplify, or upscale the character in a way that changes its design.",
    "Do not change the canvas composition except for the explicitly allowed local edit. Keep the character centered and fully visible.",
    "Do not add or remove limbs, ears, tail, markings, accessories, belly marks, cheek marks, whiskers, or fur patterns.",
  ];

  const regionLocks = {
    one_eye: ["Editable area: one eye only. Everything else is locked."],
    eyes_only: ["Editable area: eyes and tiny eyebrow/upper eyelid cues only. Nose, mouth, ears, head, body, paws, and tail are locked."],
    one_front_paw: ["Editable area: one front paw only. The entire face patch, ears, head, body, tail, and the other paw are locked."],
    external_effects_only: ["Editable area: transparent space around the pet only. The pet itself is locked."],
  };

  return [...(regionLocks[editRegion] ?? regionLocks.external_effects_only), ...commonLocks];
}

function facePatchPreservationRules({ species, editRegion }) {
  const rules = [
    "Define the face patch as the full area containing both eyes, eyebrows/eye marks, cheeks/blush, nose, mouth, muzzle/snout area, face markings, and the surrounding head surface between and around these features.",
    "The face patch must be visually copied from the source image, not regenerated from description.",
    "Preserve exact feature positions, relative distances, line thickness, colors, soft shading, highlights, and negative space.",
    "Do not smooth, beautify, sharpen, simplify, enlarge, recolor, or make the face more expressive than the source.",
    "Do not change the mouth to communicate emotion. Use only the explicitly allowed edit region.",
  ];

  if (!["one_eye", "eyes_only"].includes(editRegion)) {
    rules.push("Because this requested edit is outside the face, absolutely no part of the face patch may change.");
  }

  if (editRegion === "one_eye") {
    rules.push("Only one eye may change into a closed curved wink; the rest of the face patch, including nose, mouth, cheeks, other eye, markings, and head surface, must remain unchanged.");
  }

  if (editRegion === "eyes_only") {
    rules.push("Only eyelids or tiny eyebrow/upper eyelid cues may change; nose, mouth, cheeks, markings, head surface, and eye spacing must remain unchanged.");
  }

  if (species === "cat") {
    rules.push("For cat characters, the tiny cat nose and tiny cat mouth are identity anchors and must not be stylized into a heart, puppy muzzle, or larger smile.");
  }

  if (species === "dog") {
    rules.push("For dog characters, the puppy nose and tiny simple mouth are identity anchors and must not become a larger open mouth, human smile, or cat mouth.");
  }

  if (species === "rabbit") {
    rules.push("For rabbit characters, the tiny rabbit nose and tiny simple mouth are identity anchors and must not become a puppy muzzle, cat mouth, human smile, or larger mouth.");
  }

  return rules;
}

function facialSafetyRules(species) {
  const rules = [
    "The face is the primary product asset. If any requested gesture conflicts with face preservation, preserve the face and skip the gesture.",
    "Do not change the nose shape, nose size, nose color, or nose position.",
    "Do not change the mouth into an open mouth, tongue, teeth, human smile, snout, muzzle, heart shape, or complex expression.",
    "Do not add extra facial lines around the nose or mouth.",
    "Do not change eye color, eye highlight shape, eye spacing, or eye size unless the allowed edit is specifically a wink or sad-eye edit.",
    "Do not add extra highlights, extra pupils, eyelashes, eyebrows, blush marks, wrinkles, nostrils, teeth, tongue, or lip details unless explicitly allowed.",
    "Do not make the expression more dramatic by changing multiple facial features at once.",
    "Do not improve, reinterpret, or make the face cuter. Same face first; gesture second.",
  ];

  if (species === "cat") {
    rules.push("For cats, preserve the tiny cat mouth and small pink nose exactly; no puppy muzzle.");
  }

  if (species === "dog") {
    rules.push("For dogs, preserve the tiny puppy nose and simple mouth exactly; no cat mouth or human mouth.");
  }

  if (species === "rabbit") {
    rules.push("For rabbits, preserve the tiny rabbit nose and simple mouth exactly; no puppy muzzle, cat mouth, or human mouth.");
  }

  return rules;
}

function styleAndOutputRules() {
  return [
    "Preserve the original soft pastel mascot style, rounded edges, gentle shading, and app icon polish.",
    "Do not add background, glow, circular backdrop, radial glow, halo, spotlight, orb, vignette, stage circle, floor circle, decorative bubble shapes, dark corner shading, UI, text, watermark, logo, or scene props unless explicitly requested.",
    "Transparent background only. Empty transparent canvas outside the character and any explicitly requested tiny local effect.",
    "No realistic rendering, painterly restyle, anime redesign, 3D model conversion, sketch conversion, or texture change.",
    "No camera angle change, no close-up, no perspective change, no dramatic lighting, no cast shadow, no floor contact shadow.",
    "No generated checkerboard background. Transparency should be real alpha, not a drawn gray checkerboard.",
  ];
}

function qualityChecklist(editRegion) {
  return [
    "Before finalizing, compare against the source image.",
    `Only the allowed edit region may differ: ${editRegion}.`,
    "The character must still be instantly recognizable as the same pet.",
    "The nose and mouth must match the source closely in shape, size, color, and position.",
    "For non-face gestures, the entire face patch must be indistinguishable from the source image.",
    "The output must not contain any added background, glow, vignette, or circular design element.",
    "The output must not look like a more detailed, simplified, younger, older, different-breed, or different-species version of the pet.",
    "If the output would look like a new character, return a near-identical copy with only external tiny effects.",
  ];
}

function describeEvent(eventType) {
  const scenes = {
    budget_over: "Show only tiny warning marks in the transparent space around the pet while the pet itself stays locked.",
    daily_checkin: "Show only tiny morning sparkle marks around the locked pet.",
    feed_treat: "Show only one tiny snack icon and small hearts near the locked pet.",
    level_up: "Show only small confetti marks around the locked pet.",
    outfit_share: "Keep the locked pet centered with a simple app-friendly presentation and no new outfit unless supplied as an input asset.",
    record_complete: "Show only tiny coins and small sparkle marks around the locked pet.",
  };

  return scenes[eventType] ?? "The pet reacts warmly in a cute mobile game moment.";
}
