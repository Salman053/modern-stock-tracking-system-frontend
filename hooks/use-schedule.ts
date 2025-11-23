import { useEffect, useRef, useState } from "react";

export type ScheduledTask = {
  id: string;
  action: () => void | Promise<void>;
  runAt: number; // timestamp when it should run
};

export function useScheduler(storageKey = "scheduledTasks") {
  const [tasks, setTasks] = useState<ScheduledTask[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed: ScheduledTask[] = JSON.parse(saved);
      setTasks(parsed);
    }
  }, [storageKey]);

  // Persist tasks
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
  }, [tasks, storageKey]);

  // Watch and run tasks
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const dueTasks = tasks.filter((t) => t.runAt <= now);
      if (dueTasks.length > 0) {
        dueTasks.forEach((t) => {
          t.action();
        });
        setTasks((prev) => prev.filter((t) => t.runAt > now));
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tasks]);

  const scheduleTask = (action: () => void | Promise<void>, delayMs: number) => {
    const task: ScheduledTask = {
      id: Math.random().toString(36).substring(2, 9),
      action,
      runAt: Date.now() + delayMs,
    };
    setTasks((prev) => [...prev, task]);
    return task.id;
  };

  const cancelTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return { scheduleTask, cancelTask, tasks };
}
