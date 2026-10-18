/**
 * Enhanced Layers Manager for DesignPro
 * Grounded in Professional Photoshop / Figma Studio Standards
 * 
 * Features:
 * - HTML5 Drag & Drop visual layer reordering
 * - Photoshop-grade blend modes (Multiply, Screen, Overlay, etc.) via globalCompositeOperation
 * - Partial lock (movement) vs. Total lock (selection)
 * - Safe filtering of guide lines and non-layer objects
 * - Non-destructive clipping mask helpers
 */

class LayersManager {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.draggedLayerIndex = null;
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
    // Show topmost object first, filter out non-layer internal guides
    const objects = this.canvas.getObjects()
      .filter(obj => !obj.isGuide)
      .slice()
      .reverse();

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
      const currentBlend = obj.globalCompositeOperation || 'source-over';

      const layerItem = document.createElement('div');
      layerItem.className = `layer-item ${isActive ? 'active' : ''}`;
      layerItem.setAttribute('draggable', 'true');
      layerItem.dataset.index = reversedIndex;

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
      } else if (obj.type === 'group') {
        icon = '⚏';
        title = obj.name || 'Group';
      }

      const safeTitle = this.escapeHtml(title);
      layerItem.innerHTML = `
        <div class="layer-drag-handle" title="Drag to reorder layer z-index">⋮⋮</div>
        <div class="layer-left" title="${safeTitle}">
          <span class="layer-icon" style="font-weight: 700;">${icon}</span>
          <span class="layer-name">${safeTitle}</span>
        </div>
        <div class="layer-actions">
          <select class="layer-blend-select" title="Layer Blend Mode">
            <option value="source-over" ${currentBlend === 'source-over' ? 'selected' : ''}>Normal</option>
            <option value="multiply" ${currentBlend === 'multiply' ? 'selected' : ''}>Multiply</option>
            <option value="screen" ${currentBlend === 'screen' ? 'selected' : ''}>Screen</option>
            <option value="overlay" ${currentBlend === 'overlay' ? 'selected' : ''}>Overlay</option>
            <option value="darken" ${currentBlend === 'darken' ? 'selected' : ''}>Darken</option>
            <option value="lighten" ${currentBlend === 'lighten' ? 'selected' : ''}>Lighten</option>
            <option value="color-dodge" ${currentBlend === 'color-dodge' ? 'selected' : ''}>Color Dodge</option>
            <option value="color-burn" ${currentBlend === 'color-burn' ? 'selected' : ''}>Color Burn</option>
            <option value="hard-light" ${currentBlend === 'hard-light' ? 'selected' : ''}>Hard Light</option>
            <option value="soft-light" ${currentBlend === 'soft-light' ? 'selected' : ''}>Soft Light</option>
            <option value="difference" ${currentBlend === 'difference' ? 'selected' : ''}>Difference</option>
            <option value="exclusion" ${currentBlend === 'exclusion' ? 'selected' : ''}>Exclusion</option>
          </select>
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
        if (e.target.closest('.layer-action-btn') || e.target.closest('.layer-blend-select')) return;
        this.canvas.setActiveObject(obj);
        this.canvas.renderAll();
        this.highlightSelectedLayer(obj);
      });

      // Blend Mode Change
      const blendSelect = layerItem.querySelector('.layer-blend-select');
      blendSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        obj.set('globalCompositeOperation', e.target.value);
        this.canvas.renderAll();
        this.canvasManager.recordState();
        if (window.showToast) {
          window.showToast(`Blend Mode: ${e.target.value}`, 'info');
        }
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

      // =====================================================================
      // HTML5 Drag and Drop Layer Sorting
      // =====================================================================
      layerItem.addEventListener('dragstart', (e) => {
        this.draggedLayerIndex = reversedIndex;
        e.dataTransfer.effectAllowed = 'move';
        layerItem.classList.add('dragging');
      });

      layerItem.addEventListener('dragend', () => {
        layerItem.classList.remove('dragging');
        this.draggedLayerIndex = null;
        document.querySelectorAll('.layer-item').forEach(el => el.classList.remove('drag-over'));
      });

      layerItem.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        layerItem.classList.add('drag-over');
      });

      layerItem.addEventListener('dragleave', () => {
        layerItem.classList.remove('drag-over');
      });

      layerItem.addEventListener('drop', (e) => {
        e.preventDefault();
        layerItem.classList.remove('drag-over');
        if (this.draggedLayerIndex === null || this.draggedLayerIndex === reversedIndex) return;

        const sourceObj = objects[this.draggedLayerIndex];
        const targetObj = objects[reversedIndex];

        if (sourceObj && targetObj) {
          const allCanvasObjects = this.canvas.getObjects();
          const targetCanvasIndex = allCanvasObjects.indexOf(targetObj);
          if (targetCanvasIndex !== -1) {
            this.canvas.moveTo(sourceObj, targetCanvasIndex);
            this.canvas.renderAll();
            this.renderLayers();
            this.canvasManager.recordState();
          }
        }
      });

      listEl.appendChild(layerItem);
    });
  }

  highlightSelectedLayer(activeObj) {
    const listEl = document.getElementById('layers-list');
    if (!listEl) return;

    const items = listEl.querySelectorAll('.layer-item');
    const objects = this.canvas.getObjects()
      .filter(obj => !obj.isGuide)
      .slice()
      .reverse();

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

  // Non-Destructive Clipping Mask
  createClippingMask() {
    const selection = this.canvas.getActiveObjects();
    if (!selection || selection.length < 2) {
      if (window.showToast) {
        window.showToast('Select 2 layers: Top layer to clip into the bottom shape', 'error');
      }
      return;
    }

    const contentObj = selection[0];
    const maskShape = selection[1];

    if (!contentObj || !maskShape) return;

    maskShape.clone((clonedMask) => {
      clonedMask.set({
        absolutePositioned: true,
        originX: 'center',
        originY: 'center',
      });
      contentObj.set('clipPath', clonedMask);
      this.canvas.remove(maskShape);
      this.canvas.discardActiveObject();
      this.canvas.setActiveObject(contentObj);
      this.canvas.renderAll();
      this.renderLayers();
      this.canvasManager.recordState();
      if (window.showToast) {
        window.showToast('Clipping Mask applied successfully!', 'success');
      }
    });
  }

  // Release Clipping Mask and restore original mask shape
  releaseClippingMask() {
    const active = this.canvas.getActiveObject();
    if (!active || !active.clipPath) {
      if (window.showToast) window.showToast('Selected object has no clipping mask', 'info');
      return;
    }

    const mask = active.clipPath;
    active.set('clipPath', null);
    mask.set({
      selectable: true,
      evented: true,
    });
    this.canvas.add(mask);
    this.canvas.renderAll();
    this.renderLayers();
    this.canvasManager.recordState();
    if (window.showToast) window.showToast('Clipping mask released!', 'success');
  }
}

window.LayersManager = LayersManager;
