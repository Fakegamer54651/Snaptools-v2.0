// Content script for SnapTools Minimal
import { PDFViewer } from './pdfsign/viewer/pdfViewer';

console.log('[st-ext] content script loaded successfully', window.location.href);

// Track processed containers to avoid duplicates
const processedContainers = new WeakSet<Element>();

// Initialize PDF viewer instance
const pdfViewer = new PDFViewer();

// Gmail PDF sign button injection
if (window.location.hostname === 'mail.google.com') {
  console.log('[st-ext] Gmail detected');
  initPdfSignButtons();
}

function initPdfSignButtons() {
  console.log("[st-ext] PDF Sign injector active");

  // Find all PDF elements using the updated selector
  const pdfElements = document.querySelectorAll('[aria-label$=".pdf"], [data-tooltip$=".pdf"], div[data-tooltip^="Download"]');

  pdfElements.forEach((element) => {
    // Find the top-level attachment container
    const container = element.closest('div[role="group"], div.aQH, div.aZo, div[role="button"]');
    
    if (!container) return;

    // Skip if we've already processed this container
    if (processedContainers.has(container)) {
      return;
    }

    // Mark this container as processed
    processedContainers.add(container);

    // Function to inject sign button for this container
    const injectSignButton = () => {
      const actionBar = container.querySelector('.aQw');
      
      if (!actionBar) return;

      // Check if actionBar already has our sign button
      if (actionBar.querySelector('[data-snaptools-sign="true"]')) {
        return;
      }

      // Create the sign button
      const btn = document.createElement('button');
      btn.textContent = 'Sign';
      btn.dataset.snaptoolsSign = 'true';
      btn.setAttribute('title', 'Sign PDF');
      btn.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 28px;
        margin-left: 6px;
        padding: 0 10px;
        border: 1px solid #dadce0;
        border-radius: 4px;
        background: #f8f9fa;
        color: #202124;
        font-size: 12px;
        font-family: Google Sans, Roboto, Arial, sans-serif;
        cursor: pointer;
      `;

      btn.addEventListener('mouseenter', () => btn.style.background = '#f1f3f4');
      btn.addEventListener('mouseleave', () => btn.style.background = '#f8f9fa');

      // Add click handler
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const fileName = getFileName(element);
        console.log(`[st-ext] Sign button clicked for: ${fileName}`);
        
        // Get PDF URL from Gmail
        const pdfLink = element.closest('a') || element.querySelector('a');
        if (pdfLink && pdfLink instanceof HTMLAnchorElement) {
          const pdfUrl = pdfLink.href;
          await pdfViewer.open(pdfUrl);
        } else {
          console.warn('[st-ext] Could not find PDF URL');
        }
      });

      // Append it inline (next to the Drive button)
      actionBar.appendChild(btn);

      console.log('[st-ext] Added Sign button beside Drive');
    };

    // Initial injection
    injectSignButton();

    // Set up MutationObserver to watch for changes inside this container
    const observer = new MutationObserver(() => {
      const actionBar = container.querySelector('.aQw');
      if (actionBar && !actionBar.querySelector('[data-snaptools-sign="true"]')) {
        injectSignButton();
        console.log("[st-ext] Restored Sign button after Gmail DOM refresh");
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });
  });

  // Set up MutationObserver to handle dynamically loaded emails
  const globalObserver = new MutationObserver(() => {
    // Re-scan for new PDF elements
    const newPdfElements = document.querySelectorAll('[aria-label$=".pdf"], [data-tooltip$=".pdf"], div[data-tooltip^="Download"]');
    newPdfElements.forEach((element) => {
      const container = element.closest('div[role="group"], div.aQH, div.aZo, div[role="button"]');
      
      if (!container) return;

      // Skip if we've already processed this container
      if (processedContainers.has(container)) {
        return;
      }

      // Mark this container as processed
      processedContainers.add(container);

      // Function to inject sign button for this container
      const injectSignButton = () => {
        const actionBar = container.querySelector('.aQw');
        
        if (!actionBar) return;

        // Check if actionBar already has our sign button
        if (actionBar.querySelector('[data-snaptools-sign="true"]')) {
          return;
        }

        // Create the sign button
        const btn = document.createElement('button');
        btn.textContent = 'Sign';
        btn.dataset.snaptoolsSign = 'true';
        btn.setAttribute('title', 'Sign PDF');
        btn.style.cssText = `
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 28px;
          margin-left: 6px;
          padding: 0 10px;
          border: 1px solid #dadce0;
          border-radius: 4px;
          background: #f8f9fa;
          color: #202124;
          font-size: 12px;
          font-family: Google Sans, Roboto, Arial, sans-serif;
          cursor: pointer;
        `;

        btn.addEventListener('mouseenter', () => btn.style.background = '#f1f3f4');
        btn.addEventListener('mouseleave', () => btn.style.background = '#f8f9fa');

        // Add click handler
        btn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          const fileName = getFileName(element);
          console.log(`[st-ext] Sign button clicked for: ${fileName}`);
          
          // Get PDF URL from Gmail
          const pdfLink = element.closest('a') || element.querySelector('a');
          if (pdfLink && pdfLink instanceof HTMLAnchorElement) {
            const pdfUrl = pdfLink.href;
            await pdfViewer.open(pdfUrl);
          } else {
            console.warn('[st-ext] Could not find PDF URL');
          }
        });

        // Append it inline (next to the Drive button)
        actionBar.appendChild(btn);

        console.log('[st-ext] Added Sign button beside Drive');
      };

      // Initial injection
      injectSignButton();

      // Set up MutationObserver to watch for changes inside this container
      const observer = new MutationObserver(() => {
        const actionBar = container.querySelector('.aQw');
        if (actionBar && !actionBar.querySelector('[data-snaptools-sign="true"]')) {
          injectSignButton();
          console.log("[st-ext] Restored Sign button after Gmail DOM refresh");
        }
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
      });
    });
  });

  globalObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function createSignButton(pdfElement: Element): HTMLButtonElement {
  const button = document.createElement('button');

  // Get filename for click logging
  const fileName = getFileName(pdfElement);

  // Set up button properties
  button.textContent = 'Sign';
  button.title = `Sign PDF: ${fileName}`;
  
  // Set data attribute to identify our buttons
  button.dataset.snaptoolsSign = "true";

  // Inline style for horizontal alignment
  button.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 28px;
    margin-left: 6px;
    background: #f1f3f4;
    border: 1px solid #dadce0;
    border-radius: 4px;
    padding: 0 10px;
    font-size: 12px;
    color: #202124;
    cursor: pointer;
    font-family: Google Sans, Roboto, Arial, sans-serif;
  `;

  // Add click handler
  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(`[st-ext] Sign clicked for ${fileName}`);
  });

  return button;
}

function getFileName(pdfElement: Element): string {
  // Try to get filename from aria-label first
  const ariaLabel = pdfElement.getAttribute('aria-label') || '';
  if (ariaLabel.endsWith('.pdf')) {
    return ariaLabel.trim();
  }

  // Try data-tooltip attribute
  const dataTooltip = pdfElement.getAttribute('data-tooltip') || '';
  if (dataTooltip.endsWith('.pdf')) {
    return dataTooltip.trim();
  }

  // Try innerText as fallback
  const innerText = pdfElement.textContent?.trim() || '';
  if (innerText.includes('.pdf')) {
    return innerText;
  }

  // Try href attribute as last resort
  const href = pdfElement.getAttribute('href') || '';
  if (href.endsWith('.pdf')) {
    const urlParts = href.split('/');
    const fileName = urlParts[urlParts.length - 1];
    if (fileName.includes('.pdf')) {
      return decodeURIComponent(fileName);
    }
  }

  return 'document.pdf';
}