/**
 * Unit Test: Vector PDF Text & Shape extraction
 */
const assert = require('assert');

// Simulate Fabric canvas objects
const mockObjects = [
  {
    type: 'rect',
    left: 50,
    top: 50,
    width: 200,
    height: 100,
    fill: '#8b5cf6',
    visible: true
  },
  {
    type: 'i-text',
    text: 'Hello Canva Pro Studio!',
    left: 60,
    top: 80,
    fontSize: 24,
    fill: '#ffffff',
    visible: true
  }
];

function extractVectorElements(objects) {
  const textItems = [];
  const shapeItems = [];

  for (const obj of objects) {
    if (!obj.visible) continue;
    if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
      textItems.push({
        text: obj.text,
        x: obj.left,
        y: obj.top,
        fontSize: obj.fontSize || 16,
        color: obj.fill || '#000000'
      });
    } else if (obj.type === 'rect' || obj.type === 'circle') {
      shapeItems.push({
        type: obj.type,
        x: obj.left,
        y: obj.top,
        fill: obj.fill
      });
    }
  }
  return { textItems, shapeItems };
}

const extracted = extractVectorElements(mockObjects);
assert.strictEqual(extracted.textItems.length, 1);
assert.strictEqual(extracted.textItems[0].text, 'Hello Canva Pro Studio!');
assert.strictEqual(extracted.shapeItems.length, 1);

console.log('✅ Vector PDF extraction logic passed!');
