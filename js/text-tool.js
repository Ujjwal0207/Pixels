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
    const text = new fabric.IText('Add a heading', {
      left: this.canvas.width / 2,
      top: this.canvas.height / 3,
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
    const text = new fabric.IText('Add a subheading', {
      left: this.canvas.width / 2,
      top: this.canvas.height / 2,
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
    const text = new fabric.IText('Add a little bit of body text that tells your story clearly.', {
      left: this.canvas.width / 2,
      top: (this.canvas.height / 3) * 2,
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
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

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

  // Active object formatting methods
  setFontFamily(family) {
    const active = this.canvas.getActiveObject();
    if (active && (active.isType('i-text') || active.isType('text'))) {
      active.set('fontFamily', family);
      this.canvas.renderAll();
      this.canvasManager.recordState();
    }
  }

  setFontSize(size) {
    const active = this.canvas.getActiveObject();
    if (active && (active.isType('i-text') || active.isType('text'))) {
      active.set('fontSize', parseInt(size, 10));
      this.canvas.renderAll();
      this.canvasManager.recordState();
    }
  }

  setTextColor(color) {
    const active = this.canvas.getActiveObject();
    if (active && (active.isType('i-text') || active.isType('text'))) {
      active.set('fill', color);
      this.canvas.renderAll();
      this.canvasManager.recordState();
    }
  }

  toggleBold() {
    const active = this.canvas.getActiveObject();
    if (active && (active.isType('i-text') || active.isType('text'))) {
      const isBold = active.fontWeight === 'bold';
      active.set('fontWeight', isBold ? 'normal' : 'bold');
      this.canvas.renderAll();
      this.canvasManager.recordState();
      return !isBold;
    }
    return false;
  }

  toggleItalic() {
    const active = this.canvas.getActiveObject();
    if (active && (active.isType('i-text') || active.isType('text'))) {
      const isItalic = active.fontStyle === 'italic';
      active.set('fontStyle', isItalic ? 'normal' : 'italic');
      this.canvas.renderAll();
      this.canvasManager.recordState();
      return !isItalic;
    }
    return false;
  }

  toggleUnderline() {
    const active = this.canvas.getActiveObject();
    if (active && (active.isType('i-text') || active.isType('text'))) {
      const isUnderlined = !!active.underline;
      active.set('underline', !isUnderlined);
      this.canvas.renderAll();
      this.canvasManager.recordState();
      return !isUnderlined;
    }
    return false;
  }

  setTextAlign(alignment) {
    const active = this.canvas.getActiveObject();
    if (active && (active.isType('i-text') || active.isType('text'))) {
      active.set('textAlign', alignment);
      this.canvas.renderAll();
      this.canvasManager.recordState();
    }
  }

  setLetterSpacing(spacing) {
    const active = this.canvas.getActiveObject();
    if (active && (active.isType('i-text') || active.isType('text'))) {
      active.set('charSpacing', parseInt(spacing, 10));
      this.canvas.renderAll();
      this.canvasManager.recordState();
    }
  }

  setLineHeight(height) {
    const active = this.canvas.getActiveObject();
    if (active && (active.isType('i-text') || active.isType('text'))) {
      active.set('lineHeight', parseFloat(height));
      this.canvas.renderAll();
      this.canvasManager.recordState();
    }
  }

  setTextShadow(shadowType) {
    const active = this.canvas.getActiveObject();
    if (!active || !(active.isType('i-text') || active.isType('text'))) return;

    if (shadowType === 'none') {
      active.set('shadow', null);
    } else if (shadowType === 'soft') {
      active.set('shadow', new fabric.Shadow({
        color: 'rgba(0, 0, 0, 0.35)',
        blur: 10,
        offsetX: 3,
        offsetY: 3,
      }));
    } else if (shadowType === 'neon') {
      active.set('shadow', new fabric.Shadow({
        color: 'rgba(236, 72, 153, 0.75)',
        blur: 20,
        offsetX: 0,
        offsetY: 0,
      }));
    } else if (shadowType === 'retro') {
      active.set('shadow', new fabric.Shadow({
        color: '#000000',
        blur: 0,
        offsetX: 5,
        offsetY: 5,
      }));
    }

    this.canvas.renderAll();
    this.canvasManager.recordState();
  }
}

window.TextTool = TextTool;
