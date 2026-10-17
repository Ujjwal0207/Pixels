/**
 * Drawing Tool for DesignPro
 * Freehand drawing, brush customization and sketching
 */

class DrawingTool {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
    this.brushColor = '#8b5cf6';
    this.brushWidth = 5;
    this.brushType = 'Pencil';
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  enableDrawing(enabled = true) {
    this.canvas.isDrawingMode = enabled;
    if (enabled) {
      this.updateBrush();
    }
  }

  setBrushType(type) {
    this.brushType = type;
    if (this.canvas.isDrawingMode) {
      this.updateBrush();
    }
  }

  setBrushColor(color) {
    this.brushColor = color;
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.color = color;
    }
  }

  setBrushWidth(width) {
    this.brushWidth = parseInt(width, 10);
    if (this.canvas.freeDrawingBrush) {
      this.canvas.freeDrawingBrush.width = this.brushWidth;
    }
  }

  updateBrush() {
    if (this.brushType === 'Circle') {
      this.canvas.freeDrawingBrush = new fabric.CircleBrush(this.canvas);
    } else if (this.brushType === 'Spray') {
      this.canvas.freeDrawingBrush = new fabric.SprayBrush(this.canvas);
    } else {
      this.canvas.freeDrawingBrush = new fabric.PencilBrush(this.canvas);
    }

    this.canvas.freeDrawingBrush.color = this.brushColor;
    this.canvas.freeDrawingBrush.width = this.brushWidth;
  }
}

window.DrawingTool = DrawingTool;
