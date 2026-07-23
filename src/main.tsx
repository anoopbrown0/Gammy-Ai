import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handlers to prevent third-party browser extension errors from interrupting the app preview
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    if (
      (event.message && (
        event.message.includes("browser extension") ||
        event.message.includes("extension")
      )) ||
      (event.filename && event.filename.includes("chrome-extension"))
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);

  window.addEventListener("unhandledrejection", (event) => {
    if (
      event.reason &&
      event.reason.message && (
        event.reason.message.includes("browser extension") ||
        event.reason.message.includes("extension")
      )
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
