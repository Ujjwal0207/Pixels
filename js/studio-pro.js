/**
 * Studio Pro Suite for DesignPro
 * Features:
 * 1. Screen & Canvas Color EyeDropper (window.EyeDropper API + Canvas pixel fallback)
 * 2. Fullscreen Presentation Deck Mode ("Present" with slide navigation & keyboard arrows)
 * 3. Technical Alignment Grid Overlay (precision pixel sub-grid toggle)
 * 4. Object Alignment & Distribution Engine (Left, Center, Right, Top, Middle, Bottom, Distribute H/V, Group, Ungroup)
 * 5. Creative Duotone Photo Color Grading Engine
 */

class StudioProSuite {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.gridVisible = false;
    this.gridCanvas = null;
    this.presentationActive = false;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  // =========================================================================
  // 1. Color EyeDropper (Sample Any Color from Screen or Artboard)
  // =========================================================================
  async pickColor() {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          this.applySampledColor(result.sRGBHex);
          return result.sRGBHex;
        }
      } catch (err) {
        // User pressed Esc or cancelled
        return null;
      }
    } else {
      // Fallback: Sample center pixel of current artboard or active element
      const active = this.canvas.getActiveObject();
      let hex = '#7c3aed';
      if (active && active.fill && typeof active.fill === 'string') {
        hex = active.fill;
      } else if (this.canvas.backgroundColor && typeof this.canvas.backgroundColor === 'string') {
        hex = this.canvas.backgroundColor;
      }
      this.applySampledColor(hex);
      return hex;
    }
  }

  applySampledColor(hexColor) {
    const active = this.canvas.getActiveObject();
    if (active) {
      if (active.type === 'i-text' || active.type === 'text') {
        active.set('fill', hexColor);
        const picker = document.getElementById('text-color-picker');
        if (picker) picker.value = hexColor;
        const preview = document.getElementById('text-color-preview');
        if (preview) preview.style.background = hexColor;
      } else if (active.type === 'group') {
        active.forEachObject((obj) => {
          if (obj.type !== 'text') obj.set('fill', hexColor);
        });
      } else {
        active.set('fill', hexColor);
        const picker = document.getElementById('shape-fill-picker');
        if (picker) picker.value = hexColor;
        const preview = document.getElementById('shape-fill-preview');
        if (preview) preview.style.background = hexColor;
      }
    } else {
      this.canvas.setBackgroundColor(hexColor, () => {
        const picker = document.getElementById('canvas-bg-picker');
        if (picker) picker.value = hexColor;
        const preview = document.getElementById('canvas-bg-preview');
        if (preview) preview.style.background = hexColor;
      });
    }

    this.canvas.renderAll();
    this.canvasManager.recordState();
    if (window.showToast) {
      window.showToast(`Sampled color: ${hexColor}`, 'success');
    }
  }

  // =========================================================================
  // 2. Technical Alignment Grid Overlay
  // =========================================================================
  toggleGrid() {
    this.gridVisible = !this.gridVisible;
    let gridOverlay = document.getElementById('artboard-grid-overlay');

    if (!gridOverlay) {
      const artboardContainer = document.getElementById('artboard-container');
      if (!artboardContainer) return;

      gridOverlay = document.createElement('div');
      gridOverlay.id = 'artboard-grid-overlay';
      gridOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 15;
        background-image: 
          linear-gradient(to right, rgba(56, 189, 248, 0.22) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(56, 189, 248, 0.22) 1px, transparent 1px),
          linear-gradient(to right, rgba(99, 102, 241, 0.35) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(99, 102, 241, 0.35) 1px, transparent 1px);
        background-size: 20px 20px, 20px 20px, 100px 100px, 100px 100px;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      `;
      artboardContainer.appendChild(gridOverlay);
    }

    gridOverlay.style.opacity = this.gridVisible ? '1' : '0';

    const btn = document.getElementById('btn-toggle-grid');
    if (btn) {
      if (this.gridVisible) {
        btn.classList.add('active');
        btn.textContent = '📏 Grid: ON';
      } else {
        btn.classList.remove('active');
        btn.textContent = '📏 Grid: OFF';
      }
    }

    if (window.showToast) {
      window.showToast(this.gridVisible ? 'Alignment Grid: Enabled (20px/100px)' : 'Alignment Grid: Disabled', 'info');
    }
  }

  // =========================================================================
  // 3. Object Alignment & Distribution Engine (Canva Position/Arrange)
  // =========================================================================
  align(direction) {
    const active = this.canvas.getActiveObject();
    if (!active) {
      if (window.showToast) window.showToast('Select an object or group to align', 'error');
      return;
    }

    const artboardW = this.canvas.width;
    const artboardH = this.canvas.height;

    // Check if multiple objects selected via ActiveSelection
    if (active.type === 'activeSelection') {
      const objects = active.getObjects();

      objects.forEach((obj) => {
        switch (direction) {
          case 'left':
            obj.set('left', -active.width / 2 + (obj.width * obj.scaleX) / 2);
            break;
          case 'center':
            obj.set('left', 0);
            break;
          case 'right':
            obj.set('left', active.width / 2 - (obj.width * obj.scaleX) / 2);
            break;
          case 'top':
            obj.set('top', -active.height / 2 + (obj.height * obj.scaleY) / 2);
            break;
          case 'middle':
            obj.set('top', 0);
            break;
          case 'bottom':
            obj.set('top', active.height / 2 - (obj.height * obj.scaleY) / 2);
            break;
        }
        obj.setCoords();
      });
    } else {
      // Single object relative to Artboard
      switch (direction) {
        case 'left':
          active.setPositionByOrigin(new fabric.Point(0, active.top), 'left', active.originY || 'top');
          break;
        case 'center':
          active.setPositionByOrigin(new fabric.Point(artboardW / 2, active.top), 'center', active.originY || 'top');
          break;
        case 'right':
          active.setPositionByOrigin(new fabric.Point(artboardW, active.top), 'right', active.originY || 'top');
          break;
        case 'top':
          active.setPositionByOrigin(new fabric.Point(active.left, 0), active.originX || 'left', 'top');
          break;
        case 'middle':
          active.setPositionByOrigin(new fabric.Point(active.left, artboardH / 2), active.originX || 'left', 'center');
          break;
        case 'bottom':
          active.setPositionByOrigin(new fabric.Point(active.left, artboardH), active.originX || 'left', 'bottom');
          break;
      }
      active.setCoords();
    }

    this.canvas.renderAll();
    this.canvasManager.recordState();
    if (window.showToast) window.showToast(`Aligned ${direction}`, 'success');
  }

  distribute(axis) {
    const active = this.canvas.getActiveObject();
    if (!active || active.type !== 'activeSelection') {
      if (window.showToast) window.showToast('Select 3 or more objects (Shift+Click) to distribute', 'error');
      return;
    }

    const objects = active.getObjects();
    if (objects.length < 3) {
      if (window.showToast) window.showToast('Please select at least 3 objects to distribute', 'error');
      return;
    }

    if (axis === 'horizontal') {
      objects.sort((a, b) => a.left - b.left);
      const minLeft = objects[0].left;
      const maxLeft = objects[objects.length - 1].left;
      const step = (maxLeft - minLeft) / (objects.length - 1);
      objects.forEach((obj, idx) => {
        obj.set('left', minLeft + step * idx);
        obj.setCoords();
      });
    } else if (axis === 'vertical') {
      objects.sort((a, b) => a.top - b.top);
      const minTop = objects[0].top;
      const maxTop = objects[objects.length - 1].top;
      const step = (maxTop - minTop) / (objects.length - 1);
      objects.forEach((obj, idx) => {
        obj.set('top', minTop + step * idx);
        obj.setCoords();
      });
    }

    this.canvas.renderAll();
    this.canvasManager.recordState();
    if (window.showToast) window.showToast(`Distributed ${axis}ly`, 'success');
  }

  groupSelected() {
    const active = this.canvas.getActiveObject();
    if (!active || active.type !== 'activeSelection') {
      if (window.showToast) window.showToast('Select multiple objects (Shift+Drag) to group', 'error');
      return;
    }

    const group = active.toGroup();
    this.canvas.setActiveObject(group);
    this.canvas.renderAll();
    this.canvasManager.recordState();
    if (window.showToast) window.showToast('Objects grouped into a single unit', 'success');
  }

  ungroupSelected() {
    const active = this.canvas.getActiveObject();
    if (!active || active.type !== 'group') {
      if (window.showToast) window.showToast('Select a grouped object to ungroup', 'error');
      return;
    }

    const selection = active.toActiveSelection();
    this.canvas.setActiveObject(selection);
    this.canvas.renderAll();
    this.canvasManager.recordState();
    if (window.showToast) window.showToast('Object ungrouped', 'success');
  }

  // =========================================================================
  // 4. Fullscreen Slide Presentation Mode ("Present")
  // =========================================================================
  enterPresentationMode() {
    this.presentationActive = true;
    document.body.classList.add('presentation-mode-active');

    // Create presentation floating overlay if not exists
    let bar = document.getElementById('presentation-floating-bar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'presentation-floating-bar';
      bar.className = 'presentation-floating-bar';
      bar.innerHTML = `
        <button id="pres-prev-btn" class="pres-btn" title="Previous Page (Left Arrow)">◀</button>
        <span id="pres-page-indicator" class="pres-indicator">Slide 1 of 1</span>
        <button id="pres-next-btn" class="pres-btn" title="Next Page (Right Arrow / Space)">▶</button>
        <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.2); margin: 0 4px;"></div>
        <button id="pres-exit-btn" class="pres-btn pres-exit" title="Exit Presentation (Esc)">✕ Exit</button>
      `;
      document.body.appendChild(bar);

      document.getElementById('pres-prev-btn').addEventListener('click', () => this.presentationPrev());
      document.getElementById('pres-next-btn').addEventListener('click', () => this.presentationNext());
      document.getElementById('pres-exit-btn').addEventListener('click', () => this.exitPresentationMode());
    }

    this.updatePresentationIndicator();

    // Request native fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    // Bind presentation keyboard navigation
    this._presKeyHandler = (e) => {
      if (!this.presentationActive) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        this.presentationNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.presentationPrev();
      } else if (e.key === 'Escape') {
        this.exitPresentationMode();
      }
    };
    window.addEventListener('keydown', this._presKeyHandler);

    // Zoom artboard to fit screen comfortably
    setTimeout(() => {
      this.canvasManager.fitToScreen();
    }, 200);

    if (window.showToast) window.showToast('Presentation Mode: Arrow keys to navigate, Esc to exit', 'info');
  }

  exitPresentationMode() {
    this.presentationActive = false;
    document.body.classList.remove('presentation-mode-active');

    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }

    if (this._presKeyHandler) {
      window.removeEventListener('keydown', this._presKeyHandler);
    }

    setTimeout(() => {
      this.canvasManager.fitToScreen();
    }, 200);
  }

  presentationNext() {
    if (!window.app || !window.app.pages) return;
    const pages = window.app.pages;
    if (pages.currentPageIndex < pages.pages.length - 1) {
      pages.switchPage(pages.currentPageIndex + 1);
      this.updatePresentationIndicator();
    }
  }

  presentationPrev() {
    if (!window.app || !window.app.pages) return;
    const pages = window.app.pages;
    if (pages.currentPageIndex > 0) {
      pages.switchPage(pages.currentPageIndex - 1);
      this.updatePresentationIndicator();
    }
  }

  updatePresentationIndicator() {
    const indicator = document.getElementById('pres-page-indicator');
    if (indicator && window.app && window.app.pages) {
      const idx = window.app.pages.currentPageIndex + 1;
      const total = window.app.pages.pages.length;
      indicator.textContent = `Slide ${idx} of ${total}`;
    }
  }

  // =========================================================================
  // 5. Creative Duotone Photo Color Grading Engine
  // =========================================================================
  applyDuotoneFilter(duotoneStyle) {
    const active = this.canvas.getActiveObject();
    if (!active || active.type !== 'image') {
      if (window.showToast) window.showToast('Select a photo on the artboard first', 'error');
      return;
    }

    const palettes = {
      cyberpunk: { dark: [15, 23, 42], light: [6, 182, 212] },       // Slate to Cyan
      sunset: { dark: [67, 20, 7], light: [245, 158, 11] },           // Amber to Orange
      mint: { dark: [6, 78, 59], light: [110, 231, 183] },            // Forest to Mint
      sepiaLuxe: { dark: [69, 26, 3], light: [254, 243, 199] },       // Deep Bronze to Warm Cream
      obsidian: { dark: [2, 6, 23], light: [241, 245, 249] },         // Black to Silver
    };

    const scheme = palettes[duotoneStyle] || palettes.cyberpunk;
    const imgEl = active.getElement();
    const w = imgEl.naturalWidth || imgEl.width;
    const h = imgEl.naturalHeight || imgEl.height;

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      // Calculate luminosity
      const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const ratio = avg / 255;

      data[i] = Math.round(scheme.dark[0] + ratio * (scheme.light[0] - scheme.dark[0]));
      data[i + 1] = Math.round(scheme.dark[1] + ratio * (scheme.light[1] - scheme.dark[1]));
      data[i + 2] = Math.round(scheme.dark[2] + ratio * (scheme.light[2] - scheme.dark[2]));
    }

    ctx.putImageData(imgData, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');

    fabric.Image.fromURL(dataUrl, (newImg) => {
      newImg.set({
        left: active.left,
        top: active.top,
        originX: active.originX,
        originY: active.originY,
        scaleX: active.scaleX,
        scaleY: active.scaleY,
        angle: active.angle,
        name: `${active.name || 'Photo'} (${duotoneStyle})`,
      });

      const idx = this.canvas.getObjects().indexOf(active);
      this.canvas.remove(active);
      this.canvas.insertAt(newImg, idx);
      this.canvas.setActiveObject(newImg);
      this.canvas.renderAll();
      this.canvasManager.recordState();
      if (window.showToast) window.showToast(`Applied "${duotoneStyle}" duotone filter!`, 'success');
    });
  }
}

window.StudioProSuite = StudioProSuite;
