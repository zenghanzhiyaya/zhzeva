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
  Search,
  Download,
  Upload,
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
  { key: "christmas", fx: "snow", name: "Christmas", bg: "#1F4D3A", panel: "#2A5F49", line: "#4A8A6C", accent: "#F6C453", onAccent: "#173B2C", sidebar: "#153427", text: "#FFFFFF", subtext: "#CBE6D6" },
  { key: "doraemon", name: "Doraemon", bg: "#1F5E9E", panel: "#2B70B4", line: "#4E8FCB", accent: "#FFD34D", onAccent: "#12385F", sidebar: "#164A7D", text: "#FFFFFF", subtext: "#D2E6F7" },
  { key: "moon", fx: "stars", name: "Sailor Moon", bg: "#2B2F6B", panel: "#3A3F82", line: "#5C62A6", accent: "#FF9EC7", onAccent: "#232766", sidebar: "#202458", text: "#FFFFFF", subtext: "#D8D9F3" },
  { key: "garden", fx: "petals", name: "Garden", bg: "#4F6B34", panel: "#5E7B40", line: "#7C9B5B", accent: "#F7A8B8", onAccent: "#3A2A2E", sidebar: "#3C5227", text: "#FFFFFF", subtext: "#E1EBCB" },
  { key: "tiffany", name: "Tiffany Blue", bg: "#2F7F7C", panel: "#3B918D", line: "#63B5B0", accent: "#A5ECE5", onAccent: "#1C4F4C", sidebar: "#246966", text: "#FFFFFF", subtext: "#D3F1EE" },
  { key: "retro", name: "Retro Blue & Yellow", bg: "#2E5A78", panel: "#3A6A8B", line: "#5F8DAE", accent: "#EDB93E", onAccent: "#26384A", sidebar: "#244A63", text: "#FFF6DC", subtext: "#E3DAB8" },
  { key: "mcd", name: "Golden Arches", bg: "#A81F1F", panel: "#BB2D2B", line: "#DA564E", accent: "#FFC72C", onAccent: "#6B1010", sidebar: "#8A1717", text: "#FFFFFF", subtext: "#FBDAD5" },
  { key: "sbux", name: "Green Siren", bg: "#1E5C46", panel: "#2A7058", line: "#4C9179", accent: "#F6F2E9", onAccent: "#14412F", sidebar: "#164535", text: "#FFFFFF", subtext: "#CFE6DB" },
  { key: "slate", name: "Smoky Slate", bg: "#3F4448", panel: "#4B5156", line: "#5F676D", accent: "#B8C4C0", onAccent: "#2C3135", sidebar: "#31353A", text: "#FFFFFF", subtext: "#B9C0C2" },
];
const CJK = '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", sans-serif';
const FONTS = [
  { key: "system", name: "Segoe UI (default)", stack: `"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, ${CJK}` },
  { key: "inter", name: "Inter", stack: `"Inter", system-ui, Arial, ${CJK}` },
  { key: "nunito", name: "Nunito (rounded)", stack: `"Nunito", system-ui, Arial, ${CJK}` },
  { key: "poppins", name: "Poppins", stack: `"Poppins", system-ui, Arial, ${CJK}` },
  { key: "lora", name: "Lora (serif)", stack: `"Lora", Georgia, "Songti SC", "SimSun", serif` },
  { key: "mono", name: "JetBrains Mono", stack: `"JetBrains Mono", ui-monospace, Consolas, ${CJK}` },
];
const FONT_KEY = "workbench-font";
function applyFont(key) {
  const f = FONTS.find((x) => x.key === key) || FONTS[0];
  document.documentElement.style.setProperty("--wb-font", f.stack);
  document.body.style.fontFamily = f.stack;
}
function savedFontKey() {
  try {
    return localStorage.getItem(FONT_KEY) || "system";
  } catch {
    return "system";
  }
}
applyFont(savedFontKey());

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

const FONT = "var(--wb-font)";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "notes", label: "Quick Notes", icon: StickyNote },
  { key: "todos", label: "To-Do", icon: CheckSquare },
  { key: "comms", label: "Follow-ups", icon: MessageCircle },
  { key: "tasks", label: "Tasks", icon: Layers },
  { key: "meetings", label: "Meetings", icon: Users },
  { key: "contacts", label: "Contacts", icon: Contact },
  { key: "je", label: "JE Tracker", icon: FileSpreadsheet },
];

const STORE_KEYS = {
  meetings: "workbench-meetings",
  todos: "workbench-todos",
  tasks: "workbench-tasks",
  comms: "workbench-comms",
  contacts: "workbench-contacts",
  notes: "workbench-notes",
  je: "workbench-je-tracker",
  approvers: "workbench-je-approvers",
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
const QUADS = {
  q1: { label: "Do first", sub: "Urgent + Important", color: "#F87171" },
  q2: { label: "Schedule", sub: "Important, not urgent", color: "#60A5FA" },
  q3: { label: "Quick / delegate", sub: "Urgent, not important", color: "#FBBF24" },
  q4: { label: "Park it", sub: "Not urgent, not important", color: "#94A3B8" },
};
const QUAD_ORDER = ["q1", "q2", "q3", "q4"];
const QUAD_PRIORITY = { q1: "high", q2: "medium", q3: "medium", q4: "low" };
// Older to-dos only have a priority; map it to a quadrant.
const quadOf = (t) => t.quad || { high: "q1", medium: "q2", low: "q4" }[t.priority] || "q2";

// Due-date status → color + label. Done items get no warning.
const DUE_COLORS = { over: "#EF4444", today: "#F97316", soon: "#FACC15" };
function dueInfo(t) {
  if (!t.due || t.done) return null;
  const d = new Date(t.due + "T00:00:00");
  if (isNaN(d)) return null;
  const now = new Date();
  const days = Math.round((d - new Date(now.getFullYear(), now.getMonth(), now.getDate())) / 86400000);
  if (days < 0) return { kind: "over", color: DUE_COLORS.over, label: `Overdue ${-days}d` };
  if (days === 0) return { kind: "today", color: DUE_COLORS.today, label: "Due today" };
  if (days === 1) return { kind: "soon", color: DUE_COLORS.soon, label: "Due tomorrow" };
  if (days <= 3) return { kind: "soon", color: DUE_COLORS.soon, label: `Due in ${days}d` };
  return null;
}

function TodoCard({ t, setTodos, toggle, remove, dnd }) {
  const [editing, setEditing] = useState(false);
  const ref = useRef(null);
  const patch = (p) => setTodos((prev) => prev.map((x) => (x.id === t.id ? { ...x, ...p } : x)));
  const info = dueInfo(t);
  const q = quadOf(t);
  return (
    <LockCtx.Provider value={!editing}>
      <div
        ref={ref}
        onDragOver={(e) => {
          if (dnd.dragId && dnd.dragId !== t.id) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dnd.dropOnCard(t.id);
        }}
        style={{
          borderColor: PANEL_LINE,
          backgroundColor: "transparent",
          opacity: dnd.dragId === t.id ? 0.4 : 1,
        }}
        className="border rounded-md px-2.5 py-2"
      >
        <div className="flex items-center gap-2">
          <div
            draggable
            onDragStart={(e) => {
              e.dataTransfer.effectAllowed = "move";
              e.dataTransfer.setData("text/plain", t.id);
              if (ref.current) e.dataTransfer.setDragImage(ref.current, 20, 20);
              dnd.start(t.id);
            }}
            onDragEnd={dnd.end}
            title="Drag to another quadrant or position"
            style={{ color: SUBTEXT }}
            className="cursor-grab text-base leading-none select-none"
          >
            ⋮⋮
          </div>
          <button onClick={() => toggle(t.id)}>
            {t.done ? <CheckCircle2 size={18} color={DONE} /> : <Circle size={18} color={SUBTEXT} />}
          </button>
          <LockInput
            value={t.text}
            onChange={(e) => patch({ text: e.target.value })}
            style={{ color: t.done ? SUBTEXT : TEXT, textDecoration: t.done ? "line-through" : "none" }}
            className="flex-1 min-w-0 text-sm rounded-md border px-2 py-1"
          />
          <IconBtn onClick={() => setEditing((v) => !v)}>
            {editing ? <Check size={16} color={AMBER} /> : <Pencil size={15} />}
          </IconBtn>
          <IconBtn danger onClick={() => remove(t.id)}>
            <Trash2 size={15} />
          </IconBtn>
        </div>
        <div className="flex items-center gap-2 mt-1.5 pl-6 flex-wrap">
          <LockInput
            type="date"
            value={t.due || ""}
            onChange={(e) => patch({ due: e.target.value })}
            style={{ color: SUBTEXT }}
            className="text-xs rounded-md border px-2 py-0.5"
          />
          {info && (
            <span
              style={{ color: "#fff", backgroundColor: info.color }}
              className="text-[10px] font-bold rounded-full px-2 py-0.5"
            >
              {info.label}
            </span>
          )}
          {editing && (
            <select
              value={q}
              onChange={(e) => patch({ quad: e.target.value, priority: QUAD_PRIORITY[e.target.value] })}
              style={badgeStyle(QUADS[q].color)}
              className="text-[11px] font-bold border rounded px-1.5 py-0.5 outline-none ml-auto"
            >
              {QUAD_ORDER.map((k) => (
                <option key={k} value={k} style={OPT_STYLE}>{QUADS[k].label}</option>
              ))}
            </select>
          )}
        </div>
      </div>
    </LockCtx.Provider>
  );
}

function TodosView({ todos, setTodos }) {
  const [draft, setDraft] = useState("");
  const [due, setDue] = useState("");
  const [quad, setQuad] = useState("q2");
  const [filter, setFilter] = useState("open"); // open | all | done
  const [dragId, setDragId] = useState(null);
  const [overQ, setOverQ] = useState(null);

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setTodos((prev) => [{ id: uid("td"), text, done: false, quad, priority: QUAD_PRIORITY[quad], due }, ...prev]);
    setDraft("");
    setDue("");
  };
  const toggle = (id) => setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => setTodos((prev) => prev.filter((t) => t.id !== id));

  // Move the dragged to-do into quadrant q, before `beforeId` (or to the end of the list).
  const moveTo = (q, beforeId) => {
    if (!dragId) return;
    setTodos((prev) => {
      const item = prev.find((t) => t.id === dragId);
      if (!item) return prev;
      const moved = { ...item, quad: q, priority: QUAD_PRIORITY[q] };
      const rest = prev.filter((t) => t.id !== dragId);
      const at = beforeId ? rest.findIndex((t) => t.id === beforeId) : -1;
      if (at < 0) rest.push(moved);
      else rest.splice(at, 0, moved);
      return rest;
    });
    setDragId(null);
    setOverQ(null);
  };
  const dnd = {
    dragId,
    start: (id) => setDragId(id),
    end: () => {
      setDragId(null);
      setOverQ(null);
    },
    dropOnCard: (targetId) => {
      const target = todos.find((t) => t.id === targetId);
      if (target) moveTo(quadOf(target), targetId);
    },
  };

  const visible = todos.filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done));
  const overdueCount = todos.filter((t) => dueInfo(t)?.kind === "over").length;

  return (
    <div>
      <SectionHeader title="To-Do" subtitle="Sort tasks by urgency and impact — drag cards between quadrants" />

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
          value={quad}
          onChange={(e) => setQuad(e.target.value)}
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="text-sm rounded-md border px-2.5 py-1.5 outline-none"
        >
          {QUAD_ORDER.map((k) => (
            <option key={k} value={k} style={OPT_STYLE}>{QUADS[k].label} ({QUADS[k].sub})</option>
          ))}
        </select>
        <PrimaryButton onClick={add}>
          <Plus size={15} /> Add
        </PrimaryButton>
      </div>

      <div className="flex gap-2 mb-3 items-center flex-wrap">
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
        <div className="ml-auto flex items-center gap-3 text-[11px]" style={{ color: SUBTEXT }}>
          {[["Overdue", DUE_COLORS.over], ["Due today", DUE_COLORS.today], ["Next 3 days", DUE_COLORS.soon]].map(([l, c]) => (
            <span key={l} className="inline-flex items-center gap-1">
              <span style={{ backgroundColor: c }} className="inline-block w-2.5 h-2.5 rounded-full" /> {l}
            </span>
          ))}
          {overdueCount > 0 && <span style={{ color: DUE_COLORS.over }} className="font-bold">{overdueCount} overdue</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {QUAD_ORDER.map((q) => {
          const items = visible.filter((t) => quadOf(t) === q);
          const hot = overQ === q && dragId;
          return (
            <div
              key={q}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                if (overQ !== q) setOverQ(q);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget) && overQ === q) setOverQ(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                moveTo(q, null);
              }}
              style={{
                borderColor: hot ? QUADS[q].color : PANEL_LINE,
                backgroundColor: hot ? QUADS[q].color + "26" : "rgba(0,0,0,0.12)",
                borderTopColor: QUADS[q].color,
                borderTopWidth: 3,
              }}
              className="border rounded-xl p-3 min-h-[180px] transition-colors"
            >
              <div className="flex items-baseline gap-2 mb-2">
                <div style={{ color: QUADS[q].color }} className="text-sm font-bold">{QUADS[q].label}</div>
                <div style={{ color: SUBTEXT }} className="text-[11px]">{QUADS[q].sub}</div>
                <div style={{ color: SUBTEXT }} className="text-[11px] ml-auto">{items.length}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                {items.map((t) => (
                  <TodoCard key={t.id} t={t} setTodos={setTodos} toggle={toggle} remove={remove} dnd={dnd} />
                ))}
                {items.length === 0 && (
                  <div style={{ color: SUBTEXT, borderColor: PANEL_LINE }} className="text-xs text-center border border-dashed rounded-md py-6 opacity-70">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
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

function JeRow({ e, update, remove, approvers }) {
  const [editing, setEditing] = useState(false);
  return (
    <LockCtx.Provider value={!editing}>
      <div style={{ backgroundColor: PANEL, borderColor: PANEL_LINE }} className="rounded-lg border p-3">
        <div className="grid grid-cols-2 md:grid-cols-[120px_150px_160px_150px_1fr_56px] gap-3 items-start">
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
            onChange={(ev) => {
              const v = ev.target.value;
              update(e.id, { status: v });
            }}
            style={entrySel(e.status)}
            className="w-full text-sm font-semibold rounded-md border px-2 py-1.5 outline-none"
          >
            {Object.entries(ENTRY_STATUS).map(([k, v]) => (
              <option key={k} value={k} style={OPT_STYLE}>{v.label}</option>
            ))}
          </select>
          <select
            value={e.approver || ""}
            onChange={(ev) => update(e.id, { approver: ev.target.value })}
            style={{ borderColor: "rgba(255,255,255,0.35)", color: TEXT, backgroundColor: "rgba(255,255,255,0.05)" }}
            className="w-full text-sm rounded-md border px-2 py-1.5 outline-none"
          >
            <option value="" style={OPT_STYLE}>— Approver —</option>
            {Array.from(new Set([...approvers, ...(e.approver ? [e.approver] : [])])).map((n) => (
              <option key={n} value={n} style={OPT_STYLE}>{n}</option>
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
      </div>
    </LockCtx.Provider>
  );
}

function JeTrackerView({ entries, setEntries, approvers, setApprovers }) {
  const [entity, setEntity] = useState("");
  const [jid, setJid] = useState("");
  const [status, setStatus] = useState("uploading");
  const [approver, setApprover] = useState("");
  const [newApprover, setNewApprover] = useState("");
  const [note, setNote] = useState("");
  const [filter, setFilter] = useState("all");

  const entityOptions = useMemo(
    () => Array.from(new Set(entries.map((e) => e.entity).filter(Boolean))),
    [entries]
  );

  const add = () => {
    if (!jid.trim()) return;
    setEntries([
      { id: uid("en"), entity: entity.trim(), jid: jid.trim(), status, approver, note: note.trim(), createdAt: todayStr() },
      ...entries,
    ]);
    setJid("");
    setNote("");
  };
  const update = (id, patch) => setEntries(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const remove = (id) => setEntries(entries.filter((e) => e.id !== id));
  const addApprover = () => {
    const n = newApprover.trim();
    if (!n || approvers.includes(n)) return;
    setApprovers([...approvers, n]);
    setNewApprover("");
  };

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
        <div style={{ color: TEXT }} className="text-sm font-bold mb-2">Approvers</div>
        <div className="flex flex-wrap items-center gap-2">
          {approvers.length === 0 && (
            <span style={{ color: SUBTEXT }} className="text-xs italic">No approvers yet. Add a name to pick it on each entry.</span>
          )}
          {approvers.map((n) => (
            <span
              key={n}
              style={{ borderColor: "rgba(255,255,255,0.35)", backgroundColor: "rgba(255,255,255,0.05)", color: TEXT }}
              className="text-xs font-semibold rounded-full border pl-3 pr-1.5 py-1 flex items-center gap-1.5"
            >
              {n}
              <button
                onClick={() => setApprovers(approvers.filter((x) => x !== n))}
                title={`Remove ${n}`}
                style={{ color: DANGER }}
                className="opacity-70 hover:opacity-100 leading-none text-sm"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={newApprover}
            onChange={(e) => setNewApprover(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addApprover()}
            placeholder="Add approver name"
            style={inputStyle}
            className="text-sm rounded-md border px-2.5 py-1 outline-none w-44"
          />
          <button onClick={addApprover} style={{ color: AMBER }} className="text-xs font-semibold flex items-center gap-1">
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: PANEL, borderColor: PANEL_LINE }} className="rounded-xl border p-4 mb-4">
        <datalist id="entity-list">
          {entityOptions.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto] gap-3 items-end">
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
          <label className="flex flex-col gap-1">
            <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Approver</span>
            <select
              value={approver}
              onChange={(e) => setApprover(e.target.value)}
              style={inputStyle}
              className="text-sm rounded-md border px-2 py-1.5 outline-none"
            >
              <option value="" style={OPT_STYLE}>— None —</option>
              {approvers.map((n) => (
                <option key={n} value={n} style={OPT_STYLE}>{n}</option>
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
            className="hidden md:grid grid-cols-[120px_150px_160px_150px_1fr_56px] gap-3 px-3 text-[11px] tracking-wide"
          >
            <span>Entity</span>
            <span>Journal ID</span>
            <span>Status</span>
            <span>Approver</span>
            <span>Note</span>
            <span></span>
          </div>
          {shown.map((e) => (
            <JeRow key={e.id} e={e} update={update} remove={remove} approvers={approvers} />
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
function cpDayBadge(day1, off) {
  if (!day1) return "";
  if (off === null || off === undefined) return "";
  const base = new Date(day1 + "T12:00:00");
  const short = (d) => `${CP_MONS[d.getMonth()]} ${d.getDate()}`;
  if (Array.isArray(off)) return `${short(cpAddBizDays(base, off[0]))} – ${short(cpAddBizDays(base, off[1]))}`;
  const d = cpAddBizDays(base, off);
  return `${CP_WDAYS[d.getDay()]}, ${short(d)}`;
}
// Categories and days are editable and stored on the plan; defaults apply until the first change.
const CP_PALETTE = ["#60A5FA", "#F87171", "#C4A7F5", "#FBBF24", "#4ADE80", "#F472B6", "#2DD4BF", "#FB923C", "#A8B3C7"];
const cpCats = (plan) => (plan && plan.cats) || CP_CATEGORIES.map((name) => ({ name, color: CP_CAT_COLOR[name] || "#A8B3C7" }));
const cpDays = (plan) => (plan && plan.days) || CP_DAY_ORDER.map((name) => ({ name, offset: CP_DAY_OFFSET[name] === undefined ? null : CP_DAY_OFFSET[name] }));
const cpOffsetStr = (o) => (o === null || o === undefined ? "" : Array.isArray(o) ? o.join(",") : String(o));
function cpParseOffset(s) {
  const v = (s || "").trim();
  if (!v) return null;
  const parts = v.split(/[,;]/).map((x) => x.trim());
  const nums = parts.map((x) => (/^-?\d+$/.test(x) ? parseInt(x, 10) : NaN));
  if (nums.some(isNaN) || nums.length > 2) return undefined;
  return nums.length === 2 ? nums : nums[0];
}

function CpManage({ plan, setPlan }) {
  const cats = cpCats(plan);
  const days = cpDays(plan);
  const [msg, setMsg] = useState("");
  const [newCat, setNewCat] = useState("");
  const [newDay, setNewDay] = useState("");
  const [newDayOff, setNewDayOff] = useState("");
  const countCat = (n) => plan.months.reduce((a, m) => a + m.tasks.filter((t) => t.cat === n).length, 0);
  const countDay = (n) => plan.months.reduce((a, m) => a + m.tasks.filter((t) => t.day === n).length, 0);
  const patch = (fn) => setPlan((prev) => fn({ ...prev, cats: cpCats(prev), days: cpDays(prev) }));
  const mapTasks = (p, fn) => ({ ...p, months: p.months.map((m) => ({ ...m, tasks: m.tasks.map(fn) })) });
  const dupe = (list, name, except) => list.some((x) => x.name.toLowerCase() === name.toLowerCase() && x.name !== except);

  const renameCat = (old, name) => {
    name = name.trim();
    if (!name || name === old) return;
    if (dupe(cats, name, old)) return setMsg(`"${name}" already exists.`);
    setMsg("");
    patch((p) => mapTasks({ ...p, cats: p.cats.map((c) => (c.name === old ? { ...c, name } : c)) }, (t) => (t.cat === old ? { ...t, cat: name } : t)));
  };
  const recolor = (name, color) => patch((p) => ({ ...p, cats: p.cats.map((c) => (c.name === name ? { ...c, color } : c)) }));
  const delCat = (name) => {
    if (countCat(name) > 0) return setMsg(`"${name}" is used by ${countCat(name)} task(s). Move or rename them first.`);
    setMsg("");
    patch((p) => ({ ...p, cats: p.cats.filter((c) => c.name !== name) }));
  };
  const addCat = () => {
    const name = newCat.trim();
    if (!name) return;
    if (dupe(cats, name)) return setMsg(`"${name}" already exists.`);
    setMsg("");
    patch((p) => ({ ...p, cats: [...p.cats, { name, color: CP_PALETTE[p.cats.length % CP_PALETTE.length] }] }));
    setNewCat("");
  };

  const renameDay = (old, name) => {
    name = name.trim();
    if (!name || name === old) return;
    if (dupe(days, name, old)) return setMsg(`"${name}" already exists.`);
    setMsg("");
    patch((p) => mapTasks({ ...p, days: p.days.map((d) => (d.name === old ? { ...d, name } : d)) }, (t) => (t.day === old ? { ...t, day: name } : t)));
  };
  const setOffset = (name, str) => {
    const off = cpParseOffset(str);
    if (off === undefined) return setMsg('Offset must be a number like 2, or a range like 2,5 (business days after Day 1). Leave blank for no date.');
    setMsg("");
    patch((p) => ({ ...p, days: p.days.map((d) => (d.name === name ? { ...d, offset: off } : d)) }));
  };
  const moveDay = (name, dir) =>
    patch((p) => {
      const i = p.days.findIndex((d) => d.name === name);
      const j = i + dir;
      if (j < 0 || j >= p.days.length) return p;
      const arr = [...p.days];
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { ...p, days: arr };
    });
  const delDay = (name) => {
    if (countDay(name) > 0) return setMsg(`"${name}" is used by ${countDay(name)} task(s). Move them to another day first.`);
    setMsg("");
    patch((p) => ({ ...p, days: p.days.filter((d) => d.name !== name) }));
  };
  const addDay = () => {
    const name = newDay.trim();
    if (!name) return;
    const off = cpParseOffset(newDayOff);
    if (off === undefined) return setMsg("Offset must be a number like 2, or a range like 2,5.");
    if (dupe(days, name)) return setMsg(`"${name}" already exists.`);
    setMsg("");
    patch((p) => {
      // dated days go in date order; days without a date go last
      const arr = [...p.days];
      const key = (o) => (Array.isArray(o) ? o[0] : o);
      let at = arr.length;
      if (off !== null) {
        const nk = key(off);
        const i = arr.findIndex((d) => d.offset !== null && d.offset !== undefined && key(d.offset) > nk);
        if (i >= 0) at = i;
        else {
          at = arr.length;
          while (at > 0 && (arr[at - 1].offset === null || arr[at - 1].offset === undefined)) at--;
        }
      }
      arr.splice(at, 0, { name, offset: off });
      return { ...p, days: arr };
    });
    setNewDay("");
    setNewDayOff("");
  };

  const inp = "text-sm rounded-md border px-2 py-1 outline-none";
  const inpSt = { borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" };
  // Text input that commits on blur / Enter so renaming does not rewrite tasks on every keystroke.
  const Commit = ({ value, onCommit, className, style, placeholder }) => {
    const [v, setV] = useState(value);
    useEffect(() => setV(value), [value]);
    return (
      <input
        value={v}
        placeholder={placeholder}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => onCommit(v)}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        style={style || inpSt}
        className={className || inp}
      />
    );
  };
  return (
    <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-xl p-4 mb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div style={{ color: TEXT }} className="text-sm font-bold mb-0.5">Categories</div>
          <div style={{ color: SUBTEXT }} className="text-[11px] mb-2">Rename to update every task (all months). Applies to all months.</div>
          <div className="flex flex-col gap-1.5">
            {cats.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <input type="color" value={c.color} onChange={(e) => recolor(c.name, e.target.value)} className="w-7 h-7 rounded cursor-pointer bg-transparent border-0 p-0" title="Color" />
                <Commit value={c.name} onCommit={(v) => renameCat(c.name, v)} className={inp + " flex-1 min-w-0"} />
                <span style={{ color: SUBTEXT }} className="text-[11px] w-14 text-right">{countCat(c.name)} task{countCat(c.name) !== 1 ? "s" : ""}</span>
                <IconBtn danger onClick={() => delCat(c.name)}><Trash2 size={14} /></IconBtn>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCat()} placeholder="New category (e.g. Prepaids)" style={inpSt} className={inp + " flex-1 min-w-0"} />
            <PrimaryButton onClick={addCat}><Plus size={14} /> Add</PrimaryButton>
          </div>
        </div>
        <div>
          <div style={{ color: TEXT }} className="text-sm font-bold mb-0.5">Days</div>
          <div style={{ color: SUBTEXT }} className="text-[11px] mb-2">Offset = business days after Day 1 (e.g. 2, or 2,5 for a range). Blank = no date. Use ↑ ↓ to reorder.</div>
          <div className="flex flex-col gap-1.5">
            {days.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="flex flex-col -my-1">
                  <button onClick={() => moveDay(d.name, -1)} disabled={i === 0} style={{ color: SUBTEXT }} className="opacity-60 hover:opacity-100 disabled:opacity-20"><ChevronUp size={13} /></button>
                  <button onClick={() => moveDay(d.name, 1)} disabled={i === days.length - 1} style={{ color: SUBTEXT }} className="opacity-60 hover:opacity-100 disabled:opacity-20"><ChevronDown size={13} /></button>
                </div>
                <Commit value={d.name} onCommit={(v) => renameDay(d.name, v)} className={inp + " flex-1 min-w-0"} />
                <Commit value={cpOffsetStr(d.offset)} placeholder="no date" onCommit={(v) => setOffset(d.name, v)} className={inp + " w-20"} />
                <span style={{ color: SUBTEXT }} className="text-[11px] w-14 text-right">{countDay(d.name)} task{countDay(d.name) !== 1 ? "s" : ""}</span>
                <IconBtn danger onClick={() => delDay(d.name)}><Trash2 size={14} /></IconBtn>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <input value={newDay} onChange={(e) => setNewDay(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDay()} placeholder="New day (e.g. Day 5)" style={inpSt} className={inp + " flex-1 min-w-0"} />
            <input value={newDayOff} onChange={(e) => setNewDayOff(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDay()} placeholder="offset" style={inpSt} className={inp + " w-20"} />
            <PrimaryButton onClick={addDay}><Plus size={14} /> Add</PrimaryButton>
          </div>
        </div>
      </div>
      {msg && <div style={{ color: DANGER }} className="text-xs mt-3">{msg}</div>}
    </div>
  );
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

const CP_MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function cpParseLabel(label) {
  const m = (label || "").match(/([A-Za-z]+)\s+(\d{4})/);
  if (!m) return { year: "Other", mi: 99 };
  const mi = CP_MONTH_NAMES.findIndex((n) => n.toLowerCase().startsWith(m[1].toLowerCase().slice(0, 3)));
  return { year: m[2], mi: mi < 0 ? 99 : mi };
}

const FX_KEY = "workbench-fx";
const FX = { celebrate: true, ambient: true };
try {
  const raw = localStorage.getItem(FX_KEY);
  if (raw) Object.assign(FX, JSON.parse(raw));
} catch {}
function fxOn() {
  return FX.celebrate && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

function shakeMain() {
  const el = document.getElementById("wb-main");
  if (!el) return;
  el.classList.remove("wb-shake");
  void el.offsetWidth;
  el.classList.add("wb-shake");
  setTimeout(() => el.classList.remove("wb-shake"), 450);
}

// Full-screen fireworks on a click-through canvas (~5 seconds).
function fireworks() {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9998";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const palette = ["#FFD34D", "#FF6B6B", "#6BCBFF", "#B388FF", "#7CFFB2", "#FFFFFF", "#FF9EC7"];
  let parts = [];
  const burst = () => {
    const x = canvas.width * (0.15 + Math.random() * 0.7);
    const y = canvas.height * (0.12 + Math.random() * 0.45);
    const c1 = palette[Math.floor(Math.random() * palette.length)];
    const c2 = palette[Math.floor(Math.random() * palette.length)];
    for (let i = 0; i < 70; i++) {
      const a = (Math.PI * 2 * i) / 70 + Math.random() * 0.1;
      const sp = 2 + Math.random() * 4.2;
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, c: i % 2 ? c1 : c2 });
    }
  };
  const start = performance.now();
  const schedule = [0, 350, 800, 1200, 1700, 2100, 2600, 3000];
  let next = 0;
  const tick = (now) => {
    const t = now - start;
    while (next < schedule.length && t >= schedule[next]) {
      burst();
      next++;
    }
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    parts.forEach((p) => {
      p.vy += 0.045;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.011;
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    parts = parts.filter((p) => p.life > 0);
    if (t < 5200) requestAnimationFrame(tick);
    else canvas.remove();
  };
  requestAnimationFrame(tick);
}

// Red CLOSED stamp slammed onto the top of the page (used by the preview button).
function showStamp(sub) {
  const el = document.createElement("div");
  el.style.cssText =
    "position:fixed;left:50%;top:72px;z-index:10000;pointer-events:none;animation:wb-stampfade 4.2s ease-out forwards;";
  el.innerHTML =
    '<div style="color:#EF4444;border:4px solid #EF4444;border-radius:10px;padding:4px 26px;text-align:center;letter-spacing:0.18em;font-weight:900;' +
    'font-size:44px;line-height:1.1;background:rgba(0,0,0,0.12);box-shadow:inset 0 0 0 3px rgba(0,0,0,0.12),inset 0 0 0 5px #EF4444"></div>';
  el.children[0].textContent = "CLOSED";
  document.body.appendChild(el);
  setTimeout(shakeMain, 240);
  setTimeout(() => el.remove(), 4400);
}

// Small medal that slides in at the top right.
function showBadge(title, sub) {
  let box = document.getElementById("wb-badges");
  if (!box) {
    box = document.createElement("div");
    box.id = "wb-badges";
    box.style.cssText = "position:fixed;top:16px;right:16px;z-index:10000;display:flex;flex-direction:column;gap:8px;pointer-events:none";
    document.body.appendChild(box);
  }
  const el = document.createElement("div");
  el.style.cssText =
    "display:flex;align-items:center;gap:10px;padding:10px 16px 10px 10px;border-radius:14px;background:#2A2412;color:#FFF3C4;" +
    "border:1.5px solid #FFD34D;box-shadow:0 6px 24px rgba(0,0,0,0.35);animation:wb-badge 3.9s ease-out forwards;";
  el.innerHTML =
    '<svg width="34" height="34" viewBox="0 0 34 34"><circle cx="17" cy="17" r="15" fill="#FFD34D" stroke="#FFF3B8" stroke-width="2"/>' +
    '<path d="M17 8l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L8.4 14.3l6-.7z" fill="#8A5A00"/></svg>' +
    '<div><div class="t" style="font-weight:700;font-size:14px"></div><div class="s" style="font-size:11px;opacity:0.8"></div></div>';
  el.querySelector(".t").textContent = title;
  el.querySelector(".s").textContent = sub || "";
  box.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// Number that counts up/down to its new value.
function CountUp({ value, suffix = "" }) {
  const [shown, setShown] = useState(value);
  const cur = useRef(value);
  useEffect(() => {
    const from = cur.current;
    if (from === value) return;
    const t0 = performance.now();
    let raf;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 550);
      const v = Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3)));
      cur.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <>
      {shown}
      {suffix}
    </>
  );
}

// Circular progress; turns gold with a drawn check mark at 100%.
function ProgressRing({ pct }) {
  const ref = useRef(null);
  const prev = useRef(pct);
  const full = pct >= 100;
  useEffect(() => {
    if (prev.current < 100 && full && fxOn() && ref.current) {
      const r = ref.current.getBoundingClientRect();
      fireConfetti(r.left + r.width / 2, r.top + r.height / 2, true);
    }
    prev.current = pct;
  }, [pct, full]);
  const R = 30;
  const C = 2 * Math.PI * R;
  const gold = "#FFD34D";
  return (
    <div ref={ref} className="relative shrink-0" style={{ width: 76, height: 76 }}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
        <circle
          cx="38"
          cy="38"
          r={R}
          fill="none"
          stroke={full ? gold : AMBER}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - Math.min(100, pct) / 100)}
          transform="rotate(-90 38 38)"
          style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s", filter: full ? "drop-shadow(0 0 6px rgba(255,211,77,0.8))" : "none" }}
        />
        {full && (
          <path
            d="M26 39l8 8 16-17"
            fill="none"
            stroke={gold}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="44"
            strokeDashoffset="44"
            style={{ animation: "wb-check 0.5s 0.15s ease-out forwards" }}
          />
        )}
      </svg>
      {!full && (
        <div style={{ color: TEXT }} className="absolute inset-0 flex items-center justify-center text-sm font-bold">
          <CountUp value={pct} suffix="%" />
        </div>
      )}
    </div>
  );
}

function fireConfetti(x, y, big) {
  if (typeof window === "undefined" || !fxOn()) return;
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:9999";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  const colors = ["#F87171", "#FBBF24", "#4ADE80", "#38BDF8", "#C4A7F5", "#F9A8D4", "#FFFFFF"];
  const n = big ? 130 : 70;
  const ps = Array.from({ length: n }, () => {
    const a = Math.random() * Math.PI * 2;
    const sp = 3 + Math.random() * (big ? 10 : 7);
    return {
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 4,
      w: 5 + Math.random() * 5,
      h: 3 + Math.random() * 4,
      rot: Math.random() * 6.28,
      vr: (Math.random() - 0.5) * 0.4,
      c: colors[Math.floor(Math.random() * colors.length)],
    };
  });
  let frame = 0;
  const total = 95;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;
    ps.forEach((p) => {
      p.vy += 0.25;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - frame / total);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (frame < total) requestAnimationFrame(tick);
    else canvas.remove();
  };
  tick();
}

// Soft rounded checkbox (same look as the other input boxes) that fires confetti when checked.
function CpCheck({ checked, onChange, person, label, bigWhenChecked }) {
  const boxRef = useRef(null);
  return (
    <label className="flex flex-col items-center gap-1 cursor-pointer select-none min-w-[58px]">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => {
          onChange(e.target.checked);
          if (e.target.checked && boxRef.current) {
            const r = boxRef.current.getBoundingClientRect();
            fireConfetti(r.left + r.width / 2, r.top + r.height / 2, bigWhenChecked);
          }
        }}
      />
      <span
        ref={boxRef}
        style={{
          borderColor: checked ? AMBER : "rgba(255,255,255,0.35)",
          backgroundColor: checked ? AMBER : "rgba(255,255,255,0.05)",
          color: ON_ACCENT,
          transform: checked ? "scale(1.08)" : "scale(1)",
        }}
        className="w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-150"
      >
        {checked && <Check size={15} strokeWidth={3} />}
      </span>
      <span style={{ color: TEXT }} className="text-[11px] font-semibold leading-none">{person}</span>
      <span style={{ color: SUBTEXT }} className="text-[10px] leading-none">{label}</span>
    </label>
  );
}

function cpDeleteMonths(setPlan, ids) {
  setPlan((prev) => {
    const months = prev.months.filter((m) => !ids.includes(m.id));
    if (!months.length) return { ...makeInitialPlan(), cats: prev.cats, days: prev.days };
    return { ...prev, months, activeId: months.some((m) => m.id === prev.activeId) ? prev.activeId : months[0].id };
  });
}

function CpEditForm({ t, onSave, onCancel, onDelete, catNames, dayNames }) {
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
            {(catNames.includes(t.cat) ? catNames : [...catNames, t.cat]).map((c) => (
              <option key={c} value={c} style={OPT_STYLE}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Day</span>
          <select value={d.day} onChange={(e) => set("day")(e.target.value)} style={selSt} className={selCls}>
            {(dayNames.includes(t.day) ? dayNames : [...dayNames, t.day]).map((c) => (
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

function CpTaskRow({ color, m, t, setState, onEdit, onDragStart, onDragEnd, dragId, onDropRow, onMove }) {
  const rowRef = useRef(null);
  const [hover, setHover] = useState(null); // "before" | "after" | null
  const [flash, setFlash] = useState(false);
  const wasDone = useRef(null);
  const prepDone = !!m.state[t.id + "-p"];
  const revDone = !!m.state[t.id + "-r"];
  const allDone = prepDone && (t.rev == null || revDone);
  const status = m.state[t.id + "-s"] || "not-started";
  const note = m.state[t.id + "-n"] || "";
  const [noteOpen, setNoteOpen] = useState(note.trim().length > 0);
  const [noteEditing, setNoteEditing] = useState(note.trim().length === 0);
  useEffect(() => {
    if (wasDone.current === false && allDone && fxOn()) {
      setFlash(true);
      const id = setTimeout(() => setFlash(false), 1300);
      wasDone.current = allDone;
      return () => clearTimeout(id);
    }
    wasDone.current = allDone;
  }, [allDone]);
  const chk = (key, done, person, label) => {
    const isRev = key.endsWith("-r");
    // Finishing the last required box of a task gets the bigger burst.
    const completes = !done && (isRev || t.rev == null ? true : revDone) && (isRev ? prepDone : true);
    return <CpCheck checked={done} onChange={(v) => setState(key, v)} person={person} label={label} bigWhenChecked={completes} />;
  };
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
        position: "relative",
        overflow: "hidden",
        animation: flash ? "wb-flash 1.2s ease-out" : "none",
      }}
      className="border rounded-lg"
    >
      {flash && (
        <span
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            width: "30%",
            background: "linear-gradient(90deg, transparent, rgba(255,230,140,0.55), transparent)",
            animation: "wb-shine 0.9s ease-out forwards",
            pointerEvents: "none",
          }}
        />
      )}
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
            <div className="flex flex-col items-center gap-1 min-w-[58px] opacity-50">
              <span className="w-6 h-6 text-center text-[11px] leading-6" style={{ color: SUBTEXT }}>–</span>
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
  const [manage, setManage] = useState(false);
  const cats = cpCats(plan);
  const dayDefs = cpDays(plan);
  // tasks with a day that is not in the list (e.g. after a rename elsewhere) still show, at the end
  const extraDays = [...new Set(m.tasks.map((t) => t.day))].filter((d) => !dayDefs.some((x) => x.name === d));
  const dayNames = [...dayDefs.map((d) => d.name), ...extraDays];
  const offsetOf = (name) => (dayDefs.find((d) => d.name === name) || {}).offset;
  const catColor = (name) => (cats.find((c) => c.name === name) || {}).color || "#A8B3C7";
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

  // Celebrations: milestone badges and the month-closed fireworks.
  const [stampKey, setStampKey] = useState(0);
  const allDone = m.tasks.length > 0 && m.tasks.every((t) => !!m.state[t.id + "-p"] && (t.rev == null || !!m.state[t.id + "-r"]));
  const doneSig = useRef({ id: null, ids: new Set(), complete: false });
  useEffect(() => {
    const isDone = (t) => !!m.state[t.id + "-p"] && (t.rev == null || !!m.state[t.id + "-r"]);
    const ids = new Set(m.tasks.filter(isDone).map((t) => t.id));
    const complete = m.tasks.length > 0 && ids.size === m.tasks.length;
    const prev = doneSig.current;
    if (prev.id === m.id && fxOn()) {
      const gained = [...ids].filter((id) => !prev.ids.has(id));
      if (gained.length > 0) {
        const badges = [];
        [5, 10, 20].forEach((th) => {
          if (prev.ids.size < th && ids.size >= th) badges.push([`${th} tasks done`, m.label]);
        });
        dayNames.forEach((day) => {
          const list = m.tasks.filter((t) => t.day === day);
          if (!list.length) return;
          const now = list.every((t) => ids.has(t.id));
          const before = list.every((t) => prev.ids.has(t.id));
          if (now && !before) badges.push([`${day} cleared`, `${list.length} task${list.length !== 1 ? "s" : ""} finished`]);
        });
        badges.slice(0, 3).forEach(([a, b], i) => setTimeout(() => showBadge(a, b), i * 450));
      }
      if (complete && !prev.complete) {
        fireworks();
        setStampKey((k) => k + 1);
        setTimeout(shakeMain, 240);
      }
    }
    doneSig.current = { id: m.id, ids, complete };
  }, [m.id, m.tasks, m.state]);

  const addMonth = () => {
    const label = (newLabel || "").trim();
    if (!label) return;
    const nm = cpMakeMonth(label);
    setPlan((prev) => ({ ...prev, months: [...prev.months, nm], activeId: nm.id }));
    setNewLabel(null);
    setFilter("all");
  };
  const removeMonth = () => {
    if (!window.confirm(`Delete "${m.label}"? This cannot be undone.`)) return;
    cpDeleteMonths(setPlan, [m.id]);
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

      <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-xl p-4 mb-4 relative">
        {allDone && (
          <div className="absolute left-1/2 -top-9 pointer-events-none z-10" style={{ marginLeft: -70 }}>
            {stampKey > 0 && (
              <span
                key={"ring" + stampKey}
                style={{ border: "3px solid #EF4444", animation: "wb-ring 0.9s 0.22s ease-out both" }}
                className="absolute inset-0 rounded-lg"
              />
            )}
            <div
              key={"stamp" + stampKey}
              style={{
                color: "#EF4444",
                border: "3px solid #EF4444",
                boxShadow: `inset 0 0 0 2px ${PANEL}, inset 0 0 0 4px #EF4444`,
                backgroundColor: "rgba(0,0,0,0.18)",
                letterSpacing: "0.18em",
                transform: "rotate(-6deg)",
                animation: stampKey > 0 ? "wb-slam 0.45s cubic-bezier(0.2, 1.3, 0.4, 1) both" : "none",
              }}
              className="rounded-lg px-6 py-1 text-3xl font-black select-none"
            >
              CLOSED
            </div>
          </div>
        )}
        <div className="flex items-center gap-3 flex-wrap">
          <LockCtx.Provider value={!renaming}>
            <LockInput
              value={m.label}
              onChange={(e) => patchMonth((x) => ({ ...x, label: e.target.value }))}
              className="text-lg font-bold rounded-md border px-2.5 py-1 min-w-[180px]"
            />
          </LockCtx.Provider>
          <EditToggle editing={renaming} onClick={() => setRenaming((v) => !v)} />
          <IconBtn danger onClick={removeMonth}>
            <Trash2 size={15} />
          </IconBtn>
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

        <div className="flex items-center gap-5 mt-4 flex-wrap">
          <ProgressRing pct={stats.pct} />
          <div className="grid grid-cols-3 gap-5 max-w-md">
            <div>
              <div style={{ color: TEXT }} className="text-xl font-bold">
                <CountUp value={stats.prep} />/{stats.total}
              </div>
              <div style={{ color: SUBTEXT }} className="text-xs">Prepared</div>
            </div>
            <div>
              <div style={{ color: TEXT }} className="text-xl font-bold">
                <CountUp value={stats.rev} />/{stats.total}
              </div>
              <div style={{ color: SUBTEXT }} className="text-xs">Reviewed</div>
            </div>
            <div>
              <div style={{ color: TEXT }} className="text-xl font-bold">
                <CountUp value={stats.pct} suffix="%" />
              </div>
              <div style={{ color: SUBTEXT }} className="text-xs">Complete</div>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: "rgba(0,0,0,0.25)" }} className="h-2 rounded-full mt-3 overflow-hidden">
          <div style={{ width: `${stats.pct}%`, backgroundColor: AMBER }} className="h-full transition-all duration-500 ease-out" />
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
        <button
          onClick={() => setManage((v) => !v)}
          style={{ color: manage ? ON_ACCENT : AMBER, backgroundColor: manage ? AMBER : "transparent", borderColor: AMBER }}
          className="ml-auto text-xs font-semibold rounded-full border px-3 py-1 inline-flex items-center gap-1.5"
        >
          <Pencil size={12} /> Customize categories &amp; days
        </button>
      </div>
      {manage && <CpManage plan={plan} setPlan={setPlan} />}

      <div className="flex flex-col gap-5">
        {dayNames.map((day) => {
          const tasks = visible.filter((t) => t.day === day);
          if (!tasks.length) return null;
          const badge = cpDayBadge(m.day1, offsetOf(day));
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
                      catNames={cats.map((c) => c.name)}
                      dayNames={dayNames}
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
                      color={catColor(t.cat)}
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
        {cats.map(({ name: k, color: c }) => (
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
function CloseTree({ plan, tab, setTab, setPlan }) {
  const [open, setOpen] = useState(false);
  const [yearsOpen, setYearsOpen] = useState({});
  const active = tab === "close";
  const groups = useMemo(() => {
    const map = {};
    plan.months.forEach((m) => {
      const { year, mi } = cpParseLabel(m.label);
      (map[year] = map[year] || []).push({ m, mi });
    });
    Object.values(map).forEach((list) => list.sort((a, b) => a.mi - b.mi));
    return Object.keys(map)
      .sort((a, b) => (a === "Other" ? 1 : b === "Other" ? -1 : b.localeCompare(a)))
      .map((y) => [y, map[y]]);
  }, [plan.months]);
  const activeYear = cpParseLabel((plan.months.find((m) => m.id === plan.activeId) || {}).label).year;
  return (
    <div className="shrink-0">
      <button
        onClick={() => {
          setTab("close");
          setOpen((v) => (active ? !v : true));
        }}
        style={{
          color: active ? AMBER : SUBTEXT,
          background: active ? `radial-gradient(120px 60px at 0% 50%, ${AMBER_SOFT}, transparent)` : "transparent",
          borderLeft: active ? `2px solid ${AMBER}` : "2px solid transparent",
        }}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all"
      >
        <CalendarDays size={16} />
        Close Plan
        <span className="ml-auto hidden sm:block">{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
      </button>
      {open && (
        <div className="hidden sm:block pb-1">
          {groups.map(([year, list]) => {
            const yOpen = yearsOpen[year] ?? year === activeYear;
            return (
              <div key={year}>
                <div className="group flex items-center pr-3">
                  <button
                    onClick={() => setYearsOpen((p) => ({ ...p, [year]: !yOpen }))}
                    style={{ color: SUBTEXT }}
                    className="flex-1 flex items-center gap-1.5 pl-8 pr-2 py-1.5 text-xs font-semibold hover:brightness-125"
                  >
                    {yOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {year}
                    <span className="ml-auto opacity-60">{list.length}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!window.confirm(`Delete the whole year ${year} (${list.length} month${list.length !== 1 ? "s" : ""})? This cannot be undone.`)) return;
                      cpDeleteMonths(setPlan, list.map(({ m }) => m.id));
                    }}
                    title={`Delete ${year}`}
                    style={{ color: DANGER }}
                    className="opacity-0 group-hover:opacity-80 hover:!opacity-100 transition-opacity"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {yOpen &&
                  list.map(({ m }) => {
                    const on = active && plan.activeId === m.id;
                    return (
                      <div
                        key={m.id}
                        style={{ backgroundColor: on ? AMBER_SOFT : "transparent" }}
                        className="group flex items-center pr-3"
                      >
                        <button
                          onClick={() => {
                            setPlan((prev) => ({ ...prev, activeId: m.id }));
                            setTab("close");
                          }}
                          style={{ color: on ? AMBER : TEXT }}
                          className="flex-1 min-w-0 text-left pl-12 pr-2 py-1.5 text-xs hover:brightness-125 truncate"
                        >
                          {m.label}
                        </button>
                        <button
                          onClick={() => {
                            if (!window.confirm(`Delete "${m.label}"? This cannot be undone.`)) return;
                            cpDeleteMonths(setPlan, [m.id]);
                          }}
                          title="Delete month"
                          style={{ color: DANGER }}
                          className="opacity-0 group-hover:opacity-80 hover:!opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Falling snow / twinkling stars / drifting petals, drawn on a click-through canvas.
function Ambient({ kind }) {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const count = kind === "snow" ? 70 : kind === "stars" ? 46 : 30;
    const starColors = ["#FFE08A", "#FFB3D9", "#FFFFFF"];
    const petalColors = ["#F9C5D1", "#FFFFFF", "#FBE38E", "#C8E6A0"];
    const items = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: kind === "snow" ? 1 + Math.random() * 2.6 : kind === "stars" ? 3 + Math.random() * 5 : 4 + Math.random() * 5,
      v: kind === "stars" ? 0.1 + Math.random() * 0.25 : 0.4 + Math.random() * 1.1,
      d: Math.random() * Math.PI * 2,
      rot: Math.random() * Math.PI * 2,
      c: kind === "stars" ? pick(starColors) : kind === "petals" ? pick(petalColors) : "#FFFFFF",
    }));
    const star = (x, y, r) => {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rad = i % 2 === 0 ? r : r * 0.35;
        const ang = (Math.PI / 4) * i - Math.PI / 2;
        ctx.lineTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
      }
      ctx.closePath();
      ctx.fill();
    };
    let raf;
    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      items.forEach((f) => {
        f.d += kind === "stars" ? 0.03 : 0.01;
        f.y += f.v;
        f.x += Math.sin(f.d) * (kind === "petals" ? 0.9 : 0.5);
        f.rot += 0.02;
        if (f.y > h + 10) {
          f.y = -10;
          f.x = Math.random() * w;
        }
        ctx.fillStyle = f.c;
        if (kind === "snow") {
          ctx.globalAlpha = 0.85;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (kind === "stars") {
          ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(f.d * 2));
          star(f.x, f.y, f.r);
        } else {
          ctx.globalAlpha = 0.85;
          ctx.save();
          ctx.translate(f.x, f.y);
          ctx.rotate(f.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, f.r, f.r * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [kind]);
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 40 }} />;
}

function Toggle({ on, onChange, label, hint }) {
  return (
    <button
      onClick={() => onChange(!on)}
      style={{ backgroundColor: PANEL, borderColor: on ? AMBER : PANEL_LINE }}
      className="w-full flex items-center gap-3 rounded-xl border p-3 text-left hover:brightness-110 transition-all"
    >
      <span
        style={{ backgroundColor: on ? AMBER : "rgba(255,255,255,0.18)" }}
        className="relative w-10 h-6 rounded-full shrink-0 transition-colors"
      >
        <span
          style={{ backgroundColor: on ? ON_ACCENT : "#fff", left: on ? 20 : 4 }}
          className="absolute top-1 w-4 h-4 rounded-full transition-all"
        />
      </span>
      <span className="flex-1 min-w-0">
        <span style={{ color: TEXT }} className="block text-sm font-semibold">{label}</span>
        <span style={{ color: SUBTEXT }} className="block text-xs mt-0.5">{hint}</span>
      </span>
    </button>
  );
}

function SettingsView({ themeKey, setThemeKey, fontKey, setFontKey, fx, setFx }) {
  return (
    <div>
      <SectionHeader title="Settings" subtitle="Choose a color theme and font, saved on this device" />
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

      <div style={{ color: TEXT }} className="text-sm font-bold mt-8 mb-3">Font</div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {FONTS.map((f) => {
          const active = fontKey === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFontKey(f.key)}
              style={{
                backgroundColor: PANEL,
                borderColor: active ? AMBER : PANEL_LINE,
                borderWidth: active ? 2 : 1,
                fontFamily: f.stack,
              }}
              className="rounded-xl border text-left p-3 hover:brightness-110 transition-all"
            >
              <div style={{ color: TEXT }} className="text-2xl font-semibold leading-tight">Aa Bb 123</div>
              <div style={{ color: SUBTEXT }} className="text-xs mt-1 flex items-center justify-between">
                {f.name}
                {active && <CheckCircle2 size={14} color={AMBER} />}
              </div>
              <div style={{ color: SUBTEXT }} className="text-[11px] mt-1 truncate">Close Plan 1234</div>
            </button>
          );
        })}
      </div>
      <div style={{ color: TEXT }} className="text-sm font-bold mt-8 mb-3">Effects</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-3xl">
        <Toggle
          on={fx.celebrate}
          onChange={(v) => setFx({ celebrate: v })}
          label="Celebration effects"
          hint="Confetti, task shine, medals, the CLOSED stamp and month-end fireworks."
        />
        <Toggle
          on={fx.ambient}
          onChange={(v) => setFx({ ambient: v })}
          label="Background effects"
          hint="Falling snow, stars or petals on the Christmas, Sailor Moon and Garden themes."
        />
      </div>
      <div className="mt-3">
        <button
          onClick={() => {
            fireworks();
            showStamp();
            setTimeout(() => showBadge("Day 3 cleared", "Preview"), 500);
          }}
          style={{ color: AMBER, borderColor: AMBER }}
          className="text-xs font-semibold rounded-full border px-4 py-1.5 hover:brightness-110"
        >
          Preview celebration
        </button>
      </div>
      <BackupPanel />
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
                  <span style={{ color: TEXT }} className="truncate">{e.entity || "—"} · {e.jid}{e.approver ? ` · ${e.approver}` : ""}</span>
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
// Sidebar title and subtitle that can be renamed; saved on this device.
const BRAND_KEY = "workbench-brand";
function BrandHeader() {
  const [brand, setBrand] = useState(() => {
    try {
      const b = JSON.parse(localStorage.getItem(BRAND_KEY) || "null");
      if (b && typeof b.title === "string") return b;
    } catch (e) {}
    return { title: "Personal Workbench", sub: "Your daily desk" };
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(brand);
  useEffect(() => {
    document.title = brand.title || "Personal Workbench";
  }, [brand.title]);
  const save = () => {
    const next = { title: draft.title.trim() || "Personal Workbench", sub: draft.sub.trim() };
    setBrand(next);
    try { localStorage.setItem(BRAND_KEY, JSON.stringify(next)); } catch (e) {}
    setEditing(false);
  };
  const inputStyle = { color: TEXT, borderColor: PANEL_LINE, backgroundColor: "rgba(0,0,0,0.15)" };
  const onKey = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") setEditing(false);
  };
  return (
    <div className="px-4 py-4 hidden sm:block group">
      {editing ? (
        <div className="space-y-1.5">
          <input
            autoFocus
            value={draft.title}
            maxLength={40}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            onKeyDown={onKey}
            placeholder="Name"
            style={inputStyle}
            className="w-full text-sm font-bold rounded-md border px-2 py-1 outline-none"
          />
          <input
            value={draft.sub}
            maxLength={60}
            onChange={(e) => setDraft({ ...draft, sub: e.target.value })}
            onKeyDown={onKey}
            placeholder="Subtitle"
            style={inputStyle}
            className="w-full text-[11px] rounded-md border px-2 py-1 outline-none"
          />
          <button onClick={save} style={{ color: AMBER }} className="text-[11px] font-semibold inline-flex items-center gap-1">
            <Check size={12} /> Save
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div style={{ color: TEXT }} className="font-bold text-base break-words">{brand.title}</div>
            {brand.sub && <div style={{ color: SUBTEXT }} className="text-[11px] mt-0.5 break-words">{brand.sub}</div>}
          </div>
          <button
            title="Rename"
            onClick={() => { setDraft(brand); setEditing(true); }}
            style={{ color: SUBTEXT }}
            className="opacity-50 hover:opacity-100 group-hover:opacity-100 mt-1 shrink-0"
          >
            <Pencil size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Backup: export everything to Excel (readable sheets + a hidden restore sheet)
// ---------------------------------------------------------------------------
const BACKUP_SETTING_KEYS = [THEME_KEY, FONT_KEY, FX_KEY, BRAND_KEY];
const LAST_BACKUP_KEY = "workbench-last-backup";
const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

async function exportBackup() {
  const XLSX = await import("xlsx");
  const lbl = (map, k) => (map[k] ? map[k].label : k || "");
  const sheet = (rows, widths) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    if (rows.length) ws["!cols"] = (widths || Object.keys(rows[0]).map(() => 22)).map((w) => ({ wch: w }));
    return ws;
  };
  const wb = XLSX.utils.book_new();
  const add = (name, rows, widths) => XLSX.utils.book_append_sheet(wb, sheet(rows.length ? rows : [{ "(empty)": "" }], widths), name);

  const todos = readJson(STORE_KEYS.todos, []);
  add("To-Do", todos.map((t) => ({
    Quadrant: QUADS[quadOf(t)].label, Task: t.text, Due: t.due || "", Done: t.done ? "Yes" : "",
  })), [18, 50, 12, 8]);
  add("Follow-ups", readJson(STORE_KEYS.comms, []).map((c) => ({
    Subject: c.subject, Contact: c.contact, Status: lbl(COMM_STATUS, c.status), Date: c.date, Notes: c.notes,
  })), [40, 22, 16, 12, 60]);
  add("Tasks", readJson(STORE_KEYS.tasks, []).map((t) => ({
    Title: t.title, Project: t.project, Status: lbl(TASK_STATUS, t.status), Owner: t.owner, Due: t.due, Notes: t.notes,
  })), [36, 22, 14, 16, 12, 60]);
  add("Meetings", readJson(STORE_KEYS.meetings, []).map((m) => ({
    Title: m.title, Date: m.date, Attendees: m.attendees, Notes: m.notes,
    "Action items": (m.actions || []).map((a) => `${a.done ? "[x]" : "[ ]"} ${a.text}`).join("\n"),
  })), [30, 12, 30, 70, 50]);
  add("Contacts", readJson(STORE_KEYS.contacts, []).map((c) => ({
    Name: c.name, Role: c.role, "Contact info": c.contactInfo, Notes: c.notes,
  })), [24, 24, 34, 60]);
  add("Notes", readJson(STORE_KEYS.notes, []).map((n) => ({
    Created: (n.createdAt || "").slice(0, 16).replace("T", " "), Note: n.text,
  })), [18, 90]);
  add("JE Tracker", readJson(STORE_KEYS.je, []).map((e) => ({
    Entity: e.entity, "Journal ID": e.jid, Status: lbl(ENTRY_STATUS, e.status), Approver: e.approver, Note: e.note, Created: e.createdAt,
  })), [16, 18, 18, 18, 50, 12]);
  const plan = readJson(STORE_KEYS.close, null);
  const cpRows = [];
  (plan?.months || []).forEach((m) => {
    m.tasks.forEach((t) => {
      cpRows.push({
        Month: m.label, Day: t.day, Category: t.cat, Task: t.name, "Prepared by": t.prep || "", "Reviewed by": t.rev || "",
        Prepared: m.state[t.id + "-p"] ? "Yes" : "", Reviewed: t.rev == null ? "n/a" : m.state[t.id + "-r"] ? "Yes" : "",
        Status: lbl(CP_STATUS, m.state[t.id + "-s"] || "not-started"),
      });
    });
  });
  add("Close Plan", cpRows, [16, 12, 18, 50, 14, 14, 10, 10, 14]);

  // Hidden sheet holding the full data, used by "Import backup".
  const data = {};
  [...Object.values(STORE_KEYS), ...BACKUP_SETTING_KEYS].forEach((k) => {
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  });
  const json = JSON.stringify({ app: "personal-workbench", version: 1, exportedAt: new Date().toISOString(), data });
  const chunks = [];
  for (let i = 0; i < json.length; i += 30000) chunks.push([json.slice(i, i + 30000)]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(chunks), "_backup");
  wb.Workbook = { Sheets: wb.SheetNames.map((n) => ({ Hidden: n === "_backup" ? 1 : 0 })) };

  XLSX.writeFile(wb, `workbench-backup-${todayStr()}.xlsx`);
  try { localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString()); } catch {}
}

async function importBackup(file) {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const ws = wb.Sheets["_backup"];
  if (!ws) throw new Error("This file is not a workbench backup.");
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const parsed = JSON.parse(rows.map((r) => r[0] || "").join(""));
  if (parsed.app !== "personal-workbench" || !parsed.data) throw new Error("This file is not a workbench backup.");
  return parsed;
}

function BackupPanel() {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);
  let last = "";
  try { last = localStorage.getItem(LAST_BACKUP_KEY) || ""; } catch {}
  const doExport = async () => {
    setBusy(true);
    try {
      await exportBackup();
      setMsg("Backup downloaded.");
    } catch (e) {
      setMsg("Export failed: " + e.message);
    }
    setBusy(false);
  };
  const doImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const b = await importBackup(file);
      const when = b.exportedAt ? new Date(b.exportedAt).toLocaleString() : "unknown date";
      if (!window.confirm(`Replace ALL current data with the backup from ${when}? This cannot be undone.`)) return;
      Object.entries(b.data).forEach(([k, v]) => localStorage.setItem(k, v));
      setMsg("Restored. Reloading…");
      setTimeout(() => window.location.reload(), 400);
    } catch (err) {
      setMsg(err.message || "Import failed.");
    }
  };
  const btn = "text-xs font-semibold rounded-full border px-4 py-1.5 hover:brightness-110 inline-flex items-center gap-1.5 disabled:opacity-50";
  return (
    <div className="mt-8">
      <div style={{ color: TEXT }} className="text-sm font-bold mb-1">Backup</div>
      <div style={{ color: SUBTEXT }} className="text-xs mb-3">
        Your data lives in this browser only. Export it to an Excel file to keep a copy or move to another computer.
        {last ? ` Last backup: ${new Date(last).toLocaleString()}.` : " No backup yet."}
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <button disabled={busy} onClick={doExport} style={{ color: ON_ACCENT, backgroundColor: AMBER, borderColor: AMBER }} className={btn}>
          <Download size={14} /> Export to Excel
        </button>
        <button onClick={() => fileRef.current?.click()} style={{ color: AMBER, borderColor: AMBER }} className={btn}>
          <Upload size={14} /> Import backup
        </button>
        <input ref={fileRef} type="file" accept=".xlsx" onChange={doImport} className="hidden" />
        {msg && <span style={{ color: SUBTEXT }} className="text-xs">{msg}</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Global search (/) and quick note (N)
// ---------------------------------------------------------------------------
function GlobalSearch({ onClose, data, go }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const items = useMemo(() => {
    const out = [];
    const push = (type, title, sub, tab, extra) => out.push({ type, title: title || "(untitled)", sub: sub || "", tab, extra, hay: `${title} ${sub}`.toLowerCase() });
    data.notes.forEach((n) => push("Note", n.text, (n.createdAt || "").slice(0, 10), "notes"));
    data.todos.forEach((t) => push("To-Do", t.text, [QUADS[quadOf(t)].label, t.due].filter(Boolean).join(" · "), "todos"));
    data.tasks.forEach((t) => push("Task", t.title, [t.project, t.owner, t.notes].filter(Boolean).join(" · "), "tasks"));
    data.comms.forEach((c) => push("Follow-up", c.subject, [c.contact, c.notes].filter(Boolean).join(" · "), "comms"));
    data.meetings.forEach((m) => push("Meeting", m.title, [m.date, m.attendees, m.notes].filter(Boolean).join(" · "), "meetings"));
    data.contacts.forEach((c) => push("Contact", c.name, [c.role, c.contactInfo, c.notes].filter(Boolean).join(" · "), "contacts"));
    data.entries.forEach((e) => push("JE", `${e.entity} ${e.jid}`.trim(), [ENTRY_STATUS[e.status]?.label, e.approver, e.note].filter(Boolean).join(" · "), "je"));
    (data.closePlan?.months || []).forEach((m) =>
      m.tasks.forEach((t) => push("Close Plan", t.name, [m.label, t.day, t.cat, t.prep].filter(Boolean).join(" · "), "close", m.id))
    );
    return out;
  }, [data]);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results = terms.length ? items.filter((it) => terms.every((w) => it.hay.includes(w))).slice(0, 40) : [];
  useEffect(() => setSel(0), [q]);
  const open = (it) => {
    if (!it) return;
    go(it.tab, it.extra);
    onClose();
  };
  const onKey = (e) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter") open(results[sel]);
  };
  return (
    <div onClick={onClose} className="fixed inset-0 z-[9000] flex items-start justify-center pt-[12vh] px-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: PANEL, borderColor: PANEL_LINE }} className="w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2.5 border-b" style={{ borderColor: PANEL_LINE }}>
          <Search size={16} color={SUBTEXT} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search notes, to-dos, tasks, JEs, contacts, close plan…"
            style={{ color: TEXT }}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <span style={{ color: SUBTEXT, borderColor: PANEL_LINE }} className="text-[10px] border rounded px-1.5 py-0.5">Esc</span>
        </div>
        <div className="max-h-[50vh] overflow-auto">
          {terms.length > 0 && results.length === 0 && <div style={{ color: SUBTEXT }} className="text-sm px-4 py-6 text-center">No matches.</div>}
          {terms.length === 0 && <div style={{ color: SUBTEXT }} className="text-sm px-4 py-6 text-center">Type to search everything. Use ↑ ↓ and Enter.</div>}
          {results.map((it, i) => (
            <button
              key={i}
              onClick={() => open(it)}
              onMouseEnter={() => setSel(i)}
              style={{ backgroundColor: i === sel ? AMBER_SOFT : "transparent" }}
              className="w-full text-left px-4 py-2 flex items-center gap-3"
            >
              <span style={{ color: AMBER, borderColor: AMBER }} className="text-[10px] font-bold border rounded-full px-2 py-0.5 shrink-0 w-[74px] text-center">{it.type}</span>
              <span className="min-w-0">
                <span style={{ color: TEXT }} className="block text-sm truncate">{it.title}</span>
                {it.sub && <span style={{ color: SUBTEXT }} className="block text-[11px] truncate">{it.sub}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickNoteBox({ onClose, onSave }) {
  const [text, setText] = useState("");
  const save = () => {
    const v = text.trim();
    if (v) onSave(v);
    onClose();
  };
  return (
    <div onClick={onClose} className="fixed inset-0 z-[9000] flex items-start justify-center pt-[18vh] px-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: PANEL, borderColor: PANEL_LINE }} className="w-full max-w-lg rounded-xl border shadow-2xl p-3">
        <div style={{ color: TEXT }} className="text-sm font-bold mb-2">Quick note</div>
        <textarea
          autoFocus
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); save(); }
          }}
          placeholder="Write something…  Enter to save, Shift+Enter for a new line, Esc to cancel"
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="w-full text-sm rounded-md border px-2.5 py-2 outline-none resize-none"
        />
        <div className="flex justify-end mt-2">
          <PrimaryButton onClick={save}>Save note</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export default function PersonalWorkbench() {
  const [tab, setTab] = useState("dashboard");
  const [closePlan, setClosePlan] = useState(null);
  const [approvers, setApprovers] = useState([]);
  const [fx, setFxState] = useState({ ...FX });
  const setFx = (patch) => {
    Object.assign(FX, patch);
    setFxState({ ...FX });
    try {
      localStorage.setItem(FX_KEY, JSON.stringify(FX));
    } catch {}
  };
  const [fontKey, setFontKeyState] = useState(savedFontKey);
  const setFontKey = (k) => {
    setFontKeyState(k);
    applyFont(k);
    try {
      localStorage.setItem(FONT_KEY, k);
    } catch {}
  };
  const [themeKey, setThemeKeyState] = useState(savedThemeKey);
  const setThemeKey = (k) => {
    setThemeKeyState(k);
    applyTheme(k);
    try {
      localStorage.setItem(THEME_KEY, k);
    } catch {}
  };
  const [searchOpen, setSearchOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const [toast, setToast] = useState("");
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
        loadKey(STORE_KEYS.approvers, setApprovers),
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

  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.approvers, JSON.stringify(approvers)).catch(() => {});
  }, [approvers, loaded]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const el = e.target;
      const tag = el && el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (el && el.isContentEditable)) return;
      if (e.key === "/") {
        e.preventDefault();
        setNoteOpen(false);
        setSearchOpen(true);
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setSearchOpen(false);
        setNoteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const quickSave = (text) => {
    setNotes((prev) => [{ id: uid("nt"), text, createdAt: new Date().toISOString() }, ...prev]);
    setToast("Note saved");
    setTimeout(() => setToast(""), 1800);
  };
  const goSearch = (tabKey, extra) => {
    if (tabKey === "close" && extra) setClosePlan((p) => ({ ...p, activeId: extra }));
    setTab(tabKey);
  };

  const openTodoCount = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  return (
    <div style={{ backgroundColor: BG, fontFamily: FONT, minHeight: "100vh" }} className="w-full flex flex-col sm:flex-row">
      {(() => {
        const fxKind = (THEMES.find((t) => t.key === themeKey) || {}).fx;
        return fxKind && fx.ambient ? <Ambient key={fxKind} kind={fxKind} /> : null;
      })()}
      {/* Sidebar */}
      <div style={{ backgroundColor: SIDEBAR, borderColor: PANEL_LINE }} className="sm:w-52 shrink-0 border-b sm:border-b-0 sm:border-r flex sm:flex-col sm:sticky sm:top-0 sm:h-screen sm:self-start">
        <BrandHeader />
        <nav className="flex sm:flex-col flex-1 overflow-x-auto sm:overflow-x-hidden sm:overflow-y-auto">
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
          {closePlan && <CloseTree plan={closePlan} tab={tab} setTab={setTab} setPlan={setClosePlan} />}
        </nav>
        <div className="shrink-0 flex items-center justify-between sm:px-3 sm:py-3 px-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              title="Search (/)"
              aria-label="Search"
              style={{ color: SUBTEXT }}
              className="p-2 rounded-lg hover:brightness-125 transition-all"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setNoteOpen(true)}
              title="Quick note (N)"
              aria-label="Quick note"
              style={{ color: SUBTEXT }}
              className="p-2 rounded-lg hover:brightness-125 transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          <button
            onClick={() => setTab("settings")}
            title="Settings"
            aria-label="Settings"
            style={{ color: tab === "settings" ? AMBER : SUBTEXT, backgroundColor: tab === "settings" ? AMBER_SOFT : "transparent" }}
            className="p-2 rounded-lg hover:brightness-125 transition-all"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>

      {searchOpen && (
        <GlobalSearch
          onClose={() => setSearchOpen(false)}
          go={goSearch}
          data={{ notes, todos, tasks, comms, meetings, contacts, entries, closePlan }}
        />
      )}
      {noteOpen && <QuickNoteBox onClose={() => setNoteOpen(false)} onSave={quickSave} />}
      {toast && (
        <div style={{ backgroundColor: AMBER, color: ON_ACCENT }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9500] text-sm font-semibold rounded-full px-4 py-2 shadow-lg">
          {toast}
        </div>
      )}

      {/* Main content */}
      <div id="wb-main" className="flex-1 px-5 py-5 sm:px-8 sm:py-6 overflow-auto">
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
        {tab === "settings" && <SettingsView themeKey={themeKey} setThemeKey={setThemeKey} fontKey={fontKey} setFontKey={setFontKey} fx={fx} setFx={setFx} />}
        {tab === "je" && <JeTrackerView entries={entries} setEntries={setEntries} approvers={approvers} setApprovers={setApprovers} />}
      </div>
    </div>
  );
}
