import { format, parseISO } from "date-fns";
import { CalendarDays, Ellipsis, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { isOverdue, useTasks, type Task } from "./task-store";

export function PriorityBadge({ priority }: { priority: Task["priority"] }) {
  const style = priority === "High" ? "bg-peach text-peach-foreground" : priority === "Medium" ? "bg-sky text-sky-foreground" : "bg-mint text-mint-foreground";
  return <span className={cn("inline-flex items-center gap-1.5 rounded px-2 py-1 text-[11px] font-bold", style)}><span className="size-1.5 rounded-full bg-current" />{priority}</span>;
}
export function CategoryBadge({ category }: { category: Task["category"] }) {
  const style = category === "Work" ? "bg-lilac text-lilac-foreground" : category === "Study" ? "bg-sky text-sky-foreground" : "bg-peach text-peach-foreground";
  return <span className={cn("inline-flex rounded px-2 py-1 text-[11px] font-semibold", style)}>{category}</span>;
}
export function TaskRow({ task, onEdit, compact = false }: { task: Task; onEdit: (task: Task) => void; compact?: boolean }) {
  const { toggleTask, deleteTask } = useTasks();
  return <div className="group flex min-w-0 items-start gap-3 border-b border-border py-4 last:border-b-0 sm:items-center sm:gap-4">
    <Button variant="ghost" size="icon" aria-label={task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`} title={task.completed ? "Mark active" : "Mark complete"} onClick={() => toggleTask(task.id)} className={cn("mt-0.5 size-5 shrink-0 rounded-full border-2 border-input p-0 hover:border-primary sm:mt-0", task.completed && "border-primary bg-primary text-primary-foreground hover:bg-primary/90")}>
      {task.completed && <span className="text-[12px] leading-none">✓</span>}
    </Button>
    <div className="min-w-0 flex-1">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5"><p className={cn("min-w-0 truncate text-sm font-semibold", task.completed && "text-muted-foreground line-through")}>{task.title}</p>{!compact && <CategoryBadge category={task.category} />}</div>
      {!compact && task.description && <p className="mt-1 max-w-xl truncate text-xs text-muted-foreground">{task.description}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-2 sm:hidden"><PriorityBadge priority={task.priority} /><span className={cn("text-xs text-muted-foreground", isOverdue(task) && "text-destructive")}>{format(parseISO(task.dueDate), "MMM d")}</span></div>
    </div>
    <div className="hidden items-center gap-5 sm:flex"><PriorityBadge priority={task.priority} /><span className={cn("flex w-20 items-center gap-1.5 whitespace-nowrap text-xs text-muted-foreground", isOverdue(task) && "text-destructive")}><CalendarDays className="size-3.5" />{format(parseISO(task.dueDate), "MMM d")}</span></div>
    <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${task.title}`} title="Task actions" className="-mt-1 size-8 shrink-0 text-muted-foreground sm:mt-0"><Ellipsis className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => onEdit(task)}><Pencil />Edit</DropdownMenuItem><DropdownMenuItem onClick={() => { if (window.confirm(`Delete “${task.title}”?`)) deleteTask(task.id); }} className="text-destructive focus:text-destructive"><Trash2 />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
  </div>;
}
