import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, LayoutDashboard, ListTodo, Menu, Moon, Plus, Search, Sun, Timer, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { TaskProvider, useTasks } from "@/features/tasks/task-store";
import { TaskDialog } from "@/features/tasks/task-dialog";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() { return <div className="flex min-h-screen flex-col items-center justify-center gap-5"><h1 className="text-3xl font-bold">Page not found</h1><Button asChild><Link to="/">Go to dashboard</Link></Button></div>; }
function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return <div className="flex min-h-screen flex-col items-center justify-center gap-5"><h1 className="text-2xl font-bold">This page didn’t load</h1><Button onClick={() => { router.invalidate(); reset(); }}>Try again</Button></div>;
}
export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [{ charSet: "utf-8" }, { name: "viewport", content: "width=device-width, initial-scale=1" }],
    links: [{ rel: "stylesheet", href: appCss }, { rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});
function RootShell({ children }: { children: ReactNode }) { return <html lang="en" suppressHydrationWarning><head><HeadContent /></head><body>{children}<Scripts /></body></html>; }
function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return <QueryClientProvider client={queryClient}><TaskProvider><AppShell><Outlet /></AppShell></TaskProvider></QueryClientProvider>;
}
function AppShell({ children }: { children: ReactNode }) {
  const { tasks } = useTasks();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("flow-task.theme") === "dark"; setDark(saved); document.documentElement.classList.toggle("dark", saved); }, []);
  const toggleTheme = () => { const next = !dark; setDark(next); document.documentElement.classList.toggle("dark", next); localStorage.setItem("flow-task.theme", next ? "dark" : "light"); };
  const nav = <>
    <div className="px-5 pb-8 pt-7"><Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 text-sidebar-foreground"><span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground dark:bg-mint dark:text-mint-foreground"><span className="font-display text-xl font-extrabold italic">f</span></span>{!collapsed && <span className="font-display text-xl font-extrabold">flow<span className="text-sidebar-muted">task.</span></span>}</Link></div>
    <div className="flex-1 px-3"><p className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-muted ${collapsed ? "hidden" : ""}`}>Workspace</p>
      <nav className="space-y-1" aria-label="Main navigation">
        <Link to="/" activeOptions={{ exact: true }} onClick={() => setMobileOpen(false)} className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active hover:text-sidebar-foreground" activeProps={{ className: "bg-sidebar-active text-sidebar-foreground" }} title="Dashboard"><LayoutDashboard className="size-[18px] shrink-0" />{!collapsed && "Dashboard"}</Link>
        <Link to="/tasks" onClick={() => setMobileOpen(false)} className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active hover:text-sidebar-foreground" activeProps={{ className: "bg-sidebar-active text-sidebar-foreground" }} title="My tasks"><ListTodo className="size-[18px] shrink-0" />{!collapsed && <><span className="flex-1">My tasks</span><span className="rounded bg-sidebar-active px-2 py-0.5 text-[11px] text-sidebar-foreground">{tasks.filter(t => !t.completed).length}</span></>}</Link>
        <Link to="/focus" onClick={() => setMobileOpen(false)} className="flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-sidebar-muted transition-colors hover:bg-sidebar-active hover:text-sidebar-foreground" activeProps={{ className: "bg-sidebar-active text-sidebar-foreground" }} title="Focus mode"><Timer className="size-[18px] shrink-0" />{!collapsed && "Focus mode"}</Link>
      </nav>
      {!collapsed && <><p className="mb-3 mt-10 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-muted">Categories</p><div className="space-y-1 px-3 text-sm text-sidebar-muted">{([["Work", "bg-lilac-foreground"], ["Study", "bg-sky-foreground"], ["Personal", "bg-peach-foreground"]] as const).map(([label, color]) => <div key={label} className="flex h-9 items-center gap-3"><span className={`size-2 rounded-full ${color}`} />{label}<span className="ml-auto text-xs">{tasks.filter(t => t.category === label).length}</span></div>)}</div></>}
    </div>
    <div className="px-3 pb-5"><Button variant="ghost" onClick={() => setCollapsed(v => !v)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="hidden w-full justify-start gap-3 text-sidebar-muted hover:bg-sidebar-active hover:text-sidebar-foreground lg:flex"><span>{collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}</span>{!collapsed && "Collapse sidebar"}</Button><div className="mt-3 flex items-center gap-3 border-t border-sidebar-active px-3 pt-5"><div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-mint font-display text-xs font-bold text-mint-foreground">FT</div>{!collapsed && <div className="min-w-0"><p className="text-sm font-semibold text-sidebar-foreground">Your workspace</p><p className="text-[11px] text-sidebar-muted">Personal plan</p></div>}</div></div>
  </>;
  return <div className="min-h-screen bg-background lg:flex">
    <aside className={`sticky top-0 hidden h-screen shrink-0 flex-col bg-sidebar transition-[width] duration-200 lg:flex ${collapsed ? "w-[72px]" : "w-[238px]"}`}>{nav}</aside>
    {mobileOpen && <div className="fixed inset-0 z-40 bg-sidebar/60 lg:hidden" onClick={() => setMobileOpen(false)} />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-sidebar transition-transform duration-200 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}><Button variant="ghost" size="icon" aria-label="Close menu" className="absolute right-3 top-6 text-sidebar-foreground" onClick={() => setMobileOpen(false)}><X /></Button>{nav}</aside>
    <div className="min-w-0 flex-1"><header className="sticky top-0 z-30 flex h-[74px] items-center justify-between border-b border-border bg-card/95 px-5 backdrop-blur-md sm:px-8 xl:px-11"><div className="flex items-center gap-4"><Button variant="ghost" size="icon" aria-label="Open menu" className="lg:hidden" onClick={() => setMobileOpen(true)}><Menu /></Button><div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex"><CalendarDays className="size-4" /><span>{format(new Date(), "EEEE, MMMM d, yyyy")}</span></div><span className="text-sm font-semibold sm:hidden">Flow Task</span></div><div className="flex items-center gap-2 sm:gap-4"><Button variant="ghost" size="icon" aria-label="Search tasks" title="Search tasks" asChild><Link to="/tasks"><Search className="size-[18px]" /></Link></Button><Button variant="ghost" size="icon" aria-label={dark ? "Use light mode" : "Use dark mode"} title={dark ? "Use light mode" : "Use dark mode"} onClick={toggleTheme}>{dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}</Button><span className="hidden h-7 w-px bg-border sm:block" /><Button onClick={() => setDialogOpen(true)} className="h-9 px-3 sm:px-4"><Plus className="size-4" /><span className="hidden sm:inline">New task</span><span className="sm:hidden">New</span></Button></div></header><main className="mx-auto max-w-[1560px] px-5 py-7 sm:px-8 sm:py-9 xl:px-11">{children}</main></div>
    <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} />
  </div>;
}
