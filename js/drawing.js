/**
 * Drawing Tool for DesignPro
 * Freehand drawing, stylus pressure sensitivity, calligraphy, highlighter and brushes
 */

(function () {
  'use strict';

  // Custom Calligraphy Ribbon Brush
  if (typeof fabric !== 'undefined' && fabric.BaseBrush) {
    fabric.CalligraphyBrush = fabric.util.createClass(fabric.BaseBrush, {
      color: '#8b5cf6',
      width: 10,
      angle: 45,
      points: [],

      initialize: function (canvas, opt) {
        this.canvas = canvas;
        this.setOptions(opt);
      },

      setOptions: function (options) {
        options = options || {};
        this.color = options.color || this.color;
        this.width = options.width || this.width;
        this.angle = options.angle !== undefined ? options.angle : this.angle;
      },

      onMouseDown: function (pointer, options) {
        this.points = [];
        const pressure = options.e && options.e.pressure > 0 ? options.e.pressure : 0.5;
        this.points.push({ x: pointer.x, y: pointer.y, pressure });
        this._resetShadow();
        this.canvas.clearContext(this.canvas.contextTop);
        this._render();
      },

      onMouseMove: function (pointer, options) {
        const pressure = options.e && options.e.pressure > 0 ? options.e.pressure : 0.5;
        this.points.push({ x: pointer.x, y: pointer.y, pressure });
        if (this.points.length > 1) {
          this.canvas.clearContext(this.canvas.contextTop);
          this._render();
        }
      },

      onMouseUp: function () {
        if (this.points.length > 1) {
          const pathData = this._createPath();
          if (pathData) {
            const path = new fabric.Path(pathData, {
              fill: this.color,
              stroke: null,
              strokeWidth: 0,
              selectable: true,
              evented: true
            });
            this.canvas.clearContext(this.canvas.contextTop);
            this.canvas.add(path);
            this.canvas.renderAll();
            if (window.app && window.app.canvasManager) {
              window.app.canvasManager.recordState();
            }
          }
        }
        this.points = [];
      },

      _render: function () {
        const ctx = this.canvas.contextTop;
        if (!ctx || this.points.length < 2) return;
        ctx.save();
        ctx.fillStyle = this.color;
        const ribbon = this._computeRibbon(this.points);
        if (ribbon.length > 1) {
          ctx.beginPath();
          ctx.moveTo(ribbon[0].left.x, ribbon[0].left.y);
          for (let i = 1; i < ribbon.length; i++) {
            ctx.lineTo(ribbon[i].left.x, ribbon[i].left.y);
          }
          for (let i = ribbon.length - 1; i >= 0; i--) {
            ctx.lineTo(ribbon[i].right.x, ribbon[i].right.y);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      },

      _computeRibbon: function (pts) {
        const rad = (this.angle * Math.PI) / 180;
        const ribbon = [];
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          const pressure = p.pressure > 0 ? p.pressure : 0.5;
          const w = Math.max(2, this.width * (0.3 + pressure * 1.4));
          const pdx = Math.cos(rad) * (w / 2);
          const pdy = Math.sin(rad) * (w / 2);
          ribbon.push({
            left: { x: p.x - pdx, y: p.y - pdy },
            right: { x: p.x + pdx, y: p.y + pdy }
          });
        }
        return ribbon;
      },

      _createPath: function () {
        const ribbon = this._computeRibbon(this.points);
        if (ribbon.length < 2) return '';
        let d = `M ${ribbon[0].left.x.toFixed(2)} ${ribbon[0].left.y.toFixed(2)} `;
        for (let i = 1; i < ribbon.length; i++) {
          d += `L ${ribbon[i].left.x.toFixed(2)} ${ribbon[i].left.y.toFixed(2)} `;
        }
        for (let i = ribbon.length - 1; i >= 0; i--) {
          d += `L ${ribbon[i].right.x.toFixed(2)} ${ribbon[i].right.y.toFixed(2)} `;
        }
        d += 'Z';
        return d;
      }
    });
  }

  class DrawingTool {
    constructor(canvasManager) {
      this.canvasManager = canvasManager;
      this.canvas = canvasManager.canvas;
      this.brushColor = '#8b5cf6';
      this.brushWidth = 5;
      this.brushType = 'Pencil';
    }

    setCanvas(canvas) {
      this.canvas = canvas;
    }

    enableDrawing(enabled = true) {
      this.canvas.isDrawingMode = enabled;
      if (enabled) {
        this.updateBrush();
      }
    }

    setBrushType(type) {
      this.brushType = type;
      if (this.canvas.isDrawingMode) {
        this.updateBrush();
      }
    }

    setBrushColor(color) {
      this.brushColor = color;
      if (this.canvas.freeDrawingBrush) {
        this.canvas.freeDrawingBrush.color = color;
      }
    }

    setBrushWidth(width) {
      this.brushWidth = window.AppUtils ? window.AppUtils.safeParseInt(width, 5, 1, 150) : (parseInt(width, 10) || 5);
      if (this.canvas.freeDrawingBrush) {
        this.canvas.freeDrawingBrush.width = this.brushWidth;
      }
    }

    updateBrush() {
      if (!this.canvas) return;

      if (this.brushType === 'Circle') {
        this.canvas.freeDrawingBrush = new fabric.CircleBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = this.brushColor;
        this.canvas.freeDrawingBrush.width = this.brushWidth;
      } else if (this.brushType === 'Spray') {
        this.canvas.freeDrawingBrush = new fabric.SprayBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = this.brushColor;
        this.canvas.freeDrawingBrush.width = this.brushWidth;
      } else if (this.brushType === 'Calligraphy' && fabric.CalligraphyBrush) {
        this.canvas.freeDrawingBrush = new fabric.CalligraphyBrush(this.canvas, {
          color: this.brushColor,
          width: this.brushWidth * 2,
          angle: 45
        });
      } else if (this.brushType === 'Highlighter') {
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        let hlColor = this.brushColor;
        if (hlColor.startsWith('#') && hlColor.length === 7) {
          const r = parseInt(hlColor.slice(1, 3), 16);
          const g = parseInt(hlColor.slice(3, 5), 16);
          const b = parseInt(hlColor.slice(5, 7), 16);
          hlColor = `rgba(${r}, ${g}, ${b}, 0.38)`;
        }
        this.canvas.freeDrawingBrush.color = hlColor;
        this.canvas.freeDrawingBrush.width = this.brushWidth * 3;
        this.canvas.freeDrawingBrush.strokeLineCap = 'square';
      } else {
        // Standard Pencil / Pen
        this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
        this.canvas.freeDrawingBrush.color = this.brushColor;
        this.canvas.freeDrawingBrush.width = this.brushWidth;
        this.canvas.freeDrawingBrush.strokeLineCap = 'round';
        this.canvas.freeDrawingBrush.strokeLineJoin = 'round';
      }
    }
  }

  window.DrawingTool = DrawingTool;
})();
