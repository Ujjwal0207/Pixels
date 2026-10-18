/**
 * Brand Kit & Team Governance Engine for DesignPro
 * Grounded in Canva Pro Enterprise Parity & Decentralized Storage
 * 
 * Capabilities:
 * - Centralized Brand Palettes (Primary, Secondary, Accent, Neutral)
 * - Approved Brand Typography definitions
 * - Company Logos library
 * - 1-Click "Harmonize Design with Brand" recolor engine
 * - "Enforce Brand Rules" mode (restricts picking off-brand colors)
 * - Portable .brandkit JSON export and IndexedDB persistence
 */

class BrandKitEngine {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.enforceBrandRules = false;

    // Default Tech Startup Brand Kit
    this.currentKit = {
      id: 'default_brandkit',
      name: 'Atelier Studio Brand',
      colors: ['#7c3aed', '#ec4899', '#3b82f6', '#0f172a', '#f8fafc'],
      fonts: {
        heading: 'Outfit',
        subheading: 'Poppins',
        body: 'Inter',
      },
      logos: [],
    };
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  async init() {
    this.loadFromStorage();
    this.renderBrandKitUI();
  }

  async loadFromStorage() {
    if (window.app && window.app.storage && window.app.storage.db) {
      try {
        const tx = window.app.storage.db.transaction('brandkits', 'readonly');
        const store = tx.objectStore('brandkits');
        const req = store.get('active_brandkit');
        req.onsuccess = () => {
          if (req.result) {
            this.currentKit = req.result;
            this.renderBrandKitUI();
          }
        };
      } catch (e) {
        // Fallback to memory
      }
    }
  }

  async saveToStorage() {
    if (window.app && window.app.storage && window.app.storage.db) {
      try {
        const tx = window.app.storage.db.transaction('brandkits', 'readwrite');
        const store = tx.objectStore('brandkits');
        store.put({ id: 'active_brandkit', ...this.currentKit });
      } catch (e) {
        // Fallback
      }
    }
  }

  renderBrandKitUI() {
    // 1. Render Brand Palette Swatches in Brand Panel
    const paletteGrid = document.getElementById('brandkit-palette-grid');
    if (paletteGrid) {
      paletteGrid.innerHTML = '';
      this.currentKit.colors.forEach((hex, idx) => {
        const swatchWrapper = document.createElement('div');
        swatchWrapper.className = 'brand-swatch-wrapper';
        swatchWrapper.innerHTML = `
          <button class="brand-swatch-circle" style="background-color: ${hex}" title="Click to apply ${hex}"></button>
          <span class="brand-swatch-hex">${hex}</span>
        `;
        swatchWrapper.querySelector('button').addEventListener('click', () => {
          this.applyColorToSelection(hex);
        });
        paletteGrid.appendChild(swatchWrapper);
      });
    }

    // 2. Render Brand Typography Buttons
    const fontGroup = document.getElementById('brandkit-fonts-list');
    if (fontGroup) {
      fontGroup.innerHTML = `
        <div class="brand-font-row">
          <span class="font-role-tag">Heading</span>
          <button class="brand-font-btn" data-font="${this.currentKit.fonts.heading}" style="font-family: '${this.currentKit.fonts.heading}', sans-serif;">
            ${this.currentKit.fonts.heading}
          </button>
        </div>
        <div class="brand-font-row">
          <span class="font-role-tag">Subheading</span>
          <button class="brand-font-btn" data-font="${this.currentKit.fonts.subheading}" style="font-family: '${this.currentKit.fonts.subheading}', sans-serif;">
            ${this.currentKit.fonts.subheading}
          </button>
        </div>
        <div class="brand-font-row">
          <span class="font-role-tag">Body</span>
          <button class="brand-font-btn" data-font="${this.currentKit.fonts.body}" style="font-family: '${this.currentKit.fonts.body}', sans-serif;">
            ${this.currentKit.fonts.body}
          </button>
        </div>
      `;

      fontGroup.querySelectorAll('.brand-font-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const font = btn.dataset.font;
          this.applyFontToSelection(font);
        });
      });
    }

    // 3. Render Brand Logos
    const logosGrid = document.getElementById('brandkit-logos-grid');
    if (logosGrid) {
      logosGrid.innerHTML = '';
      this.currentKit.logos.forEach((logoData, idx) => {
        const logoItem = document.createElement('div');
        logoItem.className = 'brand-logo-card';
        logoItem.innerHTML = `<img src="${logoData.url}" alt="${logoData.name || 'Brand Logo'}" />`;
        logoItem.addEventListener('click', () => {
          if (window.app && window.app.imagesTool) {
            window.app.imagesTool.addImageToCanvas(logoData.url, logoData.name || 'Brand Logo');
          }
        });
        logosGrid.appendChild(logoItem);
      });
    }
  }

  applyColorToSelection(hex) {
    const active = this.canvas.getActiveObject();
    if (active) {
      if (active.type === 'i-text' || active.type === 'text') {
        active.set('fill', hex);
      } else if (active.type === 'group' || active.type === 'activeSelection') {
        active.forEachObject(obj => {
          obj.set('fill', hex);
          obj.dirty = true;
        });
        active.dirty = true;
      } else {
        active.set('fill', hex);
      }
      this.canvas.renderAll();
      this.canvasManager.recordState();
    } else {
      this.canvas.setBackgroundColor(hex, () => this.canvas.renderAll());
      this.canvasManager.recordState();
    }
    if (window.showToast) window.showToast(`Applied brand color ${hex}`, 'success');
  }

  applyFontToSelection(fontName) {
    const active = this.canvas.getActiveObject();
    if (active) {
      if (active.type === 'i-text' || active.type === 'text') {
        active.set('fontFamily', fontName);
        this.canvas.renderAll();
        this.canvasManager.recordState();
        if (window.showToast) window.showToast(`Applied brand font: ${fontName}`, 'success');
      } else if (active.type === 'activeSelection' || active.type === 'group') {
        let changed = false;
        active.forEachObject(obj => {
          if (obj.type === 'i-text' || obj.type === 'text') {
            obj.set('fontFamily', fontName);
            obj.dirty = true;
            changed = true;
          }
        });
        if (changed) {
          active.dirty = true;
          this.canvas.renderAll();
          this.canvasManager.recordState();
          if (window.showToast) window.showToast(`Applied brand font: ${fontName} to selected text`, 'success');
        } else {
          if (window.showToast) window.showToast(`No text layers found in selection`, 'info');
        }
      } else {
        if (window.showToast) window.showToast(`Select a text layer to apply ${fontName}`, 'info');
      }
    } else {
      if (window.showToast) window.showToast(`Select a text layer to apply ${fontName}`, 'info');
    }
  }

  // 1-Click "Harmonize Canvas with Brand":
  // Sweeps all shapes and text to use the brand palette automatically
  harmonizeDesign() {
    const objects = this.canvas.getObjects().filter(o => !o.isGuide);
    if (objects.length === 0) return;

    const brandPrimary = this.currentKit.colors[0];
    const brandSecondary = this.currentKit.colors[1] || brandPrimary;
    const brandAccent = this.currentKit.colors[2] || brandSecondary;

    objects.forEach((obj, idx) => {
      if (obj.type === 'i-text' || obj.type === 'text') {
        obj.set('fontFamily', this.currentKit.fonts.heading);
      } else if (obj.type === 'rect' || obj.type === 'circle' || obj.type === 'path' || obj.type === 'triangle' || obj.type === 'polygon') {
        const assignedColor = idx % 3 === 0 ? brandPrimary : (idx % 3 === 1 ? brandSecondary : brandAccent);
        obj.set('fill', assignedColor);
      } else if (obj.type === 'group') {
        obj.forEachObject((child, cIdx) => {
          if (child.type === 'i-text' || child.type === 'text') {
            child.set('fontFamily', this.currentKit.fonts.heading);
          } else if (child.type === 'rect' || child.type === 'circle' || child.type === 'path' || child.type === 'triangle' || child.type === 'polygon') {
            const assignedColor = (idx + cIdx) % 3 === 0 ? brandPrimary : ((idx + cIdx) % 3 === 1 ? brandSecondary : brandAccent);
            child.set('fill', assignedColor);
          }
          child.dirty = true;
        });
        obj.dirty = true;
      }
    });

    this.canvas.renderAll();
    this.canvasManager.recordState();
    if (window.showToast) {
      window.showToast('Design successfully harmonized with Brand Kit!', 'success');
    }
  }

  // Toggle Enforce Brand Rules
  toggleBrandEnforcement(enabled) {
    this.enforceBrandRules = enabled;
    document.body.classList.toggle('brand-rules-enforced', this.enforceBrandRules);
    if (window.showToast) {
      window.showToast(`Brand Rules Enforced: ${this.enforceBrandRules ? 'ON (Brand Swatches Only)' : 'OFF'}`, 'info');
    }
  }

  // Export .brandkit JSON
  exportBrandKit() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.currentKit, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `${this.currentKit.name.toLowerCase().replace(/\s+/g, '_')}.brandkit`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  }

  // Import .brandkit JSON
  importBrandKit(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && imported.colors) {
          this.currentKit = imported;
          this.saveToStorage();
          this.renderBrandKitUI();
          if (window.showToast) window.showToast(`Imported "${imported.name}" successfully!`, 'success');
        }
      } catch (err) {
        if (window.showToast) window.showToast('Invalid .brandkit JSON file', 'error');
      }
    };
    reader.readAsText(file);
  }
}

window.BrandKitEngine = BrandKitEngine;
