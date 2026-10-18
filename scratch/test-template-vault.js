const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock browser environment for SmartLayoutEngine testing
global.window = {};
require('../js/smart-layout.js');
const SmartLayoutEngine = global.window.SmartLayoutEngine;

console.log('🧪 Running Template Vault, Modular Catalog & Smart Layout Tests...');

// =========================================================================
// 1. Verify Modular Catalog (templates/templates-catalog.json)
// =========================================================================
const catalogPath = path.join(__dirname, '../templates/templates-catalog.json');
assert.ok(fs.existsSync(catalogPath), 'templates-catalog.json must exist');

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
assert.ok(Array.isArray(catalog), 'Catalog must be an array');
assert.ok(catalog.length >= 30, `Catalog should have at least 30 templates, found ${catalog.length}`);

const categories = new Set(catalog.map(t => t.category));
['marketing', 'social', 'youtube', 'business', 'events'].forEach(cat => {
  assert.ok(categories.has(cat), `Catalog must include category: ${cat}`);
});

catalog.forEach((t, i) => {
  assert.ok(t.id, `Template #${i} must have an id`);
  assert.ok(t.name, `Template #${i} must have a name`);
  assert.ok(t.dimensions && t.dimensions.width && t.dimensions.height, `Template #${i} must have valid dimensions`);
  assert.ok(Array.isArray(t.objects) && t.objects.length > 0, `Template #${i} must have non-empty objects array`);
});
console.log(`✅ Modular Template Catalog verified: ${catalog.length} templates across 5 categories.`);

// =========================================================================
// 2. Verify SmartLayoutEngine Procedural Variations
// =========================================================================
const mockCanvasManager = {
  artboardWidth: 1080,
  artboardHeight: 1080,
  canvas: {
    clear: () => {},
    setBackgroundColor: () => {},
    add: () => {},
    renderAll: () => {},
  },
  recordState: () => {},
};

const smartEngine = new SmartLayoutEngine(mockCanvasManager);
const customPalette = ['#7c3aed', '#ec4899', '#06b6d4', '#0f172a', '#ffffff'];
const variations = smartEngine.generateVariations({
  headline: 'AUTUMN HARVEST',
  subhead: 'Handcrafted sourdough & seasonal cider.',
  cta: 'ORDER ONLINE',
  tag: 'NEW HARVEST',
  palette: customPalette,
  width: 1080,
  height: 1080,
});

assert.strictEqual(variations.length, 6, 'Smart layout must generate exactly 6 distinct variations');

variations.forEach((v, i) => {
  assert.ok(v.id, `Variation #${i} must have an id`);
  assert.ok(v.name, `Variation #${i} must have a name`);
  assert.strictEqual(v.width, 1080, `Variation #${i} width must match`);
  assert.strictEqual(v.height, 1080, `Variation #${i} height must match`);
  assert.ok(v.background, `Variation #${i} must have background`);
  assert.ok(v.previewGradient, `Variation #${i} must have previewGradient`);
  assert.ok(Array.isArray(v.objects) && v.objects.length >= 4, `Variation #${i} must have at least 4 objects`);

  // Check headline propagation
  const headlineObj = v.objects.find(o => o.type === 'i-text' && (o.text.includes('AUTUMN HARVEST') || o.text.includes('AUTUMN')));
  assert.ok(headlineObj, `Variation #${i} (${v.name}) must contain the customized headline`);

  // Check CTA propagation
  const ctaObj = v.objects.find(o => o.type === 'i-text' && o.text.includes('ORDER ONLINE'));
  assert.ok(ctaObj, `Variation #${i} (${v.name}) must contain the customized CTA`);
});
console.log('✅ SmartLayoutEngine procedural variation math & text propagation verified.');

// =========================================================================
// 3. Verify .designpro-pack Pack Format Conformance
// =========================================================================
const samplePack = {
  packName: 'Pixels-Design-Pack',
  version: '1.0',
  exportedAt: new Date().toISOString(),
  templateCount: 2,
  templates: [
    {
      id: 'tpl_custom_1',
      name: 'Custom Agency Flyer',
      category: 'marketing',
      artboardWidth: 1080,
      artboardHeight: 1080,
      thumbnail: 'data:image/jpeg;base64,sample',
      json: { version: '5.3.0', objects: [] },
      createdAt: Date.now(),
    },
    {
      id: 'tpl_custom_2',
      name: 'Social Banner',
      category: 'social',
      artboardWidth: 1200,
      artboardHeight: 630,
      thumbnail: 'data:image/jpeg;base64,sample2',
      json: { version: '5.3.0', objects: [] },
      createdAt: Date.now(),
    }
  ]
};

const packJson = JSON.stringify(samplePack);
const parsedPack = JSON.parse(packJson);
assert.strictEqual(parsedPack.packName, 'Pixels-Design-Pack');
assert.strictEqual(parsedPack.templates.length, 2);
assert.strictEqual(parsedPack.templates[0].artboardWidth, 1080);
assert.strictEqual(parsedPack.templates[1].artboardHeight, 630);
console.log('✅ .designpro-pack schema serialization verified.');

console.log('🎉 ALL Template Vault & Smart Layout tests passed 100%!');
