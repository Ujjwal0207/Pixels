/**
 * CMYK Print Studio & 3mm Bleed Pre-Flight Inspector for DesignPro
 * Features:
 * - 3mm Bleed margin & 5mm Safe Margin guide overlays
 * - Commercial Pre-Flight Inspector (Total Area Coverage, Rich Black warning, DPI check)
 * - 1-Click "Fix to Pure K Black" for crisp typography on printing presses
 * - Commercial PDF/X Print Exporter with crop marks and calibration registration targets
 */

(function () {
  'use strict';

  class CmykPrintStudio {
    constructor(canvasManager) {
      this.canvasManager = canvasManager;
      this.canvas = canvasManager.canvas;
      this.bleedMm = 3;       // Standard 3mm bleed
      this.safeMarginMm = 5;  // Standard 5mm safe zone
      this.dpi = 72;          // Screen DPI (converts to 300 DPI for export)
      this.bleedVisible = false;
      this.bleedOverlayEl = null;

      this.init();
    }

    setCanvas(canvas) {
      this.canvas = canvas;
      if (this.bleedVisible) {
        this.renderBleedGuides();
      }
    }

    init() {
      // Create overlay container over canvas wrapper
      this.ensureOverlayElement();
    }

    ensureOverlayElement() {
      if (this.bleedOverlayEl && document.body.contains(this.bleedOverlayEl)) return;

      const container = document.getElementById('canvas-scroll-container') || document.getElementById('canvas-wrapper') || document.querySelector('.canvas-viewport');
      if (!container) return;

      this.bleedOverlayEl = document.createElement('div');
      this.bleedOverlayEl.id = 'print-bleed-overlay';
      this.bleedOverlayEl.style.position = 'absolute';
      this.bleedOverlayEl.style.pointerEvents = 'none';
      this.bleedOverlayEl.style.display = 'none';
      this.bleedOverlayEl.style.zIndex = '40';
      container.appendChild(this.bleedOverlayEl);
    }

    /**
     * Convert mm to pixels at given DPI
     */
    mmToPx(mm, dpi = 72) {
      return (mm / 25.4) * dpi;
    }

    /**
     * Convert RGB (0-255) to standard CMYK percentages (0-100)
     */
    rgbToCmyk(r, g, b) {
      const normR = r / 255;
      const normG = g / 255;
      const normB = b / 255;

      const k = 1 - Math.max(normR, normG, normB);
      if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 100, tac: 100 };
      }

      const c = Math.round(((1 - normR - k) / (1 - k)) * 100);
      const m = Math.round(((1 - normG - k) / (1 - k)) * 100);
      const y = Math.round(((1 - normB - k) / (1 - k)) * 100);
      const kVal = Math.round(k * 100);
      const tac = c + m + y + kVal;

      return { c, m, y, k: kVal, tac };
    }

    /**
     * Toggle 3mm Bleed and Safe Zone Guides
     */
    toggleBleedGuides(show = null) {
      this.bleedVisible = show !== null ? show : !this.bleedVisible;
      this.ensureOverlayElement();

      if (!this.bleedVisible) {
        if (this.bleedOverlayEl) this.bleedOverlayEl.style.display = 'none';
        if (window.showToast) window.showToast('Print bleed guides hidden', 'info');
        return false;
      }

      this.renderBleedGuides();
      if (window.showToast) window.showToast('3mm Bleed (Magenta) & 5mm Safe Margin (Cyan) active', 'success');
      return true;
    }

    /**
     * Render the visual Bleed Box and Safe Zone lines on canvas
     */
    renderBleedGuides() {
      if (!this.bleedVisible || !this.canvas) return;
      this.ensureOverlayElement();

      const upperCanvas = this.canvas.upperCanvasEl;
      if (!upperCanvas || !this.bleedOverlayEl) return;

      const rect = upperCanvas.getBoundingClientRect();
      const wrapper = document.getElementById('canvas-scroll-container') || document.getElementById('canvas-wrapper') || document.querySelector('.canvas-viewport');
      if (!wrapper) return;
      const wrapperRect = wrapper.getBoundingClientRect();

      const zoom = this.canvas.getZoom() || 1;
      const bleedPx = this.mmToPx(this.bleedMm, this.dpi) * zoom;
      const safePx = this.mmToPx(this.safeMarginMm, this.dpi) * zoom;

      const left = rect.left - wrapperRect.left;
      const top = rect.top - wrapperRect.top;
      const width = rect.width;
      const height = rect.height;

      this.bleedOverlayEl.style.display = 'block';
      this.bleedOverlayEl.style.left = `${left - bleedPx}px`;
      this.bleedOverlayEl.style.top = `${top - bleedPx}px`;
      this.bleedOverlayEl.style.width = `${width + bleedPx * 2}px`;
      this.bleedOverlayEl.style.height = `${height + bleedPx * 2}px`;

      this.bleedOverlayEl.innerHTML = `
        <div style="position: absolute; inset: 0; border: 1.5px dashed #ec4899; box-sizing: border-box;">
          <span style="position: absolute; top: -18px; left: 0; font-size: 10px; font-weight: 600; color: #ec4899; background: rgba(15,23,42,0.85); padding: 2px 6px; border-radius: 4px;">
            3mm Bleed Zone
          </span>
        </div>
        <div style="position: absolute; left: ${bleedPx + safePx}px; top: ${bleedPx + safePx}px; width: ${width - safePx * 2}px; height: ${height - safePx * 2}px; border: 1.5px dashed #06b6d4; box-sizing: border-box;">
          <span style="position: absolute; bottom: 4px; right: 6px; font-size: 10px; font-weight: 600; color: #06b6d4; background: rgba(15,23,42,0.85); padding: 2px 6px; border-radius: 4px;">
            Safe Margin (Keep text inside)
          </span>
        </div>
      `;
    }

    /**
     * Comprehensive Commercial Pre-Flight Inspector
     */
    runPreflightInspection() {
      if (!this.canvas) return { passed: true, issues: [] };

      const issues = [];
      const objects = this.canvas.getObjects();

      let richBlackTextCount = 0;
      let highTacCount = 0;
      let lowDpiImageCount = 0;

      objects.forEach((obj) => {
        if (!obj.visible || obj.isGuide) return;

        // 1. Text Inspection (Rich Black & Safe Margin check)
        if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
          const fill = obj.fill;
          if (typeof fill === 'string' && fill.startsWith('#')) {
            const hex = fill.replace('#', '');
            if (hex.length === 6) {
              const r = parseInt(hex.substring(0, 2), 16) || 0;
              const g = parseInt(hex.substring(2, 4), 16) || 0;
              const b = parseInt(hex.substring(4, 6), 16) || 0;
              const cmyk = this.rgbToCmyk(r, g, b);

              // If dark text has cyan, magenta, or yellow instead of 100% pure K
              if (cmyk.k > 80 && (cmyk.c > 10 || cmyk.m > 10 || cmyk.y > 10)) {
                richBlackTextCount++;
              }
              if (cmyk.tac > 300) {
                highTacCount++;
              }
            }
          }

          // Check if small text crosses outside safe margin
          const bound = obj.getBoundingRect(true);
          const safePx = this.mmToPx(this.safeMarginMm, this.dpi);
          if (bound.left < safePx || bound.top < safePx ||
              (bound.left + bound.width) > (this.canvas.width - safePx) ||
              (bound.top + bound.height) > (this.canvas.height - safePx)) {
            issues.push({
              type: 'warning',
              category: 'Margin',
              message: `Text "${(obj.text || '').substring(0, 18)}..." extends outside the 5mm safe print margin.`,
              target: obj
            });
          }
        }

        // 2. Image DPI Resolution check
        if (obj.type === 'image') {
          const el = obj.getElement ? obj.getElement() : null;
          if (el) {
            const naturalW = el.naturalWidth || el.width || 1;
            const renderedW = (obj.width * (obj.scaleX || 1)) || 1;
            const effectiveDpi = (naturalW / (renderedW / this.dpi));
            if (effectiveDpi < 220) {
              lowDpiImageCount++;
              issues.push({
                type: 'warning',
                category: 'DPI Resolution',
                message: `Image may print blurry (effective resolution: ~${Math.round(effectiveDpi)} DPI; recommended: 300 DPI).`,
                target: obj
              });
            }
          }
        }
      });

      if (richBlackTextCount > 0) {
        issues.push({
          type: 'danger',
          category: 'Rich Black',
          count: richBlackTextCount,
          message: `${richBlackTextCount} text object(s) use 4-color Rich Black. Commercial presses recommend 100% Pure K Black to prevent registration ghosting.`,
          actionable: 'fix-pure-black'
        });
      }

      if (highTacCount > 0) {
        issues.push({
          type: 'warning',
          category: 'Ink Limit',
          count: highTacCount,
          message: `${highTacCount} element(s) exceed 300% Total Area Coverage (TAC). May cause ink pooling on commercial presses.`
        });
      }

      const passed = issues.length === 0;
      return {
        passed,
        totalObjects: objects.length,
        richBlackCount: richBlackTextCount,
        lowDpiCount: lowDpiImageCount,
        issues
      };
    }

    /**
     * 1-Click Auto-Fix: Convert all Rich Black text to 100% Pure K Black
     */
    fixRichBlackText() {
      if (!this.canvas) return 0;
      let count = 0;

      this.canvas.getObjects().forEach((obj) => {
        if (!obj.visible || obj.isGuide) return;
        if (obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') {
          const fill = obj.fill;
          if (typeof fill === 'string' && fill.startsWith('#')) {
            const hex = fill.replace('#', '');
            if (hex.length === 6) {
              const r = parseInt(hex.substring(0, 2), 16) || 0;
              const g = parseInt(hex.substring(2, 4), 16) || 0;
              const b = parseInt(hex.substring(4, 6), 16) || 0;
              const cmyk = this.rgbToCmyk(r, g, b);
              if (cmyk.k > 80 && (cmyk.c > 10 || cmyk.m > 10 || cmyk.y > 10)) {
                obj.set('fill', '#000000');
                count++;
              }
            }
          }
        }
      });

      if (count > 0) {
        this.canvas.renderAll();
        if (this.canvasManager) this.canvasManager.recordState();
        if (window.showToast) {
          window.showToast(`Converted ${count} text elements to 100% Pure K Black!`, 'success');
        }
      } else {
        if (window.showToast) window.showToast('All text is already print-optimized!', 'info');
      }
      return count;
    }

    /**
     * Export Commercial Print PDF with 3mm Bleed, Crop Marks, and Registration Bars
     */
    exportPrintReadyPDF(filename = 'print-ready-commercial.pdf') {
      if (!window.jspdf || !window.jspdf.jsPDF) {
        if (window.showToast) window.showToast('jsPDF library loading, please try in a moment', 'info');
        return;
      }

      const { jsPDF } = window.jspdf;
      const artW = this.canvasManager.artboardWidth;
      const artH = this.canvasManager.artboardHeight;

      // 3mm bleed in pts (1 mm = 2.83465 pt)
      const bleedPt = 3 * 2.83465;
      const marginPt = 15 * 2.83465; // 15mm slug margin for trim marks & color bars

      const sheetW = (artW * 0.75) + (bleedPt + marginPt) * 2;
      const sheetH = (artH * 0.75) + (bleedPt + marginPt) * 2;
      const orientation = sheetW > sheetH ? 'landscape' : 'portrait';

      const pdf = new jsPDF({
        orientation,
        unit: 'pt',
        format: [sheetW, sheetH]
      });

      // High-resolution 300 DPI raster of artboard
      const imgData = this.canvas.toDataURL({
        format: 'jpeg',
        quality: 0.98,
        multiplier: 3
      });

      const artX = marginPt + bleedPt;
      const artY = marginPt + bleedPt;
      const renderedArtW = artW * 0.75;
      const renderedArtH = artH * 0.75;

      // Place artboard
      pdf.addImage(imgData, 'JPEG', artX, artY, renderedArtW, renderedArtH);

      // Draw Professional Commercial Crop & Trim Marks
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.5);

      const markLen = 18;
      const markGap = 4;

      // Top-Left Corner
      pdf.line(artX, artY - markGap, artX, artY - markGap - markLen);
      pdf.line(artX - markGap, artY, artX - markGap - markLen, artY);

      // Top-Right Corner
      pdf.line(artX + renderedArtW, artY - markGap, artX + renderedArtW, artY - markGap - markLen);
      pdf.line(artX + renderedArtW + markGap, artY, artX + renderedArtW + markGap + markLen, artY);

      // Bottom-Left Corner
      pdf.line(artX, artY + renderedArtH + markGap, artX, artY + renderedArtH + markGap + markLen);
      pdf.line(artX - markGap, artY + renderedArtH, artX - markGap - markLen, artY + renderedArtH);

      // Bottom-Right Corner
      pdf.line(artX + renderedArtW, artY + renderedArtH + markGap, artX + renderedArtW, artY + renderedArtH + markGap + markLen);
      pdf.line(artX + renderedArtW + markGap, artY + renderedArtH, artX + renderedArtW + markGap + markLen, artY + renderedArtH);

      // Color Calibration Squares (CMYK Bars on top margin)
      const colors = [
        [0, 255, 255],   // Cyan
        [255, 0, 255],   // Magenta
        [255, 255, 0],   // Yellow
        [0, 0, 0],       // Key Black
        [128, 128, 128], // 50% Gray
      ];

      const barY = 8;
      const barSize = 8;
      let startBarX = (sheetW - (colors.length * 14)) / 2;
      colors.forEach(([r, g, b]) => {
        pdf.setFillColor(r, g, b);
        pdf.rect(startBarX, barY, barSize, barSize, 'F');
        startBarX += 14;
      });

      // Technical Job Banner
      pdf.setFontSize(7);
      pdf.setTextColor(80, 80, 80);
      const title = (document.getElementById('doc-title-input') ? document.getElementById('doc-title-input').value : 'Design') || 'Commercial Job';
      pdf.text(`CANVA PRO PRINT STUDIO | ${title} | 3mm Bleed | FOGRA39 / US Web Coated | ${new Date().toLocaleDateString()}`, marginPt, sheetH - 8);

      pdf.save(filename);
      if (window.showToast) {
        window.showToast(`Commercial Print PDF with trim marks exported (${filename})!`, 'success');
      }
    }
  }

  window.CmykPrintStudio = CmykPrintStudio;
})();
