import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { CheckCircle2, Pause, Play, RotateCcw, Square, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge, PriorityBadge } from "@/features/tasks/task-row";
import { useTasks } from "@/features/tasks/task-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/focus")({
  head: () => ({ meta: [{ title: "Focus Mode — Flow Task" }, { name: "description", content: "Pick a task and work on it with a distraction-free 25-minute focus timer." }, { property: "og:title", content: "Focus Mode — Flow Task" }, { property: "og:description", content: "Pick a task and work on it with a distraction-free 25-minute focus timer." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: FocusPage,
});

const DURATION = 25 * 60 * 1000;
const KEY = "flow-task.focus.v1";
type Status = "idle" | "running" | "paused" | "done";
type Session = { taskId: string | null; status: Status; endAt: number | null; remaining: number; reason?: "finished" | "ended" };
const empty: Session = { taskId: null, status: "idle", endAt: null, remaining: DURATION };

function FocusPage() {
  const { tasks, ready, toggleTask } = useTasks();
  const [s, setS] = useState<Session>(empty);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => { try { const raw = localStorage.getItem(KEY); if (raw) setS(JSON.parse(raw) as Session); } catch { /* ignore */ } setLoaded(true); }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(s)); }, [s, loaded]);
  useEffect(() => { if (s.status !== "running") return; const id = setInterval(() => setNow(Date.now()), 250); return () => clearInterval(id); }, [s.status]);

  const remaining = s.status === "running" && s.endAt ? Math.max(0, s.endAt - now) : s.remaining;
  useEffect(() => { if (s.status === "running" && remaining <= 0) setS(v => ({ ...v, status: "done", endAt: null, remaining: 0, reason: "finished" })); }, [remaining, s.status]);

  const task = tasks.find(t => t.id === s.taskId) ?? null;
  const active = tasks.filter(t => !t.completed);
  useEffect(() => { if (ready && loaded && s.taskId && !task && s.status !== "done") setS(empty); }, [ready, loaded, s.taskId, task, s.status]);

  const start = () => {
    if (!task || task.completed) return;
    const startedAt = Date.now();
    setNow(startedAt);
    setS(v => ({ ...v, status: "running", endAt: startedAt + v.remaining }));
  };
  const pause = () => setS(v => ({ ...v, status: "paused", endAt: null, remaining }));
  const end = () => setS(v => ({ ...v, status: "done", endAt: null, remaining, reason: "ended" }));
  const reset = () => setS({ ...empty, taskId: task && !task.completed ? task.id : null });
  const mm = String(Math.floor(remaining / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
  const progress = 1 - remaining / DURATION;
  const inSession = s.status === "running" || s.status === "paused";
  const R = 120, C = 2 * Math.PI * R;

  return <div className="mx-auto max-w-3xl space-y-7 pb-10">
    <div><div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Your workspace / Focus</div><h1 className="font-display text-[28px] font-extrabold leading-tight sm:text-[34px]">Focus mode</h1><p className="mt-2 text-sm text-muted-foreground">Pick one task and give it 25 minutes of undivided attention.</p></div>

    {s.status === "done" ? <section className="animate-fade-in rounded-lg border border-border bg-card px-6 py-12 text-center">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-mint text-mint-foreground"><CheckCircle2 className="size-7" /></div>
      <h2 className="font-display text-2xl font-extrabold">{s.reason === "finished" ? "Session complete!" : "Session ended"}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{s.reason === "finished" ? "Great work — you stayed focused for 25 minutes" : `You focused for ${Math.max(1, Math.round((DURATION - s.remaining) / 60000))} min`}{task ? <> on <span className="font-semibold text-foreground">{task.title}</span>.</> : "."}</p>
      <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
        {task && !task.completed && <Button onClick={() => { toggleTask(task.id); }}><CheckCircle2 className="size-4" />Mark task complete</Button>}
        <Button variant="outline" onClick={reset}><RotateCcw className="size-4" />Focus again</Button>
        <Button variant="outline" asChild><Link to="/tasks" onClick={() => setS(empty)}>Back to tasks</Link></Button>
      </div>
    </section> : <section className="rounded-lg border border-border bg-card p-5 sm:p-8">
      {!inSession && <div className="mb-8"><label className="mb-2 block text-xs font-semibold text-muted-foreground">Task to focus on</label>
        {active.length ? <Select value={s.taskId ?? ""} onValueChange={id => setS({ ...empty, taskId: id })}><SelectTrigger aria-label="Select task" className="field-surface h-11"><SelectValue placeholder="Choose a task…" /></SelectTrigger><SelectContent>{active.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}</SelectContent></Select>
          : <p className="text-sm text-muted-foreground">{ready ? <>No active tasks. <Link to="/tasks" className="font-semibold text-primary underline">Add one</Link> first.</> : "Loading…"}</p>}
      </div>}

      {task && <div className={cn("mb-8 rounded-md border border-border p-4", inSession && "bg-muted/50")}>
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{inSession ? "Now focusing on" : "Selected task"}</p>
        <p className="mt-1.5 font-display text-lg font-bold">{task.title}</p>
        {task.description && <p className="mt-1 text-sm text-muted-foreground">{task.description}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-2"><PriorityBadge priority={task.priority} /><CategoryBadge category={task.category} /><span className="text-xs text-muted-foreground">Due {format(parseISO(task.dueDate), "MMM d")}</span></div>
      </div>}

      <div className="flex flex-col items-center">
        <div className="relative size-[240px] sm:size-[280px]">
          <svg viewBox="0 0 260 260" className="size-full -rotate-90"><circle cx="130" cy="130" r={R} className="fill-none stroke-muted" strokeWidth="8" /><circle cx="130" cy="130" r={R} className="fill-none stroke-primary transition-[stroke-dashoffset] duration-300" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - progress)} /></svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-5xl font-extrabold tabular-nums sm:text-6xl" aria-live="polite">{mm}:{ss}</span><span className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Timer className="size-3.5" />{s.status === "running" ? "Focusing" : s.status === "paused" ? "Paused" : "25 min session"}</span></div>
        </div>
        <div className="mt-8 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {s.status === "idle" && <Button className="h-11 px-8" disabled={!task || task.completed} onClick={start}><Play className="size-4" />Start focus</Button>}
          {s.status === "running" && <Button className="h-11 px-8" onClick={pause}><Pause className="size-4" />Pause</Button>}
          {s.status === "paused" && <Button className="h-11 px-8" onClick={start}><Play className="size-4" />Resume</Button>}
          {inSession && <Button variant="outline" className="h-11 px-6" onClick={end}><Square className="size-4" />End session</Button>}
        </div>
      </div>
    </section>}
  </div>;
}
