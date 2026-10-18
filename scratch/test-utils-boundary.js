/**
 * Unit Test: Core Defensive Utilities (Flaw 16 & Boundary Hardening)
 */

const assert = require('assert');
const fs = require('fs');

// Mock window
global.window = {};
require('../js/utils.js');
const { AppUtils } = global.window;

console.log('--- Testing AppUtils ---');

// 1. safeParseFloat
assert.strictEqual(AppUtils.safeParseFloat('123.45'), 123.45);
assert.strictEqual(AppUtils.safeParseFloat(null, 10), 10);
assert.strictEqual(AppUtils.safeParseFloat(undefined, 5), 5);
assert.strictEqual(AppUtils.safeParseFloat('', 0), 0);
assert.strictEqual(AppUtils.safeParseFloat('abc', 42), 42);
assert.strictEqual(AppUtils.safeParseFloat('100px', 0), 100);
assert.strictEqual(AppUtils.safeParseFloat('-25.5', 0), -25.5);
assert.strictEqual(AppUtils.safeParseFloat('150', 0, 0, 100), 100); // clamped max
assert.strictEqual(AppUtils.safeParseFloat('-50', 0, 0, 100), 0);   // clamped min

// 2. safeParseInt
assert.strictEqual(AppUtils.safeParseInt('42'), 42);
assert.strictEqual(AppUtils.safeParseInt('42.99'), 42);
assert.strictEqual(AppUtils.safeParseInt(null, 10), 10);
assert.strictEqual(AppUtils.safeParseInt('invalid', 7), 7);
assert.strictEqual(AppUtils.safeParseInt('200', 0, 0, 150), 150); // clamped max

// 3. clamp
assert.strictEqual(AppUtils.clamp(50, 0, 100), 50);
assert.strictEqual(AppUtils.clamp(-10, 0, 100), 0);
assert.strictEqual(AppUtils.clamp(120, 0, 100), 100);
assert.strictEqual(AppUtils.clamp('NaN', 0, 100), 0);

// 4. evalMathExpr
assert.strictEqual(AppUtils.evalMathExpr('1080 / 2'), 540);
assert.strictEqual(AppUtils.evalMathExpr('150 + 25px'), 175);
assert.strictEqual(AppUtils.evalMathExpr('50 * 3 - 10'), 140);
assert.strictEqual(AppUtils.evalMathExpr('(500 - 100) / 2'), 200);
assert.strictEqual(AppUtils.evalMathExpr('100 / 0', 99), 99); // division by zero returns fallback
assert.strictEqual(AppUtils.evalMathExpr('invalid text', 10), 10);
assert.strictEqual(AppUtils.evalMathExpr('500 + 500', 0, 0, 800), 800); // clamped max

console.log('✅ ALL AppUtils boundary tests passed successfully!');
