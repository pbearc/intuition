// src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

// Create a root
const root = createRoot(document.getElementById("root"));

// Render the app to the root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
