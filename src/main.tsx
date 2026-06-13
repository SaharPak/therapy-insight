import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { VaultProvider } from "./context/VaultContext.tsx";
import { LanguageProvider } from "./i18n/LanguageContext.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <VaultProvider>
          <App />
        </VaultProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
