// src/pages/DashboardPage.tsx
import { useState, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import {
  addTask,
  updateTask,
  updateTaskPriorityAndFolder,
  moveToTrash,
  restoreTask,
  permanentDeleteTask,
  cycleTaskState,
  type Task,
} from "../services/taskService";
import { EmailSummaryButton } from "../components/EmailSummaryButton";
import { TaskFormModal } from "../components/TaskFormModal";
import { CalendarView } from "../components/CalendarView";
import { UserProfileHeader } from "../components/UserProfileHeader";
import { TrashView } from "../components/TrashView";

// Importación de imágenes exactas
import logoImg from "../assets/logo.png";
import dashboarImg from "../assets/hogar.png";
import relojParedImg from "../assets/reloj-de-pared.png";
import repeticionImg from "../assets/repeticion.png";
import verificacionImg from "../assets/verificacion.png";
import sirenaImg from "../assets/sirena.png";
import calendarioImg from "../assets/calendario.png";
import papeleraImg from "../assets/papelera.png";
import logoTareasImg from "../assets/logo_tareas.png";

import coheteImg from "../assets/Cohete brillante despegando hacia las estrellas(1).png";
import resumenImg from "../assets/economia.png";
import pendienteImg from "../assets/reloj.png";
import ideaImg from "../assets/idea.png";
import boligrafoImg from "../assets/boligrafo.png";

export function DashboardPage(): JSX.Element {
  const { user, logout } = useAuth();
  const { folderName } = useParams();
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isCalendarView = window.location.pathname === "/calendar";
  const isTrashView = window.location.pathname === "/papelera";
  const currentFolder = folderName
    ? folderName.charAt(0).toUpperCase() + folderName.slice(1).replace("-", " ")
    : "Todas";

  const { tasks, loading, refetch } = useTasks(user?.uid || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const activeTasks = tasks.filter(t => !t.isDeleted);
  const trashTasks = tasks.filter(t => t.isDeleted);

  const handleCreateOrUpdateTask = async (taskData: any, taskId?: string) => {
    if (!user) return;
    if (taskId) {
      await updateTask(taskId, taskData);
    } else {
      await addTask({ ...taskData, userId: user.uid });
    }
    setTaskToEdit(null);
    refetch();
  };
  const handlePriorityChange = async (task: Task, nuevaPrioridad: string) => {
    try {
      await updateTaskPriorityAndFolder(task.id, nuevaPrioridad, task.folder, task.completed);
      await refetch();
    } catch (err) {
      console.error("Error al actualizar prioridad en Firestore:", err);
      alert("No se pudo guardar el cambio de prioridad en Firestore. Revisá la consola.");
    }
  };
  const handleCycleState = async (task: Task) => {
    try {
      await cycleTaskState(task.id, task.folder || "Pendientes");
      await refetch();
    } catch (err) {
      console.error("Error al cambiar estado en Firestore:", err);
      alert("No se pudo cambiar el estado en Firestore. Revisá la consola.");
    }
  };
  const folderFilteredTasks = currentFolder === "Todas"
    ? activeTasks
    : activeTasks.filter(t => (t.folder || "Pendientes").toLowerCase() === currentFolder.toLowerCase());

  const filteredTasks = folderFilteredTasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const completadasCount = activeTasks.filter(t => t.completed || t.folder === "Completadas").length;
  const enProcesoCount = activeTasks.filter(
    t => !(t.completed || t.folder === "Completadas") && (t.folder || "").toLowerCase() === "en proceso"
  ).length;
  const pendientesCount = Math.max(0, activeTasks.length - completadasCount - enProcesoCount);
  const totalTasks = activeTasks.length;
  return (
    <div className="dashboard-layout">

      {/* Capa oscura de fondo cuando el menú móvil está abierto */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* 1. BARRA LATERAL DESLIZANTE */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div>
          {/* Logo institucional */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }} onClick={() => { navigate("/"); setIsSidebarOpen(false); }}>
              <img src={logoImg} alt="MateCode Logo" style={{ width: "72px", height: "72px", objectFit: "contain" }} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#fff" }}>MateCode</h2>
              <span style={{ fontSize: "0.65rem", color: "#bfdbfe" }}>Aplicaciones Web para tu Empresa</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{ display: "none", background: "transparent", border: "none", color: "#fff", fontSize: "1.25rem", cursor: "pointer" }}
              className="close-sidebar-btn"
            >
              ✕
            </button>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#bfdbfe", fontWeight: 700, marginBottom: "0.75rem", letterSpacing: "0.5px" }}>Carpetas de Tareas</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {[
                { name: "Principal", path: "/tasks", icon: dashboarImg },
                { name: "Pendientes", path: "/tasks/pendientes", icon: relojParedImg },
                { name: "En Proceso", path: "/tasks/en-proceso", icon: repeticionImg },
                { name: "Completadas", path: "/tasks/completadas", icon: verificacionImg },
                { name: "Urgentes", path: "/tasks/urgentes", icon: sirenaImg },
                { name: "Calendario", path: "/calendar", icon: calendarioImg },
                { name: "Papelera", path: "/papelera", icon: papeleraImg }
              ].map(folder => {
                const isActive = window.location.pathname === folder.path;
                return (
                  <li
                    key={folder.name}
                    onClick={() => { navigate(folder.path); setIsSidebarOpen(false); }}
                    style={{
                      padding: "0.7rem 0.9rem",
                      borderRadius: "10px",
                      cursor: "pointer",
                      backgroundColor: isActive ? "rgba(255, 255, 255, 0.25)" : "transparent",
                      color: "#fff",
                      fontWeight: isActive ? 600 : 400,
                      fontSize: "0.9rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      transition: "background 0.2s"
                    }}
                  >
                    <img src={folder.icon} alt={folder.name} style={{ width: "22px", height: "22px", objectFit: "contain" }} />
                    {folder.name}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <button onClick={logout} className="cssbuttons-io-button">
          Cerrar Sesión
          <div className="icon">
            <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path d="M7.828 11H20v2H7.828l5.364 5.364-1.414 1.414L4 12l7.778-7.778 1.414 1.414z" fill="currentColor"></path>
            </svg>
          </div>
        </button>
      </aside>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="dashboard-main">

        {/* Columna Central */}
        <div>
          <button
            className="mobile-menu-btn"
            style={{ marginBottom: "1rem" }}
            onClick={() => setIsSidebarOpen(true)}
          >
            ☰
          </button>

          {/* Cabecera Responsiva */}
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, color: "#0f172a", wordBreak: "break-word" }}>
                ¡Hola, {user?.displayName || user?.email?.split("@")[0] || "Usuario"}! 👋
              </h1>
              <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "0.25rem 0 0 0" }}>Bienvenido de nuevo a tu espacio de trabajo.</p>
            </div>

            <div style={{ width: "100%", maxWidth: "100%" }}>
              <UserProfileHeader user={user} />
            </div>
          </header>

          {/* Banner Principal Responsivo */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem", background: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)", padding: "1.25rem", borderRadius: "16px", color: "#fff", boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.3)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <img src={coheteImg} alt="Cohete" style={{ width: "28px", height: "28px", objectFit: "contain" }} />
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, lineHeight: "1.3" }}>Gestioná tus tareas de forma simple y eficiente</h3>
              </div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#bfdbfe" }}>Organizá, priorizá y avanzá en tus proyectos.</p>
            </div>
            <button
              onClick={() => {
                setTaskToEdit(null);
                setIsModalOpen(true);
              }}
              style={{ width: "100%", padding: "0.7rem", backgroundColor: "#fff", color: "#1e3a8a", border: "none", borderRadius: "10px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}
            >
              + Nueva Tarea
            </button>
          </div>

          {isCalendarView ? (
            <CalendarView tasks={activeTasks} />
          ) : isTrashView ? (
            <TrashView
              trashTasks={trashTasks}
              onRestore={(task) => restoreTask(task.id).then(refetch)}
              onPermanentDelete={(taskId) => permanentDeleteTask(taskId).then(refetch)}
            />
          ) : (
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <img src={logoTareasImg} alt="Tareas" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
                  <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#0f172a", fontWeight: 700 }}>
                    {currentFolder === "Todas" ? "Tus Tareas Registradas" : `Carpeta: ${currentFolder}`}
                  </h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fff", padding: "0.35rem 0.75rem", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar tareas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: "0.85rem", color: "#1e293b", backgroundColor: "transparent", width: "130px" }}
                  />
                </div>
              </div>

              {loading ? (
                <p style={{ color: "#64748b" }}>Cargando tareas...</p>
              ) : filteredTasks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <p style={{ color: "#64748b", margin: 0 }}>No hay tareas para mostrar.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {filteredTasks.map(task => {
                    const isCompleted = task.completed || task.folder === "Completadas";
                    const isInProgress = task.folder === "En Proceso";

                    const getCheckboxStyle = () => {
                      if (isCompleted) return { bg: "#10b981", border: "#10b981" };
                      if (isInProgress) return { bg: "#9333ea", border: "#9333ea" };
                      return { bg: "transparent", border: "#2563eb" };
                    };

                    const currentCheck = getCheckboxStyle();
                    const effectivePriority = task.priority || (task.folder === "Urgentes" ? "Urgente" : "Media");

                    return (
                      <div
                        key={task.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          backgroundColor: "#fff",
                          padding: "1.1rem 1.25rem",
                          borderRadius: "14px",
                          border: "1px solid #e2e8f0",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)",
                          flexWrap: "wrap",
                          gap: "0.75rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "200px" }}>
                          {/* Botón cíclico interactivo */}
                          <button
                            type="button"
                            className="task-status-checkbox"
                            onClick={async () => {
                              try {
                                await cycleTaskState(task.id, task.folder || "Pendientes");
                                await refetch();
                              } catch (err) {
                                console.error("Error al cambiar estado:", err);
                              }
                            }}
                            title={`Estado: ${task.folder || "Pendientes"}. Haz clic para cambiar.`}
                            style={{
                              width: "20px",
                              height: "20px",
                              minWidth: "20px",
                              maxWidth: "20px",
                              flex: "0 0 20px",
                              borderRadius: "6px",
                              border: `2px solid ${currentCheck.border}`,
                              backgroundColor: currentCheck.bg,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: 0,
                              transition: "background-color 0.2s, border-color 0.2s",
                              flexShrink: 0,
                            }}
                          >
                            <svg width="11" height="9" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1.5 4L4 6.5L8.5 1.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>

                          <div>
                            <span style={{ textDecoration: "none", color: isCompleted ? "#080808" : "#0f172a", fontWeight: 600, display: "block", fontSize: "0.95rem" }}>
                              {task.title}
                            </span>
                            {task.description && <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{task.description}</span>}
                            <div style={{ display: "flex", gap: "0.75rem", marginTop: "4px", flexWrap: "wrap" }}>
                              {task.dueDate && <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 500 }}>📅 Vence: {task.dueDate}</span>}
                              <span style={{ fontSize: "0.75rem", color: "#64748b", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px" }}>📁 {task.folder || "Pendientes"}</span>
                            </div>
                          </div>
                        </div>

                        {/* Contenedor único de acciones */}
                        <div className="task-card-actions" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <select
                            className="task-priority-select"
                            value={effectivePriority}
                            onChange={async (e) => {
                              const nuevaPrioridad = e.target.value;
                              try {
                                await updateTaskPriorityAndFolder(
                                  task.id,
                                  nuevaPrioridad,
                                  task.folder,
                                  task.completed
                                );
                                await refetch();
                              } catch (err) {
                                console.error("Error al actualizar prioridad en Firestore:", err);
                              }
                            }}
                            title="Cambiar prioridad"
                            style={{
                              fontSize: "0.75rem",
                              padding: "0.35rem 0.6rem",
                              borderRadius: "8px",
                              backgroundColor:
                                effectivePriority === "Urgente" ? "#fee2e2" :
                                  effectivePriority === "Alta" ? "#ffedd5" :
                                    effectivePriority === "Baja" ? "#f1f5f9" : "#eff6ff",
                              color:
                                effectivePriority === "Urgente" ? "#b91c1c" :
                                  effectivePriority === "Alta" ? "#c2410c" :
                                    effectivePriority === "Baja" ? "#475569" : "#1d4ed8",
                              border: `1px solid ${effectivePriority === "Urgente" ? "#fecaca" :
                                effectivePriority === "Alta" ? "#fed7aa" :
                                  effectivePriority === "Baja" ? "#cbd5e1" : "#bfdbfe"
                                }`,
                              fontWeight: 600,
                              cursor: "pointer",
                              outline: "none"
                            }}
                          >
                            <option value="Baja" style={{ backgroundColor: "#fff", color: "#475569" }}>Baja</option>
                            <option value="Media" style={{ backgroundColor: "#fff", color: "#1d4ed8" }}>Media</option>
                            <option value="Alta" style={{ backgroundColor: "#fff", color: "#c2410c" }}>Alta</option>
                            <option value="Urgente" style={{ backgroundColor: "#fff", color: "#b91c1c" }}>Urgente</option>
                          </select>

                          {/* Botón de Editar con la imagen boligrafo.png */}
                          <button
                            type="button"
                            className="task-edit-btn"
                            onClick={() => {
                              setTaskToEdit(task);
                              setIsModalOpen(true);
                            }}
                            title="Editar tarea"
                          >
                            <img src={boligrafoImg} alt="Editar" />
                          </button>

                          {/* Botón Papelera */}
                          <button
                            type="button"
                            onClick={() => moveToTrash(task.id).then(refetch)}
                            className="bin-button"
                            title="Mover a papelera"
                          >
                            <svg className="bin-top" viewBox="0 0 39 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <line y1="5" x2="39" y2="5" stroke="white" strokeWidth="4"></line>
                              <line x1="12" y1="1.5" x2="26.0357" y2="1.5" stroke="white" strokeWidth="3"></line>
                            </svg>
                            <svg className="bin-bottom" viewBox="0 0 33 39" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <mask id={`path-1-${task.id}`} fill="white">
                                <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
                              </mask>
                              <path d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z" fill="white" mask={`url(#path-1-${task.id})`} />
                              <path d="M12 6L12 29" stroke="white" strokeWidth="4"></path>
                              <path d="M21 6V29" stroke="white" strokeWidth="4"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Columna Derecha (Estadísticas y Correo) */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)", textAlign: "center" }}>
            <h3 style={{ fontSize: "1rem", margin: "0 0 1rem 0", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <img src={resumenImg} alt="Resumen" style={{ width: "20px", height: "20px", objectFit: "contain" }} /> Resumen General
            </h3>

            <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#2563eb", marginBottom: "0.25rem" }}>{totalTasks}</div>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1.25rem 0" }}>Total Registradas</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", textAlign: "center", fontSize: "0.8rem" }}>
              <div style={{ backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "8px" }}>
                <img src={pendienteImg} alt="Pendientes" style={{ width: "16px", height: "16px", margin: "0 auto 2px auto", display: "block" }} />
                <span style={{ display: "block", color: "#d97706", fontWeight: 600, fontSize: "0.75rem" }}>Pendientes</span>
                <b style={{ fontSize: "0.95rem" }}>{pendientesCount}</b>
              </div>
              <div style={{ backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "8px" }}>
                <img src={repeticionImg} alt="En Proceso" style={{ width: "16px", height: "16px", margin: "0 auto 2px auto", display: "block" }} />
                <span style={{ display: "block", color: "#2563eb", fontWeight: 600, fontSize: "0.75rem" }}>En Proceso</span>
                <b style={{ fontSize: "0.95rem" }}>{enProcesoCount}</b>
              </div>
              <div style={{ backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "8px" }}>
                <img src={verificacionImg} alt="Completadas" style={{ width: "16px", height: "16px", margin: "0 auto 2px auto", display: "block" }} />
                <span style={{ display: "block", color: "#059669", fontWeight: 600, fontSize: "0.75rem" }}>Completadas</span>
                <b style={{ fontSize: "0.95rem" }}>{completadasCount}</b>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontSize: "1rem", margin: "0 0 1rem 0", color: "#0f172a" }}>Estado de tus tareas</h3>

            <div style={{ height: "12px", width: "100%", backgroundColor: "#f1f5f9", borderRadius: "99px", display: "flex", overflow: "hidden", marginBottom: "1.25rem" }}>
              <div style={{ width: `${totalTasks ? (pendientesCount / totalTasks) * 100 : 0}%`, backgroundColor: "#f59e0b", transition: "width 0.3s" }} title="Pendientes"></div>
              <div style={{ width: `${totalTasks ? (enProcesoCount / totalTasks) * 100 : 0}%`, backgroundColor: "#3b82f6", transition: "width 0.3s" }} title="En Proceso"></div>
              <div style={{ width: `${totalTasks ? (completadasCount / totalTasks) * 100 : 0}%`, backgroundColor: "#10b981", transition: "width 0.3s" }} title="Completadas"></div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#d97706" }}>🔵 Pendientes</span>
                <b>{pendientesCount}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#2563eb" }}>🔵 En Proceso</span>
                <b>{enProcesoCount}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#10b981" }}>🟢 Completadas</span>
                <b>{completadasCount}</b>
              </div>
              {/* <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#dc2626" }}>🔥 Urgentes</span>
                <b>{urgentesCount}</b>
              </div> */}
            </div>
          </div>

          <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "1.25rem", borderRadius: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <img src={ideaImg} alt="Idea" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "#065f46" }}>Tip del día</h4>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#047857", margin: 0, lineHeight: "1.4" }}>
              Una buena organización te acerca a tus metas. ✨
            </p>
          </div>

          <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "1.2rem" }}>📧</span>
              <h3 style={{ fontSize: "1rem", margin: 0, color: "#0f172a" }}>Resumen por Correo</h3>
            </div>
            <p style={{ fontSize: "0.825rem", color: "#64748b", marginBottom: "1.25rem", lineHeight: "1.4" }}>
              Recibe un reporte detallado con el estado de todas tus tareas directamente en tu correo electrónico configurado con AWS SES.
            </p>

            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <EmailSummaryButton todos={activeTasks} />
            </div>
          </div>

        </aside>

      </main>

      {isModalOpen && (
        <TaskFormModal
          currentFolder={currentFolder === "Todas" ? "Pendientes" : currentFolder}
          userEmail={user?.email || ""}
          taskToEdit={taskToEdit}
          onClose={() => {
            setIsModalOpen(false);
            setTaskToEdit(null);
          }}
          onSubmit={handleCreateOrUpdateTask}
        />
      )}

    </div>
  );
}

export default DashboardPage;


