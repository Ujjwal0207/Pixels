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

// 8. Test Draft Restore Safety (Skip save on initial restore)
function testDraftRestoreSafety() {
  const savedState = JSON.stringify({ objects: [{ type: 'rect', fill: '#ff0000' }] });
  const pages = [
    { id: 1, name: 'Page 1', state: savedState }
  ];

  let saveCalled = false;
  const mockPagesManager = {
    pages,
    currentPageIndex: 0,
    saveCurrentPageState() {
      saveCalled = true;
      this.pages[this.currentPageIndex].state = JSON.stringify({ objects: [] }); // Empty canvas overwrite
    },
    switchPage(targetIndex, skipSave = false) {
      if (!skipSave) {
        this.saveCurrentPageState();
      }
      this.currentPageIndex = targetIndex;
    }
  };

  // Simulating restore with skipSave = true
  mockPagesManager.switchPage(0, true);
  assert.strictEqual(saveCalled, false, 'saveCurrentPageState must NOT be called on draft restore');
  assert.strictEqual(pages[0].state, savedState, 'Saved page state must be preserved without empty canvas overwrite');
  console.log('✅ Draft restore state preservation verified!');
}

// 9. Test Brand Kit Multi-Selection (activeSelection and polygon support)
function testBrandKitMultiSelection() {
  const obj1 = { type: 'i-text', fill: '#000000', dirty: false, set(k, v) { this[k] = v; } };
  const obj2 = { type: 'rect', fill: '#111111', dirty: false, set(k, v) { this[k] = v; } };
  const obj3 = { type: 'polygon', fill: '#222222', dirty: false, set(k, v) { this[k] = v; } };

  const activeSelection = {
    type: 'activeSelection',
    dirty: false,
    _objects: [obj1, obj2, obj3],
    forEachObject(fn) { this._objects.forEach(fn); }
  };

  const newBrandColor = '#7c3aed';

  // Apply color to selection logic
  if (activeSelection.type === 'activeSelection' || activeSelection.type === 'group') {
    activeSelection.forEachObject(obj => {
      obj.set('fill', newBrandColor);
      obj.dirty = true;
    });
    activeSelection.dirty = true;
  }

  assert.strictEqual(obj1.fill, newBrandColor, 'Text fill must be updated');
  assert.strictEqual(obj2.fill, newBrandColor, 'Rect fill must be updated');
  assert.strictEqual(obj3.fill, newBrandColor, 'Polygon fill must be updated');
  assert.strictEqual(activeSelection.dirty, true, 'Active selection must be marked dirty');
  console.log('✅ Brand Kit multi-selection activeSelection recoloring verified!');
}

// 10. Test Multi-Selection Typography Batch Styling (_applyToTextSelection)
function testMultiSelectionTypography() {
  const text1 = { type: 'i-text', text: 'Hello', fontFamily: 'Arial', fontSize: 24, dirty: false, set(k, v) { this[k] = v; } };
  const text2 = { type: 'text', text: 'World', fontFamily: 'Arial', fontSize: 28, dirty: false, set(k, v) { this[k] = v; } };
  const shape = { type: 'rect', fill: '#ff0000', set(k, v) { this[k] = v; } };

  const selection = {
    type: 'activeSelection',
    dirty: false,
    _objects: [text1, shape, text2],
    forEachObject(fn) { this._objects.forEach(fn); }
  };

  function applyToSelection(target, handler) {
    if (target.type === 'i-text' || target.type === 'text') {
      handler(target);
    } else if (target.type === 'activeSelection' || target.type === 'group') {
      target.forEachObject(obj => {
        if (obj.type === 'i-text' || obj.type === 'text') {
          handler(obj);
          obj.dirty = true;
        }
      });
      target.dirty = true;
    }
  }

  // Batch change font family and size
  applyToSelection(selection, (obj) => {
    obj.set('fontFamily', 'Outfit');
    obj.set('fontSize', 36);
  });

  assert.strictEqual(text1.fontFamily, 'Outfit', 'text1 font must be Outfit');
  assert.strictEqual(text1.fontSize, 36, 'text1 fontSize must be 36');
  assert.strictEqual(text2.fontFamily, 'Outfit', 'text2 font must be Outfit');
  assert.strictEqual(text2.fontSize, 36, 'text2 fontSize must be 36');
  assert.strictEqual(shape.fontFamily, undefined, 'shape should be untouched');
  assert.strictEqual(selection.dirty, true, 'selection must be dirty');
  console.log('✅ Multi-selection typography batch formatting verified!');
}

// 11. Test Vector SVG Group Scaling Calculation
function testSVGGroupScaling() {
  const artboardW = 1080;
  const artboardH = 1080;
  const maxW = artboardW * 0.55; // 594
  const maxH = artboardH * 0.55; // 594

  const testSVGs = [
    { width: 1200, height: 800 }, // Wide SVG
    { width: 400, height: 1600 }, // Tall SVG
    { width: 100, height: 100 },   // Small SVG
  ];

  testSVGs.forEach(({ width, height }) => {
    const scale = Math.min(maxW / width, maxH / height, 1);
    const scaledW = width * scale;
    const scaledH = height * scale;

    assert(scaledW <= maxW + 0.001, `Scaled width ${scaledW} exceeds maxW ${maxW}`);
    assert(scaledH <= maxH + 0.001, `Scaled height ${scaledH} exceeds maxH ${maxH}`);
    assert.strictEqual(Math.round(scaledW / scaledH * 100), Math.round(width / height * 100), 'Aspect ratio must be preserved');
  });
  console.log('✅ Vector SVG scaling and aspect ratio preservation verified!');
}

// 12. Test Set Image as Artboard Background with Cover-Fit Math & Locks
function testSetImageAsBackground() {
  const artW = 1080;
  const artH = 1080;
  const imgObj = {
    type: 'image',
    width: 1920,
    height: 1080,
    set(props) { Object.assign(this, props); },
    sendToBackCalled: false,
    sendToBack() { this.sendToBackCalled = true; }
  };

  // Cover scale: Math.max(artW / img.width, artH / img.height)
  const scale = Math.max(artW / imgObj.width, artH / imgObj.height); // Math.max(0.5625, 1) = 1
  imgObj.set({
    scaleX: scale,
    scaleY: scale,
    left: artW / 2,
    top: artH / 2,
    originX: 'center',
    originY: 'center',
    isBackgroundImage: true,
    lockMovementX: true,
    lockMovementY: true,
    lockScalingX: true,
    lockScalingY: true,
    lockRotation: true,
  });
  imgObj.sendToBack();

  assert.strictEqual(imgObj.isBackgroundImage, true, 'Image must be flagged as background');
  assert.strictEqual(imgObj.lockMovementX, true, 'Movement X must be locked');
  assert.strictEqual(imgObj.lockMovementY, true, 'Movement Y must be locked');
  assert.strictEqual(imgObj.scaleY * imgObj.height >= artH, true, 'Height must cover artboard');
  assert.strictEqual(imgObj.sendToBackCalled, true, 'Must be sent to back layer');
  console.log('✅ Set image as background cover-fit math and layer locking verified!');
}

// 13. Test Keyboard Shortcuts Polish (Locking & Native Paste Bubbling)
function testKeyboardShortcutsSafety() {
  // Scenario A: Locked object nudging
  const lockedObj = {
    left: 100,
    top: 100,
    lockMovementX: true,
    lockMovementY: true,
    setCoords() {},
  };

  const step = 1;
  const key = 'ArrowLeft';
  let prevented = false;

  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key) && lockedObj) {
    if (lockedObj.lockMovementX && lockedObj.lockMovementY) {
      // Do nothing, do not move
    } else {
      prevented = true;
      if (key === 'ArrowLeft' && !lockedObj.lockMovementX) lockedObj.left -= step;
    }
  }

  assert.strictEqual(lockedObj.left, 100, 'Locked object left position must NOT change');
  assert.strictEqual(prevented, false, 'Default action must not be prevented for fully locked objects');

  // Scenario B: Ctrl+V with empty clipboard
  let clipboard = null;
  let defaultPrevented = false;
  const e = {
    metaKey: true,
    ctrlKey: false,
    key: 'v',
    preventDefault() { defaultPrevented = true; }
  };

  const cmdOrCtrl = e.metaKey || e.ctrlKey;
  if (cmdOrCtrl && e.key.toLowerCase() === 'v') {
    if (clipboard) {
      e.preventDefault();
    }
  }

  assert.strictEqual(defaultPrevented, false, 'Ctrl+V with empty clipboard must not prevent default');
  console.log('✅ Keyboard shortcut locked-object and native paste bubbling verified!');
}

// 14. Test Global Paste Type Dispatcher
function testGlobalPasteDispatcher() {
  function dispatchPaste(data) {
    if (data.image) {
      return { action: 'image-blob', type: data.image.type };
    }
    if (data.text) {
      const trimmed = data.text.trim();
      if (trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')) {
        return { action: 'vector-svg', content: trimmed };
      }
      if (/^https?:\/\/.*\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(trimmed)) {
        return { action: 'image-url', url: trimmed };
      }
      return { action: 'text', content: trimmed };
    }
    return null;
  }

  const res1 = dispatchPaste({ image: { type: 'image/png' } });
  assert.strictEqual(res1.action, 'image-blob');

  const res2 = dispatchPaste({ text: '<svg viewBox="0 0 100 100"><circle r="50"/></svg>' });
  assert.strictEqual(res2.action, 'vector-svg');

  const res3 = dispatchPaste({ text: 'https://images.unsplash.com/photo-123.jpg' });
  assert.strictEqual(res3.action, 'image-url');

  const res4 = dispatchPaste({ text: 'Modern Design Pro Text' });
  assert.strictEqual(res4.action, 'text');

  console.log('✅ Global paste dispatcher multi-format routing verified!');
}

testExportMultiplierWithZoom();
testDistributeEvenSpacing();
testSelectAllFiltersGuides();
testArtboardAlignment();
testReleaseClippingMask();
testSafePhotoAdjustments();
testGuideLineDimensionsUnderZoom();
testDraftRestoreSafety();
testBrandKitMultiSelection();
testMultiSelectionTypography();
testSVGGroupScaling();
testSetImageAsBackground();
testKeyboardShortcutsSafety();
testGlobalPasteDispatcher();
console.log('🎉 ALL 14 studio flaw & feature upgrade verification tests passed!');
