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

  // Export as PNG
  exportPNG(options = {}) {
    const { transparent = false, multiplier = 2, filename = 'designpro-graphic.png' } = options;

    const originalBg = this.canvas.backgroundColor;
    if (transparent) {
      this.canvas.backgroundColor = null;
    }

    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      multiplier: multiplier,
      enableRetinaScaling: true,
    });

    if (transparent) {
      this.canvas.backgroundColor = originalBg;
      this.canvas.renderAll();
    }

    this.downloadFile(dataUrl, filename);
  }

  // Export as JPEG
  exportJPEG(options = {}) {
    const { quality = 0.92, multiplier = 2, filename = 'designpro-graphic.jpg' } = options;

    // JPEG requires solid background, fallback to white if none
    const originalBg = this.canvas.backgroundColor;
    if (!originalBg || originalBg === 'transparent') {
      this.canvas.backgroundColor = '#ffffff';
      this.canvas.renderAll();
    }

    const dataUrl = this.canvas.toDataURL({
      format: 'jpeg',
      quality: quality,
      multiplier: multiplier,
      enableRetinaScaling: true,
    });

    if (!originalBg || originalBg === 'transparent') {
      this.canvas.backgroundColor = originalBg;
      this.canvas.renderAll();
    }

    this.downloadFile(dataUrl, filename);
  }

  // Export as SVG
  exportSVG(filename = 'designpro-vector.svg') {
    const svgContent = this.canvas.toSVG({
      width: this.canvas.width,
      height: this.canvas.height,
    });

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    this.downloadFile(url, filename);
    URL.revokeObjectURL(url);
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
    const dataUrl = this.canvas.toDataURL({
      format: 'png',
      multiplier: 2,
    });

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
