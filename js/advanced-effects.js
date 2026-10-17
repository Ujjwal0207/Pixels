/**
 * Advanced Creative Effects Engine for DesignPro
 * - Curved & Circular Text generator
 * - 1-Click Image Background Remover (Color Knockout & Transparency Extraction)
 * - Element Multi-Stop Gradient & Pattern Texture Engine
 * - Advanced Shadow & Neon Glow Engine
 * - Smart Artboard Quick-Resize with Proportional Content Scaling
 */

class AdvancedEffectsEngine {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  // =========================================================================
  // 1. Curved & Circular Text Generator
  // =========================================================================
  setCurvature(textObj, percent) {
    if (!textObj) {
      textObj = this.canvas.getActiveObject();
    }
    if (!textObj || (textObj.type !== 'i-text' && textObj.type !== 'text')) {
      return false;
    }

    const curvature = parseInt(percent, 10);
    textObj.curvePercent = curvature;

    if (curvature === 0) {
      // Straight text
      textObj.set({ path: null });
      this.canvas.renderAll();
      this.canvasManager.recordState();
      return true;
    }

    // Dynamic SVG Arc generation
    const textWidth = Math.max(textObj.width || 200, 150);
    const radius = Math.max(200, Math.abs(20000 / curvature));
    const sweep = curvature > 0 ? 1 : 0;
    const startX = 0;
    const endX = textWidth * 1.5;
    const y = radius;

    // SVG Arc Path: M startX y A radius radius 0 0 sweep endX y
    const pathD = `M 0,${radius} A ${radius},${radius} 0 0,${sweep} ${endX},${radius}`;
    const arcPath = new fabric.Path(pathD, {
      visible: false,
    });

    textObj.set({
      path: arcPath,
    });

    this.canvas.renderAll();
    this.canvasManager.recordState();
    return true;
  }

  // =========================================================================
  // 2. 1-Click Image Background Remover (Color Knockout)
  // =========================================================================
  removeImageBackground(imageObj, tolerance = 24, targetColor = null) {
    if (!imageObj) {
      imageObj = this.canvas.getActiveObject();
    }
    if (!imageObj || imageObj.type !== 'image') {
      return Promise.reject(new Error('Please select an image on the artboard first.'));
    }

    return new Promise((resolve) => {
      const imgEl = imageObj.getElement();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const width = imgEl.naturalWidth || imgEl.width;
      const height = imgEl.naturalHeight || imgEl.height;
      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(imgEl, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;

      // Detect background color from 4 corners if targetColor not provided
      let targetR = 255;
      let targetG = 255;
      let targetB = 255;

      if (targetColor) {
        // Parse hex
        const hex = targetColor.replace('#', '');
        targetR = parseInt(hex.substring(0, 2), 16) || 255;
        targetG = parseInt(hex.substring(2, 4), 16) || 255;
        targetB = parseInt(hex.substring(4, 6), 16) || 255;
      } else {
        // Sample corners (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
        const corners = [
          0,
          (width - 1) * 4,
          (height - 1) * width * 4,
          ((height - 1) * width + (width - 1)) * 4,
        ];
        let sumR = 0, sumG = 0, sumB = 0;
        corners.forEach((idx) => {
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
        });
        targetR = Math.round(sumR / 4);
        targetG = Math.round(sumG / 4);
        targetB = Math.round(sumB / 4);
      }

      const tolSq = tolerance * tolerance * 3;
      const featherSq = (tolerance * 1.6) * (tolerance * 1.6) * 3;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const diffR = r - targetR;
        const diffG = g - targetG;
        const diffB = b - targetB;
        const distSq = diffR * diffR + diffG * diffG + diffB * diffB;

        if (distSq <= tolSq) {
          data[i + 3] = 0; // Pure transparent
        } else if (distSq < featherSq) {
          // Feathered semi-transparent edge
          const factor = (distSq - tolSq) / (featherSq - tolSq);
          data[i + 3] = Math.round(data[i + 3] * factor);
        }
      }

      ctx.putImageData(imageData, 0, 0);
      const dataUrl = canvas.toDataURL('image/png');

      fabric.Image.fromURL(dataUrl, (newImg) => {
        newImg.set({
          left: imageObj.left,
          top: imageObj.top,
          originX: imageObj.originX,
          originY: imageObj.originY,
          scaleX: imageObj.scaleX,
          scaleY: imageObj.scaleY,
          angle: imageObj.angle,
          name: `${imageObj.name || 'Image'} (No BG)`,
        });

        const activeIndex = this.canvas.getObjects().indexOf(imageObj);
        this.canvas.remove(imageObj);
        this.canvas.insertAt(newImg, activeIndex);
        this.canvas.setActiveObject(newImg);
        this.canvas.renderAll();
        this.canvasManager.recordState();
        resolve(newImg);
      });
    });
  }

  // =========================================================================
  // 3. Element Gradient & Pattern Textures Engine
  // =========================================================================
  applyElementGradient(color1, color2, direction = 'horizontal') {
    const active = this.canvas.getActiveObject();
    if (!active) return false;

    const w = active.width || 200;
    const h = active.height || 200;

    let coords = { x1: 0, y1: 0, x2: w, y2: 0 }; // horizontal default
    if (direction === 'vertical') {
      coords = { x1: 0, y1: 0, x2: 0, y2: h };
    } else if (direction === 'diagonal') {
      coords = { x1: 0, y1: 0, x2: w, y2: h };
    } else if (direction === 'radial') {
      coords = { r1: 0, r2: Math.max(w, h) / 2, x1: w / 2, y1: h / 2, x2: w / 2, y2: h / 2 };
    }

    const grad = new fabric.Gradient({
      type: direction === 'radial' ? 'radial' : 'linear',
      gradientUnits: 'pixels',
      coords,
      colorStops: [
        { offset: 0, color: color1 },
        { offset: 1, color: color2 },
      ],
    });

    if (active.type === 'group') {
      active.forEachObject((obj) => {
        if (obj.type !== 'text' && obj.type !== 'i-text') obj.set('fill', grad);
      });
    } else {
      active.set('fill', grad);
    }

    this.canvas.renderAll();
    this.canvasManager.recordState();
    return true;
  }

  applyElementPattern(patternType) {
    const active = this.canvas.getActiveObject();
    if (!active) return false;

    const patternCanvas = document.createElement('canvas');
    const pctx = patternCanvas.getContext('2d');

    if (patternType === 'dots') {
      patternCanvas.width = 20;
      patternCanvas.height = 20;
      pctx.fillStyle = '#ffffff';
      pctx.fillRect(0, 0, 20, 20);
      pctx.fillStyle = '#64748b';
      pctx.beginPath();
      pctx.arc(10, 10, 2, 0, Math.PI * 2);
      pctx.fill();
    } else if (patternType === 'grid') {
      patternCanvas.width = 24;
      patternCanvas.height = 24;
      pctx.fillStyle = '#ffffff';
      pctx.fillRect(0, 0, 24, 24);
      pctx.strokeStyle = '#cbd5e1';
      pctx.lineWidth = 1;
      pctx.strokeRect(0, 0, 24, 24);
    } else if (patternType === 'stripes') {
      patternCanvas.width = 20;
      patternCanvas.height = 20;
      pctx.fillStyle = '#f8fafc';
      pctx.fillRect(0, 0, 20, 20);
      pctx.strokeStyle = '#94a3b8';
      pctx.lineWidth = 2;
      pctx.beginPath();
      pctx.moveTo(0, 20);
      pctx.lineTo(20, 0);
      pctx.stroke();
    } else if (patternType === 'noise') {
      patternCanvas.width = 40;
      patternCanvas.height = 40;
      pctx.fillStyle = '#f1f5f9';
      pctx.fillRect(0, 0, 40, 40);
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 40;
        const y = Math.random() * 40;
        const alpha = Math.random() * 0.15;
        pctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
        pctx.fillRect(x, y, 1, 1);
      }
    }

    const pattern = new fabric.Pattern({
      source: patternCanvas,
      repeat: 'repeat',
    });

    if (active.type === 'group') {
      active.forEachObject((obj) => obj.set('fill', pattern));
    } else {
      active.set('fill', pattern);
    }

    this.canvas.renderAll();
    this.canvasManager.recordState();
    return true;
  }

  // =========================================================================
  // 4. Advanced Shadow & Neon Glow Engine
  // =========================================================================
  applyShadow(config) {
    const active = this.canvas.getActiveObject();
    if (!active) return false;

    if (!config || config.type === 'none') {
      active.set('shadow', null);
      this.canvas.renderAll();
      this.canvasManager.recordState();
      return true;
    }

    const shadow = new fabric.Shadow({
      color: config.color || 'rgba(15, 23, 42, 0.16)',
      blur: parseInt(config.blur, 10) || 16,
      offsetX: parseInt(config.offsetX, 10) || 0,
      offsetY: parseInt(config.offsetY, 10) || 6,
    });

    active.set('shadow', shadow);
    this.canvas.renderAll();
    this.canvasManager.recordState();
    return true;
  }

  // =========================================================================
  // 5. Smart Artboard Quick-Resize with Proportional Content Scaling
  // =========================================================================
  quickResize(newWidth, newHeight, scaleContent = true) {
    const oldWidth = this.canvas.width;
    const oldHeight = this.canvas.height;

    this.canvasManager.setArtboardSize(newWidth, newHeight);

    if (scaleContent && oldWidth > 0 && oldHeight > 0) {
      const scaleX = newWidth / oldWidth;
      const scaleY = newHeight / oldHeight;
      const scale = Math.min(scaleX, scaleY);

      this.canvas.forEachObject((obj) => {
        obj.set({
          left: obj.left * scaleX,
          top: obj.top * scaleY,
          scaleX: obj.scaleX * scale,
          scaleY: obj.scaleY * scale,
        });
        obj.setCoords();
      });

      this.canvas.renderAll();
      this.canvasManager.recordState();
    }

    const badge = document.getElementById('canvas-dimensions-badge');
    if (badge) {
      badge.textContent = `${newWidth} × ${newHeight} px`;
    }
  }
}

window.AdvancedEffectsEngine = AdvancedEffectsEngine;
