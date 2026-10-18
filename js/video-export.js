/**
 * Canvas Animation & Video/WebM Exporter for DesignPro
 * Uses HTML5 Canvas captureStream() and MediaRecorder API
 * Generates animated promotional video clips (3s / 5s) with subtle motion presets
 */

class VideoExporter {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.isRecording = false;
    this.recordedChunks = [];
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  async recordAnimatedClip(options = {}) {
    if (this.isRecording) return;
    const duration = options.duration || 3000; // ms
    const motionStyle = options.motionStyle || 'zoom'; // 'zoom', 'pulse', 'sway', 'static'
    const filename = options.filename || 'designpro-motion-clip.webm';

    const canvasEl = document.getElementById('canvas-element');
    if (!canvasEl) {
      if (window.showToast) window.showToast('Canvas element not found', 'error');
      return;
    }

    if (!canvasEl.captureStream) {
      if (window.showToast) window.showToast('Video recording not supported in this browser', 'error');
      return;
    }

    // Deselect any active handles so selection box doesn't appear in video
    const prevActive = this.canvas.getActiveObject();
    this.canvas.discardActiveObject();
    this.canvas.renderAll();

    this.isRecording = true;
    this.recordedChunks = [];

    // Capture at 30 FPS
    const stream = canvasEl.captureStream(30);
    let mimeType = 'video/webm;codecs=vp9';
    if (MediaRecorder.isTypeSupported('video/mp4')) {
      mimeType = 'video/mp4';
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      mimeType = 'video/webm';
    }

    let mediaRecorder;
    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 3500000 });
    } catch (e) {
      mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        this.recordedChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      this.isRecording = false;
      if (prevActive) {
        this.canvas.setActiveObject(prevActive);
        this.canvas.requestRenderAll();
      }
      if (window.showToast) {
        window.showToast(`Animated clip "${filename}" exported successfully!`, 'success');
      }
    };

    mediaRecorder.start();
    if (window.showToast) {
      window.showToast(`Recording ${duration / 1000}s animated video clip...`, 'info');
    }

    // Apply smooth animation during recording
    const startTime = performance.now();
    const originalViewportTransform = [...this.canvas.viewportTransform];

    const animateLoop = (now) => {
      if (!this.isRecording) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (motionStyle === 'zoom') {
        // Smooth cinematic Ken Burns zoom (1.0 to 1.06)
        const scale = 1.0 + Math.sin(progress * Math.PI) * 0.05;
        this.canvas.setZoom(scale);
      } else if (motionStyle === 'pulse') {
        // Rhythmic pulse
        const scale = 1.0 + Math.sin(progress * Math.PI * 4) * 0.03;
        this.canvas.setZoom(scale);
      } else if (motionStyle === 'sway') {
        // Horizontal cinematic pan
        const offset = Math.sin(progress * Math.PI * 2) * 15;
        this.canvas.viewportTransform[4] = offset;
      }

      this.canvas.renderAll();

      if (elapsed < duration) {
        requestAnimationFrame(animateLoop);
      } else {
        // Restore viewport
        this.canvas.viewportTransform = originalViewportTransform;
        this.canvas.setZoom(1.0);
        this.canvas.renderAll();
        mediaRecorder.stop();
      }
    };

    requestAnimationFrame(animateLoop);
  }
}

window.VideoExporter = VideoExporter;
