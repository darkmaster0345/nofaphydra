import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, registerBackgroundSync, registerPeriodicSync } from "./lib/pwaUtils";

console.log("[HYDRA] Initializing application...");
try {
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");

  createRoot(rootElement).render(<App />);
  console.log("[HYDRA] Render initiated");
} catch (e) {
  console.error("[HYDRA] Fatal render error:", e);
  document.body.innerHTML = `<div style="padding: 20px; color: black; font-family: sans-serif;"><h1>Boot Error</h1><p>${e.message}</p></div>`;
}

// Register PWA features
if (import.meta.env.PROD) {
  registerServiceWorker().then((registration) => {
    if (registration) {
      registerBackgroundSync();
      registerPeriodicSync();
    }
  });
}
