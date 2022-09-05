import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TestPlayer from "./TestPlayer";

const container = document.getElementById("root");

if (!container) throw new Error("Failed to find root element.");

createRoot(container).render(
  <StrictMode>
    <TestPlayer />
  </StrictMode>
);
