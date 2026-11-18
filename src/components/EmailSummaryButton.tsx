
// src/components/EmailSummaryButton.tsx
import { useState } from "react";
import { auth } from "../services/firebase";

// Actualizamos el tipo para que acepte opcionalmente la carpeta/estado
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
      {status === "success" && <span style={{ color: "#10b981", display: "block", marginTop: "5px", fontSize: "0.85rem", fontWeight: 600 }}> ✓ {message}</span>}
      {status === "error" && <span style={{ color: "#ef4444", display: "block", marginTop: "5px", fontSize: "0.85rem" }}> {message}</span>}
    </div>
  );
}