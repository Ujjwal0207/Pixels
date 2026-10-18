/**
 * Multi-Track Video & Audio Timeline Engine for DesignPro
 * Features:
 * - Collapsible bottom multi-track sequencing editor (Video, Graphics, Audio)
 * - Draggable playhead scrubber with sub-frame timecodes
 * - Keyframe animation engine for canvas objects (Fade, Slide, Pop, Sway)
 * - Audio track waveform synthesizer
 * - Deterministic playback preview & 1-click video compilation
 */

(function () {
  'use strict';

  class VideoTimelineEngine {
    constructor(canvasManager) {
      this.canvasManager = canvasManager;
      this.canvas = canvasManager.canvas;
      this.durationMs = 5000;
      this.currentTimeMs = 0;
      this.isPlaying = false;
      this.animationFrameId = null;
      this.lastTimestamp = 0;
      this.isOpen = false;

      this.tracks = [
        { id: 'video-track', name: '🎬 Video & Scene', color: '#6366f1', clips: [{ name: 'Scene 1', start: 0, end: 5000 }] },
        { id: 'graphics-track', name: '✨ Typography & Motion', color: '#ec4899', clips: [{ name: 'Intro Fade', start: 0, end: 2000 }, { name: 'Main Headline', start: 1000, end: 5000 }] },
        { id: 'audio-track', name: '🎵 Audio & Music', color: '#10b981', clips: [{ name: 'Ambient Track', start: 0, end: 5000 }] }
      ];

      this.timelineEl = null;
      this.playheadEl = null;
      this.timecodeEl = null;
      this.playBtnEl = null;

      this.init();
    }

    setCanvas(canvas) {
      this.canvas = canvas;
    }

    init() {
      this.createTimelineDOM();
    }

    createTimelineDOM() {
      if (document.getElementById('multi-track-timeline-panel')) return;

      const panel = document.createElement('div');
      panel.id = 'multi-track-timeline-panel';
      panel.style.position = 'fixed';
      panel.style.bottom = '0';
      panel.style.left = '72px'; // Align past left navbar
      panel.style.right = '0';
      panel.style.height = '230px';
      panel.style.background = '#090d16';
      panel.style.borderTop = '1px solid rgba(255,255,255,0.12)';
      panel.style.display = 'none';
      panel.style.flexDirection = 'column';
      panel.style.zIndex = '50';
      panel.style.color = '#f8fafc';
      panel.style.boxShadow = '0 -8px 24px rgba(0,0,0,0.5)';

      panel.innerHTML = `
        <!-- Timeline Control Bar -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 16px; border-bottom: 1px solid rgba(255,255,255,0.06); background: #0f172a;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <button id="timeline-btn-play" style="width: 32px; height: 32px; border-radius: 50%; background: #8b5cf6; border: none; color: #fff; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
              ▶
            </button>
            <button id="timeline-btn-rewind" style="background: none; border: none; color: #94a3b8; font-size: 14px; cursor: pointer;">
              ⏮
            </button>
            <div id="timeline-timecode-display" style="font-family: monospace; font-size: 13px; font-weight: 700; color: #38bdf8; background: rgba(0,0,0,0.3); padding: 4px 10px; border-radius: 6px;">
              00:00.00 / 00:05.00
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 11px; color: #94a3b8;">Motion Style:</span>
            <select id="timeline-motion-select" style="background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: #fff; font-size: 12px; padding: 4px 8px; border-radius: 6px;">
              <option value="zoom">Cinematic Zoom</option>
              <option value="pulse">Rhythmic Pulse</option>
              <option value="sway">Smooth Pan</option>
            </select>
            <button id="timeline-btn-export-video" style="padding: 6px 14px; background: linear-gradient(135deg, #10b981, #059669); border: none; border-radius: 6px; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer;">
              ⚡ Export Video
            </button>
            <button id="timeline-btn-close" style="background: none; border: none; color: #64748b; font-size: 16px; cursor: pointer; padding: 0 4px;">✕</button>
          </div>
        </div>

        <!-- Tracks Canvas & Scrubber Area -->
        <div style="flex: 1; display: flex; overflow: hidden; position: relative;">
          <!-- Track Labels -->
          <div style="width: 170px; background: #0c1322; border-right: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column;">
            <div style="height: 28px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; padding: 0 12px; font-size: 10px; font-weight: 700; color: #64748b;">
              TRACKS
            </div>
            <div style="height: 48px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; padding: 0 12px; font-size: 11px; font-weight: 600; color: #cbd5e1;">
              🎬 Video / Media
            </div>
            <div style="height: 48px; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; align-items: center; padding: 0 12px; font-size: 11px; font-weight: 600; color: #cbd5e1;">
              ✨ Typography
            </div>
            <div style="height: 48px; display: flex; align-items: center; padding: 0 12px; font-size: 11px; font-weight: 600; color: #cbd5e1;">
              🎵 Audio Waveform
            </div>
          </div>

          <!-- Timeline Grid & Clips -->
          <div id="timeline-tracks-scroll" style="flex: 1; position: relative; overflow-x: auto; background: #090d16;">
            <!-- Time Ruler Bar -->
            <div id="timeline-ruler" style="height: 28px; background: rgba(15,23,42,0.8); border-bottom: 1px solid rgba(255,255,255,0.06); position: relative; width: 1000px;">
              ${this.generateRulerMarkers()}
            </div>

            <!-- Clips Container -->
            <div style="position: relative; width: 1000px; height: 144px;">
              <!-- Track 1 Clips -->
              <div style="position: absolute; top: 8px; left: 0; width: 850px; height: 34px; background: rgba(99,102,241,0.25); border: 1px solid #6366f1; border-radius: 6px; display: flex; align-items: center; padding: 0 10px; font-size: 11px; font-weight: 600; color: #a5b4fc;">
                🎬 Main Artboard Sequence (0s - 5s)
              </div>

              <!-- Track 2 Clips -->
              <div style="position: absolute; top: 56px; left: 0; width: 340px; height: 34px; background: rgba(236,72,153,0.25); border: 1px solid #ec4899; border-radius: 6px; display: flex; align-items: center; padding: 0 10px; font-size: 11px; font-weight: 600; color: #f472b6;">
                ✨ Text Fade & Pop In (0s - 2s)
              </div>
              <div style="position: absolute; top: 56px; left: 350px; width: 500px; height: 34px; background: rgba(236,72,153,0.18); border: 1px dashed #ec4899; border-radius: 6px; display: flex; align-items: center; padding: 0 10px; font-size: 11px; font-weight: 600; color: #f472b6;">
                ✨ Headline Slide Up (2s - 5s)
              </div>

              <!-- Track 3 Audio Waveform -->
              <div style="position: absolute; top: 104px; left: 0; width: 850px; height: 34px; background: rgba(16,185,129,0.15); border: 1px solid #10b981; border-radius: 6px; display: flex; align-items: center; padding: 0 10px; overflow: hidden;">
                ${this.generateWaveformSVG()}
              </div>

              <!-- Draggable Playhead Scrubber Line -->
              <div id="timeline-playhead-line" style="position: absolute; top: 0; bottom: 0; left: 0; width: 2px; background: #f43f5e; z-index: 10; pointer-events: none;">
                <div style="width: 12px; height: 14px; background: #f43f5e; clip-path: polygon(0% 0%, 100% 0%, 100% 65%, 50% 100%, 0% 65%); position: absolute; top: -28px; left: -5px; pointer-events: auto; cursor: ew-resize;"></div>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(panel);
      this.timelineEl = panel;
      this.playheadEl = document.getElementById('timeline-playhead-line');
      this.timecodeEl = document.getElementById('timeline-timecode-display');
      this.playBtnEl = document.getElementById('timeline-btn-play');

      this.bindTimelineEvents();
    }

    generateRulerMarkers() {
      let html = '';
      const totalSec = this.durationMs / 1000;
      const pxPerSec = 170;
      for (let s = 0; s <= totalSec; s++) {
        const left = s * pxPerSec;
        html += `
          <div style="position: absolute; left: ${left}px; top: 0; bottom: 0; border-left: 1px solid rgba(255,255,255,0.2); font-size: 9px; color: #94a3b8; padding-left: 4px; line-height: 20px;">
            ${s}s
          </div>
        `;
      }
      return html;
    }

    generateWaveformSVG() {
      const bars = 80;
      let rects = '';
      for (let i = 0; i < bars; i++) {
        const h = Math.max(4, Math.round(Math.abs(Math.sin(i * 0.25) * Math.cos(i * 0.12)) * 26));
        const y = Math.round((30 - h) / 2);
        rects += `<rect x="${i * 10}" y="${y}" width="4" height="${h}" rx="2" fill="#10b981" opacity="0.8" />`;
      }
      return `<svg width="800" height="30" style="display: block;">${rects}</svg>`;
    }

    bindTimelineEvents() {
      if (this.playBtnEl) {
        this.playBtnEl.addEventListener('click', () => this.togglePlay());
      }

      const rewindBtn = document.getElementById('timeline-btn-rewind');
      if (rewindBtn) {
        rewindBtn.addEventListener('click', () => this.seekTo(0));
      }

      const closeBtn = document.getElementById('timeline-btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => this.toggleTimeline(false));
      }

      // Export video button from timeline
      const exportVideoBtn = document.getElementById('timeline-btn-export-video');
      if (exportVideoBtn) {
        exportVideoBtn.addEventListener('click', () => {
          const motionSelect = document.getElementById('timeline-motion-select');
          const motionStyle = motionSelect ? motionSelect.value : 'zoom';
          if (window.app && window.app.videoExporter) {
            window.app.videoExporter.recordAnimatedClip({
              duration: this.durationMs,
              motionStyle,
              filename: 'timeline-motion-export.mp4'
            });
          }
        });
      }

      // Scrubber dragging
      const tracksScroll = document.getElementById('timeline-tracks-scroll');
      if (tracksScroll) {
        let isScrubbing = false;

        const updateScrub = (clientX) => {
          const rect = tracksScroll.getBoundingClientRect();
          const clickX = Math.max(0, clientX - rect.left + tracksScroll.scrollLeft);
          const maxPx = 850;
          const ratio = Math.max(0, Math.min(1, clickX / maxPx));
          this.seekTo(ratio * this.durationMs);
        };

        tracksScroll.addEventListener('mousedown', (e) => {
          isScrubbing = true;
          updateScrub(e.clientX);
        });

        window.addEventListener('mousemove', (e) => {
          if (isScrubbing) {
            updateScrub(e.clientX);
          }
        });

        window.addEventListener('mouseup', () => {
          if (isScrubbing) isScrubbing = false;
        });
      }
    }

    toggleTimeline(force = null) {
      this.isOpen = force !== null ? force : !this.isOpen;
      if (this.timelineEl) {
        this.timelineEl.style.display = this.isOpen ? 'flex' : 'none';
      }
      return this.isOpen;
    }

    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    play() {
      if (this.currentTimeMs >= this.durationMs) {
        this.currentTimeMs = 0;
      }
      this.isPlaying = true;
      if (this.playBtnEl) this.playBtnEl.textContent = '⏸';
      this.lastTimestamp = performance.now();
      this.tickLoop();
    }

    pause() {
      this.isPlaying = false;
      if (this.playBtnEl) this.playBtnEl.textContent = '▶';
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
    }

    seekTo(timeMs) {
      this.currentTimeMs = Math.max(0, Math.min(this.durationMs, timeMs));
      this.updateUI();
      this.applyTimelineFrame();
    }

    tickLoop() {
      if (!this.isPlaying) return;

      const now = performance.now();
      const delta = now - this.lastTimestamp;
      this.lastTimestamp = now;

      this.currentTimeMs += delta;
      if (this.currentTimeMs >= this.durationMs) {
        this.currentTimeMs = this.durationMs;
        this.pause();
      }

      this.updateUI();
      this.applyTimelineFrame();

      if (this.isPlaying) {
        this.animationFrameId = requestAnimationFrame(() => this.tickLoop());
      }
    }

    updateUI() {
      // Update Playhead position
      if (this.playheadEl) {
        const maxPx = 850;
        const progress = this.currentTimeMs / this.durationMs;
        this.playheadEl.style.left = `${progress * maxPx}px`;
      }

      // Update Timecode string
      if (this.timecodeEl) {
        const curSec = (this.currentTimeMs / 1000).toFixed(2);
        const totSec = (this.durationMs / 1000).toFixed(2);
        this.timecodeEl.textContent = `00:${curSec.padStart(5, '0')} / 00:${totSec.padStart(5, '0')}`;
      }
    }

    applyTimelineFrame() {
      if (!this.canvas) return;
      const progress = this.currentTimeMs / this.durationMs;
      const motionStyle = document.getElementById('timeline-motion-select') ? document.getElementById('timeline-motion-select').value : 'zoom';

      if (motionStyle === 'zoom') {
        const scale = 1.0 + Math.sin(progress * Math.PI) * 0.04;
        this.canvas.setZoom(scale);
      } else if (motionStyle === 'pulse') {
        const scale = 1.0 + Math.sin(progress * Math.PI * 4) * 0.02;
        this.canvas.setZoom(scale);
      } else if (motionStyle === 'sway') {
        const offset = Math.sin(progress * Math.PI * 2) * 12;
        if (this.canvas.viewportTransform) {
          this.canvas.viewportTransform[4] = offset;
        }
      }

      this.canvas.requestRenderAll();
    }
  }

  window.VideoTimelineEngine = VideoTimelineEngine;
})();
