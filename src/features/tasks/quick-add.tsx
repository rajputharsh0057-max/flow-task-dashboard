import { useMemo, useState } from "react";
import { addDays, format, isValid, nextDay, parse, setDay, startOfToday, type Day } from "date-fns";
import { ArrowRight, CalendarDays, Flag, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasks, type Priority } from "./task-store";

type ParsedTask = { title: string; dueDate: string | null; priority: Priority | null };

const WEEKDAYS: Record<string, Day> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
};
const weekday = (m: RegExpMatchArray): Day => WEEKDAYS[(m[1] ?? "").toLowerCase()] ?? 0;

function parseQuickAdd(raw: string): ParsedTask {
  let text = raw.trim();
  let priority: Priority | null = null;
  let dueDate: string | null = null;
  const today = startOfToday();

  const priorityMatch = text.match(/\b(high|medium|low)\s+priority\b|\burgent\b|\b!(high|medium|low)\b/i);
  if (priorityMatch) {
    const word = (priorityMatch[1] ?? priorityMatch[2] ?? "high").toLowerCase();
    priority = (word.charAt(0).toUpperCase() + word.slice(1)) as Priority;
    text = text.replace(priorityMatch[0], " ");
  }

  const datePatterns: { re: RegExp; resolve: (m: RegExpMatchArray) => Date | null }[] = [
    { re: /\bday after tomorrow\b/i, resolve: () => addDays(today, 2) },
    { re: /\btomorrow\b/i, resolve: () => addDays(today, 1) },
    { re: /\btoday\b|\btonight\b/i, resolve: () => today },
    { re: /\bnext week\b/i, resolve: () => addDays(today, 7) },
    { re: /\bin\s+(\d+)\s+days?\b/i, resolve: m => addDays(today, Number(m[1])) },
    { re: /\bnext\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i, resolve: m => nextDay(today, weekday(m)) },
    { re: /\bthis\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i, resolve: m => { const d = setDay(today, weekday(m)); return d < today ? addDays(d, 7) : d; } },
    { re: /\bon\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i, resolve: m => { const d = setDay(today, weekday(m)); return d < today ? addDays(d, 7) : d; } },
    { re: /\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/i, resolve: m => { const d = setDay(today, weekday(m)); return d < today ? addDays(d, 7) : d; } },
    { re: /\b(\d{4}-\d{2}-\d{2})\b/, resolve: m => { const d = parse(m[1] ?? "", "yyyy-MM-dd", today); return isValid(d) ? d : null; } },
    { re: /\b(?:on\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?\b/i, resolve: m => { const d = parse(`${m[1] ?? ""} ${m[2] ?? ""}`, "MMM d", today); if (!isValid(d)) return null; return d < today ? addDays(d, 365) : d; } },
  ];

  for (const { re, resolve } of datePatterns) {
    const match = text.match(re);
    if (match) {
      const date = resolve(match);
      if (date) {
        dueDate = format(date, "yyyy-MM-dd");
        text = text.replace(match[0], " ");
        break;
      }
    }
  }

  const title = text.replace(/[,\s]+/g, " ").replace(/\s+(by|due|at)$/i, "").trim();
  return { title, dueDate, priority };
}

export function QuickAdd() {
  const { createTask } = useTasks();
  const [value, setValue] = useState("");
  const [added, setAdded] = useState(false);
  const parsed = useMemo(() => parseQuickAdd(value), [value]);
  const showPreview = parsed.title.length > 0;

  function confirm() {
    if (!parsed.title) return;
    createTask({
      title: parsed.title,
      description: "",
      priority: parsed.priority ?? "Medium",
      dueDate: parsed.dueDate ?? format(new Date(), "yyyy-MM-dd"),
      category: "Personal",
    });
    setValue("");
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex size-8 items-center justify-center rounded-md bg-lilac text-lilac-foreground"><Sparkles className="size-4" /></span>
        <div>
          <h2 className="font-display text-lg font-bold leading-tight">Quick add</h2>
          <p className="text-xs text-muted-foreground">Try “Finish DBMS assignment tomorrow, high priority”</p>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && showPreview) confirm(); if (e.key === "Escape") setValue(""); }}
          placeholder="Describe your task in plain words…"
          aria-label="Quick add task"
          className="field-surface h-11 flex-1"
          maxLength={200}
        />
        {showPreview ? (
          <Button onClick={confirm} className="h-11 shrink-0 px-5">Add task <ArrowRight className="size-4" /></Button>
        ) : null}
      </div>
      {showPreview ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-md border border-dashed border-border bg-muted/50 px-4 py-3 text-sm">
          <span className="min-w-0 flex-1 basis-full truncate font-semibold sm:basis-auto">{parsed.title}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            {parsed.dueDate ? format(parse(parsed.dueDate, "yyyy-MM-dd", new Date()), "EEE, MMM d") : "Due today"}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Flag className="size-3.5" />
            {parsed.priority ?? "Medium"} priority
          </span>
          <button type="button" onClick={() => setValue("")} aria-label="Clear" className="ml-auto text-muted-foreground transition-colors hover:text-foreground"><X className="size-4" /></button>
        </div>
      ) : null}
      {added ? <p className="mt-3 text-xs font-semibold text-mint-foreground">Task added to your list.</p> : null}
    </section>
  );
}
