/**
 * Text Tool for DesignPro
 * Manages typography additions, presets, font styles and formatting
 */

class TextTool {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  // Add Headline
  addHeading() {
    const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

    const text = new fabric.IText('Add a heading', {
      left: artboardW / 2,
      top: artboardH / 3,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 56,
      fontWeight: 'bold',
      fill: '#0f172a',
      charSpacing: -10,
      name: 'Heading',
    });
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    this.canvas.renderAll();
  }

  // Add Subheading
  addSubheading() {
    const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

    const text = new fabric.IText('Add a subheading', {
      left: artboardW / 2,
      top: artboardH / 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 32,
      fontWeight: '500',
      fill: '#334155',
      name: 'Subheading',
    });
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    this.canvas.renderAll();
  }

  // Add Body Paragraph
  addBody() {
    const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

    const text = new fabric.IText('Add a little bit of body text that tells your story clearly.', {
      left: artboardW / 2,
      top: (artboardH / 3) * 2,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Inter',
      fontSize: 20,
      fontWeight: 'normal',
      fill: '#475569',
      width: 450,
      splitByGrapheme: true,
      name: 'Body Text',
    });
    this.canvas.add(text);
    this.canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    this.canvas.renderAll();
  }

  // Add Font Combinations
  addFontCombination(comboKey) {
    const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));
    const cx = artboardW / 2;
    const cy = artboardH / 2;

    switch (comboKey) {
      case 'luxury-serif': {
        const title = new fabric.IText('EXCLUSIVE COLLECTION', {
          left: cx,
          top: cy - 35,
          originX: 'center',
          originY: 'center',
          fontFamily: 'Playfair Display',
          fontSize: 44,
          fontWeight: 'bold',
          fontStyle: 'italic',
          fill: '#1e1b4b',
          charSpacing: 40,
        });
        const sub = new fabric.IText('AUTUMN / WINTER 2026', {
          left: cx,
          top: cy + 30,
          originX: 'center',
          originY: 'center',
          fontFamily: 'Montserrat',
          fontSize: 16,
          fontWeight: '600',
          fill: '#8b5cf6',
          charSpacing: 180,
        });
        this.canvas.add(title, sub);
        break;
      }

      case 'cyber-neon': {
        const title = new fabric.IText('NEO FUTURE', {
          left: cx,
          top: cy - 30,
          originX: 'center',
          originY: 'center',
          fontFamily: 'Space Grotesk',
          fontSize: 64,
          fontWeight: 'bold',
          fill: '#06b6d4',
          shadow: new fabric.Shadow({
            color: 'rgba(6, 182, 212, 0.6)',
            blur: 15,
            offsetX: 0,
            offsetY: 0,
          }),
        });
        const sub = new fabric.IText('VIRTUAL REALITY SUMMIT', {
          left: cx,
          top: cy + 35,
          originX: 'center',
          originY: 'center',
          fontFamily: 'Outfit',
          fontSize: 18,
          fontWeight: '600',
          fill: '#f43f5e',
          charSpacing: 100,
        });
        this.canvas.add(title, sub);
        break;
      }

      case 'vintage-script': {
        const title = new fabric.IText('Sweet Moments', {
          left: cx,
          top: cy - 25,
          originX: 'center',
          originY: 'center',
          fontFamily: 'Pacifico',
          fontSize: 52,
          fill: '#e11d48',
        });
        const sub = new fabric.IText('HANDCRAFTED WITH LOVE', {
          left: cx,
          top: cy + 35,
          originX: 'center',
          originY: 'center',
          fontFamily: 'Poppins',
          fontSize: 14,
          fontWeight: '600',
          fill: '#475569',
          charSpacing: 150,
        });
        this.canvas.add(title, sub);
        break;
      }

      case 'bold-impact': {
        const title = new fabric.IText('LIMITED EDITION', {
          left: cx,
          top: cy - 30,
          originX: 'center',
          originY: 'center',
          fontFamily: 'Bebas Neue',
          fontSize: 72,
          fill: '#000000',
          charSpacing: 80,
        });
        const sub = new fabric.IText('AVAILABLE THIS WEEKEND ONLY', {
          left: cx,
          top: cy + 30,
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: '700',
          fill: '#ffffff',
          backgroundColor: '#ef4444',
          padding: 6,
        });
        this.canvas.add(title, sub);
        break;
      }

      default:
        this.addHeading();
    }

    this.canvas.renderAll();
  }

  // Helper: Apply formatting to single text object or all text objects in an activeSelection/group
  _applyToTextSelection(handler) {
    const active = this.canvas.getActiveObject();
    if (!active) return false;

    if (active.isType('i-text') || active.isType('text') || active.isType('textbox')) {
      handler(active);
      if (typeof active.initDimensions === 'function') active.initDimensions();
      active.setCoords();
      this.canvas.renderAll();
      this.canvasManager.recordState();
      return true;
    } else if (active.type === 'activeSelection' || active.type === 'group') {
      let changed = false;
      active.forEachObject((obj) => {
        if (obj.isType('i-text') || obj.isType('text') || obj.isType('textbox')) {
          handler(obj);
          if (typeof obj.initDimensions === 'function') obj.initDimensions();
          obj.setCoords();
          obj.dirty = true;
          changed = true;
        }
      });
      if (changed) {
        active.dirty = true;
        this.canvas.renderAll();
        this.canvasManager.recordState();
        return true;
      }
    }
    return false;
  }

  // Active object formatting methods
  setFontFamily(family) {
    this._applyToTextSelection((obj) => obj.set('fontFamily', family));
  }

  setFontSize(size) {
    const val = window.AppUtils ? window.AppUtils.safeParseInt(size, 32, 6, 500) : (parseInt(size, 10) || 32);
    this._applyToTextSelection((obj) => obj.set('fontSize', val));
  }

  setTextColor(color) {
    this._applyToTextSelection((obj) => obj.set('fill', color));
  }

  toggleBold() {
    let result = false;
    this._applyToTextSelection((obj) => {
      const isBold = obj.fontWeight === 'bold';
      obj.set('fontWeight', isBold ? 'normal' : 'bold');
      result = !isBold;
    });
    return result;
  }

  toggleItalic() {
    let result = false;
    this._applyToTextSelection((obj) => {
      const isItalic = obj.fontStyle === 'italic';
      obj.set('fontStyle', isItalic ? 'normal' : 'italic');
      result = !isItalic;
    });
    return result;
  }

  toggleUnderline() {
    let result = false;
    this._applyToTextSelection((obj) => {
      const isUnderlined = !!obj.underline;
      obj.set('underline', !isUnderlined);
      result = !isUnderlined;
    });
    return result;
  }

  setTextAlign(alignment) {
    this._applyToTextSelection((obj) => obj.set('textAlign', alignment));
  }

  setLetterSpacing(spacing) {
    const val = window.AppUtils ? window.AppUtils.safeParseInt(spacing, 0, -200, 1000) : (parseInt(spacing, 10) || 0);
    this._applyToTextSelection((obj) => obj.set('charSpacing', val));
  }

  setLineHeight(height) {
    const val = window.AppUtils ? window.AppUtils.safeParseFloat(height, 1.2, 0.5, 4.0) : (parseFloat(height) || 1.2);
    this._applyToTextSelection((obj) => obj.set('lineHeight', val));
  }

  setTextShadow(shadowType) {
    let shadow = null;
    if (shadowType === 'soft') {
      shadow = new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.35)',
        blur: 10,
        offsetX: 3,
        offsetY: 3,
      });
    } else if (shadowType === 'neon') {
      shadow = new fabric.Shadow({
        color: 'rgba(236, 72, 153, 0.75)',
        blur: 20,
        offsetX: 0,
        offsetY: 0,
      });
    } else if (shadowType === 'retro') {
      shadow = new fabric.Shadow({
        color: '#000000',
        blur: 0,
        offsetX: 5,
        offsetY: 5,
      });
    }

    this._applyToTextSelection((obj) => obj.set('shadow', shadow));
  }
}

window.TextTool = TextTool;
