/**
 * QR Code Generator Tool for DesignPro
 * Generates custom QR codes directly onto the canvas for flyers, business cards, and promos
 */

class QRCodeTool {
  constructor(canvasManager) {
    this.canvasManager = canvasManager;
    this.canvas = canvasManager.canvas;
  }

  setCanvas(canvas) {
    this.canvas = canvas;
  }

  generateQRCode(text, color = '#000000', bgColor = '#ffffff') {
    if (!text || text.trim() === '') {
      if (window.showToast) window.showToast('Please enter a URL or text for the QR code.', 'info');
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    try {
      new QRCode(tempDiv, {
        text: text.trim(),
        width: 320,
        height: 320,
        colorDark: color,
        colorLight: bgColor,
        correctLevel: QRCode.CorrectLevel.H,
      });

      setTimeout(() => {
        const imgEl = tempDiv.querySelector('img');
        const canvasEl = tempDiv.querySelector('canvas');
        const dataUrl = imgEl ? imgEl.src : (canvasEl ? canvasEl.toDataURL() : null);

        if (dataUrl) {
          fabric.Image.fromURL(dataUrl, (fabricImg) => {
            const artboardW = this.canvasManager ? this.canvasManager.artboardWidth : (this.canvas.width / (this.canvas.getZoom() || 1));
            const artboardH = this.canvasManager ? this.canvasManager.artboardHeight : (this.canvas.height / (this.canvas.getZoom() || 1));

            fabricImg.set({
              left: artboardW / 2,
              top: artboardH / 2,
              originX: 'center',
              originY: 'center',
              scaleX: 0.6,
              scaleY: 0.6,
              name: `QR: ${text.substring(0, 16)}`,
            });
            this.canvas.add(fabricImg);
            this.canvas.setActiveObject(fabricImg);
            this.canvas.renderAll();
            this.canvasManager.recordState();
            if (window.showToast) window.showToast('QR Code added to artboard!', 'success');
          });
        }
        if (tempDiv.parentNode) tempDiv.parentNode.removeChild(tempDiv);
      }, 80);
    } catch (err) {
      console.error('Error creating QR code:', err);
      if (tempDiv.parentNode) tempDiv.parentNode.removeChild(tempDiv);
    }
  }
}

window.QRCodeTool = QRCodeTool;
