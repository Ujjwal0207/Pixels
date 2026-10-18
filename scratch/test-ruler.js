// Test calculation of rulers and guides positioning
const assert = require('assert');

// Mock DOM elements
const mockWrapper = {
  clientWidth: 1200,
  clientHeight: 800,
  getBoundingClientRect: () => ({ left: 240, top: 46, width: 1200, height: 800, right: 1440, bottom: 846 })
};

const mockUpperCanvas = {
  getBoundingClientRect: () => ({ left: 570, top: 176, width: 540, height: 540, right: 1110, bottom: 716 })
};

const canvasOriginX = mockUpperCanvas.getBoundingClientRect().left - mockWrapper.getBoundingClientRect().left;
const canvasOriginY = mockUpperCanvas.getBoundingClientRect().top - mockWrapper.getBoundingClientRect().top;

console.log('Canvas origin relative to wrapper:', { x: canvasOriginX, y: canvasOriginY });
assert.strictEqual(canvasOriginX, 330, 'Canvas origin X should be 330px from left of wrapper');
assert.strictEqual(canvasOriginY, 130, 'Canvas origin Y should be 130px from top of wrapper');

// Ruler tick 0 on horizontal ruler:
const zoom = 0.5;
const scaleRatio = 540 / 1080; // 0.5
const px0ScreenX = canvasOriginX + 0 * zoom * scaleRatio;
console.log('Ruler 0px screen coordinate:', px0ScreenX);
assert.strictEqual(px0ScreenX, 330, '0px on ruler corresponds exactly to left edge of artboard');

// Ruler tick 1080 on horizontal ruler (right edge of artboard):
const px1080ScreenX = canvasOriginX + 1080 * (540 / 1080);
console.log('Ruler 1080px screen coordinate:', px1080ScreenX);
assert.strictEqual(px1080ScreenX, 330 + 540, '1080px on ruler corresponds exactly to right edge of artboard (330 + 540 = 870)');

console.log('All ruler coordinate calculations verified successfully!');
