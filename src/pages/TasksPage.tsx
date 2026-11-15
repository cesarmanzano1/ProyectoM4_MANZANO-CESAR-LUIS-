//src/pages/TasksPage.tsx
import { useEffect, useMemo, useState } from "react";
import type { Task } from "../types/task";
import { addTask, getTasksByUser, toggleTask, deleteTask } from "../services/taskService";
import { useAuth } from "../context/AuthContext";
import { EmailSummaryButton } from "../components/EmailSummaryButton";

type Props = { uid: string | null };

export function TasksPage({ uid }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { logout } = useAuth();
  const { user } = useAuth();

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
        if (!cancelled) setTasks(data);
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
      const created = await addTask({ title: cleanTitle, userId: uid });
      setTitle("");
      setTasks((prev) => [created, ...prev]);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      if (
        message.toLowerCase().includes("permission") ||
        message.toLowerCase().includes("insufficient")
      ) {
        setError(
          "Permisos insuficientes (permission-denied). Revisá las Firestore Rules y que la query filtre por userId."
        );
        return;
      }
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
      await toggleTask(task.id, !task.completed);
    } catch (e) {
      setTasks(originalTasks);
      setError("No se pudo actualizar la tarea.");
    }
  }

  async function handleDelete(id: string) {
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTask(id);
    } catch (e) {
      setTasks(originalTasks);
      setError("No se pudo eliminar la tarea.");
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
            {user?.email && <EmailSummaryButton todos={tasks} userEmail={user.email} />}

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
                  <li key={t.id} className="task-card">
                    <button
                      type="button"
                      className={`task-check ${t.completed ? "task-check--completed" : ""}`}
                      onClick={() => handleToggle(t)}
                      aria-label={t.completed ? "Marcar como pendiente" : "Marcar como completada"}
                      role="checkbox"
                      aria-checked={t.completed}
                    >
                      {t.completed && (
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="task-check-icon"
                        >
                          <path
                            d="M1.5 4L4 6.5L8.5 1.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </button>

                    <span className={`task-title ${t.completed ? "task-title--completed" : ""}`}>
                      {t.title}
                    </span>

                    <button
                      type="button"
                      className="task-delete"
                      onClick={() => handleDelete(t.id)}
                      aria-label="Eliminar tarea"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
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
