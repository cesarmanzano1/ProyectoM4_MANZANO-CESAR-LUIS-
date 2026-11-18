// src/routes/AppRouter.tsx
// import type { JSX } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { LoginPage } from "../pages/LoginPage";
// import { RegisterPage } from "../pages/RegisterPage";
// import { DashboardPage } from "../pages/DashboardPage";

// function PrivateRoute({ children }: { children: JSX.Element }) {
//   const { user, loading } = useAuth();
//   if (loading) return <div style={{ color: "#fff", textAlign: "center", marginTop: "20vh" }}>Cargando...</div>;
//   return user ? children : <Navigate to="/login" replace />;
// }

// export function AppRouter(): JSX.Element {
//   return (
//     <Routes>
//       <Route path="/" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
//       <Route path="/tasks/:folderName" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
//       <Route path="/calendar" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
//       <Route path="/trash" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
//       <Route path="/login" element={<LoginPage />} />
//       <Route path="/register" element={<RegisterPage />} />
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }
//src/routes/AppRouter.tsx
import type { JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: "#fff", textAlign: "center", marginTop: "20vh" }}>Cargando...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export function AppRouter(): JSX.Element {
  return (
    <Routes>
      {/* Al entrar a la raíz "/" redirige por defecto al Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Autenticación */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas protegidas del Dashboard y sus vistas */}
      <Route path="/tasks" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/tasks/:folderName" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/calendar" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/papelera" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />

      {/* Comodín */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}