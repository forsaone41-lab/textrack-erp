/**
 * Utility helper to load and manage Meta Pixel (Facebook Pixel) tracking
 */

export function initFacebookPixel(pixelId: string) {
  if (!pixelId || typeof window === 'undefined') return;

  const win = window as any;
  
  // If already loaded and initialized, just reuse it
  if (win.fbq) {
    try {
      win.fbq('init', pixelId);
    } catch (e) {
      console.warn("Meta Pixel re-initialization failed:", e);
    }
    return;
  }

  // standard FB Pixel snippet
  win._fbq = win._fbq || [];
  win.fbq = function () {
    win.fbq.callMethod ? win.fbq.callMethod.apply(win, arguments) : win.fbq.queue.push(arguments);
  };
  if (!win._fbq) win._fbq = win.fbq;
  win.fbq.push = win.fbq;
  win.fbq.loaded = true;
  win.fbq.version = '2.0';
  win.fbq.queue = [];

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';

  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  // Setup Noscript fallback just in case
  const noscript = document.createElement('noscript');
  noscript.innerHTML = `<img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1" />`;
  document.body.appendChild(noscript);

  // Initialize and Track PageView
  win.fbq('init', pixelId);
  win.fbq('track', 'PageView');
  console.log(`[Meta Pixel] Initialized pixel: ${pixelId}`);
}

export function trackPixelEvent(event: string, data?: any) {
  if (typeof window === 'undefined') return;
  const win = window as any;
  if (win.fbq) {
    try {
      if (data) {
        win.fbq('track', event, data);
      } else {
        win.fbq('track', event);
      }
      console.log(`[Meta Pixel] Tracked event: ${event}`, data);
    } catch (e) {
      console.error(`[Meta Pixel] Tracking failed for ${event}:`, e);
    }
  } else {
    console.warn(`[Meta Pixel] Attempted to track event "${event}" but Pixel is not loaded.`);
  }
}
