import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Force React to be global to prevent "React is not defined" ReferenceErrors in some environments
(window as any).React = React;

// Auto-redirect missing hash for WhatsApp links
if (window.location.pathname === '/recrutement' || window.location.pathname === '/recrutemen' || window.location.pathname === '/recrut') {
  window.location.replace('/#/recrutement');
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
// Register Service Worker for PWA and Push Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.log('SW registration failed:', err));
  });
}
