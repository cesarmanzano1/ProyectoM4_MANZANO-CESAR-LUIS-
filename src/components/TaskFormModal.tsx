//src/components/TaskFormModal.tsx
import { useState, useEffect, useMemo, type FormEvent, type JSX } from "react";

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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);


  const todayStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

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

  // Validación en tiempo real similar a tu RegisterPage
  const errors = useMemo(() => {
    const errs: { title?: string; description?: string; assignedTo?: string; dueDate?: string, createdBy?: string } = {};

    if (!title.trim()) {
      errs.title = "El título es obligatorio.";
    }
    if (!description.trim()) {
      errs.description = "La descripción es obligatoria.";
    }
    if (!createdBy.trim()) {
      errs.createdBy = "El campo creado por es obligatorio.";
    }
    if (!assignedTo.trim()) {
      errs.assignedTo = "El campo asignado a es obligatorio.";
    }
   if (!dueDate) {
      errs.dueDate = "La fecha límite es obligatoria.";
    } else if (dueDate < todayStr) {
      errs.dueDate = "La fecha límite no puede ser anterior a la fecha actual.";
    }

    return errs;
  }, [title, description, assignedTo, dueDate,todayStr]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);
    setFirebaseError(null);

    if (Object.keys(errors).length > 0) {
      return;
    }

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
      setFirebaseError("Ocurrió un error al guardar la tarea en la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15, 23, 42, 0.5)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: "1rem"
    }}>
      <div style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "520px",
        maxHeight: "90vh",
        overflowY: "auto",
        padding: "2rem",
        color: "#1e293b",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.35rem", fontWeight: 700, color: "#0f172a" }}>
            {taskToEdit ? "✏️ Editar Tarea" : " Nueva Tarea Detallada"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "1.2rem", cursor: "pointer", padding: "4px" }}
          >
            ✕
          </button>
        </div>

        {firebaseError && (
          <div style={{ padding: "0.75rem", backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", color: "#991b1b", fontSize: "0.875rem", marginBottom: "1rem" }}>
            <span>{firebaseError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }} noValidate>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Título de la Tarea *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Integración API"
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                color: "#0f172a",
                outline: "none",
                fontSize: "0.95rem",
                boxSizing: "border-box",
                ...(hasSubmitted && errors.title ? { borderColor: "#ef4444", backgroundColor: "#fffafa" } : {})
              }}
            />
            {hasSubmitted && errors.title && (
              <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 500, marginTop: "0.25rem", display: "block" }}>{errors.title}</span>
            )}
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Descripción *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalles de la tarea..."
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                backgroundColor: "#f8fafc",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                color: "#0f172a",
                outline: "none",
                fontSize: "0.95rem",
                resize: "none",
                boxSizing: "border-box",
                overflowY: "auto",
                ...(hasSubmitted && errors.description ? { borderColor: "#ef4444", backgroundColor: "#fffafa" } : {})
              }}
            />
            {hasSubmitted && errors.description && (
              <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 500, marginTop: "0.25rem", display: "block" }}>{errors.description}</span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>
                Creado por *
              </label>
              <input
                type="text"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  color: "#0f172a",
                  outline: "none",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                  ...(hasSubmitted && errors.createdBy ? { borderColor: "#ef4444", backgroundColor: "#fffafa" } : {}),
                }}
              />
              {hasSubmitted && errors.createdBy && (
                <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 500, marginTop: "0.25rem", display: "block" }}>
                  {errors.createdBy}
                </span>
              )}
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Asignado a *</label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="Ej. César"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  color: "#0f172a",
                  outline: "none",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                  ...(hasSubmitted && errors.assignedTo ? { borderColor: "#ef4444", backgroundColor: "#fffafa" } : {})
                }}
              />
              {hasSubmitted && errors.assignedTo && (
                <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 500, marginTop: "0.25rem", display: "block" }}>{errors.assignedTo}</span>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Prioridad</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                style={{ width: "100%", padding: "0.75rem 1rem", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "10px", color: "#0f172a", outline: "none", fontSize: "0.95rem", cursor: "pointer", boxSizing: "border-box" }}
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.4rem" }}>Fecha Límite *</label>
              <input
                type="date"
                min={todayStr}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #cbd5e1",
                  borderRadius: "10px",
                  color: "#0f172a",
                  outline: "none",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                  ...(hasSubmitted && errors.dueDate ? { borderColor: "#ef4444", backgroundColor: "#fffafa" } : {})
                }}
              />
              {hasSubmitted && errors.dueDate && (
                <span style={{ fontSize: "0.75rem", color: "#dc2626", fontWeight: 500, marginTop: "0.25rem", display: "block" }}>{errors.dueDate}</span>
              )}
            </div>
          </div>
          

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "0.75rem 1.25rem", backgroundColor: "transparent", color: "#64748b", border: "1px solid #cbd5e1", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.95rem" }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "0.95rem", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}
            >
              {loading ? "Guardando..." : taskToEdit ? "Actualizar Tarea" : "Guardar Tarea"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}