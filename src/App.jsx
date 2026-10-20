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
  Circle,
  CheckCircle2,
  Layers,
  MessageCircle,
  Contact,
  FileSpreadsheet,
  Settings as SettingsIcon,
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
    ? { borderColor: "transparent", backgroundColor: "transparent", color: TEXT }
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
      await Promise.all([
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
        {tab === "settings" && <SettingsView themeKey={themeKey} setThemeKey={setThemeKey} />}
        {tab === "je" && <JeTrackerView entries={entries} setEntries={setEntries} />}
      </div>
    </div>
  );
}
