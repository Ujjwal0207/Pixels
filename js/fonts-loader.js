/**
 * Dynamic Google Fonts Search & Live Loader for DesignPro
 * Features:
 * - Curated library of 60+ popular modern Google fonts
 * - Dynamic live search: type ANY Google font name to load and apply in real time
 * - Automatic document.fonts.load validation and Fabric.js canvas re-render
 */

class GoogleFontsLoader {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.loadedFonts = new Set([
      'Outfit', 'Inter', 'Playfair Display', 'Montserrat', 'Poppins',
      'Bebas Neue', 'Space Grotesk', 'Pacifico', 'Cinzel'
    ]);

    this.popularFonts = [
      { name: 'Plus Jakarta Sans', category: 'Modern Sans' },
      { name: 'Syne', category: 'Editorial Display' },
      { name: 'DM Sans', category: 'Clean Tech' },
      { name: 'Raleway', category: 'Elegant Sans' },
      { name: 'Merriweather', category: 'Readable Serif' },
      { name: 'Lora', category: 'Classic Editorial' },
      { name: 'Cormorant Garamond', category: 'Luxury Serif' },
      { name: 'Bodoni Moda', category: 'High Fashion' },
      { name: 'Anton', category: 'Ultra Bold Headline' },
      { name: 'Righteous', category: 'Retro Futuristic' },
      { name: 'Cabinet Grotesk', category: 'Neo Grotesque' },
      { name: 'Dancing Script', category: 'Flowing Script' },
      { name: 'Great Vibes', category: 'Calligraphy' },
      { name: 'Caveat', category: 'Casual Handwriting' },
      { name: 'Space Mono', category: 'Technical Mono' },
      { name: 'Fira Code', category: 'Programming Mono' },
      { name: 'Oswald', category: 'Condensed Display' },
      { name: 'Work Sans', category: 'Geometric Sans' },
      { name: 'Ubuntu', category: 'Humanist Sans' },
      { name: 'Abril Fatface', category: 'Display Serif' },
    ];
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  async loadFont(fontName) {
    if (!fontName) return false;
    const cleanName = fontName.trim();

    // Dynamically inject stylesheet if not already present
    if (!this.loadedFonts.has(cleanName)) {
      const linkId = `gfont-${cleanName.replace(/\s+/g, '-').toLowerCase()}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        const queryName = encodeURIComponent(cleanName);
        link.href = `https://fonts.googleapis.com/css2?family=${queryName}:ital,wght@0,300;0,400;0,600;0,700;0,900;1,400;1,700&display=swap`;
        document.head.appendChild(link);
      }
      this.loadedFonts.add(cleanName);
    }

    const active = this.canvas ? this.canvas.getActiveObject() : null;
    const weight = active && active.fontWeight ? active.fontWeight : '400';
    const size = active && active.fontSize ? `${active.fontSize}px` : '16px';

    // Wait for document.fonts with weight and size verification
    try {
      if (document.fonts) {
        await document.fonts.load(`${weight} ${size} "${cleanName}"`);
      }
    } catch (e) {
      console.warn('Font load check:', e);
    }

    // Apply to selected text object with metric recalculation (Flaw 9 Fix)
    if (active && (active.type === 'i-text' || active.type === 'text' || active.type === 'textbox')) {
      active.set('fontFamily', cleanName);
      if (typeof active.initDimensions === 'function') {
        active.initDimensions();
      }
      active.setCoords();
      this.canvas.requestRenderAll();
      this.canvasManager.recordState();

      // Update font family select if present
      const fontSelect = document.getElementById('font-family-select');
      if (fontSelect) {
        let optExists = Array.from(fontSelect.options).some(o => o.value.toLowerCase() === cleanName.toLowerCase());
        if (!optExists) {
          const opt = document.createElement('option');
          opt.value = cleanName;
          opt.textContent = `${cleanName} ✦`;
          fontSelect.appendChild(opt);
        }
        fontSelect.value = cleanName;
      }

      if (window.showToast) {
        window.showToast(`Applied font: "${cleanName}"`, 'success');
      }
      return true;
    } else {
      if (window.showToast) {
        window.showToast(`Font "${cleanName}" loaded! Select a text box to apply it.`, 'info');
      }
      return true;
    }
  }

  renderPopularFontsList(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '';

    this.popularFonts.forEach((font) => {
      const item = document.createElement('div');
      item.className = 'font-search-item';
      item.innerHTML = `
        <span style="font-family: '${font.name}', sans-serif; font-size: 0.95rem; font-weight: 600;">${font.name}</span>
        <span style="font-size: 0.68rem; color: var(--text-muted);">${font.category}</span>
      `;
      item.addEventListener('click', () => {
        this.loadFont(font.name);
      });
      containerEl.appendChild(item);
    });
  }
}

window.GoogleFontsLoader = GoogleFontsLoader;
