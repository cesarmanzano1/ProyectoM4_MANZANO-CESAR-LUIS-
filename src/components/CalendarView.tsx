// src/components/CalendarView.tsx

import { useState, useMemo, type JSX } from "react";
import type { Task } from "../services/taskService";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function CalendarView({ tasks }: { tasks: Task[] }): JSX.Element {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState<Date>(
    () => new Date(now.getFullYear(), now.getMonth(), 1)
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const currentMonthName = currentDate.toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const startOffset = useMemo(() => {
    const jsDay = new Date(year, month, 1).getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
  }, [year, month]);

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const calendarCells = useMemo(() => {
    const blanks: null[] = Array.from({ length: startOffset }, () => null);
    const days: number[] = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return [...blanks, ...days];
  }, [startOffset, daysInMonth]);

  const goToPrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const current = new Date();
    setCurrentDate(new Date(current.getFullYear(), current.getMonth(), 1));
  };

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <h2 className="calendar-title">Calendario - {currentMonthName}</h2>

        <div className="calendar-nav-group">
          <button
            type="button"
            onClick={goToPrevMonth}
            title="Mes anterior"
            className="calendar-nav-btn"
          >
            ◀ Ant.
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="calendar-today-btn"
          >
            Hoy
          </button>

          <button
            type="button"
            onClick={goToNextMonth}
            title="Mes siguiente"
            className="calendar-nav-btn"
          >
            Sig. ▶
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {WEEKDAYS.map((dayLabel) => (
          <div key={dayLabel} className="calendar-weekday">
            {dayLabel}
          </div>
        ))}

        {calendarCells.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="calendar-cell calendar-cell--empty" />;
          }

          const formattedDayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            day
          ).padStart(2, "0")}`;
          const isToday = formattedDayStr === todayStr;

          const dayTasks = tasks.filter((t) => {
            if (!t.dueDate) return false;
            return t.dueDate.startsWith(formattedDayStr);
          });

          return (
            <div
              key={formattedDayStr}
              className={`calendar-cell ${isToday ? "calendar-cell--today" : ""}`}
            >
              <div className="calendar-cell-top">
                <span className={`calendar-day-num ${isToday ? "calendar-day-num--today" : ""}`}>
                  {day}
                </span>
                {isToday && <span className="calendar-today-badge">Hoy</span>}
              </div>

              <div className="calendar-tasks-list">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`calendar-task-pill ${
                      t.completed ? "calendar-task-pill--done" : "calendar-task-pill--pending"
                    }`}
                    title={`${t.title}${t.dueDate ? ` (${t.dueDate})` : ""}`}
                  >
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
