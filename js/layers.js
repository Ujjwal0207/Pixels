/**
 * Layers Manager for DesignPro
 * Controls visual layer hierarchy, ordering, visibility, and locking
 */

class LayersManager {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
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

  renderLayers() {
    const listEl = document.getElementById('layers-list');
    if (!listEl || !this.canvas) return;

    listEl.innerHTML = '';
    const objects = this.canvas.getObjects().slice().reverse(); // Show topmost object first

    if (objects.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.82rem;">
          No elements on the canvas yet.<br/>Add shapes, text, or images to see layers here.
        </div>
      `;
      return;
    }

    const activeObj = this.canvas.getActiveObject();

    objects.forEach((obj, reversedIndex) => {
      const realIndex = objects.length - 1 - reversedIndex;
      const isActive = obj === activeObj;
      const isLocked = !!obj.lockMovementX;
      const isHidden = !obj.visible;

      const layerItem = document.createElement('div');
      layerItem.className = `layer-item ${isActive ? 'active' : ''}`;

      // Determine friendly icon & title
      let icon = '❖';
      let title = obj.name || 'Object';
      if (obj.isType('i-text') || obj.isType('text')) {
        icon = 'T';
        title = obj.text ? `"${obj.text.substring(0, 18)}${obj.text.length > 18 ? '...' : ''}"` : 'Text';
      } else if (obj.type === 'rect') {
        icon = '▭';
        title = obj.name || 'Rectangle';
      } else if (obj.type === 'circle') {
        icon = '○';
        title = obj.name || 'Circle';
      } else if (obj.type === 'image') {
        icon = '🖼';
        title = obj.name || 'Image';
      } else if (obj.type === 'path' || obj.type === 'polygon') {
        icon = '★';
        title = obj.name || 'Shape';
      }

      const safeTitle = this.escapeHtml(title);
      layerItem.innerHTML = `
        <div class="layer-left" title="${safeTitle}">
          <span class="layer-icon" style="font-weight: 700;">${icon}</span>
          <span class="layer-name">${safeTitle}</span>
        </div>
        <div class="layer-actions">
          <button class="layer-action-btn btn-visibility" title="${isHidden ? 'Show' : 'Hide'}">
            ${isHidden ? '👁‍🗨' : '👁'}
          </button>
          <button class="layer-action-btn btn-lock" title="${isLocked ? 'Unlock' : 'Lock'}">
            ${isLocked ? '🔒' : '🔓'}
          </button>
          <button class="layer-action-btn btn-delete" title="Delete">✕</button>
        </div>
      `;

      // Select object on row click
      layerItem.addEventListener('click', (e) => {
        if (e.target.closest('.layer-action-btn')) return;
        this.canvas.setActiveObject(obj);
        this.canvas.renderAll();
        this.highlightSelectedLayer(obj);
      });

      // Toggle Visibility
      layerItem.querySelector('.btn-visibility').addEventListener('click', (e) => {
        e.stopPropagation();
        obj.set('visible', !obj.visible);
        if (!obj.visible && this.canvas.getActiveObject() === obj) {
          this.canvas.discardActiveObject();
        }
        this.canvas.renderAll();
        this.renderLayers();
        this.canvasManager.recordState();
      });

      // Toggle Lock
      layerItem.querySelector('.btn-lock').addEventListener('click', (e) => {
        e.stopPropagation();
        const lock = !obj.lockMovementX;
        obj.set({
          lockMovementX: lock,
          lockMovementY: lock,
          lockRotation: lock,
          lockScalingX: lock,
          lockScalingY: lock,
          selectable: !lock,
        });
        if (lock && this.canvas.getActiveObject() === obj) {
          this.canvas.discardActiveObject();
        }
        this.canvas.renderAll();
        this.renderLayers();
        this.canvasManager.recordState();
      });

      // Delete Layer
      layerItem.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation();
        this.canvas.remove(obj);
        this.canvas.renderAll();
        this.renderLayers();
        this.canvasManager.recordState();
      });

      listEl.appendChild(layerItem);
    });
  }

  highlightSelectedLayer(activeObj) {
    const listEl = document.getElementById('layers-list');
    if (!listEl) return;

    const items = listEl.querySelectorAll('.layer-item');
    const objects = this.canvas.getObjects().slice().reverse();

    items.forEach((item, index) => {
      if (objects[index] === activeObj) {
        item.classList.add('active');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  // Layer Ordering Operations
  bringForward() {
    const active = this.canvas.getActiveObject();
    if (active) {
      this.canvas.bringForward(active);
      this.canvas.renderAll();
      this.renderLayers();
      this.canvasManager.recordState();
    }
  }

  sendBackward() {
    const active = this.canvas.getActiveObject();
    if (active) {
      this.canvas.sendBackwards(active);
      this.canvas.renderAll();
      this.renderLayers();
      this.canvasManager.recordState();
    }
  }

  bringToFront() {
    const active = this.canvas.getActiveObject();
    if (active) {
      this.canvas.bringToFront(active);
      this.canvas.renderAll();
      this.renderLayers();
      this.canvasManager.recordState();
    }
  }

  sendToBack() {
    const active = this.canvas.getActiveObject();
    if (active) {
      this.canvas.sendToBack(active);
      this.canvas.renderAll();
      this.renderLayers();
      this.canvasManager.recordState();
    }
  }
}

window.LayersManager = LayersManager;
