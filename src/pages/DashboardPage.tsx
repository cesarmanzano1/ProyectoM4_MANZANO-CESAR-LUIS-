
// src/pages/DashboardPage.tsx
import { useState, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";
import { addTask, updateTask, updateTaskPriority, cycleTaskState, moveToTrash, restoreTask, permanentDeleteTask } from "../services/taskService";
import { EmailSummaryButton } from "../components/EmailSummaryButton";
import { TaskFormModal } from "../components/TaskFormModal";
import { CalendarView } from "../components/CalendarView";
import { UserProfileHeader } from "../components/UserProfileHeader";
import { TrashView } from "../components/TrashView";
import { TaskCard } from "../components/TaskCard"; // <-- Importamos el componente modular

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
import correoImg from "../assets/correo.png";

import coheteImg from "../assets/Cohete brillante despegando hacia las estrellas(1).png";
import resumenImg from "../assets/economia.png";
import pendienteImg from "../assets/reloj.png";
import ideaImg from "../assets/idea.png";
import cheque from "../assets/cheque.png";
import proce from "../assets/actualizar.png";

export function DashboardPage(): JSX.Element {
  const { user, logout } = useAuth();
  const { folderName } = useParams();
  const navigate = useNavigate();

  const isCalendarView = window.location.pathname === "/calendar";
  const isTrashView = window.location.pathname === "/trash";
  const currentFolder = folderName
    ? folderName.charAt(0).toUpperCase() + folderName.slice(1).replace("-", " ")
    : "Todas";

  const { tasks, loading, refetch } = useTasks(user?.uid || "");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null); // Guardar tarea a editar
  const [searchQuery, setSearchQuery] = useState("");

  const activeTasks = tasks.filter(t => !t.isDeleted);
  const trashTasks = tasks.filter(t => t.isDeleted);

  const folderFilteredTasks = currentFolder === "Todas"
   ? activeTasks
    : currentFolder === "Urgentes"
      ? activeTasks.filter(t => t.priority === "Urgente") // <-- Si es la carpeta Urgentes, filtra por prioridad
      : activeTasks.filter(t => (t.folder || "Pendientes").toLowerCase() === currentFolder.toLowerCase());

  const filteredTasks = folderFilteredTasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendientesCount = activeTasks.filter(t => (t.folder || "Pendientes") === "Pendientes" && !t.completed).length;
  const enProcesoCount = activeTasks.filter(t => (t.folder || "").toLowerCase() === "en proceso").length;
  const completadasCount = activeTasks.filter(t => t.completed || t.folder === "Completadas").length;
  const urgentesCount = activeTasks.filter(t => t.folder === "Urgentes").length;
  const totalTasks = activeTasks.length;
  const motivationalTips = [
    "Una buena organización te acerca a tus metas. ",
    "Pequeños avances diarios suman grandes resultados. ",
    "Prioriza lo importante y conquista tu día. ",
    "El éxito es la suma de pequeños esfuerzos repetidos. ",
    "Mantén el foco y haz que suceda. "
  ];

  // Selecciona un tip aleatorio al montar la página o iniciar sesión
  const randomTip = motivationalTips[Math.floor(Math.random() * motivationalTips.length)];

  // Manejador unificado para crear o actualizar tareas desde el modal
  const handleSaveTask = async (taskData: any, taskId?: string) => {
    if (!user) return;
    if (taskId) {
      await updateTask(taskId, taskData);
    } else {
      await addTask({ ...taskData, userId: user.uid });
    }
    refetch();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f0f4f8", color: "#1e293b", fontFamily: "sans-serif" }}>

      {/* 1. BARRA LATERAL */}
      <aside style={{ width: "260px", background: "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 100%)", padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff", boxShadow: "4px 0 15px rgba(0,0,0,0.05)" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem", cursor: "pointer" }} onClick={() => navigate("/")}>
            <img src={logoImg} alt="MateCode Logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#fff" }}>MateCode</h2>
              <span style={{ fontSize: "0.65rem", color: "#bfdbfe" }}>Aplicaciones Web para tu Empresa</span>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#bfdbfe", fontWeight: 700, marginBottom: "0.75rem", letterSpacing: "0.5px" }}>Carpetas de Tareas</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {[
                { name: "Dashboard", path: "/", icon: dashboarImg },
                { name: "Pendientes", path: "/folder/pendientes", icon: relojParedImg },
                { name: "En Proceso", path: "/folder/en-proceso", icon: repeticionImg },
                { name: "Completadas", path: "/folder/completadas", icon: verificacionImg },
                { name: "Urgentes", path: "/folder/urgentes", icon: sirenaImg },
                { name: "Calendario", path: "/calendar", icon: calendarioImg },
                { name: "Papelera", path: "/trash", icon: papeleraImg }
              ].map(folder => {
                const isActive = window.location.pathname === folder.path;
                return (
                  <li
                    key={folder.name}
                    onClick={() => navigate(folder.path)}
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
    <div style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", border: "1px solid rgba(255, 255, 255, 0.2)", padding: "1.2rem 1rem", borderRadius: "12px", textAlign: "center", marginBottom: "1rem" }}>
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
    <img src={ideaImg} alt="Idea" style={{ width: "26px", height: "26px", objectFit: "contain" }} />
    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, margin: 0, color: "#fff" }}>Tip del día</h4>
  </div>
  <p style={{ fontSize: "0.75rem", color: "#d7e2ef", margin: 0, lineHeight: "1.4", padding: "0 0.25rem" }}>
    {randomTip}
  </p>
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
      <main style={{ flex: 1, padding: "2.5rem", overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem" }}>
        <div>
          <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <div>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
                ¡Hola, {user?.displayName || user?.email?.split("@")[0] || "Usuario"}! 👋
              </h1>
              <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>Bienvenido de nuevo a tu espacio de trabajo.</p>
            </div>
            <UserProfileHeader user={user} />
          </header>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", background: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)", padding: "1.5rem 2rem", borderRadius: "20px", color: "#fff", boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.3)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
                <img src={coheteImg} alt="Cohete" style={{ width: "60px", height: "60px", objectFit: "contain" }} />
                <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Gestioná tus tareas de forma simple y eficiente</h3>
              </div>
              <p style={{ margin: 0, alignItems: "center",fontSize: "0.85rem", color: "#bfdbfe" }}>Organizá, priorizá y avanzá en tus proyectos.</p>
            </div>
            <button
              onClick={() => { setEditingTask(null); setIsModalOpen(true); }}
              style={{ padding: "0.75rem 1.5rem", backgroundColor: "#fff", color: "#1e3a8a", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <img src={logoTareasImg} alt="Tareas" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
                  <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#0f172a", fontWeight: 700 }}>
                    {currentFolder === "Todas" ? "Tus Tareas Registradas" : `Carpeta: ${currentFolder}`}
                  </h3>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fff", padding: "0.35rem 0.75rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>🔍</span>
                  <input
                    type="text"
                    placeholder="Buscar tareas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: "none", outline: "none", fontSize: "0.85rem", color: "#1e293b", backgroundColor: "transparent", width: "160px" }}
                  />
                </div>
              </div>

              {loading ? (
                <p style={{ color: "#64748b" }}>Cargando tareas...</p>
              ) : filteredTasks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
                  <p style={{ color: "#64748b", margin: 0 }}>No hay tareas para mostrar.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {filteredTasks.map(task => (
                   <TaskCard
    key={task.id}
    task={task}
    onToggleStatus={(t) => cycleTaskState(t.id, t.folder).then(refetch)}
    onEdit={(t) => { setEditingTask(t); setIsModalOpen(true); }}
    onDelete={(id) => moveToTrash(id).then(refetch)}
    onUpdatePriority={(id, newPriority) => updateTaskPriority(id, newPriority).then(refetch)} // <-- Conectado
  />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        {/* Columna Derecha de Estadísticas */}
        <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", textAlign: "center" }}>
            <h3 style={{ fontSize: "1rem", margin: "0 0 1rem 0", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <img src={resumenImg} alt="Resumen" style={{ width: "20px", height: "20px", objectFit: "contain" }} /> Resumen General
            </h3>
            <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#2563eb", marginBottom: "0.25rem" }}>{totalTasks}</div>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1.25rem 0" }}>Total Registradas</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", textAlign: "center", fontSize: "0.8rem" }}>
              <div style={{ backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "8px" }}>
                <img src={pendienteImg} alt="Pendientes" style={{ width: "16px", height: "16px", margin: "0 auto 2px auto", display: "block" }} />
                <span style={{ display: "block", color: "#2563eb", fontWeight: 600, fontSize: "0.75rem" }}>Pendientes</span>
                <b style={{ fontSize: "0.95rem" }}>{pendientesCount}</b>
              </div>
              <div style={{ backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "8px" }}>
                <img src={proce} alt="En Proceso" style={{ width: "16px", height: "16px", margin: "0 auto 2px auto", display: "block" }} />
                <span style={{ display: "block", color: "#9333ea", fontWeight: 600, fontSize: "0.75rem" }}>En Proceso</span>
                <b style={{ fontSize: "0.95rem" }}>{enProcesoCount}</b>
              </div>
              <div style={{ backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "8px" }}>
                <img src={cheque} alt="Completadas" style={{ width: "16px", height: "16px", margin: "0 auto 2px auto", display: "block" }} />
                <span style={{ display: "block", color: "#059669", fontWeight: 600, fontSize: "0.75rem" }}>Completadas</span>
                <b style={{ fontSize: "0.95rem" }}>{completadasCount}</b>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <img src={correoImg} alt="Correo" style={{ width: "35px", height: "35px", objectFit: "contain" }} />
              <h3 style={{ fontSize: "1rem", margin: 0, color: "#0f172a" }}>Resumen por Correo</h3>
            </div>
            <p style={{ fontSize: "0.825rem", color: "#64748b", marginBottom: "1.25rem", lineHeight: "1.4" }}>
              Recibe un reporte detallado con el estado de todas tus tareas directamente en tu correo electrónico.
            </p>
            <EmailSummaryButton todos={activeTasks} userEmail={user?.email || ""} />
          </div>
        </aside>
      </main>

      {/* Modal para Crear o Editar */}
      {isModalOpen && (
        <TaskFormModal
          currentFolder={currentFolder === "Todas" ? "Pendientes" : currentFolder}
          userEmail={user?.email || ""}
          taskToEdit={editingTask}
          onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
          onSubmit={handleSaveTask}
        />
      )}
    </div>
  );
}

export default DashboardPage;
// import { useState, type JSX } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { useTasks } from "../hooks/useTasks";
// import { addTask, toggleTaskStatus, moveToTrash, restoreTask, permanentDeleteTask } from "../services/taskService";
// import { EmailSummaryButton } from "../components/EmailSummaryButton";
// import { TaskFormModal } from "../components/TaskFormModal";
// import { CalendarView } from "../components/CalendarView";
// import { UserProfileHeader } from "../components/UserProfileHeader";
// import { TrashView } from "../components/TrashView";

// // Importación de imágenes exactas
// import logoImg from "../assets/logo.png";
// import dashboarImg from "../assets/hogar.png";
// import relojParedImg from "../assets/reloj-de-pared.png";
// import repeticionImg from "../assets/repeticion.png";
// import verificacionImg from "../assets/verificacion.png";
// import sirenaImg from "../assets/sirena.png";
// import calendarioImg from "../assets/calendario.png";
// import papeleraImg from "../assets/papelera.png";
// import logoTareasImg from "../assets/logo_tareas.png";

// import coheteImg from "../assets/Cohete brillante despegando hacia las estrellas(1).png";
// import resumenImg from "../assets/economia.png";
// import pendienteImg from "../assets/reloj.png";
// import ideaImg from "../assets/idea.png";
// import cheque from "../assets/cheque.png";
// import proce from "../assets/actualizar.png";
// import boligrafoImg from "../assets/boligrafo.png";

// export function DashboardPage(): JSX.Element {
//   const { user, logout } = useAuth();
//   const { folderName } = useParams();
//   const navigate = useNavigate();

//   const isCalendarView = window.location.pathname === "/calendar";
//   const isTrashView = window.location.pathname === "/trash";
//   const currentFolder = folderName
//     ? folderName.charAt(0).toUpperCase() + folderName.slice(1).replace("-", " ")
//     : "Todas";

//   const { tasks, loading, refetch } = useTasks(user?.uid || "");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");

//   const activeTasks = tasks.filter(t => !t.isDeleted);
//   const trashTasks = tasks.filter(t => t.isDeleted);

//   const folderFilteredTasks = currentFolder === "Todas"
//     ? activeTasks
//     : activeTasks.filter(t => (t.folder || "Pendientes").toLowerCase() === currentFolder.toLowerCase());

//   const filteredTasks = folderFilteredTasks.filter(t =>
//     t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
//   );

//   const pendientesCount = activeTasks.filter(t => (t.folder || "Pendientes") === "Pendientes" && !t.completed).length;
//   const enProcesoCount = activeTasks.filter(t => (t.folder || "").toLowerCase() === "en proceso").length;
//   const completadasCount = activeTasks.filter(t => t.completed || t.folder === "Completadas").length;
//   const urgentesCount = activeTasks.filter(t => t.folder === "Urgentes").length;
//   const totalTasks = activeTasks.length;

//   const handleCreateNewTask = async (taskData: any) => {
//     if (!user) return;
//     await addTask({ ...taskData, userId: user.uid });
//     refetch();
//   };

//   return (
//     <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f0f4f8", color: "#1e293b", fontFamily: "sans-serif" }}>

//       {/* 1. BARRA LATERAL CON DEGRADADO AZUL MODERNO */}
//       <aside style={{ width: "260px", background: "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 100%)", padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between", color: "#fff", boxShadow: "4px 0 15px rgba(0,0,0,0.05)" }}>
//         <div>
//           {/* Logo institucional */}
//           <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2.5rem", cursor: "pointer" }} onClick={() => navigate("/")}>
//             <img
//               src={logoImg}
//               alt="MateCode Logo"
//               style={{
//                 width: "42px",
//                 height: "42px",
//                 objectFit: "contain"
//               }}
//             />            <div>
//               <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#fff" }}>MateCode</h2>
//               <span style={{ fontSize: "0.65rem", color: "#bfdbfe" }}>Aplicaciones Web para tu Empresa</span>
//             </div>
//           </div>

//           <div style={{ marginBottom: "1.5rem" }}>
//             <p style={{ fontSize: "0.75rem", textTransform: "uppercase", color: "#bfdbfe", fontWeight: 700, marginBottom: "0.75rem", letterSpacing: "0.5px" }}>Carpetas de Tareas</p>
//             <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
//               {[
//                 { name: "Dashboard", path: "/", icon: dashboarImg },
//                 { name: "Pendientes", path: "/folder/pendientes", icon: relojParedImg },
//                 { name: "En Proceso", path: "/folder/en-proceso", icon: repeticionImg },
//                 { name: "Completadas", path: "/folder/completadas", icon: verificacionImg },
//                 { name: "Urgentes", path: "/folder/urgentes", icon: sirenaImg },
//                 { name: "Calendario", path: "/calendar", icon: calendarioImg },
//                 { name: "Papelera", path: "/trash", icon: papeleraImg }
//               ].map(folder => {
//                 const isActive = window.location.pathname === folder.path;
//                 return (
//                   <li
//                     key={folder.name}
//                     onClick={() => navigate(folder.path)}
//                     style={{
//                       padding: "0.7rem 0.9rem",
//                       borderRadius: "10px",
//                       cursor: "pointer",
//                       backgroundColor: isActive ? "rgba(255, 255, 255, 0.25)" : "transparent",
//                       color: "#fff",
//                       fontWeight: isActive ? 600 : 400,
//                       fontSize: "0.9rem",
//                       display: "flex",
//                       alignItems: "center",
//                       gap: "0.75rem",
//                       transition: "background 0.2s"
//                     }}
//                   >
//                     {/* AQUÍ ESTABA EL ERROR: Se quitó el filtro brightness/invert para que se vean los iconos a color */}
//                     <img src={folder.icon} alt={folder.name} style={{ width: "22px", height: "22px", objectFit: "contain" }} />
//                     {folder.name}
//                   </li>
//                 );
//               })}
//             </ul>
//           </div>
//         </div>

//         {/* Tarjeta decorativa inferior con logo_tareas.png */}
//         <div style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", padding: "1rem", borderRadius: "12px", textAlign: "center", marginBottom: "1rem" }}>
//           <img src={logoTareasImg} alt="Logo Tareas" style={{ width: "36px", height: "36px", marginBottom: "0.5rem", objectFit: "contain" }} />
//           <p style={{ fontSize: "0.75rem", margin: 0, color: "#bfdbfe", lineHeight: "1.3" }}>Organizá tus tareas, lográ tus objetivos.</p>
//         </div>

//         <button
//           onClick={logout}
//           className="cssbuttons-io-button"
//         >
//           Cerrar Sesión
//           <div className="icon">
//             <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path d="M0 0h24v24H0z" fill="none"></path>
//               <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor"></path>
//             </svg>
//           </div>
//         </button>
//       </aside>

//       {/* 2. CONTENIDO PRINCIPAL */}
//       <main style={{ flex: 1, padding: "2.5rem", overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem" }}>

//         {/* Columna Central */}
//         <div>
//           <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
//             <div>
//               <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0, color: "#0f172a" }}>
//                 ¡Hola, {user?.displayName || user?.email?.split("@")[0] || "Usuario"}! 👋
//               </h1>
//               <p style={{ color: "#64748b", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>Bienvenido de nuevo a tu espacio de trabajo.</p>
//             </div>

//             <UserProfileHeader user={user} />
//           </header>

//           {/* Banner Principal */}
//           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", background: "linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)", padding: "1.5rem 2rem", borderRadius: "20px", color: "#fff", boxShadow: "0 10px 20px -5px rgba(37, 99, 235, 0.3)" }}>
//             <div>
//               <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.3rem" }}>
//                 <img src={coheteImg} alt="Cohete" style={{ width: "32px", height: "32px", objectFit: "contain" }} />
//                 <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Gestioná tus tareas de forma simple y eficiente</h3>
//               </div>
//               <p style={{ margin: 0, fontSize: "0.85rem", color: "#bfdbfe" }}>Organizá, priorizá y avanzá en tus proyectos.</p>
//             </div>
//             <button
//               onClick={() => setIsModalOpen(true)}
//               style={{ padding: "0.75rem 1.5rem", backgroundColor: "#fff", color: "#1e3a8a", border: "none", borderRadius: "12px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)", transition: "transform 0.1s" }}
//             >
//               + Nueva Tarea
//             </button>
//           </div>

//           {isCalendarView ? (
//             <CalendarView tasks={activeTasks} />
//           ) : isTrashView ? (
//             <TrashView
//               trashTasks={trashTasks}
//               onRestore={(task) => restoreTask(task.id).then(refetch)}
//               onPermanentDelete={(taskId) => permanentDeleteTask(taskId).then(refetch)}
//             />
//           ) : (
//             <section>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
//                   <img src={logoTareasImg} alt="Tareas" style={{ width: "22px", height: "22px", objectFit: "contain" }} />
//                   <h3 style={{ fontSize: "1.1rem", margin: 0, color: "#0f172a", fontWeight: 700 }}>
//                     {currentFolder === "Todas" ? "Tus Tareas Registradas" : `Carpeta: ${currentFolder}`}
//                   </h3>
//                 </div>

//                 {/* ÚNICO BUSCADOR FUNCIONAL CONECTADO AL ESTADO */}
//                 <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#fff", padding: "0.35rem 0.75rem", borderRadius: "10px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
//                   <span style={{ color: "#94a3b8", fontSize: "0.9rem" }}>🔍</span>
//                   <input
//                     type="text"
//                     placeholder="Buscar tareas..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     style={{ border: "none", outline: "none", fontSize: "0.85rem", color: "#1e293b", backgroundColor: "transparent", width: "160px" }}
//                   />
//                 </div>
//               </div>

//               {loading ? (
//                 <p style={{ color: "#64748b" }}>Cargando tareas...</p>
//               ) : filteredTasks.length === 0 ? (
//                 <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
//                   <p style={{ color: "#64748b", margin: 0 }}>No hay tareas para mostrar.</p>
//                 </div>
//               ) : (
//                 <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
//                   {filteredTasks.map(task => (
//                     <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
//                   {filteredTasks.map(task => (
//                     <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", padding: "1.1rem 1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
                      
//                       {/* Lado Izquierdo: Checkbox, Título, Descripción y Fechas */}
//                       <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
//                         <input
//                           type="checkbox"
//                           checked={task.completed}
//                           onChange={() => toggleTaskStatus(task.id, task.completed, task.folder).then(refetch)}
//                           style={{ width: "22px", height: "22px", cursor: "pointer", accentColor: "#2563eb" }}
//                         />
//                         <div>
//                           <span style={{ textDecoration: task.completed ? "line-through" : "none", color: task.completed ? "#94a3b8" : "#0f172a", fontWeight: 600, display: "block", fontSize: "0.95rem" }}>
//                             {task.title}
//                           </span>
//                           {task.description && <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{task.description}</span>}
//                           <div style={{ display: "flex", gap: "0.75rem", marginTop: "4px" }}>
//                             {task.dueDate && <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 500 }}>📅 Vence: {task.dueDate}</span>}
//                             <span style={{ fontSize: "0.75rem", color: "#64748b", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px" }}>📁 {task.folder || "Pendientes"}</span>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Lado Derecho: Prioridad, Botón Editar (Bolígrafo) y Papelera */}
//                       <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
//                         <span style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem", borderRadius: "8px", backgroundColor: task.priority === "Urgente" ? "#fee2e2" : "#eff6ff", color: task.priority === "Urgente" ? "#b91c1c" : "#1d4ed8", fontWeight: 600 }}>
//                           {task.priority || "Media"}
//                         </span>

//                         {/* Botón de Editar con boligrafo.png */}
//                         <button
//                           onClick={() => {
//                             // Aquí puedes poner la lógica para editar
//                           }}
//                           title="Editar tarea"
//                           style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
//                         >
//                           <img src={boligrafoImg} alt="Editar" style={{ width: "22px", height: "22px", objectFit: "contain", transition: "transform 0.2s" }} />
//                         </button>

//                         {/* Botón de Papelera */}
//                         <button
//                           onClick={() => moveToTrash(task.id).then(refetch)}
//                           className="bin-button"
//                           title="Mover a papelera"
//                         >
//                           <svg className="bin-top" viewBox="0 0 39 7" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <line y1="5" x2="39" y2="5" stroke="white" strokeWidth="4"></line>
//                             <line x1="12" y1="1.5" x2="26.0357" y2="1.5" stroke="white" strokeWidth="3"></line>
//                           </svg>
//                           <svg className="bin-bottom" viewBox="0 0 33 39" fill="none" xmlns="http://www.w3.org/2000/svg">
//                             <mask id={`path-1-${task.id}`} fill="white">
//                               <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
//                             </mask>
//                             <path d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z" fill="white" mask={`url(#path-1-${task.id})`} />
//                             <path d="M12 6L12 29" stroke="white" strokeWidth="4"></path>
//                             <path d="M21 6V29" stroke="white" strokeWidth="4"></path>
//                           </svg>
//                         </button>
//                       </div>

//                     </div>
//                   ))}
//                 </div>
                   
//                   ))}
//                 </div>
//               )}
//             </section>
//           )}
//         </div>

//         {/* Columna Derecha */}
//         <aside style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
//           <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)", textAlign: "center" }}>
//             <h3 style={{ fontSize: "1rem", margin: "0 0 1rem 0", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
//               <img src={resumenImg} alt="Resumen" style={{ width: "20px", height: "20px", objectFit: "contain" }} /> Resumen General
//             </h3>

//             <div style={{ fontSize: "2.2rem", fontWeight: 700, color: "#2563eb", marginBottom: "0.25rem" }}>{totalTasks}</div>
//             <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 1.25rem 0" }}>Total Registradas</p>

//             <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem", textAlign: "center", fontSize: "0.8rem" }}>
//               <div style={{ backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "8px" }}>
//                 <img src={pendienteImg} alt="Pendientes" style={{ width: "16px", height: "16px", margin: "0 auto 2px auto", display: "block" }} />
//                 <span style={{ display: "block", color: "#132eaa", fontWeight: 600, fontSize: "0.75rem" }}>Pendientes</span>
//                 <b style={{ fontSize: "0.95rem" }}>{pendientesCount}</b>
//               </div>
//               <div style={{ backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "8px" }}>
//                 <img src={proce} alt="En Proceso" style={{ width: "16px", height: "16px", margin: "0 auto 2px auto", display: "block" }} />
//                 <span style={{ display: "block", color: "#b331ab", fontWeight: 600, fontSize: "0.75rem" }}>En Proceso</span>
//                 <b style={{ fontSize: "0.95rem" }}>{enProcesoCount}</b>
//               </div>
//               <div style={{ backgroundColor: "#f8fafc", padding: "0.5rem", borderRadius: "8px" }}>
//                 <img src={cheque} alt="Completadas" style={{ width: "16px", height: "16px", margin: "0 auto 2px auto", display: "block" }} />
//                 <span style={{ display: "block", color: "#059669", fontWeight: 600, fontSize: "0.75rem" }}>Completadas</span>
//                 <b style={{ fontSize: "0.95rem" }}>{completadasCount}</b>
//               </div>
//             </div>
//           </div>

//           <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)" }}>
//             <h3 style={{ fontSize: "1rem", margin: "0 0 1rem 0", color: "#0f172a" }}>Estado de tus tareas</h3>

//             <div style={{ height: "12px", width: "100%", backgroundColor: "#f1f5f9", borderRadius: "99px", display: "flex", overflow: "hidden", marginBottom: "1.25rem" }}>
//               <div style={{ width: `${totalTasks ? (pendientesCount / totalTasks) * 100 : 0}%`, backgroundColor: "#f59e0b", transition: "width 0.3s" }} title="Pendientes"></div>
//               <div style={{ width: `${totalTasks ? (enProcesoCount / totalTasks) * 100 : 0}%`, backgroundColor: "#3b82f6", transition: "width 0.3s" }} title="En Proceso"></div>
//               <div style={{ width: `${totalTasks ? (completadasCount / totalTasks) * 100 : 0}%`, backgroundColor: "#10b981", transition: "width 0.3s" }} title="Completadas"></div>
//             </div>

//             <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem" }}>
//               <div style={{ display: "flex", justifyContent: "space-between" }}>
//                 <span style={{ color: "#2563eb" }}>🔵 Pendientes</span>
//                 <b>{pendientesCount}</b>
//               </div>
//               <div style={{ display: "flex", justifyContent: "space-between" }}>
//                 <span style={{ color: "#bb43b3" }}>🟣 En Proceso</span>
//                 <b>{enProcesoCount}</b>
//               </div>
//               <div style={{ display: "flex", justifyContent: "space-between" }}>
//                 <span style={{ color: "#10b981" }}>🟢 Completadas</span>
//                 <b>{completadasCount}</b>
//               </div>

//             </div>
//           </div>

//           <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", padding: "1.25rem", borderRadius: "16px", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
//               <img src={ideaImg} alt="Idea" style={{ width: "20px", height: "20px", objectFit: "contain" }} />
//               <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: "#065f46" }}>Tip del día</h4>
//             </div>
//             <p style={{ fontSize: "0.8rem", color: "#047857", margin: 0, lineHeight: "1.4" }}>
//               Una buena organización te acerca a tus metas. ✨
//             </p>
//           </div>

//           <div style={{ backgroundColor: "#fff", padding: "1.5rem", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.04)" }}>
//             <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
//               <span style={{ fontSize: "1.2rem" }}>📧</span>
//               <h3 style={{ fontSize: "1rem", margin: 0, color: "#0f172a" }}>Resumen por Correo</h3>
//             </div>
//             <p style={{ fontSize: "0.825rem", color: "#64748b", marginBottom: "1.25rem", lineHeight: "1.4" }}>
//               Recibe un reporte detallado con el estado de todas tus tareas directamente en tu correo electrónico configurado con AWS SES.
//             </p>
//             <EmailSummaryButton todos={activeTasks} userEmail={user?.email || ""} />
//           </div>
//         </aside>

//       </main>

//       {isModalOpen && (
//         <TaskFormModal
//           currentFolder={currentFolder === "Todas" ? "Pendientes" : currentFolder}
//           userEmail={user?.email || ""}
//           onClose={() => setIsModalOpen(false)}
//           onSubmit={handleCreateNewTask}
//         />
//       )}
//     </div>
//   );
// }

// export default DashboardPage;