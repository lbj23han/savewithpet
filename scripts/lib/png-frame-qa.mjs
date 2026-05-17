import { inflateSync } from "node:zlib";

export function inspectPngFrame(buffer, options = {}) {
  const png = decodePng(buffer);
  const notes = [];
  const warnings = [];
  const expectedWidth = options.expectedWidth ?? 1024;
  const expectedHeight = options.expectedHeight ?? 1024;

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
      status: "FAIL",
      warnings,
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
  if (widthRatio < 0.4 || widthRatio > 0.78) notes.push(`width ${widthRatio.toFixed(3)} outside 0.400-0.780`);
  if (heightRatio < 0.66 || heightRatio > 0.93) notes.push(`height ${heightRatio.toFixed(3)} outside 0.660-0.930`);

  if (widthRatio < 0.42) warnings.push(`width ${widthRatio.toFixed(3)} below preferred 0.420`);
  if (widthRatio > 0.76) warnings.push(`width ${widthRatio.toFixed(3)} above preferred 0.760`);

  const passed = notes.length === 0;
  return {
    bounds,
    boundsText: `left=${bounds.left}, top=${bounds.top}, right=${bounds.right}, bottom=${bounds.bottom}, centerX=${centerX.toFixed(3)}, width=${widthRatio.toFixed(3)}, height=${heightRatio.toFixed(3)}`,
    notes: passed ? ["automated frame QA passed"] : notes,
    passed,
    score:
      100 -
      Math.abs(centerX - 0.5) * 400 -
      Math.abs(top - 0.12) * 120 -
      Math.abs(bottom - 0.88) * 120 -
      Math.abs(widthRatio - 0.58) * 80 -
      Math.abs(heightRatio - 0.78) * 80 -
      notes.length * 20 -
      warnings.length * 8,
    status: passed ? (warnings.length ? "PASS_WITH_WARNINGS" : "PASS") : "FAIL",
    warnings,
  };
}

export function scoreQa(qa) {
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
