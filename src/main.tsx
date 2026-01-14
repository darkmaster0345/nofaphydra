import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, registerBackgroundSync, registerPeriodicSync } from "./lib/pwaUtils";

createRoot(document.getElementById("root")!).render(<App />);

// Register PWA features
if (import.meta.env.PROD) {
  registerServiceWorker().then((registration) => {
    if (registration) {
      registerBackgroundSync();
      registerPeriodicSync();
    }
  });
}
