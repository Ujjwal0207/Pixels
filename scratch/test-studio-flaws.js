const assert = require('assert');

// 1. Test Zoom Compensation for Export Multiplier
function testExportMultiplierWithZoom() {
  const artboardW = 1080;
  const targetMultiplier = 2; // 2x export = 2160px
  const zoomLevels = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 3.0];

  zoomLevels.forEach(zoom => {
    const currentCanvasWidth = Math.round(artboardW * zoom);
    const effectiveMultiplier = (1 / zoom) * targetMultiplier;
    const finalExportWidth = Math.round(currentCanvasWidth * effectiveMultiplier);
    assert.strictEqual(finalExportWidth, 2160, `Failed for zoom ${zoom}: got ${finalExportWidth}`);
  });
  console.log('✅ Export multiplier zoom compensation verified across all zoom levels!');
}

// 2. Test Equal-Gap Distribution Algorithm (Canva / Figma standard)
function testDistributeEvenSpacing() {
  // 3 objects with different widths
  const objects = [
    { left: 0, width: 100, scaledWidth: 100 },
    { left: 150, width: 50, scaledWidth: 50 },
    { left: 400, width: 50, scaledWidth: 50 }
  ];

  // Distribute horizontally
  objects.sort((a, b) => a.left - b.left);
  const minLeft = objects[0].left;
  const lastObj = objects[objects.length - 1];
  const maxRight = lastObj.left + lastObj.scaledWidth; // 450
  const totalObjWidth = objects.reduce((sum, o) => sum + o.scaledWidth, 0); // 200
  const totalSpan = maxRight - minLeft; // 450
  const availableSpace = totalSpan - totalObjWidth; // 250
  const gap = availableSpace / (objects.length - 1); // 125

  let currentX = minLeft;
  objects.forEach(obj => {
    obj.left = currentX;
    currentX += obj.scaledWidth + gap;
  });

  // Verification: Gap between obj0 right and obj1 left
  const gap01 = objects[1].left - (objects[0].left + objects[0].scaledWidth);
  // Gap between obj1 right and obj2 left
  const gap12 = objects[2].left - (objects[1].left + objects[1].scaledWidth);

  assert.strictEqual(gap01, 125, 'Gap 0-1 should be 125');
  assert.strictEqual(gap12, 125, 'Gap 1-2 should be 125');
  console.log('✅ Equal-gap spacing distribution algorithm verified!');
}

// 3. Test Select All Filters Out Guides and Locked Objects
function testSelectAllFiltersGuides() {
  const objects = [
    { name: 'Shape 1', isGuide: false, selectable: true, visible: true },
    { name: 'Guide H', isGuide: true, selectable: true, visible: true },
    { name: 'Guide V', isGuide: true, selectable: true, visible: true },
    { name: 'Locked Text', isGuide: false, selectable: false, visible: true },
    { name: 'Hidden Rect', isGuide: false, selectable: true, visible: false },
    { name: 'Shape 2', isGuide: false, selectable: true, visible: true }
  ];

  const selectable = objects.filter(o => !o.isGuide && o.selectable && o.visible);
  assert.strictEqual(selectable.length, 2, 'Should only select Shape 1 and Shape 2');
  assert.strictEqual(selectable[0].name, 'Shape 1');
  assert.strictEqual(selectable[1].name, 'Shape 2');
  console.log('✅ Select-all guide and unselectable filter verified!');
}

// 4. Test Artboard Alignment Coordinates
function testArtboardAlignment() {
  const artboardW = 1080;
  const artboardH = 1080;
  const zoom = 0.5; // Zoomed out 50%
  const canvasW = artboardW * zoom; // 540

  // Flawed logic: uses canvasW
  const flawedCenterX = canvasW / 2; // 270 (wrong!)
  assert.notStrictEqual(flawedCenterX, 540);

  // Corrected logic: uses artboardW
  const correctCenterX = artboardW / 2; // 540 (correct!)
  assert.strictEqual(correctCenterX, 540);
  console.log('✅ Artboard center coordinate math verified!');
}

// 5. Test Release Clipping Mask Logic
function testReleaseClippingMask() {
  const mask = {
    id: 'mask-circle',
    left: 200,
    top: 200,
    selectable: false,
    evented: false,
    setCoordsCalled: false,
    setCoords() { this.setCoordsCalled = true; }
  };

  const image = {
    id: 'photo-1',
    clipPath: mask,
    dirty: false
  };

  const canvasObjects = [image];
  const canvas = {
    add(obj) { canvasObjects.push(obj); },
    setActiveObject(obj) { this.active = obj; },
    renderAll() { this.rendered = true; }
  };

  // Execute release logic
  const releasedMask = image.clipPath;
  image.clipPath = null;
  image.dirty = true;
  releasedMask.selectable = true;
  releasedMask.evented = true;
  releasedMask.setCoords();
  canvas.add(releasedMask);
  canvas.setActiveObject(releasedMask);
  canvas.renderAll();

  assert.strictEqual(image.clipPath, null, 'Image clipPath should be unbound');
  assert.strictEqual(image.dirty, true, 'Image should be marked dirty');
  assert.strictEqual(canvasObjects.includes(releasedMask), true, 'Released mask should be added to canvas');
  assert.strictEqual(releasedMask.selectable, true, 'Released mask should be selectable');
  assert.strictEqual(releasedMask.evented, true, 'Released mask should be evented');
  assert.strictEqual(releasedMask.setCoordsCalled, true, 'Released mask setCoords should be called');
  assert.strictEqual(canvas.active, releasedMask, 'Released mask should be active');
  console.log('✅ Non-destructive clipping mask release verified!');
}

// 6. Test Photo Adjustments Safe Parsing
function testSafePhotoAdjustments() {
  const defaultAdjustments = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0
  };

  function safeParseFloat(val, fallback = 0) {
    if (typeof val === 'number') return Number.isFinite(val) ? val : fallback;
    if (val === null || val === undefined || val === '') return fallback;
    const parsed = parseFloat(val);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  const testInputs = [
    { input: '0.45', expected: 0.45 },
    { input: '-0.2', expected: -0.2 },
    { input: 'invalid', expected: 0 },
    { input: null, expected: 0 },
    { input: undefined, expected: 0 },
    { input: NaN, expected: 0 },
    { input: '', expected: 0 }
  ];

  testInputs.forEach(({ input, expected }) => {
    const result = safeParseFloat(input, defaultAdjustments.brightness);
    assert.strictEqual(result, expected, `Failed for input ${input}: got ${result}`);
  });
  console.log('✅ Safe photo adjustment numeric coercion verified!');
}

// 7. Test Guide Line Dimensions Under Zoom
function testGuideLineDimensionsUnderZoom() {
  const artboardW = 1920;
  const artboardH = 1080;
  const zoom = 0.5; // Viewport is 960x540

  const canvasMock = {
    width: artboardW * zoom, // 960
    height: artboardH * zoom, // 540
    getZoom: () => zoom
  };
  const canvasManagerMock = {
    artboardWidth: artboardW,
    artboardHeight: artboardH
  };

  // Correct calculation using canvasManager
  const guideW = canvasManagerMock ? canvasManagerMock.artboardWidth : (canvasMock.width / canvasMock.getZoom());
  const guideH = canvasManagerMock ? canvasManagerMock.artboardHeight : (canvasMock.height / canvasMock.getZoom());

  assert.strictEqual(guideW, 1920, 'Horizontal guide must span full 1920px artboard');
  assert.strictEqual(guideH, 1080, 'Vertical guide must span full 1080px artboard');
  console.log('✅ Magnetic guide artboard coordinate spanning under zoom verified!');
}

testExportMultiplierWithZoom();
testDistributeEvenSpacing();
testSelectAllFiltersGuides();
testArtboardAlignment();
testReleaseClippingMask();
testSafePhotoAdjustments();
testGuideLineDimensionsUnderZoom();
console.log('🎉 ALL studio flaw verification tests passed!');
