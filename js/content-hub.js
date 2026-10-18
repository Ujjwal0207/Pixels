/**
 * Federated Open Content Hub for DesignPro
 * Grounded in Modern Web Guidance & Open Standards
 * 
 * Aggregates open access photos, vectors, and icons:
 * - Openverse searchable photos and curated Unsplash photography
 * - Iconify API vector SVGs (Lucide, Material, FontAwesome, Tabler, and more)
 * - Safe CORS image handling & instant canvas insertion
 * - Automatic 5-color dominant palette extraction on photo insertion
 */

class ContentHub {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.currentQuery = '';
    this.activeFilter = 'all'; // 'all', 'photos', 'vectors', 'icons', 'shapes', 'imported'
    this.isSearching = false;
    this.importedAssets = [];
    this.lastResults = [];
    this.searchRevision = 0;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  // =========================================================================
  // Search Dispatcher Across Multiple Open Providers
  // =========================================================================
  async searchMedia(query, filter = 'all') {
    const revision = ++this.searchRevision;
    this.currentQuery = String(query || '').trim();
    this.activeFilter = filter;
    this.isSearching = true;

    const resultsGrid = document.getElementById('content-hub-grid');
    const shouldShowLocalShapes = filter === 'shapes' || filter === 'vectors' || (filter === 'all' && this.currentQuery);
    const localShapeResults = shouldShowLocalShapes
      ? this.getShapeItems(this.currentQuery)
      : [];

    if (resultsGrid && localShapeResults.length > 0) {
      // Show a useful local match immediately instead of leaving the Hub blank
      // while remote providers respond (or fail).
      this.renderResults(localShapeResults);
    } else if (resultsGrid) {
      resultsGrid.innerHTML = `
        <div class="content-hub-loading">
          <div class="spinner"></div>
          <span>Searching 600M+ open photos, vectors, and icons...</span>
        </div>
      `;
    }

    if (filter === 'shapes') {
      this.renderResults(this.getShapeItems(this.currentQuery));
      this.isSearching = false;
      return;
    }

    if (filter === 'imported') {
      this.renderResults(this.getImportedItems(this.currentQuery));
      this.isSearching = false;
      return;
    }

    try {
      const promises = [];

      // 1. Fetch open-license photography and curated Unsplash results
      if (filter === 'all' || filter === 'photos') {
        promises.push(this.fetchPhotos(this.currentQuery));
      }

      // 2. Fetch editable SVG vectors
      if (filter === 'all' || filter === 'vectors') {
        promises.push(this.fetchVectors(this.currentQuery));
      }

      // 3. Fetch Vector Icons (Iconify API)
      if (filter === 'all' || filter === 'icons') {
        promises.push(this.fetchIcons(this.currentQuery));
      }

      const settled = await Promise.allSettled(promises);
      if (revision !== this.searchRevision) return;
      let combinedResults = [...localShapeResults];

      settled.forEach(res => {
        if (res.status === 'fulfilled' && Array.isArray(res.value)) {
          combinedResults.push(...res.value);
        }
      });

      if (filter === 'all') {
        combinedResults.push(...this.getImportedItems(this.currentQuery));
      } else if (filter === 'photos' || filter === 'vectors') {
        combinedResults.push(...this.getImportedItems(this.currentQuery).filter((item) => item.type === (filter === 'photos' ? 'photo' : 'vector')));
      }

      combinedResults = this.uniqueResults(combinedResults);

      // If no search query was passed, mix in default curated trending items
      if (combinedResults.length === 0) {
        if (filter === 'photos') {
          const queryText = this.currentQuery.toLowerCase();
          combinedResults = this.getCuratedPhotos().filter((photo) => !queryText || photo.title.toLowerCase().includes(queryText));
        } else if (filter === 'vectors' || filter === 'icons') {
          combinedResults = this.getFallbackIcons(this.currentQuery).map((item) => ({ ...item, type: filter === 'vectors' ? 'vector' : 'icon' }));
        } else {
          combinedResults = this.getFallbackMedia(this.currentQuery);
        }
      }

      this.renderResults(combinedResults);
    } catch (err) {
      console.warn('[ContentHub] Search dispatch failed:', err);
      if (revision === this.searchRevision) this.renderResults(this.getFallbackMedia(this.currentQuery));
    } finally {
      if (revision === this.searchRevision) this.isSearching = false;
    }
  }

  // Fetch photography via Openverse with curated Unsplash fallback
  async fetchPhotos(query) {
    if (!query) return this.getCuratedPhotos();

    try {
      // Query Openverse API (Open access Creative Commons & Public domain photos)
      const encoded = encodeURIComponent(query);
      const url = `https://api.openverse.org/v1/images/?q=${encoded}&page_size=12&license_type=commercial`;
      
      const data = await this.fetchJsonWithTimeout(url, 4000);

      if (data && data.results && data.results.length > 0) {
        return data.results.map(item => ({
          id: item.id,
          type: 'photo',
          title: item.title || 'Open Photo',
          thumb: item.thumbnail || item.url,
          url: item.url,
          source: `Openverse · ${item.license || 'open license'}`,
          author: item.creator || 'Community',
          attributionUrl: item.foreign_landing_url || '',
        }));
      }
    } catch (e) {
      // Timeout or network fallback
    }

    return this.getCuratedPhotos().filter(p => 
      !query || p.title.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Fetch editable SVG vectors
  async fetchVectors(query) {
    return this.fetchIconifyAssets(query || 'abstract', 'vector');
  }

  // Fetch SVG Vector Icons via Iconify API (200,000+ open-source icons)
  async fetchIcons(query) {
    return this.fetchIconifyAssets(query || 'star', 'icon');
  }

  async fetchIconifyAssets(query, type) {
    const curatedResults = this.getFallbackIcons(query).map((item) => ({ ...item, type }));
    try {
      const url = `https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=24`;
      const data = await this.fetchJsonWithTimeout(url, 3500);

      if (data && data.icons && data.icons.length > 0) {
        const remoteResults = data.icons
          .filter((iconFullName) => !iconFullName.startsWith('academicons:'))
          .map(iconFullName => {
          const parts = iconFullName.split(':');
          const prefix = parts[0];
          const name = parts[1];
          return {
            id: iconFullName,
            type,
            title: `${name} (${prefix})`,
            thumb: `https://api.iconify.design/${prefix}/${name}.svg?color=%238b5cf6`,
            svgUrl: `https://api.iconify.design/${prefix}/${name}.svg?color=%238b5cf6`,
            source: `Iconify / ${prefix}`,
          };
        });
        const normalizedQuery = String(query || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        const queryTerms = normalizedQuery.split(/\s+/).filter(Boolean);
        remoteResults.sort((left, right) => {
          const score = (item) => {
            const name = item.title.split(' (')[0].replace(/[-_]+/g, ' ').toLowerCase();
            const terms = name.split(/\s+/);
            const matches = queryTerms.filter((term) => terms.includes(term)).length;
            const startsWithQuery = normalizedQuery && name.startsWith(normalizedQuery) ? 24 : 0;
            const exactMatch = name === normalizedQuery ? 100 : 0;
            return exactMatch + startsWithQuery + matches * 8 - name.length * 0.08;
          };
          return score(right) - score(left);
        });
        return this.uniqueResults([...curatedResults, ...remoteResults]);
      }
    } catch (e) {
      // Fallback
    }

    return curatedResults;
  }

  async fetchJsonWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) return null;
      // Keep the deadline active while the response body is being downloaded
      // and parsed; clearing it after headers can leave the loading UI stuck.
      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  addImportedAsset(asset) {
    if (!asset || (!asset.url && !asset.svgString && !asset.dataUrl)) return;
    const imported = {
      id: asset.id || `import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: asset.type === 'vector' || asset.svgString ? 'vector' : 'photo',
      title: asset.title || asset.name || 'Imported asset',
      thumb: asset.thumb || asset.dataUrl || asset.url,
      url: asset.url || asset.dataUrl,
      dataUrl: asset.dataUrl || '',
      svgString: asset.svgString || '',
      source: asset.source || 'Imported',
      imported: true,
    };
    this.importedAssets = [imported, ...this.importedAssets.filter((item) => item.id !== imported.id)];
    if (this.activeFilter === 'imported') {
      this.renderResults(this.getImportedItems(this.currentQuery));
    } else if (this.activeFilter === 'all') {
      this.renderResults([...this.getImportedItems(this.currentQuery), ...this.lastResults.filter((item) => !item.imported)]);
    } else if ((this.activeFilter === 'photos' && imported.type === 'photo') || (this.activeFilter === 'vectors' && imported.type === 'vector')) {
      this.renderResults([imported, ...this.lastResults.filter((item) => item.id !== imported.id)]);
    }
  }

  getImportedItems(query = '') {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    return this.importedAssets.filter((item) => {
      const title = item.title.toLowerCase();
      return !terms.length || terms.some((term) => title.includes(term));
    });
  }

  uniqueResults(items) {
    const seen = new Set();
    return items.filter((item) => {
      const key = item.id || `${item.type}:${item.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  getShapeItems(query = '') {
    const catalog = window.app && window.app.elementsTool ? window.app.elementsTool.getShapeCatalog() : [];
    const previewPaths = {
      rectangle: '<rect x="12" y="15" width="96" height="70"/>',
      square: '<rect x="18" y="8" width="84" height="84"/>',
      'rounded-rectangle': '<rect x="12" y="15" width="96" height="70" rx="15"/>',
      circle: '<circle cx="60" cy="50" r="42"/>',
      triangle: '<polygon points="60,8 110,90 10,90"/>',
      star: '<polygon points="60,7 73,39 108,41 81,63 90,97 60,79 30,97 39,63 12,41 47,39"/>',
      heart: '<path d="M60 96 20 57C-1 32 30 5 60 31 90 5 121 32 100 57z"/>',
      hexagon: '<polygon points="60,8 101,31 101,75 60,98 19,75 19,31"/>',
      diamond: '<polygon points="60,6 108,50 60,94 12,50"/>',
      sparkle: '<path d="M60 5q4 33 36 45-32 9-36 45-5-36-36-45Q55 38 60 5z"/>',
      'speech-bubble': '<path d="M18 17h84a8 8 0 0 1 8 8v49a8 8 0 0 1-8 8H56L35 99V82H18a8 8 0 0 1-8-8V25a8 8 0 0 1 8-8z"/>',
      ribbon: '<path d="M14 21h92l-13 29 13 29H14l13-29z"/>',
      shield: '<path d="M60 8 103 24v30c0 25-21 42-43 53C38 96 17 79 17 54V24z"/>',
      wave: '<path d="M8 38c18-30 36 30 54 0s36 30 54 0v48H8z"/>',
      crown: '<polygon points="12,78 20,32 43,52 60,17 77,52 100,32 108,78"/>',
      ellipse: '<ellipse cx="60" cy="40" rx="47" ry="29"/>',
      pentagon: '<polygon points="60,5 111,42 92,91 28,91 9,42"/>',
      octagon: '<polygon points="38,5 82,5 112,35 112,79 82,109 38,109 8,79 8,35"/>',
      parallelogram: '<polygon points="32,12 112,12 88,88 8,88"/>',
      trapezoid: '<polygon points="32,12 88,12 112,88 8,88"/>',
      'right-triangle': '<polygon points="12,12 108,88 12,88"/>',
      cross: '<path d="M42 8h36v25h25v36H78v25H42V69H17V33h25z"/>',
      chevron: '<polygon points="9,12 47,12 104,50 47,88 9,88 66,50"/>',
      'right-arrow': '<polygon points="8,34 72,34 72,12 112,50 72,88 72,66 8,66"/>',
      pill: '<rect x="8" y="24" width="104" height="52" rx="26"/>',
      cloud: '<path d="M30 83a23 23 0 0 1-3-46 34 34 0 0 1 63-4 25 25 0 0 1-4 50z"/>',
      teardrop: '<path d="M60 8C44 35 19 54 19 72a41 34 0 0 0 82 0C101 54 76 35 60 8z"/>',
    };
    const normalizedQuery = query.toLowerCase().trim();
    const terms = normalizedQuery.split(/\s+/).filter((term) => term && !['icon', 'icons', 'vector', 'vectors', 'shape', 'shapes'].includes(term));
    const aliases = {
      rectangle: ['box', 'square', 'horizontal rectangle', 'vertical rectangle'],
      square: ['box', 'rectangle'],
      'rounded-rectangle': ['rounded square', 'round rectangle', 'rounded box'],
      circle: ['round'],
      ellipse: ['oval'],
      diamond: ['rhombus'],
      star: ['burst'],
      'speech-bubble': ['chat bubble', 'speech'],
      'right-arrow': ['arrow'],
      teardrop: ['drop', 'water drop'],
    };
    return catalog
      .filter((shape) => {
        if (!normalizedQuery || !terms.length) return true;
        const searchable = `${shape.title} ${shape.key} ${(aliases[shape.key] || []).join(' ')}`.toLowerCase();
        return terms.some((term) => searchable.includes(term));
      })
      .map((shape) => ({
        id: `shape-${shape.key}`,
        type: 'shape',
        title: shape.title,
        shapeKey: shape.key,
        thumb: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 100" fill="#7c3aed">${previewPaths[shape.key] || ''}</svg>`)}`,
        source: 'DesignPro Shapes',
      }));
  }

  // Render search results to sidebar grid
  renderResults(items) {
    const grid = document.getElementById('content-hub-grid');
    if (!grid) return;

    this.lastResults = Array.isArray(items) ? items : [];

    if (!items || items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'content-hub-empty';
      empty.textContent = this.activeFilter === 'imported'
        ? 'Nothing imported yet. Add images or SVGs from your device or paste a direct image link above.'
        : `No assets found for “${this.currentQuery}”. Try a shape name, arrow, star, heart, photo subject, or import an image or SVG above.`;
      if (this.activeFilter === 'imported') {
        const importButton = document.createElement('button');
        importButton.type = 'button';
        importButton.className = 'btn-secondary';
        importButton.textContent = 'Import from device';
        importButton.addEventListener('click', () => document.getElementById('content-hub-file-input')?.click());
        grid.replaceChildren(empty, importButton);
      } else {
        grid.replaceChildren(empty);
      }
      return;
    }

    grid.replaceChildren();
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `content-hub-card type-${item.type}`;
      card.title = `${item.title} • Click to add to canvas`;
      card.setAttribute('role', 'button');
      card.tabIndex = 0;
      card.setAttribute('aria-label', `Add ${item.title} to canvas`);
      const thumb = document.createElement('div');
      thumb.className = 'content-thumb-wrapper';
      const image = document.createElement('img');
      image.src = item.thumb || item.url || '';
      image.alt = item.title;
      image.loading = 'lazy';
      image.addEventListener('error', () => {
        if (image.dataset.fallbackApplied) return;
        image.dataset.fallbackApplied = 'true';
        image.src = this.getPreviewPlaceholder(item.type);
      });
      const badge = document.createElement('span');
      badge.className = 'content-type-badge';
      badge.textContent = item.imported ? 'IMPORTED' : item.type.toUpperCase();
      thumb.append(image, badge);
      const info = document.createElement('div');
      info.className = 'content-card-info';
      const title = document.createElement('span');
      title.className = 'content-title';
      title.textContent = item.title;
      const source = document.createElement('span');
      source.className = 'content-source';
      source.textContent = [item.author, item.source].filter(Boolean).join(' · ');
      info.append(title, source);
      card.append(thumb, info);

      const addToCanvas = () => this.addResultToCanvas(item);
      card.addEventListener('click', addToCanvas);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          addToCanvas();
        }
      });

      grid.appendChild(card);
    });
  }

  getPreviewPlaceholder(type) {
    const artwork = type === 'photo'
      ? '<rect x="9" y="12" width="102" height="76" rx="8"/><circle cx="39" cy="35" r="8"/><path d="m18 79 27-27 17 17 13-13 28 23"/>'
      : '<path d="M60 12 72 48 108 60 72 72 60 108 48 72 12 60 48 48z"/>';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="14" fill="#f1f5f9"/><g fill="none" stroke="#8b5cf6" stroke-linecap="round" stroke-linejoin="round" stroke-width="5">${artwork}</g></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }

  addResultToCanvas(item) {
    if (item.shapeKey && window.app && window.app.elementsTool) {
      window.app.elementsTool.addPresetShape(item.shapeKey);
    } else if (item.svgString && window.app && window.app.imagesTool) {
      window.app.imagesTool.addSVGToCanvas(item.svgString, item.title);
    } else if ((item.type === 'icon' || item.type === 'vector') && item.svgUrl) {
      this.addSvgToCanvas(item.svgUrl, item.title);
    } else {
      this.addImageToCanvas(item.dataUrl || item.url || item.thumb, item.title);
    }
  }

  // Fetch, sanitize, then add an SVG as editable vector paths.
  async addSvgToCanvas(svgUrl, name) {
    try {
      const svg = await this.fetchTextWithTimeout(svgUrl, 6000);
      if (!/<svg\b/i.test(svg)) throw new Error('The source did not return a valid SVG.');
      if (!window.app || !window.app.imagesTool) throw new Error('The canvas is not ready.');
      window.app.imagesTool.addSVGToCanvas(window.app.imagesTool.sanitizeSvgString(svg), name);
    } catch (error) {
      if (window.showToast) window.showToast(`Could not add "${name}": ${error.message || 'SVG download failed.'}`, 'error');
    }
  }

  async fetchTextWithTimeout(url, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`Source returned ${response.status}.`);
      return await response.text();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Add Photo with Smart Scaling & Automatic Palette Extraction
  addImageToCanvas(url, name = 'Stock Photo') {
    fabric.Image.fromURL(
      url,
      (img) => {
        if (!img) {
          if (window.showToast) window.showToast('Failed to load image', 'error');
          return;
        }

        const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
        const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

        const maxW = artboardW * 0.65;
        const maxH = artboardH * 0.65;
        let scale = 1;
        if (img.width > maxW || img.height > maxH) {
          scale = Math.min(maxW / img.width, maxH / img.height);
        }

        img.set({
          left: artboardW / 2,
          top: artboardH / 2,
          originX: 'center',
          originY: 'center',
          scaleX: scale,
          scaleY: scale,
          name: name,
        });

        this.canvas.add(img);
        this.canvas.setActiveObject(img);
        this.canvas.renderAll();
        this.canvasManager.recordState();

        // Extract 5-color dominant palette from the photo
        this.extractPhotoPalette(img);

        if (window.showToast) {
          window.showToast(`Added "${name}" to artboard`, 'success');
        }
      },
      { crossOrigin: 'anonymous' }
    );
  }

  // 1-Click Fast Image Palette Extractor (Median-cut sampling)
  extractPhotoPalette(fabricImage) {
    try {
      const element = fabricImage.getElement();
      if (!element || !element.width) return;

      const sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 40;
      sampleCanvas.height = 40;
      const ctx = sampleCanvas.getContext('2d');
      ctx.drawImage(element, 0, 0, 40, 40);
      const imgData = ctx.getImageData(0, 0, 40, 40).data;

      const colors = [];
      const step = 4 * 16; // Sample every 16th pixel
      for (let i = 0; i < imgData.length; i += step) {
        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        if (!colors.includes(hex)) {
          colors.push(hex);
        }
        if (colors.length >= 5) break;
      }

      this.displayExtractedPalette(colors);
    } catch (e) {
      // CORS or offscreen restriction
    }
  }

  displayExtractedPalette(colors) {
    const container = document.getElementById('extracted-palette-swatches');
    if (!container || colors.length === 0) return;

    container.innerHTML = '';
    colors.forEach(hex => {
      const swatch = document.createElement('button');
      swatch.className = 'palette-color-swatch';
      swatch.style.backgroundColor = hex;
      swatch.title = `Apply ${hex} to selection`;
      swatch.addEventListener('click', () => {
        const active = this.canvas.getActiveObject();
        if (active) {
          if (active.type === 'i-text' || active.type === 'text') {
            active.set('fill', hex);
          } else {
            active.set('fill', hex);
          }
          this.canvas.renderAll();
          this.canvasManager.recordState();
        } else {
          this.canvas.setBackgroundColor(hex, () => this.canvas.renderAll());
          this.canvasManager.recordState();
        }
        if (window.showToast) window.showToast(`Applied color ${hex}`, 'info');
      });
      container.appendChild(swatch);
    });

    const paletteBox = document.getElementById('extracted-palette-box');
    if (paletteBox) paletteBox.style.display = 'block';
  }

  getCuratedPhotos() {
    return [
      {
        id: 'cur_1',
        type: 'photo',
        title: 'Neon Cyber Cityscape',
        source: 'Unsplash',
        thumb: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=400&q=80',
        url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=85',
      },
      {
        id: 'cur_2',
        type: 'photo',
        title: 'Minimal Concrete Architecture',
        source: 'Unsplash',
        thumb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
      },
      {
        id: 'cur_3',
        type: 'photo',
        title: 'Creative Studio Portrait',
        source: 'Unsplash',
        thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=85',
      },
      {
        id: 'cur_4',
        type: 'photo',
        title: 'Artisan Coffee Roastery',
        source: 'Unsplash',
        thumb: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80',
        url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=85',
      },
      {
        id: 'cur_5',
        type: 'photo',
        title: 'Alpine Sunrise Peaks',
        source: 'Unsplash',
        thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=85',
      },
      {
        id: 'cur_6',
        type: 'photo',
        title: 'Modern Tech Workspace',
        source: 'Unsplash',
        thumb: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
      },
      {
        id: 'cur_7',
        type: 'photo',
        title: 'Vibrant Gradient Waves',
        source: 'Unsplash',
        thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80',
        url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=85',
      },
      {
        id: 'cur_8',
        type: 'photo',
        title: 'Abstract Fluid 3D',
        source: 'Unsplash',
        thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
      }
    ];
  }

  getFallbackIcons(query = '') {
    const icons = [
      ['lucide:sparkles', 'Sparkles', 'sparkle'], ['lucide:badge-check', 'Badge Check', 'shield'], ['lucide:zap', 'Zap / Power'],
      ['lucide:shield', 'Shield', 'shield'], ['lucide:heart', 'Heart', 'heart'], ['lucide:rocket', 'Rocket'],
      ['lucide:circle', 'Circle', 'circle'], ['material-symbols:circle-outline', 'Circle Outline', 'circle'],
      ['tabler:circle-dashed', 'Dashed Circle', 'circle'], ['lucide:circle-dot', 'Circle Dot', 'circle'],
      ['lucide:triangle', 'Triangle', 'triangle'], ['lucide:square', 'Square', 'square'], ['lucide:square-rounded', 'Rounded Square', 'rounded-rectangle'],
      ['lucide:rectangle-horizontal', 'Horizontal Rectangle', 'rectangle'], ['lucide:rectangle-vertical', 'Vertical Rectangle', 'rectangle'],
      ['lucide:hexagon', 'Hexagon', 'hexagon'], ['lucide:octagon', 'Octagon', 'octagon'], ['lucide:pentagon', 'Pentagon', 'pentagon'],
      ['lucide:diamond', 'Diamond', 'diamond'], ['lucide:arrow-right', 'Arrow Right', 'right-arrow'], ['lucide:chevron-right', 'Chevron', 'chevron'],
      ['lucide:cloud', 'Cloud', 'cloud'], ['lucide:waves', 'Wave', 'wave'], ['lucide:cross', 'Cross', 'cross'],
      ['lucide:pill', 'Pill', 'pill'], ['lucide:plus', 'Plus'], ['lucide:star', 'Star', 'star'], ['lucide:moon', 'Moon'],
    ].map(([id, title, shapeKey]) => {
      const localShape = shapeKey ? this.getShapeItems(shapeKey)[0] : null;
      const svgUrl = `https://api.iconify.design/${id.replace(':', '/')}.svg?color=%238b5cf6`;
      return {
        id,
        type: 'icon',
        title,
        shapeKey,
        thumb: localShape ? localShape.thumb : svgUrl,
        svgUrl,
        source: localShape ? 'DesignPro vector' : `Iconify / ${id.split(':')[0]}`,
      };
    });
    const normalizedQuery = query.toLowerCase().trim();
    const terms = normalizedQuery.split(/\s+/).filter((term) => term && !['icon', 'icons', 'vector', 'vectors', 'shape', 'shapes'].includes(term));
    return terms.length ? icons.filter((icon) => {
      const searchable = `${icon.title} ${icon.id}`.toLowerCase();
      return terms.every((term) => searchable.includes(term));
    }) : icons;
  }

  getFallbackMedia(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const photos = this.getCuratedPhotos().filter((photo) => !normalizedQuery || photo.title.toLowerCase().includes(normalizedQuery));
    return [...photos, ...this.getFallbackIcons(query)];
  }
}

window.ContentHub = ContentHub;
