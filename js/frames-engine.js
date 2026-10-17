/**
 * Photo Clipping Frames & Masks Engine for DesignPro
 * Supports masking active image or placeholder frames into:
 * Circle Avatar, Rounded Square, Hexagon, Arch Window, Heart, Star, Polaroid Frame, Diamond
 */

class FramesEngine {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  applyMask(maskType, targetImg = null) {
    const img = targetImg || this.canvas.getActiveObject();
    if (!img || img.type !== 'image') {
      if (window.showToast) {
        window.showToast('Please select a photo on the artboard first to apply a clipping frame', 'error');
      }
      return false;
    }

    if (maskType === 'none') {
      img.set({ clipPath: null });
      this.canvas.renderAll();
      this.canvasManager.recordState();
      if (window.showToast) window.showToast('Removed clipping frame mask', 'info');
      return true;
    }

    const w = img.width;
    const h = img.height;
    const minDim = Math.min(w, h);
    let clipObj = null;

    switch (maskType) {
      case 'circle':
        clipObj = new fabric.Circle({
          radius: minDim / 2,
          originX: 'center',
          originY: 'center',
        });
        break;

      case 'rounded':
        clipObj = new fabric.Rect({
          width: w * 0.9,
          height: h * 0.9,
          rx: 36,
          ry: 36,
          originX: 'center',
          originY: 'center',
        });
        break;

      case 'hexagon': {
        const points = [];
        const r = minDim / 2;
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6;
          points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
        }
        clipObj = new fabric.Polygon(points, {
          originX: 'center',
          originY: 'center',
        });
        break;
      }

      case 'arch': {
        const halfW = (minDim * 0.85) / 2;
        const halfH = (minDim * 0.95) / 2;
        const d = `M ${-halfW},${halfH} L ${halfW},${halfH} L ${halfW},0 A ${halfW},${halfW} 0 0,0 ${-halfW},0 Z`;
        clipObj = new fabric.Path(d, {
          originX: 'center',
          originY: 'center',
        });
        break;
      }

      case 'heart': {
        const d = 'M 0,-40 C -35,-80 -80,-35 -40,15 L 0,60 L 40,15 C 80,-35 35,-80 0,-40 Z';
        clipObj = new fabric.Path(d, {
          originX: 'center',
          originY: 'center',
          scaleX: minDim / 130,
          scaleY: minDim / 130,
        });
        break;
      }

      case 'star': {
        const points = [];
        const outer = minDim / 2;
        const inner = minDim / 4.2;
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outer : inner;
          const angle = (Math.PI / 5) * i - Math.PI / 2;
          points.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
        }
        clipObj = new fabric.Polygon(points, {
          originX: 'center',
          originY: 'center',
        });
        break;
      }

      case 'diamond': {
        const half = minDim / 2;
        const points = [
          { x: 0, y: -half },
          { x: half, y: 0 },
          { x: 0, y: half },
          { x: -half, y: 0 },
        ];
        clipObj = new fabric.Polygon(points, {
          originX: 'center',
          originY: 'center',
        });
        break;
      }
    }

    if (clipObj) {
      img.set({ clipPath: clipObj });
      this.canvas.renderAll();
      this.canvasManager.recordState();
      if (window.showToast) {
        window.showToast(`Applied "${maskType}" photo clipping frame!`, 'success');
      }
      return true;
    }

    return false;
  }
}

window.FramesEngine = FramesEngine;
