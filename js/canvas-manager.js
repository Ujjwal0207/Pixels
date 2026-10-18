/**
 * Canvas Manager for DesignPro
 * Manages Fabric.js canvas instance, artboard sizing, viewport zoom, pan, history and shortcuts
 */

// Canonical Extended Properties for Lossless Serialization across All Modules
window.CANVAS_EXTENDED_PROPERTIES = [
  'id',
  'name',
  'selectable',
  'evented',
  'lockMovementX',
  'lockMovementY',
  'lockRotation',
  'lockScalingX',
  'lockScalingY',
  'charSpacing',
  'lineHeight',
  'globalCompositeOperation',
  'filters',
  'clipPath',
  'isStamp',
  'isWatermark',
  'isLocked',
  'layerType',
  'shadow',
  'opacity',
  'strokeUniform',
  'isGuide',
  'guideOrientation',
  'assetId'
];

class CanvasManager {
  constructor() {
    this.canvas = null;
    this.artboardWidth = 1080;
    this.artboardHeight = 1080;
    this.zoomLevel = 1.0;
    this.minZoom = 0.15;
    this.maxZoom = 3.0;
    
    // History (Undo / Redo)
    this.history = [];
    this.historyIndex = -1;
    this.isHistoryProcessing = false;
    this.maxHistorySteps = 30;
    this.assetCache = new Map(); // Memory optimization: deduplicate large Base64 images

    // Clipboard
    this.clipboard = null;

    // Snap Guides
    this.guidelineOffset = 6;
  }

  init(canvasId) {
    const canvasEl = document.getElementById(canvasId);
    if (!canvasEl) return;

    // Create Fabric Canvas with retina scaling
    this.canvas = new fabric.Canvas(canvasId, {
      width: this.artboardWidth,
      height: this.artboardHeight,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selectionColor: 'rgba(139, 92, 246, 0.15)',
      selectionBorderColor: '#8b5cf6',
      selectionLineWidth: 1.5,
      fireRightClick: true,
      stopContextMenu: true,
    });

    // Precise coordinate mapping patch for CSS-scaled artboard container
    const origGetPointer = this.canvas.getPointer.bind(this.canvas);
    this.canvas.getPointer = (e, ignoreZoom) => {
      const upper = this.canvas.upperCanvasEl;
      if (!upper) return origGetPointer(e, ignoreZoom);

      const rect = upper.getBoundingClientRect();
      const currentCanvasWidth = this.canvas.width || this.artboardWidth;
      const currentCanvasHeight = this.canvas.height || this.artboardHeight;

      // Real-time scale ratio between CSS rendered size and internal canvas coordinate space
      const scaleX = rect.width > 0 ? (rect.width / currentCanvasWidth) : 1;
      const scaleY = rect.height > 0 ? (rect.height / currentCanvasHeight) : 1;

      // Extract client coordinates accurately for MouseEvent or TouchEvent
      let clientX = 0;
      let clientY = 0;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
      } else if (e.clientX !== undefined) {
        clientX = e.clientX;
        clientY = e.clientY;
      } else if (e.pointer) {
        clientX = e.pointer.x;
        clientY = e.pointer.y;
      }

      let pointer = {
        x: (clientX - rect.left) / scaleX,
        y: (clientY - rect.top) / scaleY,
      };

      if (!ignoreZoom && this.canvas.viewportTransform) {
        pointer = fabric.util.transformPoint(
          pointer,
          fabric.util.invertTransform(this.canvas.viewportTransform)
        );
      }

      return pointer;
    };

    // Also patch fabric.util.getPointer for global fabric utility consistency
    const origUtilGetPointer = fabric.util.getPointer;
    fabric.util.getPointer = function (event, element) {
      if (element && (element.classList && (element.classList.contains('upper-canvas') || element.classList.contains('lower-canvas')) || element.id === 'canvas-element')) {
        const rect = element.getBoundingClientRect();
        let clientX = 0;
        let clientY = 0;
        if (event.touches && event.touches.length > 0) {
          clientX = event.touches[0].clientX;
          clientY = event.touches[0].clientY;
        } else if (event.changedTouches && event.changedTouches.length > 0) {
          clientX = event.changedTouches[0].clientX;
          clientY = event.changedTouches[0].clientY;
        } else if (event.clientX !== undefined) {
          clientX = event.clientX;
          clientY = event.clientY;
        }

        const dpr = window.devicePixelRatio || 1;
        const baseWidth = element.width ? (element.width / dpr) : rect.width;
        const baseHeight = element.height ? (element.height / dpr) : rect.height;
        const scaleX = rect.width > 0 && baseWidth > 0 ? (rect.width / baseWidth) : 1;
        const scaleY = rect.height > 0 && baseHeight > 0 ? (rect.height / baseHeight) : 1;

        return {
          x: (clientX - rect.left) / (scaleX || 1),
          y: (clientY - rect.top) / (scaleY || 1)
        };
      }
      return origUtilGetPointer ? origUtilGetPointer.call(this, event, element) : { x: 0, y: 0 };
    };

    // Customize Fabric object control handles for sleek modern look
    fabric.Object.prototype.set({
      borderColor: '#8b5cf6',
      cornerColor: '#ffffff',
      cornerStrokeColor: '#8b5cf6',
      cornerSize: 9,
      cornerStyle: 'circle',
      transparentCorners: false,
      borderScaleFactor: 1.5,
      padding: 4,
    });

    // Artboard dimension helpers on canvas instance
    this.canvas.getArtboardWidth = () => this.artboardWidth;
    this.canvas.getArtboardHeight = () => this.artboardHeight;
    this.canvas.getArtboardCenter = () => ({ x: this.artboardWidth / 2, y: this.artboardHeight / 2 });

    this.setupEvents();
    this.setupKeyboardShortcuts();
    this.recordState();
    this.fitToScreen();

    return this.canvas;
  }

  setupEvents() {
    // Selection listeners
    this.canvas.on('selection:created', (e) => this.onSelectionChange(e));
    this.canvas.on('selection:updated', (e) => this.onSelectionChange(e));
    this.canvas.on('selection:cleared', () => this.onSelectionCleared());

    // History tracking events
    this.canvas.on('object:added', (e) => {
      if (!this.isHistoryProcessing && !this.isBatchLoading && !e.target.isGuide) this.recordState();
      this.notifyLayerUpdate();
    });
    this.canvas.on('object:modified', (e) => {
      if (!this.isHistoryProcessing && !this.isBatchLoading && !e.target.isGuide) this.recordState();
      this.notifyLayerUpdate();
    });
    this.canvas.on('object:removed', (e) => {
      if (!this.isHistoryProcessing && !this.isBatchLoading && !e.target.isGuide) this.recordState();
      this.notifyLayerUpdate();
    });

    // Window resize to fit canvas
    window.addEventListener('resize', () => {
      this.fitToScreen();
    });

    // Wheel zoom & pan handling (Ctrl/Cmd + Wheel to zoom, Trackpad pinch)
    const scrollContainer = document.getElementById('canvas-scroll-container');
    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', (e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const delta = e.deltaY;
          const zoomDelta = delta > 0 ? -0.05 : 0.05;
          this.setZoom(this.zoomLevel + zoomDelta);
        }
      }, { passive: false });

      // Spacebar + Drag Panning (Figma/Canva Pro style)
      let isSpaceDown = false;
      let isPanning = false;
      let startX = 0;
      let startY = 0;
      let startScrollLeft = 0;
      let startScrollTop = 0;

      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
          if (!isSpaceDown) {
            isSpaceDown = true;
            scrollContainer.style.cursor = 'grab';
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          isSpaceDown = false;
          isPanning = false;
          scrollContainer.style.cursor = 'default';
        }
      });

      scrollContainer.addEventListener('mousedown', (e) => {
        if (isSpaceDown) {
          isPanning = true;
          startX = e.clientX;
          startY = e.clientY;
          startScrollLeft = scrollContainer.scrollLeft;
          startScrollTop = scrollContainer.scrollTop;
          scrollContainer.style.cursor = 'grabbing';
          e.preventDefault();
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (isPanning && scrollContainer) {
          const dx = e.clientX - startX;
          const dy = e.clientY - startY;
          scrollContainer.scrollLeft = startScrollLeft - dx;
          scrollContainer.scrollTop = startScrollTop - dy;
          const rulers = window.app && (window.app.rulers || window.app.rulersGuides);
          if (rulers && typeof rulers.renderRulers === 'function') {
            rulers.renderRulers();
          }
        }
      });

      window.addEventListener('mouseup', () => {
        if (isPanning) {
          isPanning = false;
          if (scrollContainer) {
            scrollContainer.style.cursor = isSpaceDown ? 'grab' : 'default';
          }
        }
      });
    }
  }

  onSelectionChange(e) {
    const selected = e.selected || [e.target];
    if (window.app && window.app.updateContextToolbar) {
      window.app.updateContextToolbar(selected);
    }
    if (window.app && window.app.layers) {
      window.app.layers.highlightSelectedLayer(selected[0]);
    }
  }

  onSelectionCleared() {
    if (window.app && window.app.updateContextToolbar) {
      window.app.updateContextToolbar(null);
    }
    if (window.app && window.app.layers) {
      window.app.layers.highlightSelectedLayer(null);
    }
  }

  notifyLayerUpdate() {
    if (window.app && window.app.layers) {
      window.app.layers.renderLayers();
    }
  }

  // Resize Artboard
  setArtboardSize(width, height) {
    const safeW = (window.AppUtils ? window.AppUtils.safeParseInt(width, 1080, 10, 10000) : parseInt(width, 10)) || 1080;
    const safeH = (window.AppUtils ? window.AppUtils.safeParseInt(height, 1080, 10, 10000) : parseInt(height, 10)) || 1080;
    this.artboardWidth = safeW;
    this.artboardHeight = safeH;

    const artboardContainer = document.getElementById('artboard-container');
    if (artboardContainer) {
      artboardContainer.style.width = `${this.artboardWidth}px`;
      artboardContainer.style.height = `${this.artboardHeight}px`;
    }

    if (this.canvas) {
      this.canvas.setWidth(this.artboardWidth);
      this.canvas.setHeight(this.artboardHeight);
      this.canvas.renderAll();
    }

    // Update status badge
    const badge = document.getElementById('canvas-dimensions-badge');
    if (badge) {
      badge.textContent = `${this.artboardWidth} × ${this.artboardHeight} px`;
    }

    this.fitToScreen();
    this.recordState();
  }

  // Zoom Handling (True Sub-Pixel Vector Resolution without CSS Blur)
  setZoom(level) {
    const rawZoom = (window.AppUtils ? window.AppUtils.clamp(level, this.minZoom, this.maxZoom) : Math.min(Math.max(level, this.minZoom), this.maxZoom));
    this.zoomLevel = Math.round(rawZoom * 100) / 100;

    const targetW = Math.round(this.artboardWidth * this.zoomLevel);
    const targetH = Math.round(this.artboardHeight * this.zoomLevel);

    const artboardContainer = document.getElementById('artboard-container');
    if (artboardContainer) {
      artboardContainer.style.width = `${targetW}px`;
      artboardContainer.style.height = `${targetH}px`;
      artboardContainer.style.transform = 'none'; // Sub-pixel sharp rendering
    }

    if (this.canvas) {
      this.canvas.setDimensions({ width: targetW, height: targetH });
      this.canvas.setZoom(this.zoomLevel);
      this.canvas.calcOffset();
      this.canvas.requestRenderAll();
    }

    const zoomText = document.getElementById('zoom-percentage-text');
    if (zoomText) {
      zoomText.textContent = `${Math.round(this.zoomLevel * 100)}%`;
    }

    const rulers = window.app && (window.app.rulers || window.app.rulersGuides);
    if (rulers && typeof rulers.renderRulers === 'function') {
      rulers.renderRulers();
    }
  }

  zoomIn() {
    this.setZoom(this.zoomLevel + 0.1);
  }

  zoomOut() {
    this.setZoom(this.zoomLevel - 0.1);
  }

  fitToScreen() {
    const scrollContainer = document.getElementById('canvas-scroll-container');
    if (!scrollContainer) return;

    const padding = 120;
    const availableWidth = scrollContainer.clientWidth - padding;
    const availableHeight = scrollContainer.clientHeight - padding;

    if (availableWidth <= 0 || availableHeight <= 0) return;

    const scaleX = availableWidth / this.artboardWidth;
    const scaleY = availableHeight / this.artboardHeight;
    const bestScale = Math.min(scaleX, scaleY, 1.0);

    this.setZoom(bestScale);
  }

  // History Management (Undo / Redo with Memory Optimization & Auto-Save)
  recordState() {
    if (!this.canvas || this.isBatchLoading || this.isHistoryProcessing) return;

    // Discard any redo states ahead of current index
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Capture state with full lossless property schema
    const rawJson = this.canvas.toJSON(window.CANVAS_EXTENDED_PROPERTIES);

    // Filter out temporary guide lines from standard undo states
    if (rawJson.objects) {
      rawJson.objects = rawJson.objects.filter(obj => !obj.isGuide);

      // Memory optimization: deduplicate large Base64 image payloads
      rawJson.objects.forEach(obj => {
        if (obj.type === 'image' && obj.src && obj.src.length > 2000) {
          const hashId = obj.assetId || `asset_${obj.src.substring(0, 32).replace(/[^a-zA-Z0-9]/g, '')}_${obj.src.length}`;
          obj.assetId = hashId;
          if (!this.assetCache.has(hashId)) {
            this.assetCache.set(hashId, obj.src);
          }
          // Store lightweight pointer in history snapshot
          obj.src = `cache://${hashId}`;
        }
      });
    }

    const statePayload = {
      json: JSON.stringify(rawJson),
      width: this.artboardWidth,
      height: this.artboardHeight,
    };

    this.history.push(statePayload);

    if (this.history.length > this.maxHistorySteps) {
      this.history.shift();
    } else {
      this.historyIndex++;
    }

    this.updateUndoRedoUI();

    // Trigger debounced persistent auto-save to IndexedDB
    if (window.app && window.app.storage && typeof window.app.storage.scheduleAutoSave === 'function') {
      window.app.storage.scheduleAutoSave(this, window.app.pages);
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.isHistoryProcessing = true;
      this.historyIndex--;
      this.loadHistoryState(this.history[this.historyIndex]);
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.isHistoryProcessing = true;
      this.historyIndex++;
      this.loadHistoryState(this.history[this.historyIndex]);
    }
  }

  loadHistoryState(state) {
    if (!state) return;
    this.artboardWidth = state.width;
    this.artboardHeight = state.height;

    // Restore cached image payloads before feeding into Fabric parser
    let parsedState;
    try {
      parsedState = JSON.parse(state.json);
      if (parsedState.objects) {
        parsedState.objects.forEach(obj => {
          if (obj.src && obj.src.startsWith('cache://')) {
            const hashId = obj.src.replace('cache://', '');
            if (this.assetCache.has(hashId)) {
              obj.src = this.assetCache.get(hashId);
            }
          }
        });
      }
    } catch (e) {
      parsedState = state.json;
    }

    this.canvas.loadFromJSON(parsedState, () => {
      this.canvas.setWidth(this.artboardWidth);
      this.canvas.setHeight(this.artboardHeight);
      this.canvas.renderAll();
      this.isHistoryProcessing = false;
      this.updateUndoRedoUI();
      this.notifyLayerUpdate();

      // Trigger auto-save sync
      if (window.app && window.app.storage) {
        window.app.storage.scheduleAutoSave(this, window.app.pages);
      }
    });
  }

  updateUndoRedoUI() {
    const undoBtn = document.getElementById('btn-undo');
    const redoBtn = document.getElementById('btn-redo');

    if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
  }

  // Clipboard operations
  copy() {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    active.clone((cloned) => {
      this.clipboard = cloned;
    });
  }

  paste() {
    if (!this.clipboard) return;
    this.clipboard.clone((clonedObj) => {
      this.canvas.discardActiveObject();
      clonedObj.set({
        left: clonedObj.left + 24,
        top: clonedObj.top + 24,
        evented: true,
      });

      if (clonedObj.type === 'activeSelection') {
        clonedObj.canvas = this.canvas;
        clonedObj.forEachObject((obj) => {
          this.canvas.add(obj);
        });
        clonedObj.setCoords();
      } else {
        this.canvas.add(clonedObj);
      }

      this.clipboard.top += 24;
      this.clipboard.left += 24;
      this.canvas.setActiveObject(clonedObj);
      this.canvas.requestRenderAll();
    });
  }

  duplicate() {
    this.copy();
    setTimeout(() => this.paste(), 50);
  }

  deleteSelected() {
    const active = this.canvas.getActiveObjects();
    if (!active || active.length === 0) return;

    this.canvas.discardActiveObject();
    active.forEach((obj) => {
      this.canvas.remove(obj);
    });
    this.canvas.requestRenderAll();
  }

  clearCanvas() {
    if (confirm('Are you sure you want to clear the canvas? All elements will be removed.')) {
      this.canvas.clear();
      this.canvas.setBackgroundColor('#ffffff', () => {
        this.canvas.renderAll();
        this.recordState();
        this.notifyLayerUpdate();
      });
    }
  }

  // Keyboard Shortcuts
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't intercept if user is typing in an input or textarea
      const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      const activeObj = this.canvas.getActiveObject();
      const isEditingText = activeObj && activeObj.isEditing;
      if (isEditingText) return;

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        this.deleteSelected();
      }

      // Undo (Ctrl+Z or Cmd+Z)
      if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        this.undo();
      }

      // Redo (Ctrl+Shift+Z, Cmd+Shift+Z, Ctrl+Y)
      if ((cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') || (cmdOrCtrl && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        this.redo();
      }

      // Copy (Ctrl+C / Cmd+C)
      if (cmdOrCtrl && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        this.copy();
      }

      // Paste (Ctrl+V / Cmd+V)
      if (cmdOrCtrl && e.key.toLowerCase() === 'v') {
        if (this.clipboard) {
          e.preventDefault();
          this.paste();
        }
        // If internal clipboard is empty, let native paste event fire for OS/browser clipboard ingestion
      }

      // Duplicate (Ctrl+D / Cmd+D)
      if (cmdOrCtrl && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        this.duplicate();
      }

      // Select All (Ctrl+A / Cmd+A) - Only select visible, non-guide, selectable objects
      if (cmdOrCtrl && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        this.canvas.discardActiveObject();
        const selectableObjects = this.canvas.getObjects().filter((o) => !o.isGuide && o.selectable && o.visible);
        if (selectableObjects.length > 0) {
          const sel = new fabric.ActiveSelection(selectableObjects, {
            canvas: this.canvas,
          });
          this.canvas.setActiveObject(sel);
          this.canvas.requestRenderAll();
        }
      }

      // Group (Ctrl+G / Cmd+G) & Ungroup (Ctrl+Shift+G / Cmd+Shift+G)
      if (cmdOrCtrl && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          if (window.app && window.app.studioPro) window.app.studioPro.ungroupSelected();
        } else {
          if (window.app && window.app.studioPro) window.app.studioPro.groupSelected();
        }
      }

      // Arrow keys nudge
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key) && activeObj) {
        if (activeObj.lockMovementX && activeObj.lockMovementY) return;
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowLeft' && !activeObj.lockMovementX) activeObj.left -= step;
        if (e.key === 'ArrowRight' && !activeObj.lockMovementX) activeObj.left += step;
        if (e.key === 'ArrowUp' && !activeObj.lockMovementY) activeObj.top -= step;
        if (e.key === 'ArrowDown' && !activeObj.lockMovementY) activeObj.top += step;
        activeObj.setCoords();
        this.canvas.requestRenderAll();
        this.recordState();
      }
    });
  }
}

window.CanvasManager = CanvasManager;
