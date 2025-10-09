// Gmail Sign button injector - SIMPLE VERSION
console.log('[st-ext] Gmail injector active');

function addSnapButton() {
  // Find all "Add to Drive" buttons
  const attachButtons = document.querySelectorAll('div[data-tooltip="Add to Drive"]');
  
  if (!attachButtons.length) {
    console.log('[st-ext] No Add to Drive buttons found yet');
    return;
  }

  console.log('[st-ext] Found', attachButtons.length, 'Add to Drive buttons');

  attachButtons.forEach((btn) => {
    // Skip if we already added our button
    if (btn.parentElement?.querySelector('.st-sign-btn')) {
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
    `;

    signBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log('[st-ext] Sign button clicked!');
      alert('Button working! (PDF step next)');
    });

    btn.parentElement?.appendChild(signBtn);
    console.log('[st-ext] Added Sign button');
  });
}

// Run every 2 seconds to catch Gmail's dynamic content
setInterval(addSnapButton, 2000);

// Run immediately
addSnapButton();

console.log('[st-ext] Gmail injector running - checking every 2s');
