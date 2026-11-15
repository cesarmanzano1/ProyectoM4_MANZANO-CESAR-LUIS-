// src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // <-- 1. Importa el Provider
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- 2. Envuélvelo aquí para que toda la app tenga acceso */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);