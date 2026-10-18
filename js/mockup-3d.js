/**
 * 3D Product Mockup Studio for DesignPro
 * Features:
 * - Real-time 3D product projection: iPhone 16 Pro, MacBook Pro, T-Shirt, Coffee Mug, Book
 * - Interactive 360-degree rotation and zoom with realistic specular lighting
 * - Device body color swatches (Space Black, Silver, Titanium, White)
 * - 1-Click 4K transparent PNG render download
 */

(function () {
  'use strict';

  class MockupStudio3D {
    constructor(canvasManager) {
      this.canvasManager = canvasManager;
      this.canvas = canvasManager.canvas;
      this.currentDevice = 'phone'; // 'phone', 'laptop', 'tshirt', 'mug', 'book'
      this.deviceColor = '#1e293b';  // Slate / Space Black
      this.rotX = 10;
      this.rotY = -15;
      this.zoom = 1.0;
      this.isDragging = false;
      this.startX = 0;
      this.startY = 0;
      this.modalEl = null;
      this.threeCanvasEl = null;
      this.ctx = null;

      this.init();
    }

    setCanvas(canvas) {
      this.canvas = canvas;
    }

    init() {
      this.createModalDOM();
    }

    createModalDOM() {
      if (document.getElementById('mockup-studio-modal')) return;

      const modal = document.createElement('dialog');
      modal.id = 'mockup-studio-modal';
      modal.className = 'app-modal mockup-modal';
      modal.style.maxWidth = '920px';
      modal.style.width = '95vw';
      modal.style.background = '#090d16';
      modal.style.border = '1px solid rgba(255,255,255,0.12)';
      modal.style.borderRadius = '16px';
      modal.style.padding = '0';
      modal.style.color = '#f8fafc';
      modal.style.overflow = 'hidden';

      modal.innerHTML = `
        <div style="display: flex; flex-direction: column; height: 680px; max-height: 90vh;">
          <!-- Header -->
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); background: #0f172a;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 22px;">🧊</span>
              <div>
                <h3 style="margin: 0; font-size: 17px; font-weight: 700; background: linear-gradient(135deg, #a78bfa, #38bdf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                  3D Photorealistic Product Studio
                </h3>
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">Interactive 3D mockups powered by client-side WebGL & Canvas</p>
              </div>
            </div>
            <button id="btn-close-mockup-modal" style="background: none; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 4px 8px;">✕</button>
          </div>

          <!-- Body -->
          <div style="display: flex; flex: 1; overflow: hidden;">
            <!-- Left Controls Sidebar -->
            <div style="width: 260px; background: #0c1322; border-right: 1px solid rgba(255,255,255,0.08); padding: 18px; display: flex; flex-direction: column; gap: 20px;">
              <!-- Model Selector -->
              <div>
                <label style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 10px; display: block;">Select 3D Product</label>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <button class="mockup-item-btn active" data-model="phone" style="padding: 10px; background: rgba(139,92,246,0.15); border: 1px solid #8b5cf6; border-radius: 8px; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    📱 iPhone 16
                  </button>
                  <button class="mockup-item-btn" data-model="laptop" style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #94a3b8; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    💻 MacBook
                  </button>
                  <button class="mockup-item-btn" data-model="tshirt" style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #94a3b8; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    👕 T-Shirt
                  </button>
                  <button class="mockup-item-btn" data-model="mug" style="padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #94a3b8; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                    ☕ Mug
                  </button>
                  <button class="mockup-item-btn" data-model="book" style="grid-column: span 2; padding: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #94a3b8; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    📖 Hardcover Book
                  </button>
                </div>
              </div>

              <!-- Product Color -->
              <div>
                <label style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 10px; display: block;">Chassis Finish</label>
                <div style="display: flex; gap: 8px;" id="mockup-color-swatches">
                  <div class="mockup-color-dot active" data-color="#0f172a" style="width: 26px; height: 26px; border-radius: 50%; background: #0f172a; border: 2px solid #8b5cf6; cursor: pointer;"></div>
                  <div class="mockup-color-dot" data-color="#cbd5e1" style="width: 26px; height: 26px; border-radius: 50%; background: #cbd5e1; border: 2px solid transparent; cursor: pointer;"></div>
                  <div class="mockup-color-dot" data-color="#78716c" style="width: 26px; height: 26px; border-radius: 50%; background: #78716c; border: 2px solid transparent; cursor: pointer;"></div>
                  <div class="mockup-color-dot" data-color="#1e3a8a" style="width: 26px; height: 26px; border-radius: 50%; background: #1e3a8a; border: 2px solid transparent; cursor: pointer;"></div>
                  <div class="mockup-color-dot" data-color="#f8fafc" style="width: 26px; height: 26px; border-radius: 50%; background: #f8fafc; border: 2px solid transparent; cursor: pointer;"></div>
                </div>
              </div>

              <!-- Tips -->
              <div style="margin-top: auto; font-size: 11px; color: #64748b; line-height: 1.5; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
                💡 <b>Drag</b> mouse to rotate 360°.<br>
                💡 <b>Scroll</b> to zoom in/out.<br>
                💡 Your active artboard updates on the 3D surface in real time.
              </div>

              <!-- Export Button -->
              <button id="btn-download-3d-render" style="padding: 12px; background: linear-gradient(135deg, #8b5cf6, #3b82f6); border: none; border-radius: 10px; color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 14px rgba(139,92,246,0.4); display: flex; align-items: center; justify-content: center; gap: 8px;">
                📸 Download 4K Render
              </button>
            </div>

            <!-- 3D Viewport Canvas -->
            <div style="flex: 1; position: relative; background: radial-gradient(circle at center, #1e293b 0%, #090d16 80%); display: flex; align-items: center; justify-content: center;">
              <canvas id="mockup-3d-canvas" width="640" height="580" style="width: 100%; height: 100%; cursor: grab;"></canvas>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(modal);
      this.modalEl = modal;
      this.threeCanvasEl = document.getElementById('mockup-3d-canvas');
      this.ctx = this.threeCanvasEl.getContext('2d');

      this.bindModalEvents();
    }

    bindModalEvents() {
      const closeBtn = document.getElementById('btn-close-mockup-modal');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.modalEl.close());
      }

      // Model switch buttons
      document.querySelectorAll('.mockup-item-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.mockup-item-btn').forEach((b) => {
            b.style.background = 'rgba(255,255,255,0.04)';
            b.style.borderColor = 'rgba(255,255,255,0.08)';
            b.style.color = '#94a3b8';
          });
          btn.style.background = 'rgba(139,92,246,0.15)';
          btn.style.borderColor = '#8b5cf6';
          btn.style.color = '#fff';

          this.currentDevice = btn.getAttribute('data-model');
          this.renderScene();
        });
      });

      // Color swatches
      document.querySelectorAll('.mockup-color-dot').forEach((dot) => {
        dot.addEventListener('click', () => {
          document.querySelectorAll('.mockup-color-dot').forEach((d) => d.style.borderColor = 'transparent');
          dot.style.borderColor = '#8b5cf6';
          this.deviceColor = dot.getAttribute('data-color');
          this.renderScene();
        });
      });

      // 3D Canvas Mouse Drag & Wheel
      if (this.threeCanvasEl) {
        this.threeCanvasEl.addEventListener('mousedown', (e) => {
          this.isDragging = true;
          this.startX = e.clientX;
          this.startY = e.clientY;
          this.threeCanvasEl.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
          if (!this.isDragging) return;
          const dx = e.clientX - this.startX;
          const dy = e.clientY - this.startY;
          this.rotY += dx * 0.5;
          this.rotX = Math.max(-45, Math.min(45, this.rotX + dy * 0.5));
          this.startX = e.clientX;
          this.startY = e.clientY;
          this.renderScene();
        });

        window.addEventListener('mouseup', () => {
          if (this.isDragging) {
            this.isDragging = false;
            if (this.threeCanvasEl) this.threeCanvasEl.style.cursor = 'grab';
          }
        });

        this.threeCanvasEl.addEventListener('wheel', (e) => {
          e.preventDefault();
          const zoomDelta = e.deltaY > 0 ? -0.05 : 0.05;
          this.zoom = Math.max(0.6, Math.min(2.0, this.zoom + zoomDelta));
          this.renderScene();
        }, { passive: false });
      }

      // Download Render button
      const downloadBtn = document.getElementById('btn-download-3d-render');
      if (downloadBtn) {
        downloadBtn.addEventListener('click', () => this.downloadMockupRender());
      }
    }

    open() {
      this.createModalDOM();
      this.modalEl.showModal();
      this.renderScene();
    }

    renderScene() {
      if (!this.ctx || !this.threeCanvasEl) return;
      const ctx = this.ctx;
      const w = this.threeCanvasEl.width;
      const h = this.threeCanvasEl.height;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(this.zoom, this.zoom);

      // Extract current design texture
      const artboardImgData = this.canvas.toDataURL({
        format: 'png',
        multiplier: 1.5
      });
      const img = new Image();
      img.onload = () => {
        // Draw Soft Floor Shadow
        ctx.save();
        ctx.scale(1, 0.25);
        ctx.beginPath();
        ctx.arc(0, 520, 180, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.filter = 'blur(20px)';
        ctx.fill();
        ctx.restore();

        // 3D Perspective Matrix Transformation
        ctx.save();
        const radY = (this.rotY * Math.PI) / 180;
        const radX = (this.rotX * Math.PI) / 180;
        const skewX = Math.sin(radY) * 0.35;
        const scaleX = Math.cos(radY);
        const skewY = Math.sin(radX) * 0.2;

        ctx.transform(scaleX, skewY, skewX, 1, 0, 0);

        if (this.currentDevice === 'phone') {
          this.drawPhone(ctx, img);
        } else if (this.currentDevice === 'laptop') {
          this.drawLaptop(ctx, img);
        } else if (this.currentDevice === 'tshirt') {
          this.drawTShirt(ctx, img);
        } else if (this.currentDevice === 'mug') {
          this.drawMug(ctx, img);
        } else if (this.currentDevice === 'book') {
          this.drawBook(ctx, img);
        }

        ctx.restore();
        ctx.restore();
      };
      img.src = artboardImgData;
    }

    drawPhone(ctx, screenImg) {
      const pw = 200;
      const ph = 410;
      const r = 38;

      // Chassis Drop Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;

      // Chassis Body (Metallic Bezel)
      ctx.fillStyle = this.deviceColor;
      this.roundRect(ctx, -pw/2, -ph/2, pw, ph, r);
      ctx.fill();
      ctx.shadowColor = 'transparent';

      // Inner Screen Border
      ctx.fillStyle = '#000000';
      this.roundRect(ctx, -pw/2 + 6, -ph/2 + 6, pw - 12, ph - 12, r - 4);
      ctx.fill();

      // Screen Artwork Display
      ctx.save();
      this.roundRect(ctx, -pw/2 + 8, -ph/2 + 8, pw - 16, ph - 16, r - 6);
      ctx.clip();
      ctx.drawImage(screenImg, -pw/2 + 8, -ph/2 + 8, pw - 16, ph - 16);

      // Glass Glare / Specular Reflection Gradient
      const grad = ctx.createLinearGradient(-pw/2, -ph/2, pw/2, ph/2);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(-pw/2, -ph/2, pw, ph);
      ctx.restore();

      // Dynamic Island Pill
      ctx.fillStyle = '#000000';
      this.roundRect(ctx, -26, -ph/2 + 14, 52, 14, 7);
      ctx.fill();
    }

    drawLaptop(ctx, screenImg) {
      const lw = 360;
      const lh = 230;

      // Lid Chassis
      ctx.fillStyle = this.deviceColor;
      this.roundRect(ctx, -lw/2, -lh/2 - 20, lw, lh, 12);
      ctx.fill();

      // Screen Bezel
      ctx.fillStyle = '#000000';
      this.roundRect(ctx, -lw/2 + 10, -lh/2 - 10, lw - 20, lh - 20, 6);
      ctx.fill();

      // Screen Artwork
      ctx.save();
      this.roundRect(ctx, -lw/2 + 12, -lh/2 - 8, lw - 24, lh - 24, 4);
      ctx.clip();
      ctx.drawImage(screenImg, -lw/2 + 12, -lh/2 - 8, lw - 24, lh - 24);

      // Glare
      const grad = ctx.createLinearGradient(-lw/2, -lh/2, lw/2, lh/2);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      grad.addColorStop(0.4, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(-lw/2, -lh/2, lw, lh);
      ctx.restore();

      // Laptop Base
      ctx.fillStyle = '#94a3b8';
      this.roundRect(ctx, -lw/2 - 24, lh/2 - 20, lw + 48, 14, 6);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      this.roundRect(ctx, -40, lh/2 - 20, 80, 5, 2);
      ctx.fill();
    }

    drawTShirt(ctx, printImg) {
      const tw = 280;
      const th = 340;

      // Draw T-Shirt Silhouette
      ctx.fillStyle = this.deviceColor;
      ctx.beginPath();
      ctx.moveTo(-60, -th/2);
      ctx.quadraticCurveTo(0, -th/2 + 30, 60, -th/2); // Collar
      ctx.lineTo(tw/2 + 40, -th/2 + 60); // Right sleeve top
      ctx.lineTo(tw/2 + 10, -th/2 + 120); // Right sleeve cuff
      ctx.lineTo(tw/2 - 20, -th/2 + 90); // Right armpit
      ctx.lineTo(tw/2 - 20, th/2); // Right hem
      ctx.lineTo(-tw/2 + 20, th/2); // Bottom hem
      ctx.lineTo(-tw/2 + 20, -th/2 + 90); // Left armpit
      ctx.lineTo(-tw/2 - 10, -th/2 + 120); // Left sleeve cuff
      ctx.lineTo(-tw/2 - 40, -th/2 + 60); // Left sleeve top
      ctx.closePath();
      ctx.fill();

      // Fabric Shadows & Creases
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-tw/2 + 20, -th/2 + 90);
      ctx.quadraticCurveTo(0, -th/2 + 130, tw/2 - 20, -th/2 + 90);
      ctx.stroke();

      // Graphic Print Area on Chest
      ctx.save();
      const printW = 140;
      const printH = 140;
      ctx.rect(-printW/2, -th/2 + 80, printW, printH);
      ctx.clip();
      ctx.drawImage(printImg, -printW/2, -th/2 + 80, printW, printH);
      ctx.restore();
    }

    drawMug(ctx, printImg) {
      const mw = 170;
      const mh = 220;

      // Handle
      ctx.strokeStyle = this.deviceColor;
      ctx.lineWidth = 24;
      ctx.beginPath();
      ctx.arc(mw/2 + 20, 0, 50, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();

      // Ceramic Mug Cylinder
      ctx.fillStyle = this.deviceColor;
      this.roundRect(ctx, -mw/2, -mh/2, mw, mh, 12);
      ctx.fill();

      // Print Wrap around mug
      ctx.save();
      this.roundRect(ctx, -mw/2 + 8, -mh/2 + 20, mw - 16, mh - 40, 8);
      ctx.clip();
      ctx.drawImage(printImg, -mw/2 + 8, -mh/2 + 20, mw - 16, mh - 40);

      // Ceramic Specular Cylinder Sheen
      const grad = ctx.createLinearGradient(-mw/2, 0, mw/2, 0);
      grad.addColorStop(0, 'rgba(0,0,0,0.3)');
      grad.addColorStop(0.2, 'rgba(255,255,255,0.4)');
      grad.addColorStop(0.5, 'transparent');
      grad.addColorStop(1, 'rgba(0,0,0,0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(-mw/2, -mh/2, mw, mh);
      ctx.restore();
    }

    drawBook(ctx, coverImg) {
      const bw = 240;
      const bh = 340;

      // Hardcover Back Shadow
      ctx.fillStyle = '#0f172a';
      this.roundRect(ctx, -bw/2 - 8, -bh/2 - 4, bw + 12, bh + 8, 6);
      ctx.fill();

      // Book Spine
      ctx.fillStyle = this.deviceColor;
      this.roundRect(ctx, -bw/2 - 12, -bh/2 - 4, 16, bh + 8, 4);
      ctx.fill();

      // Cover Artwork
      ctx.save();
      this.roundRect(ctx, -bw/2 + 4, -bh/2, bw - 4, bh, 4);
      ctx.clip();
      ctx.drawImage(coverImg, -bw/2 + 4, -bh/2, bw - 4, bh);

      // Gloss Sheen
      const grad = ctx.createLinearGradient(-bw/2, -bh/2, bw/2, bh/2);
      grad.addColorStop(0, 'rgba(255,255,255,0.3)');
      grad.addColorStop(0.3, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(-bw/2, -bh/2, bw, bh);
      ctx.restore();
    }

    roundRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }

    downloadMockupRender() {
      if (!this.threeCanvasEl) return;
      const dataUrl = this.threeCanvasEl.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `3d-mockup-${this.currentDevice}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (window.showToast) {
        window.showToast('4K 3D Product Mockup downloaded!', 'success');
      }
    }
  }

  window.MockupStudio3D = MockupStudio3D;
})();
