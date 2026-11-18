//src/pages/TasksPage.tsx
// import { useEffect, useMemo, useState } from "react";
// import type { Task } from "../types/task";
// import { addTask, getTasksByUser, toggleTaskStatus, deleteTask, updateTaskTitle } from "../services/taskService";
// import { useAuth } from "../context/AuthContext";
// import { EmailSummaryButton } from "../components/EmailSummaryButton";

// type Props = { uid: string | null };

// export function TasksPage({ uid }: Props) {
//   const [tasks, setTasks] = useState<Task[]>([]);
//   const [title, setTitle] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   // Estados para la edición de tareas
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [editingText, setEditingText] = useState("");

//   const { logout } = useAuth();
//   const { user } = useAuth();

//   const canSubmit = useMemo(() => {
//     return Boolean(uid) && title.trim().length > 0 && !loading;
//   }, [uid, title, loading]);

//   const formattedDate = useMemo(() => {
//     const date = new Date();
//     return date.toLocaleDateString("es-AR", {
//       weekday: "long",
//       day: "numeric",
//       month: "long",
//     });
//   }, []);

//   const totalTasks = tasks.length;
//   const completedTasks = tasks.filter((t) => t.completed).length;

//   useEffect(() => {
//     if (!uid) {
//       setTasks([]);
//       return;
//     }
//     let cancelled = false;
//     (async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const data = await getTasksByUser(uid);
//         if (!cancelled) setTasks(data as Task[]);
//       } catch (e) {
//         if (!cancelled) setError("No se pudieron cargar las tareas.");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [uid]);

//   async function handleAddTask(e: React.FormEvent) {
//     e.preventDefault();
//     if (!uid) {
//       setError("Necesitás iniciar sesión para crear tareas.");
//       return;
//     }
//     const cleanTitle = title.trim();
//     if (!cleanTitle) return;
//     try {
//       setLoading(true);
//       setError(null);
//       const newTaskId = await addTask({ title: cleanTitle, userId: uid });
//       setTitle("");
//       const newTask: Task = {
//         id: newTaskId,
//         title: cleanTitle,
//         completed: false,
//         userId: uid,
//       };
//       setTasks((prev) => [newTask, ...prev]);
//     } catch (e: unknown) {
//       setError("No se pudo crear la tarea.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleToggle(task: Task) {
//     const originalTasks = [...tasks];
//     setTasks((prev) =>
//       prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
//     );
//     try {
//       await toggleTaskStatus(task.id, task.completed);
//     } catch (e) {
//       setTasks(originalTasks);
//       setError("No se pudo actualizar la tarea.");
//     }
//   }

//   async function handleDelete(id: string) {
//     const originalTasks = [...tasks];
//     setTasks((prev) => prev.filter((t) => t.id !== id));
//     try {
//       await deleteTask(id);
//     } catch (e) {
//       setTasks(originalTasks);
//       setError("No se pudo eliminar la tarea.");
//     }
//   }

//   // Funciones para Editar
//   function startEditing(task: Task) {
//     setEditingId(task.id);
//     setEditingText(task.title);
//   }

//   async function saveEdit(id: string) {
//     if (!editingText.trim()) return;
//     const originalTasks = [...tasks];
    
//     // Actualización optimista en UI
//     setTasks((prev) =>
//       prev.map((t) => (t.id === id ? { ...t, title: editingText.trim() } : t))
//     );
//     setEditingId(null);

//     try {
//       await updateTaskTitle(id, editingText.trim());
//     } catch (e) {
//       setTasks(originalTasks);
//       setError("No se pudo actualizar el título de la tarea.");
//     }
//   }

//   return (
//     <div className="page-center">
//       <div className="tasks-container">
//         <header className="tasks-header">
//           <div className="tasks-header-main">
//             <div>
//               <h1 className="tasks-title">Mis tareas</h1>
//               <p className="tasks-date">{formattedDate}</p>
//             </div>
//             <div className="tasks-status">
//               <span className="tasks-counter">
//                 {completedTasks} de {totalTasks} completadas
//               </span>
//             </div>
//           </div>
//           <div className="tasks-header-actions">
//             <button onClick={logout} className="btn btn-ghost btn-logout">
//               Salir
//             </button>
//           </div>
//         </header>

//         {!uid && <p className="error-message">Iniciá sesión para ver tus tareas.</p>}

//         {uid && (
//           <>
//             <form onSubmit={handleAddTask} className="todo-add-form">
//               <input
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="Nueva tarea..."
//                 className="input"
//                 aria-label="Nueva tarea"
//               />
//               <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
//                 {loading && tasks.length === 0 ? "Guardando..." : "Agregar"}
//               </button>
//             </form>
//             {user?.email && <EmailSummaryButton todos={tasks} userEmail={user.email} />}

//             {error && (
//               <p role="alert" className="error-message">
//                 {error}
//               </p>
//             )}

//             {loading && tasks.length === 0 ? (
//               <div className="skeleton-wrapper">
//                 <div className="skeleton" />
//                 <div className="skeleton" />
//                 <div className="skeleton" />
//               </div>
//             ) : tasks.length === 0 ? (
//               <div className="empty-state">
//                 <span className="empty-state-icon">📋</span>
//                 <p className="empty-state-title">Sin tareas pendientes</p>
//                 <p className="empty-state-text">Agregá tu primera tarea para empezar</p>
//               </div>
//             ) : (
//               <ul className="todo-list">
//                 {tasks.map((t) => (
//                   <li key={t.id} className="task-card" style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "space-between" }}>
//                     <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
//                       <button
//                         type="button"
//                         className={`task-check ${t.completed ? "task-check--completed" : ""}`}
//                         onClick={() => handleToggle(t)}
//                         aria-label={t.completed ? "Marcar como pendiente" : "Marcar como completada"}
//                         role="checkbox"
//                         aria-checked={t.completed}
//                       >
//                         {t.completed && (
//                           <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="task-check-icon">
//                             <path d="M1.5 4L4 6.5L8.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                           </svg>
//                         )}
//                       </button>

//                       {editingId === t.id ? (
//                         <input
//                           type="text"
//                           value={editingText}
//                           onChange={(e) => setEditingText(e.target.value)}
//                           onKeyDown={(e) => e.key === "Enter" && saveEdit(t.id)}
//                           autoFocus
//                           className="input"
//                           style={{ flex: 1, padding: "0.3rem" }}
//                         />
//                       ) : (
//                         <span className={`task-title ${t.completed ? "task-title--completed" : ""}`} style={{ flex: 1 }}>
//                           {t.title}
//                         </span>
//                       )}
//                     </div>

//                     <div style={{ display: "flex", gap: "0.25rem" }}>
//                       {editingId === t.id ? (
//                         <button type="button" onClick={() => saveEdit(t.id)} className="btn btn-primary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}>
//                           Guardar
//                         </button>
//                       ) : (
//                         <button type="button" onClick={() => startEditing(t) } title="Editar tarea" style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1rem" }}>
//                           ✏️
//                         </button>
//                       )}

//                       <button
//                         type="button"
//                         className="task-delete"
//                         onClick={() => handleDelete(t.id)}
//                         aria-label="Eliminar tarea"
//                         style={{ background: "transparent", border: "none", cursor: "pointer" }}
//                       >
//                         🗑️
//                       </button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

//src/pages/TasksPage.tsx
import { useEffect, useMemo, useState } from "react";
import type { Task } from "../services/taskService";
import { addTask, getTasksByUser, toggleTaskStatus, moveToTrash } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import { EmailSummaryButton } from "../components/EmailSummaryButton";

type Props = { uid: string | null };

export function TasksPage({ uid }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { logout, user } = useAuth();

  const canSubmit = useMemo(() => {
    return Boolean(uid) && title.trim().length > 0 && !loading;
  }, [uid, title, loading]);

  const formattedDate = useMemo(() => {
    const date = new Date();
    return date.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, []);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  useEffect(() => {
    if (!uid) {
      setTasks([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTasksByUser(uid);
        // Filtramos para mostrar solo las que no están eliminadas (papelera)
        if (!cancelled) setTasks(data.filter(t => !t.isDeleted));
      } catch (e) {
        if (!cancelled) setError("No se pudieron cargar las tareas.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!uid) {
      setError("Necesitás iniciar sesión para crear tareas.");
      return;
    }
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    try {
      setLoading(true);
      setError(null);
      
      const newTaskId = await addTask({ 
        title: cleanTitle, 
        userId: uid, 
        folder: "Pendientes",
        priority: "Media"
      });
      
      setTitle("");
      const newTask: Task = {
        id: newTaskId,
        title: cleanTitle,
        completed: false,
        folder: "Pendientes",
        priority: "Media",
        userId: uid,
        isDeleted: false,
      };
      setTasks((prev) => [newTask, ...prev]);
    } catch (e: unknown) {
      setError("No se pudo crear la tarea.");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(task: Task) {
    const originalTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    );
    try {
      await toggleTaskStatus(task.id, task.completed, task.folder || "Pendientes");
    } catch (e) {
      setTasks(originalTasks);
      setError("No se pudo actualizar la tarea.");
    }
  }

  async function handleDelete(id: string) {
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      // Enviamos a la papelera usando moveToTrash en lugar de deleteTask
      await moveToTrash(id);
    } catch (e) {
      setTasks(originalTasks);
      setError("No se pudo enviar la tarea a la papelera.");
    }
  }

  return (
    <div className="page-center">
      <div className="tasks-container">
        <header className="tasks-header">
          <div className="tasks-header-main">
            <div>
              <h1 className="tasks-title">Mis tareas</h1>
              <p className="tasks-date">{formattedDate}</p>
            </div>
            <div className="tasks-status">
              <span className="tasks-counter">
                {completedTasks} de {totalTasks} completadas
              </span>
            </div>
          </div>
          <div className="tasks-header-actions">
            <button onClick={logout} className="btn btn-ghost btn-logout">
              Salir
            </button>
          </div>
        </header>

        {!uid && <p className="error-message">Iniciá sesión para ver tus tareas.</p>}

        {uid && (
          <>
            <form onSubmit={handleAddTask} className="todo-add-form">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nueva tarea..."
                className="input"
                aria-label="Nueva tarea"
              />
              <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                {loading && tasks.length === 0 ? "Guardando..." : "Agregar"}
              </button>
            </form>
                {user?.email && <EmailSummaryButton todos={tasks} />}
            {error && (
              <p role="alert" className="error-message">
                {error}
              </p>
            )}

            {loading && tasks.length === 0 ? (
              <div className="skeleton-wrapper">
                <div className="skeleton" />
                <div className="skeleton" />
                <div className="skeleton" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-icon">📋</span>
                <p className="empty-state-title">Sin tareas pendientes</p>
                <p className="empty-state-text">Agregá tu primera tarea para empezar</p>
              </div>
            ) : (
              <ul className="todo-list">
                {tasks.map((t) => (
                  <li key={t.id} className="task-card" style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                      <button
                        type="button"
                        className={`task-check ${t.completed ? "task-check--completed" : ""}`}
                        onClick={() => handleToggle(t)}
                        aria-label={t.completed ? "Marcar como pendiente" : "Marcar como completada"}
                        role="checkbox"
                        aria-checked={t.completed}
                      >
                        {t.completed && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="task-check-icon">
                            <path d="M1.5 4L4 6.5L8.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>

                      <span className={`task-title ${t.completed ? "task-title--completed" : ""}`} style={{ flex: 1 }}>
                        {t.title}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.25rem" }}>
                      <button
                        type="button"
                        className="task-delete"
                        onClick={() => handleDelete(t.id)}
                        aria-label="Mover a papelera"
                        title="Mover a papelera"
                        style={{ background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        🗑️
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default TasksPage;