/**
 * Interactive Pixel Rulers & Magnetic Draggable Guides Engine for DesignPro
 * Grounded in Professional Studio Standards (Photoshop / Figma / Illustrator)
 * 
 * Capabilities:
 * - Sub-pixel calibrated top & left rulers syncing with pan and zoom
 * - Real-time hairline cursor indicator tracking mouse coordinates
 * - Click & drag from horizontal or vertical ruler to pull magnetic alignment guides
 * - Draggable guide lines with hover cursors ('ns-resize', 'ew-resize')
 * - Snapping candidate registration for SnappingEngine
 * - Toggle guides visibility and clear guides
 */

class RulersAndGuides {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.visible = true;
    this.guides = [];
    this.horizontalRuler = null;
    this.verticalRuler = null;
    this.hCtx = null;
    this.vCtx = null;
    this.rulerThickness = 22; // px
    this.currentPointer = { x: 0, y: 0 };
    this.isDraggingNewGuide = false;
    this.draggedGuideOrientation = null;
    this.previewGuideLine = null;

    this.onCanvasRender = this.renderRulers.bind(this);
    this.onCanvasMouseMove = this.handleCanvasMouseMove.bind(this);
  }

  setCanvas(canvas) {
    if (this.canvas) {
      this.canvas.off('after:render', this.onCanvasRender);
      this.canvas.off('mouse:move', this.onCanvasMouseMove);
    }
    this.canvas = canvas;
    if (this.canvas) {
      this.canvas.on('after:render', this.onCanvasRender);
      this.canvas.on('mouse:move', this.onCanvasMouseMove);
    }
    this.renderRulers();
  }

  init() {
    this.setupDOM();
    this.bindEvents();
    if (this.canvas) {
      this.canvas.on('after:render', this.onCanvasRender);
      this.canvas.on('mouse:move', this.onCanvasMouseMove);
    }
    this.renderRulers();
  }

  setupDOM() {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper) return;

    // Remove any existing ruler elements
    const oldContainer = document.getElementById('rulers-overlay-container');
    if (oldContainer) oldContainer.remove();

    const container = document.createElement('div');
    container.id = 'rulers-overlay-container';
    container.className = 'rulers-overlay-container';
    container.innerHTML = `
      <div class="ruler-corner" title="DesignPro Rulers (px)">px</div>
      <canvas id="ruler-horizontal" class="ruler-canvas ruler-horizontal" height="${this.rulerThickness}"></canvas>
      <canvas id="ruler-vertical" class="ruler-canvas ruler-vertical" width="${this.rulerThickness}"></canvas>
    `;

    wrapper.prepend(container);

    this.horizontalRuler = document.getElementById('ruler-horizontal');
    this.verticalRuler = document.getElementById('ruler-vertical');

    if (this.horizontalRuler) this.hCtx = this.horizontalRuler.getContext('2d');
    if (this.verticalRuler) this.vCtx = this.verticalRuler.getContext('2d');

    this.resizeRulers();
    window.addEventListener('resize', () => this.resizeRulers());
  }

  resizeRulers() {
    const wrapper = document.getElementById('canvas-wrapper');
    if (!wrapper || !this.horizontalRuler || !this.verticalRuler) return;

    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;

    this.horizontalRuler.width = w;
    this.horizontalRuler.height = this.rulerThickness;

    this.verticalRuler.width = this.rulerThickness;
    this.verticalRuler.height = h;

    this.renderRulers();
  }

  bindEvents() {
    if (this.horizontalRuler) {
      this.horizontalRuler.addEventListener('mousedown', (e) => this.startGuideDrag(e, 'horizontal'));
    }
    if (this.verticalRuler) {
      this.verticalRuler.addEventListener('mousedown', (e) => this.startGuideDrag(e, 'vertical'));
    }

    window.addEventListener('mousemove', (e) => this.handleWindowMouseMove(e));
    window.addEventListener('mouseup', (e) => this.handleWindowMouseUp(e));
  }

  handleCanvasMouseMove(opt) {
    if (!opt || !this.canvas) return;
    const pointer = this.canvas.getPointer(opt.e);
    this.currentPointer = pointer;
    this.renderRulers();
  }

  // =========================================================================
  // Ruler Rendering Engine (Ticks & Pixel Labels)
  // =========================================================================
  renderRulers() {
    if (!this.visible || !this.hCtx || !this.vCtx || !this.canvas) return;

    const vpt = this.canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const zoom = this.canvas.getZoom();
    const panX = vpt[4];
    const panY = vpt[5];

    const hWidth = this.horizontalRuler.width;
    const vHeight = this.verticalRuler.height;

    // Compute artboard container relative offset inside wrapper
    const upperCanvas = this.canvas.upperCanvasEl;
    const wrapper = document.getElementById('canvas-wrapper');
    if (!upperCanvas || !wrapper) return;

    const rectWrapper = wrapper.getBoundingClientRect();
    const rectCanvas = upperCanvas.getBoundingClientRect();

    const canvasOriginX = rectCanvas.left - rectWrapper.left;
    const canvasOriginY = rectCanvas.top - rectWrapper.top;

    const scaleRatio = rectCanvas.width / (this.canvas.width || 1);

    // 1. Draw Horizontal Ruler
    const hCtx = this.hCtx;
    hCtx.clearRect(0, 0, hWidth, this.rulerThickness);
    hCtx.fillStyle = '#0f172a';
    hCtx.fillRect(0, 0, hWidth, this.rulerThickness);
    hCtx.strokeStyle = '#334155';
    hCtx.lineWidth = 1;
    hCtx.font = '9px monospace';
    hCtx.fillStyle = '#94a3b8';

    // Step calculation based on zoom
    let step = 100;
    if (zoom < 0.3) step = 500;
    else if (zoom < 0.6) step = 200;
    else if (zoom > 2.0) step = 50;

    const startPx = Math.floor((-canvasOriginX) / (zoom * scaleRatio) / step) * step;
    const endPx = Math.ceil((hWidth - canvasOriginX) / (zoom * scaleRatio) / step) * step;

    for (let px = startPx; px <= endPx; px += step) {
      const screenX = canvasOriginX + px * zoom * scaleRatio;
      if (screenX < this.rulerThickness || screenX > hWidth) continue;

      // Major Tick & Label
      hCtx.beginPath();
      hCtx.moveTo(screenX, 8);
      hCtx.lineTo(screenX, this.rulerThickness);
      hCtx.stroke();
      hCtx.fillText(String(px), screenX + 3, 10);

      // Minor Ticks
      const subStep = step / 10;
      for (let s = 1; s < 10; s++) {
        const subPx = px + s * subStep;
        const subScreenX = canvasOriginX + subPx * zoom * scaleRatio;
        if (subScreenX < this.rulerThickness || subScreenX > hWidth) continue;
        const tickH = s === 5 ? 8 : 4;
        hCtx.beginPath();
        hCtx.moveTo(subScreenX, this.rulerThickness - tickH);
        hCtx.lineTo(subScreenX, this.rulerThickness);
        hCtx.stroke();
      }
    }

    // Horizontal Cursor Hairline
    const curScreenX = canvasOriginX + this.currentPointer.x * zoom * scaleRatio;
    if (curScreenX >= this.rulerThickness && curScreenX <= hWidth) {
      hCtx.strokeStyle = '#f43f5e';
      hCtx.beginPath();
      hCtx.moveTo(curScreenX, 0);
      hCtx.lineTo(curScreenX, this.rulerThickness);
      hCtx.stroke();
    }

    // 2. Draw Vertical Ruler
    const vCtx = this.vCtx;
    vCtx.clearRect(0, 0, this.rulerThickness, vHeight);
    vCtx.fillStyle = '#0f172a';
    vCtx.fillRect(0, 0, this.rulerThickness, vHeight);
    vCtx.strokeStyle = '#334155';
    vCtx.lineWidth = 1;
    vCtx.font = '9px monospace';
    vCtx.fillStyle = '#94a3b8';

    const startPy = Math.floor((-canvasOriginY) / (zoom * scaleRatio) / step) * step;
    const endPy = Math.ceil((vHeight - canvasOriginY) / (zoom * scaleRatio) / step) * step;

    for (let py = startPy; py <= endPy; py += step) {
      const screenY = canvasOriginY + py * zoom * scaleRatio;
      if (screenY < this.rulerThickness || screenY > vHeight) continue;

      // Major Tick
      vCtx.beginPath();
      vCtx.moveTo(8, screenY);
      vCtx.lineTo(this.rulerThickness, screenY);
      vCtx.stroke();

      // Vertical text
      vCtx.save();
      vCtx.translate(10, screenY + 8);
      vCtx.rotate(-Math.PI / 2);
      vCtx.fillText(String(py), 0, 0);
      vCtx.restore();

      // Minor Ticks
      const subStep = step / 10;
      for (let s = 1; s < 10; s++) {
        const subPy = py + s * subStep;
        const subScreenY = canvasOriginY + subPy * zoom * scaleRatio;
        if (subScreenY < this.rulerThickness || subScreenY > vHeight) continue;
        const tickW = s === 5 ? 8 : 4;
        vCtx.beginPath();
        vCtx.moveTo(this.rulerThickness - tickW, subScreenY);
        vCtx.lineTo(this.rulerThickness, subScreenY);
        vCtx.stroke();
      }
    }

    // Vertical Cursor Hairline
    const curScreenY = canvasOriginY + this.currentPointer.y * zoom * scaleRatio;
    if (curScreenY >= this.rulerThickness && curScreenY <= vHeight) {
      vCtx.strokeStyle = '#f43f5e';
      vCtx.beginPath();
      vCtx.moveTo(0, curScreenY);
      vCtx.lineTo(this.rulerThickness, curScreenY);
      vCtx.stroke();
    }
  }

  // =========================================================================
  // Drag & Drop Guides Creation
  // =========================================================================
  startGuideDrag(e, orientation) {
    e.preventDefault();
    this.isDraggingNewGuide = true;
    this.draggedGuideOrientation = orientation;

    // Create a temporary visual guide element
    const wrapper = document.getElementById('canvas-wrapper');
    const preview = document.createElement('div');
    preview.id = 'guide-drag-preview';
    preview.className = `guide-drag-preview guide-${orientation}`;
    wrapper.appendChild(preview);
    this.previewGuideLine = preview;

    this.updateGuidePreview(e);
  }

  handleWindowMouseMove(e) {
    if (!this.isDraggingNewGuide) return;
    this.updateGuidePreview(e);
  }

  updateGuidePreview(e) {
    if (!this.previewGuideLine) return;
    const wrapper = document.getElementById('canvas-wrapper');
    const rect = wrapper.getBoundingClientRect();

    if (this.draggedGuideOrientation === 'horizontal') {
      const top = Math.max(this.rulerThickness, Math.min(e.clientY - rect.top, rect.height));
      this.previewGuideLine.style.top = `${top}px`;
    } else {
      const left = Math.max(this.rulerThickness, Math.min(e.clientX - rect.left, rect.width));
      this.previewGuideLine.style.left = `${left}px`;
    }
  }

  handleWindowMouseUp(e) {
    if (!this.isDraggingNewGuide) return;
    this.isDraggingNewGuide = false;

    if (this.previewGuideLine) {
      this.previewGuideLine.remove();
      this.previewGuideLine = null;
    }

    const wrapper = document.getElementById('canvas-wrapper');
    const upper = this.canvas.upperCanvasEl;
    if (!wrapper || !upper) return;

    const rectWrapper = wrapper.getBoundingClientRect();
    const rectCanvas = upper.getBoundingClientRect();

    // Verify if pointer dropped inside the artboard boundary
    const clientX = e.clientX;
    const clientY = e.clientY;

    if (
      clientX >= rectCanvas.left &&
      clientX <= rectCanvas.right &&
      clientY >= rectCanvas.top &&
      clientY <= rectCanvas.bottom
    ) {
      // Calculate canvas internal coordinate
      const pointer = this.canvas.getPointer(e);
      if (this.draggedGuideOrientation === 'horizontal') {
        this.addGuide('horizontal', pointer.y);
      } else {
        this.addGuide('vertical', pointer.x);
      }
    }
  }

  addGuide(orientation, position) {
    const isHorizontal = orientation === 'horizontal';
    const canvasW = this.canvas.width;
    const canvasH = this.canvas.height;

    const points = isHorizontal
      ? [0, position, canvasW, position]
      : [position, 0, position, canvasH];

    const guide = new fabric.Line(points, {
      stroke: '#06b6d4',
      strokeWidth: 1.5,
      strokeDashArray: [5, 4],
      selectable: true,
      evented: true,
      hasControls: false,
      hasBorders: false,
      lockMovementX: isHorizontal,
      lockMovementY: !isHorizontal,
      lockRotation: true,
      lockScalingX: true,
      lockScalingY: true,
      hoverCursor: isHorizontal ? 'ns-resize' : 'ew-resize',
      isGuide: true,
      guideOrientation: orientation,
    });

    // Custom boundary constrain on guide drag
    guide.on('moving', () => {
      if (isHorizontal) {
        guide.left = 0;
        guide.y1 = guide.top;
        guide.y2 = guide.top;
      } else {
        guide.top = 0;
        guide.x1 = guide.left;
        guide.x2 = guide.left;
      }
      this.canvas.renderAll();
    });

    this.canvas.add(guide);
    this.canvas.bringToFront(guide);
    this.guides.push(guide);
    this.canvas.renderAll();

    if (window.showToast) {
      window.showToast(`Magnetic ${orientation} guide added at ${Math.round(position)}px`, 'info');
    }
  }

  toggleGuides() {
    this.visible = !this.visible;
    const container = document.getElementById('rulers-overlay-container');
    if (container) {
      container.style.display = this.visible ? 'block' : 'none';
    }
    this.guides.forEach(g => {
      g.visible = this.visible;
    });
    this.canvas.renderAll();
    if (window.showToast) {
      window.showToast(`Rulers & Guides ${this.visible ? 'Visible' : 'Hidden'}`, 'info');
    }
  }

  clearAllGuides() {
    this.guides.forEach(g => this.canvas.remove(g));
    this.guides = [];
    this.canvas.renderAll();
    if (window.showToast) {
      window.showToast('All guides cleared', 'info');
    }
  }

  getActiveGuidePositions() {
    const horizontals = [];
    const verticals = [];
    this.guides.forEach(g => {
      if (!g.visible) return;
      if (g.guideOrientation === 'horizontal') {
        horizontals.push(g.top);
      } else {
        verticals.push(g.left);
      }
    });
    return { horizontals, verticals };
  }
}

window.RulersAndGuides = RulersAndGuides;
