// src/components/TrashView.tsx tareas eliminadas de la papelera de reciclaje
// import type { JSX } from "react";
// import type { Task } from "../services/taskService";

// interface TrashViewProps {
//   trashTasks: Task[];
//   onRestore: (task: Task) => void;
//   onPermanentDelete: (taskId: string) => void;
// }

// export function TrashView({ trashTasks, onRestore, onPermanentDelete }: TrashViewProps): JSX.Element {
//   return (
//     <section>
//       <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "#334155" }}>🗑️ Papelera de Tareas</h3>
//       {trashTasks.length === 0 ? (
//         <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
//           <p style={{ color: "#64748b", margin: 0 }}>La papelera está vacía.</p>
//         </div>
//       ) : (
//         <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
//           {trashTasks.map(task => (
//             <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", opacity: 0.85 }}>
//               <div>
//                 <span style={{ textDecoration: "line-through", color: "#94a3b8", fontWeight: 600, display: "block" }}>
//                   {task.title}
//                 </span>
//                 {task.description && <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{task.description}</span>}
//               </div>
              
//               <div style={{ display: "flex", gap: "0.5rem" }}>
//                 <button 
//                   onClick={() => onRestore(task)}
//                   style={{ padding: "0.4rem 0.8rem", backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem" }}
//                 >
//                   Restaurar
//                 </button>
//                 <button 
//                   onClick={() => onPermanentDelete(task.id)}
//                   style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem" }}
//                 >
//                   Eliminar definitivo
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </section>
//   );
// }

// src/components/TrashView.tsx
import { useState, type JSX } from "react";
import type { Task } from "../services/taskService";

interface TrashViewProps {
  trashTasks: Task[];
  onRestore: (task: Task) => void;
  onPermanentDelete: (taskId: string) => void;
}

export function TrashView({ trashTasks, onRestore, onPermanentDelete }: TrashViewProps): JSX.Element {
  const [taskToConfirmDelete, setTaskToConfirmDelete] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!taskToConfirmDelete) return;
    setIsDeleting(true);
    try {
      await onPermanentDelete(taskToConfirmDelete.id);
      setTaskToConfirmDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

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
            <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", padding: "1rem 1.25rem", borderRadius: "12px", border: "1px solid #e2e8f0", opacity: 0.85, flexWrap: "wrap", gap: "0.75rem" }}>
              <div>
                <span style={{ textDecoration: "line-through", color: "#94a3b8", fontWeight: 600, display: "block" }}>
                  {task.title}
                </span>
                {task.description && <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{task.description}</span>}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => onRestore(task)}
                  style={{ padding: "0.4rem 0.8rem", backgroundColor: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem" }}
                >
                  Restaurar
                </button>
                <button
                  type="button"
                  onClick={() => setTaskToConfirmDelete(task)}
                  style={{ padding: "0.4rem 0.8rem", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem" }}
                >
                  Eliminar definitivo
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {taskToConfirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "420px",
              padding: "1.5rem",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.12)",
              color: "#0f172a",
            }}
          >
            <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
              ¿Estás seguro que querés eliminar la tarea?
            </h4>
            <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.875rem", color: "#64748b", lineHeight: 1.45 }}>
              Vas a eliminar permanentemente <strong style={{ color: "#1e293b" }}>"{taskToConfirmDelete.title}"</strong>. Esta acción no se puede deshacer.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem" }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setTaskToConfirmDelete(null)}
                style={{
                  padding: "0.55rem 1rem",
                  backgroundColor: "transparent",
                  color: "#475569",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                style={{
                  padding: "0.55rem 1rem",
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                }}
              >
                {isDeleting ? "Eliminando..." : "Sí, eliminar tarea"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}