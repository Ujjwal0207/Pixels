/**
 * Canva Pro / Pixels - Core Defensive Utilities (Flaw 16 & Modern Web Standards)
 * Provides sanitized boundary coercions, safe math expression evaluation,
 * and high-performance DOM/Canvas utility helpers.
 */

(function () {
  'use strict';

  const AppUtils = {
    /**
     * Safely parse float values with fallback and range boundaries
     * Eliminates NaN coercions into Canvas 2D contexts and WebGL pipelines
     */
    safeParseFloat(val, fallback = 0, min = -Infinity, max = Infinity) {
      if (val === null || val === undefined || val === '') return fallback;
      if (typeof val === 'number') {
        if (!Number.isFinite(val)) return fallback;
        return Math.min(Math.max(val, min), max);
      }
      const str = String(val).trim();
      const parsed = parseFloat(str);
      if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return fallback;
      return Math.min(Math.max(parsed, min), max);
    },

    /**
     * Safely parse integer values with fallback and range boundaries
     */
    safeParseInt(val, fallback = 0, min = -Infinity, max = Infinity, radix = 10) {
      if (val === null || val === undefined || val === '') return fallback;
      if (typeof val === 'number') {
        if (!Number.isFinite(val)) return fallback;
        const rounded = Math.floor(val);
        return Math.min(Math.max(rounded, min), max);
      }
      const str = String(val).trim();
      const parsed = parseInt(str, radix);
      if (Number.isNaN(parsed) || !Number.isFinite(parsed)) return fallback;
      return Math.min(Math.max(parsed, min), max);
    },

    /**
     * Numeric clamp helper
     */
    clamp(val, min, max) {
      const num = Number(val);
      if (Number.isNaN(num)) return min;
      return Math.min(Math.max(num, min), max);
    },

    /**
     * Safe mathematical expression evaluator for inspector inputs
     * Supports: '1080 / 2', '150 + 25px', '20 * 4', '(500 - 100) / 2'
     * Uses zero eval() or Function() - strictly AST/token-based evaluation
     */
    evalMathExpr(expr, fallback = 0, min = -Infinity, max = Infinity) {
      if (!expr || typeof expr !== 'string') {
        return this.safeParseFloat(expr, fallback, min, max);
      }

      // Strip common CSS units
      const cleaned = expr.trim().replace(/(px|pt|em|rem|%|deg)$/i, '').trim();

      // If it's a direct number, parse immediately
      if (/^-?\d+(\.\d+)?$/.test(cleaned)) {
        return this.safeParseFloat(cleaned, fallback, min, max);
      }

      // Validate allowed characters: digits, decimal point, operators (+, -, *, /), parentheses, whitespace
      if (!/^[0-9+\-*/().\s]+$/.test(cleaned)) {
        return fallback;
      }

      try {
        // Tokenize
        const tokens = cleaned.match(/(\d+(\.\d+)?|[+\-*/()])/g);
        if (!tokens || tokens.length === 0) return fallback;

        // Recursive descent parser for arithmetic
        let idx = 0;

        function parsePrimary() {
          const token = tokens[idx++];
          if (token === '(') {
            const val = parseExpression();
            if (tokens[idx++] !== ')') throw new Error('Mismatched parentheses');
            return val;
          }
          if (token === '-') {
            return -parsePrimary();
          }
          if (token === '+') {
            return parsePrimary();
          }
          const num = parseFloat(token);
          if (Number.isNaN(num)) throw new Error('Invalid number token');
          return num;
        }

        function parseFactor() {
          let left = parsePrimary();
          while (idx < tokens.length && (tokens[idx] === '*' || tokens[idx] === '/')) {
            const op = tokens[idx++];
            const right = parsePrimary();
            if (op === '*') left *= right;
            else if (op === '/') {
              if (right === 0) throw new Error('Division by zero');
              left /= right;
            }
          }
          return left;
        }

        function parseExpression() {
          let left = parseFactor();
          while (idx < tokens.length && (tokens[idx] === '+' || tokens[idx] === '-')) {
            const op = tokens[idx++];
            const right = parseFactor();
            if (op === '+') left += right;
            else if (op === '-') left -= right;
          }
          return left;
        }

        const result = parseExpression();
        if (idx < tokens.length) throw new Error('Trailing unparsed tokens');
        if (Number.isNaN(result) || !Number.isFinite(result)) return fallback;
        return Math.min(Math.max(result, min), max);
      } catch (err) {
        return fallback;
      }
    },

    /**
     * Debounce execution
     */
    debounce(fn, delay = 200) {
      let timer = null;
      return function (...args) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          fn.apply(this, args);
          timer = null;
        }, delay);
      };
    },

    /**
     * Throttle execution
     */
    throttle(fn, limit = 50) {
      let lastFunc;
      let lastRan;
      return function (...args) {
        if (!lastRan) {
          fn.apply(this, args);
          lastRan = Date.now();
        } else {
          clearTimeout(lastFunc);
          lastFunc = setTimeout(() => {
            if (Date.now() - lastRan >= limit) {
              fn.apply(this, args);
              lastRan = Date.now();
            }
          }, limit - (Date.now() - lastRan));
        }
      };
    },

    /**
     * High-entropy unique identifier
     */
    generateId(prefix = 'id') {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return `${prefix}_${crypto.randomUUID()}`;
      }
      return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
  };

  window.AppUtils = AppUtils;
})();
