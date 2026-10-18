/**
 * Performance Benchmark: Snapping Spatial Indexing vs Linear Scan
 */

const assert = require('assert');

// Generate 150 simulated static objects
const numObjects = 150;
const staticObjects = [];
for (let i = 0; i < numObjects; i++) {
  staticObjects.push({
    id: `obj_${i}`,
    center: { x: Math.random() * 1080, y: Math.random() * 1080 },
    width: 50 + Math.random() * 200,
    height: 50 + Math.random() * 200,
    visible: true,
  });
}

const snapThreshold = 8;

// 1. OLD O(N) LINEAR SCAN
function oldLinearScan(targetCenter) {
  let snappedX = false;
  let newX = targetCenter.x;
  for (let i = 0; i < staticObjects.length; i++) {
    const obj = staticObjects[i];
    if (Math.abs(targetCenter.x - obj.center.x) <= snapThreshold) {
      newX = obj.center.x;
      snappedX = true;
      break;
    }
  }
  return { snappedX, newX };
}

// 2. NEW SPATIAL BINARY SEARCH
// Pre-index static objects on drag start
function buildSpatialIndex(objects) {
  const xPoints = [];
  const yPoints = [];
  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i];
    xPoints.push({ val: obj.center.x, id: obj.id, isCenter: true });
    yPoints.push({ val: obj.center.y, id: obj.id, isCenter: true });
  }
  xPoints.sort((a, b) => a.val - b.val);
  yPoints.sort((a, b) => a.val - b.val);
  return { xPoints, yPoints };
}

function binarySearchNearest(sortedPoints, targetVal, threshold) {
  let low = 0;
  let high = sortedPoints.length - 1;
  let best = null;
  let minDiff = Infinity;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const diff = sortedPoints[mid].val - targetVal;
    const absDiff = Math.abs(diff);

    if (absDiff <= threshold && absDiff < minDiff) {
      minDiff = absDiff;
      best = sortedPoints[mid];
    }

    if (diff < 0) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  // Also check adjacent neighbors in case of close clusters
  if (low < sortedPoints.length && Math.abs(sortedPoints[low].val - targetVal) <= threshold) {
    if (Math.abs(sortedPoints[low].val - targetVal) < minDiff) {
      best = sortedPoints[low];
    }
  }
  if (high >= 0 && Math.abs(sortedPoints[high].val - targetVal) <= threshold) {
    if (Math.abs(sortedPoints[high].val - targetVal) < minDiff) {
      best = sortedPoints[high];
    }
  }

  return best;
}

// Benchmark 10,000 simulated mousemove frames (simulating rapid drags)
const testFrames = 10000;
const targets = [];
for (let i = 0; i < testFrames; i++) {
  targets.push({ x: Math.random() * 1080, y: Math.random() * 1080 });
}

// Benchmark Old
const t0 = process.hrtime.bigint();
let oldHits = 0;
for (let i = 0; i < testFrames; i++) {
  const res = oldLinearScan(targets[i]);
  if (res.snappedX) oldHits++;
}
const t1 = process.hrtime.bigint();
const oldDurationMs = Number(t1 - t0) / 1e6;

// Benchmark New
const t2 = process.hrtime.bigint();
const index = buildSpatialIndex(staticObjects);
let newHits = 0;
for (let i = 0; i < testFrames; i++) {
  const match = binarySearchNearest(index.xPoints, targets[i].x, snapThreshold);
  if (match) newHits++;
}
const t3 = process.hrtime.bigint();
const newDurationMs = Number(t3 - t2) / 1e6;

console.log(`[Benchmark] 150 objects over ${testFrames} frames:`);
console.log(`  Old Linear Scan: ${oldDurationMs.toFixed(2)} ms`);
console.log(`  New Binary Search: ${newDurationMs.toFixed(2)} ms`);
const speedup = (oldDurationMs / newDurationMs).toFixed(1);
console.log(`  Speedup: ${speedup}x faster!`);

assert.ok(newDurationMs < oldDurationMs, 'New binary search must be significantly faster');
console.log('✅ Snapping spatial indexing benchmark passed!');
