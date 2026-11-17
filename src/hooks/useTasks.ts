//src/hooks/useTasks.ts
import { useEffect, useState, useCallback } from "react";
import { getTasksByUser, type Task } from "../services/taskService";

export function useTasks(uid: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getTasksByUser(uid);
      setTasks(data);
    } catch (e) {
      setError("No se pudieron obtener tareas.");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return { tasks, loading, error, refetch: fetchTasks };
}