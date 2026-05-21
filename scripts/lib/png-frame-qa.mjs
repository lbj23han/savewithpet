import { deflateSync, inflateSync } from "node:zlib";

export function inspectPngFrame(buffer, options = {}) {
  const png = decodePng(buffer);
  const notes = [];
  const warnings = [];
  const expectedWidth = options.expectedWidth ?? 1024;
  const expectedHeight = options.expectedHeight ?? 1024;
  const boundsRegion = options.boundsRegion;

  if (png.width !== expectedWidth || png.height !== expectedHeight) {
    notes.push(`dimensions ${png.width}x${png.height}, expected ${expectedWidth}x${expectedHeight}`);
  }

  const bounds = getAlphaBounds(png, boundsRegion);
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
  const alphaCenterX = bounds.alphaSumX / bounds.visiblePixels / png.width;
  const alphaCenterY = bounds.alphaSumY / bounds.visiblePixels / png.height;
  const coverageRatio = bounds.visiblePixels / bounds.regionPixels;
  const metrics = { alphaCenterX, alphaCenterY, bottom, centerX, coverageRatio, heightRatio, top, widthRatio };

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
    metrics,
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

export function inspectPngRegions(buffer, regions, options = {}) {
  return Object.fromEntries(
    Object.entries(regions).map(([name, boundsRegion]) => [
      name,
      inspectPngFrame(buffer, {
        ...options,
        boundsRegion,
      }),
    ]),
  );
}

export function compareRegionMetrics(candidateRegions, referenceRegions, tolerance = 0.02) {
  const structuralMetricTolerances = {
    coverageRatio: 0.06,
  };
  const structuralMetricKeys = [
    "alphaCenterX",
    "alphaCenterY",
    "bottom",
    "centerX",
    "coverageRatio",
    "heightRatio",
    "top",
    "widthRatio",
  ];
  const entries = Object.keys(referenceRegions).map((regionName) => {
    const candidate = candidateRegions[regionName]?.metrics;
    const reference = referenceRegions[regionName]?.metrics;

    if (!candidate || !reference) {
      return {
        comparison: {
          diffs: {},
          diffsText: "missing metrics",
          failures: [`${regionName} missing metrics`],
          passed: false,
          status: "DRIFT",
        },
        regionName,
      };
    }

    return {
      comparison: compareFrameMetrics(candidate, reference, tolerance, structuralMetricKeys, structuralMetricTolerances),
      regionName,
    };
  });

  const failures = entries.flatMap(({ comparison, regionName }) =>
    comparison.failures.map((failure) => `${regionName}.${failure}`),
  );

  return {
    details: Object.fromEntries(entries.map(({ comparison, regionName }) => [regionName, comparison])),
    failures,
    passed: failures.length === 0,
    status: failures.length === 0 ? "MATCH" : "DRIFT",
    summary: entries
      .map(({ comparison, regionName }) => `${regionName}: ${comparison.diffsText}`)
      .join(" | "),
  };
}

export function compareFrameMetrics(
  candidate,
  reference,
  tolerance = 0.02,
  metricKeys = ["bottom", "centerX", "heightRatio", "top", "widthRatio"],
  metricTolerances = {},
) {
  const diffs = Object.fromEntries(metricKeys.map((key) => [key, Math.abs(candidate[key] - reference[key])]));
  const failures = Object.entries(diffs)
    .filter(([key, value]) => value > (metricTolerances[key] ?? tolerance))
    .map(([key, value]) => {
      const metricTolerance = metricTolerances[key] ?? tolerance;
      return `${key} drift ${(value * 100).toFixed(1)}% > ${(metricTolerance * 100).toFixed(1)}%`;
    });

  return {
    diffs,
    diffsText: Object.entries(diffs)
      .map(([key, value]) => `${key}=${(value * 100).toFixed(1)}%`)
      .join(", "),
    passed: failures.length === 0,
    status: failures.length === 0 ? "MATCH" : "DRIFT",
    failures,
  };
}

export function scoreQa(qa) {
  return qa.score;
}

function getAlphaBounds(png, region) {
  let left = png.width;
  let right = -1;
  let top = png.height;
  let bottom = -1;
  let alphaSumX = 0;
  let alphaSumY = 0;
  let visiblePixels = 0;
  const minX = Math.round((region?.left ?? 0) * png.width);
  const maxX = Math.round((region?.right ?? 1) * png.width) - 1;
  const minY = Math.round((region?.top ?? 0) * png.height);
  const maxY = Math.round((region?.bottom ?? 1) * png.height) - 1;
  const regionPixels = (maxX - minX + 1) * (maxY - minY + 1);

  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const index = (y * png.width + x) * 4;
      if (png.data[index + 3] <= 12) continue;

      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
      alphaSumX += x;
      alphaSumY += y;
      visiblePixels += 1;
    }
  }

  if (right < left || bottom < top) return null;
  return { alphaSumX, alphaSumY, bottom, left, regionPixels, right, top, visiblePixels };
}

export function decodePng(buffer) {
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

export function encodePng({ data, height, width }) {
  const colorType = 6;
  const bitDepth = 8;
  const stride = width * 4;
  const raw = Buffer.alloc(height * (stride + 1));

  for (let y = 0; y < height; y += 1) {
    const rawRow = y * (stride + 1);
    raw[rawRow] = 0;
    data.copy(raw, rawRow + 1, y * stride, y * stride + stride);
  }

  const signature = Buffer.from("89504e470d0a1a0a", "hex");
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = bitDepth;
  ihdr[9] = colorType;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
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
