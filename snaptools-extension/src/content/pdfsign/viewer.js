(() => {
  const pdfjsLib = window.pdfjsLib || window['pdfjs-dist/build/pdf'];
  let pdfDoc = null, pageNum = 1, scale = 1.2, rendering = false, pending = null;

  const pages = document.getElementById('pages');
  const pageInfo = document.getElementById('pageInfo');
  const nameEl = document.getElementById('name');

  function renderPage(num) {
    rendering = true;
    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale });
      pages.innerHTML = '';
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      pages.appendChild(canvas);

      const renderTask = page.render({ canvasContext: ctx, viewport });
      renderTask.promise.then(() => {
        rendering = false;
        if (pending !== null) { renderPage(pending); pending = null; }
      });
      pageInfo.textContent = `Page ${num} / ${pdfDoc.numPages} (zoom ${scale.toFixed(2)}x)`;
    });
  }

  function queueRender(num) {
    if (rendering) pending = num;
    else renderPage(num);
  }

  function onPrev() { if (pageNum <= 1) return; pageNum--; queueRender(pageNum); }
  function onNext() { if (pageNum >= pdfDoc.numPages) return; pageNum++; queueRender(pageNum); }
  function onZoomIn() { scale *= 1.2; queueRender(pageNum); }
  function onZoomOut() { scale /= 1.2; queueRender(pageNum); }

  document.getElementById('prev').onclick = onPrev;
  document.getElementById('next').onclick = onNext;
  document.getElementById('zoomIn').onclick = onZoomIn;
  document.getElementById('zoomOut').onclick = onZoomOut;

  // Receive bytes from content script
  window.addEventListener('message', async (ev) => {
    if (!ev.data || ev.data.source !== 'st-ext' || ev.data.type !== 'pdf-bytes') return;
    try {
      const bytes = ev.data.bytes; // ArrayBuffer
      nameEl.textContent = `— ${ev.data.name || ''}`;
      const task = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
      pdfDoc = await task.promise;
      pageNum = 1; scale = 1.2;
      renderPage(pageNum);
      window.parent.postMessage({ source: 'st-view', type: 'ready' }, '*');
    } catch (err) {
      console.error('[viewer] failed to open pdf', err);
      pages.innerHTML = `<div style="color:#d93025;padding:20px">Failed to open PDF</div>`;
    }
  });

  // Tell parent we're ready to receive
  window.parent.postMessage({ source: 'st-view', type: 'init' }, '*');
})();

