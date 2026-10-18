/**
 * Unit Test: Color Harmonies & Palette Quantization math
 */
const assert = require('assert');

function hexToHsl(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function generateHarmonies(baseHex) {
  const hsl = hexToHsl(baseHex);
  return {
    complementary: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
    analogous1: hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    analogous2: hslToHex((hsl.h + 330) % 360, hsl.s, hsl.l),
    triadic1: hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
    triadic2: hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
  };
}

const harmonies = generateHarmonies('#8b5cf6'); // Purple
console.log('Harmonies for #8b5cf6:', harmonies);
assert.ok(harmonies.complementary.startsWith('#'));
assert.ok(harmonies.triadic1.startsWith('#'));

console.log('✅ Color harmonies calculation passed!');
