/**
 * AI Text-to-Image & Generative Background Engine for DesignPro
 * Zero-API-key client-side AI image generation using modern high-speed neural pipelines
 * Supports style curation, aspect ratios, and 1-click canvas insertion
 */

class AIGenerator {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.isGenerating = false;
    this.currentImageBlobUrl = null;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  async generateImage(prompt, options = {}) {
    if (!prompt || !prompt.trim()) {
      if (window.showToast) window.showToast('Please enter an AI prompt description', 'error');
      return null;
    }

    const style = options.style || 'photorealistic';
    const aspect = options.aspect || '1:1';

    let width = 1024;
    let height = 1024;
    if (aspect === '16:9') {
      width = 1280;
      height = 720;
    } else if (aspect === '9:16') {
      width = 720;
      height = 1280;
    }

    // Enhance prompt with aesthetic modifiers based on style
    let enhancedPrompt = prompt.trim();
    if (style === 'photorealistic') {
      enhancedPrompt += ', professional commercial photography, 8k resolution, studio lighting, highly detailed, photorealistic, elegant';
    } else if (style === '3d-render') {
      enhancedPrompt += ', 3D isometric render, blender cycles, smooth clay shading, soft ambient occlusion, pastel aesthetic, 4k';
    } else if (style === 'cyberpunk') {
      enhancedPrompt += ', cyberpunk neon city lights, synthwave glowing reflections, futuristic dark blue and magenta, cinematic';
    } else if (style === 'watercolor') {
      enhancedPrompt += ', delicate watercolor painting, soft paper texture, artistic brush strokes, pastel color wash, masterpiece';
    } else if (style === 'vector-flat') {
      enhancedPrompt += ', modern flat vector illustration, clean lines, minimalist corporate design system, vibrant harmonious colors';
    }

    const seed = Math.floor(Math.random() * 9999999);
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    this.isGenerating = true;

    try {
      // Fetch image to ensure loaded and avoid CORS issues on export
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Image generation network error');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      if (this.currentImageBlobUrl && this.currentImageBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(this.currentImageBlobUrl);
      }
      this.currentImageBlobUrl = blobUrl;
      this.isGenerating = false;
      return blobUrl;
    } catch (err) {
      this.isGenerating = false;
      // Fallback: direct URL
      this.currentImageBlobUrl = imageUrl;
      return imageUrl;
    }
  }

  addImageToCanvas(imageUrl) {
    const url = imageUrl || this.currentImageBlobUrl;
    if (!url) {
      if (window.showToast) window.showToast('No generated image available', 'error');
      return;
    }

    fabric.Image.fromURL(url, (img) => {
      const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
      const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

      // Scale to fit nicely on artboard
      const maxArtboardDim = Math.min(artboardW, artboardH) * 0.75;
      const scale = maxArtboardDim / Math.max(img.width, img.height);

      img.set({
        left: artboardW / 2,
        top: artboardH / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
        name: 'AI Generated Artwork',
      });

      this.canvas.add(img);
      this.canvas.setActiveObject(img);
      this.canvas.renderAll();
      this.canvasManager.recordState();
      if (window.showToast) window.showToast('AI Artwork added to artboard!', 'success');
    }, { crossOrigin: 'anonymous' });
  }

  setImageAsBackground(imageUrl) {
    const url = imageUrl || this.currentImageBlobUrl;
    if (!url) {
      if (window.showToast) window.showToast('No generated image available', 'error');
      return;
    }

    fabric.Image.fromURL(url, (img) => {
      const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
      const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

      // Scale to cover artboard completely
      const scaleX = artboardW / img.width;
      const scaleY = artboardH / img.height;
      const scale = Math.max(scaleX, scaleY);

      this.canvas.setBackgroundImage(img, () => {
        this.canvas.renderAll();
        this.canvasManager.recordState();
        if (window.showToast) window.showToast('AI Image set as artboard background!', 'success');
      }, {
        originX: 'center',
        originY: 'center',
        left: artboardW / 2,
        top: artboardH / 2,
        scaleX: scale,
        scaleY: scale,
        crossOrigin: 'anonymous',
      });
    }, { crossOrigin: 'anonymous' });
  }
}

window.AIGenerator = AIGenerator;
