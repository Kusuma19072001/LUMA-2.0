import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initDatabase } from "./services/database.ts";

// Initialize database on app startup
initDatabase()
  .then(() => {
    console.log("LUMA database initialized successfully");
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
  });

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

