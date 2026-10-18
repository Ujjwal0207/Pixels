/**
 * Unit Test: Edge-Connected Flood Fill Background Knockout
 */
const assert = require('assert');

// Create 10x10 test image
// Outer border is white (255,255,255), inside has an object with white center (e.g. eyes/shirt)
const width = 10;
const height = 10;
const data = new Uint8ClampedArray(width * height * 4);

// Fill everything with white (255,255,255,255)
for (let i = 0; i < data.length; i += 4) {
  data[i] = 255;
  data[i+1] = 255;
  data[i+2] = 255;
  data[i+3] = 255;
}

// Draw a black ring subject from (2,2) to (7,7)
for (let y = 2; y <= 7; y++) {
  for (let x = 2; x <= 7; x++) {
    const idx = (y * width + x) * 4;
    // Border of subject is blue (0, 0, 255)
    if (x === 2 || x === 7 || y === 2 || y === 7) {
      data[idx] = 0;
      data[idx+1] = 0;
      data[idx+2] = 255;
    } else {
      // Inside the subject is WHITE (255,255,255)
      data[idx] = 255;
      data[idx+1] = 255;
      data[idx+2] = 255;
    }
  }
}

// 1. NAIVE GLOBAL THRESHOLD (Old Flaw 15)
const naiveData = new Uint8ClampedArray(data);
for (let i = 0; i < naiveData.length; i += 4) {
  if (naiveData[i] > 240 && naiveData[i+1] > 240 && naiveData[i+2] > 240) {
    naiveData[i+3] = 0; // deleted!
  }
}
// Check inside pixel (4, 4): was white
const insideIdx = (4 * width + 4) * 4;
assert.strictEqual(naiveData[insideIdx + 3], 0, 'Old naive method erroneously hollowed out the subject interior!');

// 2. EDGE-CONNECTED FLOOD FILL (New Fix)
const floodData = new Uint8ClampedArray(data);
const visited = new Uint8Array(width * height);
const queue = [];

// Seed border pixels
for (let x = 0; x < width; x++) {
  queue.push(0 * width + x);
  queue.push((height - 1) * width + x);
}
for (let y = 1; y < height - 1; y++) {
  queue.push(y * width + 0);
  queue.push(y * width + (width - 1));
}

const targetR = 255, targetG = 255, targetB = 255;
const tolerance = 24;
const tolSq = tolerance * tolerance * 3;

while (queue.length > 0) {
  const p = queue.shift();
  if (visited[p]) continue;
  visited[p] = 1;

  const px = p % width;
  const py = Math.floor(p / width);
  const idx = p * 4;

  const dr = floodData[idx] - targetR;
  const dg = floodData[idx+1] - targetG;
  const db = floodData[idx+2] - targetB;
  const distSq = dr*dr + dg*dg + db*db;

  if (distSq <= tolSq) {
    floodData[idx+3] = 0; // Knock out background

    // Enqueue 4 neighbors
    if (px > 0 && !visited[p - 1]) queue.push(p - 1);
    if (px < width - 1 && !visited[p + 1]) queue.push(p + 1);
    if (py > 0 && !visited[p - width]) queue.push(p - width);
    if (py < height - 1 && !visited[p + width]) queue.push(p + width);
  }
}

// Verify outside was removed
const outsideIdx = (0 * width + 0) * 4;
assert.strictEqual(floodData[outsideIdx + 3], 0, 'Border background must be transparent');

// Verify inside was PRESERVED!
assert.strictEqual(floodData[insideIdx + 3], 255, 'Interior subject white pixel must be PRESERVED and solid!');
console.log('✅ Edge-connected background removal test passed! Subject interior preserved!');
