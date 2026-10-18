/**
 * PDFCraft Document Tools & Proofing Suite for DesignPro
 * Inspired by:
 * - PDFCraft (privacy-first client-side PDF toolset):
 *   1. Real high-resolution PDF exporter (single-page & multi-page via jsPDF)
 *   2. PDF Document Page Importer (converts PDF pages into canvas artboard layers via pdf.js)
 *   3. Proof Watermark Engine (diagonal tiled client proofing watermarks with customizable opacity/text)
 *   4. Official Vector Rubber Stamps & Verification Badges ("APPROVED", "CONFIDENTIAL", "DRAFT", "PAID", "FINAL", "PRIORITY")
 */

class PDFCraftTools {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.watermarkActive = false;
    this.watermarkGroup = null;

    // Configure PDF.js worker if available
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  // =========================================================================
  // 1. High-Fidelity PDF Exporter (jsPDF)
  // =========================================================================
  exportNativePDF(filename = 'designpro-document.pdf') {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      // Fallback if jsPDF is not yet loaded
      if (window.app && window.app.export) {
        window.app.export.printDesign();
      }
      return;
    }

    const { jsPDF } = window.jspdf;
    const w = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const h = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));
    const orientation = w > h ? 'landscape' : 'portrait';

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'px',
      format: [w, h],
      compress: true
    });

    // Check if multi-page exists
    const pagesManager = window.app ? window.app.pages : null;
    if (pagesManager && pagesManager.pages && pagesManager.pages.length > 1) {
      if (typeof pagesManager.saveCurrentPageState === 'function') {
        pagesManager.saveCurrentPageState();
      } else if (typeof pagesManager.saveCurrentPage === 'function') {
        pagesManager.saveCurrentPage();
      }

      // Sequential async render to preserve exact page ordering and prevent race conditions
      const renderAllPages = async () => {
        try {
          for (let idx = 0; idx < pagesManager.pages.length; idx++) {
            const page = pagesManager.pages[idx];
            const pageData = page.state || page.canvasData;
            const pageW = page.width || w;
            const pageH = page.height || h;
            const pageOrientation = pageW > pageH ? 'landscape' : 'portrait';

            if (idx > 0) {
              pdf.addPage([pageW, pageH], pageOrientation);
            }

            // Temporarily render page canvas data via Promise
            await new Promise((resolve) => {
              const tempCanvas = document.createElement('canvas');
              tempCanvas.width = pageW;
              tempCanvas.height = pageH;
              const staticCanvas = new fabric.StaticCanvas(tempCanvas, { width: pageW, height: pageH });

              const finishPage = () => {
                try {
                  const imgData = staticCanvas.toDataURL({ format: 'jpeg', quality: 0.95 });
                  pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH);
                  // Embed searchable vector text overlay (Flaw 8 Fix)
                  this.embedVectorTextLayer(pdf, staticCanvas, pageW, pageH);
                } catch (e) {
                  console.warn('PDF page image extraction error:', e);
                }
                staticCanvas.dispose();
                resolve();
              };

              if (pageData) {
                staticCanvas.loadFromJSON(pageData, () => {
                  staticCanvas.renderAll();
                  finishPage();
                });
              } else {
                finishPage();
              }
            });
          }

          pdf.save(filename);
          if (window.showToast) {
            window.showToast(`Saved multi-page vector-enhanced PDF (${pagesManager.pages.length} pages)!`, 'success');
          }
        } catch (err) {
          console.error('Multi-page PDF export error:', err);
          if (window.showToast) window.showToast('Failed to export multi-page PDF', 'error');
        }
      };

      renderAllPages();
      return;
    }

    // Single page export
    const zoom = this.canvas.getZoom() || 1;
    const guides = this.canvas.getObjects().filter(o => o.isGuide && o.visible);
    guides.forEach(g => { g.visible = false; });

    const imgData = this.canvas.toDataURL({
      format: 'jpeg',
      quality: 0.95,
      multiplier: (1 / zoom) * 2
    });

    guides.forEach(g => { g.visible = true; });
    this.canvas.renderAll();

    pdf.addImage(imgData, 'JPEG', 0, 0, w, h);
    // Embed searchable vector text overlay (Flaw 8 Fix)
    this.embedVectorTextLayer(pdf, this.canvas, w, h);
    pdf.save(filename);

    if (window.showToast) {
      window.showToast(`Exported vector-enhanced PDF (${filename})!`, 'success');
    }
  }

  // Searchable Vector Text Layer Embedder (Preserves crisp vector typography & searchability)
  embedVectorTextLayer(pdf, fabricCanvas, pageW, pageH) {
    if (!pdf || !fabricCanvas) return;
    try {
      const objects = fabricCanvas.getObjects();
      objects.forEach((obj) => {
        if (!obj.visible || obj.isGuide) return;
        if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
          const text = obj.text || '';
          if (!text.trim()) return;

          const scaleY = obj.scaleY || 1;
          const fontSize = (obj.fontSize || 16) * scaleY;
          const left = obj.left || 0;
          const top = obj.top || 0;

          // Convert hex fill to RGB
          let r = 0, g = 0, b = 0;
          if (typeof obj.fill === 'string' && obj.fill.startsWith('#')) {
            const hex = obj.fill.replace('#', '');
            if (hex.length === 6) {
              r = parseInt(hex.substring(0, 2), 16) || 0;
              g = parseInt(hex.substring(2, 4), 16) || 0;
              b = parseInt(hex.substring(4, 6), 16) || 0;
            }
          }

          // Use pt scaling: 1 px ≈ 0.75 pt in standard PDF
          pdf.setFontSize(Math.max(6, fontSize * 0.75));
          pdf.setTextColor(r, g, b);

          // Handle multiline text
          const lines = text.split('\n');
          const lineHeight = (obj.lineHeight || 1.16) * fontSize;
          lines.forEach((line, lineIdx) => {
            const lineY = top + (lineIdx * lineHeight) + (fontSize * 0.8);
            if (lineY <= pageH) {
              pdf.text(line, left, lineY);
            }
          });
        }
      });
    } catch (err) {
      console.warn('Vector text layer embedding note:', err);
    }
  }

  // =========================================================================
  // 2. PDF Document Importer (pdf.js)
  // =========================================================================
  importPDFFile(file) {
    if (!file) return;

    if (!window.pdfjsLib) {
      if (window.showToast) window.showToast('PDF.js library is loading, please try in a moment.', 'info');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;

        if (pdf.numPages === 0) {
          throw new Error('Empty PDF document.');
        }

        // Render Page 1 at 2.0 scale for high resolution
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        const renderCanvas = document.createElement('canvas');
        renderCanvas.width = viewport.width;
        renderCanvas.height = viewport.height;
        const ctx = renderCanvas.getContext('2d');

        await page.render({
          canvasContext: ctx,
          viewport: viewport
        }).promise;

        const dataUrl = renderCanvas.toDataURL('image/png');

        // Add as Image to artboard
        fabric.Image.fromURL(dataUrl, (img) => {
          const artW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
          const artH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));
          const maxW = artW * 0.85;
          const maxH = artH * 0.85;
          const scale = Math.min(maxW / img.width, maxH / img.height);

          img.set({
            left: artW / 2,
            top: artH / 2,
            originX: 'center',
            originY: 'center',
            scaleX: scale,
            scaleY: scale,
            name: `${file.name} (Page 1)`
          });

          this.canvas.add(img);
          this.canvas.setActiveObject(img);
          this.canvas.renderAll();
          this.canvasManager.recordState();

          if (window.showToast) {
            window.showToast(`Imported ${file.name} (Page 1 of ${pdf.numPages})!`, 'success');
          }
        });

      } catch (err) {
        console.error('PDF import error:', err);
        if (window.showToast) window.showToast('Could not parse PDF file.', 'error');
      }
    };

    reader.readAsArrayBuffer(file);
  }

  // =========================================================================
  // 3. Client Proof Watermark Engine
  // =========================================================================
  toggleProofWatermark(text = 'CLIENT PROOF - DO NOT COPY', opacity = 0.16) {
    if (this.watermarkActive) {
      this.removeProofWatermark();
      return false;
    }

    this.applyProofWatermark(text, opacity);
    return true;
  }

  applyProofWatermark(text = 'CLIENT PROOF - DO NOT COPY', opacity = 0.16) {
    this.removeProofWatermark();

    const w = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const h = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));
    const items = [];

    // Tiled repeating grid pattern of diagonal text
    const stepX = 260;
    const stepY = 180;

    for (let x = -100; x < w + 200; x += stepX) {
      for (let y = -100; y < h + 200; y += stepY) {
        const mark = new fabric.Text(text, {
          left: x,
          top: y,
          fontSize: 22,
          fontFamily: 'Outfit',
          fontWeight: '700',
          fill: '#ef4444',
          angle: -30,
          opacity: opacity,
          selectable: false,
          evented: false,
        });
        items.push(mark);
      }
    }

    this.watermarkGroup = new fabric.Group(items, {
      left: 0,
      top: 0,
      selectable: false,
      evented: false,
      name: '__proof_watermark__',
    });

    this.canvas.add(this.watermarkGroup);
    this.canvas.bringToFront(this.watermarkGroup);
    this.canvas.renderAll();
    this.watermarkActive = true;

    if (window.showToast) {
      window.showToast('Client proof watermark enabled!', 'info');
    }
  }

  removeProofWatermark() {
    if (this.watermarkGroup) {
      this.canvas.remove(this.watermarkGroup);
      this.watermarkGroup = null;
    }
    // Also sweep any legacy watermark objects
    const marks = this.canvas.getObjects().filter(o => o.name === '__proof_watermark__');
    marks.forEach(m => this.canvas.remove(m));

    this.canvas.renderAll();
    this.watermarkActive = false;

    if (window.showToast) {
      window.showToast('Client proof watermark removed.', 'info');
    }
  }

  // =========================================================================
  // 4. Official Vector Rubber Stamps & Verification Badges
  // =========================================================================
  addVectorStamp(type = 'approved') {
    const cx = this.canvasManager ? this.canvasManager.artboardWidth / 2 : (this.canvas.width / (this.canvas.getZoom() || 1) / 2);
    const cy = this.canvasManager ? this.canvasManager.artboardHeight / 2 : (this.canvas.height / (this.canvas.getZoom() || 1) / 2);

    let stampGroup = null;

    switch (type) {
      case 'approved': {
        // Emerald Green Circular Verification Stamp
        const circle = new fabric.Circle({
          radius: 65,
          fill: 'transparent',
          stroke: '#059669',
          strokeWidth: 4,
          strokeDashArray: [8, 4],
          originX: 'center',
          originY: 'center'
        });

        const innerCircle = new fabric.Circle({
          radius: 54,
          fill: 'transparent',
          stroke: '#059669',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center'
        });

        const title = new fabric.Text('APPROVED', {
          fontSize: 18,
          fontFamily: 'Outfit',
          fontWeight: '900',
          fill: '#059669',
          originX: 'center',
          originY: 'center',
          top: -10
        });

        const date = new fabric.Text(new Date().toLocaleDateString(), {
          fontSize: 11,
          fontFamily: 'Inter',
          fontWeight: '700',
          fill: '#059669',
          originX: 'center',
          originY: 'center',
          top: 14
        });

        stampGroup = new fabric.Group([circle, innerCircle, title, date], {
          left: cx,
          top: cy,
          originX: 'center',
          originY: 'center',
          angle: -12,
          opacity: 0.9,
          name: 'Seal: APPROVED'
        });
        break;
      }

      case 'confidential': {
        // Crimson Red Rectangular Border Stamp
        const rect = new fabric.Rect({
          width: 220,
          height: 60,
          fill: 'transparent',
          stroke: '#dc2626',
          strokeWidth: 4,
          rx: 4,
          ry: 4,
          originX: 'center',
          originY: 'center'
        });

        const text = new fabric.Text('CONFIDENTIAL', {
          fontSize: 22,
          fontFamily: 'Outfit',
          fontWeight: '900',
          fill: '#dc2626',
          originX: 'center',
          originY: 'center'
        });

        stampGroup = new fabric.Group([rect, text], {
          left: cx,
          top: cy,
          originX: 'center',
          originY: 'center',
          angle: -8,
          opacity: 0.9,
          name: 'Seal: CONFIDENTIAL'
        });
        break;
      }

      case 'draft': {
        // Amber Draft Stamp
        const rect = new fabric.Rect({
          width: 170,
          height: 52,
          fill: 'rgba(245, 158, 11, 0.08)',
          stroke: '#d97706',
          strokeWidth: 3,
          strokeDashArray: [6, 3],
          rx: 6,
          ry: 6,
          originX: 'center',
          originY: 'center'
        });

        const text = new fabric.Text('DRAFT', {
          fontSize: 22,
          fontFamily: 'Outfit',
          fontWeight: '800',
          fill: '#d97706',
          originX: 'center',
          originY: 'center'
        });

        stampGroup = new fabric.Group([rect, text], {
          left: cx,
          top: cy,
          originX: 'center',
          originY: 'center',
          angle: 6,
          opacity: 0.92,
          name: 'Seal: DRAFT'
        });
        break;
      }

      case 'paid': {
        // Royal Navy Paid Badge
        const rect = new fabric.Rect({
          width: 190,
          height: 54,
          fill: 'transparent',
          stroke: '#2563eb',
          strokeWidth: 3.5,
          rx: 8,
          ry: 8,
          originX: 'center',
          originY: 'center'
        });

        const text = new fabric.Text('PAID & VERIFIED', {
          fontSize: 16,
          fontFamily: 'Outfit',
          fontWeight: '800',
          fill: '#2563eb',
          originX: 'center',
          originY: 'center'
        });

        stampGroup = new fabric.Group([rect, text], {
          left: cx,
          top: cy,
          originX: 'center',
          originY: 'center',
          angle: -5,
          opacity: 0.92,
          name: 'Seal: PAID & VERIFIED'
        });
        break;
      }

      case 'final': {
        // Slate Official Seal
        const rect = new fabric.Rect({
          width: 180,
          height: 50,
          fill: '#0f172a',
          rx: 6,
          ry: 6,
          originX: 'center',
          originY: 'center'
        });

        const text = new fabric.Text('FINAL COPY', {
          fontSize: 16,
          fontFamily: 'Outfit',
          fontWeight: '800',
          fill: '#ffffff',
          originX: 'center',
          originY: 'center'
        });

        stampGroup = new fabric.Group([rect, text], {
          left: cx,
          top: cy,
          originX: 'center',
          originY: 'center',
          angle: 0,
          opacity: 0.95,
          name: 'Seal: FINAL COPY'
        });
        break;
      }

      case 'priority': {
        // Rose Priority Banner
        const rect = new fabric.Rect({
          width: 200,
          height: 48,
          fill: '#e11d48',
          rx: 4,
          ry: 4,
          originX: 'center',
          originY: 'center'
        });

        const text = new fabric.Text('URGENT / PRIORITY', {
          fontSize: 14,
          fontFamily: 'Outfit',
          fontWeight: '900',
          fill: '#ffffff',
          originX: 'center',
          originY: 'center'
        });

        stampGroup = new fabric.Group([rect, text], {
          left: cx,
          top: cy,
          originX: 'center',
          originY: 'center',
          angle: -4,
          opacity: 0.95,
          name: 'Seal: PRIORITY'
        });
        break;
      }
    }

    if (stampGroup) {
      this.canvas.add(stampGroup);
      this.canvas.setActiveObject(stampGroup);
      this.canvas.renderAll();
      this.canvasManager.recordState();

      if (window.showToast) {
        window.showToast(`Applied ${type.toUpperCase()} official stamp!`, 'success');
      }
    }
  }
}

window.PDFCraftTools = PDFCraftTools;
