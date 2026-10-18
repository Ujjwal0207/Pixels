/**
 * Storage & Auto-Save Engine for DesignPro
 * Grounded in Modern Web Guidance & IndexedDB Standards
 * 
 * Provides robust client-side persistence:
 * - Debounced auto-save on idle frames (requestIdleCallback)
 * - Restores user artwork on page refresh
 * - Preserves multi-page carousels, slide decks, and custom artboard sizes
 * - Keeps UI auto-save indicator synchronized
 */

class StorageEngine {
  constructor(dbName = 'DesignProDB', version = 1) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
    this.saveTimeout = null;
    this.isSaving = false;
    this.statusEl = null;
  }

  async init() {
    this.statusEl = document.querySelector('.save-status');

    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        console.warn('[StorageEngine] IndexedDB not available in this browser.');
        this.updateStatus('Offline', 'saved');
        resolve(null);
        return;
      }

      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('assets')) {
          db.createObjectStore('assets', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('brandkits')) {
          db.createObjectStore('brandkits', { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        this.updateStatus('Saved', 'saved');
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('[StorageEngine] Failed to open IndexedDB:', e);
        this.updateStatus('Storage Error', 'error');
        resolve(null);
      };
    });
  }

  updateStatus(text, className = 'saved') {
    if (!this.statusEl) {
      this.statusEl = document.querySelector('.save-status');
    }
    if (this.statusEl) {
      this.statusEl.textContent = `● ${text}`;
      this.statusEl.className = `save-status ${className}`;
    }
  }

  // Triggered whenever the canvas or document state is modified
  scheduleAutoSave(canvasManager, pagesManager) {
    if (!this.db) return;

    this.updateStatus('Saving...', 'saving');

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      const doSave = () => this.saveCurrentDraft(canvasManager, pagesManager);
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(doSave, { timeout: 2000 });
      } else {
        doSave();
      }
    }, 1200); // 1.2s debounce
  }

  async saveCurrentDraft(canvasManager, pagesManager) {
    if (!this.db || !canvasManager || !canvasManager.canvas) return;

    try {
      this.isSaving = true;

      // Sync active page before snapshotting
      if (pagesManager && typeof pagesManager.saveCurrentPageState === 'function') {
        pagesManager.saveCurrentPageState();
      }

      const titleInput = document.getElementById('doc-title-input');
      const docTitle = titleInput ? titleInput.value.trim() : 'Untitled Design';

      const draftRecord = {
        id: 'active_draft',
        title: docTitle,
        updatedAt: Date.now(),
        artboardWidth: canvasManager.artboardWidth,
        artboardHeight: canvasManager.artboardHeight,
        pages: pagesManager ? pagesManager.pages : [],
        currentPageIndex: pagesManager ? pagesManager.currentPageIndex : 0,
      };

      await new Promise((resolve, reject) => {
        const tx = this.db.transaction('projects', 'readwrite');
        const store = tx.objectStore('projects');
        const req = store.put(draftRecord);
        req.onsuccess = () => resolve();
        req.onerror = (e) => reject(e);
      });

      this.updateStatus('Saved', 'saved');
    } catch (err) {
      console.warn('[StorageEngine] Auto-save error:', err);
      this.updateStatus('Save failed', 'error');
    } finally {
      this.isSaving = false;
    }
  }

  async loadDraft() {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('projects', 'readonly');
        const store = tx.objectStore('projects');
        const req = store.get('active_draft');
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  async clearDraft() {
    if (!this.db) return;
    try {
      const tx = this.db.transaction('projects', 'readwrite');
      tx.objectStore('projects').delete('active_draft');
      this.updateStatus('Draft cleared', 'saved');
    } catch (e) {
      console.warn('[StorageEngine] Error clearing draft:', e);
    }
  }
}

window.StorageEngine = StorageEngine;
