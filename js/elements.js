/**
 * Elements Tool for DesignPro
 * Manages vector shapes, lines, arrows, badges, social icons, stickers, and decorative graphics
 */

class ElementsTool {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  getCenter() {
    return {
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    };
  }

  // 1. Rectangle
  addRect(rounded = false) {
    const center = this.getCenter();
    const rect = new fabric.Rect({
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      width: 220,
      height: 160,
      fill: '#8b5cf6',
      rx: rounded ? 20 : 0,
      ry: rounded ? 20 : 0,
      stroke: '',
      strokeWidth: 0,
      name: rounded ? 'Rounded Rectangle' : 'Rectangle',
    });
    this.canvas.add(rect);
    this.canvas.setActiveObject(rect);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 2. Circle
  addCircle() {
    const center = this.getCenter();
    const circle = new fabric.Circle({
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      radius: 90,
      fill: '#ec4899',
      name: 'Circle',
    });
    this.canvas.add(circle);
    this.canvas.setActiveObject(circle);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 3. Triangle
  addTriangle() {
    const center = this.getCenter();
    const triangle = new fabric.Triangle({
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      width: 180,
      height: 180,
      fill: '#06b6d4',
      name: 'Triangle',
    });
    this.canvas.add(triangle);
    this.canvas.setActiveObject(triangle);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 4. 5-Point Star
  addStar() {
    const center = this.getCenter();
    const starPath = 'M 100 0 L 129 60 L 195 69 L 147 115 L 158 181 L 100 150 L 42 181 L 53 115 L 5 69 L 71 60 Z';
    const star = new fabric.Path(starPath, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      scaleX: 1.2,
      scaleY: 1.2,
      fill: '#f59e0b',
      name: 'Star',
    });
    this.canvas.add(star);
    this.canvas.setActiveObject(star);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 5. Heart
  addHeart() {
    const center = this.getCenter();
    const heartPath = 'M 10,30 A 20,20 0,0,1 50,30 A 20,20 0,0,1 90,30 Q 90,60 50,90 Q 10,60 10,30 Z';
    const heart = new fabric.Path(heartPath, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      scaleX: 2.2,
      scaleY: 2.2,
      fill: '#f43f5e',
      name: 'Heart',
    });
    this.canvas.add(heart);
    this.canvas.setActiveObject(heart);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 6. Hexagon
  addHexagon() {
    const center = this.getCenter();
    const points = [
      { x: 50, y: 0 },
      { x: 100, y: 28 },
      { x: 100, y: 85 },
      { x: 50, y: 114 },
      { x: 0, y: 85 },
      { x: 0, y: 28 },
    ];
    const poly = new fabric.Polygon(points, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      scaleX: 1.6,
      scaleY: 1.6,
      fill: '#6366f1',
      name: 'Hexagon',
    });
    this.canvas.add(poly);
    this.canvas.setActiveObject(poly);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 7. Line (Solid / Dashed)
  addLine(dashed = false) {
    const center = this.getCenter();
    const line = new fabric.Line([center.x - 140, center.y, center.x + 140, center.y], {
      stroke: '#334155',
      strokeWidth: 4,
      strokeDashArray: dashed ? [8, 8] : null,
      name: dashed ? 'Dashed Line' : 'Line',
    });
    this.canvas.add(line);
    this.canvas.setActiveObject(line);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 8. Arrow
  addArrow() {
    const center = this.getCenter();
    const line = new fabric.Line([0, 0, 180, 0], {
      stroke: '#0f172a',
      strokeWidth: 4,
      originX: 'center',
      originY: 'center',
    });
    const head = new fabric.Triangle({
      left: 90,
      top: 0,
      originX: 'center',
      originY: 'center',
      angle: 90,
      width: 18,
      height: 20,
      fill: '#0f172a',
    });
    const group = new fabric.Group([line, head], {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      name: 'Arrow',
    });
    this.canvas.add(group);
    this.canvas.setActiveObject(group);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 9. Sparkle / Starburst
  addSparkle() {
    const center = this.getCenter();
    const sparklePath = 'M 100 0 Q 100 80 180 100 Q 100 120 100 200 Q 100 120 20 100 Q 100 80 100 0 Z';
    const sparkle = new fabric.Path(sparklePath, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      scaleX: 1,
      scaleY: 1,
      fill: '#fbbf24',
      name: 'Sparkle',
    });
    this.canvas.add(sparkle);
    this.canvas.setActiveObject(sparkle);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 10. Organic Smooth Blob
  addBlob(variant = 1) {
    const center = this.getCenter();
    const pathData = variant === 1
      ? 'M 140 20 C 220 10 260 80 250 150 C 240 220 180 260 110 250 C 40 240 10 180 20 110 C 30 40 60 30 140 20 Z'
      : 'M 120 10 C 210 20 270 90 240 170 C 210 250 130 260 60 220 C -10 180 10 110 40 50 C 70 -10 120 10 120 10 Z';
    
    const blob = new fabric.Path(pathData, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      scaleX: 1.1,
      scaleY: 1.1,
      fill: variant === 1 ? '#a78bfa' : '#38bdf8',
      name: `Organic Blob ${variant}`,
    });
    this.canvas.add(blob);
    this.canvas.setActiveObject(blob);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 11. Speech Bubble / Callout
  addSpeechBubble() {
    const center = this.getCenter();
    const bubblePath = 'M 20 20 H 180 A 16 16 0 0 1 196 36 V 124 A 16 16 0 0 1 180 140 H 70 L 40 175 V 140 H 20 A 16 16 0 0 1 4 124 V 36 A 16 16 0 0 1 20 20 Z';
    const bubble = new fabric.Path(bubblePath, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      fill: '#ffffff',
      stroke: '#cbd5e1',
      strokeWidth: 3,
      scaleX: 1.2,
      scaleY: 1.2,
      name: 'Speech Bubble',
    });
    this.canvas.add(bubble);
    this.canvas.setActiveObject(bubble);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 12. Elegant Ribbon Banner
  addRibbon() {
    const center = this.getCenter();
    const ribbonPath = 'M 20 30 L 180 30 L 165 55 L 180 80 L 20 80 L 35 55 Z';
    const ribbon = new fabric.Path(ribbonPath, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      scaleX: 1.8,
      scaleY: 1.4,
      fill: '#f59e0b',
      name: 'Ribbon Banner',
    });
    this.canvas.add(ribbon);
    this.canvas.setActiveObject(ribbon);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 13. Shield / Security Crest
  addShield() {
    const center = this.getCenter();
    const shieldPath = 'M 100 10 L 180 40 V 110 C 180 170 100 210 100 210 C 100 210 20 170 20 110 V 40 Z';
    const shield = new fabric.Path(shieldPath, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      scaleX: 1.1,
      scaleY: 1.1,
      fill: '#10b981',
      name: 'Shield',
    });
    this.canvas.add(shield);
    this.canvas.setActiveObject(shield);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 14. Diamond / Rhombus
  addDiamond() {
    const center = this.getCenter();
    const diamondPath = 'M 100 10 L 190 100 L 100 190 L 10 100 Z';
    const diamond = new fabric.Path(diamondPath, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      scaleX: 1.2,
      scaleY: 1.2,
      fill: '#0284c7',
      name: 'Diamond',
    });
    this.canvas.add(diamond);
    this.canvas.setActiveObject(diamond);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 15. Wave Divider Section
  addWaveDivider() {
    const center = this.getCenter();
    const wavePath = 'M 0 50 C 60 20 120 80 180 50 C 240 20 300 80 360 50 L 360 100 L 0 100 Z';
    const wave = new fabric.Path(wavePath, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      scaleX: 1.4,
      scaleY: 1.2,
      fill: '#6366f1',
      name: 'Wave Divider',
    });
    this.canvas.add(wave);
    this.canvas.setActiveObject(wave);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 16. Luxury Crown
  addCrown() {
    const center = this.getCenter();
    const crownPath = 'M 20 80 L 40 20 L 70 50 L 100 15 L 130 50 L 160 20 L 180 80 Z';
    const crown = new fabric.Path(crownPath, {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      scaleX: 1.4,
      scaleY: 1.4,
      fill: '#eab308',
      name: 'Royal Crown',
    });
    this.canvas.add(crown);
    this.canvas.setActiveObject(crown);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 17. Polaroid Frame / Photo Card
  addPolaroidFrame() {
    const center = this.getCenter();
    const cardBg = new fabric.Rect({
      width: 240,
      height: 290,
      rx: 8,
      ry: 8,
      fill: '#ffffff',
      stroke: '#e2e8f0',
      strokeWidth: 2,
      shadow: new fabric.Shadow({
        color: 'rgba(15, 23, 42, 0.12)',
        blur: 16,
        offsetX: 0,
        offsetY: 8,
      }),
      originX: 'center',
      originY: 'center',
    });

    const photoArea = new fabric.Rect({
      top: -30,
      width: 204,
      height: 190,
      fill: '#f1f5f9',
      stroke: '#cbd5e1',
      strokeWidth: 1,
      originX: 'center',
      originY: 'center',
    });

    const label = new fabric.Text('Photo Frame', {
      top: 100,
      originX: 'center',
      originY: 'center',
      fontFamily: 'Outfit',
      fontSize: 16,
      fontWeight: '600',
      fill: '#64748b',
    });

    const frameGroup = new fabric.Group([cardBg, photoArea, label], {
      left: center.x,
      top: center.y,
      originX: 'center',
      originY: 'center',
      name: 'Polaroid Frame',
    });

    this.canvas.add(frameGroup);
    this.canvas.setActiveObject(frameGroup);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 18. Pre-styled Designer Stickers & Badges
  addSticker(stickerType) {
    const center = this.getCenter();

    switch (stickerType) {
      case 'sale': {
        const starburstPath = 'M 100 0 L 120 25 L 150 15 L 160 45 L 190 50 L 185 80 L 205 100 L 185 120 L 190 150 L 160 155 L 150 185 L 120 175 L 100 200 L 80 175 L 50 185 L 40 155 L 10 150 L 15 120 L -5 100 L 15 80 L 10 50 L 40 45 L 50 15 L 80 25 Z';
        const bg = new fabric.Path(starburstPath, {
          originX: 'center',
          originY: 'center',
          fill: '#ef4444',
          scaleX: 0.9,
          scaleY: 0.9,
        });
        const label = new fabric.Text('50% OFF', {
          originX: 'center',
          originY: 'center',
          fontFamily: 'Outfit',
          fontSize: 22,
          fontWeight: '900',
          fill: '#ffffff',
        });
        const group = new fabric.Group([bg, label], {
          left: center.x,
          top: center.y,
          originX: 'center',
          originY: 'center',
          name: 'Sale Sticker',
        });
        this.canvas.add(group);
        this.canvas.setActiveObject(group);
        break;
      }

      case 'new': {
        const pillBg = new fabric.Rect({
          width: 160,
          height: 48,
          rx: 24,
          ry: 24,
          fill: '#10b981',
          originX: 'center',
          originY: 'center',
        });
        const label = new fabric.Text('★ NEW ARRIVAL', {
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter',
          fontSize: 15,
          fontWeight: '800',
          fill: '#ffffff',
          charSpacing: 60,
        });
        const group = new fabric.Group([pillBg, label], {
          left: center.x,
          top: center.y,
          originX: 'center',
          originY: 'center',
          name: 'New Sticker',
        });
        this.canvas.add(group);
        this.canvas.setActiveObject(group);
        break;
      }

      case 'bestseller': {
        const badgeBg = new fabric.Rect({
          width: 180,
          height: 44,
          rx: 6,
          ry: 6,
          fill: '#f59e0b',
          originX: 'center',
          originY: 'center',
        });
        const label = new fabric.Text('🏆 #1 BESTSELLER', {
          originX: 'center',
          originY: 'center',
          fontFamily: 'Montserrat',
          fontSize: 14,
          fontWeight: '800',
          fill: '#ffffff',
          charSpacing: 40,
        });
        const group = new fabric.Group([badgeBg, label], {
          left: center.x,
          top: center.y,
          originX: 'center',
          originY: 'center',
          name: 'Bestseller Badge',
        });
        this.canvas.add(group);
        this.canvas.setActiveObject(group);
        break;
      }

      case 'verified': {
        const circle = new fabric.Circle({
          radius: 32,
          fill: '#3b82f6',
          originX: 'center',
          originY: 'center',
        });
        const check = new fabric.Text('✓', {
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter',
          fontSize: 36,
          fontWeight: '900',
          fill: '#ffffff',
        });
        const group = new fabric.Group([circle, check], {
          left: center.x,
          top: center.y,
          originX: 'center',
          originY: 'center',
          name: 'Verified Stamp',
        });
        this.canvas.add(group);
        this.canvas.setActiveObject(group);
        break;
      }

      case 'exclusive': {
        const pillBg = new fabric.Rect({
          width: 190,
          height: 44,
          rx: 22,
          ry: 22,
          fill: '#0f172a',
          stroke: '#eab308',
          strokeWidth: 2,
          originX: 'center',
          originY: 'center',
        });
        const label = new fabric.Text('LIMITED EDITION', {
          originX: 'center',
          originY: 'center',
          fontFamily: 'Cinzel',
          fontSize: 13,
          fontWeight: 'bold',
          fill: '#fef08a',
          charSpacing: 100,
        });
        const group = new fabric.Group([pillBg, label], {
          left: center.x,
          top: center.y,
          originX: 'center',
          originY: 'center',
          name: 'Limited Edition Badge',
        });
        this.canvas.add(group);
        this.canvas.setActiveObject(group);
        break;
      }

      default:
        this.addBadge();
        return;
    }

    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // 19. Add Badge / Sale Sticker (Legacy fallback)
  addBadge(text = '50% OFF') {
    this.addSticker('sale');
  }

  // 20. Add Social & Tech Vector Icons
  addSocialIcon(iconType) {
    const center = this.getCenter();
    const icons = {
      instagram: `<svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="#E1306C"/><circle cx="12" cy="12" r="4" fill="none" stroke="#fff" stroke-width="2"/><circle cx="18" cy="6" r="1.2" fill="#fff"/></svg>`,
      youtube: `<svg viewBox="0 0 24 24"><path fill="#FF0000" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="#fff" points="9.545 15.568 15.818 12 9.545 8.432"/></svg>`,
      twitter: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#000"/><path fill="#fff" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
      linkedin: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#0A66C2"/><path fill="#fff" d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.3a1.63 1.63 0 0 0-1.63 1.63c0 .9.73 1.63 1.63 1.63a1.63 1.63 0 0 0 1.63-1.63c0-.9-.73-1.63-1.63-1.63z"/></svg>`,
      facebook: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="4" fill="#1877F2"/><path fill="#fff" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
      globe: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#0ea5e9"/><path fill="none" stroke="#fff" stroke-width="1.8" d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"/></svg>`,
      mail: `<svg viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="2" fill="#8b5cf6"/><path d="M2 7l10 7 10-7" fill="none" stroke="#fff" stroke-width="2"/></svg>`,
      phone: `<svg viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#10b981"/><path fill="#fff" d="M6.62 10.79a15.053 15.053 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2z"/></svg>`,
      location: `<svg viewBox="0 0 24 24"><path fill="#ef4444" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`,
      checkBadge: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#3b82f6"/><path fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M8 12.5l2.5 2.5L16 9.5"/></svg>`,
    };

    const svgStr = icons[iconType] || icons.instagram;
    fabric.loadSVGFromString(svgStr, (objects, options) => {
      const iconGroup = fabric.util.groupSVGElements(objects, options);
      iconGroup.set({
        left: center.x,
        top: center.y,
        originX: 'center',
        originY: 'center',
        scaleX: 2.5,
        scaleY: 2.5,
        name: `${iconType} Icon`,
      });
      this.canvas.add(iconGroup);
      this.canvas.setActiveObject(iconGroup);
      this.canvas.renderAll();
      this.canvasManager.recordState();
    });
  }

  // Active element properties
  setFillColor(color) {
    const active = this.canvas.getActiveObject();
    if (!active) return;

    if (active.type === 'group') {
      active.forEachObject((obj) => {
        if (obj.type !== 'text') obj.set('fill', color);
      });
    } else {
      active.set('fill', color);
    }

    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  setStrokeColor(color) {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    active.set('stroke', color);
    if (!active.strokeWidth) active.set('strokeWidth', 2);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  setStrokeWidth(width) {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    active.set('strokeWidth', parseInt(width, 10));
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  setOpacity(val) {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    active.set('opacity', parseFloat(val));
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  flipX() {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    active.set('flipX', !active.flipX);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  flipY() {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    active.set('flipY', !active.flipY);
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }
}

window.ElementsTool = ElementsTool;
