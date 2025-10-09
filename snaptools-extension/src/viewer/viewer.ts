// SnapTools PDF Viewer Logic
// Logs: Viewer window → Right-click → Inspect → Console: [st-viewer] …

// Parse query parameters
const params = new URLSearchParams(window.location.search);
const filename = params.get('name') || 'document.pdf';
const src = params.get('src') || '';

console.log('[st-viewer] init', { name: filename, hasSrc: !!src });

// PDF.js UMD setup
const pdfjsLib = (window as any).pdfjsLib;
if (!pdfjsLib) {
  console.error('[st-viewer] PDF.js not loaded!');
  throw new Error('PDF.js library not loaded');
}

// Set worker source from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// State
let pdfDoc: any = null;
let scale = 1.5;

// DOM elements
const pagesContainer = document.getElementById('pages')!;
const zoomInBtn = document.getElementById('zoomIn')!;
const zoomOutBtn = document.getElementById('zoomOut')!;
const zoomLevelSpan = document.getElementById('zoomLevel')!;

// Update title
document.querySelector('.title')!.textContent = `SnapTools — ${filename}`;

// Load and render PDF
async function loadPDF() {
  try {
    let pdfData: ArrayBuffer;
    
    if (src) {
      // Try to fetch the Gmail URL
      console.log('[st-viewer] Attempting to fetch:', src);
      try {
        const response = await fetch(src, { 
          credentials: 'include',
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        pdfData = await response.arrayBuffer();
        console.log('[st-viewer] Successfully fetched PDF from Gmail');
      } catch (fetchError) {
        console.warn('[st-viewer] Failed to fetch Gmail PDF:', fetchError);
        console.log('[st-viewer] Falling back to sample PDF');
        
        // Show error message
        showError('Could not load PDF from Gmail. Auth/CORS issue. Showing sample PDF instead.');
        
        // Fallback to sample
        const sampleUrl = chrome.runtime.getURL('content/pdfsign/sample.pdf');
        const sampleResponse = await fetch(sampleUrl);
        pdfData = await sampleResponse.arrayBuffer();
      }
    } else {
      // No URL provided, use sample
      console.log('[st-viewer] No URL provided, using sample PDF');
      const sampleUrl = chrome.runtime.getURL('content/pdfsign/sample.pdf');
      const sampleResponse = await fetch(sampleUrl);
      pdfData = await sampleResponse.arrayBuffer();
    }
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
    pdfDoc = await loadingTask.promise;
    
    console.log('[st-viewer] PDF loaded successfully, pages:', pdfDoc.numPages);
    
    // Render all pages
    await renderAllPages();
    
  } catch (error) {
    console.error('[st-viewer] Error loading PDF:', error);
    showError(`Failed to load PDF: ${error}`);
  }
}

async function renderAllPages() {
  if (!pdfDoc) return;
  
  // Clear container
  pagesContainer.innerHTML = '';
  
  // Render each page
  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    await renderPage(pageNum);
  }
}

async function renderPage(pageNumber: number) {
  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  
  // Create canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  // Wrap in container
  const container = document.createElement('div');
  container.className = 'page-container';
  container.appendChild(canvas);
  pagesContainer.appendChild(container);
  
  // Render
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };
  
  await page.render(renderContext).promise;
  
  console.log('[st-viewer] rendered page', pageNumber);
}

function updateZoomLevel() {
  const percentage = Math.round(scale * 100);
  zoomLevelSpan.textContent = `${percentage}%`;
}

function showError(message: string) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error';
  errorDiv.innerHTML = `
    <div class="error-title">⚠️ Warning</div>
    <div>${message}</div>
  `;
  pagesContainer.insertBefore(errorDiv, pagesContainer.firstChild);
}

// Zoom controls
zoomInBtn.addEventListener('click', async () => {
  scale += 0.2;
  updateZoomLevel();
  await renderAllPages();
  console.log('[st-viewer] zoom in, scale:', scale);
});

zoomOutBtn.addEventListener('click', async () => {
  if (scale > 0.5) {
    scale -= 0.2;
    updateZoomLevel();
    await renderAllPages();
    console.log('[st-viewer] zoom out, scale:', scale);
  }
});

// Initialize
updateZoomLevel();
loadPDF();

