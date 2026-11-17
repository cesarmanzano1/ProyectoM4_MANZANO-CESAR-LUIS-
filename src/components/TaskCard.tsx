//src/components/TaskCard.tsx
import type { JSX } from "react";
import type { Task } from "../services/taskService";
import boligrafoImg from "../assets/boligrafo.png";

interface TaskCardProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onUpdatePriority: (taskId: string, newPriority: string) => void; // <-- Nueva prop para cambiar prioridad
}

export function TaskCard({ task, onToggleStatus, onEdit, onDelete, onUpdatePriority }: TaskCardProps): JSX.Element {
  
  // Estilos de colores dinámicos para el selector de prioridad
  const getPriorityStyle = (priority?: string) => {
    switch (priority) {
      case "Urgente":
        return { bg: "#fee2e2", color: "#b91c1c", border: "#fecaca" };
      case "Moderada":
        return { bg: "#fef3c7", color: "#d97706", border: "#fde68a" };
      case "Alta":
        return { bg: "#ffedd5", color: "#c2410c", border: "#fed7aa" };
      default: // Baja o Media
        return { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
    }
  };

  const currentPriorityStyle = getPriorityStyle(task.priority);

  // Estilos y colores del tilde cíclico
  const getCheckboxStyle = () => {
    if (task.folder === "Completadas" || task.completed) {
      return { bg: "#10b981", border: "#10b981" };
    }
    if (task.folder === "En Proceso") {
      return { bg: "#9333ea", border: "#9333ea" };
    }
    return { bg: "transparent", border: "#2563eb" };
  };

  const currentCheck = getCheckboxStyle();

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", padding: "1.1rem 1.25rem", borderRadius: "14px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
      
      {/* Lado Izquierdo: Checkbox cíclico + Título y descripción */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
        <button
          type="button"
          onClick={() => onToggleStatus(task)}
          title={`Estado: ${task.folder || "Pendientes"}. Haz clic para cambiar.`}
          style={{
            width: "24px",
            height: "24px",
            borderRadius: "6px",
            border: `2px solid ${currentCheck.border}`,
            backgroundColor: currentCheck.bg,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            transition: "all 0.2s"
          }}
        >
          <svg width="12" height="10" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 4L4 6.5L8.5 1.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div>
          <span style={{ textDecoration: task.folder === "Completadas" ? "line-through" : "none", color: task.folder === "Completadas" ? "#94a3b8" : "#0f172a", fontWeight: 600, display: "block", fontSize: "0.95rem" }}>
            {task.title}
          </span>
          {task.description && <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{task.description}</span>}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "4px" }}>
            {task.dueDate && <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 500 }}>📅 Vence: {task.dueDate}</span>}
            <span style={{ fontSize: "0.75rem", color: "#64748b", background: "#f1f5f9", padding: "1px 6px", borderRadius: "4px" }}>📁 {task.folder || "Pendientes"}</span>
          </div>
        </div>
      </div>

      {/* Lado Derecho: Selector de Prioridad desplegable, Botón Editar y Papelera */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        
        {/* BARRA DESPLEGABLE DE PRIORIDAD */}
        <select
          value={task.priority || "Media"}
          onChange={(e) => onUpdatePriority(task.id, e.target.value)}
          title="Cambiar prioridad"
          style={{
            fontSize: "0.75rem",
            padding: "0.35rem 0.6rem",
            borderRadius: "8px",
            backgroundColor: currentPriorityStyle.bg,
            color: currentPriorityStyle.color,
            border: `1px solid ${currentPriorityStyle.border}`,
            fontWeight: 600,
            cursor: "pointer",
            outline: "none"
          }}
        >
          <option value="Baja" style={{ backgroundColor: "#fff", color: "#1d4ed8" }}>Baja</option>
          <option value="Media" style={{ backgroundColor: "#fff", color: "#1d4ed8" }}>Media</option>
          <option value="Moderada" style={{ backgroundColor: "#fff", color: "#d97706" }}>Moderada</option>
          <option value="Urgente" style={{ backgroundColor: "#fff", color: "#b91c1c" }}>Urgente</option>
        </select>

        {/* Botón de Editar (Lápiz) */}
        <button
          onClick={() => onEdit(task)}
          title="Editar tarea completa"
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
        >
          <img src={boligrafoImg} alt="Editar" style={{ width: "22px", height: "22px", objectFit: "contain", transition: "transform 0.2s" }} />
        </button>

        {/* Botón Papelera */}
        <button
          onClick={() => onDelete(task.id)}
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
}