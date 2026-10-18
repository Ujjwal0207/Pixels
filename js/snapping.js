/**
 * Smart Snapping & Magnetic Guidelines Engine for DesignPro
 * Provides real-time magnetic snap lines (canvas center, edges, and inter-object alignment)
 * when dragging objects on the artboard.
 */

class SnappingEngine {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.enabled = true;
    this.snapThreshold = 8; // pixels
    this.guidelineColor = '#06b6d4'; // Cyan
    this.centerGuidelineColor = '#ec4899'; // Magenta
    this.activeGuidelines = [];

    this.onObjectMoving = this.handleObjectMoving.bind(this);
    this.onAfterRender = this.drawGuidelines.bind(this);
    this.onMouseUp = this.clearGuidelines.bind(this);
    this.spatialIndex = null;

    this.init();
  }

  destroy() {
    if (this.canvas) {
      this.canvas.off('object:moving', this.onObjectMoving);
      this.canvas.off('after:render', this.onAfterRender);
      this.canvas.off('mouse:up', this.onMouseUp);
      this.canvas.off('object:modified', this.onMouseUp);
    }
    this.spatialIndex = null;
    this.activeGuidelines = [];
  }

  setCanvas(canvas) {
    this.destroy();
    this.canvas = canvas;
    this.init();
  }

  toggle() {
    this.enabled = !this.enabled;
    this.clearGuidelines();
    return this.enabled;
  }

  init() {
    if (!this.canvas) return;
    this.canvas.on('object:moving', this.onObjectMoving);
    this.canvas.on('after:render', this.onAfterRender);
    this.canvas.on('mouse:up', this.onMouseUp);
    this.canvas.on('object:modified', this.onMouseUp);
  }

  handleObjectMoving(e) {
    if (!this.enabled) return;
    const target = e.target;
    if (!target) return;

    this.activeGuidelines = [];
    const canvasWidth = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const canvasHeight = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));
    const canvasCenterX = canvasWidth / 2;
    const canvasCenterY = canvasHeight / 2;

    const targetCenter = target.getCenterPoint();
    let newCenterX = targetCenter.x;
    let newCenterY = targetCenter.y;

    let snappedX = false;
    let snappedY = false;

    // 1. Snap to Canvas Center X
    if (Math.abs(targetCenter.x - canvasCenterX) <= this.snapThreshold) {
      newCenterX = canvasCenterX;
      this.activeGuidelines.push({ type: 'vertical', x: canvasCenterX, isCenter: true });
      snappedX = true;
    }

    // 2. Snap to Canvas Center Y
    if (Math.abs(targetCenter.y - canvasCenterY) <= this.snapThreshold) {
      newCenterY = canvasCenterY;
      this.activeGuidelines.push({ type: 'horizontal', y: canvasCenterY, isCenter: true });
      snappedY = true;
    }

    // 3. Snap to Canvas Boundaries (Left, Right, Top, Bottom)
    const bound = target.getBoundingRect(true);
    if (!snappedX) {
      if (Math.abs(bound.left) <= this.snapThreshold) {
        newCenterX = targetCenter.x - bound.left;
        this.activeGuidelines.push({ type: 'vertical', x: 0, isCenter: false });
        snappedX = true;
      } else if (Math.abs(bound.left + bound.width - canvasWidth) <= this.snapThreshold) {
        newCenterX = targetCenter.x + (canvasWidth - (bound.left + bound.width));
        this.activeGuidelines.push({ type: 'vertical', x: canvasWidth, isCenter: false });
        snappedX = true;
      }
    }

    if (!snappedY) {
      if (Math.abs(bound.top) <= this.snapThreshold) {
        newCenterY = targetCenter.y - bound.top;
        this.activeGuidelines.push({ type: 'horizontal', y: 0, isCenter: false });
        snappedY = true;
      } else if (Math.abs(bound.top + bound.height - canvasHeight) <= this.snapThreshold) {
        newCenterY = targetCenter.y + (canvasHeight - (bound.top + bound.height));
        this.activeGuidelines.push({ type: 'horizontal', y: canvasHeight, isCenter: false });
        snappedY = true;
      }
    }

    // 4. Snap to User Rulers & Magnetic Guides
    if (window.app && window.app.rulers && typeof window.app.rulers.getActiveGuidePositions === 'function') {
      const { horizontals, verticals } = window.app.rulers.getActiveGuidePositions();

      if (!snappedX) {
        for (const gx of verticals) {
          // Snap center or edges to vertical guide
          if (Math.abs(targetCenter.x - gx) <= this.snapThreshold) {
            newCenterX = gx;
            this.activeGuidelines.push({ type: 'vertical', x: gx, isCenter: false });
            snappedX = true;
            break;
          } else if (Math.abs(bound.left - gx) <= this.snapThreshold) {
            newCenterX = targetCenter.x + (gx - bound.left);
            this.activeGuidelines.push({ type: 'vertical', x: gx, isCenter: false });
            snappedX = true;
            break;
          } else if (Math.abs(bound.left + bound.width - gx) <= this.snapThreshold) {
            newCenterX = targetCenter.x + (gx - (bound.left + bound.width));
            this.activeGuidelines.push({ type: 'vertical', x: gx, isCenter: false });
            snappedX = true;
            break;
          }
        }
      }

      if (!snappedY) {
        for (const gy of horizontals) {
          if (Math.abs(targetCenter.y - gy) <= this.snapThreshold) {
            newCenterY = gy;
            this.activeGuidelines.push({ type: 'horizontal', y: gy, isCenter: false });
            snappedY = true;
            break;
          } else if (Math.abs(bound.top - gy) <= this.snapThreshold) {
            newCenterY = targetCenter.y + (gy - bound.top);
            this.activeGuidelines.push({ type: 'horizontal', y: gy, isCenter: false });
            snappedY = true;
            break;
          } else if (Math.abs(bound.top + bound.height - gy) <= this.snapThreshold) {
            newCenterY = targetCenter.y + (gy - (bound.top + bound.height));
            this.activeGuidelines.push({ type: 'horizontal', y: gy, isCenter: false });
            snappedY = true;
            break;
          }
        }
      }
    }

    // 5. Fast O(log N) Snap to other objects on canvas via Spatial Binary Search
    if (!snappedX || !snappedY) {
      const index = this.buildSpatialIndex(target);

      if (!snappedX && index.xPoints.length > 0) {
        const match = this.findNearestSnap(index.xPoints, targetCenter.x);
        if (match) {
          newCenterX = match.val;
          this.activeGuidelines.push({ type: 'vertical', x: match.val, isCenter: match.isCenter });
          snappedX = true;
        }
      }

      if (!snappedY && index.yPoints.length > 0) {
        const match = this.findNearestSnap(index.yPoints, targetCenter.y);
        if (match) {
          newCenterY = match.val;
          this.activeGuidelines.push({ type: 'horizontal', y: match.val, isCenter: match.isCenter });
          snappedY = true;
        }
      }
    }

    if (snappedX || snappedY) {
      target.setPositionByOrigin(new fabric.Point(newCenterX, newCenterY), 'center', 'center');
      target.setCoords();
    }
  }

  buildSpatialIndex(target) {
    if (this.spatialIndex && this.spatialIndex.target === target) {
      return this.spatialIndex;
    }
    const xPoints = [];
    const yPoints = [];
    if (!this.canvas) return { xPoints, yPoints, target };

    this.canvas.forEachObject((obj) => {
      if (obj === target || !obj.visible || (target.contains && target.contains(obj)) || obj.isGuide) return;
      const center = obj.getCenterPoint();
      xPoints.push({ val: center.x, isCenter: true });
      yPoints.push({ val: center.y, isCenter: true });

      const b = obj.getBoundingRect ? obj.getBoundingRect(true) : null;
      if (b) {
        xPoints.push({ val: b.left, isCenter: false });
        xPoints.push({ val: b.left + b.width, isCenter: false });
        yPoints.push({ val: b.top, isCenter: false });
        yPoints.push({ val: b.top + b.height, isCenter: false });
      }
    });

    xPoints.sort((a, b) => a.val - b.val);
    yPoints.sort((a, b) => a.val - b.val);

    this.spatialIndex = { xPoints, yPoints, target };
    return this.spatialIndex;
  }

  findNearestSnap(sortedPoints, targetVal) {
    if (!sortedPoints || sortedPoints.length === 0) return null;
    let low = 0;
    let high = sortedPoints.length - 1;
    let best = null;
    let minDiff = Infinity;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const diff = sortedPoints[mid].val - targetVal;
      const absDiff = Math.abs(diff);

      if (absDiff <= this.snapThreshold && absDiff < minDiff) {
        minDiff = absDiff;
        best = sortedPoints[mid];
      }

      if (diff < 0) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    if (low < sortedPoints.length && Math.abs(sortedPoints[low].val - targetVal) <= this.snapThreshold) {
      if (Math.abs(sortedPoints[low].val - targetVal) < minDiff) {
        best = sortedPoints[low];
      }
    }
    if (high >= 0 && Math.abs(sortedPoints[high].val - targetVal) <= this.snapThreshold) {
      if (Math.abs(sortedPoints[high].val - targetVal) < minDiff) {
        best = sortedPoints[high];
      }
    }

    return best;
  }

  drawGuidelines() {
    if (!this.enabled || this.activeGuidelines.length === 0) return;
    const ctx = this.canvas.getSelectionContext();
    if (!ctx) return;

    ctx.save();
    this.activeGuidelines.forEach((g) => {
      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = g.isCenter ? this.centerGuidelineColor : this.guidelineColor;
      ctx.setLineDash([4, 4]);

      const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
      const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

      if (g.type === 'vertical') {
        ctx.moveTo(g.x, 0);
        ctx.lineTo(g.x, artboardH);
      } else if (g.type === 'horizontal') {
        ctx.moveTo(0, g.y);
        ctx.lineTo(artboardW, g.y);
      }
      ctx.stroke();
    });
    ctx.restore();
  }

  clearGuidelines() {
    this.activeGuidelines = [];
    this.spatialIndex = null;
    if (this.canvas) {
      this.canvas.requestRenderAll();
    }
  }
}

window.SnappingEngine = SnappingEngine;
