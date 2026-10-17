/**
 * PhotoCraft Studio & FilmCraft Cinematic Grading Engine for DesignPro
 * Inspired by:
 * - PhotoCraft (open-source Photoshop reimplementation): Pro adjustments, vibrance, exposure, temperature, blend modes
 * - FilmCraft (open-source Premiere Pro reimplementation): Cinematic Lumetri-style color grading LUTs
 */

class PhotoCraftStudio {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;

    // Default adjustments state
    this.defaultAdjustments = {
      brightness: 0,     // -1 to 1
      contrast: 0,       // -1 to 1
      saturation: 0,     // -1 to 1
      vibrance: 0,       // -1 to 1
      exposure: 0,       // -1 to 1
      warmth: 0,         // -1 to 1 (Temperature)
      tint: 0,           // -1 to 1
      sharpen: 0,        // 0 to 1
      blur: 0,           // 0 to 1
      lut: 'none'
    };
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  // Get active image object on canvas
  getActiveImage() {
    const active = this.canvas.getActiveObject();
    if (active && active.type === 'image') {
      return active;
    }
    return null;
  }

  // Ensure image has adjustments data
  ensureAdjustments(img) {
    if (!img._adjustments) {
      img._adjustments = Object.assign({}, this.defaultAdjustments);
    }
    return img._adjustments;
  }

  // Set single adjustment value and re-render
  setAdjustment(key, value) {
    const img = this.getActiveImage();
    if (!img) return;

    const adj = this.ensureAdjustments(img);
    adj[key] = parseFloat(value);
    this.applyAllAdjustments(img);
  }

  // Reset all adjustments for active image
  resetAdjustments() {
    const img = this.getActiveImage();
    if (!img) return;

    img._adjustments = Object.assign({}, this.defaultAdjustments);
    img.filters = [];
    img.applyFilters();
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // Apply all adjustments and LUT in pipeline
  applyAllAdjustments(img) {
    if (!img) img = this.getActiveImage();
    if (!img || img.type !== 'image') return;

    const adj = this.ensureAdjustments(img);
    const filters = [];

    // 1. Exposure & Brightness
    const netBrightness = Math.max(-1, Math.min(1, adj.brightness + (adj.exposure * 0.5)));
    if (netBrightness !== 0) {
      filters.push(new fabric.Image.filters.Brightness({ brightness: netBrightness }));
    }

    // 2. Contrast
    if (adj.contrast !== 0) {
      filters.push(new fabric.Image.filters.Contrast({ contrast: adj.contrast }));
    }

    // 3. Saturation & Vibrance
    const netSaturation = Math.max(-1, Math.min(1, adj.saturation + (adj.vibrance * 0.6)));
    if (netSaturation !== 0) {
      filters.push(new fabric.Image.filters.Saturation({ saturation: netSaturation }));
    }

    // 4. Blur
    if (adj.blur > 0) {
      filters.push(new fabric.Image.filters.Blur({ blur: adj.blur * 0.5 }));
    }

    // 5. Temperature (Warmth) & Tint via ColorMatrix
    if (adj.warmth !== 0 || adj.tint !== 0) {
      const w = adj.warmth * 0.25;
      const t = adj.tint * 0.2;
      // [R, G, B, A, offset]
      const matrix = [
        1 + w,       0,           0,       0, 0,
        0,           1,           0,       0, 0,
        0,           0,           1 - w,   0, 0,
        0,           0,           0,       1, 0
      ];
      // Apply tint (green-magenta)
      matrix[6] += t * 0.5; // green
      matrix[0] -= t * 0.25; // red
      matrix[12] -= t * 0.25; // blue

      filters.push(new fabric.Image.filters.ColorMatrix({ matrix: matrix }));
    }

    // 6. FilmCraft Cinematic LUT Color Grading
    if (adj.lut && adj.lut !== 'none') {
      const lutFilter = this.createLUTFilter(adj.lut);
      if (lutFilter) {
        filters.push(lutFilter);
      }
    }

    img.filters = filters;
    img.applyFilters();
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // FilmCraft Cinematic LUT Presets
  createLUTFilter(lutName) {
    let matrix = null;

    switch (lutName) {
      case 'teal-orange':
        // Hollywood Blockbuster: Cool teal shadows, warm glowing orange skin/highlights
        matrix = [
          1.2,  -0.05, -0.05, 0, 0.05,
          -0.05, 1.05,  0.0,  0, 0.0,
          -0.15, -0.1,  1.3,  0, 0.1,
          0,     0,     0,    1, 0
        ];
        break;

      case 'portra-400':
        // Kodak Portra 400: Warm organic analog film, creamy midtones, mild highlight roll-off
        matrix = [
          1.12,  0.02, -0.02, 0, 0.04,
          0.02,  1.06,  0.01, 0, 0.02,
          -0.04, 0.01,  0.92, 0, -0.02,
          0,     0,     0,    1, 0
        ];
        break;

      case 'fuji-velvia':
        // Fuji Chrome Velvia: Rich deep greens, vivid cobalt blues, punchy contrast
        matrix = [
          1.15, -0.08, -0.02, 0, -0.02,
          -0.05, 1.25, -0.05, 0, 0.01,
          -0.02, -0.05, 1.30, 0, 0.02,
          0,     0,     0,    1, 0
        ];
        break;

      case 'bleach-bypass':
        // Bleach Bypass: Desaturated, high silver contrast, cinematic grit
        matrix = [
          0.85, 0.25, 0.10, 0, 0.05,
          0.20, 0.85, 0.15, 0, 0.05,
          0.20, 0.20, 0.80, 0, 0.05,
          0,    0,    0,    1, 0
        ];
        break;

      case 'nordic-noir':
        // Nordic Noir: Muted desaturated palette, cold cyan undertone, dramatic mood
        matrix = [
          0.85, 0.05, 0.05, 0, -0.05,
          0.05, 0.95, 0.10, 0, -0.02,
          0.10, 0.15, 1.25, 0, 0.08,
          0,    0,    0,    1, 0
        ];
        break;

      case 'golden-hour':
        // Sunset Golden Radiance: Rich amber, radiant warm glow
        matrix = [
          1.28, 0.05, -0.10, 0, 0.08,
          0.05, 1.12, -0.05, 0, 0.04,
          -0.12, -0.05, 0.82, 0, -0.04,
          0,    0,     0,    1, 0
        ];
        break;

      default:
        return null;
    }

    return new fabric.Image.filters.ColorMatrix({ matrix: matrix });
  }

  // Apply FilmCraft LUT directly
  applyCinematicLUT(lutName) {
    const img = this.getActiveImage();
    if (!img) {
      if (window.showToast) window.showToast('Please select a photo on the artboard first.', 'info');
      return;
    }

    const adj = this.ensureAdjustments(img);
    adj.lut = lutName;
    this.applyAllAdjustments(img);

    const lutTitles = {
      'none': 'Natural / Reset',
      'teal-orange': 'Teal & Orange',
      'portra-400': 'Kodak Portra 400',
      'fuji-velvia': 'Fuji Velvia Chrome',
      'bleach-bypass': 'Bleach Bypass',
      'nordic-noir': 'Nordic Noir',
      'golden-hour': 'Golden Hour Glow'
    };

    if (window.showToast) {
      window.showToast(`Applied LUT: ${lutTitles[lutName] || lutName}`, 'success');
    }
  }

  // =========================================================================
  // Layer Styles & Blend Modes (PhotoCraft & Photoshop standard)
  // =========================================================================
  setBlendMode(mode) {
    const active = this.canvas.getActiveObject();
    if (!active) {
      if (window.showToast) window.showToast('Select an element or image to change blend mode.', 'info');
      return;
    }

    active.set('globalCompositeOperation', mode);
    this.canvas.renderAll();
    this.canvasManager.recordState();

    if (window.showToast) {
      window.showToast(`Blend mode: ${mode}`, 'info');
    }
  }

  // Apply Stroke / Outline to active image or element
  setElementStroke(color, width) {
    const active = this.canvas.getActiveObject();
    if (!active) return;

    active.set({
      stroke: color,
      strokeWidth: parseInt(width, 10) || 0
    });

    this.canvas.renderAll();
    this.canvasManager.recordState();
  }
}

window.PhotoCraftStudio = PhotoCraftStudio;
