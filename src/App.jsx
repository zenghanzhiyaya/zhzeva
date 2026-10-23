import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutGrid,
  Users,
  CheckSquare,
  StickyNote,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  CheckCircle2,
  Layers,
  MessageCircle,
  Contact,
  FileSpreadsheet,
  Settings as SettingsIcon,
  CalendarDays,
  Pencil,
  Check,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Design tokens — "desk lamp" workspace: dark charcoal-blue desk, warm amber
// spotlight on whichever tool you're using.
// ---------------------------------------------------------------------------
// Colors are CSS variables so the theme can be switched in Settings.
const BG = "var(--wb-bg)"; // background
const PANEL = "var(--wb-panel)"; // card / panel surface
const PANEL_LINE = "var(--wb-line)";
const AMBER = "var(--wb-accent)"; // button / accent color
const AMBER_SOFT = "var(--wb-accent-soft)";
const ON_ACCENT = "var(--wb-on-accent)"; // text on accent-colored buttons
const SIDEBAR = "var(--wb-sidebar)";
const TEXT = "var(--wb-text)";
const SUBTEXT = "var(--wb-subtext)";
const DANGER = "#E3796B";
const DONE = "#6EE7C9";

const THEMES = [
  { key: "navy", name: "Navy & Teal", bg: "#334355", panel: "#3D4E63", line: "#4C5F77", accent: "#66FCFC", onAccent: "#344356", sidebar: "#28323F", text: "#FFFFFF", subtext: "#B3BCCA" },
  { key: "sage", name: "Sage Green", bg: "#4A5A50", panel: "#566A5E", line: "#6A8074", accent: "#C9D8B6", onAccent: "#34423A", sidebar: "#3B4840", text: "#FFFFFF", subtext: "#C3CDC5" },
  { key: "dustyrose", name: "Dusty Rose", bg: "#5E4B50", panel: "#6E5A60", line: "#85707A", accent: "#E8C4C4", onAccent: "#4A363C", sidebar: "#4B3B40", text: "#FFFFFF", subtext: "#D4C3C6" },
  { key: "mistblue", name: "Mist Blue", bg: "#46566A", panel: "#536479", line: "#687C94", accent: "#B7CBE0", onAccent: "#2F3E52", sidebar: "#38465A", text: "#FFFFFF", subtext: "#BFCAD7" },
  { key: "lavender", name: "Lavender Gray", bg: "#555064", panel: "#645E75", line: "#7A748D", accent: "#CFC6E3", onAccent: "#3E3950", sidebar: "#444051", text: "#FFFFFF", subtext: "#CAC6D6" },
  { key: "clay", name: "Terracotta Clay", bg: "#5F4F48", panel: "#6F5D55", line: "#86726A", accent: "#E3B9A0", onAccent: "#4B3A33", sidebar: "#4B3E38", text: "#FFFFFF", subtext: "#D6C7BF" },
  { key: "oat", name: "Oat & Mocha", bg: "#57504A", panel: "#675F58", line: "#7F766E", accent: "#E4D5BC", onAccent: "#443D36", sidebar: "#463F3A", text: "#FFFFFF", subtext: "#D2CBC2" },
  { key: "slate", name: "Smoky Slate", bg: "#3F4448", panel: "#4B5156", line: "#5F676D", accent: "#B8C4C0", onAccent: "#2C3135", sidebar: "#31353A", text: "#FFFFFF", subtext: "#B9C0C2" },
];
const THEME_KEY = "workbench-theme";

function applyTheme(key) {
  const t = THEMES.find((x) => x.key === key) || THEMES[0];
  const root = document.documentElement;
  const set = (k, v) => root.style.setProperty(k, v);
  set("--wb-bg", t.bg);
  set("--wb-panel", t.panel);
  set("--wb-line", t.line);
  set("--wb-accent", t.accent);
  const n = parseInt(t.accent.slice(1), 16);
  set("--wb-accent-soft", `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.16)`);
  set("--wb-on-accent", t.onAccent);
  set("--wb-sidebar", t.sidebar);
  set("--wb-text", t.text);
  set("--wb-subtext", t.subtext);
  document.body.style.backgroundColor = t.bg;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t.bg);
}
function savedThemeKey() {
  try {
    return localStorage.getItem(THEME_KEY) || "navy";
  } catch {
    return "navy"
  }
}
applyTheme(savedThemeKey());

const FONT = '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "notes", label: "Quick Notes", icon: StickyNote },
  { key: "todos", label: "To-Do", icon: CheckSquare },
  { key: "comms", label: "Follow-ups", icon: MessageCircle },
  { key: "tasks", label: "Tasks", icon: Layers },
  { key: "close", label: "Close Plan", icon: CalendarDays },
  { key: "meetings", label: "Meetings", icon: Users },
  { key: "contacts", label: "Contacts", icon: Contact },
  { key: "je", label: "JE Tracker", icon: FileSpreadsheet },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

const STORE_KEYS = {
  meetings: "workbench-meetings",
  todos: "workbench-todos",
  tasks: "workbench-tasks",
  comms: "workbench-comms",
  contacts: "workbench-contacts",
  notes: "workbench-notes",
  je: "workbench-je-tracker",
  close: "workbench-close-plan",
};

const TASK_STATUS = {
  todo: { label: "Not Started", color: "#A8B3C7" },
  doing: { label: "In Progress", color: "#4FC3F7" },
  done: { label: "Done", color: "#4ADE80" },
  stuck: { label: "Stuck", color: "#F87171" },
};

const COMM_STATUS = {
  tobesend: { label: "To Be Sent", color: "#C4A7F5" },
  waiting: { label: "Waiting Reply", color: "#FBBF24" },
  pending: { label: "Pending", color: "#FB923C" },
  done: { label: "Done", color: "#4ADE80" },
};

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// Standalone deployments don't have Claude's window.storage API, so we back
// the same get/set interface with the browser's localStorage instead.
const storage = {
  async get(key) {
    const raw = localStorage.getItem(key);
    return raw !== null ? { value: raw } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { value };
  },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Small shared pieces
// ---------------------------------------------------------------------------
const LockCtx = createContext(false);
const OPT_STYLE = { color: "#111111", backgroundColor: "#FFFFFF" };
const badgeStyle = (c) => ({ color: c, borderColor: c, backgroundColor: c + "30" });
const lockedStyle = (locked) =>
  locked
    ? { borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.05)", color: TEXT }
    : { borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" };

// Text input that turns into plain text while its card is locked.
function LockInput({ className = "", style, onFocus, onBlur, ...props }) {
  const locked = useContext(LockCtx);
  if (locked && props.type === "date") {
    return (
      <div style={{ ...lockedStyle(true), ...style }} className={className + " border"}>
        {props.value || "—"}
      </div>
    );
  }
  return (
    <input
      {...props}
      readOnly={locked}
      tabIndex={locked ? -1 : undefined}
      onFocus={locked ? undefined : onFocus}
      onBlur={locked ? undefined : onBlur}
      style={{ ...lockedStyle(locked), ...style }}
      className={className + " outline-none" + (locked ? " cursor-default" : "")}
    />
  );
}

function EditToggle({ editing, onClick }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={editing ? { backgroundColor: AMBER, color: ON_ACCENT, borderColor: AMBER } : { color: AMBER, borderColor: AMBER }}
      className="flex items-center gap-1 text-xs font-semibold rounded-full border px-3 py-1 hover:brightness-110 transition-all"
    >
      {editing ? <Check size={13} /> : <Pencil size={12} />}
      {editing ? "Done" : "Edit"}
    </button>
  );
}

// Wraps an expanded card body: everything inside is read-only until "Edit" is clicked.
function EditPanel({ initialEditing, className, children }) {
  const [editing, setEditing] = useState(!!initialEditing);
  return (
    <LockCtx.Provider value={!editing}>
      <div className={className}>
        <div className="flex justify-end">
          <EditToggle editing={editing} onClick={() => setEditing((v) => !v)} />
        </div>
        {children}
      </div>
    </LockCtx.Provider>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">
        {label}
      </span>
      <LockInput
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm rounded-md border px-2.5 py-1.5 min-h-[34px]"
        onFocus={(e) => (e.target.style.borderColor = AMBER)}
        onBlur={(e) => (e.target.style.borderColor = PANEL_LINE)}
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div className="flex flex-col gap-1">
      <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">
        {label}
      </span>
      <AutoTextArea value={value} onChange={onChange} placeholder={placeholder} minHeight={`${rows * 24 + 12}px`} />
    </div>
  );
}

function IconBtn({ onClick, children, danger }) {
  return (
    <button
      onClick={onClick}
      style={{ color: danger ? DANGER : SUBTEXT }}
      className="opacity-70 hover:opacity-100 transition-opacity shrink-0"
    >
      {children}
    </button>
  );
}

function PrimaryButton({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundColor: AMBER, color: ON_ACCENT }}
      className="flex items-center gap-1.5 text-sm font-semibold rounded-full px-4 py-1.5 hover:brightness-110 transition-all"
    >
      {children}
    </button>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ color: SUBTEXT }} className="text-sm italic text-center py-10 opacity-70">
      {text}
    </div>
  );
}

function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
      <div>
        <h2 style={{ color: TEXT }} className="text-xl font-bold">
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: SUBTEXT }} className="text-xs mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Meetings
// ---------------------------------------------------------------------------
function newMeeting() {
  return {
    id: uid("mt"),
    title: "",
    date: todayStr(),
    attendees: "",
    notes: "",
    actions: [],
    open: true,
  };
}

function MeetingsView({ meetings, setMeetings }) {
  const update = (id, patch) =>
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const remove = (id) => setMeetings((prev) => prev.filter((m) => m.id !== id));
  const add = () => setMeetings((prev) => [newMeeting(), ...prev]);
  const toggleOpen = (id) => update(id, { open: !meetings.find((m) => m.id === id).open });

  const addAction = (id) => {
    const m = meetings.find((x) => x.id === id);
    update(id, { actions: [...m.actions, { id: uid("act"), text: "", done: false }] });
  };
  const updateAction = (id, actionId, patch) => {
    const m = meetings.find((x) => x.id === id);
    update(id, {
      actions: m.actions.map((a) => (a.id === actionId ? { ...a, ...patch } : a)),
    });
  };
  const removeAction = (id, actionId) => {
    const m = meetings.find((x) => x.id === id);
    update(id, { actions: m.actions.filter((a) => a.id !== actionId) });
  };

  return (
    <div>
      <SectionHeader
        title="Meetings"
        subtitle="Capture key points, track action items"
        action={
          <PrimaryButton onClick={add}>
            <Plus size={15} /> New Meeting
          </PrimaryButton>
        }
      />
      {meetings.length === 0 && <EmptyState text='No meetings yet — click "New Meeting" to start.' />}
      <div className="flex flex-col gap-3">
        {meetings.map((m) => (
          <div key={m.id} style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg overflow-hidden">
            <div
              onClick={() => toggleOpen(m.id)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
            >
              {m.open ? <ChevronDown size={16} color={SUBTEXT} /> : <ChevronRight size={16} color={SUBTEXT} />}
              <span style={{ color: TEXT }} className="font-semibold text-sm flex-1 truncate">
                {m.title || "Untitled meeting"}
              </span>
              <span style={{ color: SUBTEXT }} className="text-xs shrink-0">
                {m.date}
              </span>
              <IconBtn danger onClick={(e) => { e.stopPropagation(); remove(m.id); }}>
                <Trash2 size={15} />
              </IconBtn>
            </div>
            {m.open && (
              <EditPanel initialEditing={!m.title} className="px-4 pb-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Meeting Title" value={m.title} onChange={(v) => update(m.id, { title: v })} placeholder="e.g. Quarterly business review" />
                  <Field label="Date" type="date" value={m.date} onChange={(v) => update(m.id, { date: v })} />
                  <Field label="Attendees" value={m.attendees} onChange={(v) => update(m.id, { attendees: v })} placeholder="e.g. Alex, Jamie" />
                </div>
                <div className="flex flex-col gap-1">
                  <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Meeting Notes</span>
                  <AutoTextArea minHeight="110px" value={m.notes} onChange={(v) => update(m.id, { notes: v })} placeholder="Discussion points, decisions…" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Action Items</span>
                    <button onClick={() => addAction(m.id)} style={{ color: AMBER }} className="text-xs font-semibold flex items-center gap-1">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {m.actions.length === 0 && (
                      <span style={{ color: SUBTEXT }} className="text-xs italic opacity-60">No action items yet</span>
                    )}
                    {m.actions.map((a) => (
                      <div key={a.id} className="flex items-center gap-2">
                        <button onClick={() => updateAction(m.id, a.id, { done: !a.done })}>
                          {a.done ? <CheckCircle2 size={16} color={DONE} /> : <Circle size={16} color={SUBTEXT} />}
                        </button>
                        <LockInput
                          value={a.text}
                          onChange={(e) => updateAction(m.id, a.id, { text: e.target.value })}
                          placeholder="Action item"
                          style={{
                            color: a.done ? SUBTEXT : TEXT,
                            textDecoration: a.done ? "line-through" : "none",
                            borderColor: "transparent",
                            backgroundColor: "transparent",
                          }}
                          className="flex-1 min-w-0 text-sm border-b focus:border-b"
                          onFocus={(e) => (e.target.style.borderColor = PANEL_LINE)}
                          onBlur={(e) => (e.target.style.borderColor = "transparent")}
                        />
                        <IconBtn danger onClick={() => removeAction(m.id, a.id)}>
                          <Trash2 size={13} />
                        </IconBtn>
                      </div>
                    ))}
                  </div>
                </div>
              </EditPanel>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// To-do list
// ---------------------------------------------------------------------------
const PRIORITIES = { high: { label: "High", color: "#F87171" }, medium: { label: "Medium", color: "#FBBF24" }, low: { label: "Low", color: "#60A5FA" } };

function TodoRow({ t, setTodos, toggle, remove }) {
  const [editing, setEditing] = useState(false);
  const patch = (p) => setTodos((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...p } : x)));
  return (
    <LockCtx.Provider value={!editing}>
      <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-md px-3 py-2 flex items-center gap-3">
        <button onClick={() => toggle(t.id)}>
          {t.done ? <CheckCircle2 size={18} color={DONE} /> : <Circle size={18} color={SUBTEXT} />}
        </button>
        <LockInput
          value={t.text}
          onChange={(e) => patch({ text: e.target.value })}
          style={{ color: t.done ? SUBTEXT : TEXT, textDecoration: t.done ? "line-through" : "none" }}
          className="flex-1 min-w-0 text-sm rounded-md border px-2 py-1"
        />
        <LockInput
          type="date"
          value={t.due || ""}
          onChange={(e) => patch({ due: e.target.value })}
          style={{ color: SUBTEXT }}
          className="text-xs shrink-0 rounded-md border px-2 py-1"
        />
        <select
          value={t.priority}
          onChange={(e) => patch({ priority: e.target.value })}
          style={badgeStyle(PRIORITIES[t.priority].color)}
          className="text-[11px] font-bold border rounded px-1.5 py-0.5 shrink-0 outline-none"
        >
          {Object.entries(PRIORITIES).map(([key, p]) => (
            <option key={key} value={key} style={OPT_STYLE}>{p.label}</option>
          ))}
        </select>
        <IconBtn onClick={() => setEditing((v) => !v)}>
          {editing ? <Check size={16} color={AMBER} /> : <Pencil size={15} />}
        </IconBtn>
        <IconBtn danger onClick={() => remove(t.id)}>
          <Trash2 size={15} />
        </IconBtn>
      </div>
    </LockCtx.Provider>
  );
}

function TodosView({ todos, setTodos }) {
  const [draft, setDraft] = useState("");
  const [due, setDue] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("open"); // open | all | done

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setTodos((prev) => [{ id: uid("td"), text, done: false, priority, due }, ...prev]);
    setDraft("");
    setDue("");
  };
  const toggle = (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));

  const visible = todos.filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done));
  const sorted = [...visible].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div>
      <SectionHeader title="To-Do" subtitle="Manage your tasks by priority" />

      <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg p-3 mb-4 flex flex-col sm:flex-row gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Add a new task…"
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="flex-1 text-sm rounded-md border px-2.5 py-1.5 outline-none"
        />
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="text-sm rounded-md border px-2.5 py-1.5 outline-none"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="text-sm rounded-md border px-2.5 py-1.5 outline-none"
        >
          <option value="high" style={OPT_STYLE}>High priority</option>
          <option value="medium" style={OPT_STYLE}>Medium priority</option>
          <option value="low" style={OPT_STYLE}>Low priority</option>
        </select>
        <PrimaryButton onClick={add}>
          <Plus size={15} /> Add
        </PrimaryButton>
      </div>

      <div className="flex gap-2 mb-3">
        {[
          ["open", "In Progress"],
          ["done", "Done"],
          ["all", "All"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              backgroundColor: filter === key ? AMBER_SOFT : "transparent",
              color: filter === key ? AMBER : SUBTEXT,
              borderColor: filter === key ? AMBER : PANEL_LINE,
            }}
            className="text-xs font-semibold rounded-full border px-3 py-1"
          >
            {label}
          </button>
        ))}
      </div>

      {sorted.length === 0 && <EmptyState text="Nothing here yet." />}
      <div className="flex flex-col gap-1.5">
        {sorted.map((t) => (
          <TodoRow key={t.id} t={t} setTodos={setTodos} toggle={toggle} remove={remove} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task tracking (project-based, with status stages)
// ---------------------------------------------------------------------------
function newTask() {
  return { id: uid("tk"), title: "", project: "", status: "todo", owner: "", due: "", notes: "", open: true };
}

function TasksView({ tasks, setTasks }) {
  const [filter, setFilter] = useState("all");
  const update = (id, patch) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const add = () => setTasks((prev) => [newTask(), ...prev]);
  const toggleOpen = (id) => update(id, { open: !tasks.find((t) => t.id === id).open });

  const visible = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  // group by project, keeping "Unsorted" last
  const groups = useMemo(() => {
    const map = new Map();
    visible.forEach((t) => {
      const key = t.project.trim() || "Unsorted";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(t);
    });
    const entries = [...map.entries()];
    entries.sort((a, b) => (a[0] === "Unsorted" ? 1 : b[0] === "Unsorted" ? -1 : a[0].localeCompare(b[0])));
    return entries;
  }, [visible]);

  return (
    <div>
      <SectionHeader
        title="Tasks"
        subtitle="Grouped by project, tracked by status"
        action={
          <PrimaryButton onClick={add}>
            <Plus size={15} /> New Task
          </PrimaryButton>
        }
      />

      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          style={{
            backgroundColor: filter === "all" ? AMBER_SOFT : "transparent",
            color: filter === "all" ? AMBER : SUBTEXT,
            borderColor: filter === "all" ? AMBER : PANEL_LINE,
          }}
          className="text-xs font-semibold rounded-full border px-3 py-1"
        >
          All
        </button>
        {Object.entries(TASK_STATUS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              backgroundColor: filter === key ? AMBER_SOFT : "transparent",
              color: filter === key ? s.color : SUBTEXT,
              borderColor: filter === key ? s.color : PANEL_LINE,
            }}
            className="text-xs font-semibold rounded-full border px-3 py-1"
          >
            {s.label}
          </button>
        ))}
      </div>

      {visible.length === 0 && <EmptyState text="No tasks match this filter." />}

      <div className="flex flex-col gap-5">
        {groups.map(([project, list]) => (
          <div key={project}>
            <div style={{ color: SUBTEXT }} className="text-xs font-bold uppercase tracking-wide mb-2">
              {project} <span className="opacity-60">· {list.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {list.map((t) => (
                <div key={t.id} style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg overflow-hidden">
                  <div onClick={() => toggleOpen(t.id)} className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none">
                    {t.open ? <ChevronDown size={16} color={SUBTEXT} /> : <ChevronRight size={16} color={SUBTEXT} />}
                    <span style={{ color: TEXT }} className="font-semibold text-sm flex-1 truncate">
                      {t.title || "Untitled task"}
                    </span>
                    {t.owner && (
                      <span style={{ color: SUBTEXT }} className="text-xs shrink-0 hidden sm:block">
                        {t.owner}
                      </span>
                    )}
                    {t.due && (
                      <span style={{ color: SUBTEXT }} className="text-xs shrink-0">
                        {t.due}
                      </span>
                    )}
                    <span
                      style={badgeStyle(TASK_STATUS[t.status].color)}
                      className="text-[10px] font-bold border rounded px-1.5 py-0.5 shrink-0"
                    >
                      {TASK_STATUS[t.status].label}
                    </span>
                    <IconBtn danger onClick={(e) => { e.stopPropagation(); remove(t.id); }}>
                      <Trash2 size={15} />
                    </IconBtn>
                  </div>
                  {t.open && (
                    <EditPanel initialEditing={!t.title} className="px-4 pb-4 flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Task Name" value={t.title} onChange={(v) => update(t.id, { title: v })} placeholder="e.g. Finish requirements doc" />
                        <Field label="Project" value={t.project} onChange={(v) => update(t.id, { project: v })} placeholder="e.g. Website redesign" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="flex flex-col gap-1">
                          <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Status</span>
                          <select
                            value={t.status}
                            onChange={(e) => update(t.id, { status: e.target.value })}
                            style={badgeStyle(TASK_STATUS[t.status].color)}
                            className="text-sm font-semibold rounded-md border px-2.5 py-1.5 outline-none"
                          >
                            {Object.entries(TASK_STATUS).map(([key, s]) => (
                              <option key={key} value={key} style={OPT_STYLE}>{s.label}</option>
                            ))}
                          </select>
                        </label>
                        <Field label="Owner" value={t.owner} onChange={(v) => update(t.id, { owner: v })} placeholder="e.g. Sam" />
                        <Field label="Due Date" type="date" value={t.due} onChange={(v) => update(t.id, { due: v })} />
                      </div>
                      <TextAreaField label="Notes" value={t.notes} onChange={(v) => update(t.id, { notes: v })} placeholder="Progress, blockers, next steps…" rows={3} />
                    </EditPanel>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Communication follow-up
// ---------------------------------------------------------------------------
function CommsView({ comms, setComms }) {
  const [draftSubject, setDraftSubject] = useState("");
  const [draftContact, setDraftContact] = useState("");
  const [draftStatus, setDraftStatus] = useState("tobesend");
  const [filter, setFilter] = useState("all");

  const add = () => {
    const subject = draftSubject.trim();
    if (!subject) return;
    setComms((prev) => [
      { id: uid("cm"), subject, contact: draftContact.trim(), status: draftStatus, date: todayStr(), notes: "", open: true },
      ...prev,
    ]);
    setDraftSubject("");
    setDraftContact("");
  };
  const update = (id, patch) => setComms((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id) => setComms((prev) => prev.filter((c) => c.id !== id));
  const toggleOpen = (id) => update(id, { open: !comms.find((c) => c.id === id).open });

  const visible = filter === "all" ? comms : comms.filter((c) => c.status === filter);

  return (
    <div>
      <SectionHeader title="Follow-ups" subtitle="Track who you're waiting on and what's still open" />

      <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg p-3 mb-4 flex flex-col sm:flex-row gap-2">
        <input
          value={draftSubject}
          onChange={(e) => setDraftSubject(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="e.g. Waiting on procurement to confirm budget"
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="flex-1 text-sm rounded-md border px-2.5 py-1.5 outline-none"
        />
        <input
          value={draftContact}
          onChange={(e) => setDraftContact(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Who, e.g. Procurement — Lee"
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="sm:w-52 text-sm rounded-md border px-2.5 py-1.5 outline-none"
        />
        <select
          value={draftStatus}
          onChange={(e) => setDraftStatus(e.target.value)}
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="text-sm rounded-md border px-2.5 py-1.5 outline-none"
        >
          {Object.entries(COMM_STATUS).map(([key, s]) => (
            <option key={key} value={key} style={OPT_STYLE}>{s.label}</option>
          ))}
        </select>
        <PrimaryButton onClick={add}>
          <Plus size={15} /> Add
        </PrimaryButton>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          style={{
            backgroundColor: filter === "all" ? AMBER_SOFT : "transparent",
            color: filter === "all" ? AMBER : SUBTEXT,
            borderColor: filter === "all" ? AMBER : PANEL_LINE,
          }}
          className="text-xs font-semibold rounded-full border px-3 py-1"
        >
          All
        </button>
        {Object.entries(COMM_STATUS).map(([key, s]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              backgroundColor: filter === key ? AMBER_SOFT : "transparent",
              color: filter === key ? s.color : SUBTEXT,
              borderColor: filter === key ? s.color : PANEL_LINE,
            }}
            className="text-xs font-semibold rounded-full border px-3 py-1"
          >
            {s.label}
          </button>
        ))}
      </div>

      {visible.length === 0 && <EmptyState text="No follow-ups match this filter." />}
      <div className="flex flex-col gap-2">
        {visible.map((c) => (
          <div key={c.id} style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg overflow-hidden">
            <div onClick={() => toggleOpen(c.id)} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer select-none">
              {c.open ? <ChevronDown size={16} color={SUBTEXT} /> : <ChevronRight size={16} color={SUBTEXT} />}
              <div className="flex-1 min-w-0">
                <div style={{ color: TEXT }} className="text-sm font-medium truncate">{c.subject || "Untitled follow-up"}</div>
                {c.contact && <div style={{ color: SUBTEXT }} className="text-xs mt-0.5 truncate">{c.contact}</div>}
              </div>
              <span style={{ color: SUBTEXT }} className="text-xs shrink-0 hidden sm:block">{c.date}</span>
              <select
                value={c.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => update(c.id, { status: e.target.value })}
                style={badgeStyle(COMM_STATUS[c.status].color)}
                className="text-[10px] font-bold border rounded px-1.5 py-0.5 shrink-0 outline-none"
              >
                {Object.entries(COMM_STATUS).map(([key, s]) => (
                  <option key={key} value={key} style={OPT_STYLE}>{s.label}</option>
                ))}
              </select>
              <IconBtn danger onClick={(e) => { e.stopPropagation(); remove(c.id); }}>
                <Trash2 size={15} />
              </IconBtn>
            </div>
            {c.open && (
              <EditPanel initialEditing={!c.subject} className="px-3 pb-3 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Subject" value={c.subject} onChange={(v) => update(c.id, { subject: v })} placeholder="What's this about" />
                  <Field label="Contact" value={c.contact} onChange={(v) => update(c.id, { contact: v })} placeholder="Who this involves" />
                </div>
                <TextAreaField label="Notes" value={c.notes} onChange={(v) => update(c.id, { notes: v })} placeholder="What was said, what's needed next…" rows={3} />
              </EditPanel>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
// ---------------------------------------------------------------------------
// Contacts / collaborator notes
// ---------------------------------------------------------------------------
function newContact() {
  return { id: uid("ct"), name: "", role: "", contactInfo: "", notes: "", open: true };
}

function ContactsView({ contacts, setContacts }) {
  const update = (id, patch) => setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id) => setContacts((prev) => prev.filter((c) => c.id !== id));
  const add = () => setContacts((prev) => [newContact(), ...prev]);
  const toggleOpen = (id) => update(id, { open: !contacts.find((c) => c.id === id).open });

  return (
    <div>
      <SectionHeader
        title="Contacts"
        subtitle="Who owns what, how to reach them, notes for next time"
        action={
          <PrimaryButton onClick={add}>
            <Plus size={15} /> New Contact
          </PrimaryButton>
        }
      />
      {contacts.length === 0 && <EmptyState text='No contacts yet — click "New Contact" to start.' />}
      <div className="flex flex-col gap-3">
        {contacts.map((c) => (
          <div key={c.id} style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg overflow-hidden">
            <div onClick={() => toggleOpen(c.id)} className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none">
              {c.open ? <ChevronDown size={16} color={SUBTEXT} /> : <ChevronRight size={16} color={SUBTEXT} />}
              <span style={{ color: TEXT }} className="font-semibold text-sm flex-1 truncate">
                {c.name || "Unnamed contact"}
              </span>
              {c.role && (
                <span style={{ color: SUBTEXT }} className="text-xs shrink-0 hidden sm:block">
                  {c.role}
                </span>
              )}
              <IconBtn danger onClick={(e) => { e.stopPropagation(); remove(c.id); }}>
                <Trash2 size={15} />
              </IconBtn>
            </div>
            {c.open && (
              <EditPanel initialEditing={!c.name} className="px-4 pb-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Name" value={c.name} onChange={(v) => update(c.id, { name: v })} placeholder="e.g. Alex Chen" />
                  <Field label="Role / Org" value={c.role} onChange={(v) => update(c.id, { role: v })} placeholder="e.g. Vendor — Sales Manager" />
                  <Field label="Contact Info" value={c.contactInfo} onChange={(v) => update(c.id, { contactInfo: v })} placeholder="Phone / email / IM" />
                </div>
                <TextAreaField label="Notes" value={c.notes} onChange={(v) => update(c.id, { notes: v })} placeholder="What they own, things to watch for, past history…" rows={3} />
              </EditPanel>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick notes ("etc." catch-all)
// ---------------------------------------------------------------------------
function NoteRow({ n, setNotes, remove }) {
  const [editing, setEditing] = useState(false);
  return (
    <LockCtx.Provider value={!editing}>
      <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-md px-3 py-2 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <AutoTextArea
            value={n.text}
            onChange={(v) => setNotes((prev) => prev.map((x) => (x.id === n.id ? { ...x, text: v } : x)))}
            placeholder="Note…"
          />
        </div>
        <span style={{ color: SUBTEXT }} className="text-[11px] shrink-0 pt-1.5">
          {new Date(n.createdAt).toLocaleDateString("zh-CN")}
        </span>
        <div className="pt-1.5 flex gap-3">
          <IconBtn onClick={() => setEditing((v) => !v)}>
            {editing ? <Check size={16} color={AMBER} /> : <Pencil size={15} />}
          </IconBtn>
          <IconBtn danger onClick={() => remove(n.id)}>
            <Trash2 size={15} />
          </IconBtn>
        </div>
      </div>
    </LockCtx.Provider>
  );
}

function NotesView({ notes, setNotes }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [{ id: uid("nt"), text, createdAt: new Date().toISOString() }, ...prev]);
    setDraft("");
  };
  const remove = (id) => setNotes((prev) => prev.filter((n) => n.id !== id));

  return (
    <div>
      <SectionHeader title="Quick Notes" subtitle="Jot something down, no need to categorize" />
      <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg p-3 mb-4 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Write something…"
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="flex-1 text-sm rounded-md border px-2.5 py-1.5 outline-none"
        />
        <PrimaryButton onClick={add}>
          <Plus size={15} /> Save
        </PrimaryButton>
      </div>
      {notes.length === 0 && <EmptyState text="No quick notes yet." />}
      <div className="flex flex-col gap-2">
        {notes.map((n) => (
          <NoteRow key={n.id} n={n} setNotes={setNotes} remove={remove} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Entries (journal entries uploaded)
// ---------------------------------------------------------------------------
const ENTRY_STATUS = {
  uploading: { label: "Uploading", color: "#A8B3C7" },
  validating: { label: "Validating", color: "#38BDF8" },
  revising: { label: "Revising", color: "#FB923C" },
  pendingapproval: { label: "Pending Approval", color: "#FACC15" },
  approved: { label: "Approved", color: "#4ADE80" },
};

function AutoTextArea({ value, onChange, placeholder, minHeight }) {
  const locked = useContext(LockCtx);
  const ref = useRef(null);
  const lastW = useRef(0);
  const fit = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  useEffect(fit, [value, locked]);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (el.offsetWidth !== lastW.current) {
        lastW.current = el.offsetWidth;
        fit();
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      readOnly={locked}
      tabIndex={locked ? -1 : undefined}
      onChange={(e) => onChange(e.target.value)}
      style={{ ...lockedStyle(locked), overflow: "hidden", minHeight: locked ? undefined : minHeight }}
      className={"w-full text-sm rounded-md border px-2.5 py-1.5 outline-none resize-none" + (locked ? " cursor-default" : "")}
    />
  );
}

const entrySel = (st) => ({ ...badgeStyle(ENTRY_STATUS[st]?.color || "#A8B3C7") });

function JeRow({ e, update, remove }) {
  const [editing, setEditing] = useState(false);
  return (
    <LockCtx.Provider value={!editing}>
      <div style={{ backgroundColor: PANEL, borderColor: PANEL_LINE }} className="rounded-lg border p-3">
        <div className="grid grid-cols-2 md:grid-cols-[130px_170px_170px_1fr_56px] gap-3 items-start">
          <LockInput
            list="entity-list"
            value={e.entity}
            onChange={(ev) => update(e.id, { entity: ev.target.value })}
            placeholder="Entity"
            className="w-full text-sm rounded-md border px-2.5 py-1.5"
          />
          <LockInput
            value={e.jid}
            onChange={(ev) => update(e.id, { jid: ev.target.value })}
            placeholder="Journal ID"
            className="w-full text-sm rounded-md border px-2.5 py-1.5 font-mono"
          />
          <select
            value={e.status}
            onChange={(ev) => update(e.id, { status: ev.target.value })}
            style={entrySel(e.status)}
            className="w-full text-sm font-semibold rounded-md border px-2 py-1.5 outline-none"
          >
            {Object.entries(ENTRY_STATUS).map(([k, v]) => (
              <option key={k} value={k} style={OPT_STYLE}>{v.label}</option>
            ))}
          </select>
          <div className="col-span-2 md:col-span-1 order-last md:order-none">
            <AutoTextArea value={e.note || ""} onChange={(v) => update(e.id, { note: v })} placeholder="Note…" />
          </div>
          <div className="justify-self-end pt-1.5 flex gap-3">
            <IconBtn onClick={() => setEditing((v) => !v)}>
              {editing ? <Check size={16} color={AMBER} /> : <Pencil size={15} />}
            </IconBtn>
            <IconBtn onClick={() => remove(e.id)} danger>
              <Trash2 size={15} />
            </IconBtn>
          </div>
        </div>
        {e.status === "approved" && (
          <div className="flex justify-end mt-3 pr-2 pb-1">
            <div
              style={{
                color: "#EF4444",
                border: "3px solid #EF4444",
                boxShadow: `inset 0 0 0 2px ${PANEL}, inset 0 0 0 3.5px #EF4444`,
                transform: "rotate(-6deg)",
                letterSpacing: "0.12em",
              }}
              className="rounded-md px-4 py-1.5 text-3xl font-black uppercase select-none opacity-90"
            >
              Approved
            </div>
          </div>
        )}
      </div>
    </LockCtx.Provider>
  );
}

function JeTrackerView({ entries, setEntries }) {
  const [entity, setEntity] = useState("");
  const [jid, setJid] = useState("");
  const [status, setStatus] = useState("uploading");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("all");

  const entityOptions = useMemo(
    () => Array.from(new Set(entries.map((e) => e.entity).filter(Boolean))),
    [entries]
  );

  const add = () => {
    if (!jid.trim()) return;
    setEntries([
      { id: uid("en"), entity: entity.trim(), jid: jid.trim(), status, note: note.trim(), createdAt: todayStr() },
      ...entries,
    ]);
    setJid("");
    setNote("");
  };
  const update = (id, patch) => setEntries(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const remove = (id) => setEntries(entries.filter((e) => e.id !== id));

  const counts = useMemo(() => {
    const c = { all: entries.length };
    Object.keys(ENTRY_STATUS).forEach((k) => (c[k] = entries.filter((e) => e.status === k).length));
    return c;
  }, [entries]);
  const shown = filter === "all" ? entries : entries.filter((e) => e.status === filter);

  const inputStyle = { borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" };
  const selStyle = entrySel;

  return (
    <div>
      <SectionHeader title="JE Tracker" subtitle="Journal entries you've uploaded and where they stand" />

      <div style={{ backgroundColor: PANEL, borderColor: PANEL_LINE }} className="rounded-xl border p-4 mb-4">
        <datalist id="entity-list">
          {entityOptions.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <label className="flex flex-col gap-1">
            <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Entity</span>
            <input
              list="entity-list"
              value={entity}
              onChange={(e) => setEntity(e.target.value)}
              placeholder="e.g. US01"
              style={inputStyle}
              className="text-sm rounded-md border px-2.5 py-1.5 outline-none"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Journal ID</span>
            <input
              value={jid}
              onChange={(e) => setJid(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add()}
              placeholder="Journal ID"
              style={inputStyle}
              className="text-sm rounded-md border px-2.5 py-1.5 outline-none font-mono"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={selStyle(status)}
              className="text-sm rounded-md border px-2 py-1.5 outline-none"
            >
              {Object.entries(ENTRY_STATUS).map(([k, v]) => (
                <option key={k} value={k} style={OPT_STYLE}>{v.label}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3">
          <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Note</span>
          <div className="mt-1">
            <AutoTextArea value={note} onChange={setNote} placeholder="Optional note…" />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <PrimaryButton onClick={add}>
            <Plus size={14} /> Add JE
          </PrimaryButton>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {[["all", "All"], ...Object.entries(ENTRY_STATUS).map(([k, v]) => [k, v.label])].map(([k, label]) => {
          const active = filter === k;
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              style={{
                backgroundColor: active ? AMBER : "transparent",
                color: active ? ON_ACCENT : SUBTEXT,
                borderColor: active ? AMBER : PANEL_LINE,
              }}
              className="text-xs font-semibold rounded-full border px-3 py-1"
            >
              {label} · {counts[k] || 0}
            </button>
          );
        })}
      </div>

      {shown.length === 0 ? (
        <EmptyState text="No journal entries yet." />
      ) : (
        <div className="space-y-2">
          <div
            style={{ color: SUBTEXT }}
            className="hidden md:grid grid-cols-[130px_170px_170px_1fr_56px] gap-3 px-3 text-[11px] tracking-wide"
          >
            <span>Entity</span>
            <span>Journal ID</span>
            <span>Status</span>
            <span>Note</span>
            <span></span>
          </div>
          {shown.map((e) => (
            <JeRow key={e.id} e={e} update={update} remove={remove} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Close Plan (monthly close checklist with day-by-day timeline)
// ---------------------------------------------------------------------------
const CP_DAY_ORDER = ["Preclose", "Day 1", "Day 2", "Day 3", "Day 3/6", "Day 4", "Day 6", "Day 7", "Day 9", "Post Close"];
const CP_CATEGORIES = ["Bad Debt", "Bank Recs", "Fixed Assets", "Other", "Professional Fees", "Rebillables"];
const CP_STATUS = {
  "not-started": { label: "Not Started", color: "#A8B3C7" },
  "in-progress": { label: "In Progress", color: "#4FC3F7" },
  stuck: { label: "Stuck", color: "#F87171" },
  "following-up": { label: "Following Up", color: "#FBBF24" },
  complete: { label: "Complete", color: "#4ADE80" },
};
const CP_CAT_COLOR = {
  "Fixed Assets": "#60A5FA",
  "Bad Debt": "#F87171",
  "Professional Fees": "#C4A7F5",
  Rebillables: "#FBBF24",
  "Bank Recs": "#4ADE80",
  Other: "#A8B3C7",
};
const CP_DAY_OFFSET = { Preclose: -1, "Day 1": 0, "Day 2": 1, "Day 3": 2, "Day 3/6": [2, 5], "Day 4": 3, "Day 6": 5, "Day 7": 6, "Day 9": 8, "Post Close": null };
const CP_DEFAULT_TASKS = [
  { id: "rd-review", day: "Preclose", cat: "Fixed Assets", name: "R&D Project Review – need Tanu's sign-off", prep: "Eva/Paul", rev: "Liz" },
  { id: "fa-transfers", day: "Day 1", cat: "Fixed Assets", name: "Fixed Assets: Transfers", prep: "Eva/Paul", rev: "Liz" },
  { id: "acct-accrual", day: "Day 2", cat: "Professional Fees", name: "Accounting Fee's Accrual – Current Month", prep: "Eva", rev: "Liz" },
  { id: "acct-trueup", day: "Day 2", cat: "Professional Fees", name: "Accounting Fee's – True-Up's", prep: "Eva", rev: "Liz" },
  { id: "fa-amexp", day: "Day 2", cat: "Fixed Assets", name: "Fixed Assets: AMEXP (expense under $1k)", prep: "Eva/Paul", rev: "Liz" },
  { id: "fa-add-rcls", day: "Day 2", cat: "Fixed Assets", name: "Fixed Assets: Additions Reclasses", prep: "Eva/Paul", rev: "Liz" },
  { id: "bna-config", day: "Day 2", cat: "Other", name: "BNA Configuration Review – Fixed Assets Useful Lives (Nov)", prep: "Eva/Paul", rev: "Diana" },
  { id: "bad-general", day: "Day 3", cat: "Bad Debt", name: "Bad Debt General – Including BTG and Atreus", prep: "Eva", rev: "Liz" },
  { id: "fa-additions", day: "Day 3", cat: "Fixed Assets", name: "Fixed Assets: Additions", prep: "Eva/Paul", rev: "Liz" },
  { id: "fa-disposals", day: "Day 3", cat: "Fixed Assets", name: "Fixed Assets: Disposals", prep: "Eva/Paul", rev: "Liz" },
  { id: "fa-cost-adj", day: "Day 3", cat: "Fixed Assets", name: "Fixed Assets: Cost Adjustments", prep: "Eva/Paul", rev: "Liz" },
  { id: "fa-depr", day: "Day 3", cat: "Fixed Assets", name: "Fixed Assets: Depreciation", prep: "Eva/Paul", rev: "Liz" },
  { id: "fa-sl-rcls", day: "Day 3", cat: "Fixed Assets", name: "Fixed Assets: SL Allocation Reclass", prep: "Eva/Paul", rev: "Liz" },
  { id: "subledger-chk", day: "Day 3", cat: "Rebillables", name: "Subledger to GL Check", dep: "Must complete before Rebillables entries", prep: "Eva", rev: "Paul" },
  { id: "rebill-1", day: "Day 3", cat: "Rebillables", name: "Rebillables 1", prep: "Eva", rev: "Paul" },
  { id: "rebill-23", day: "Day 3", cat: "Rebillables", name: "Rebillables 2&3", prep: "Eva", rev: "Paul" },
  { id: "rebill-add", day: "Day 3", cat: "Rebillables", name: "Rebillables Additional Entry", prep: "Eva", rev: "Paul" },
  { id: "wip-rec", day: "Day 3", cat: "Fixed Assets", name: "WIP Rec", prep: "Eva/Paul", rev: "Liz" },
  { id: "depr-tieout", day: "Day 3", cat: "Fixed Assets", name: "Depreciation Tie-Out", prep: "Eva/Paul", rev: "Liz" },
  { id: "bna-gl-rec", day: "Day 3", cat: "Fixed Assets", name: "BNA to GL Rec (including controls)", prep: "Eva/Paul", rev: "Liz" },
  { id: "purch-chk", day: "Day 3", cat: "Fixed Assets", name: "Purchase Account Check", prep: "Eva/Paul", rev: "Liz" },
  { id: "close-bna", day: "Day 3", cat: "Fixed Assets", name: "Close BNA", prep: "Eva/Paul", rev: null },
  { id: "reclass-150700", day: "Day 3/6", cat: "Fixed Assets", name: "Reclass 150700 accruals to expense", prep: "Eva/Paul", rev: "Liz" },
  { id: "bad-specific", day: "Day 4", cat: "Bad Debt", name: "Bad Debt Specific", prep: "Eva", rev: "Liz" },
  { id: "hsusa-bank", day: "Day 4", cat: "Bank Recs", name: "HSUSA Bank Rec", prep: "Eva", rev: "Liz" },
  { id: "rebill-trend", day: "Day 6", cat: "Rebillables", name: "Rebillable Trend Analysis", prep: "Eva", rev: "Paul" },
  { id: "bad-rollforward", day: "Day 7", cat: "Bad Debt", name: "Bad Debt Rollforward", prep: "Eva/Paul", rev: "Liz" },
  { id: "cash-flow", day: "Day 7", cat: "Fixed Assets", name: "Cash Flow", prep: "Eva/Paul", rev: "Liz" },
  { id: "fa-rollforward", day: "Day 7", cat: "Fixed Assets", name: "Fixed Asset Rollforward", prep: "Eva/Paul", rev: "Liz" },
  { id: "rent-ga-walk", day: "Day 9", cat: "Other", name: "Rent G&A Walk", prep: "All", rev: null },
  { id: "ap-gl-touch", day: "Post Close", cat: "Other", name: "Send AP to GL touchpoint items by 8/18", prep: "All", rev: "Liz" },
];

const CP_WDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CP_MONS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function cpAddBizDays(base, n) {
  const d = new Date(base.getTime());
  if (n === 0) return d;
  const dir = n > 0 ? 1 : -1;
  let rem = Math.abs(n);
  while (rem > 0) {
    d.setDate(d.getDate() + dir);
    if (d.getDay() !== 0 && d.getDay() !== 6) rem--;
  }
  return d;
}
function cpDayBadge(day1, label) {
  if (!day1) return "";
  const off = CP_DAY_OFFSET[label];
  if (off === null || off === undefined) return "";
  const base = new Date(day1 + "T12:00:00");
  const short = (d) => `${CP_MONS[d.getMonth()]} ${d.getDate()}`;
  if (Array.isArray(off)) return `${short(cpAddBizDays(base, off[0]))} – ${short(cpAddBizDays(base, off[1]))}`;
  const d = cpAddBizDays(base, off);
  return `${CP_WDAYS[d.getDay()]}, ${short(d)}`;
}
function cpMakeMonth(label) {
  return { id: uid("m"), label, day1: null, tasks: CP_DEFAULT_TASKS.map((t) => ({ ...t, dep: t.dep || null })), state: {} };
}
function makeInitialPlan() {
  const m = cpMakeMonth(new Date().toLocaleString("en-US", { month: "long", year: "numeric" }));
  return { months: [m], activeId: m.id };
}
function cpMatches(t, person) {
  const p = t.prep || "", r = t.rev || "";
  return person === "all" || p === "All" || r === "All" || p.includes(person) || r === person;
}

function CpEditForm({ t, onSave, onCancel, onDelete }) {
  const [d, setD] = useState({ name: t.name, cat: t.cat, day: t.day, prep: t.prep || "", rev: t.rev || "", dep: t.dep || "" });
  const set = (k) => (v) => setD((x) => ({ ...x, [k]: v }));
  const selCls = "text-sm rounded-md border px-2.5 py-1.5 outline-none";
  const selSt = { borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" };
  return (
    <div style={{ borderColor: AMBER, backgroundColor: PANEL }} className="border-2 rounded-lg p-3 flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field className="sm:col-span-1" label="Task Name" value={d.name} onChange={set("name")} placeholder="Task name" />
        <label className="flex flex-col gap-1">
          <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Category</span>
          <select value={d.cat} onChange={(e) => set("cat")(e.target.value)} style={selSt} className={selCls}>
            {CP_CATEGORIES.map((c) => (
              <option key={c} value={c} style={OPT_STYLE}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Day</span>
          <select value={d.day} onChange={(e) => set("day")(e.target.value)} style={selSt} className={selCls}>
            {CP_DAY_ORDER.map((c) => (
              <option key={c} value={c} style={OPT_STYLE}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Preparer" value={d.prep} onChange={set("prep")} placeholder="e.g. Eva / Eva/Paul / All" />
        <Field label="Reviewer" value={d.rev} onChange={set("rev")} placeholder="Leave blank for N/A" />
        <Field label="Dependency / Note (shown under task)" value={d.dep} onChange={set("dep")} placeholder="Optional prerequisite note" />
      </div>
      <div className="flex gap-2 items-center">
        <PrimaryButton
          onClick={() => {
            if (!d.name.trim()) return;
            onSave({ name: d.name.trim(), cat: d.cat, day: d.day, prep: d.prep.trim() || "TBD", rev: d.rev.trim() || null, dep: d.dep.trim() || null });
          }}
        >
          <Check size={14} /> Save
        </PrimaryButton>
        <button onClick={onCancel} style={{ color: SUBTEXT, borderColor: PANEL_LINE }} className="text-sm rounded-full border px-4 py-1.5">
          Cancel
        </button>
        <button onClick={onDelete} style={{ color: DANGER }} className="ml-auto text-sm flex items-center gap-1">
          <Trash2 size={14} /> Delete task
        </button>
      </div>
    </div>
  );
}

function CpTaskRow({ m, t, setState, onEdit, onDragStart, onDragEnd, dragId, onDropRow, onMove }) {
  const rowRef = useRef(null);
  const [hover, setHover] = useState(null); // "before" | "after" | null
  const prepDone = !!m.state[t.id + "-p"];
  const revDone = !!m.state[t.id + "-r"];
  const allDone = prepDone && (t.rev == null || revDone);
  const status = m.state[t.id + "-s"] || "not-started";
  const note = m.state[t.id + "-n"] || "";
  const [noteOpen, setNoteOpen] = useState(note.trim().length > 0);
  const [noteEditing, setNoteEditing] = useState(note.trim().length === 0);
  const color = CP_CAT_COLOR[t.cat] || CP_CAT_COLOR.Other;
  const chk = (key, done, person, label) => (
    <label className="flex flex-col items-center gap-0.5 cursor-pointer select-none min-w-[58px]">
      <input type="checkbox" checked={done} onChange={(e) => setState(key, e.target.checked)} style={{ accentColor: AMBER }} className="w-4 h-4" />
      <span style={{ color: TEXT }} className="text-[11px] font-semibold leading-none">{person}</span>
      <span style={{ color: SUBTEXT }} className="text-[10px] leading-none">{label}</span>
    </label>
  );
  return (
    <div
      ref={rowRef}
      onDragOver={(e) => {
        if (!dragId || dragId === t.id) return;
        e.preventDefault();
        e.stopPropagation();
        const r = rowRef.current.getBoundingClientRect();
        setHover(e.clientY < r.top + r.height / 2 ? "before" : "after");
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHover(null);
      }}
      onDrop={(e) => {
        if (!dragId || dragId === t.id) return;
        e.preventDefault();
        e.stopPropagation();
        const pos = hover || "after";
        setHover(null);
        onDropRow(t.id, pos);
      }}
      style={{
        backgroundColor: PANEL,
        borderColor: PANEL_LINE,
        borderLeft: `4px solid ${color}`,
        opacity: dragId === t.id ? 0.4 : allDone ? 0.7 : 1,
        boxShadow: hover === "before" ? `0 -3px 0 0 ${AMBER}` : hover === "after" ? `0 3px 0 0 ${AMBER}` : "none",
      }}
      className="border rounded-lg"
    >
      <div className="flex items-center gap-3 px-3 py-2.5 flex-wrap">
        <div
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", t.id);
            if (rowRef.current) e.dataTransfer.setDragImage(rowRef.current, 20, 20);
            onDragStart(t.id);
          }}
          onDragEnd={onDragEnd}
          title="Drag to reorder, or drop onto another day"
          style={{ color: SUBTEXT }}
          className="cursor-grab text-lg leading-none select-none px-0.5"
        >
          ⋮⋮
        </div>
        <div className="flex flex-col -my-1">
          <button onClick={() => onMove(-1)} title="Move up" style={{ color: SUBTEXT }} className="opacity-60 hover:opacity-100">
            <ChevronUp size={14} />
          </button>
          <button onClick={() => onMove(1)} title="Move down" style={{ color: SUBTEXT }} className="opacity-60 hover:opacity-100">
            <ChevronDown size={14} />
          </button>
        </div>
        <div className="flex-1 min-w-[180px]">
          <div style={{ color: TEXT, textDecoration: allDone ? "line-through" : "none" }} className="text-sm font-medium">
            {t.name}
          </div>
          {t.dep && (
            <div style={{ color: "#FBBF24" }} className="text-[11px] mt-0.5">
              ⚑ {t.dep}
            </div>
          )}
        </div>
        <span style={{ color, borderColor: color }} className="text-[10px] font-bold border rounded-full px-2 py-0.5 shrink-0">
          {t.cat}
        </span>
        <select
          value={status}
          onChange={(e) => setState(t.id + "-s", e.target.value)}
          style={badgeStyle(CP_STATUS[status].color)}
          className="text-[11px] font-bold border rounded px-1.5 py-0.5 shrink-0 outline-none"
        >
          {Object.entries(CP_STATUS).map(([k, v]) => (
            <option key={k} value={k} style={OPT_STYLE}>{v.label}</option>
          ))}
        </select>
        <IconBtn onClick={onEdit}>
          <Pencil size={15} />
        </IconBtn>
        <button
          onClick={() => setNoteOpen((v) => !v)}
          style={{ color: note.trim() ? AMBER : SUBTEXT }}
          className="text-xs font-semibold shrink-0"
        >
          {note.trim() ? "● Note" : "Note"}
        </button>
        <div className="flex gap-2 shrink-0">
          {chk(t.id + "-p", prepDone, t.prep, "Prepared")}
          {t.rev ? (
            chk(t.id + "-r", revDone, t.rev, "Reviewed")
          ) : (
            <div className="flex flex-col items-center gap-0.5 min-w-[58px] opacity-50">
              <span className="w-4 h-4 text-center text-[10px]" style={{ color: SUBTEXT }}>–</span>
              <span style={{ color: TEXT }} className="text-[11px] font-semibold leading-none">N/A</span>
              <span style={{ color: SUBTEXT }} className="text-[10px] leading-none">Reviewed</span>
            </div>
          )}
        </div>
      </div>
      {noteOpen && (
        <LockCtx.Provider value={!noteEditing}>
          <div className="px-3 pb-3 flex gap-2 items-start">
            <div className="flex-1 min-w-0">
              <AutoTextArea
                value={note}
                onChange={(v) => setState(t.id + "-n", v)}
                placeholder="Add a note, blocker, or follow-up detail…"
              />
            </div>
            <EditToggle editing={noteEditing} onClick={() => setNoteEditing((v) => !v)} />
          </div>
        </LockCtx.Provider>
      )}
    </div>
  );
}

function ClosePlanView({ plan, setPlan }) {
  const [filter, setFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [newLabel, setNewLabel] = useState(null);
  const [renaming, setRenaming] = useState(false);

  const m = plan.months.find((x) => x.id === plan.activeId) || plan.months[0];
  const patchMonth = (fn) => setPlan((prev) => ({ ...prev, months: prev.months.map((x) => (x.id === m.id ? fn(x) : x)) }));
  const setState = (key, val) => patchMonth((x) => ({ ...x, state: { ...x.state, [key]: val } }));
  const updateTask = (id, patch) => patchMonth((x) => ({ ...x, tasks: x.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));

  // Reorder: put the dragged task before/after a target task (also changes its day to the target's day).
  const dropOnTask = (targetId, pos) => {
    if (!dragId || dragId === targetId) return;
    patchMonth((x) => {
      const dragged = x.tasks.find((t) => t.id === dragId);
      const target = x.tasks.find((t) => t.id === targetId);
      if (!dragged || !target) return x;
      const rest = x.tasks.filter((t) => t.id !== dragId);
      const idx = rest.findIndex((t) => t.id === targetId);
      rest.splice(pos === "before" ? idx : idx + 1, 0, { ...dragged, day: target.day });
      return { ...x, tasks: rest };
    });
    setDragId(null);
    setDragOver(null);
  };
  // Move up/down within the same day (works on touch screens too).
  const moveTask = (id, dir) =>
    patchMonth((x) => {
      const t = x.tasks.find((y) => y.id === id);
      const sameDay = x.tasks.filter((y) => y.day === t.day && cpMatches(y, filter));
      const i = sameDay.findIndex((y) => y.id === id);
      const other = sameDay[i + dir];
      if (!other) return x;
      const arr = [...x.tasks];
      const a = arr.findIndex((y) => y.id === id);
      const b = arr.findIndex((y) => y.id === other.id);
      [arr[a], arr[b]] = [arr[b], arr[a]];
      return { ...x, tasks: arr };
    });

  const people = useMemo(() => {
    const set = new Set();
    m.tasks.forEach((t) => [t.prep, t.rev].forEach((v) => (v || "").split("/").forEach((p) => {
      const n = p.trim();
      if (n && n !== "All" && n !== "TBD") set.add(n);
    })));
    return ["all", ...Array.from(set)];
  }, [m.tasks]);

  const visible = m.tasks.filter((t) => cpMatches(t, filter));
  const stats = useMemo(() => {
    let prep = 0, rev = 0;
    const sc = {};
    Object.keys(CP_STATUS).forEach((k) => (sc[k] = 0));
    visible.forEach((t) => {
      const p = !!m.state[t.id + "-p"];
      const r = !!m.state[t.id + "-r"];
      if (p) prep++;
      if (t.rev == null ? p : r) rev++;
      sc[m.state[t.id + "-s"] || "not-started"]++;
    });
    const total = visible.length;
    return { prep, rev, total, sc, pct: total ? Math.round(((prep + rev) / (total * 2)) * 100) : 0 };
  }, [visible, m.state]);

  const monthPct = (x) => {
    let done = 0;
    x.tasks.forEach((t) => {
      if (x.state[t.id + "-p"] && (t.rev == null || x.state[t.id + "-r"])) done++;
    });
    return x.tasks.length ? Math.round((done / x.tasks.length) * 100) : 0;
  };

  const addMonth = () => {
    const label = (newLabel || "").trim();
    if (!label) return;
    const nm = cpMakeMonth(label);
    setPlan((prev) => ({ months: [...prev.months, nm], activeId: nm.id }));
    setNewLabel(null);
    setFilter("all");
  };
  const removeMonth = () => {
    if (plan.months.length === 1) return;
    if (!window.confirm(`Delete "${m.label}"? This cannot be undone.`)) return;
    setPlan((prev) => {
      const months = prev.months.filter((x) => x.id !== m.id);
      return { months, activeId: months[0].id };
    });
  };
  const addTask = (day) => {
    const t = { id: uid("t"), day, cat: "Fixed Assets", name: "", prep: "Eva", rev: "Liz", dep: null };
    patchMonth((x) => ({ ...x, tasks: [...x.tasks, t] }));
    setEditingId(t.id);
  };
  const removeTask = (t) => {
    if (!window.confirm(`Delete "${t.name || "this task"}"?`)) return;
    patchMonth((x) => ({ ...x, tasks: x.tasks.filter((y) => y.id !== t.id) }));
    setEditingId(null);
  };

  return (
    <div>
      <SectionHeader
        title="Close Plan"
        subtitle="Monthly close checklist, day by day"
        action={
          newLabel === null ? (
            <PrimaryButton onClick={() => setNewLabel("")}>
              <Plus size={15} /> New Month
            </PrimaryButton>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                autoFocus
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addMonth();
                  if (e.key === "Escape") setNewLabel(null);
                }}
                placeholder="e.g. November 2026"
                style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
                className="text-sm rounded-md border px-2.5 py-1.5 outline-none"
              />
              <PrimaryButton onClick={addMonth}>Create</PrimaryButton>
            </div>
          )
        }
      />

      <div className="flex gap-2 flex-wrap mb-4">
        {plan.months.map((x) => {
          const active = x.id === m.id;
          return (
            <button
              key={x.id}
              onClick={() => {
                setPlan((prev) => ({ ...prev, activeId: x.id }));
                setEditingId(null);
                setFilter("all");
              }}
              style={{
                backgroundColor: active ? AMBER : "transparent",
                color: active ? ON_ACCENT : SUBTEXT,
                borderColor: active ? AMBER : PANEL_LINE,
              }}
              className="text-xs font-semibold rounded-full border px-3 py-1"
            >
              {x.label} · {monthPct(x)}%
            </button>
          );
        })}
      </div>

      <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-xl p-4 mb-4">
        <div className="flex items-center gap-3 flex-wrap">
          <LockCtx.Provider value={!renaming}>
            <LockInput
              value={m.label}
              onChange={(e) => patchMonth((x) => ({ ...x, label: e.target.value }))}
              className="text-lg font-bold rounded-md border px-2.5 py-1 min-w-[180px]"
            />
          </LockCtx.Provider>
          <EditToggle editing={renaming} onClick={() => setRenaming((v) => !v)} />
          {plan.months.length > 1 && (
            <IconBtn danger onClick={removeMonth}>
              <Trash2 size={15} />
            </IconBtn>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span style={{ color: SUBTEXT }} className="text-xs">Day 1 of close</span>
            <input
              type="date"
              value={m.day1 || ""}
              onChange={(e) => patchMonth((x) => ({ ...x, day1: e.target.value || null }))}
              style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
              className="text-sm rounded-md border px-2.5 py-1 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 max-w-md">
          {[
            ["Prepared", `${stats.prep}/${stats.total}`],
            ["Reviewed", `${stats.rev}/${stats.total}`],
            ["Complete", `${stats.pct}%`],
          ].map(([l, v]) => (
            <div key={l}>
              <div style={{ color: TEXT }} className="text-xl font-bold">{v}</div>
              <div style={{ color: SUBTEXT }} className="text-xs">{l}</div>
            </div>
          ))}
        </div>
        <div style={{ backgroundColor: "rgba(0,0,0,0.25)" }} className="h-2 rounded-full mt-3 overflow-hidden">
          <div style={{ width: `${stats.pct}%`, backgroundColor: AMBER }} className="h-full transition-all" />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
          {Object.entries(CP_STATUS).map(([k, v]) => (
            <span key={k} style={{ color: stats.sc[k] > 0 ? TEXT : SUBTEXT }} className="text-xs flex items-center gap-1.5">
              <span style={{ backgroundColor: v.color }} className="w-2 h-2 rounded-full inline-block" />
              {stats.sc[k]} {v.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4 items-center">
        <span style={{ color: SUBTEXT }} className="text-xs mr-1">View</span>
        {people.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            style={{
              backgroundColor: filter === p ? AMBER_SOFT : "transparent",
              color: filter === p ? AMBER : SUBTEXT,
              borderColor: filter === p ? AMBER : PANEL_LINE,
            }}
            className="text-xs font-semibold rounded-full border px-3 py-1"
          >
            {p === "all" ? "All" : p}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-5">
        {CP_DAY_ORDER.map((day) => {
          const tasks = visible.filter((t) => t.day === day);
          if (!tasks.length) return null;
          const badge = cpDayBadge(m.day1, day);
          const over = dragOver === day;
          return (
            <div
              key={day}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                setDragOver(day);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(null);
                const t = m.tasks.find((x) => x.id === dragId);
                if (t) {
                  patchMonth((x) => {
                    const rest = x.tasks.filter((y) => y.id !== dragId);
                    let last = -1;
                    rest.forEach((y, i) => {
                      if (y.day === day) last = i;
                    });
                    rest.splice(last + 1, 0, { ...t, day });
                    return { ...x, tasks: rest };
                  });
                }
                setDragId(null);
              }}
              style={{ outline: over ? `2px dashed ${AMBER}` : "none", outlineOffset: 4 }}
              className="rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <span style={{ backgroundColor: AMBER, color: ON_ACCENT }} className="text-xs font-bold rounded-full px-3 py-1">
                  {day}
                </span>
                {badge && <span style={{ color: TEXT }} className="text-xs font-semibold">{badge}</span>}
                <div style={{ backgroundColor: PANEL_LINE }} className="flex-1 h-px" />
                <span style={{ color: SUBTEXT }} className="text-xs">
                  {tasks.length} task{tasks.length !== 1 ? "s" : ""}
                </span>
                <button onClick={() => addTask(day)} style={{ color: AMBER }} className="text-xs font-semibold flex items-center gap-1">
                  <Plus size={12} /> Add
                </button>
              </div>
              <div className="flex flex-col gap-1.5">
                {tasks.map((t) =>
                  editingId === t.id ? (
                    <CpEditForm
                      key={t.id}
                      t={t}
                      onSave={(patch) => {
                        updateTask(t.id, patch);
                        setEditingId(null);
                      }}
                      onCancel={() => {
                        if (!t.name) patchMonth((x) => ({ ...x, tasks: x.tasks.filter((y) => y.id !== t.id) }));
                        setEditingId(null);
                      }}
                      onDelete={() => removeTask(t)}
                    />
                  ) : (
                    <CpTaskRow
                      key={t.id}
                      m={m}
                      t={t}
                      setState={setState}
                      onEdit={() => setEditingId(t.id)}
                      dragId={dragId}
                      onDropRow={dropOnTask}
                      onMove={(dir) => moveTask(t.id, dir)}
                      onDragStart={setDragId}
                      onDragEnd={() => {
                        setDragId(null);
                        setDragOver(null);
                      }}
                    />
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-6">
        {Object.entries(CP_CAT_COLOR).map(([k, c]) => (
          <span key={k} style={{ color: SUBTEXT }} className="text-xs flex items-center gap-1.5">
            <span style={{ backgroundColor: c }} className="w-2 h-2 rounded-full inline-block" />
            {k}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings (theme colors)
// ---------------------------------------------------------------------------
function SettingsView({ themeKey, setThemeKey }) {
  return (
    <div>
      <SectionHeader title="Settings" subtitle="Choose a color theme — saved on this device" />
      <div style={{ color: TEXT }} className="text-sm font-bold mb-3">Color Theme</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {THEMES.map((t) => {
          const active = themeKey === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setThemeKey(t.key)}
              style={{
                backgroundColor: t.bg,
                borderColor: active ? t.accent : t.line,
                borderWidth: active ? 2 : 1,
              }}
              className="rounded-xl border text-left p-3 hover:brightness-110 transition-all"
            >
              <div className="flex gap-1.5 mb-3">
                <span style={{ backgroundColor: t.sidebar, borderColor: t.line }} className="w-6 h-6 rounded border" />
                <span style={{ backgroundColor: t.panel, borderColor: t.line }} className="w-6 h-6 rounded border" />
                <span style={{ backgroundColor: t.accent }} className="w-6 h-6 rounded" />
              </div>
              <div style={{ color: t.text }} className="text-sm font-semibold flex items-center justify-between">
                {t.name}
                {active && <CheckCircle2 size={15} color={t.accent} />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function DashboardView({ meetings, todos, tasks, comms, entries, contacts, notes, goTo }) {
  const openTodos = todos.filter((t) => !t.done);
  const todayTodos = openTodos.filter((t) => t.due === todayStr());
  const recentMeetings = meetings.slice(0, 3);
  const openJe = entries.filter((e) => e.status !== "approved");
  const stuckTasks = tasks.filter((t) => t.status === "stuck");
  const waitingComms = comms.filter((c) => c.status !== "done");

  const stats = [
    { key: "meetings", label: "Meetings", value: meetings.length, icon: Users },
    { key: "todos", label: "To-Do", value: openTodos.length, icon: CheckSquare },
    { key: "tasks", label: "Tasks", value: tasks.length, icon: Layers },
    { key: "comms", label: "Follow-ups", value: waitingComms.length, icon: MessageCircle },
    { key: "je", label: "JE Open", value: openJe.length, icon: FileSpreadsheet },
    { key: "contacts", label: "Contacts", value: contacts.length, icon: Contact },
    { key: "notes", label: "Quick Notes", value: notes.length, icon: StickyNote },
  ];

  return (
    <div>
      <SectionHeader title="Dashboard" subtitle="Your workspace today" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <button
            key={s.key}
            onClick={() => goTo(s.key)}
            style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }}
            className="border rounded-lg p-4 text-left hover:brightness-110 transition-all"
          >
            <s.icon size={18} color={AMBER} />
            <div style={{ color: TEXT }} className="text-2xl font-bold mt-2">{s.value}</div>
            <div style={{ color: SUBTEXT }} className="text-xs mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg p-4">
          <div style={{ color: TEXT }} className="text-sm font-bold mb-2">Due Today</div>
          {todayTodos.length === 0 ? (
            <EmptyState text="Nothing due today." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {todayTodos.map((t) => (
                <div key={t.id} className="flex items-center gap-2 text-sm">
                  <Circle size={14} color={SUBTEXT} />
                  <span style={{ color: TEXT }}>{t.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg p-4">
          <div style={{ color: TEXT }} className="text-sm font-bold mb-2">Stuck Tasks</div>
          {stuckTasks.length === 0 ? (
            <EmptyState text="No stuck tasks right now." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {stuckTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span style={{ color: TEXT }} className="truncate">{t.title || "Untitled task"}</span>
                  <span style={{ color: DANGER }} className="text-xs shrink-0 ml-2">{t.project || "Unsorted"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg p-4">
          <div style={{ color: TEXT }} className="text-sm font-bold mb-2">Follow-ups Pending</div>
          {waitingComms.length === 0 ? (
            <EmptyState text="No follow-ups pending." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {waitingComms.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between text-sm">
                  <span style={{ color: TEXT }} className="truncate">{c.subject}</span>
                  <span style={{ color: COMM_STATUS[c.status].color }} className="text-xs shrink-0 ml-2">
                    {COMM_STATUS[c.status].label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg p-4">
          <div style={{ color: TEXT }} className="text-sm font-bold mb-2">Recent Meetings</div>
          {recentMeetings.length === 0 ? (
            <EmptyState text="No meetings yet." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {recentMeetings.map((m) => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <span style={{ color: TEXT }} className="truncate">{m.title || "Untitled meeting"}</span>
                  <span style={{ color: SUBTEXT }} className="text-xs shrink-0 ml-2">{m.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg p-4 lg:col-span-2">
          <div style={{ color: TEXT }} className="text-sm font-bold mb-2">JEs Not Yet Approved</div>
          {openJe.length === 0 ? (
            <EmptyState text="No open journal entries." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {openJe.slice(0, 6).map((e) => (
                <div key={e.id} className="flex items-center justify-between text-sm">
                  <span style={{ color: TEXT }} className="truncate">{e.entity || "—"} · {e.jid}</span>
                  <span style={{ color: ENTRY_STATUS[e.status]?.color }} className="text-xs shrink-0 ml-2">{ENTRY_STATUS[e.status]?.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root component
// ---------------------------------------------------------------------------
export default function PersonalWorkbench() {
  const [tab, setTab] = useState("dashboard");
  const [closePlan, setClosePlan] = useState(null);
  const [themeKey, setThemeKeyState] = useState(savedThemeKey);
  const setThemeKey = (k) => {
    setThemeKeyState(k);
    applyTheme(k);
    try {
      localStorage.setItem(THEME_KEY, k);
    } catch {}
  };
  const [loaded, setLoaded] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [todos, setTodos] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comms, setComms] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    (async () => {
      const loadKey = async (key, setter) => {
        try {
          const r = await storage.get(key);
          setter(r?.value ? JSON.parse(r.value) : []);
        } catch {
          setter([]);
        }
      };
      const loadPlan = async () => {
        try {
          const r = await storage.get(STORE_KEYS.close);
          const parsed = r?.value ? JSON.parse(r.value) : null;
          setClosePlan(parsed && Array.isArray(parsed.months) && parsed.months.length ? parsed : makeInitialPlan());
        } catch {
          setClosePlan(makeInitialPlan());
        }
      };
      await Promise.all([
        loadPlan(),
        loadKey(STORE_KEYS.meetings, setMeetings),
        loadKey(STORE_KEYS.todos, setTodos),
        loadKey(STORE_KEYS.tasks, setTasks),
        loadKey(STORE_KEYS.comms, setComms),
        loadKey(STORE_KEYS.contacts, setContacts),
        loadKey(STORE_KEYS.notes, setNotes),
        loadKey(STORE_KEYS.je, setEntries),
      ]);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.meetings, JSON.stringify(meetings)).catch(() => {});
  }, [meetings, loaded]);
  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.todos, JSON.stringify(todos)).catch(() => {});
  }, [todos, loaded]);
  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.tasks, JSON.stringify(tasks)).catch(() => {});
  }, [tasks, loaded]);
  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.comms, JSON.stringify(comms)).catch(() => {});
  }, [comms, loaded]);
  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.contacts, JSON.stringify(contacts)).catch(() => {});
  }, [contacts, loaded]);
  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.notes, JSON.stringify(notes)).catch(() => {});
  }, [notes, loaded]);
  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.je, JSON.stringify(entries)).catch(() => {});
  }, [entries, loaded]);

  useEffect(() => {
    if (!loaded || !closePlan) return;
    storage.set(STORE_KEYS.close, JSON.stringify(closePlan)).catch(() => {});
  }, [closePlan, loaded]);

  const openTodoCount = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  return (
    <div style={{ backgroundColor: BG, fontFamily: FONT, minHeight: "100vh" }} className="w-full flex flex-col sm:flex-row">
      {/* Sidebar */}
      <div style={{ backgroundColor: SIDEBAR, borderColor: PANEL_LINE }} className="sm:w-52 shrink-0 border-b sm:border-b-0 sm:border-r flex sm:flex-col">
        <div className="px-4 py-4 hidden sm:block">
          <div style={{ color: TEXT }} className="font-bold text-base">Personal Workbench</div>
          <div style={{ color: SUBTEXT }} className="text-[11px] mt-0.5">Your daily desk</div>
        </div>
        <nav className="flex sm:flex-col flex-1 overflow-x-auto sm:overflow-visible">
          {NAV_ITEMS.map((item) => {
            const active = tab === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                style={{
                  color: active ? AMBER : SUBTEXT,
                  background: active
                    ? `radial-gradient(120px 60px at 0% 50%, ${AMBER_SOFT}, transparent)`
                    : "transparent",
                  borderLeft: active ? `2px solid ${AMBER}` : "2px solid transparent",
                }}
                className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium whitespace-nowrap shrink-0 transition-all"
              >
                <Icon size={16} />
                {item.label}
                {item.key === "todos" && openTodoCount > 0 && (
                  <span style={{ backgroundColor: AMBER, color: ON_ACCENT }} className="text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-auto">
                    {openTodoCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 px-5 py-5 sm:px-8 sm:py-6 overflow-auto">
        {tab === "dashboard" && (
          <DashboardView
            meetings={meetings}
            todos={todos}
            tasks={tasks}
            comms={comms}
            entries={entries}
            contacts={contacts}
            notes={notes}
            goTo={setTab}
          />
        )}
        {tab === "meetings" && <MeetingsView meetings={meetings} setMeetings={setMeetings} />}
        {tab === "todos" && <TodosView todos={todos} setTodos={setTodos} />}
        {tab === "tasks" && <TasksView tasks={tasks} setTasks={setTasks} />}
        {tab === "comms" && <CommsView comms={comms} setComms={setComms} />}
        {tab === "contacts" && <ContactsView contacts={contacts} setContacts={setContacts} />}
        {tab === "notes" && <NotesView notes={notes} setNotes={setNotes} />}
        {tab === "close" && closePlan && <ClosePlanView plan={closePlan} setPlan={setClosePlan} />}
        {tab === "settings" && <SettingsView themeKey={themeKey} setThemeKey={setThemeKey} />}
        {tab === "je" && <JeTrackerView entries={entries} setEntries={setEntries} />}
      </div>
    </div>
  );
}
