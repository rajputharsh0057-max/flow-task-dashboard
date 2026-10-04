import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { addDays, format, parseISO, startOfWeek } from "date-fns";
import { ArrowRight, ArrowUpRight, Check, CheckCircle2, CircleAlert, Clock3, ListTodo, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/features/tasks/task-dialog";
import { QuickAdd } from "@/features/tasks/quick-add";
import { PriorityBadge, TaskRow } from "@/features/tasks/task-row";
import { isOverdue, todayKey, useTasks, type Task } from "@/features/tasks/task-store";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Flow Task" }, { name: "description", content: "Your daily tasks, progress, and upcoming plans in one focused workspace." }, { property: "og:title", content: "Dashboard — Flow Task" }, { property: "og:description", content: "Your daily tasks, progress, and upcoming plans in one focused workspace." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Dashboard,
});
function Dashboard() {
  const { tasks, ready } = useTasks();
  const [editing, setEditing] = useState<Task | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const today = todayKey();
  const todayTasks = tasks.filter(t => t.dueDate === today);
  const upcoming = tasks.filter(t => !t.completed && t.dueDate > today).sort((a,b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 4);
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  const overdue = tasks.filter(isOverdue).length;
  const rate = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = format(addDays(weekStart, index), "yyyy-MM-dd");
    const total = tasks.filter(t => t.dueDate === date).length;
    const done = tasks.filter(t => t.dueDate === date && t.completed).length;
    return { label: format(addDays(weekStart, index), "EEE"), total, done, today: date === today };
  });
  const stats = [
    { label: "Total tasks", value: tasks.length, icon: ListTodo, tone: "bg-sky text-sky-foreground", change: "In your workspace" },
    { label: "Completed", value: completed, icon: CheckCircle2, tone: "bg-mint text-mint-foreground", change: `${rate}% completion rate` },
    { label: "Pending", value: pending, icon: Clock3, tone: "bg-lilac text-lilac-foreground", change: "Keep the momentum" },
    { label: "Overdue", value: overdue, icon: CircleAlert, tone: "bg-peach text-peach-foreground", change: overdue ? "Needs your attention" : "All caught up" },
  ];
  return <div className="space-y-8 pb-10">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Your workspace / Overview</div><h1 className="font-display text-[28px] font-extrabold leading-tight sm:text-[34px]">Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"} <span aria-hidden="true">✳</span></h1><p className="mt-2 text-sm text-muted-foreground">Here’s what’s happening with your tasks today.</p></div><div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-xs font-semibold text-muted-foreground"><span className="size-2 rounded-full bg-mint-foreground" />{format(new Date(), "MMMM d, yyyy")}</div></div>
    <QuickAdd />
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">{stats.map(stat => <div key={stat.label} className="rounded-lg border border-border bg-card p-4 transition-transform duration-200 hover:-translate-y-0.5 sm:p-5"><div className={`mb-5 flex size-10 items-center justify-center rounded-md ${stat.tone}`}><stat.icon className="size-[19px]" /></div><p className="text-xs font-medium text-muted-foreground">{stat.label}</p><div className="mt-1 flex items-end justify-between gap-1"><span className="font-display text-[29px] font-extrabold leading-none sm:text-[34px]">{ready ? stat.value : "—"}</span><span className="hidden text-[10px] text-muted-foreground sm:block">{stat.change}</span></div></div>)}</div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(310px,1fr)]">
      <div className="min-w-0 space-y-5">
        <section className="rounded-lg border border-border bg-card p-5 sm:p-6"><div className="mb-5 flex items-start justify-between gap-3"><div><h2 className="font-display text-lg font-bold">Today’s tasks</h2><p className="mt-1 text-xs text-muted-foreground">{todayTasks.filter(t => t.completed).length} of {todayTasks.length} tasks completed</p></div><Button variant="ghost" size="sm" asChild className="shrink-0 text-primary"><Link to="/tasks">View all <ArrowUpRight className="size-4" /></Link></Button></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${todayTasks.length ? todayTasks.filter(t => t.completed).length / todayTasks.length * 100 : 0}%` }} /></div><div className="mt-2">{todayTasks.length ? todayTasks.map(task => <TaskRow key={task.id} task={task} onEdit={setEditing} compact />) : <p className="py-10 text-center text-sm text-muted-foreground">Nothing due today. Enjoy the breathing room.</p>}</div><Button variant="ghost" onClick={() => setNewOpen(true)} className="mt-2 w-full justify-start border border-dashed border-border text-muted-foreground hover:text-foreground"><Plus className="size-4" />Add a task</Button></section>
        <section className="rounded-lg border border-border bg-card p-5 sm:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="font-display text-lg font-bold">Productivity overview</h2><p className="mt-1 text-xs text-muted-foreground">A look at your week so far</p></div><span className="rounded bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">This week</span></div><div className="grid h-44 grid-cols-7 items-end gap-2 sm:gap-4">{days.map(day => <div key={day.label} className="flex h-full flex-col items-center justify-end gap-3"><div className="flex h-[125px] w-full max-w-10 items-end overflow-hidden rounded-t-sm bg-muted"><div className={`w-full rounded-t-sm transition-all duration-500 ${day.today ? "bg-chart-bar-strong" : "bg-chart-bar"}`} style={{ height: `${Math.max(8, day.total ? (day.done / Math.max(day.total, 1) * 85 + 15) : 8)}%` }} title={`${day.done} of ${day.total} tasks completed`} /></div><span className={`text-[11px] font-semibold ${day.today ? "text-primary" : "text-muted-foreground"}`}>{day.label}</span></div>)}</div><div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground"><span>Tasks completed this week</span><strong className="font-display text-base text-foreground">{tasks.filter(t => t.completed && t.dueDate >= format(weekStart, "yyyy-MM-dd") && t.dueDate <= format(addDays(weekStart, 6), "yyyy-MM-dd")).length}</strong></div></section>
      </div>
      <div className="min-w-0 space-y-5"><section className="relative overflow-hidden rounded-lg bg-primary p-6 text-primary-foreground sm:p-7"><div className="relative z-10"><span className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">Your progress</span><h2 className="mt-5 max-w-[210px] font-display text-2xl font-bold leading-snug">Small steps, big progress.</h2><p className="mt-3 max-w-[230px] text-xs leading-relaxed opacity-75">Every completed task gets you one step closer to your goals. Keep it going!</p><div className="mt-6 flex items-center gap-3"><span className="font-display text-3xl font-extrabold">{rate}%</span><span className="text-xs opacity-75">overall completion</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-foreground/20"><div className="h-full rounded-full bg-primary-foreground transition-all duration-500" style={{ width: `${rate}%` }} /></div></div><div className="absolute -right-8 -top-8 flex size-36 items-center justify-center rounded-full border border-primary-foreground/15"><div className="flex size-24 items-center justify-center rounded-full border border-primary-foreground/20"><Check className="size-10 opacity-20" /></div></div></section>
        <section className="rounded-lg border border-border bg-card p-5 sm:p-6"><div className="mb-5 flex items-start justify-between gap-2"><div><h2 className="font-display text-lg font-bold">Upcoming</h2><p className="mt-1 text-xs text-muted-foreground">What’s coming up next</p></div><Button variant="ghost" size="icon" asChild aria-label="View all tasks" title="View all tasks"><Link to="/tasks"><ArrowRight className="size-4" /></Link></Button></div><div className="space-y-0">{upcoming.length ? upcoming.map(task => <div key={task.id} className="flex gap-4 border-b border-border py-4 first:pt-0 last:border-0 last:pb-0"><div className="flex w-11 shrink-0 flex-col items-center justify-center rounded-md bg-muted py-1"><span className="text-[10px] font-bold uppercase text-muted-foreground">{format(parseISO(task.dueDate), "MMM")}</span><span className="font-display text-lg font-bold leading-tight">{format(parseISO(task.dueDate), "d")}</span></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{task.title}</p><div className="mt-1.5 flex items-center gap-2"><span className="text-xs text-muted-foreground">{task.category}</span><span className="size-0.5 rounded-full bg-muted-foreground" /><PriorityBadge priority={task.priority} /></div></div></div>) : <p className="py-6 text-sm text-muted-foreground">No upcoming tasks yet.</p>}</div></section>
      </div>
    </div>
    <TaskDialog open={Boolean(editing)} onOpenChange={open => { if (!open) setEditing(null); }} task={editing} /><TaskDialog open={newOpen} onOpenChange={setNewOpen} />
  </div>;
}
