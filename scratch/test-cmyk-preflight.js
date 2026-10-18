/**
 * Unit Test: CMYK Pre-Flight & Total Area Coverage (TAC) calculations
 */
const assert = require('assert');

function rgbToCmyk(r, g, b) {
  const normR = r / 255;
  const normG = g / 255;
  const normB = b / 255;

  const k = 1 - Math.max(normR, normG, normB);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100, tac: 100 };
  }

  const c = Math.round(((1 - normR - k) / (1 - k)) * 100);
  const m = Math.round(((1 - normG - k) / (1 - k)) * 100);
  const y = Math.round(((1 - normB - k) / (1 - k)) * 100);
  const kVal = Math.round(k * 100);
  const tac = c + m + y + kVal;

  return { c, m, y, k: kVal, tac };
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.substring(0, 2), 16) || 0,
    g: parseInt(clean.substring(2, 4), 16) || 0,
    b: parseInt(clean.substring(4, 6), 16) || 0
  };
}

// 1. Pure Black #000000
const pureBlack = rgbToCmyk(0, 0, 0);
assert.strictEqual(pureBlack.k, 100);
assert.strictEqual(pureBlack.tac, 100);

// 2. Rich Black e.g. #0a0505
const richBlackRgb = hexToRgb('#0a0505');
const richBlack = rgbToCmyk(richBlackRgb.r, richBlackRgb.g, richBlackRgb.b);
console.log('Rich Black CMYK:', richBlack);
assert.ok(richBlack.tac >= 100);

// 3. Bleed calculation: 3mm at 72 DPI ≈ 8.5px, at 300 DPI ≈ 35.4px
function calculateBleed(width, height, bleedMm = 3, dpi = 72) {
  const bleedPx = Math.round((bleedMm / 25.4) * dpi);
  return {
    bleedPx,
    bleedWidth: width + bleedPx * 2,
    bleedHeight: height + bleedPx * 2
  };
}

const bleed = calculateBleed(1080, 1080, 3, 72);
assert.strictEqual(bleed.bleedPx, 9);
assert.strictEqual(bleed.bleedWidth, 1098);
assert.strictEqual(bleed.bleedHeight, 1098);

console.log('✅ CMYK Pre-flight and Bleed calculations passed!');
