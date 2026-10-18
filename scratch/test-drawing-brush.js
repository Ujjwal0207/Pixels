/**
 * Unit Test: Drawing Tool Brush math & Calligraphy calculations
 */
const assert = require('assert');

// Simulate point with pressure
function computeCalligraphyPoints(points, angleDeg = 45, baseWidth = 8) {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad) * (baseWidth / 2);
  const dy = Math.sin(rad) * (baseWidth / 2);

  const ribbon = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const pressure = p.pressure !== undefined && p.pressure > 0 ? p.pressure : 0.5;
    const w = baseWidth * (0.4 + pressure * 1.2);
    const pdx = Math.cos(rad) * (w / 2);
    const pdy = Math.sin(rad) * (w / 2);

    ribbon.push({
      left: { x: p.x - pdx, y: p.y - pdy },
      right: { x: p.x + pdx, y: p.y + pdy }
    });
  }
  return ribbon;
}

const points = [
  { x: 10, y: 10, pressure: 0.2 },
  { x: 20, y: 30, pressure: 0.8 },
  { x: 40, y: 60, pressure: 0.5 },
];

const ribbon = computeCalligraphyPoints(points, 45, 10);
assert.strictEqual(ribbon.length, 3);
assert.ok(ribbon[1].right.x > ribbon[0].right.x);
console.log('✅ Calligraphy ribbon calculation passed!');
