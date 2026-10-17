/**
 * Pages Manager for DesignPro
 * Supports multi-page designs (carousels, slide decks, brochures, multi-post campaigns)
 */

class PagesManager {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    
    // Page state storage
    this.pages = [];
    this.currentPageIndex = 0;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  init() {
    // Initialize with first page
    const initialJson = JSON.stringify(this.canvas.toJSON([
      'id', 'name', 'selectable', 'lockMovementX', 'lockMovementY', 
      'lockRotation', 'lockScalingX', 'lockScalingY', 'charSpacing', 'lineHeight'
    ]));

    this.pages = [
      {
        id: 1,
        name: 'Page 1',
        width: this.canvasManager.artboardWidth,
        height: this.canvasManager.artboardHeight,
        state: initialJson,
        thumbnail: '',
      }
    ];
    this.currentPageIndex = 0;
    this.renderPagesBar();
    this.updateCurrentThumbnail();
  }

  // Save active canvas into current page object
  saveCurrentPageState() {
    if (!this.pages[this.currentPageIndex]) return;

    const page = this.pages[this.currentPageIndex];
    page.width = this.canvasManager.artboardWidth;
    page.height = this.canvasManager.artboardHeight;
    page.state = JSON.stringify(this.canvas.toJSON([
      'id', 'name', 'selectable', 'lockMovementX', 'lockMovementY', 
      'lockRotation', 'lockScalingX', 'lockScalingY', 'charSpacing', 'lineHeight'
    ]));
    
    // Generate mini thumbnail
    try {
      page.thumbnail = this.canvas.toDataURL({
        format: 'png',
        multiplier: 0.15,
      });
    } catch (e) {
      page.thumbnail = '';
    }
  }

  // Add a new blank page
  addPage() {
    this.saveCurrentPageState();

    const newPageNum = this.pages.length + 1;
    const newPage = {
      id: Date.now(),
      name: `Page ${newPageNum}`,
      width: this.canvasManager.artboardWidth,
      height: this.canvasManager.artboardHeight,
      state: JSON.stringify({
        version: '5.3.1',
        objects: [],
        background: '#ffffff',
      }),
      thumbnail: '',
    };

    this.pages.push(newPage);
    this.switchPage(this.pages.length - 1);
  }

  // Duplicate current page
  duplicatePage(index = this.currentPageIndex) {
    this.saveCurrentPageState();
    const sourcePage = this.pages[index];
    if (!sourcePage) return;

    const newPage = {
      id: Date.now(),
      name: `${sourcePage.name} (Copy)`,
      width: sourcePage.width,
      height: sourcePage.height,
      state: sourcePage.state,
      thumbnail: sourcePage.thumbnail,
    };

    this.pages.splice(index + 1, 0, newPage);
    this.switchPage(index + 1);
  }

  // Delete page
  deletePage(index = this.currentPageIndex) {
    if (this.pages.length <= 1) {
      if (window.showToast) window.showToast('Projects must have at least one page.', 'info');
      return;
    }

    if (confirm(`Delete ${this.pages[index].name}?`)) {
      this.pages.splice(index, 1);
      const newIndex = Math.max(0, Math.min(index, this.pages.length - 1));
      this.switchPage(newIndex, true);
    }
  }

  // Switch active page
  switchPage(targetIndex, skipSave = false) {
    if (targetIndex < 0 || targetIndex >= this.pages.length) return;

    if (!skipSave) {
      this.saveCurrentPageState();
    }

    this.currentPageIndex = targetIndex;
    const targetPage = this.pages[targetIndex];

    // Resize canvas to match target page dimensions
    this.canvasManager.setArtboardSize(targetPage.width, targetPage.height);

    // Load canvas JSON
    this.canvas.loadFromJSON(targetPage.state, () => {
      this.canvas.setWidth(targetPage.width);
      this.canvas.setHeight(targetPage.height);
      this.canvas.renderAll();
      this.canvasManager.recordState();
      
      if (window.app && window.app.layers) {
        window.app.layers.renderLayers();
      }

      this.renderPagesBar();
      this.updateCurrentThumbnail();
    });
  }

  // Update thumbnail after canvas modification
  updateCurrentThumbnail() {
    if (!this.pages[this.currentPageIndex]) return;
    try {
      const dataUrl = this.canvas.toDataURL({
        format: 'png',
        multiplier: 0.15,
      });
      this.pages[this.currentPageIndex].thumbnail = dataUrl;
      const thumbEl = document.querySelector(`.page-tab[data-index="${this.currentPageIndex}"] .page-tab-thumb img`);
      if (thumbEl) {
        thumbEl.src = dataUrl;
      }
    } catch (e) {
      // ignore security / tainted canvas in edge scenarios
    }
  }

  // Render bottom pages bar
  renderPagesBar() {
    const barEl = document.getElementById('pages-bar-list');
    if (!barEl) return;

    barEl.innerHTML = '';

    this.pages.forEach((page, idx) => {
      const isActive = idx === this.currentPageIndex;
      const tab = document.createElement('div');
      tab.className = `page-tab ${isActive ? 'active' : ''}`;
      tab.setAttribute('data-index', idx);

      const safeName = this.escapeHtml(page.name);
      tab.innerHTML = `
        <div class="page-tab-thumb">
          <img src="${page.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'40\' height=\'40\'%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'%23ffffff\'/%3E%3C/svg%3E'}" alt="${safeName}" />
        </div>
        <div class="page-tab-info">
          <span class="page-tab-title">${safeName}</span>
          <span class="page-tab-dims">${page.width}×${page.height}</span>
        </div>
        <div class="page-tab-actions">
          <button class="page-action-btn btn-dup-page" title="Duplicate Page">⧉</button>
          <button class="page-action-btn btn-del-page" title="Delete Page" ${this.pages.length === 1 ? 'disabled style="opacity:0.3;"' : ''}>✕</button>
        </div>
      `;

      // Click to switch
      tab.addEventListener('click', (e) => {
        if (e.target.closest('.page-action-btn')) return;
        this.switchPage(idx);
      });

      // Duplicate
      tab.querySelector('.btn-dup-page').addEventListener('click', (e) => {
        e.stopPropagation();
        this.duplicatePage(idx);
      });

      // Delete
      tab.querySelector('.btn-del-page').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deletePage(idx);
      });

      barEl.appendChild(tab);
    });

    // Update Page Count Indicator
    const countBadge = document.getElementById('pages-count-badge');
    if (countBadge) {
      countBadge.textContent = `Page ${this.currentPageIndex + 1} of ${this.pages.length}`;
    }
  }
}

window.PagesManager = PagesManager;
