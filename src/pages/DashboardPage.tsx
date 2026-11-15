// src/pages/DashboardPage.tsx
import type { JSX, CSSProperties } from "react";
import type { User } from "firebase/auth";

interface DashboardPageProps {
  user: User | null;
  onLogout?: () => void;
}

export function DashboardPage({ user, onLogout }: DashboardPageProps): JSX.Element {
  return (
    <div style={dashboardStyles.container}>
      <div style={dashboardStyles.card}>
        <h2>Panel de Usuario</h2>
        <p>
          Bienvenido(a), <strong>{user?.displayName || "Usuario"}</strong>
        </p>
        <p style={dashboardStyles.emailText}>
          Correo registrado: {user?.email}
        </p>
        {onLogout && (
          <button type="button" onClick={onLogout} style={dashboardStyles.button}>
            Cerrar Sesión
          </button>
        )}
      </div>
    </div>
  );
}

const dashboardStyles: Record<string, CSSProperties> = {
  container: {
    padding: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "70vh",
  },
  card: {
    padding: "2rem",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
  },
  emailText: {
    marginTop: "0.5rem",
    color: "#6b7280",
    fontSize: "0.9rem",
  },
  button: {
    marginTop: "1.5rem",
    padding: "0.625rem 1.25rem",
    backgroundColor: "#ef4444",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default DashboardPage;
