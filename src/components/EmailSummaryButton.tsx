
// // src/components/EmailSummaryButton.tsx
import { useState } from "react";
import { auth } from "../services/firebase";

type Task = { title: string; completed: boolean; folder?: string };
type Props = { todos: Task[] };

export function EmailSummaryButton({ todos }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSendSummary() {
    const user = auth.currentUser;
    if (!user) return;
    setStatus("loading");
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/send-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          // Enviamos también la propiedad folder para que el backend la clasifique bien
          tasks: todos.map(({ title, completed, folder }) => ({ title, completed, folder })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(data.message);
      setStatus("success");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "No se pudo enviar");
      setStatus("error");
    }
  }

  return (
    <div>
      <button 
        onClick={handleSendSummary} 
        disabled={status === "loading"}
        className="buttonDownload"
      >
        {status === "loading" ? "Enviando..." : "Enviar resumen"}
      </button>

      {status === "success" && (
        <span style={{ color: "#10b981", display: "block", marginTop: "5px", fontSize: "0.85rem", fontWeight: 600 }}>
          ✓ {message}
        </span>
      )}

      {/* Alerta de error estilizada y moderna */}
      {status === "error" && (
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          backgroundColor: "#fff5f5",
          border: "1px solid #feb2b2",
          borderRadius: "10px",
          padding: "0.875rem 1rem",
          marginTop: "0.75rem",
          boxShadow: "0 2px 4px rgba(220, 38, 38, 0.05)",
          textAlign: "left"
        }}>
          <span style={{ fontSize: "1.125rem", lineHeight: 1 }}>⚠️</span>
          <div>
            <p style={{ 
              margin: 0, 
              color: "#9b2c2c", 
              fontSize: "0.875rem", 
              fontWeight: 600,
              lineHeight: "1.25rem"
            }}>
              Atención requerida
            </p>
            <p style={{ 
              margin: "0.25rem 0 0 0", 
              color: "#c53030", 
              fontSize: "0.8125rem",
      
              lineHeight: "1.125rem"
            }}>
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}