/**
 * Main Application Orchestrator for DesignPro
 * Coordinates modules, UI interactions, dynamic toolbars, modals, multi-page strip, and presets
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Storage & Canvas
  const storageEngine = new StorageEngine();
  const canvasManager = new CanvasManager();
  const canvas = canvasManager.init('canvas-element');

  // Initialize Tools & Engines
  const textTool = new TextTool(canvasManager);
  const elementsTool = new ElementsTool(canvasManager);
  const imagesTool = new ImagesTool(canvasManager);
  const drawingTool = new DrawingTool(canvasManager);
  const layersManager = new LayersManager(canvasManager);
  const templatesEngine = new TemplatesEngine(canvasManager);
  const exportEngine = new ExportEngine(canvasManager);
  const pagesManager = new PagesManager(canvasManager);
  const qrCodeTool = new QRCodeTool(canvasManager);
  const snappingEngine = new SnappingEngine(canvasManager);
  const advancedEffects = new AdvancedEffectsEngine(canvasManager);
  const studioPro = new StudioProSuite(canvasManager);
  const framesEngine = new FramesEngine(canvasManager);
  const videoExporter = new VideoExporter(canvasManager);
  const fontsLoader = new GoogleFontsLoader(canvasManager);
  const aiGenerator = new AIGenerator(canvasManager);
  const photocraft = new PhotoCraftStudio(canvasManager);
  const effectcraft = new EffectCraftOverlays(canvasManager);
  const pdfcraft = new PDFCraftTools(canvasManager);

  // New Studio Engines (Rulers, Content Hub, Brand Kit)
  const rulersEngine = new RulersAndGuides(canvasManager);
  const contentHub = new ContentHub(canvasManager);
  const brandKit = new BrandKitEngine(canvasManager);

  // Next-Gen Creative Pro Studio Engines (CMYK Print, 3D Mockup, Video Timeline, Color Studio, Smart Layout, Collaboration)
  const cmykPrint = new CmykPrintStudio(canvasManager);
  const mockupStudio = new MockupStudio3D(canvasManager);
  const videoTimeline = new VideoTimelineEngine(canvasManager);
  const colorStudio = new ColorStudio(canvasManager);
  const smartLayout = new SmartLayoutEngine(canvasManager);
  const collaboration = new CollaborationEngine(canvasManager);

  // Global app reference for cross-component access
  window.app = {
    storage: storageEngine,
    canvasManager,
    canvas,
    textTool,
    elementsTool,
    imagesTool,
    drawingTool,
    layers: layersManager,
    templates: templatesEngine,
    export: exportEngine,
    pages: pagesManager,
    qrcode: qrCodeTool,
    snapping: snappingEngine,
    advancedEffects,
    studioPro,
    framesEngine,
    videoExporter,
    fontsLoader,
    aiGenerator,
    photocraft,
    effectcraft,
    pdfcraft,
    rulers: rulersEngine,
    contentHub,
    brandKit,
    cmykPrint,
    mockupStudio,
    videoTimeline,
    colorStudio,
    smartLayout,
    collab: collaboration,
    activeTab: 'templates',
    selectedFormat: 'png',
  };

  // Initialize Storage & Subsystems
  storageEngine.init();
  rulersEngine.init();
  brandKit.init();
  templatesEngine.initTemplateHub();
  collaboration.init();

  // Setup UI components
  setupNavigationRail();
  setupContextToolbarEvents();
  setupArtboardBottomBar();
  setupHeaderEvents();
  setupModals();
  setupTemplatesTab();
  setupElementsTab();
  setupTextTab();
  setupQRCodeTab();
  setupUploadsTab();
  setupPhotosTab();
  setupDrawTab();
  setupBackgroundTab();
  setupAITab();
  setupPhotoCraftStudio();
  setupEffectCraftOverlays();
  setupPDFCraftTools();
  setupMultiPageEvents();
  setupContentHubTab();
  setupBrandKitTab();
  setupClippingMaskEvents();
  setupCanvasDragAndDrop();
  setupGlobalPaste();
  setupSmartLayoutEvents();
  setupCollaborationEvents();

  // Auto-Restore Draft from IndexedDB if exists, else load default template
  storageEngine.loadDraft().then((draft) => {
    if (draft && draft.pages && draft.pages.length > 0) {
      pagesManager.pages = draft.pages;
      pagesManager.currentPageIndex = draft.currentPageIndex || 0;
      if (draft.title) {
        const titleInput = document.getElementById('doc-title-input');
        if (titleInput) titleInput.value = draft.title;
      }
      if (draft.artboardWidth && draft.artboardHeight) {
        canvasManager.setArtboardSize(draft.artboardWidth, draft.artboardHeight);
      }
      pagesManager.switchPage(pagesManager.currentPageIndex, true);
      pagesManager.renderPagesBar();
      showToast('Restored your previous design from local storage!', 'success');
    } else {
      templatesEngine.loadTemplate('flash-sale');
      pagesManager.init();
      showToast('Welcome to DesignPro! Light & classy graphic studio ready.', 'info');
    }
  });
});

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = document.createElement('span');
  icon.textContent = type === 'success' ? '✓' : 'ℹ';
  const label = document.createElement('span');
  label.textContent = String(message);
  toast.append(icon, document.createTextNode(' '), label);
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 200);
  }, 3200);
}
window.showToast = showToast;

// Left Navigation Rail Tabs
function setupNavigationRail() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const panels = document.querySelectorAll('.sidebar-panel-content');
  const mainSidebar = document.getElementById('sidebar-panel');
  const panelTitle = document.getElementById('sidebar-panel-title');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      // If clicking already active tab, toggle panel collapse
      if (btn.classList.contains('active')) {
        mainSidebar.classList.toggle('collapsed');
        if (mainSidebar.classList.contains('collapsed')) {
          btn.classList.remove('active');
        }
        return;
      }

      tabBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      mainSidebar.classList.remove('collapsed');

      // Update Panel title
      if (panelTitle) {
        panelTitle.textContent = btn.getAttribute('data-title') || 'Tools';
      }

      // Show matching panel content
      panels.forEach((p) => {
        if (p.getAttribute('data-panel') === tabId) {
          p.style.display = 'flex';
        } else {
          p.style.display = 'none';
        }
      });

      // Special tab handlers
      if (tabId === 'layers') {
        window.app.layers.renderLayers();
      }
      if (tabId === 'contenthub' && window.app.contentHub) {
        window.app.contentHub.searchMedia(window.app.contentHub.currentQuery, window.app.contentHub.activeFilter);
      }
      if (tabId === 'brandkit' && window.app.brandKit) {
        window.app.brandKit.renderBrandKitUI();
      }
      if (tabId === 'draw') {
        window.app.drawingTool.enableDrawing(true);
      } else {
        window.app.drawingTool.enableDrawing(false);
      }
    });
  });

  // Close panel button
  const closePanelBtn = document.getElementById('btn-close-sidebar');
  if (closePanelBtn) {
    closePanelBtn.addEventListener('click', () => {
      mainSidebar.classList.add('collapsed');
      tabBtns.forEach((b) => b.classList.remove('active'));
    });
  }
}

// Setup Top Header Actions
function setupHeaderEvents() {
  // Undo & Redo
  document.getElementById('btn-undo').addEventListener('click', () => window.app.canvasManager.undo());
  document.getElementById('btn-redo').addEventListener('click', () => window.app.canvasManager.redo());

  // Clear Canvas
  document.getElementById('btn-clear-canvas').addEventListener('click', () => {
    window.app.canvasManager.clearCanvas();
  });

  // Project Title edit
  const docTitleInput = document.getElementById('doc-title-input');
  if (docTitleInput) {
    docTitleInput.addEventListener('change', () => {
      showToast(`Document renamed to "${docTitleInput.value}"`, 'success');
    });
  }

  // Save Project file
  document.getElementById('btn-save-project').addEventListener('click', () => {
    const title = (docTitleInput ? docTitleInput.value : 'design').trim().replace(/\s+/g, '-').toLowerCase();
    window.app.export.saveProjectJSON(`${title}.designpro`);
    showToast('Design project saved to local file!', 'success');
  });

  // Load Project file
  const projectFileInput = document.getElementById('project-file-input');
  document.getElementById('btn-load-project').addEventListener('click', () => {
    projectFileInput.click();
  });
  projectFileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      window.app.export.loadProjectJSON(e.target.files[0], (err) => {
        if (err) {
          showToast('Failed to load project file.', 'error');
        } else {
          showToast('Project loaded successfully!', 'success');
        }
      });
    }
  });

  // Print button
  document.getElementById('btn-print').addEventListener('click', () => {
    window.app.export.printDesign();
  });

  // Color EyeDropper Tool
  const btnEyedropper = document.getElementById('btn-eyedropper');
  if (btnEyedropper) {
    btnEyedropper.addEventListener('click', () => {
      window.app.studioPro.pickColor();
    });
  }

  // Fullscreen Presentation Mode
  const btnPresentMode = document.getElementById('btn-present-mode');
  if (btnPresentMode) {
    btnPresentMode.addEventListener('click', () => {
      window.app.studioPro.enterPresentationMode();
    });
  }

  // Toggle Rulers & Guides
  const btnToggleRulers = document.getElementById('btn-toggle-rulers');
  if (btnToggleRulers) {
    btnToggleRulers.addEventListener('click', () => {
      if (window.app.rulers) {
        window.app.rulers.toggleGuides();
        btnToggleRulers.classList.toggle('active', window.app.rulers.visible);
      }
    });
  }

  // Color Eyedropper Screen Sampling
  const btnScreenEyedropper = document.getElementById('btn-screen-eyedropper');
  if (btnScreenEyedropper) {
    btnScreenEyedropper.addEventListener('click', () => {
      if (window.app.colorStudio) {
        window.app.colorStudio.pickScreenColor();
      }
    });
  }

  // 3D Product Mockup Studio
  const btnOpenMockup = document.getElementById('btn-open-3d-mockup');
  if (btnOpenMockup) {
    btnOpenMockup.addEventListener('click', () => {
      if (window.app.mockupStudio) {
        window.app.mockupStudio.open();
      }
    });
  }

  // Multi-Track Video Timeline Toggle
  const btnToggleTimeline = document.getElementById('btn-toggle-timeline');
  if (btnToggleTimeline) {
    btnToggleTimeline.addEventListener('click', () => {
      if (window.app.videoTimeline) {
        window.app.videoTimeline.toggle();
        btnToggleTimeline.classList.toggle('active', window.app.videoTimeline.isOpen);
      }
    });
  }

  // CMYK Print Studio & 3mm Bleed Pre-Flight Modal
  const btnOpenCmyk = document.getElementById('btn-open-cmyk-print');
  const cmykModal = document.getElementById('cmyk-print-modal');
  if (btnOpenCmyk && cmykModal) {
    btnOpenCmyk.addEventListener('click', () => {
      cmykModal.showModal();
      if (window.updateCmykPreflightUI) window.updateCmykPreflightUI();
    });
  }
}

// Bottom Artboard Status Bar (Zoom & Fit & Snapping & Grid)
function setupArtboardBottomBar() {
  document.getElementById('btn-zoom-in').addEventListener('click', () => window.app.canvasManager.zoomIn());
  document.getElementById('btn-zoom-out').addEventListener('click', () => window.app.canvasManager.zoomOut());
  document.getElementById('btn-fit-screen').addEventListener('click', () => window.app.canvasManager.fitToScreen());

  const btnToggleSnapping = document.getElementById('btn-toggle-snapping');
  if (btnToggleSnapping) {
    btnToggleSnapping.addEventListener('click', () => {
      const isEnabled = window.app.snapping.toggle();
      btnToggleSnapping.classList.toggle('active', isEnabled);
      btnToggleSnapping.textContent = isEnabled ? '🧲 Snapping: ON' : '🧲 Snapping: OFF';
      showToast(isEnabled ? 'Magnetic Snapping enabled' : 'Snapping disabled', 'info');
    });
  }

  const btnToggleGrid = document.getElementById('btn-toggle-grid');
  if (btnToggleGrid) {
    btnToggleGrid.addEventListener('click', () => {
      window.app.studioPro.toggleGrid();
    });
  }
}

// Contextual Toolbar Sync
window.app = window.app || {};
window.app.updateContextToolbar = function (selected) {
  const textControls = document.getElementById('toolbar-text-controls');
  const shapeControls = document.getElementById('toolbar-shape-controls');
  const imageControls = document.getElementById('toolbar-image-controls');
  const universalControls = document.getElementById('toolbar-universal-controls');
  const defaultControls = document.getElementById('toolbar-default-controls');

  // Hide all groups first
  textControls.style.display = 'none';
  shapeControls.style.display = 'none';
  imageControls.style.display = 'none';
  universalControls.style.display = 'none';
  defaultControls.style.display = 'none';

  if (!selected || selected.length === 0) {
    // Show default toolbar (Canvas background & presets)
    defaultControls.style.display = 'flex';
    return;
  }

  universalControls.style.display = 'flex';
  const obj = selected[0];

  const btnToggleLock = document.getElementById('btn-toggle-lock');
  if (btnToggleLock) {
    btnToggleLock.textContent = obj.lockMovementX ? '🔒 Locked' : '🔓 Lock';
  }

  if (obj.isType('i-text') || obj.isType('text')) {
    textControls.style.display = 'flex';
    // Sync text values
    const fontSelect = document.getElementById('text-font-family');
    const sizeInput = document.getElementById('text-font-size');
    const colorPicker = document.getElementById('text-color-picker');
    const colorPreview = document.getElementById('text-color-preview');
    const boldBtn = document.getElementById('btn-text-bold');
    const italicBtn = document.getElementById('btn-text-italic');
    const underlineBtn = document.getElementById('btn-text-underline');
    const curveSlider = document.getElementById('text-curve-slider');
    const curveLabel = document.getElementById('text-curve-label');

    if (fontSelect) fontSelect.value = obj.fontFamily || 'Outfit';
    if (sizeInput) sizeInput.value = Math.round(obj.fontSize) || 40;
    const textFillHex = window.AppUtils ? window.AppUtils.colorToHex(obj.fill, '#0f172a') : '#0f172a';
    if (colorPicker) colorPicker.value = textFillHex;
    if (colorPreview) colorPreview.style.background = typeof obj.fill === 'string' ? obj.fill : textFillHex;
    if (boldBtn) boldBtn.classList.toggle('active', obj.fontWeight === 'bold');
    if (italicBtn) italicBtn.classList.toggle('active', obj.fontStyle === 'italic');
    if (underlineBtn) underlineBtn.classList.toggle('active', !!obj.underline);
    if (curveSlider) curveSlider.value = obj.curvePercent || 0;
    if (curveLabel) curveLabel.textContent = `${obj.curvePercent || 0}%`;
  } else if (obj.type === 'image') {
    imageControls.style.display = 'flex';
  } else {
    // Shapes, Lines, Polygons, Groups
    shapeControls.style.display = 'flex';
    const shapeFillPicker = document.getElementById('shape-fill-picker');
    const shapeFillPreview = document.getElementById('shape-fill-preview');
    const shapeStrokePicker = document.getElementById('shape-stroke-picker');
    const shapeStrokePreview = document.getElementById('shape-stroke-preview');
    const strokeWidthInput = document.getElementById('shape-stroke-width');

    let currentFill = obj.fill;
    if ((!currentFill || currentFill === 'none') && (obj.type === 'group' || obj.type === 'activeSelection') && obj.getObjects) {
      const childWithFill = obj.getObjects().find(o => o.fill && o.fill !== 'none');
      if (childWithFill) currentFill = childWithFill.fill;
    }
    const fillHex = window.AppUtils ? window.AppUtils.colorToHex(currentFill, '#7c3aed') : '#7c3aed';
    if (shapeFillPicker) shapeFillPicker.value = fillHex;
    if (shapeFillPreview) shapeFillPreview.style.background = typeof currentFill === 'string' ? currentFill : fillHex;

    let currentStroke = obj.stroke;
    if (!currentStroke && (obj.type === 'group' || obj.type === 'activeSelection') && obj.getObjects) {
      const childWithStroke = obj.getObjects().find(o => o.stroke);
      if (childWithStroke) currentStroke = childWithStroke.stroke;
    }
    const strokeHex = window.AppUtils ? window.AppUtils.colorToHex(currentStroke, '#000000') : '#000000';
    if (shapeStrokePicker && currentStroke) shapeStrokePicker.value = strokeHex;
    if (shapeStrokePreview && currentStroke) shapeStrokePreview.style.background = strokeHex;
    if (strokeWidthInput) strokeWidthInput.value = obj.strokeWidth || 0;
  }

  // Universal Sync (Blend mode, Opacity, LUT)
  const blendSelect = document.getElementById('universal-blend-mode');
  if (blendSelect) {
    blendSelect.value = obj.globalCompositeOperation || 'source-over';
  }
  const opacitySlider = document.getElementById('universal-opacity-slider');
  if (opacitySlider) {
    opacitySlider.value = obj.opacity !== undefined ? obj.opacity : 1;
  }
  const lutSelect = document.getElementById('img-lut-select');
  if (lutSelect && obj.type === 'image') {
    lutSelect.value = (obj._adjustments && obj._adjustments.lut) || 'none';
  }
};

// Context Toolbar Action Events
function setupContextToolbarEvents() {
  // Text Actions
  document.getElementById('text-font-family').addEventListener('change', (e) => {
    window.app.textTool.setFontFamily(e.target.value);
  });
  document.getElementById('text-font-size').addEventListener('change', (e) => {
    window.app.textTool.setFontSize(e.target.value);
  });
  document.getElementById('btn-font-size-dec').addEventListener('click', () => {
    const input = document.getElementById('text-font-size');
    const current = window.AppUtils ? window.AppUtils.safeParseInt(input.value, 40, 6, 500) : (parseInt(input.value || 40, 10) || 40);
    input.value = Math.max(8, current - 2);
    window.app.textTool.setFontSize(input.value);
  });
  document.getElementById('btn-font-size-inc').addEventListener('click', () => {
    const input = document.getElementById('text-font-size');
    const current = window.AppUtils ? window.AppUtils.safeParseInt(input.value, 40, 6, 500) : (parseInt(input.value || 40, 10) || 40);
    input.value = Math.min(500, current + 2);
    window.app.textTool.setFontSize(input.value);
  });
  // Text Color with preview click and dual event handling
  const textColorPicker = document.getElementById('text-color-picker');
  const textColorPreview = document.getElementById('text-color-preview');
  const handleTextColor = (val) => {
    window.app.textTool.setTextColor(val);
    if (textColorPreview) textColorPreview.style.background = val;
  };
  if (textColorPicker) {
    textColorPicker.addEventListener('input', (e) => handleTextColor(e.target.value));
    textColorPicker.addEventListener('change', (e) => handleTextColor(e.target.value));
  }
  if (textColorPreview && textColorPicker) {
    textColorPreview.addEventListener('click', () => textColorPicker.click());
  }

  document.getElementById('btn-text-bold').addEventListener('click', function () {
    const isBold = window.app.textTool.toggleBold();
    this.classList.toggle('active', isBold);
  });
  document.getElementById('btn-text-italic').addEventListener('click', function () {
    const isItalic = window.app.textTool.toggleItalic();
    this.classList.toggle('active', isItalic);
  });
  document.getElementById('btn-text-underline').addEventListener('click', function () {
    const isUnderline = window.app.textTool.toggleUnderline();
    this.classList.toggle('active', isUnderline);
  });
  document.getElementById('btn-align-left').addEventListener('click', () => window.app.textTool.setTextAlign('left'));
  document.getElementById('btn-align-center').addEventListener('click', () => window.app.textTool.setTextAlign('center'));
  document.getElementById('btn-align-right').addEventListener('click', () => window.app.textTool.setTextAlign('right'));
  document.getElementById('text-shadow-select').addEventListener('change', (e) => {
    window.app.textTool.setTextShadow(e.target.value);
  });

  // Curved text
  const textCurveSlider = document.getElementById('text-curve-slider');
  if (textCurveSlider) {
    textCurveSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      const label = document.getElementById('text-curve-label');
      if (label) label.textContent = `${val}%`;
      window.app.advancedEffects.setCurvature(null, val);
    });
  }

  // Shape Actions (Fill & Stroke with preview click and dual event handling)
  const shapeFillPicker = document.getElementById('shape-fill-picker');
  const shapeFillPreview = document.getElementById('shape-fill-preview');
  const handleShapeFill = (val) => {
    window.app.elementsTool.setFillColor(val);
    if (shapeFillPreview) shapeFillPreview.style.background = val;
  };
  if (shapeFillPicker) {
    shapeFillPicker.addEventListener('input', (e) => handleShapeFill(e.target.value));
    shapeFillPicker.addEventListener('change', (e) => handleShapeFill(e.target.value));
  }
  if (shapeFillPreview && shapeFillPicker) {
    shapeFillPreview.addEventListener('click', () => shapeFillPicker.click());
  }

  const shapeStrokePicker = document.getElementById('shape-stroke-picker');
  const shapeStrokePreview = document.getElementById('shape-stroke-preview');
  const handleShapeStroke = (val) => {
    window.app.elementsTool.setStrokeColor(val);
    if (shapeStrokePreview) shapeStrokePreview.style.background = val;
  };
  if (shapeStrokePicker) {
    shapeStrokePicker.addEventListener('input', (e) => handleShapeStroke(e.target.value));
    shapeStrokePicker.addEventListener('change', (e) => handleShapeStroke(e.target.value));
  }
  if (shapeStrokePreview && shapeStrokePicker) {
    shapeStrokePreview.addEventListener('click', () => shapeStrokePicker.click());
  }

  const canvasBgPicker = document.getElementById('canvas-bg-picker');
  const canvasBgPreview = document.getElementById('canvas-bg-preview');
  if (canvasBgPreview && canvasBgPicker) {
    canvasBgPreview.addEventListener('click', () => canvasBgPicker.click());
  }

  document.getElementById('shape-stroke-width').addEventListener('input', (e) => {
    window.app.elementsTool.setStrokeWidth(e.target.value);
  });

  // Gradient & Pattern Fill triggers
  const btnOpenGrad = document.getElementById('btn-open-gradient-modal');
  if (btnOpenGrad) {
    btnOpenGrad.addEventListener('click', () => {
      document.getElementById('gradient-modal').showModal();
    });
  }
  const btnOpenPat = document.getElementById('btn-open-pattern-modal');
  if (btnOpenPat) {
    btnOpenPat.addEventListener('click', () => {
      document.getElementById('pattern-modal').showModal();
    });
  }

  // Image Filter Actions
  document.querySelectorAll('.btn-img-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      window.app.imagesTool.applyFilter(filter, 0.2);
    });
  });

  // Creative Duotone Color Grading Actions
  document.querySelectorAll('.btn-duotone-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const duotoneStyle = btn.getAttribute('data-duotone');
      window.app.studioPro.applyDuotoneFilter(duotoneStyle);
    });
  });

  // FilmCraft Cinematic LUT dropdown
  const imgLutSelect = document.getElementById('img-lut-select');
  if (imgLutSelect) {
    imgLutSelect.addEventListener('change', (e) => {
      window.app.photocraft.applyCinematicLUT(e.target.value);
    });
  }

  // Universal Blend Mode selector
  const universalBlend = document.getElementById('universal-blend-mode');
  if (universalBlend) {
    universalBlend.addEventListener('change', (e) => {
      window.app.photocraft.setBlendMode(e.target.value);
    });
  }

  // Remove Background trigger
  const btnRemoveBg = document.getElementById('btn-action-remove-bg');
  if (btnRemoveBg) {
    btnRemoveBg.addEventListener('click', () => {
      const active = window.app.canvas.getActiveObject();
      if (!active || active.type !== 'image') {
        showToast('Please select a photo on the artboard first', 'error');
        return;
      }
      document.getElementById('bg-remover-modal').showModal();
    });
  }

  // Set image as Artboard Background trigger
  const btnSetAsBg = document.getElementById('btn-set-as-bg');
  if (btnSetAsBg) {
    btnSetAsBg.addEventListener('click', () => {
      const active = window.app.canvas.getActiveObject();
      if (!active || active.type !== 'image') {
        showToast('Please select a photo on the artboard first', 'error');
        return;
      }
      if (window.app && window.app.imagesTool) {
        window.app.imagesTool.setImageAsBackground(active);
      }
    });
  }

  // Object Alignment & Distribution Engine Actions
  document.querySelectorAll('.btn-align-obj').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dir = btn.getAttribute('data-align');
      window.app.studioPro.align(dir);
    });
  });

  document.querySelectorAll('.btn-distribute-obj').forEach((btn) => {
    btn.addEventListener('click', () => {
      const axis = btn.getAttribute('data-axis');
      window.app.studioPro.distribute(axis);
    });
  });

  const btnGroup = document.getElementById('btn-group-selected');
  if (btnGroup) {
    btnGroup.addEventListener('click', () => window.app.studioPro.groupSelected());
  }

  const btnUngroup = document.getElementById('btn-ungroup-selected');
  if (btnUngroup) {
    btnUngroup.addEventListener('click', () => window.app.studioPro.ungroupSelected());
  }

  // Universal Actions
  document.getElementById('btn-duplicate-selected').addEventListener('click', () => {
    window.app.canvasManager.duplicate();
  });
  document.getElementById('btn-delete-selected').addEventListener('click', () => {
    window.app.canvasManager.deleteSelected();
  });
  document.getElementById('btn-layer-forward').addEventListener('click', () => {
    window.app.layers.bringForward();
  });
  document.getElementById('btn-layer-backward').addEventListener('click', () => {
    window.app.layers.sendBackward();
  });
  document.getElementById('btn-flip-h').addEventListener('click', () => {
    window.app.elementsTool.flipX();
  });
  document.getElementById('btn-flip-v').addEventListener('click', () => {
    window.app.elementsTool.flipY();
  });
  document.getElementById('universal-opacity-slider').addEventListener('input', (e) => {
    window.app.elementsTool.setOpacity(e.target.value);
  });

  // Universal Shadow & Lock
  const btnOpenShadow = document.getElementById('btn-open-shadow-modal');
  if (btnOpenShadow) {
    btnOpenShadow.addEventListener('click', () => {
      document.getElementById('shadow-modal').showModal();
    });
  }
  const btnToggleLock = document.getElementById('btn-toggle-lock');
  if (btnToggleLock) {
    btnToggleLock.addEventListener('click', () => {
      const active = window.app.canvas.getActiveObject();
      if (!active) return;
      const isLocked = !active.lockMovementX;
      active.set({
        lockMovementX: isLocked,
        lockMovementY: isLocked,
        lockRotation: isLocked,
        lockScalingX: isLocked,
        lockScalingY: isLocked,
      });
      btnToggleLock.textContent = isLocked ? '🔒 Locked' : '🔓 Lock';
      showToast(isLocked ? 'Object locked in place' : 'Object unlocked', 'info');
      window.app.canvas.renderAll();
      window.app.canvasManager.recordState();
    });
  }

  // Default Canvas Background Picker
  document.getElementById('canvas-bg-picker').addEventListener('input', (e) => {
    window.app.canvas.setBackgroundColor(e.target.value, () => {
      window.app.canvas.renderAll();
      window.app.canvasManager.recordState();
    });
    document.getElementById('canvas-bg-preview').style.background = e.target.value;
  });
}

// Templates Tab with Category Filtering
function setupTemplatesTab() {
  const cards = document.querySelectorAll('.template-card');
  const pills = document.querySelectorAll('.category-pill');

  // Save to My Templates
  const btnSaveCustom = document.getElementById('btn-save-as-custom-template');
  if (btnSaveCustom) {
    btnSaveCustom.addEventListener('click', async () => {
      const docTitle = document.getElementById('doc-title-input')?.value.trim() || 'My Custom Template';
      const name = prompt('Enter a name for this custom template:', docTitle);
      if (name && name.trim()) {
        if (window.app && window.app.templates) {
          await window.app.templates.saveCurrentAsCustomTemplate(name.trim(), 'custom');
        }
      }
    });
  }

  // Export & Import Template Packs (.designpro-pack)
  const btnExportPack = document.getElementById('btn-export-template-pack');
  if (btnExportPack) {
    btnExportPack.addEventListener('click', () => {
      if (window.app && window.app.templates) {
        window.app.templates.exportTemplatePack();
      }
    });
  }

  const btnImportPack = document.getElementById('btn-import-template-pack');
  const inputImportPack = document.getElementById('input-import-template-pack');
  if (btnImportPack && inputImportPack) {
    btnImportPack.addEventListener('click', () => inputImportPack.click());
    inputImportPack.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0 && window.app && window.app.templates) {
        window.app.templates.importTemplatePack(e.target.files[0]);
      }
    });
  }

  // Category Filter pills delegated to TemplatesEngine
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const category = pill.getAttribute('data-category') || 'all';
      if (window.app && window.app.templates) {
        window.app.templates.currentCategory = category;
        window.app.templates.filterAllTemplates();
      }
    });
  });

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const templateKey = card.getAttribute('data-template');
      if (templateKey && window.app && window.app.templates) {
        window.app.templates.loadTemplate(templateKey);
        showToast(`Loaded "${card.querySelector('.template-name').textContent}" template!`, 'success');
      }
    });
  });
}

// Elements Tab
function setupElementsTab() {
  const bindClick = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  };

  bindClick('btn-add-rect', () => window.app.elementsTool.addRect(false));
  bindClick('btn-add-round-rect', () => window.app.elementsTool.addRect(true));
  bindClick('btn-add-circle', () => window.app.elementsTool.addCircle());
  bindClick('btn-add-triangle', () => window.app.elementsTool.addTriangle());
  bindClick('btn-add-star', () => window.app.elementsTool.addStar());
  bindClick('btn-add-heart', () => window.app.elementsTool.addHeart());
  bindClick('btn-add-hexagon', () => window.app.elementsTool.addHexagon());
  bindClick('btn-add-line', () => window.app.elementsTool.addLine(false));
  bindClick('btn-add-dashed-line', () => window.app.elementsTool.addLine(true));
  bindClick('btn-add-arrow', () => window.app.elementsTool.addArrow());
  bindClick('btn-add-sparkle', () => window.app.elementsTool.addSparkle());
  bindClick('btn-add-badge', () => window.app.elementsTool.addBadge());
  bindClick('btn-add-blob-1', () => window.app.elementsTool.addBlob(1));
  bindClick('btn-add-blob-2', () => window.app.elementsTool.addBlob(2));
  bindClick('btn-add-speech', () => window.app.elementsTool.addSpeechBubble());
  bindClick('btn-add-ribbon', () => window.app.elementsTool.addRibbon());
  bindClick('btn-add-shield', () => window.app.elementsTool.addShield());
  bindClick('btn-add-diamond', () => window.app.elementsTool.addDiamond());
  bindClick('btn-add-wave', () => window.app.elementsTool.addWaveDivider());
  bindClick('btn-add-crown', () => window.app.elementsTool.addCrown());
  bindClick('btn-add-frame', () => window.app.elementsTool.addPolaroidFrame());

  document.querySelectorAll('[data-shape]').forEach((button) => {
    button.addEventListener('click', () => window.app.elementsTool.addPresetShape(button.dataset.shape));
  });

  // Stickers & Badges
  document.querySelectorAll('.btn-add-sticker').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.getAttribute('data-sticker');
      window.app.elementsTool.addSticker(type);
      showToast(`Added ${type.toUpperCase()} sticker!`, 'info');
    });
  });

  // Social & Tech Icons
  document.querySelectorAll('.btn-social-icon').forEach((btn) => {
    btn.addEventListener('click', () => {
      const icon = btn.getAttribute('data-icon');
      window.app.elementsTool.addSocialIcon(icon);
      showToast(`Added ${icon} icon to artboard!`, 'info');
    });
  });

  // Photo Frames & Clipping Masks
  document.querySelectorAll('.btn-apply-frame').forEach((btn) => {
    btn.addEventListener('click', () => {
      const maskType = btn.getAttribute('data-mask');
      window.app.framesEngine.applyMask(maskType);
    });
  });
}

// Text Tab
function setupTextTab() {
  document.getElementById('btn-add-heading').addEventListener('click', () => window.app.textTool.addHeading());
  document.getElementById('btn-add-subheading').addEventListener('click', () => window.app.textTool.addSubheading());
  document.getElementById('btn-add-body').addEventListener('click', () => window.app.textTool.addBody());

  document.querySelectorAll('.font-combo-card').forEach((card) => {
    card.addEventListener('click', () => {
      const combo = card.getAttribute('data-combo');
      window.app.textTool.addFontCombination(combo);
    });
  });

  // Google Fonts Live Search & Trending list
  const gfontsListEl = document.getElementById('popular-gfonts-list');
  if (gfontsListEl && window.app.fontsLoader) {
    window.app.fontsLoader.renderPopularFontsList(gfontsListEl);
  }

  const gfontInput = document.getElementById('gfonts-search-input');
  const btnLoadGFont = document.getElementById('btn-load-custom-font');
  const doLoadFont = () => {
    if (gfontInput && gfontInput.value.trim()) {
      window.app.fontsLoader.loadFont(gfontInput.value.trim());
    }
  };
  if (btnLoadGFont) btnLoadGFont.addEventListener('click', doLoadFont);
  if (gfontInput) {
    gfontInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLoadFont();
    });
  }
}

// QR Code Tab
function setupQRCodeTab() {
  const qrColorPicker = document.getElementById('qr-color-picker');
  const qrBgPicker = document.getElementById('qr-bg-picker');

  qrColorPicker.addEventListener('input', (e) => {
    document.getElementById('qr-color-preview').style.background = e.target.value;
  });
  qrBgPicker.addEventListener('input', (e) => {
    document.getElementById('qr-bg-preview').style.background = e.target.value;
  });

  document.getElementById('btn-generate-qr').addEventListener('click', () => {
    const text = document.getElementById('qr-input-text').value;
    const color = qrColorPicker.value;
    const bgColor = qrBgPicker.value;
    window.app.qrcode.generateQRCode(text, color, bgColor);
  });
}

// Uploads Tab
function setupUploadsTab() {
  const dropzone = document.getElementById('upload-dropzone');
  const fileInput = document.getElementById('image-file-input');

  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    window.app.imagesTool.handleFileUpload(e.target.files);
    fileInput.value = '';
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files) {
      window.app.imagesTool.handleFileUpload(e.dataTransfer.files);
    }
  });
}

// Photos Tab
function setupPhotosTab() {
  const photosGrid = document.getElementById('photos-grid');
  if (!photosGrid) return;

  const searchInput = document.getElementById('photos-search-input');
  const fileInput = document.getElementById('photos-file-input');
  const importFilesButton = document.getElementById('btn-import-photo-files');
  const urlInput = document.getElementById('photos-url-input');
  const importUrlButton = document.getElementById('btn-import-photo-url');
  let searchTimer;
  let requestId = 0;
  let lastRemotePhotos = [];

  const renderPhotos = (photos) => {
    photosGrid.replaceChildren();
    if (!photos.length) {
      const empty = document.createElement('div');
      empty.className = 'photos-empty';
      empty.textContent = 'No photos found. Try another search or import an image from your device or a URL.';
      photosGrid.appendChild(empty);
      return;
    }

    photos.forEach((photo) => {
      const name = photo.title || photo.name || 'Photo';
      const src = photo.dataUrl || photo.thumb || photo.url;
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'photo-item';
      const credit = [photo.author, photo.source].filter(Boolean).join(' · ');
      item.title = [name, credit, 'Click to add'].filter(Boolean).join(' · ');
      const image = document.createElement('img');
      image.src = src;
      image.alt = name;
      image.loading = 'lazy';
      item.appendChild(image);
      item.addEventListener('click', () => {
        window.app.imagesTool.addImageToCanvas(photo.dataUrl || photo.url || photo.thumb, name);
        showToast(`Added ${name} to artboard`, 'info');
      });
      photosGrid.appendChild(item);
    });
  };

  const refreshPhotos = async (query = '') => {
    const activeRequest = ++requestId;
    photosGrid.innerHTML = '<div class="photos-empty">Loading photos…</div>';
    const [remotePhotos] = await Promise.allSettled([window.app.contentHub.fetchPhotos(query)]);
    if (activeRequest !== requestId) return;
    const imported = window.app.contentHub.importedAssets.filter((asset) => asset.type === 'photo');
    const matchedImports = query
      ? imported.filter((asset) => asset.title.toLowerCase().includes(query.toLowerCase()))
      : imported;
    lastRemotePhotos = remotePhotos.status === 'fulfilled' ? remotePhotos.value : [];
    const merged = [...matchedImports, ...lastRemotePhotos];
    const unique = Array.from(new Map(merged.map((photo) => [photo.id || photo.url || photo.thumb, photo])).values());
    renderPhotos(unique);
  };

  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => refreshPhotos(event.target.value.trim()), 350);
    });
  }
  if (importFilesButton && fileInput) importFilesButton.addEventListener('click', () => fileInput.click());
  if (fileInput) fileInput.addEventListener('change', (event) => {
    window.app.imagesTool.handleFileUpload(event.target.files);
    fileInput.value = '';
  });
  if (importUrlButton && urlInput) {
    const importUrl = async () => {
      const imported = await window.app.imagesTool.importFromUrl(urlInput.value);
      if (imported) urlInput.value = '';
    };
    importUrlButton.addEventListener('click', importUrl);
    urlInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') importUrl();
    });
  }
  window.addEventListener('designpro:asset-imported', (event) => {
    const asset = event.detail;
    if (asset && asset.type === 'photo') {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const imported = window.app.contentHub.importedAssets.filter((item) => item.type === 'photo' && (!query || item.title.toLowerCase().includes(query)));
      renderPhotos([...imported, ...lastRemotePhotos]);
    }
  });
  refreshPhotos();
}

// Draw Tab
function setupDrawTab() {
  const brushTypeSelect = document.getElementById('draw-brush-type');
  const brushSizeInput = document.getElementById('draw-brush-size');
  const brushColorPicker = document.getElementById('draw-brush-color');
  const opacityInput = document.getElementById('draw-brush-opacity');

  brushTypeSelect.addEventListener('change', (e) => {
    window.app.drawingTool.setBrushType(e.target.value);
  });
  brushSizeInput.addEventListener('input', (e) => {
    window.app.drawingTool.setBrushWidth(e.target.value);
    document.getElementById('draw-brush-size-label').textContent = `${e.target.value}px`;
  });
  brushColorPicker.addEventListener('input', (e) => {
    window.app.drawingTool.setBrushColor(e.target.value);
    document.getElementById('draw-brush-color-preview').style.background = e.target.value;
  });
  if (opacityInput) {
    opacityInput.addEventListener('input', (e) => {
      const opacity = Number(e.target.value) / 100;
      window.app.drawingTool.setBrushOpacity(opacity);
      document.getElementById('draw-brush-opacity-label').textContent = `${e.target.value}%`;
    });
  }
}

// Background Tab
function setupBackgroundTab() {
  // Solid color swatches (Recolors active element if one is selected, else canvas background)
  document.querySelectorAll('.bg-color-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const color = swatch.getAttribute('data-color');
      const active = window.app.canvas ? window.app.canvas.getActiveObject() : null;
      if (active) {
        if (active.isType('i-text') || active.isType('text') || active.isType('textbox')) {
          window.app.textTool.setTextColor(color);
        } else {
          window.app.elementsTool.setFillColor(color);
        }
        if (window.app.updateContextToolbar) {
          window.app.updateContextToolbar([active]);
        }
        showToast('Element color updated', 'success');
      } else {
        window.app.canvas.setBackgroundColor(color, () => {
          window.app.canvas.renderAll();
          window.app.canvasManager.recordState();
        });
        const bgPicker = document.getElementById('canvas-bg-picker');
        if (bgPicker) bgPicker.value = window.AppUtils ? window.AppUtils.colorToHex(color, '#ffffff') : color;
        const bgPreview = document.getElementById('canvas-bg-preview');
        if (bgPreview) bgPreview.style.background = color;
        showToast('Canvas background updated', 'info');
      }
    });
  });

  // Gradient presets (Applies to active shape if selected, else canvas background)
  document.querySelectorAll('.bg-gradient-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const c1 = swatch.getAttribute('data-c1');
      const c2 = swatch.getAttribute('data-c2');
      const active = window.app.canvas ? window.app.canvas.getActiveObject() : null;
      if (active && (active.type === 'rect' || active.type === 'circle' || active.type === 'polygon' || active.type === 'path')) {
        const bound = active.getBoundingRect(true);
        const grad = new fabric.Gradient({
          type: 'linear',
          gradientUnits: 'pixels',
          coords: { x1: -bound.width / 2, y1: -bound.height / 2, x2: bound.width / 2, y2: bound.height / 2 },
          colorStops: [
            { offset: 0, color: c1 },
            { offset: 1, color: c2 },
          ],
        });
        active.set('fill', grad);
        active.dirty = true;
        window.app.canvas.renderAll();
        window.app.canvasManager.recordState();
        showToast('Element gradient applied', 'success');
      } else {
        const artW = window.app.canvasManager ? window.app.canvasManager.artboardWidth : (window.app.canvas.width / (window.app.canvas.getZoom() || 1));
        const artH = window.app.canvasManager ? window.app.canvasManager.artboardHeight : (window.app.canvas.height / (window.app.canvas.getZoom() || 1));
        const grad = new fabric.Gradient({
          type: 'linear',
          gradientUnits: 'pixels',
          coords: { x1: 0, y1: 0, x2: artW, y2: artH },
          colorStops: [
            { offset: 0, color: c1 },
            { offset: 1, color: c2 },
          ],
        });
        window.app.canvas.setBackgroundColor(grad, () => {
          window.app.canvas.renderAll();
          window.app.canvasManager.recordState();
        });
        showToast('Canvas gradient applied', 'info');
      }
    });
  });

  // Curated Color Theme Palettes
  document.querySelectorAll('.palette-theme-card').forEach((card) => {
    card.addEventListener('click', () => {
      const c1 = card.getAttribute('data-p1');
      const c2 = card.getAttribute('data-p2');
      const c3 = card.getAttribute('data-p3');
      const c4 = card.getAttribute('data-p4');
      const name = card.getAttribute('data-name') || 'Curated Palette';

      const artW = window.app.canvasManager ? window.app.canvasManager.artboardWidth : (window.app.canvas.width / (window.app.canvas.getZoom() || 1));
      const artH = window.app.canvasManager ? window.app.canvasManager.artboardHeight : (window.app.canvas.height / (window.app.canvas.getZoom() || 1));
      const grad = new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: { x1: 0, y1: 0, x2: artW, y2: artH },
        colorStops: [
          { offset: 0, color: c1 },
          { offset: 1, color: c2 },
        ],
      });

      window.app.canvas.setBackgroundColor(grad, () => {
        const active = window.app.canvas.getActiveObject();
        if (active) {
          if (active.type === 'i-text' || active.type === 'text') {
            active.set('fill', c4 || c3);
          } else if (active.type === 'group') {
            active.forEachObject((obj) => {
              if (obj.type !== 'text') obj.set('fill', c3);
            });
          } else {
            active.set('fill', c3);
          }
        }
        window.app.canvas.renderAll();
        window.app.canvasManager.recordState();
      });

      showToast(`Applied "${name}" palette!`, 'success');
    });
  });
}

// Multi-Page Management
function setupMultiPageEvents() {
  document.getElementById('btn-add-page').addEventListener('click', () => {
    window.app.pages.addPage();
    showToast('New page added', 'success');
  });

  document.getElementById('btn-duplicate-page').addEventListener('click', () => {
    window.app.pages.duplicatePage();
    showToast('Page duplicated', 'success');
  });
}

// Modals: Resize, Export, Shortcuts
function setupModals() {
  // Resize Modal
  const resizeModal = document.getElementById('resize-modal');
  const btnOpenResize = document.getElementById('btn-open-resize');
  const btnCloseResize = document.getElementById('btn-close-resize');
  const btnApplyResize = document.getElementById('btn-apply-resize');

  btnOpenResize.addEventListener('click', () => {
    document.getElementById('custom-width-input').value = window.app.canvasManager.artboardWidth;
    document.getElementById('custom-height-input').value = window.app.canvasManager.artboardHeight;
    resizeModal.showModal();
  });

  btnCloseResize.addEventListener('click', () => resizeModal.close());

  resizeModal.addEventListener('click', (e) => {
    const rect = resizeModal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      resizeModal.close();
    }
  });

  document.querySelectorAll('.preset-card').forEach((card) => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.preset-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      const w = card.getAttribute('data-w');
      const h = card.getAttribute('data-h');
      document.getElementById('custom-width-input').value = w;
      document.getElementById('custom-height-input').value = h;
    });
  });

  btnApplyResize.addEventListener('click', () => {
    const wVal = document.getElementById('custom-width-input').value;
    const hVal = document.getElementById('custom-height-input').value;
    const w = window.AppUtils ? window.AppUtils.evalMathExpr(wVal, 1080, 50, 10000) : (parseInt(wVal, 10) || 1080);
    const h = window.AppUtils ? window.AppUtils.evalMathExpr(hVal, 1080, 50, 10000) : (parseInt(hVal, 10) || 1080);
    const scaleContent = document.getElementById('resize-scale-content') ? document.getElementById('resize-scale-content').checked : false;
    if (w > 0 && h > 0) {
      if (window.app.advancedEffects && scaleContent) {
        window.app.advancedEffects.quickResize(w, h, true);
      } else {
        window.app.canvasManager.setArtboardSize(w, h);
      }
      resizeModal.close();
      showToast(`Artboard resized to ${w} × ${h} px`, 'success');
    }
  });

  // Export Modal
  const exportModal = document.getElementById('export-modal');
  const btnOpenExport = document.getElementById('btn-open-export');
  const btnCloseExport = document.getElementById('btn-close-export');
  const btnDownloadExport = document.getElementById('btn-download-export');

  btnOpenExport.addEventListener('click', () => exportModal.showModal());
  btnCloseExport.addEventListener('click', () => exportModal.close());

  exportModal.addEventListener('click', (e) => {
    const rect = exportModal.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
      exportModal.close();
    }
  });

  document.querySelectorAll('.export-format-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.export-format-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      window.app.selectedFormat = btn.getAttribute('data-format');

      const transparentRow = document.getElementById('export-transparent-row');
      if (transparentRow) {
        transparentRow.style.display = window.app.selectedFormat === 'png' ? 'flex' : 'none';
      }
      const motionRow = document.getElementById('export-motion-row');
      if (motionRow) {
        motionRow.style.display = window.app.selectedFormat === 'webm' ? 'flex' : 'none';
      }
    });
  });

  btnDownloadExport.addEventListener('click', () => {
    const format = window.app.selectedFormat || 'png';
    const transparent = document.getElementById('export-transparent-check').checked;
    const docTitle = document.getElementById('doc-title-input').value.trim() || 'designpro-creation';
    const filename = `${docTitle.replace(/\s+/g, '-').toLowerCase()}.${format}`;

    if (format === 'webm') {
      const durationEl = document.getElementById('video-duration-select');
      const duration = window.AppUtils ? window.AppUtils.safeParseInt(durationEl ? durationEl.value : 3000, 3000, 500, 60000) : (parseInt(durationEl ? durationEl.value : 3000, 10) || 3000);
      window.app.videoExporter.recordAnimatedClip({ motionStyle, duration, filename });
      exportModal.close();
      return;
    } else if (format === 'png') {
      window.app.export.exportPNG({ transparent, multiplier: 2, filename });
    } else if (format === 'jpg' || format === 'jpeg') {
      window.app.export.exportJPEG({ quality: 0.95, multiplier: 2, filename });
    } else if (format === 'svg') {
      window.app.export.exportSVG(filename);
    } else if (format === 'pdf') {
      if (window.app.pdfcraft) {
        window.app.pdfcraft.exportNativePDF(filename);
      } else {
        window.app.export.printDesign();
      }
    }

    exportModal.close();
    showToast(`Exported ${filename} successfully!`, 'success');
  });

  const btnCopyClipboard = document.getElementById('btn-copy-clipboard');
  if (btnCopyClipboard) {
    btnCopyClipboard.addEventListener('click', async () => {
      const transparent = document.getElementById('export-transparent-check').checked;
      if (window.app && window.app.export) {
        await window.app.export.copyImageToClipboard({ transparent, multiplier: 2 });
      }
      exportModal.close();
    });
  }

  // Shortcuts Modal
  const shortcutsModal = document.getElementById('shortcuts-modal');
  const btnOpenShortcuts = document.getElementById('btn-open-shortcuts');
  const btnCloseShortcuts = document.getElementById('btn-close-shortcuts');

  if (btnOpenShortcuts && shortcutsModal) {
    btnOpenShortcuts.addEventListener('click', () => shortcutsModal.showModal());
    btnCloseShortcuts.addEventListener('click', () => shortcutsModal.close());
    shortcutsModal.addEventListener('click', (e) => {
      const rect = shortcutsModal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        shortcutsModal.close();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
        if (tag !== 'input' && tag !== 'textarea') {
          shortcutsModal.showModal();
        }
      }
    });
  }

  // Gradient Modal
  const gradientModal = document.getElementById('gradient-modal');
  const btnCloseGradient = document.getElementById('btn-close-gradient');
  const btnApplyGradient = document.getElementById('btn-apply-gradient');
  if (gradientModal && btnCloseGradient && btnApplyGradient) {
    btnCloseGradient.addEventListener('click', () => gradientModal.close());
    gradientModal.addEventListener('click', (e) => {
      const rect = gradientModal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        gradientModal.close();
      }
    });

    document.querySelectorAll('.btn-grad-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        const c1 = btn.getAttribute('data-c1');
        const c2 = btn.getAttribute('data-c2');
        if (c1) document.getElementById('gradient-c1').value = c1;
        if (c2) document.getElementById('gradient-c2').value = c2;
      });
    });

    btnApplyGradient.addEventListener('click', () => {
      const c1 = document.getElementById('gradient-c1').value;
      const c2 = document.getElementById('gradient-c2').value;
      const dir = document.getElementById('gradient-direction').value;
      const ok = window.app.advancedEffects.applyElementGradient(c1, c2, dir);
      if (ok) {
        gradientModal.close();
        showToast('Gradient applied to selected object!', 'success');
      } else {
        showToast('Select a shape or text object first', 'error');
      }
    });
  }

  // Texture Pattern Modal
  const patternModal = document.getElementById('pattern-modal');
  const btnClosePattern = document.getElementById('btn-close-pattern');
  const btnApplyPattern = document.getElementById('btn-apply-pattern');
  let selectedPatternType = 'dots';

  if (patternModal && btnClosePattern && btnApplyPattern) {
    btnClosePattern.addEventListener('click', () => patternModal.close());
    patternModal.addEventListener('click', (e) => {
      const rect = patternModal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        patternModal.close();
      }
    });

    document.querySelectorAll('.btn-pattern-opt').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-pattern-opt').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPatternType = btn.getAttribute('data-pattern') || 'dots';
      });
    });

    btnApplyPattern.addEventListener('click', () => {
      const ok = window.app.advancedEffects.applyElementPattern(selectedPatternType);
      if (ok) {
        patternModal.close();
        showToast(`Pattern "${selectedPatternType}" applied!`, 'success');
      } else {
        showToast('Select a shape on the artboard first', 'error');
      }
    });
  }

  // Shadow & Neon Glow Modal
  const shadowModal = document.getElementById('shadow-modal');
  const btnCloseShadow = document.getElementById('btn-close-shadow');
  const btnApplyShadow = document.getElementById('btn-apply-shadow');
  const blurInput = document.getElementById('shadow-blur-input');
  const blurLabel = document.getElementById('shadow-blur-label');
  const xInput = document.getElementById('shadow-x-input');
  const xLabel = document.getElementById('shadow-x-label');
  const yInput = document.getElementById('shadow-y-input');
  const yLabel = document.getElementById('shadow-y-label');
  const colorInput = document.getElementById('shadow-color-input');

  if (shadowModal && btnCloseShadow && btnApplyShadow) {
    btnCloseShadow.addEventListener('click', () => shadowModal.close());
    shadowModal.addEventListener('click', (e) => {
      const rect = shadowModal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        shadowModal.close();
      }
    });

    if (blurInput) blurInput.addEventListener('input', (e) => { blurLabel.textContent = `${e.target.value}px`; });
    if (xInput) xInput.addEventListener('input', (e) => { xLabel.textContent = `${e.target.value}px`; });
    if (yInput) yInput.addEventListener('input', (e) => { yLabel.textContent = `${e.target.value}px`; });

    document.querySelectorAll('.btn-shadow-preset').forEach((btn) => {
      btn.addEventListener('click', () => {
        const preset = btn.getAttribute('data-preset');
        if (preset === 'soft') {
          blurInput.value = 16; blurLabel.textContent = '16px';
          xInput.value = 0; xLabel.textContent = '0px';
          yInput.value = 8; yLabel.textContent = '8px';
          colorInput.value = '#0f172a';
        } else if (preset === 'floating') {
          blurInput.value = 32; blurLabel.textContent = '32px';
          xInput.value = 0; xLabel.textContent = '0px';
          yInput.value = 16; yLabel.textContent = '16px';
          colorInput.value = '#1e293b';
        } else if (preset === 'neon-cyan') {
          blurInput.value = 24; blurLabel.textContent = '24px';
          xInput.value = 0; xLabel.textContent = '0px';
          yInput.value = 0; yLabel.textContent = '0px';
          colorInput.value = '#06b6d4';
        } else if (preset === 'neon-magenta') {
          blurInput.value = 24; blurLabel.textContent = '24px';
          xInput.value = 0; xLabel.textContent = '0px';
          yInput.value = 0; yLabel.textContent = '0px';
          colorInput.value = '#d946ef';
        } else if (preset === 'retro-3d') {
          blurInput.value = 0; blurLabel.textContent = '0px';
          xInput.value = 6; xLabel.textContent = '6px';
          yInput.value = 6; yLabel.textContent = '6px';
          colorInput.value = '#0f172a';
        } else if (preset === 'none') {
          window.app.advancedEffects.applyShadow({ type: 'none' });
          shadowModal.close();
          showToast('Shadow removed', 'info');
          return;
        }
      });
    });

    btnApplyShadow.addEventListener('click', () => {
      const blur = window.AppUtils ? window.AppUtils.safeParseInt(blurInput.value, 0, 0, 100) : (parseInt(blurInput.value, 10) || 0);
      const offsetX = window.AppUtils ? window.AppUtils.safeParseInt(xInput.value, 0, -200, 200) : (parseInt(xInput.value, 10) || 0);
      const offsetY = window.AppUtils ? window.AppUtils.safeParseInt(yInput.value, 0, -200, 200) : (parseInt(yInput.value, 10) || 0);
      const color = colorInput.value;
      const ok = window.app.advancedEffects.applyShadow({ blur, offsetX, offsetY, color });
      if (ok) {
        shadowModal.close();
        showToast('Shadow applied!', 'success');
      } else {
        showToast('Select an object on the artboard first', 'error');
      }
    });
  }

  // 1-Click Background Knockout Modal
  const bgRemoverModal = document.getElementById('bg-remover-modal');
  const btnCloseBgRemover = document.getElementById('btn-close-bg-remover');
  const btnExecBgKnockout = document.getElementById('btn-execute-bg-knockout');
  const tolSlider = document.getElementById('bg-tolerance-slider');
  const tolVal = document.getElementById('bg-tolerance-val');
  const targetColorInput = document.getElementById('bg-knockout-color');

  if (bgRemoverModal && btnCloseBgRemover && btnExecBgKnockout) {
    btnCloseBgRemover.addEventListener('click', () => bgRemoverModal.close());
    bgRemoverModal.addEventListener('click', (e) => {
      const rect = bgRemoverModal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        bgRemoverModal.close();
      }
    });

    if (tolSlider && tolVal) {
      tolSlider.addEventListener('input', (e) => {
        tolVal.textContent = e.target.value;
      });
    }

    btnExecBgKnockout.addEventListener('click', async () => {
      const tol = window.AppUtils ? window.AppUtils.safeParseInt(tolSlider.value, 24, 1, 150) : (parseInt(tolSlider.value, 10) || 24);
      const color = targetColorInput ? targetColorInput.value : null;
      btnExecBgKnockout.textContent = '⏳ Processing Knockout...';
      btnExecBgKnockout.disabled = true;

      try {
        await window.app.advancedEffects.removeImageBackground(null, tol, color);
        bgRemoverModal.close();
        showToast('Background removed successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Background removal failed', 'error');
      } finally {
        btnExecBgKnockout.textContent = '⚡ Remove Background Now';
        btnExecBgKnockout.disabled = false;
      }
    });
  }

  // CMYK Print Studio Modal & Pre-Flight Inspector
  const cmykModal = document.getElementById('cmyk-print-modal');
  const btnCloseCmyk = document.getElementById('btn-close-cmyk-modal');
  const btnCancelCmyk = document.getElementById('btn-cancel-cmyk-modal');
  const btnRefreshPreflight = document.getElementById('btn-refresh-preflight');
  const btnToggleBleed = document.getElementById('btn-toggle-bleed-guides');
  const btnFixPureBlack = document.getElementById('btn-fix-pure-black');
  const btnExportCommercialPdf = document.getElementById('btn-export-commercial-pdf');

  window.updateCmykPreflightUI = function () {
    if (!window.app.cmykPrint) return;
    const report = window.app.cmykPrint.runPreflightInspection();
    const resultsContainer = document.getElementById('cmyk-preflight-results');
    if (!resultsContainer) return;

    if (report.passed) {
      resultsContainer.innerHTML = `
        <div style="color: #10b981; font-weight: 600; display: flex; align-items: center; gap: 6px;">
          <span>✓</span> <span>All checks passed! Design is 100% compliant for commercial printing.</span>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">
          Inspected ${report.totalObjects} canvas element(s). Zero Rich Black text or low-DPI issues detected.
        </div>
      `;
    } else {
      const issuesHtml = report.issues.map(issue => `
        <li style="margin-bottom: 4px; color: ${issue.type === 'danger' ? '#ef4444' : '#f59e0b'};">
          <strong>[${issue.category}]</strong> ${issue.message}
        </li>
      `).join('');

      resultsContainer.innerHTML = `
        <div style="color: #f59e0b; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
          <span>⚠</span> <span>Found ${report.issues.length} potential commercial printing issue(s):</span>
        </div>
        <ul style="padding-left: 18px; margin: 0; font-size: 11px; line-height: 1.4;">
          ${issuesHtml}
        </ul>
      `;
    }
  };

  if (cmykModal) {
    if (btnCloseCmyk) btnCloseCmyk.addEventListener('click', () => cmykModal.close());
    if (btnCancelCmyk) btnCancelCmyk.addEventListener('click', () => cmykModal.close());
    cmykModal.addEventListener('click', (e) => {
      const rect = cmykModal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        cmykModal.close();
      }
    });

    if (btnRefreshPreflight) {
      btnRefreshPreflight.addEventListener('click', window.updateCmykPreflightUI);
    }

    if (btnToggleBleed) {
      btnToggleBleed.addEventListener('click', () => {
        if (window.app.cmykPrint) {
          const active = window.app.cmykPrint.toggleBleedGuides();
          btnToggleBleed.classList.toggle('active', active);
        }
      });
    }

    if (btnFixPureBlack) {
      btnFixPureBlack.addEventListener('click', () => {
        if (window.app.cmykPrint) {
          window.app.cmykPrint.fixRichBlackText();
          window.updateCmykPreflightUI();
        }
      });
    }

    if (btnExportCommercialPdf) {
      btnExportCommercialPdf.addEventListener('click', () => {
        if (window.app.cmykPrint) {
          const docTitle = document.getElementById('doc-title-input').value.trim() || 'commercial-print';
          const filename = `${docTitle.replace(/\s+/g, '-').toLowerCase()}-commercial-press.pdf`;
          window.app.cmykPrint.exportPrintReadyPDF(filename);
          cmykModal.close();
        }
      });
    }
  }
}

// AI Magic Generator Tab
function setupAITab() {
  const promptInput = document.getElementById('ai-prompt-input');
  const styleSelect = document.getElementById('ai-style-select');
  const aspectSelect = document.getElementById('ai-aspect-select');
  const btnGenerate = document.getElementById('btn-generate-ai-img');
  const resultContainer = document.getElementById('ai-result-container');
  const previewImg = document.getElementById('ai-preview-img');
  const btnAddCanvas = document.getElementById('btn-ai-add-canvas');
  const btnSetBg = document.getElementById('btn-ai-set-bg');

  if (!btnGenerate) return;

  // Inspiration Presets
  document.querySelectorAll('.ai-preset-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (promptInput && prompt) {
        promptInput.value = prompt;
      }
    });
  });

  btnGenerate.addEventListener('click', async () => {
    const prompt = promptInput ? promptInput.value.trim() : '';
    if (!prompt) {
      showToast('Please type a prompt description first', 'error');
      return;
    }

    const style = styleSelect ? styleSelect.value : 'photorealistic';
    const aspect = aspectSelect ? aspectSelect.value : '1:1';

    btnGenerate.textContent = '🪄 Generating Magic Artwork...';
    btnGenerate.disabled = true;

    try {
      const imgUrl = await window.app.aiGenerator.generateImage(prompt, { style, aspect });
      if (imgUrl) {
        previewImg.src = imgUrl;
        resultContainer.style.display = 'flex';
        showToast('AI Artwork generated! Click to add or set as background.', 'success');
      }
    } catch (err) {
      showToast('Failed to generate image. Please try again.', 'error');
    } finally {
      btnGenerate.textContent = '✦ Generate AI Artwork';
      btnGenerate.disabled = false;
    }
  });

  if (btnAddCanvas) {
    btnAddCanvas.addEventListener('click', () => {
      window.app.aiGenerator.addImageToCanvas();
    });
  }

  if (btnSetBg) {
    btnSetBg.addEventListener('click', () => {
      window.app.aiGenerator.setImageAsBackground();
    });
  }
}

// =========================================================================
// PhotoCraft Studio: Pro Adjustments & Tuning
// =========================================================================
function setupPhotoCraftStudio() {
  const photoModal = document.getElementById('photo-adjust-modal');
  const btnOpenPhotoAdjust = document.getElementById('btn-open-photo-adjust');
  const btnClosePhotoAdjust = document.getElementById('btn-close-photo-adjust');
  const btnApplyPhotoAdjust = document.getElementById('btn-apply-photo-adjust');
  const btnResetPhotoAdjust = document.getElementById('btn-reset-photo-adjust');

  if (btnOpenPhotoAdjust && photoModal) {
    btnOpenPhotoAdjust.addEventListener('click', () => {
      const img = window.app.photocraft.getActiveImage();
      if (!img) {
        showToast('Please select a photo on the artboard first', 'error');
        return;
      }

      // Sync sliders with current adjustments
      const adj = window.app.photocraft.ensureAdjustments(img);
      document.querySelectorAll('.photo-adjust-slider').forEach((slider) => {
        const param = slider.getAttribute('data-param');
        const val = adj[param] !== undefined ? adj[param] : 0;
        slider.value = val;
        const valLabel = document.getElementById(`val-${param}`);
        if (valLabel) valLabel.textContent = Number(val).toFixed(2);
      });

      photoModal.showModal();
    });

    if (btnClosePhotoAdjust) btnClosePhotoAdjust.addEventListener('click', () => photoModal.close());
    if (btnApplyPhotoAdjust) btnApplyPhotoAdjust.addEventListener('click', () => photoModal.close());

    photoModal.addEventListener('click', (e) => {
      const rect = photoModal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        photoModal.close();
      }
    });

    // Slider inputs
    document.querySelectorAll('.photo-adjust-slider').forEach((slider) => {
      slider.addEventListener('input', (e) => {
        const param = slider.getAttribute('data-param');
        const val = window.AppUtils ? window.AppUtils.safeParseFloat(e.target.value, 0, -2, 2) : (parseFloat(e.target.value) || 0);
        const valLabel = document.getElementById(`val-${param}`);
        if (valLabel) valLabel.textContent = val.toFixed(2);

        window.app.photocraft.setAdjustment(param, val);
      });
    });

    // Reset button
    if (btnResetPhotoAdjust) {
      btnResetPhotoAdjust.addEventListener('click', () => {
        window.app.photocraft.resetAdjustments();
        document.querySelectorAll('.photo-adjust-slider').forEach((slider) => {
          slider.value = 0;
          const param = slider.getAttribute('data-param');
          const valLabel = document.getElementById(`val-${param}`);
          if (valLabel) valLabel.textContent = '0.00';
        });
        showToast('Reset all photo adjustments to natural', 'info');
      });
    }
  }
}

// =========================================================================
// EffectCraft Overlays: Visual Textures & VFX
// =========================================================================
function setupEffectCraftOverlays() {
  const btnGrain = document.getElementById('btn-fx-grain');
  if (btnGrain) {
    btnGrain.addEventListener('click', () => window.app.effectcraft.addFilmGrainOverlay(0.2));
  }

  const btnLightLeak = document.getElementById('btn-fx-lightleak');
  if (btnLightLeak) {
    btnLightLeak.addEventListener('click', () => window.app.effectcraft.addLightLeakOverlay());
  }

  const btnSparkle = document.getElementById('btn-fx-sparkle');
  if (btnSparkle) {
    btnSparkle.addEventListener('click', () => window.app.effectcraft.addStarlightSparkle());
  }

  const btnHalftone = document.getElementById('btn-fx-halftone');
  if (btnHalftone) {
    btnHalftone.addEventListener('click', () => window.app.effectcraft.addHalftoneOverlay(0.25));
  }

  const btnGlitch = document.getElementById('btn-fx-glitch');
  if (btnGlitch) {
    btnGlitch.addEventListener('click', () => window.app.effectcraft.addPrismGlitchBar());
  }
}

// =========================================================================
// PDFCraft: Document Tools, Verification Stamps & Proof Watermarks
// =========================================================================
function setupPDFCraftTools() {
  const btnBrowsePdf = document.getElementById('btn-browse-pdf');
  const pdfFileInput = document.getElementById('pdf-file-input');
  const pdfDropzone = document.getElementById('pdf-dropzone');

  if (btnBrowsePdf && pdfFileInput) {
    btnBrowsePdf.addEventListener('click', () => pdfFileInput.click());
    pdfFileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) {
        window.app.pdfcraft.importPDFFile(file);
      }
      pdfFileInput.value = '';
    });
  }

  if (pdfDropzone && pdfFileInput) {
    pdfDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      pdfDropzone.style.borderColor = 'var(--accent-purple)';
    });
    pdfDropzone.addEventListener('dragleave', () => {
      pdfDropzone.style.borderColor = 'var(--border-medium)';
    });
    pdfDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      pdfDropzone.style.borderColor = 'var(--border-medium)';
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          window.app.pdfcraft.importPDFFile(file);
        } else {
          showToast('Please drop a valid .pdf file', 'error');
        }
      }
    });
  }

  // Official Verification Stamps
  document.querySelectorAll('.stamp-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const stampType = chip.getAttribute('data-stamp');
      window.app.pdfcraft.addVectorStamp(stampType);
    });
  });

  // Client Proof Watermark Toggle
  const btnToggleWatermark = document.getElementById('btn-toggle-watermark');
  const watermarkTextInput = document.getElementById('watermark-text-input');
  const watermarkOpacitySlider = document.getElementById('watermark-opacity-slider');
  const watermarkOpacityLabel = document.getElementById('watermark-opacity-label');

  if (btnToggleWatermark) {
    btnToggleWatermark.addEventListener('click', () => {
      const text = watermarkTextInput ? watermarkTextInput.value.trim() : 'CLIENT PROOF - DO NOT COPY';
      const opacity = watermarkOpacitySlider && window.AppUtils ? window.AppUtils.safeParseFloat(watermarkOpacitySlider.value, 0.16, 0.01, 1.0) : (watermarkOpacitySlider ? parseFloat(watermarkOpacitySlider.value) : 0.16);
      const isActive = window.app.pdfcraft.toggleProofWatermark(text, opacity);
      btnToggleWatermark.textContent = isActive ? '🔓 Remove Watermark' : '🔒 Apply Watermark';
      btnToggleWatermark.classList.toggle('active', isActive);
    });
  }

  if (watermarkOpacitySlider && watermarkOpacityLabel) {
    watermarkOpacitySlider.addEventListener('input', (e) => {
      const val = window.AppUtils ? window.AppUtils.safeParseFloat(e.target.value, 0.16, 0.01, 1.0) : (parseFloat(e.target.value) || 0.16);
      watermarkOpacityLabel.textContent = `${Math.round(val * 100)}%`;
      if (window.app.pdfcraft.watermarkActive) {
        const text = watermarkTextInput ? watermarkTextInput.value.trim() : 'CLIENT PROOF - DO NOT COPY';
        window.app.pdfcraft.applyProofWatermark(text, val);
      }
    });
  }

  if (watermarkTextInput) {
    watermarkTextInput.addEventListener('change', (e) => {
      if (window.app.pdfcraft.watermarkActive) {
        const opacity = watermarkOpacitySlider && window.AppUtils ? window.AppUtils.safeParseFloat(watermarkOpacitySlider.value, 0.16, 0.01, 1.0) : (watermarkOpacitySlider ? parseFloat(watermarkOpacitySlider.value) : 0.16);
        window.app.pdfcraft.applyProofWatermark(e.target.value.trim(), opacity);
      }
    });
  }
}

// ===========================================================================
// Content Hub Tab (600M+ Open Media Search & Filter)
// ===========================================================================
function setupContentHubTab() {
  const searchInput = document.getElementById('content-hub-search-input');
  const filterPills = document.querySelectorAll('.hub-pill');
  const fileInput = document.getElementById('content-hub-file-input');
  const importFilesButton = document.getElementById('btn-content-hub-import-files');
  const urlInput = document.getElementById('content-hub-url-input');
  const importUrlButton = document.getElementById('btn-content-hub-import-url');

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (window.app && window.app.contentHub) {
          window.app.contentHub.searchMedia(e.target.value, window.app.contentHub.activeFilter);
        }
      }, 400);
    });
  }

  filterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      filterPills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.getAttribute('data-filter') || 'all';
      if (window.app && window.app.contentHub) {
        const query = searchInput ? searchInput.value : '';
        window.app.contentHub.searchMedia(query, filter);
      }
    });
  });

  if (importFilesButton && fileInput) importFilesButton.addEventListener('click', () => fileInput.click());
  if (fileInput) fileInput.addEventListener('change', (event) => {
    window.app.imagesTool.handleFileUpload(event.target.files);
    fileInput.value = '';
  });
  if (importUrlButton && urlInput) {
    const importUrl = async () => {
      const imported = await window.app.imagesTool.importFromUrl(urlInput.value);
      if (imported) urlInput.value = '';
    };
    importUrlButton.addEventListener('click', importUrl);
    urlInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') importUrl();
    });
  }
}

// ===========================================================================
// Brand Kit & Team Governance Tab
// ===========================================================================
function setupBrandKitTab() {
  const btnHarmonize = document.getElementById('btn-harmonize-brand');
  if (btnHarmonize) {
    btnHarmonize.addEventListener('click', () => {
      if (window.app && window.app.brandKit) {
        window.app.brandKit.harmonizeDesign();
      }
    });
  }

  const toggleEnforce = document.getElementById('toggle-brand-enforce');
  if (toggleEnforce) {
    toggleEnforce.addEventListener('change', (e) => {
      if (window.app && window.app.brandKit) {
        window.app.brandKit.toggleBrandEnforcement(e.target.checked);
      }
    });
  }

  const btnExport = document.getElementById('btn-export-brandkit');
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      if (window.app && window.app.brandKit) {
        window.app.brandKit.exportBrandKit();
      }
    });
  }

  const btnImport = document.getElementById('btn-import-brandkit');
  const inputImport = document.getElementById('input-import-brandkit');
  if (btnImport && inputImport) {
    btnImport.addEventListener('click', () => inputImport.click());
    inputImport.addEventListener('change', (e) => {
      if (e.target.files.length > 0 && window.app && window.app.brandKit) {
        window.app.brandKit.importBrandKit(e.target.files[0]);
      }
    });
  }
}

// ===========================================================================
// Clipping Mask & Layer Actions
// ===========================================================================
function setupClippingMaskEvents() {
  const btnMask = document.getElementById('btn-create-clip-mask');
  if (btnMask) {
    btnMask.addEventListener('click', () => {
      if (window.app && window.app.layers) {
        window.app.layers.createClippingMask();
      }
    });
  }

  const btnRelease = document.getElementById('btn-release-clip-mask');
  if (btnRelease) {
    btnRelease.addEventListener('click', () => {
      if (window.app && window.app.layers) {
        window.app.layers.releaseClippingMask();
      }
    });
  }
}

// ===========================================================================
// Direct Canvas Drag & Drop and Global Clipboard Paste
// ===========================================================================
function setupCanvasDragAndDrop() {
  const container = document.getElementById('canvas-scroll-container');
  if (!container) return;

  ['dragenter', 'dragover'].forEach((eventName) => {
    container.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      container.classList.add('canvas-drag-active');
    }, false);
  });

  ['dragleave', 'dragend'].forEach((eventName) => {
    container.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!container.contains(e.relatedTarget)) {
        container.classList.remove('canvas-drag-active');
      }
    }, false);
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    container.classList.remove('canvas-drag-active');

    const files = e.dataTransfer ? e.dataTransfer.files : null;
    if (!files || files.length === 0) return;

    const fabricCanvas = window.app && window.app.canvas;
    const canvasMgr = window.app && window.app.canvasManager;
    let dropLeft = canvasMgr ? canvasMgr.artboardWidth / 2 : 540;
    let dropTop = canvasMgr ? canvasMgr.artboardHeight / 2 : 540;

    if (fabricCanvas && fabricCanvas.getElement()) {
      const rect = fabricCanvas.getElement().getBoundingClientRect();
      const zoom = fabricCanvas.getZoom() || 1;
      const x = (e.clientX - rect.left) / zoom;
      const y = (e.clientY - rect.top) / zoom;
      const maxW = canvasMgr ? canvasMgr.artboardWidth : 1080;
      const maxH = canvasMgr ? canvasMgr.artboardHeight : 1080;
      if (x >= 0 && x <= maxW && y >= 0 && y <= maxH) {
        dropLeft = x;
        dropTop = y;
      }
    }

    Array.from(files).forEach((file) => {
      const name = file.name.toLowerCase();

      // 1. Project file (.designpro / .json)
      if (name.endsWith('.designpro') || (name.endsWith('.json') && file.type === 'application/json')) {
        if (window.app && window.app.export) {
          window.app.export.importProject(file);
          showToast(`Importing project "${file.name}"...`, 'info');
        }
        return;
      }

      // 2. Vector SVG
      if (file.type === 'image/svg+xml' || name.endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const svgString = event.target.result;
          if (window.app && window.app.imagesTool) {
            window.app.imagesTool.addSVGToCanvas(svgString, file.name);
            showToast(`Added vector SVG: ${file.name}`, 'success');
          }
        };
        reader.readAsText(file);
        return;
      }

      // 3. Raster Image (PNG, JPG, WebP, GIF)
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          if (fabricCanvas) {
            fabric.Image.fromURL(dataUrl, (img) => {
              const maxDim = 500;
              const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
              img.set({
                scaleX: scale,
                scaleY: scale,
                left: dropLeft,
                top: dropTop,
                originX: 'center',
                originY: 'center',
                cornerColor: '#0ea5e9',
                cornerStyle: 'circle',
                borderColor: '#0ea5e9',
                transparentCorners: false,
              });
              fabricCanvas.add(img);
              fabricCanvas.setActiveObject(img);
              fabricCanvas.renderAll();
              if (canvasMgr) canvasMgr.recordState();
              showToast(`Added image: ${file.name}`, 'success');
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }, false);
}

function setupGlobalPaste() {
  window.addEventListener('paste', (e) => {
    // If user is focused on an input/textarea/editable, let native paste handle it
    const activeEl = document.activeElement;
    if (activeEl) {
      const tag = activeEl.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || activeEl.isContentEditable) {
        return;
      }
    }

    const fabricCanvas = window.app && window.app.canvas;
    const canvasMgr = window.app && window.app.canvasManager;
    const activeObj = fabricCanvas ? fabricCanvas.getActiveObject() : null;

    // If currently editing text on canvas, let Fabric text editing handle it
    if (activeObj && activeObj.isEditing) {
      return;
    }

    // If canvas manager has an internal copied element, internal paste handles it
    if (canvasMgr && canvasMgr.clipboard) {
      return;
    }

    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    // Check for images in clipboard (e.g. OS screenshot or copied image from browser)
    const items = clipboardData.items;
    let imageItem = null;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type && items[i].type.startsWith('image/')) {
          imageItem = items[i];
          break;
        }
      }
    }

    if (imageItem) {
      e.preventDefault();
      const blob = imageItem.getAsFile();
      if (!blob) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        if (fabricCanvas) {
          fabric.Image.fromURL(dataUrl, (img) => {
            const artW = canvasMgr ? canvasMgr.artboardWidth : 1080;
            const artH = canvasMgr ? canvasMgr.artboardHeight : 1080;
            const maxDim = Math.min(artW * 0.6, artH * 0.6, 600);
            const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
            img.set({
              scaleX: scale,
              scaleY: scale,
              left: artW / 2,
              top: artH / 2,
              originX: 'center',
              originY: 'center',
              cornerColor: '#0ea5e9',
              cornerStyle: 'circle',
              borderColor: '#0ea5e9',
              transparentCorners: false,
            });
            fabricCanvas.add(img);
            fabricCanvas.setActiveObject(img);
            fabricCanvas.renderAll();
            if (canvasMgr) canvasMgr.recordState();
            showToast('Pasted image from clipboard onto canvas!', 'success');
          });
        }
      };
      reader.readAsDataURL(blob);
      return;
    }

    // Check for plain text or SVG string in clipboard
    const pastedText = clipboardData.getData('text/plain');
    if (pastedText && pastedText.trim()) {
      const trimmed = pastedText.trim();
      // If SVG markup
      if (trimmed.startsWith('<svg') && trimmed.endsWith('</svg>')) {
        e.preventDefault();
        if (window.app && window.app.imagesTool) {
          window.app.imagesTool.addSVGToCanvas(trimmed, 'Clipboard SVG');
          showToast('Pasted vector SVG from clipboard!', 'success');
        }
        return;
      }

      // If URL to image
      if (/^https?:\/\/.*\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(trimmed)) {
        e.preventDefault();
        if (trimmed.toLowerCase().includes('.svg')) {
          fetch(trimmed)
            .then(res => res.text())
            .then(svgText => {
              if (window.app && window.app.imagesTool) {
                window.app.imagesTool.addSVGToCanvas(svgText, 'Pasted Web SVG');
              }
            })
            .catch(() => {
              if (window.app && window.app.imagesTool) {
                window.app.imagesTool.addImageToCanvas(trimmed, 'Pasted Web Image');
              }
            });
        } else if (window.app && window.app.imagesTool) {
          window.app.imagesTool.addImageToCanvas(trimmed, 'Pasted Web Image');
        }
        showToast('Pasted web image onto canvas!', 'success');
        return;
      }

      // Plain text paste onto canvas if no text input is focused
      e.preventDefault();
      if (fabricCanvas) {
        const artW = canvasMgr ? canvasMgr.artboardWidth : 1080;
        const artH = canvasMgr ? canvasMgr.artboardHeight : 1080;
        const iText = new fabric.IText(trimmed, {
          left: artW / 2,
          top: artH / 2,
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter',
          fontSize: 32,
          fill: '#1e293b',
          cornerColor: '#0ea5e9',
          cornerStyle: 'circle',
          borderColor: '#0ea5e9',
          transparentCorners: false,
        });
        fabricCanvas.add(iText);
        fabricCanvas.setActiveObject(iText);
        fabricCanvas.renderAll();
        if (canvasMgr) canvasMgr.recordState();
        showToast('Pasted text onto canvas!', 'success');
      }
    }
  });
}

// ===========================================================================
// Smart Layout Generator & Real-Time Collaboration Events
// ===========================================================================

function setupSmartLayoutEvents() {
  const modal = document.getElementById('smart-layout-modal');
  const btnOpen = document.getElementById('btn-open-smart-layout');
  const btnClose = document.getElementById('btn-close-smart-layout-modal');
  const btnGenerate = document.getElementById('btn-generate-smart-layouts');
  const grid = document.getElementById('smart-layout-variations-grid');

  function generateAndRenderVariations() {
    if (!grid || !window.app || !window.app.smartLayout) return;
    const headline = document.getElementById('smart-headline-input')?.value.trim() || 'SUMMER DISCOUNT';
    const tag = document.getElementById('smart-tag-input')?.value.trim() || 'FLASH SALE 50%';
    const subhead = document.getElementById('smart-subhead-input')?.value.trim() || 'Explore the limited collection.';
    const cta = document.getElementById('smart-cta-input')?.value.trim() || 'SHOP NOW →';

    let palette = ['#7c3aed', '#ec4899', '#06b6d4', '#0f172a', '#ffffff'];
    if (window.app.brandKit && window.app.brandKit.currentKit && window.app.brandKit.currentKit.colors) {
      palette = window.app.brandKit.currentKit.colors;
    }

    const variations = window.app.smartLayout.generateVariations({ headline, subhead, cta, tag, palette });
    grid.innerHTML = '';

    variations.forEach(v => {
      const card = document.createElement('div');
      card.className = 'template-card';
      card.style.cssText = 'cursor: pointer; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; background: #ffffff;';
      card.innerHTML = `
        <div style="height: 110px; background: ${v.previewGradient || '#18181b'}; display: flex; align-items: center; justify-content: center; padding: 10px; text-align: center;">
          <div style="font-weight: 800; font-size: 0.85rem; color: #ffffff; line-height: 1.2;">${v.name}</div>
        </div>
        <div style="padding: 8px 10px;">
          <div style="font-weight: 600; font-size: 0.82rem;">${v.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-muted);">${v.style}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        window.app.smartLayout.applyVariation(v);
        modal.close();
      });
      grid.appendChild(card);
    });
  }

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      modal.showModal();
      generateAndRenderVariations();
    });
  }

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        modal.close();
      }
    });
  }

  if (btnGenerate) {
    btnGenerate.addEventListener('click', generateAndRenderVariations);
  }
}

function setupCollaborationEvents() {
  const modal = document.getElementById('collaboration-modal');
  const btnOpen = document.getElementById('btn-open-collab');
  const btnClose = document.getElementById('btn-close-collab-modal');
  const btnDone = document.getElementById('btn-done-collab');
  const btnCopy = document.getElementById('btn-copy-collab-link');
  const btnSaveName = document.getElementById('btn-save-collab-name');
  const btnJoin = document.getElementById('btn-switch-room');
  const btnLeave = document.getElementById('btn-disconnect-collab');

  const linkInput = document.getElementById('collab-room-link-input');
  const nameInput = document.getElementById('collab-name-input');
  const roomInput = document.getElementById('collab-room-input');

  if (btnOpen && modal) {
    btnOpen.addEventListener('click', () => {
      if (window.app && window.app.collab) {
        if (!window.app.collab.isConnected) {
          window.app.collab.connect();
        }
        if (linkInput) linkInput.value = window.app.collab.getShareableLink();
        if (nameInput) nameInput.value = window.app.collab.userName;
        if (roomInput) roomInput.value = window.app.collab.roomId;
        window.app.collab.updateCollabUI();
      }
      modal.showModal();
    });
  }

  [btnClose, btnDone].forEach(btn => {
    if (btn && modal) {
      btn.addEventListener('click', () => modal.close());
    }
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      const rect = modal.getBoundingClientRect();
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
        modal.close();
      }
    });
  }

  if (btnCopy && linkInput) {
    btnCopy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(linkInput.value);
        showToast('Invite link copied to clipboard!', 'success');
      } catch (e) {
        linkInput.select();
        document.execCommand('copy');
        showToast('Invite link copied!', 'success');
      }
    });
  }

  if (btnSaveName && nameInput) {
    btnSaveName.addEventListener('click', () => {
      const newName = nameInput.value.trim();
      if (newName && window.app && window.app.collab) {
        window.app.collab.setUserName(newName);
        showToast(`Display name updated to: ${newName}`, 'success');
      }
    });
  }

  if (btnJoin && roomInput) {
    btnJoin.addEventListener('click', () => {
      const newRoom = roomInput.value.trim();
      if (newRoom && window.app && window.app.collab) {
        window.app.collab.connect(newRoom);
        if (linkInput) linkInput.value = window.app.collab.getShareableLink();
      }
    });
  }

  if (btnLeave) {
    btnLeave.addEventListener('click', () => {
      if (window.app && window.app.collab) {
        window.app.collab.disconnect();
      }
    });
  }
}





