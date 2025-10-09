// SnapTools Overlay Viewer - In-page full-screen PDF viewer
// Logs: Gmail page → [st-view] from overlay viewer

// Testing notes:
// - Which consoles: Gmail page → [st-ext] from injector, [st-view] from overlay viewer
// - Scenarios:
//   - Click Sign with/without real URL
//   - Zoom +/- works
//   - Close on ×, ESC, or backdrop click

const HOST_ID = '__st_viewer_host';
let currentHost: HTMLDivElement | null = null;
let shadowRoot: ShadowRoot | null = null;
let pdfDoc: any = null;
let scale = 1.25;
let pdfjsLib: any = null;

// CSS content to inject into shadow
const cssContent = `
:host, * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2147483000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  width: 92vw;
  height: 88vh;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  background: #fff;
}

.title {
  font: 600 14px/1.2 'Google Sans', Roboto, Arial, sans-serif;
  color: #202124;
}

.spacer {
  flex: 1;
}

.toolbar button {
  background: #f1f3f4;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  color: #202124;
  min-width: 32px;
}

.toolbar button:hover {
  background: #e8eaed;
}

.toolbar button:active {
  background: #dadce0;
}

#close {
  font-size: 20px;
  line-height: 1;
  font-weight: 300;
}

#pages {
  flex: 1;
  overflow: auto;
  background: #f5f5f5;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

canvas {
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  display: block;
  max-width: 100%;
  height: auto;
}
`;

async function loadPDFJS(): Promise<any> {
  if (pdfjsLib) {
    console.log('[st-view] PDF.js already loaded');
    return pdfjsLib;
  }

  // Check if already in window
  if ((window as any).pdfjsLib) {
    pdfjsLib = (window as any).pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('vendor/pdf.worker.min.js');
    console.log('[st-view] PDF.js found in window');
    return pdfjsLib;
  }

  console.log('[st-view] Loading PDF.js...');
  
  // Load PDF.js from extension bundle
  pdfjsLib = await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('vendor/pdf.min.js');
    script.type = 'text/javascript';
    script.async = false; // important: block until loaded
    
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (!lib) {
        reject(new Error('PDF.js not available after script load'));
        return;
      }
      lib.GlobalWorkerOptions.workerSrc = chrome.runtime.getURL('vendor/pdf.worker.min.js');
      pdfjsLib = lib;
      console.log('[st-view] PDF.js loaded successfully');
      resolve(lib);
    };
    
    script.onerror = (err) => {
      reject(new Error('Failed to load PDF.js: ' + err));
    };
    
    document.head.appendChild(script);
  });

  return pdfjsLib;
}

export async function openOverlayViewer(options: { src?: string; name?: string } = {}): Promise<void> {
  const { src, name } = options;

  // Check if viewer already open
  if (document.getElementById(HOST_ID)) {
    console.log('[st-view] Viewer already open');
    return;
  }

  // Reuse or create host
  if (!currentHost) {
    currentHost = document.createElement('div');
    currentHost.id = HOST_ID;
    document.documentElement.appendChild(currentHost);

    // Attach shadow root
    shadowRoot = currentHost.attachShadow({ mode: 'open' });

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = cssContent;
    shadowRoot.appendChild(style);

    console.log('[st-view] overlay mounted');
  }

  if (!shadowRoot) return;

  // Build structure
  shadowRoot.innerHTML = `
    <style>${cssContent}</style>
    <div class="backdrop">
      <div class="container">
        <div class="toolbar">
          <div class="title">SnapTools — ${name || 'PDF Viewer'}</div>
          <div class="spacer"></div>
          <button id="zoomOut">−</button>
          <button id="zoomIn">+</button>
          <button id="close">×</button>
        </div>
        <div id="pages"></div>
      </div>
    </div>
  `;

  // Get DOM elements from shadow
  const backdrop = shadowRoot.querySelector('.backdrop') as HTMLDivElement;
  const container = shadowRoot.querySelector('.container') as HTMLDivElement;
  const closeBtn = shadowRoot.querySelector('#close') as HTMLButtonElement;
  const zoomInBtn = shadowRoot.querySelector('#zoomIn') as HTMLButtonElement;
  const zoomOutBtn = shadowRoot.querySelector('#zoomOut') as HTMLButtonElement;
  const pagesContainer = shadowRoot.querySelector('#pages') as HTMLDivElement;

  // Close handlers
  const handleClose = () => closeOverlayViewer();

  closeBtn.addEventListener('click', handleClose);
  
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      handleClose();
    }
  });

  // ESC key handler
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Zoom handlers
  zoomInBtn.addEventListener('click', async () => {
    scale += 0.2;
    await renderAllPages(pagesContainer);
    console.log('[st-view] zoom in, scale:', scale);
  });

  zoomOutBtn.addEventListener('click', async () => {
    if (scale > 0.5) {
      scale -= 0.2;
      await renderAllPages(pagesContainer);
      console.log('[st-view] zoom out, scale:', scale);
    }
  });

  // Load PDF.js
  try {
    await loadPDFJS();
  } catch (error) {
    console.error('[st-view] Failed to load PDF.js:', error);
    pagesContainer.innerHTML = '<div style="color: #d93025; padding: 20px;">Failed to load PDF.js library</div>';
    return;
  }

  // Load and render PDF
  try {
    let pdfData: ArrayBuffer;

    if (src) {
      console.log('[st-view] loaded src', { hasSrc: !!src, src });
      
      try {
        const response = await fetch(src, {
          credentials: 'include',
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        pdfData = await response.arrayBuffer();
        console.log('[st-view] fetched PDF from URL successfully');
      } catch (fetchError) {
        console.warn('[st-view] Failed to fetch PDF from URL:', fetchError);
        console.log('[st-view] Falling back to sample PDF');
        
        // Fallback to sample
        const sampleUrl = chrome.runtime.getURL('content/pdfsign/sample.pdf');
        const sampleResponse = await fetch(sampleUrl);
        pdfData = await sampleResponse.arrayBuffer();
      }
    } else {
      console.log('[st-view] loaded src', { hasSrc: false });
      console.log('[st-view] No URL provided, using sample PDF');
      
      const sampleUrl = chrome.runtime.getURL('content/pdfsign/sample.pdf');
      const sampleResponse = await fetch(sampleUrl);
      pdfData = await sampleResponse.arrayBuffer();
    }

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    pdfDoc = await loadingTask.promise;

    console.log('[st-view] PDF loaded, pages:', pdfDoc.numPages);

    // Render all pages
    await renderAllPages(pagesContainer);

  } catch (error) {
    console.error('[st-view] Error loading/rendering PDF:', error);
    pagesContainer.innerHTML = `<div style="color: #d93025; padding: 20px;">Failed to load PDF: ${error}</div>`;
  }
}

async function renderAllPages(container: HTMLDivElement): Promise<void> {
  if (!pdfDoc) return;

  // Clear container
  container.innerHTML = '';

  // Render each page
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    await renderPage(pageNum, container);
  }
}

async function renderPage(pageNumber: number, container: HTMLDivElement): Promise<void> {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  // Create canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  // Append to container
  container.appendChild(canvas);

  // Render
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };

  await page.render(renderContext).promise;

  console.log('[st-view] rendered page', pageNumber);
}

export function closeOverlayViewer(): void {
  if (currentHost) {
    currentHost.remove();
    currentHost = null;
    shadowRoot = null;
    pdfDoc = null;
    scale = 1.25;
    console.log('[st-view] overlay closed');
  }
}

