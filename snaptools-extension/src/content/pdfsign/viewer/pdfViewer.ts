// PDF Viewer using PDF.js from CDN
// This is a lightweight, self-hosted PDF viewer for the Chrome extension

export class PDFViewer {
  private overlay: HTMLElement | null = null;
  private container: HTMLElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private pdfDoc: any = null;
  private currentPage = 1;
  private scale = 1.5;
  private pdfLib: any = null;

  constructor() {
    this.loadPDFJS();
  }

  private async loadPDFJS(): Promise<void> {
    // Load PDF.js from CDN
    if ((window as any).pdfjsLib) {
      this.pdfLib = (window as any).pdfjsLib;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        this.pdfLib = (window as any).pdfjsLib;
        this.pdfLib.GlobalWorkerOptions.workerSrc = 
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  public async open(pdfUrl: string): Promise<void> {
    if (!this.pdfLib) {
      await this.loadPDFJS();
    }

    // Create overlay
    this.createOverlay();

    // Load PDF
    try {
      const loadingTask = this.pdfLib.getDocument(pdfUrl);
      this.pdfDoc = await loadingTask.promise;
      
      console.log('[st-ext] PDF loaded successfully');
      
      // Render first page
      await this.renderPage(1);
      
      console.log('[st-ext] PDF viewer initialized');
    } catch (error) {
      console.error('[st-ext] Error loading PDF:', error);
      this.close();
    }
  }

  private createOverlay(): void {
    // Create semi-transparent overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'snaptools-pdf-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    // Create white container
    this.container = document.createElement('div');
    this.container.style.cssText = `
      position: relative;
      background: white;
      border-radius: 8px;
      max-width: 90%;
      max-height: 90%;
      overflow: auto;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      width: 30px;
      height: 30px;
      border: none;
      background: #f44336;
      color: white;
      font-size: 24px;
      line-height: 1;
      border-radius: 50%;
      cursor: pointer;
      z-index: 1000000;
    `;
    closeButton.addEventListener('click', () => this.close());

    // Create controls
    const controls = document.createElement('div');
    controls.style.cssText = `
      position: sticky;
      top: 0;
      background: #f1f3f4;
      padding: 10px;
      display: flex;
      gap: 10px;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    `;

    const prevButton = this.createButton('Previous', () => this.previousPage());
    const nextButton = this.createButton('Next', () => this.nextPage());
    const zoomInButton = this.createButton('Zoom In', () => this.zoomIn());
    const zoomOutButton = this.createButton('Zoom Out', () => this.zoomOut());

    const pageInfo = document.createElement('span');
    pageInfo.id = 'pdf-page-info';
    pageInfo.style.cssText = 'margin: 0 10px; font-family: Arial, sans-serif;';

    controls.appendChild(prevButton);
    controls.appendChild(pageInfo);
    controls.appendChild(nextButton);
    controls.appendChild(document.createTextNode(' | '));
    controls.appendChild(zoomOutButton);
    controls.appendChild(zoomInButton);

    // Create canvas container
    const canvasContainer = document.createElement('div');
    canvasContainer.style.cssText = `
      padding: 20px;
      display: flex;
      justify-content: center;
    `;

    this.canvas = document.createElement('canvas');
    canvasContainer.appendChild(this.canvas);

    // Assemble
    this.container.appendChild(closeButton);
    this.container.appendChild(controls);
    this.container.appendChild(canvasContainer);
    this.overlay.appendChild(this.container);
    document.body.appendChild(this.overlay);
  }

  private createButton(text: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.cssText = `
      padding: 6px 12px;
      background: white;
      border: 1px solid #dadce0;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-family: Arial, sans-serif;
    `;
    button.addEventListener('click', onClick);
    button.addEventListener('mouseenter', () => {
      button.style.background = '#f1f3f4';
    });
    button.addEventListener('mouseleave', () => {
      button.style.background = 'white';
    });
    return button;
  }

  private async renderPage(pageNumber: number): Promise<void> {
    if (!this.pdfDoc || !this.canvas) return;

    const page = await this.pdfDoc.getPage(pageNumber);
    const viewport = page.getViewport({ scale: this.scale });

    const context = this.canvas.getContext('2d');
    if (!context) return;

    this.canvas.height = viewport.height;
    this.canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    // Update page info
    const pageInfo = document.getElementById('pdf-page-info');
    if (pageInfo) {
      pageInfo.textContent = `Page ${pageNumber} of ${this.pdfDoc.numPages}`;
    }

    this.currentPage = pageNumber;
  }

  private async previousPage(): Promise<void> {
    if (this.currentPage <= 1) return;
    await this.renderPage(this.currentPage - 1);
  }

  private async nextPage(): Promise<void> {
    if (!this.pdfDoc || this.currentPage >= this.pdfDoc.numPages) return;
    await this.renderPage(this.currentPage + 1);
  }

  private async zoomIn(): Promise<void> {
    this.scale += 0.2;
    await this.renderPage(this.currentPage);
  }

  private async zoomOut(): Promise<void> {
    if (this.scale <= 0.5) return;
    this.scale -= 0.2;
    await this.renderPage(this.currentPage);
  }

  public close(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.container = null;
      this.canvas = null;
      this.pdfDoc = null;
      this.currentPage = 1;
      this.scale = 1.5;
    }
  }
}

