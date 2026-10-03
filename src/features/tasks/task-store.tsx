import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { addDays, format } from "date-fns";

export type Priority = "High" | "Medium" | "Low";
export type Category = "Work" | "Personal" | "Study";
export type Task = { id: string; title: string; description: string; priority: Priority; dueDate: string; category: Category; completed: boolean };
export type TaskInput = Omit<Task, "id" | "completed">;

const STORAGE_KEY = "flow-task.tasks.v1";
const day = (offset: number) => format(addDays(new Date(), offset), "yyyy-MM-dd");
const samples = (): Task[] => [
  { id: "1", title: "Finalize portfolio case study", description: "Polish the visuals and write up the process for the new project.", priority: "High", dueDate: day(0), category: "Work", completed: false },
  { id: "2", title: "Review data structures notes", description: "Go over trees, graphs, and common interview patterns.", priority: "Medium", dueDate: day(0), category: "Study", completed: false },
  { id: "3", title: "Morning workout", description: "A quick run and some stretching to start the day.", priority: "Low", dueDate: day(0), category: "Personal", completed: true },
  { id: "4", title: "Send project update to the team", description: "Share this week's progress and next steps.", priority: "Medium", dueDate: day(0), category: "Work", completed: false },
  { id: "5", title: "Read 20 pages", description: "Continue reading the current book.", priority: "Low", dueDate: day(0), category: "Personal", completed: true },
  { id: "6", title: "Prepare for design review", description: "Collect feedback and put together a presentation.", priority: "High", dueDate: day(1), category: "Work", completed: false },
  { id: "7", title: "Finish database assignment", description: "Complete the query exercises and submit the report.", priority: "High", dueDate: day(2), category: "Study", completed: false },
  { id: "8", title: "Pick up groceries", description: "Get everything for dinner this weekend.", priority: "Low", dueDate: day(3), category: "Personal", completed: false },
  { id: "9", title: "Refactor authentication flow", description: "Clean up the session handling and edge cases.", priority: "Medium", dueDate: day(4), category: "Work", completed: false },
  { id: "10", title: "Submit weekly reading notes", description: "Summarize the key takeaways from the chapter.", priority: "Medium", dueDate: day(-1), category: "Study", completed: false },
  { id: "11", title: "Organize project files", description: "Archive old drafts and tidy up the workspace.", priority: "Low", dueDate: day(-2), category: "Work", completed: true },
  { id: "12", title: "Plan next week's goals", description: "Set a few clear priorities for the week ahead.", priority: "Medium", dueDate: day(5), category: "Personal", completed: true },
];

type TaskContextValue = {
  tasks: Task[];
  ready: boolean;
  createTask: (input: TaskInput) => void;
  updateTask: (id: string, input: TaskInput) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
};
const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : null;
      setTasks(Array.isArray(parsed) ? parsed as Task[] : samples());
    } catch {
      setTasks(samples());
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);
  const createTask = (input: TaskInput) => setTasks(current => [{ ...input, id: crypto.randomUUID(), completed: false }, ...current]);
  const updateTask = (id: string, input: TaskInput) => setTasks(current => current.map(task => task.id === id ? { ...task, ...input } : task));
  const deleteTask = (id: string) => setTasks(current => current.filter(task => task.id !== id));
  const toggleTask = (id: string) => setTasks(current => current.map(task => task.id === id ? { ...task, completed: !task.completed } : task));
  return <TaskContext.Provider value={{ tasks, ready, createTask, updateTask, deleteTask, toggleTask }}>{children}</TaskContext.Provider>;
}
export function useTasks() {
  const value = useContext(TaskContext);
  if (!value) throw new Error("useTasks must be used within TaskProvider");
  return value;
}
export const todayKey = () => format(new Date(), "yyyy-MM-dd");
export const isOverdue = (task: Task) => !task.completed && task.dueDate < todayKey();
