// Gmail Sign button injector - SIMPLE VERSION
console.log('[st-ext] Gmail injector active (frame URL:', window.location.href, ')');

function addSnapButton() {
  // Find attachment cards - Gmail uses multiple selectors
  const attachButtons = document.querySelectorAll(`
    div[data-tooltip="Add to Drive"],
    span[data-tooltip="Add to Drive"],
    div[aria-label="Add to Drive"],
    span[aria-label="Add to Drive"],
    div.aQw,
    span.aZo N,
    button.aQw
  `);
  
  if (!attachButtons.length) {
    console.log('[st-ext] No attachment buttons found yet');
    return;
  }

  console.log('[st-ext] Found', attachButtons.length, 'attachment buttons');

  attachButtons.forEach((btn) => {
    // Skip if we already added our button
    if (btn.querySelector('.st-sign-btn') || btn.parentElement?.querySelector('.st-sign-btn')) {
      return;
    }

    // Create Sign button
    const signBtn = document.createElement('button');
    signBtn.textContent = 'Sign';
    signBtn.className = 'st-sign-btn';
    signBtn.style.cssText = `
      background:#ff510e;
      color:#fff;
      border:none;
      border-radius:6px;
      padding:4px 10px;
      margin-left:6px;
      cursor:pointer;
      font-size:12px;
      font-family:inherit;
      display:inline-block;
    `;

    signBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('[st-ext] Sign button clicked!');
      alert('Button working! (PDF step next)');
    });

    // Try to append to the button or its parent
    if (btn.parentElement) {
      btn.parentElement.appendChild(signBtn);
      console.log('[st-ext] Added Sign button next to attachment');
    }
  });
}

// Run every 2 seconds to catch Gmail's dynamic content
setInterval(addSnapButton, 2000);

// Run immediately
addSnapButton();

console.log('[st-ext] Gmail injector running - checking every 2s');
