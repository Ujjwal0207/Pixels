/**
 * EffectCraft Visual Effects & Texture Overlays for DesignPro
 * Inspired by:
 * - EffectCraft (open-source After Effects reimplementation): Motion graphics, visual textures, noise, lens flares, and particle overlays
 */

class EffectCraftOverlays {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  getArtboardDimensions() {
    const width = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const height = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));
    return { width, height };
  }

  // =========================================================================
  // 1. Procedural 35mm Film Grain Texture Overlay
  // =========================================================================
  addFilmGrainOverlay(intensity = 0.18) {
    const { width: w, height: h } = this.getArtboardDimensions();

    // Generate procedural noise canvas
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 320;
    noiseCanvas.height = 320;
    const ctx = noiseCanvas.getContext('2d');
    const imgData = ctx.createImageData(320, 320);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const val = Math.floor(Math.random() * 255);
      data[i] = val;     // R
      data[i + 1] = val; // G
      data[i + 2] = val; // B
      data[i + 3] = 255; // A
    }
    ctx.putImageData(imgData, 0, 0);

    const dataUrl = noiseCanvas.toDataURL();
    fabric.Image.fromURL(dataUrl, (img) => {
      img.set({
        left: 0,
        top: 0,
        scaleX: w / 320,
        scaleY: h / 320,
        opacity: intensity,
        selectable: true,
        evented: true,
        name: '35mm Film Grain Overlay',
        globalCompositeOperation: 'overlay',
      });

      this.canvas.add(img);
      this.canvas.bringToFront(img);
      this.canvas.setActiveObject(img);
      this.canvas.renderAll();
      this.canvasManager.recordState();

      if (window.showToast) {
        window.showToast('Added 35mm Film Grain Overlay!', 'success');
      }
    });
  }

  // =========================================================================
  // 2. Cinematic Light Leak & Solar Flare Overlay
  // =========================================================================
  addLightLeakOverlay() {
    const { width: w, height: h } = this.getArtboardDimensions();

    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: w,
      height: h,
      opacity: 0.45,
      globalCompositeOperation: 'screen',
      selectable: true,
      evented: true,
      name: 'Cinematic Light Leak',
    });

    // Prismatic Warm Diagonal Gradient
    rect.set('fill', new fabric.Gradient({
      type: 'linear',
      coords: { x1: 0, y1: 0, x2: w, y2: h },
      colorStops: [
        { offset: 0, color: 'rgba(255, 110, 50, 0.95)' },
        { offset: 0.35, color: 'rgba(255, 200, 80, 0.65)' },
        { offset: 0.6, color: 'rgba(255, 60, 120, 0.35)' },
        { offset: 0.85, color: 'rgba(90, 40, 220, 0.2)' },
        { offset: 1, color: 'rgba(0, 0, 0, 0)' }
      ]
    }));

    this.canvas.add(rect);
    this.canvas.bringToFront(rect);
    this.canvas.setActiveObject(rect);
    this.canvas.renderAll();
    this.canvasManager.recordState();

    if (window.showToast) {
      window.showToast('Added Cinematic Light Leak overlay!', 'success');
    }
  }

  // =========================================================================
  // 3. Starlight Sparkle / Luxury Glimmer Burst
  // =========================================================================
  addStarlightSparkle(x, y, size = 120, color = '#fef08a') {
    const { width: w, height: h } = this.getArtboardDimensions();
    const cx = x !== undefined ? x : w / 2;
    const cy = y !== undefined ? y : h / 2;

    // SVG 4-point diamond sparkle star
    const pathD = `M 0,-${size / 2} Q 0,0 ${size / 2},0 Q 0,0 0,${size / 2} Q 0,0 -${size / 2},0 Q 0,0 0,-${size / 2} Z`;
    const star = new fabric.Path(pathD, {
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      fill: color,
      shadow: new fabric.Shadow({
        color: 'rgba(254, 240, 138, 0.9)',
        blur: 24,
        offsetX: 0,
        offsetY: 0
      }),
      name: 'Starlight Sparkle',
      globalCompositeOperation: 'screen'
    });

    this.canvas.add(star);
    this.canvas.setActiveObject(star);
    this.canvas.renderAll();
    this.canvasManager.recordState();

    if (window.showToast) {
      window.showToast('Added Starlight Sparkle element!', 'success');
    }
  }

  // =========================================================================
  // 4. Vintage Comic Halftone Dot Screen Overlay
  // =========================================================================
  addHalftoneOverlay(intensity = 0.22) {
    const { width: w, height: h } = this.getArtboardDimensions();
    const patternCanvas = document.createElement('canvas');
    patternCanvas.width = 24;
    patternCanvas.height = 24;
    const ctx = patternCanvas.getContext('2d');

    // Draw repeating dot
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(12, 12, 5, 0, Math.PI * 2);
    ctx.fill();

    const pattern = new fabric.Pattern({
      source: patternCanvas,
      repeat: 'repeat'
    });

    const rect = new fabric.Rect({
      left: 0,
      top: 0,
      width: w,
      height: h,
      fill: pattern,
      opacity: intensity,
      globalCompositeOperation: 'multiply',
      selectable: true,
      name: 'Vintage Halftone Dot Screen'
    });

    this.canvas.add(rect);
    this.canvas.bringToFront(rect);
    this.canvas.setActiveObject(rect);
    this.canvas.renderAll();
    this.canvasManager.recordState();

    if (window.showToast) {
      window.showToast('Added Vintage Halftone Dot Screen!', 'success');
    }
  }

  // =========================================================================
  // 5. Prism RGB Glitch Slice
  // =========================================================================
  addPrismGlitchBar() {
    const { width: artW, height: artH } = this.getArtboardDimensions();
    const cx = artW / 2;
    const cy = artH / 2;
    const w = artW * 0.7;

    const group = new fabric.Group([], {
      left: cx,
      top: cy,
      originX: 'center',
      originY: 'center',
      name: 'Prism Glitch Slice'
    });

    // Cyan strip
    const stripCyan = new fabric.Rect({
      left: -w / 2 - 8,
      top: -15,
      width: w,
      height: 30,
      fill: 'rgba(6, 182, 212, 0.75)',
      globalCompositeOperation: 'screen'
    });

    // Red strip
    const stripRed = new fabric.Rect({
      left: -w / 2 + 8,
      top: -15,
      width: w,
      height: 30,
      fill: 'rgba(239, 68, 68, 0.75)',
      globalCompositeOperation: 'screen'
    });

    group.addWithUpdate(stripCyan);
    group.addWithUpdate(stripRed);

    this.canvas.add(group);
    this.canvas.setActiveObject(group);
    this.canvas.renderAll();
    this.canvasManager.recordState();

    if (window.showToast) {
      window.showToast('Added Prism Glitch Slice!', 'success');
    }
  }
}

window.EffectCraftOverlays = EffectCraftOverlays;
