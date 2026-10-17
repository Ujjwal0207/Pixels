/**
 * Main Application Orchestrator for DesignPro
 * Coordinates modules, UI interactions, dynamic toolbars, modals, multi-page strip, and presets
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Core Canvas
  const canvasManager = new CanvasManager();
  const canvas = canvasManager.init('canvas-element');

  // Initialize Tools
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

  // Global app reference for cross-component access
  window.app = {
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
    activeTab: 'templates',
    selectedFormat: 'png',
  };

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

  // Load Initial Default Template (Mega Flash Sale)
  templatesEngine.loadTemplate('flash-sale');
  pagesManager.init();
  showToast('Welcome to DesignPro! Light & classy graphic studio ready.', 'info');
});

// Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : 'ℹ'}</span> <span>${message}</span>`;
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
    const boldBtn = document.getElementById('btn-text-bold');
    const italicBtn = document.getElementById('btn-text-italic');
    const underlineBtn = document.getElementById('btn-text-underline');
    const curveSlider = document.getElementById('text-curve-slider');
    const curveLabel = document.getElementById('text-curve-label');

    if (fontSelect) fontSelect.value = obj.fontFamily || 'Outfit';
    if (sizeInput) sizeInput.value = Math.round(obj.fontSize) || 40;
    if (colorPicker) colorPicker.value = obj.fill || '#000000';
    if (boldBtn) boldBtn.classList.toggle('active', obj.fontWeight === 'bold');
    if (italicBtn) italicBtn.classList.toggle('active', obj.fontStyle === 'italic');
    if (underlineBtn) underlineBtn.classList.toggle('active', !!obj.underline);
    if (curveSlider) curveSlider.value = obj.curvePercent || 0;
    if (curveLabel) curveLabel.textContent = `${obj.curvePercent || 0}%`;
  } else if (obj.type === 'image') {
    imageControls.style.display = 'flex';
  } else {
    // Shapes, Lines, Polygons
    shapeControls.style.display = 'flex';
    const shapeFillPicker = document.getElementById('shape-fill-picker');
    const shapeStrokePicker = document.getElementById('shape-stroke-picker');
    const strokeWidthInput = document.getElementById('shape-stroke-width');

    if (shapeFillPicker && obj.fill) shapeFillPicker.value = typeof obj.fill === 'string' ? obj.fill : '#7c3aed';
    if (shapeStrokePicker && obj.stroke) shapeStrokePicker.value = obj.stroke;
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
    input.value = Math.max(8, parseInt(input.value || 40, 10) - 2);
    window.app.textTool.setFontSize(input.value);
  });
  document.getElementById('btn-font-size-inc').addEventListener('click', () => {
    const input = document.getElementById('text-font-size');
    input.value = parseInt(input.value || 40, 10) + 2;
    window.app.textTool.setFontSize(input.value);
  });
  document.getElementById('text-color-picker').addEventListener('input', (e) => {
    window.app.textTool.setTextColor(e.target.value);
    document.getElementById('text-color-preview').style.background = e.target.value;
  });
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

  // Shape Actions
  document.getElementById('shape-fill-picker').addEventListener('input', (e) => {
    window.app.elementsTool.setFillColor(e.target.value);
    document.getElementById('shape-fill-preview').style.background = e.target.value;
  });
  document.getElementById('shape-stroke-picker').addEventListener('input', (e) => {
    window.app.elementsTool.setStrokeColor(e.target.value);
    document.getElementById('shape-stroke-preview').style.background = e.target.value;
  });
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

  // Filter pills
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const category = pill.getAttribute('data-category');

      cards.forEach((card) => {
        const cardCat = card.getAttribute('data-category');
        if (category === 'all' || cardCat === category) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const templateKey = card.getAttribute('data-template');
      window.app.templates.loadTemplate(templateKey);
      showToast(`Loaded "${card.querySelector('.template-name').textContent}" template!`, 'success');
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

  const photos = window.app.imagesTool.getCuratedPhotos();
  photos.forEach((photo) => {
    const item = document.createElement('div');
    item.className = 'photo-item';
    item.title = `Click to add ${photo.name}`;
    item.innerHTML = `<img src="${photo.url}" alt="${photo.name}" loading="lazy" />`;
    item.addEventListener('click', () => {
      window.app.imagesTool.addImageToCanvas(photo.url, photo.name);
      showToast(`Added ${photo.name} to artboard`, 'info');
    });
    photosGrid.appendChild(item);
  });
}

// Draw Tab
function setupDrawTab() {
  const brushTypeSelect = document.getElementById('draw-brush-type');
  const brushSizeInput = document.getElementById('draw-brush-size');
  const brushColorPicker = document.getElementById('draw-brush-color');

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
}

// Background Tab
function setupBackgroundTab() {
  // Solid color swatches
  document.querySelectorAll('.bg-color-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const color = swatch.getAttribute('data-color');
      window.app.canvas.setBackgroundColor(color, () => {
        window.app.canvas.renderAll();
        window.app.canvasManager.recordState();
      });
      showToast('Canvas background updated', 'info');
    });
  });

  // Gradient presets
  document.querySelectorAll('.bg-gradient-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const c1 = swatch.getAttribute('data-c1');
      const c2 = swatch.getAttribute('data-c2');
      const grad = new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: { x1: 0, y1: 0, x2: window.app.canvas.width, y2: window.app.canvas.height },
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

      const grad = new fabric.Gradient({
        type: 'linear',
        gradientUnits: 'pixels',
        coords: { x1: 0, y1: 0, x2: window.app.canvas.width, y2: window.app.canvas.height },
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
    const w = parseInt(document.getElementById('custom-width-input').value, 10);
    const h = parseInt(document.getElementById('custom-height-input').value, 10);
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
      const motionStyle = document.getElementById('video-motion-style') ? document.getElementById('video-motion-style').value : 'zoom';
      const duration = parseInt(document.getElementById('video-duration-select') ? document.getElementById('video-duration-select').value : 3000, 10);
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
      const blur = parseInt(blurInput.value, 10) || 0;
      const offsetX = parseInt(xInput.value, 10) || 0;
      const offsetY = parseInt(yInput.value, 10) || 0;
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
      const tol = parseInt(tolSlider.value, 10) || 24;
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
        const val = parseFloat(e.target.value);
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
      const opacity = watermarkOpacitySlider ? parseFloat(watermarkOpacitySlider.value) : 0.16;
      const isActive = window.app.pdfcraft.toggleProofWatermark(text, opacity);
      btnToggleWatermark.textContent = isActive ? '🔓 Remove Watermark' : '🔒 Apply Watermark';
      btnToggleWatermark.classList.toggle('active', isActive);
    });
  }

  if (watermarkOpacitySlider && watermarkOpacityLabel) {
    watermarkOpacitySlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
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
        const opacity = watermarkOpacitySlider ? parseFloat(watermarkOpacitySlider.value) : 0.16;
        window.app.pdfcraft.applyProofWatermark(e.target.value.trim(), opacity);
      }
    });
  }
}



