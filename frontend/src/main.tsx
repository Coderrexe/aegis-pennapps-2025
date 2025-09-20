import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Navigate from "./pages/Navigate.tsx";

const root = document.getElementById("root")!;

createRoot(root).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/navigate" element={<Navigate />} />
      </Routes>
    </Router>
  </StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("service worker up! scope:", registration.scope);
      })
      .catch((err) => {
        console.error("service worker registration failed: ", err);
      });
  });
}
