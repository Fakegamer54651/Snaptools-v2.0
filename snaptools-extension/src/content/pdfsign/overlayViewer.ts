// SnapTools Iframe-based PDF Viewer
// Bypasses all CSP and isolated world issues by using a separate iframe

export async function openOverlayViewer(options: { src?: string; name?: string } = {}): Promise<void> {
  const { src, name } = options;

  // Check if viewer already open
  if (document.getElementById('__st_viewer_host')) {
    console.log('[st-view] Viewer already open');
    return;
  }

  console.log('[st-view] Opening iframe viewer:', { url: src, name });

  // 1) Create overlay host
  const host = document.createElement('div');
  host.id = '__st_viewer_host';
  Object.assign(host.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483000'
  });

  const shadow = host.attachShadow({ mode: 'open' });
  document.documentElement.appendChild(host);

  // 2) Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:flex-start;justify-content:center;padding:24px;}
    .container{width: calc(100% - 48px); height: calc(100% - 48px); background:#fff;border-radius:10px;box-shadow:0 10px 40px rgba(0,0,0,.25);overflow:hidden;display:flex;flex-direction:column}
    .title{height:44px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #eee;padding:0 10px;font:500 14px/44px system-ui, Arial;}
    .btns{display:flex;gap:6px}
    .btn{border:1px solid #ddd;background:#fff;border-radius:8px;cursor:pointer;padding:4px 8px}
    iframe{border:0;flex:1}
  `;
  shadow.appendChild(style);

  // 3) Build overlay structure
  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  backdrop.innerHTML = `
    <div class="container">
      <div class="title">
        <div>SnapTools — ${name || 'PDF'}</div>
        <div class="btns">
          <button class="btn" id="min">–</button>
          <button class="btn" id="max">+</button>
          <button class="btn" id="close">×</button>
        </div>
      </div>
      <iframe id="viewer" src="${chrome.runtime.getURL('content/pdfsign/viewer.html')}"></iframe>
    </div>
  `;
  shadow.appendChild(backdrop);

  // 4) Fetch PDF bytes (content script has cookies)
  async function fetchBytes(href: string): Promise<ArrayBuffer> {
    try {
      const resp = await fetch(href, { credentials: 'include' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return await resp.arrayBuffer();
    } catch (error) {
      console.error('[st-view] Failed to fetch PDF:', error);
      // Fallback to sample PDF
      const sampleUrl = chrome.runtime.getURL('content/pdfsign/sample.pdf');
      const sampleResp = await fetch(sampleUrl);
      return await sampleResp.arrayBuffer();
    }
  }

  const iframe = backdrop.querySelector('#viewer') as HTMLIFrameElement;
  const iframeOrigin = new URL(iframe.src).origin;

  // 5) Wait for iframe init message
  function waitForInit(): Promise<void> {
    return new Promise(resolve => {
      function onMsg(ev: MessageEvent) {
        if (ev.origin !== iframeOrigin) return;
        if (ev.data && ev.data.source === 'st-view' && ev.data.type === 'init') {
          window.removeEventListener('message', onMsg);
          console.log('[st-view] Iframe ready');
          resolve();
        }
      }
      window.addEventListener('message', onMsg);
    });
  }

  await waitForInit();

  // 6) Fetch and send PDF bytes to iframe
  if (src) {
    const bytes = await fetchBytes(src);
    iframe.contentWindow!.postMessage(
      { source: 'st-ext', type: 'pdf-bytes', name, bytes },
      iframeOrigin,
      [bytes]
    );
  } else {
    // No URL, use sample
    const sampleUrl = chrome.runtime.getURL('content/pdfsign/sample.pdf');
    const bytes = await fetch(sampleUrl).then(r => r.arrayBuffer());
    iframe.contentWindow!.postMessage(
      { source: 'st-ext', type: 'pdf-bytes', name: name || 'Sample PDF', bytes },
      iframeOrigin,
      [bytes]
    );
  }

  // 7) Wire up controls
  const closeBtn = shadow.getElementById('close');
  const minBtn = shadow.getElementById('min');
  const maxBtn = shadow.getElementById('max');

  closeBtn!.onclick = () => {
    host.remove();
    console.log('[st-view] Viewer closed');
  };

  minBtn!.onclick = () => {
    (backdrop.style as any).alignItems = 'flex-end';
  };

  maxBtn!.onclick = () => {
    (backdrop.style as any).alignItems = 'flex-start';
  };

  // Close on ESC
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      host.remove();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  console.log('[st-view] Overlay mounted and PDF loading');
}

export function closeOverlayViewer(): void {
  const host = document.getElementById('__st_viewer_host');
  if (host) {
    host.remove();
    console.log('[st-view] Viewer closed');
  }
}
