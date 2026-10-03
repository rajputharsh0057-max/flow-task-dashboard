import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ListFilter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TaskDialog } from "@/features/tasks/task-dialog";
import { TaskRow } from "@/features/tasks/task-row";
import { isOverdue, useTasks, type Task } from "@/features/tasks/task-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "My Tasks — Flow Task" }, { name: "description", content: "Organize your tasks by due date, priority, and category with Flow Task." }, { property: "og:title", content: "My Tasks — Flow Task" }, { property: "og:description", content: "Organize your tasks by due date, priority, and category with Flow Task." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: TasksPage,
});
type Filter = "All" | "Active" | "Completed" | "High priority" | "Overdue";
const filters: Filter[] = ["All", "Active", "Completed", "High priority", "Overdue"];
function TasksPage() {
  const { tasks, ready } = useTasks();
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [sort, setSort] = useState("Due date");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const filtered = tasks.filter(task => {
    if (filter === "Active" && task.completed) return false;
    if (filter === "Completed" && !task.completed) return false;
    if (filter === "High priority" && (task.priority !== "High" || task.completed)) return false;
    if (filter === "Overdue" && !isOverdue(task)) return false;
    if (category !== "All categories" && task.category !== category) return false;
    return `${task.title} ${task.description}`.toLowerCase().includes(search.toLowerCase());
  }).sort((a,b) => sort === "Priority" ? (["High", "Medium", "Low"].indexOf(a.priority) - ["High", "Medium", "Low"].indexOf(b.priority)) || a.dueDate.localeCompare(b.dueDate) : sort === "Newest" ? b.id.localeCompare(a.id) : a.dueDate.localeCompare(b.dueDate));
  return <div className="space-y-7 pb-10"><div className="flex flex-wrap items-end justify-between gap-5"><div><div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Your workspace / Tasks</div><h1 className="font-display text-[28px] font-extrabold leading-tight sm:text-[34px]">My tasks</h1><p className="mt-2 text-sm text-muted-foreground">A clear view of everything on your plate.</p></div><Button onClick={() => setDialogOpen(true)} className="h-10 px-5"><Plus className="size-4" />Add task</Button></div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[{ label: "All tasks", value: tasks.length }, { label: "In progress", value: tasks.filter(t => !t.completed).length }, { label: "Done", value: tasks.filter(t => t.completed).length }].map(item => <div key={item.label} className="rounded-lg border border-border bg-card px-4 py-4 sm:px-6 sm:py-5"><p className="text-xs font-medium text-muted-foreground">{item.label}</p><p className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">{ready ? item.value : "—"}</p></div>)}</div>
    <section className="rounded-lg border border-border bg-card"><div className="border-b border-border px-4 pt-5 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-display text-lg font-bold">Task list</h2><p className="mt-1 text-xs text-muted-foreground">{filtered.length} {filtered.length === 1 ? "task" : "tasks"} found</p></div><div className="relative w-full sm:w-[260px]"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." aria-label="Search tasks" className="h-10 bg-background pl-9" /></div></div><div className="mt-6 flex gap-1 overflow-x-auto pb-0" role="tablist" aria-label="Task status filters">{filters.map(item => <Button key={item} variant="ghost" role="tab" aria-selected={filter === item} onClick={() => setFilter(item)} className={cn("h-10 shrink-0 rounded-none border-b-2 border-transparent px-3 text-xs font-semibold text-muted-foreground hover:bg-transparent sm:px-4", filter === item && "border-primary text-primary")}>{item}</Button>)}</div></div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3 sm:px-6"><ListFilter className="mr-1 size-4 text-muted-foreground" /><Select value={category} onValueChange={setCategory}><SelectTrigger aria-label="Filter category" className="h-9 w-[155px] bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{["All categories", "Work", "Study", "Personal"].map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><div className="ml-auto flex items-center gap-2"><SlidersHorizontal className="size-4 text-muted-foreground" /><Select value={sort} onValueChange={setSort}><SelectTrigger aria-label="Sort tasks" className="h-9 w-[120px] bg-background text-xs"><SelectValue /></SelectTrigger><SelectContent>{["Due date", "Priority", "Newest"].map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></div></div>
      <div className="px-4 sm:px-6">{filtered.length ? filtered.map(task => <TaskRow key={task.id} task={task} onEdit={setEditing} />) : <div className="py-20 text-center"><div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-md bg-muted"><ListFilter className="size-5 text-muted-foreground" /></div><h3 className="font-display text-base font-bold">No tasks found</h3><p className="mt-1 text-sm text-muted-foreground">Try another search or filter, or add a new task.</p><Button variant="outline" className="mt-5" onClick={() => { setFilter("All"); setSearch(""); setCategory("All categories"); }}>Clear filters</Button></div>}</div>
    </section><TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} /><TaskDialog open={Boolean(editing)} onOpenChange={open => { if (!open) setEditing(null); }} task={editing} /></div>;
}
