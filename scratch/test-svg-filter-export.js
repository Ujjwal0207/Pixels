/**
 * Unit Test: SVG filter preservation
 */
const assert = require('assert');

function enhanceSvgWithFilters(svgString, objectsWithShadow) {
  if (!objectsWithShadow || objectsWithShadow.length === 0) return svgString;

  let defs = '<defs>\n';
  objectsWithShadow.forEach((obj, idx) => {
    const id = `shadow-filter-${idx}`;
    const blur = obj.shadow.blur || 8;
    const dx = obj.shadow.offsetX || 0;
    const dy = obj.shadow.offsetY || 4;
    defs += `  <filter id="${id}" x="-30%" y="-30%" width="160%" height="160%">\n`;
    defs += `    <feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur / 2}" flood-color="${obj.shadow.color || '#000000'}" />\n`;
    defs += `  </filter>\n`;
  });
  defs += '</defs>\n';

  // Insert defs after <svg ...>
  return svgString.replace(/(<svg[^>]*>)/i, `$1\n${defs}`);
}

const rawSvg = '<svg viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" /></svg>';
const enhanced = enhanceSvgWithFilters(rawSvg, [{ shadow: { blur: 10, offsetX: 0, offsetY: 5, color: '#000000' } }]);

assert.ok(enhanced.includes('<feDropShadow dx="0" dy="5"'));
assert.ok(enhanced.includes('<filter id="shadow-filter-0"'));
console.log('✅ SVG filter enhancement test passed!');
