//src/components/EmailSummaryButton.tsx
import { useState } from "react";
 
type Todo = { id: string; title: string; completed: boolean };
type Props = { todos: Todo[]; userEmail: string };
 
function buildSummary(todos: Todo[]) {
  const pendientes = todos.filter((t) => !t.completed).length;
  const completadas = todos.filter((t) => t.completed).length;
  return `Pendientes: ${pendientes}\nCompletadas: ${completadas}`;
}
 
export function EmailSummaryButton({ todos, userEmail }: Props) {
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
 
  async function handleSend() {
    if (Date.now() < cooldownUntil) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: userEmail, subject: "Mis tareas pendientes", body: buildSummary(todos) }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMsg(data?.message ?? "Ocurrió un error al enviar el email.");
        return;
      }
      setStatus("success");
      setCooldownUntil(Date.now() + 60_000);
    } catch {
      setStatus("error");
      setErrorMsg("No se pudo conectar con el servidor.");
    }
  }
 
  const enCooldown = Date.now() < cooldownUntil;
  return (
    <div>
      <button onClick={handleSend} disabled={status === "loading" || enCooldown}>
        {status === "loading" ? "Enviando..." : "Enviar mi resumen"}
      </button>
      {status === "success" && <span style={{ color: "green" }}> ¡Email enviado!</span>}
      {status === "error" && <span style={{ color: "red" }}> {errorMsg}</span>}
    </div>
  );
}
