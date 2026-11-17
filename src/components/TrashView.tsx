// src/components/TrashView.tsx tareas eliminadas de la papelera de reciclaje
import type { JSX } from "react";
import type { Task } from "../services/taskService";

interface TrashViewProps {
  trashTasks: Task[];
  onRestore: (task: Task) => void;
  onPermanentDelete: (taskId: string) => void;
}

export function TrashView({ trashTasks, onRestore, onPermanentDelete }: TrashViewProps): JSX.Element {
  return (
    <section>
      <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#334155" }}>🗑️ Papelera de Tareas</h3>
      {trashTasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
          <p style={{ color: "#64748b", margin: 0 }}>La papelera está vacía.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {trashTasks.map(task => (
            <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", opacity: 0.85 }}>
              <div>
                <span style={{ textDecoration: "line-through", color: "#94a3b8", fontWeight: 600, display: "block" }}>
                  {task.title}
                </span>
                {task.description && <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{task.description}</span>}
              </div>
              
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button 
                  onClick={() => onRestore(task)}
                  style={{ padding: "0.4rem 0.8rem", backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem" }}
                >
                  Restaurar
                </button>
                <button 
                  onClick={() => onPermanentDelete(task.id)}
                  style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem" }}
                >
                  Eliminar definitivo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}