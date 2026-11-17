// src/components/CalendarView.tsx
import type { JSX } from "react";
import type { Task } from "../services/taskService";

export function CalendarView({ tasks }: { tasks: Task[] }): JSX.Element {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentMonthName = today.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "1.5rem", color: "#111827", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      <h2 style={{ fontSize: "1.25rem", textTransform: "capitalize", marginBottom: "1rem", color: "#065f46" }}>Calendario - {currentMonthName}</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem" }}>
        {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", padding: "0.5rem 0" }}>{d}</div>
        ))}
        
        {daysArray.map(day => {
          const formattedDayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          
          // Filtramos las tareas cuya fecha coincida exactamente con el día del calendario
          const dayTasks = tasks.filter(t => {
            if (!t.dueDate) return false;
            return t.dueDate.startsWith(formattedDayStr);
          });

          return (
            <div key={day} style={{ minHeight: "85px", backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.4rem", fontSize: "0.8rem" }}>
              <span style={{ fontWeight: 600, color: "#374151" }}>{day}</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
                {dayTasks.map(t => (
                  <div key={t.id} style={{ backgroundColor: t.completed ? "#10b981" : "#059669", color: "#fff", padding: "2px 4px", borderRadius: "4px", fontSize: "0.7rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={t.title}>
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}