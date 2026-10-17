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

    this.init();
  }

  setCanvas(canvas) {
    if (this.canvas) {
      this.canvas.off('object:moving', this.onObjectMoving);
      this.canvas.off('after:render', this.onAfterRender);
      this.canvas.off('mouse:up', this.onMouseUp);
    }
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
  }

  handleObjectMoving(e) {
    if (!this.enabled) return;
    const target = e.target;
    if (!target) return;

    this.activeGuidelines = [];
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;
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

    // 4. Snap to other objects on canvas
    if (!snappedX || !snappedY) {
      this.canvas.forEachObject((obj) => {
        if (obj === target || !obj.visible || (target.contains && target.contains(obj)) || obj.isGuide) return;
        const otherCenter = obj.getCenterPoint();

        // Snap to other object Center X
        if (!snappedX && Math.abs(targetCenter.x - otherCenter.x) <= this.snapThreshold) {
          newCenterX = otherCenter.x;
          this.activeGuidelines.push({ type: 'vertical', x: otherCenter.x, isCenter: false });
          snappedX = true;
        }

        // Snap to other object Center Y
        if (!snappedY && Math.abs(targetCenter.y - otherCenter.y) <= this.snapThreshold) {
          newCenterY = otherCenter.y;
          this.activeGuidelines.push({ type: 'horizontal', y: otherCenter.y, isCenter: false });
          snappedY = true;
        }
      });
    }

    if (snappedX || snappedY) {
      target.setPositionByOrigin(new fabric.Point(newCenterX, newCenterY), 'center', 'center');
      target.setCoords();
    }
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

      if (g.type === 'vertical') {
        ctx.moveTo(g.x, 0);
        ctx.lineTo(g.x, this.canvas.height);
      } else if (g.type === 'horizontal') {
        ctx.moveTo(0, g.y);
        ctx.lineTo(this.canvas.width, g.y);
      }
      ctx.stroke();
    });
    ctx.restore();
  }

  clearGuidelines() {
    this.activeGuidelines = [];
    if (this.canvas) {
      this.canvas.requestRenderAll();
    }
  }
}

window.SnappingEngine = SnappingEngine;
