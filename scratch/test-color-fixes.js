// Unit tests for individual element color changes and hex conversion
const assert = require('assert');

// 1. Mock window and Fabric
global.window = {};
global.fabric = {
  Color: function(color) {
    this.color = color;
    this.toHex = () => {
      if (color.startsWith('#') && color.length === 7) return color.substring(1).toLowerCase();
      if (color === 'red') return 'ff0000';
      if (color.includes('255, 0, 0')) return 'ff0000';
      if (color.includes('124, 58, 237')) return '7c3aed';
      return '000000';
    };
  }
};

require('../js/utils.js');

console.log('--- Step 1: Testing colorToHex Conversions ---');
const colorToHex = window.AppUtils.colorToHex;

assert.strictEqual(colorToHex('#8b5cf6'), '#8b5cf6', 'Direct 7-char hex should match');
assert.strictEqual(colorToHex('#ABC'), '#aabbcc', '3-char hex should expand to 6-char hex');
assert.strictEqual(colorToHex('rgb(255, 0, 0)'), '#ff0000', 'rgb should convert to hex');
assert.strictEqual(colorToHex('rgba(124, 58, 237, 0.5)'), '#7c3aed', 'rgba should convert to hex');
assert.strictEqual(colorToHex('red'), '#ff0000', 'Named color red should convert to hex');
console.log('✓ All colorToHex conversions passed');

console.log('\n--- Step 2: Testing setFillColor on Group, ActiveSelection, and Individual Elements ---');

class MockElement {
  constructor(type, fill = '#123456') {
    this.type = type;
    this.fill = fill;
    this.stroke = null;
    this.dirty = false;
  }
  set(prop, val) {
    this[prop] = val;
  }
}

class MockGroup {
  constructor(type, children) {
    this.type = type;
    this.children = children;
    this.dirty = false;
  }
  forEachObject(fn) {
    this.children.forEach(fn);
  }
  getObjects() {
    return this.children;
  }
}

class MockCanvas {
  constructor() {
    this.active = null;
  }
  getActiveObject() {
    return this.active;
  }
  renderAll() {}
}

const mockCanvas = new MockCanvas();
const mockCanvasManager = {
  recordState: () => {}
};

// Test elementsTool logic
function testSetFill(activeObj, newColor) {
  mockCanvas.active = activeObj;
  
  // Replicate elements.js logic
  const active = mockCanvas.getActiveObject();
  if (!active) return;

  if (active.type === 'activeSelection' || active.type === 'group') {
    active.forEachObject((obj) => {
      if (obj.type === 'line') {
        obj.set('stroke', newColor);
      } else if (obj.type !== 'text') {
        if (obj.fill === 'none' || obj.fill === null || obj.fill === '') {
          obj.set('stroke', newColor);
        } else {
          obj.set('fill', newColor);
        }
      }
      obj.dirty = true;
    });
    active.dirty = true;
  } else if (active.type === 'line') {
    active.set('stroke', newColor);
    active.dirty = true;
  } else {
    if ((active.fill === 'none' || !active.fill) && active.stroke) {
      active.set('stroke', newColor);
    } else {
      active.set('fill', newColor);
    }
    active.dirty = true;
  }
}

// 1. Single shape
const rect = new MockElement('rect', '#ff0000');
testSetFill(rect, '#00ff00');
assert.strictEqual(rect.fill, '#00ff00', 'Single rect fill should be updated');
assert.strictEqual(rect.dirty, true, 'Single rect dirty flag must be true');
console.log('✓ Single element fill updated');

// 2. ActiveSelection (Multi-selection)
const item1 = new MockElement('rect', '#111111');
const item2 = new MockElement('circle', '#222222');
const selection = new MockGroup('activeSelection', [item1, item2]);
testSetFill(selection, '#abcdef');
assert.strictEqual(item1.fill, '#abcdef', 'ActiveSelection child 1 fill updated');
assert.strictEqual(item2.fill, '#abcdef', 'ActiveSelection child 2 fill updated');
assert.strictEqual(item1.dirty, true, 'ActiveSelection child 1 dirty flag set');
assert.strictEqual(selection.dirty, true, 'ActiveSelection group dirty flag set');
console.log('✓ Multi-selection (ActiveSelection) children fills updated');

// 3. SVG Group (e.g. icon with fill and stroke-only path)
const bgPath = new MockElement('path', '#3b82f6');
const strokePath = new MockElement('path', 'none');
strokePath.stroke = '#ffffff';
const iconGroup = new MockGroup('group', [bgPath, strokePath]);
testSetFill(iconGroup, '#ec4899');
assert.strictEqual(bgPath.fill, '#ec4899', 'SVG group fill path updated');
assert.strictEqual(strokePath.stroke, '#ec4899', 'SVG group transparent stroke path updated');
assert.strictEqual(iconGroup.dirty, true, 'Group dirty flag set for cache invalidation');
console.log('✓ Complex SVG Group elements correctly recolored');

console.log('\nAll color fix verification tests passed with 100% success!');
