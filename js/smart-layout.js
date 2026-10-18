/**
 * Procedural Smart Layout Generator for DesignPro
 * Grounded in Design Systems, Golden Ratio & Typography Hierarchy Rules
 * 
 * Generates balanced, production-grade graphic designs automatically from
 * text inputs, category intent, and brand color palettes.
 */

class SmartLayoutEngine {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  // Generate 6 distinct layout variations
  generateVariations(options = {}) {
    const w = options.width || (this.canvasManager ? this.canvasManager.artboardWidth : 1080);
    const h = options.height || (this.canvasManager ? this.canvasManager.artboardHeight : 1080);
    const headline = options.headline || 'DESIGN IN MOTION';
    const subhead = options.subhead || 'Craft bold, pixel-perfect visuals in seconds.';
    const cta = options.cta || 'GET STARTED';
    const tag = options.tag || 'NEW RELEASE';
    const palette = options.palette || ['#7c3aed', '#ec4899', '#06b6d4', '#0f172a', '#ffffff'];

    const pPrimary = palette[0];
    const pSecondary = palette[1] || '#ec4899';
    const pAccent = palette[2] || '#06b6d4';
    const pDark = palette[3] || '#0f172a';
    const pLight = palette[4] || '#ffffff';

    return [
      this._buildMinimalEditorial(w, h, headline, subhead, cta, tag, pPrimary, pDark, pLight),
      this._buildBoldSplitScreen(w, h, headline, subhead, cta, tag, pPrimary, pSecondary, pLight),
      this._buildRadialAuraFocus(w, h, headline, subhead, cta, tag, pSecondary, pAccent, pDark, pLight),
      this._buildBrutalistGrid(w, h, headline, subhead, cta, tag, pPrimary, pAccent, pDark, pLight),
      this._buildDiagonalDynamic(w, h, headline, subhead, cta, tag, pPrimary, pSecondary, pDark, pLight),
      this._buildPillBadgeShowcase(w, h, headline, subhead, cta, tag, pAccent, pPrimary, pDark, pLight)
    ];
  }

  // 1. Minimal Editorial Swiss Style
  _buildMinimalEditorial(w, h, headline, subhead, cta, tag, primary, dark, light) {
    return {
      id: 'var-minimal-editorial',
      name: 'Minimal Editorial',
      style: 'Editorial',
      width: w,
      height: h,
      background: light,
      previewGradient: `linear-gradient(135deg, ${light}, #f1f5f9)`,
      objects: [
        {
          type: 'rect',
          left: w * 0.08,
          top: h * 0.08,
          width: w * 0.84,
          height: h * 0.84,
          fill: 'transparent',
          stroke: '#e2e8f0',
          strokeWidth: 2
        },
        {
          type: 'i-text',
          left: w * 0.12,
          top: h * 0.14,
          text: tag.toUpperCase(),
          fontSize: Math.round(w * 0.016),
          fontFamily: 'Inter',
          fontWeight: 700,
          fill: primary,
          charSpacing: 140
        },
        {
          type: 'i-text',
          left: w * 0.12,
          top: h * 0.22,
          text: headline,
          fontSize: Math.round(w * 0.065),
          fontFamily: 'Playfair Display',
          fontWeight: 700,
          lineHeight: 1.15,
          fill: dark
        },
        {
          type: 'rect',
          left: w * 0.12,
          top: h * 0.52,
          width: w * 0.15,
          height: 3,
          fill: primary
        },
        {
          type: 'i-text',
          left: w * 0.12,
          top: h * 0.58,
          text: subhead,
          fontSize: Math.round(w * 0.024),
          fontFamily: 'Inter',
          lineHeight: 1.4,
          fill: '#475569'
        },
        {
          type: 'rect',
          left: w * 0.12,
          top: h * 0.74,
          width: w * 0.32,
          height: h * 0.065,
          fill: dark,
          rx: 4,
          ry: 4
        },
        {
          type: 'i-text',
          left: w * 0.28,
          top: h * 0.772,
          text: cta,
          fontSize: Math.round(w * 0.018),
          fontFamily: 'Inter',
          fontWeight: 700,
          fill: light,
          originX: 'center',
          originY: 'center',
          charSpacing: 100
        }
      ]
    };
  }

  // 2. Bold Split-Screen Hero
  _buildBoldSplitScreen(w, h, headline, subhead, cta, tag, primary, secondary, light) {
    return {
      id: 'var-split-screen',
      name: 'Bold Color Block',
      style: 'High Contrast',
      width: w,
      height: h,
      background: primary,
      previewGradient: `linear-gradient(135deg, ${primary}, ${secondary})`,
      objects: [
        {
          type: 'rect',
          left: 0,
          top: h * 0.45,
          width: w,
          height: h * 0.55,
          fill: '#09090b'
        },
        {
          type: 'circle',
          left: w * 0.82,
          top: h * 0.22,
          radius: w * 0.16,
          fill: secondary,
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'i-text',
          left: w * 0.08,
          top: h * 0.12,
          text: tag,
          fontSize: Math.round(w * 0.02),
          fontFamily: 'Outfit',
          fontWeight: 800,
          fill: light,
          charSpacing: 160
        },
        {
          type: 'i-text',
          left: w * 0.08,
          top: h * 0.20,
          text: headline,
          fontSize: Math.round(w * 0.08),
          fontFamily: 'Bebas Neue',
          fill: light,
          charSpacing: 140
        },
        {
          type: 'i-text',
          left: w * 0.08,
          top: h * 0.52,
          text: subhead,
          fontSize: Math.round(w * 0.026),
          fontFamily: 'Inter',
          lineHeight: 1.4,
          fill: '#cbd5e1'
        },
        {
          type: 'rect',
          left: w * 0.08,
          top: h * 0.72,
          width: w * 0.36,
          height: h * 0.075,
          fill: secondary,
          rx: 30,
          ry: 30
        },
        {
          type: 'i-text',
          left: w * 0.26,
          top: h * 0.757,
          text: cta,
          fontSize: Math.round(w * 0.02),
          fontFamily: 'Outfit',
          fontWeight: 800,
          fill: light,
          originX: 'center',
          originY: 'center'
        }
      ]
    };
  }

  // 3. Radial Aura Focus (Cosmic / Tech)
  _buildRadialAuraFocus(w, h, headline, subhead, cta, tag, secondary, accent, dark, light) {
    return {
      id: 'var-radial-aura',
      name: 'Glowing Aura Focus',
      style: 'Modern Cyber',
      width: w,
      height: h,
      background: dark,
      previewGradient: `radial-gradient(circle at center, ${secondary} 0%, ${dark} 70%)`,
      objects: [
        {
          type: 'circle',
          left: w * 0.5,
          top: h * 0.45,
          radius: w * 0.35,
          fill: 'rgba(236, 72, 153, 0.14)',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'circle',
          left: w * 0.5,
          top: h * 0.45,
          radius: w * 0.22,
          fill: 'rgba(6, 182, 212, 0.18)',
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'rect',
          left: w * 0.5,
          top: h * 0.22,
          width: w * 0.28,
          height: 38,
          fill: 'rgba(255, 255, 255, 0.1)',
          stroke: accent,
          strokeWidth: 1.5,
          rx: 19,
          ry: 19,
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'i-text',
          left: w * 0.5,
          top: h * 0.22,
          text: tag,
          fontSize: Math.round(w * 0.016),
          fontFamily: 'Inter',
          fontWeight: 700,
          fill: accent,
          originX: 'center',
          originY: 'center',
          charSpacing: 120
        },
        {
          type: 'i-text',
          left: w * 0.5,
          top: h * 0.36,
          text: headline,
          fontSize: Math.round(w * 0.07),
          fontFamily: 'Outfit',
          fontWeight: 900,
          fill: light,
          originX: 'center',
          originY: 'center',
          textAlign: 'center'
        },
        {
          type: 'i-text',
          left: w * 0.5,
          top: h * 0.52,
          text: subhead,
          fontSize: Math.round(w * 0.024),
          fontFamily: 'Inter',
          fill: '#94a3b8',
          originX: 'center',
          originY: 'center',
          textAlign: 'center'
        },
        {
          type: 'rect',
          left: w * 0.5,
          top: h * 0.68,
          width: w * 0.34,
          height: h * 0.07,
          fill: accent,
          rx: 35,
          ry: 35,
          originX: 'center',
          originY: 'center'
        },
        {
          type: 'i-text',
          left: w * 0.5,
          top: h * 0.68,
          text: cta,
          fontSize: Math.round(w * 0.02),
          fontFamily: 'Outfit',
          fontWeight: 800,
          fill: dark,
          originX: 'center',
          originY: 'center'
        }
      ]
    };
  }

  // 4. Brutalist Grid Poster
  _buildBrutalistGrid(w, h, headline, subhead, cta, tag, primary, accent, dark, light) {
    return {
      id: 'var-brutalist-grid',
      name: 'Brutalist Grid',
      style: 'Industrial',
      width: w,
      height: h,
      background: '#ffffff',
      previewGradient: 'linear-gradient(135deg, #ffffff, #e2e8f0)',
      objects: [
        {
          type: 'rect',
          left: w * 0.05,
          top: h * 0.05,
          width: w * 0.9,
          height: h * 0.9,
          fill: '#fafafa',
          stroke: '#000000',
          strokeWidth: 4
        },
        {
          type: 'rect',
          left: w * 0.05,
          top: h * 0.05,
          width: w * 0.9,
          height: 60,
          fill: '#000000'
        },
        {
          type: 'i-text',
          left: w * 0.08,
          top: h * 0.075,
          text: `[SYSTEM: ${tag.toUpperCase()}]`,
          fontSize: 16,
          fontFamily: 'Space Grotesk',
          fontWeight: 700,
          fill: '#00ff66'
        },
        {
          type: 'i-text',
          left: w * 0.08,
          top: h * 0.18,
          text: headline.toUpperCase(),
          fontSize: Math.round(w * 0.078),
          fontFamily: 'Bebas Neue',
          fill: '#000000',
          lineHeight: 0.9,
          charSpacing: 80
        },
        {
          type: 'rect',
          left: w * 0.08,
          top: h * 0.46,
          width: w * 0.84,
          height: 4,
          fill: '#000000'
        },
        {
          type: 'i-text',
          left: w * 0.08,
          top: h * 0.52,
          text: subhead,
          fontSize: Math.round(w * 0.024),
          fontFamily: 'Space Grotesk',
          fontWeight: 500,
          fill: '#18181b',
          lineHeight: 1.4
        },
        {
          type: 'rect',
          left: w * 0.08,
          top: h * 0.76,
          width: w * 0.4,
          height: 64,
          fill: '#000000'
        },
        {
          type: 'i-text',
          left: w * 0.28,
          top: h * 0.795,
          text: cta.toUpperCase(),
          fontSize: 18,
          fontFamily: 'Space Grotesk',
          fontWeight: 700,
          fill: '#ffffff',
          originX: 'center',
          originY: 'center'
        }
      ]
    };
  }

  // 5. Diagonal Dynamic Flyer
  _buildDiagonalDynamic(w, h, headline, subhead, cta, tag, primary, secondary, dark, light) {
    return {
      id: 'var-diagonal-dynamic',
      name: 'Dynamic Angular',
      style: 'Vibrant Marketing',
      width: w,
      height: h,
      background: '#0f172a',
      previewGradient: `linear-gradient(135deg, ${primary}, #0f172a)`,
      objects: [
        {
          type: 'polygon',
          points: [
            { x: 0, y: 0 },
            { x: w, y: 0 },
            { x: w, y: h * 0.5 },
            { x: 0, y: h * 0.3 }
          ],
          fill: primary
        },
        {
          type: 'i-text',
          left: w * 0.08,
          top: h * 0.08,
          text: tag,
          fontSize: Math.round(w * 0.02),
          fontFamily: 'Outfit',
          fontWeight: 800,
          fill: light,
          charSpacing: 160
        },
        {
          type: 'i-text',
          left: w * 0.08,
          top: h * 0.16,
          text: headline,
          fontSize: Math.round(w * 0.075),
          fontFamily: 'Outfit',
          fontWeight: 900,
          fill: light
        },
        {
          type: 'i-text',
          left: w * 0.08,
          top: h * 0.48,
          text: subhead,
          fontSize: Math.round(w * 0.025),
          fontFamily: 'Inter',
          lineHeight: 1.45,
          fill: '#94a3b8'
        },
        {
          type: 'rect',
          left: w * 0.08,
          top: h * 0.72,
          width: w * 0.34,
          height: h * 0.07,
          fill: secondary,
          rx: 8,
          ry: 8
        },
        {
          type: 'i-text',
          left: w * 0.25,
          top: h * 0.755,
          text: cta,
          fontSize: Math.round(w * 0.02),
          fontFamily: 'Inter',
          fontWeight: 800,
          fill: light,
          originX: 'center',
          originY: 'center'
        }
      ]
    };
  }

  // 6. Pill Badge Modern Showcase
  _buildPillBadgeShowcase(w, h, headline, subhead, cta, tag, accent, primary, dark, light) {
    return {
      id: 'var-pill-badge',
      name: 'Modern Showcase Card',
      style: 'Product / eCommerce',
      width: w,
      height: h,
      background: '#f8fafc',
      previewGradient: 'linear-gradient(135deg, #f8fafc, #ede9fe)',
      objects: [
        {
          type: 'rect',
          left: w * 0.08,
          top: h * 0.1,
          width: w * 0.84,
          height: h * 0.8,
          fill: '#ffffff',
          rx: 24,
          ry: 24,
          shadow: {
            color: 'rgba(0, 0, 0, 0.08)',
            blur: 40,
            offsetX: 0,
            offsetY: 16
          }
        },
        {
          type: 'rect',
          left: w * 0.16,
          top: h * 0.18,
          width: w * 0.22,
          height: 36,
          fill: 'rgba(124, 58, 237, 0.1)',
          rx: 18,
          ry: 18
        },
        {
          type: 'i-text',
          left: w * 0.27,
          top: h * 0.20,
          text: tag,
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 700,
          fill: primary,
          originX: 'center',
          originY: 'center',
          charSpacing: 100
        },
        {
          type: 'i-text',
          left: w * 0.16,
          top: h * 0.28,
          text: headline,
          fontSize: Math.round(w * 0.065),
          fontFamily: 'Outfit',
          fontWeight: 900,
          fill: dark
        },
        {
          type: 'i-text',
          left: w * 0.16,
          top: h * 0.46,
          text: subhead,
          fontSize: Math.round(w * 0.024),
          fontFamily: 'Inter',
          lineHeight: 1.5,
          fill: '#64748b'
        },
        {
          type: 'rect',
          left: w * 0.16,
          top: h * 0.68,
          width: w * 0.32,
          height: h * 0.068,
          fill: primary,
          rx: 12,
          ry: 12
        },
        {
          type: 'i-text',
          left: w * 0.32,
          top: h * 0.714,
          text: cta,
          fontSize: Math.round(w * 0.018),
          fontFamily: 'Inter',
          fontWeight: 700,
          fill: light,
          originX: 'center',
          originY: 'center'
        }
      ]
    };
  }

  // Load a generated variation onto canvas
  applyVariation(variation) {
    if (!variation || !this.canvas) return;
    if (this.canvasManager) {
      this.canvasManager.isBatchLoading = true;
      if (variation.width && variation.height) {
        this.canvasManager.setArtboardSize(variation.width, variation.height);
      }
    }
    this.canvas.clear();

    if (variation.background) {
      this.canvas.setBackgroundColor(variation.background, () => {});
    }

    if (Array.isArray(variation.objects)) {
      variation.objects.forEach(data => {
        let fabricObj = null;
        const options = { ...data };
        if (options.shadow && typeof options.shadow === 'object' && !(options.shadow instanceof fabric.Shadow)) {
          options.shadow = new fabric.Shadow(options.shadow);
        }

        switch (data.type) {
          case 'rect':
            fabricObj = new fabric.Rect(options);
            break;
          case 'circle':
            fabricObj = new fabric.Circle(options);
            break;
          case 'triangle':
            fabricObj = new fabric.Triangle(options);
            break;
          case 'i-text':
            fabricObj = new fabric.IText(options.text || '', options);
            break;
          case 'polygon':
            fabricObj = new fabric.Polygon(options.points || [], options);
            break;
          case 'line':
            fabricObj = new fabric.Line(options.points || [0, 0, 100, 100], options);
            break;
          default:
            break;
        }
        if (fabricObj) {
          this.canvas.add(fabricObj);
        }
      });
    }

    this.canvas.renderAll();
    if (this.canvasManager) this.canvasManager.isBatchLoading = false;
    if (this.canvasManager) this.canvasManager.recordState();
    if (window.app && window.app.layers) window.app.layers.renderLayers();
    if (window.showToast) window.showToast(`Applied smart layout: ${variation.name}`, 'success');
  }
}

window.SmartLayoutEngine = SmartLayoutEngine;
