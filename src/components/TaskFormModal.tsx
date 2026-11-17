// //src/components/TaskFormModal.tsx
// import { useState, type FormEvent, type JSX } from "react";

// interface TaskFormModalProps {
//   currentFolder: string;
//   userEmail?: string;
//   onClose: () => void;
//   onSubmit: (taskData: {
//     title: string;
//     description: string;
//     createdBy: string;
//     assignedTo: string;
//     priority: string;
//     dueDate: string;
//     folder: string;
//   }) => Promise<void>;
// }

// export function TaskFormModal({ currentFolder, userEmail, onClose, onSubmit }: TaskFormModalProps): JSX.Element {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [createdBy, setCreatedBy] = useState(userEmail || "");
//   const [assignedTo, setAssignedTo] = useState("");
//   const [priority, setPriority] = useState("Media");
//   const [dueDate, setDueDate] = useState("");
//   const [folder, setFolder] = useState(currentFolder === "Calendario" ? "Pendientes" : currentFolder);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!title.trim()) return;
//     setLoading(true);
//     try {
//       await onSubmit({
//         title,
//         description,
//         createdBy,
//         assignedTo,
//         priority,
//         dueDate,
//         folder,
//       });
//       onClose();
//     } catch (err) {
//       console.error("Error al crear tarea:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
//       <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", width: "100%", maxWidth: "500px", padding: "2rem", color: "#f8fafc" }}>
//         <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem" }}>Nueva Tarea Detallada</h2>

//         <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//           <div>
//             <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Título de la Tarea *</label>
//             <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Integración API" style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }} />
//           </div>

//           <div>
//             <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Descripción</label>
//             <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles de la tarea..." rows={2} style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none", resize: "vertical" }} />
//           </div>

//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
//             <div>
//               <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Creado por</label>
//               <input type="text" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }} />
//             </div>
//             <div>
//               <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Asignado a</label>
//               <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Ej. César" style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }} />
//             </div>
//           </div>

//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
//             <div>
//               <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Prioridad</label>
//               <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }}>
//                 <option value="Baja">Baja</option>
//                 <option value="Media">Media</option>
//                 <option value="Alta">Alta</option>
//                 <option value="Urgente">Urgente</option>
//               </select>
//             </div>
//             <div>
//               <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Fecha Límite</label>
//               <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }} />
//             </div>
//           </div>

//           <div>
//             <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Carpeta Destino</label>
//             <select value={folder} onChange={(e) => setFolder(e.target.value)} style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }}>
//               <option value="Pendientes">Pendientes</option>
//               <option value="En Proceso">En Proceso</option>
//               <option value="Completadas">Completadas</option>
//               <option value="Urgentes">Urgentes</option>
//             </select>
//           </div>

//           <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
//             <button type="button" onClick={onClose} style={{ padding: "0.7rem 1.25rem", backgroundColor: "transparent", color: "#94a3b8", border: "1px solid #475569", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
//             <button type="submit" disabled={loading} style={{ padding: "0.7rem 1.5rem", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
//               {loading ? "Guardando..." : "Guardar Tarea"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
//src/components/TaskFormModal.tsx
import { useState, useEffect, type FormEvent, type JSX } from "react";

interface TaskFormModalProps {
  currentFolder: string;
  userEmail?: string;
  taskToEdit?: any | null;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    createdBy: string;
    assignedTo: string;
    priority: string;
    dueDate: string;
    folder: string;
  }, taskId?: string) => Promise<void>;
}

export function TaskFormModal({ currentFolder, userEmail, taskToEdit, onClose, onSubmit }: TaskFormModalProps): JSX.Element {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [createdBy, setCreatedBy] = useState(userEmail || "");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState("Media");
  const [dueDate, setDueDate] = useState("");
  const [folder, setFolder] = useState(currentFolder === "Calendario" ? "Pendientes" : currentFolder);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setCreatedBy(taskToEdit.createdBy || userEmail || "");
      setAssignedTo(taskToEdit.assignedTo || "");
      setPriority(taskToEdit.priority || "Media");
      setDueDate(taskToEdit.dueDate || "");
      setFolder(taskToEdit.folder || "Pendientes");
    }
  }, [taskToEdit, userEmail]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        title,
        description,
        createdBy,
        assignedTo,
        priority,
        dueDate,
        folder,
      }, taskToEdit?.id);
      onClose();
    } catch (err) {
      console.error("Error al guardar tarea:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <div style={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "16px", width: "100%", maxWidth: "500px", padding: "2rem", color: "#f8fafc" }}>
        <h2 style={{ margin: "0 0 1.5rem 0", fontSize: "1.25rem" }}>
          {taskToEdit ? "✏️ Editar Tarea" : "✨ Nueva Tarea Detallada"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Título de la Tarea *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Integración API" style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }} />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Descripción</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalles de la tarea..." rows={2} style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none", resize: "vertical" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Creado por</label>
              <input type="text" value={createdBy} onChange={(e) => setCreatedBy(e.target.value)} style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Asignado a</label>
              <input type="text" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Ej. César" style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Prioridad</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }}>
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Fecha Límite</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", color: "#94a3b8", display: "block", marginBottom: "0.3rem" }}>Carpeta Destino</label>
            <select value={folder} onChange={(e) => setFolder(e.target.value)} style={{ width: "100%", padding: "0.7rem", backgroundColor: "#0f172a", border: "1px solid #475569", borderRadius: "8px", color: "#fff", outline: "none" }}>
              <option value="Pendientes">Pendientes</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Completadas">Completadas</option>
              <option value="Urgentes">Urgentes</option>
            </select>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button type="button" onClick={onClose} style={{ padding: "0.7rem 1.25rem", backgroundColor: "transparent", color: "#94a3b8", border: "1px solid #475569", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ padding: "0.7rem 1.5rem", backgroundColor: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}>
              {loading ? "Guardando..." : taskToEdit ? "Actualizar Tarea" : "Guardar Tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}