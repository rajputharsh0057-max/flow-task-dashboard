import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTasks, type Category, type Priority, type Task, type TaskInput } from "./task-store";

export function TaskDialog({ open, onOpenChange, task }: { open: boolean; onOpenChange: (open: boolean) => void; task?: Task | null }) {
  const { createTask, updateTask } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [category, setCategory] = useState<Category>("Work");
  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setPriority(task?.priority ?? "Medium");
    setDueDate(task?.dueDate ?? format(new Date(), "yyyy-MM-dd"));
    setCategory(task?.category ?? "Work");
  }, [open, task]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !dueDate) return;
    const input: TaskInput = { title: title.trim(), description: description.trim(), priority, dueDate, category };
    if (task) updateTask(task.id, input);
    else createTask(input);
    onOpenChange(false);
  }
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto rounded-lg border-border bg-card p-6 shadow-xl sm:p-8">
      <DialogHeader className="text-left">
        <DialogTitle className="text-xl font-bold">{task ? "Edit task" : "Create a task"}</DialogTitle>
        <DialogDescription>{task ? "Update the details of your task." : "Add something new to your list."}</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="mt-2 space-y-5">
        <div className="space-y-2"><label htmlFor="task-title" className="text-sm font-semibold">Task title</label><Input id="task-title" autoFocus required maxLength={140} value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to get done?" className="h-11 bg-background" /></div>
        <div className="space-y-2"><label htmlFor="task-description" className="text-sm font-semibold">Description</label><Textarea id="task-description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Add a few details (optional)" className="min-h-24 bg-background" /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2"><label htmlFor="task-date" className="text-sm font-semibold">Due date</label><Input id="task-date" type="date" required value={dueDate} onChange={e => setDueDate(e.target.value)} className="h-11 bg-background" /></div>
          <div className="space-y-2"><label className="text-sm font-semibold" htmlFor="task-priority">Priority</label><Select value={priority} onValueChange={v => setPriority(v as Priority)}><SelectTrigger id="task-priority" className="h-11 bg-background"><SelectValue /></SelectTrigger><SelectContent>{(["High", "Medium", "Low"] as const).map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <div className="space-y-2"><label className="text-sm font-semibold" htmlFor="task-category">Category</label><Select value={category} onValueChange={v => setCategory(v as Category)}><SelectTrigger id="task-category" className="h-11 bg-background"><SelectValue /></SelectTrigger><SelectContent>{(["Work", "Study", "Personal"] as const).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
        <DialogFooter className="gap-2 pt-3"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" className="h-10 px-6">{task ? "Save changes" : "Create task"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
