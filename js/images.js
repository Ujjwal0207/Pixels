/**
 * Image Tool for DesignPro
 * Manages image uploads, curated stock photos, image filters and adjustments
 */

class ImagesTool {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  // Handle local file uploads
  handleFileUpload(files) {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Check for SVG vector graphics
      if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const svgString = e.target.result;
          this.addSVGToCanvas(svgString, file.name);
          const blobUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
          this.addUploadThumbnail(blobUrl);
        };
        reader.readAsText(file);
        return;
      }

      if (!file.type.match('image.*')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        this.addImageToCanvas(dataUrl, file.name);
        this.addUploadThumbnail(dataUrl);
      };
      reader.readAsDataURL(file);
    });
  }

  // Add crisp vector SVG to canvas using Fabric native SVG parser
  addSVGToCanvas(svgString, name = 'Vector Graphic') {
    if (!svgString || typeof fabric === 'undefined' || !fabric.loadSVGFromString) return;

    fabric.loadSVGFromString(svgString, (objects, options) => {
      if (!objects || objects.length === 0) return;
      const svgGroup = fabric.util.groupSVGElements(objects, options);
      const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
      const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

      const maxW = artboardW * 0.55;
      const maxH = artboardH * 0.55;
      const currentW = svgGroup.width || 100;
      const currentH = svgGroup.height || 100;
      const scale = Math.min(maxW / currentW, maxH / currentH, 1);

      svgGroup.set({
        left: artboardW / 2,
        top: artboardH / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        name: name,
        selectable: true,
        evented: true,
      });

      this.canvas.add(svgGroup);
      this.canvas.setActiveObject(svgGroup);
      this.canvas.renderAll();
      if (this.canvasManager) this.canvasManager.recordState();
      if (window.showToast) window.showToast(`Imported vector ${name}!`, 'success');
    });
  }

  // Add Upload Thumbnail to sidebar
  addUploadThumbnail(src) {
    const grid = document.getElementById('upload-thumbs-grid');
    if (!grid) return;

    const item = document.createElement('div');
    item.className = 'upload-thumb-item';
    item.innerHTML = `<img src="${src}" alt="Uploaded image" />`;
    item.addEventListener('click', () => {
      this.addImageToCanvas(src, 'Uploaded Image');
    });

    grid.prepend(item);
  }

  // Add Image to Canvas with smart scaling
  addImageToCanvas(url, name = 'Image') {
    fabric.Image.fromURL(
      url,
      (img) => {
        if (!img) return;

        const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
        const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

        // Scale image to fit within max 60% of artboard dimensions
        const maxW = artboardW * 0.6;
        const maxH = artboardH * 0.6;
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
      },
      { crossOrigin: 'anonymous' }
    );
  }

  // Set as Canvas Background
  setBackgroundImage(url) {
    fabric.Image.fromURL(
      url,
      (img) => {
        if (!img) return;

        const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
        const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

        // Scale to cover entire artboard
        const scaleX = artboardW / img.width;
        const scaleY = artboardH / img.height;
        const scale = Math.max(scaleX, scaleY);

        this.canvas.setBackgroundImage(
          img,
          () => {
            this.canvas.renderAll();
            this.canvasManager.recordState();
          },
          {
            originX: 'center',
            originY: 'center',
            left: artboardW / 2,
            top: artboardH / 2,
            scaleX: scale,
            scaleY: scale,
          }
        );
      },
      { crossOrigin: 'anonymous' }
    );
  }

  // Apply Filter to selected image
  applyFilter(filterType, value = 0) {
    const active = this.canvas.getActiveObject();
    if (!active || active.type !== 'image') return;

    let filterInstance = null;

    switch (filterType) {
      case 'grayscale':
        filterInstance = new fabric.Image.filters.Grayscale();
        break;
      case 'sepia':
        filterInstance = new fabric.Image.filters.Sepia();
        break;
      case 'invert':
        filterInstance = new fabric.Image.filters.Invert();
        break;
      case 'brightness':
        filterInstance = new fabric.Image.filters.Brightness({
          brightness: window.AppUtils ? window.AppUtils.safeParseFloat(value, 0, -1, 1) : (parseFloat(value) || 0),
        });
        break;
      case 'contrast':
        filterInstance = new fabric.Image.filters.Contrast({
          contrast: window.AppUtils ? window.AppUtils.safeParseFloat(value, 0, -1, 1) : (parseFloat(value) || 0),
        });
        break;
      case 'saturation':
        filterInstance = new fabric.Image.filters.Saturation({
          saturation: window.AppUtils ? window.AppUtils.safeParseFloat(value, 0, -1, 1) : (parseFloat(value) || 0),
        });
        break;
      case 'blur':
        filterInstance = new fabric.Image.filters.Blur({
          blur: window.AppUtils ? window.AppUtils.safeParseFloat(value, 0, 0, 1) : (parseFloat(value) || 0),
        });
        break;
      default:
        break;
    }

    if (filterInstance) {
      active.filters = [filterInstance];
    } else {
      active.filters = [];
    }

    active.applyFilters();
    this.canvas.renderAll();
    this.canvasManager.recordState();
  }

  // Preset stock images
  getCuratedPhotos() {
    return [
      {
        name: 'Neon Cyber City',
        url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Minimal Architecture',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Vibrant Gradient Waves',
        url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Creative Portrait',
        url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Modern Workspace',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Fresh Coffee & Bakery',
        url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Mountain Sunrise',
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
      },
      {
        name: 'Abstract Fluid 3D',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      },
    ];
  }

  // Set image as artboard background with cover-fit and send to back
  setImageAsBackground(img) {
    if (!img) {
      const active = this.canvas.getActiveObject();
      if (active && active.type === 'image') {
        img = active;
      }
    }
    if (!img || img.type !== 'image') return;

    const artW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
    const artH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

    // Calculate aspect ratio cover scale
    const scale = Math.max(artW / (img.width || 1), artH / (img.height || 1));
    img.set({
      scaleX: scale,
      scaleY: scale,
      left: artW / 2,
      top: artH / 2,
      originX: 'center',
      originY: 'center',
      isBackgroundImage: true,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    });

    img.sendToBack();
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
    if (this.canvasManager) this.canvasManager.recordState();
    if (window.app && window.app.layers) window.app.layers.renderLayers();
    if (window.showToast) window.showToast('Image set as artboard background!', 'success');
  }

  // Detach background image so it becomes a standard movable layer
  detachBackground(img) {
    if (!img) {
      img = this.canvas.getObjects().find((o) => o.isBackgroundImage);
    }
    if (!img) return;

    img.set({
      isBackgroundImage: false,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      lockRotation: false,
    });

    this.canvas.setActiveObject(img);
    this.canvas.renderAll();
    if (this.canvasManager) this.canvasManager.recordState();
    if (window.app && window.app.layers) window.app.layers.renderLayers();
    if (window.showToast) window.showToast('Background image detached to active layer!', 'info');
  }
}

window.ImagesTool = ImagesTool;
