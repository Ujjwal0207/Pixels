/**
 * Unit Test: 3D Mockup Perspective & Lighting math
 */
const assert = require('assert');

function projectPoint3D(x, y, z, rotX, rotY, distance = 400) {
  // Rotate around Y
  const radY = (rotY * Math.PI) / 180;
  const cosY = Math.cos(radY);
  const sinY = Math.sin(radY);
  const x1 = x * cosY + z * sinY;
  const z1 = -x * sinY + z * cosY;

  // Rotate around X
  const radX = (rotX * Math.PI) / 180;
  const cosX = Math.cos(radX);
  const sinX = Math.sin(radX);
  const y2 = y * cosX - z1 * sinX;
  const z2 = y * sinX + z1 * cosX;

  // Perspective projection
  const fov = distance / (distance + z2);
  return {
    screenX: x1 * fov,
    screenY: y2 * fov,
    scale: fov,
    depth: z2
  };
}

const p = projectPoint3D(100, 100, 0, 15, 25, 500);
assert.ok(p.screenX !== 0);
assert.ok(p.screenY !== 0);
assert.ok(p.scale > 0);

console.log('✅ 3D Mockup projection math passed!');
