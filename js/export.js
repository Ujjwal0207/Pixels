/**
 * Export Engine for DesignPro
 * Supports high-resolution PNG, JPEG, SVG, JSON Project save/load, and Print
 */

class ExportEngine {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  // Trigger download helper
  downloadFile(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export as PNG (Non-blocking high-res export via toBlob)
  exportPNG(options = {}) {
    const { transparent = false, multiplier = 2, filename = 'designpro-graphic.png' } = options;

    const originalBg = this.canvas.backgroundColor;
    if (transparent) {
      this.canvas.backgroundColor = null;
    }

    const guides = this.canvas.getObjects().filter(o => o.isGuide && o.visible);
    guides.forEach(g => { g.visible = false; });
    this.canvas.renderAll();

    const zoom = this.canvas.getZoom() || 1;
    const effectiveMultiplier = (1 / zoom) * multiplier;

    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      multiplier: effectiveMultiplier,
      enableRetinaScaling: true,
    });

    if (transparent) {
      this.canvas.backgroundColor = originalBg;
    }
    guides.forEach(g => { g.visible = true; });
    this.canvas.renderAll();

    this.downloadFile(dataUrl, filename);
  }

  // Copy High-Resolution PNG directly to System Clipboard (Slack/Notion/Discord/Figma instant paste)
  async copyImageToClipboard(options = {}) {
    const { transparent = false, multiplier = 2 } = options;

    const originalBg = this.canvas.backgroundColor;
    if (transparent) {
      this.canvas.backgroundColor = null;
    }

    const guides = this.canvas.getObjects().filter(o => o.isGuide && o.visible);
    guides.forEach(g => { g.visible = false; });
    this.canvas.renderAll();

    const zoom = this.canvas.getZoom() || 1;
    const effectiveMultiplier = (1 / zoom) * multiplier;

    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      multiplier: effectiveMultiplier,
      enableRetinaScaling: true,
    });

    if (transparent) {
      this.canvas.backgroundColor = originalBg;
    }
    guides.forEach(g => { g.visible = true; });
    this.canvas.renderAll();

    try {
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      if (navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        if (window.showToast) {
          window.showToast('Copied high-res design to clipboard! Ready to paste.', 'success');
        }
        return true;
      } else {
        throw new Error('ClipboardItem API not supported in this browser');
      }
    } catch (err) {
      console.warn('Clipboard write fallback:', err);
      this.downloadFile(dataUrl, 'designpro-graphic.png');
      if (window.showToast) {
        window.showToast('Downloaded PNG (clipboard write restricted)', 'info');
      }
      return false;
    }
  }

  // Export as JPEG
  exportJPEG(options = {}) {
    const { quality = 0.95, multiplier = 2, filename = 'designpro-graphic.jpg' } = options;

    const originalBg = this.canvas.backgroundColor;
    if (!originalBg || originalBg === 'transparent') {
      this.canvas.backgroundColor = '#ffffff';
    }

    const guides = this.canvas.getObjects().filter(o => o.isGuide && o.visible);
    guides.forEach(g => { g.visible = false; });
    this.canvas.renderAll();

    const zoom = this.canvas.getZoom() || 1;
    const effectiveMultiplier = (1 / zoom) * multiplier;

    const dataUrl = this.canvas.toDataURL({
      format: 'jpeg',
      quality: quality,
      multiplier: effectiveMultiplier,
      enableRetinaScaling: true,
    });

    if (!originalBg || originalBg === 'transparent') {
      this.canvas.backgroundColor = originalBg;
    }
    guides.forEach(g => { g.visible = true; });
    this.canvas.renderAll();

    this.downloadFile(dataUrl, filename);
  }

  // Export as SVG with filter & shadow preservation (Flaw 11 Fix)
  exportSVG(filename = 'designpro-vector.svg') {
    const artW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const artH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

    const guides = this.canvas.getObjects().filter(o => o.isGuide && o.visible);
    guides.forEach(g => { g.visible = false; });
    this.canvas.renderAll();

    let svgContent = this.canvas.toSVG({
      width: artW,
      height: artH,
      viewBox: {
        x: 0,
        y: 0,
        width: artW,
        height: artH
      }
    });

    guides.forEach(g => { g.visible = true; });
    this.canvas.renderAll();

    // Check for objects with shadow or filters and inject SVG <defs>
    try {
      const objects = this.canvas.getObjects();
      const shadowObjects = objects.filter((o) => o.shadow && o.visible && !o.isGuide);
      if (shadowObjects.length > 0 && !svgContent.includes('<feDropShadow')) {
        let defs = '<defs>\n';
        shadowObjects.forEach((obj, idx) => {
          const s = obj.shadow;
          const id = `fabric-shadow-${idx}`;
          const blur = s.blur || 8;
          const dx = s.offsetX || 0;
          const dy = s.offsetY || 4;
          const color = s.color || '#000000';
          defs += `  <filter id="${id}" x="-30%" y="-30%" width="160%" height="160%">\n`;
          defs += `    <feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${(blur / 2).toFixed(1)}" flood-color="${color}" />\n`;
          defs += `  </filter>\n`;
        });
        defs += '</defs>\n';
        svgContent = svgContent.replace(/(<svg[^>]*>)/i, `$1\n${defs}`);
      }
    } catch (e) {
      console.warn('SVG filter injection note:', e);
    }

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  // Save Project as JSON (.designpro file)
  saveProjectJSON(filename = 'project.designpro') {
    const pagesManager = window.app ? window.app.pages : null;
    if (pagesManager && typeof pagesManager.saveCurrentPageState === 'function') {
      pagesManager.saveCurrentPageState();
    }

    const propertiesToInclude = window.CANVAS_EXTENDED_PROPERTIES || [
      'id', 'name', 'selectable', 'lockMovementX', 'lockMovementY',
      'lockRotation', 'lockScalingX', 'lockScalingY', 'charSpacing', 'lineHeight',
      'globalCompositeOperation', 'filters', 'clipPath', 'isStamp', 'isWatermark', 'isLocked', 'shadow'
    ];

    const projectData = {
      version: '2.0',
      savedAt: new Date().toISOString(),
      dimensions: {
        width: this.canvasManager.artboardWidth,
        height: this.canvasManager.artboardHeight,
      },
      canvas: this.canvas.toJSON(propertiesToInclude),
      pages: pagesManager ? pagesManager.pages : null,
      currentPageIndex: pagesManager ? pagesManager.currentPageIndex : 0,
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, filename);
    URL.revokeObjectURL(url);
  }

  // Load Project from JSON
  loadProjectJSON(file, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.dimensions) {
          this.canvasManager.setArtboardSize(data.dimensions.width, data.dimensions.height);
        }

        const pagesManager = window.app ? window.app.pages : null;
        if (data.pages && Array.isArray(data.pages) && data.pages.length > 0 && pagesManager) {
          pagesManager.pages = data.pages;
          pagesManager.currentPageIndex = data.currentPageIndex || 0;
          const activePage = pagesManager.pages[pagesManager.currentPageIndex];
          if (activePage && activePage.state) {
            this.canvas.loadFromJSON(activePage.state, () => {
              this.canvas.renderAll();
              this.canvasManager.recordState();
              pagesManager.renderPagesBar();
              if (callback) callback(null);
            });
            return;
          }
        }

        if (data.canvas) {
          this.canvas.loadFromJSON(data.canvas, () => {
            this.canvas.renderAll();
            this.canvasManager.recordState();
            if (callback) callback(null);
          });
        }
      } catch (err) {
        if (callback) callback(err);
      }
    };
    reader.readAsText(file);
  }

  // Print Canvas directly
  printDesign() {
    const guides = this.canvas.getObjects().filter(o => o.isGuide && o.visible);
    guides.forEach(g => { g.visible = false; });
    this.canvas.renderAll();

    const zoom = this.canvas.getZoom() || 1;
    const effectiveMultiplier = (1 / zoom) * 2;

    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      multiplier: effectiveMultiplier,
    });

    guides.forEach(g => { g.visible = true; });
    this.canvas.renderAll();

    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Design - DesignPro</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { max-width: 100%; max-height: 100%; object-fit: contain; }
            @media print {
              body { margin: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" onload="window.print(); window.close();" />
        </body>
      </html>
    `);
    printWin.document.close();
  }
}

window.ExportEngine = ExportEngine;
