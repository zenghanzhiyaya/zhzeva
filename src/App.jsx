import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid,
  Users,
  CheckSquare,
  GraduationCap,
  StickyNote,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  Layers,
  MessageCircle,
  Link as LinkIcon,
  Contact,
  ExternalLink,
  ClipboardCheck,
  Download,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Design tokens — "desk lamp" workspace: dark charcoal-blue desk, warm amber
// spotlight on whichever tool you're using.
// ---------------------------------------------------------------------------
const BG = "#334355"; // background
const PANEL = "#3D4E63"; // card / panel surface (lighter tint of background)
const PANEL_LINE = "#4C5F77";
const AMBER = "#66FCFC"; // button / accent color
const AMBER_SOFT = "rgba(102, 252, 252, 0.16)";
const TEXT = "#EDEFF3";
const SUBTEXT = "#93A0B4";
const DANGER = "#E3796B";
const DONE = "#6EE7C9";

const FONT = '"Segoe UI", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "notes", label: "Quick Notes", icon: StickyNote },
  { key: "todos", label: "To-Do", icon: CheckSquare },
  { key: "comms", label: "Follow-ups", icon: MessageCircle },
  { key: "tasks", label: "Tasks", icon: Layers },
  { key: "meetings", label: "Meetings", icon: Users },
  { key: "trainings", label: "Training Notes", icon: GraduationCap },
  { key: "docs", label: "Docs & Links", icon: LinkIcon },
  { key: "contacts", label: "Contacts", icon: Contact },
  { key: "selfreview", label: "Self-Review Tracker", icon: ClipboardCheck },
];

const STORE_KEYS = {
  meetings: "workbench-meetings",
  todos: "workbench-todos",
  tasks: "workbench-tasks",
  comms: "workbench-comms",
  trainings: "workbench-trainings",
  docs: "workbench-docs",
  contacts: "workbench-contacts",
  notes: "workbench-notes",
  srJeEntries: "workbench-sr-je-entries",
  srBlEntries: "workbench-sr-bl-entries",
  srJeCustom: "workbench-sr-je-custom",
  srBlCustom: "workbench-sr-bl-custom",
};

const TASK_STATUS = {
  todo: { label: "Not Started", color: "#93A0B4" },
  doing: { label: "In Progress", color: "#66FCFC" },
  done: { label: "Done", color: "#6EE7C9" },
  stuck: { label: "Stuck", color: "#E3796B" },
};

const COMM_STATUS = {
  waiting: { label: "Waiting Reply", color: "#66FCFC" },
  pending: { label: "Pending", color: "#E3796B" },
  done: { label: "Done", color: "#6EE7C9" },
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
function Field({ label, value, onChange, placeholder, type = "text", className = "" }) {
  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
        className="text-sm rounded-md border px-2.5 py-1.5 outline-none focus:border-2"
        onFocus={(e) => (e.target.style.borderColor = AMBER)}
        onBlur={(e) => (e.target.style.borderColor = PANEL_LINE)}
      />
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="flex flex-col gap-1">
      <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">
        {label}
      </span>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
        className="text-sm rounded-md border px-2.5 py-1.5 outline-none resize-none"
      />
    </label>
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
      style={{ backgroundColor: AMBER, color: "#344356" }}
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
              <div className="px-4 pb-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Meeting Title" value={m.title} onChange={(v) => update(m.id, { title: v })} placeholder="e.g. Quarterly business review" />
                  <Field label="Date" type="date" value={m.date} onChange={(v) => update(m.id, { date: v })} />
                  <Field label="Attendees" value={m.attendees} onChange={(v) => update(m.id, { attendees: v })} placeholder="e.g. Alex, Jamie" />
                </div>
                <TextAreaField label="Meeting Notes" value={m.notes} onChange={(v) => update(m.id, { notes: v })} placeholder="Discussion points, decisions…" />
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
                        <input
                          value={a.text}
                          onChange={(e) => updateAction(m.id, a.id, { text: e.target.value })}
                          placeholder="Action item"
                          style={{
                            color: a.done ? SUBTEXT : TEXT,
                            textDecoration: a.done ? "line-through" : "none",
                            borderColor: "transparent",
                          }}
                          className="flex-1 bg-transparent text-sm outline-none border-b focus:border-b"
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
              </div>
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
const PRIORITIES = { high: { label: "High", color: DANGER }, medium: { label: "Medium", color: AMBER }, low: { label: "Low", color: SUBTEXT } };

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
          <option value="high">High priority</option>
          <option value="medium">Medium priority</option>
          <option value="low">Low priority</option>
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
          <div key={t.id} style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-md px-3 py-2 flex items-center gap-3">
            <button onClick={() => toggle(t.id)}>
              {t.done ? <CheckCircle2 size={18} color={DONE} /> : <Circle size={18} color={SUBTEXT} />}
            </button>
            <span
              style={{ color: t.done ? SUBTEXT : TEXT, textDecoration: t.done ? "line-through" : "none" }}
              className="flex-1 text-sm"
            >
              {t.text}
            </span>
            {t.due && (
              <span style={{ color: SUBTEXT }} className="text-xs shrink-0">
                {t.due}
              </span>
            )}
            <span
              style={{ color: PRIORITIES[t.priority].color, borderColor: PRIORITIES[t.priority].color }}
              className="text-[10px] font-bold border rounded px-1.5 py-0.5 shrink-0"
            >
              {PRIORITIES[t.priority].label}
            </span>
            <IconBtn danger onClick={() => remove(t.id)}>
              <Trash2 size={15} />
            </IconBtn>
          </div>
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
                      style={{ color: TASK_STATUS[t.status].color, borderColor: TASK_STATUS[t.status].color }}
                      className="text-[10px] font-bold border rounded px-1.5 py-0.5 shrink-0"
                    >
                      {TASK_STATUS[t.status].label}
                    </span>
                    <IconBtn danger onClick={(e) => { e.stopPropagation(); remove(t.id); }}>
                      <Trash2 size={15} />
                    </IconBtn>
                  </div>
                  {t.open && (
                    <div className="px-4 pb-4 flex flex-col gap-3">
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
                            style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
                            className="text-sm rounded-md border px-2.5 py-1.5 outline-none"
                          >
                            {Object.entries(TASK_STATUS).map(([key, s]) => (
                              <option key={key} value={key}>{s.label}</option>
                            ))}
                          </select>
                        </label>
                        <Field label="Owner" value={t.owner} onChange={(v) => update(t.id, { owner: v })} placeholder="e.g. Sam" />
                        <Field label="Due Date" type="date" value={t.due} onChange={(v) => update(t.id, { due: v })} />
                      </div>
                      <TextAreaField label="Notes" value={t.notes} onChange={(v) => update(t.id, { notes: v })} placeholder="Progress, blockers, next steps…" rows={3} />
                    </div>
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
  const [draftStatus, setDraftStatus] = useState("waiting");
  const [filter, setFilter] = useState("all");

  const add = () => {
    const subject = draftSubject.trim();
    if (!subject) return;
    setComms((prev) => [
      { id: uid("cm"), subject, contact: draftContact.trim(), status: draftStatus, date: todayStr(), notes: "" },
      ...prev,
    ]);
    setDraftSubject("");
    setDraftContact("");
  };
  const update = (id, patch) => setComms((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const remove = (id) => setComms((prev) => prev.filter((c) => c.id !== id));

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
            <option key={key} value={key}>{s.label}</option>
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
      <div className="flex flex-col gap-1.5">
        {visible.map((c) => (
          <div key={c.id} style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-md px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex-1 min-w-0">
              <div style={{ color: TEXT }} className="text-sm font-medium truncate">{c.subject}</div>
              {c.contact && <div style={{ color: SUBTEXT }} className="text-xs mt-0.5">{c.contact}</div>}
            </div>
            <span style={{ color: SUBTEXT }} className="text-xs shrink-0">{c.date}</span>
            <select
              value={c.status}
              onChange={(e) => update(c.id, { status: e.target.value })}
              style={{ color: COMM_STATUS[c.status].color, borderColor: COMM_STATUS[c.status].color, backgroundColor: "transparent" }}
              className="text-[11px] font-bold border rounded px-1.5 py-0.5 shrink-0 outline-none"
            >
              {Object.entries(COMM_STATUS).map(([key, s]) => (
                <option key={key} value={key} style={{ color: "#000" }}>{s.label}</option>
              ))}
            </select>
            <IconBtn danger onClick={() => remove(c.id)}>
              <Trash2 size={15} />
            </IconBtn>
          </div>
        ))}
      </div>
    </div>
  );
}
function newTraining() {
  return { id: uid("tr"), title: "", date: todayStr(), category: "", takeaways: "", open: true };
}

function TrainingNotesEditor({ value, onSave }) {
  const [editing, setEditing] = useState(!value);
  const [draft, setDraft] = useState(value);
  const taRef = React.useRef(null);

  const autoGrow = (node) => {
    if (!node) return;
    node.style.height = "auto";
    node.style.height = Math.max(node.scrollHeight, 260) + "px";
  };

  useEffect(() => {
    if (editing) autoGrow(taRef.current);
  }, [editing, draft]);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };
  const save = () => {
    onSave(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Key Takeaways</span>
          <button onClick={startEdit} style={{ color: AMBER }} className="text-xs font-semibold">
            Edit
          </button>
        </div>
        <div
          onClick={startEdit}
          style={{ borderColor: PANEL_LINE, backgroundColor: "rgba(0,0,0,0.15)", color: value ? TEXT : SUBTEXT, minHeight: "120px" }}
          className="text-sm leading-relaxed whitespace-pre-wrap rounded-md border px-3 py-2.5 cursor-text"
        >
          {value || "Click here to start recording key takeaways…"}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ color: SUBTEXT }} className="text-[11px] tracking-wide">Key Takeaways</span>
      </div>
      <textarea
        ref={taRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="What you learned, where it applies… write as much as you like — the box grows as you type, and you can also drag the bottom-right corner to resize."
        style={{
          borderColor: PANEL_LINE,
          color: TEXT,
          backgroundColor: "rgba(0,0,0,0.15)",
          minHeight: "260px",
        }}
        className="w-full text-sm leading-relaxed rounded-md border px-3 py-2.5 outline-none resize-y"
        onFocus={(e) => (e.target.style.borderColor = AMBER)}
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={cancel}
          style={{ color: SUBTEXT, borderColor: PANEL_LINE }}
          className="text-xs font-semibold rounded-full border px-3.5 py-1.5"
        >
          Cancel
        </button>
        <PrimaryButton onClick={save}>Save</PrimaryButton>
      </div>
    </div>
  );
}

function TrainingsView({ trainings, setTrainings }) {
  const update = (id, patch) => setTrainings((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const remove = (id) => setTrainings((prev) => prev.filter((t) => t.id !== id));
  const add = () => setTrainings((prev) => [newTraining(), ...prev]);
  const toggleOpen = (id) => update(id, { open: !trainings.find((t) => t.id === id).open });

  return (
    <div>
      <SectionHeader
        title="Training Notes"
        subtitle="Capture what you learned"
        action={
          <PrimaryButton onClick={add}>
            <Plus size={15} /> New Note
          </PrimaryButton>
        }
      />
      {trainings.length === 0 && <EmptyState text='No training notes yet — click "New Note" to start.' />}
      <div className="flex flex-col gap-3">
        {trainings.map((t) => (
          <div key={t.id} style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg overflow-hidden">
            <div onClick={() => toggleOpen(t.id)} className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none">
              {t.open ? <ChevronDown size={16} color={SUBTEXT} /> : <ChevronRight size={16} color={SUBTEXT} />}
              <span style={{ color: TEXT }} className="font-semibold text-sm flex-1 truncate">
                {t.title || "Untitled training"}
              </span>
              {t.category && (
                <span style={{ color: AMBER, borderColor: AMBER }} className="text-[10px] font-bold border rounded px-1.5 py-0.5 shrink-0">
                  {t.category}
                </span>
              )}
              <span style={{ color: SUBTEXT }} className="text-xs shrink-0">{t.date}</span>
              <IconBtn danger onClick={(e) => { e.stopPropagation(); remove(t.id); }}>
                <Trash2 size={15} />
              </IconBtn>
            </div>
            {t.open && (
              <div className="px-4 pb-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Training Title" value={t.title} onChange={(v) => update(t.id, { title: v })} placeholder="e.g. New system walkthrough" />
                  <Field label="Date" type="date" value={t.date} onChange={(v) => update(t.id, { date: v })} />
                  <Field label="Category" value={t.category} onChange={(v) => update(t.id, { category: v })} placeholder="e.g. Internal / External" />
                </div>
                <TrainingNotesEditor
                  value={t.takeaways}
                  onSave={(next) => update(t.id, { takeaways: next })}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Docs & links collection
// ---------------------------------------------------------------------------
function normalizeUrl(u) {
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

function DocsView({ docs, setDocs }) {
  const [draftTitle, setDraftTitle] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [draftCategory, setDraftCategory] = useState("");

  const add = () => {
    const title = draftTitle.trim();
    const url = draftUrl.trim();
    if (!title || !url) return;
    setDocs((prev) => [
      { id: uid("dc"), title, url: normalizeUrl(url), category: draftCategory.trim(), notes: "" },
      ...prev,
    ]);
    setDraftTitle("");
    setDraftUrl("");
    setDraftCategory("");
  };
  const update = (id, patch) => setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  const remove = (id) => setDocs((prev) => prev.filter((d) => d.id !== id));

  return (
    <div>
      <SectionHeader title="Docs & Links" subtitle="Manuals, templates, process links you look up again and again" />

      <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg p-3 mb-4 flex flex-col sm:flex-row gap-2">
        <input
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="Title, e.g. Expense report process"
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="flex-1 text-sm rounded-md border px-2.5 py-1.5 outline-none"
        />
        <input
          value={draftUrl}
          onChange={(e) => setDraftUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="URL"
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="flex-1 text-sm rounded-md border px-2.5 py-1.5 outline-none"
        />
        <input
          value={draftCategory}
          onChange={(e) => setDraftCategory(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Category (optional)"
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="sm:w-36 text-sm rounded-md border px-2.5 py-1.5 outline-none"
        />
        <PrimaryButton onClick={add}>
          <Plus size={15} /> Save
        </PrimaryButton>
      </div>

      {docs.length === 0 && <EmptyState text="No links saved yet — add one you use often." />}
      <div className="flex flex-col gap-1.5">
        {docs.map((d) => (
          <div key={d.id} style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-md px-3 py-2.5 flex items-center gap-3">
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: TEXT }}
              className="flex-1 min-w-0 flex items-center gap-1.5 text-sm font-medium truncate hover:underline"
            >
              <ExternalLink size={13} color={AMBER} className="shrink-0" />
              <span className="truncate">{d.title}</span>
            </a>
            {d.category && (
              <span style={{ color: AMBER, borderColor: AMBER }} className="text-[10px] font-bold border rounded px-1.5 py-0.5 shrink-0">
                {d.category}
              </span>
            )}
            <IconBtn danger onClick={() => remove(d.id)}>
              <Trash2 size={15} />
            </IconBtn>
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
              <div className="px-4 pb-4 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Name" value={c.name} onChange={(v) => update(c.id, { name: v })} placeholder="e.g. Alex Chen" />
                  <Field label="Role / Org" value={c.role} onChange={(v) => update(c.id, { role: v })} placeholder="e.g. Vendor — Sales Manager" />
                  <Field label="Contact Info" value={c.contactInfo} onChange={(v) => update(c.id, { contactInfo: v })} placeholder="Phone / email / IM" />
                </div>
                <TextAreaField label="Notes" value={c.notes} onChange={(v) => update(c.id, { notes: v })} placeholder="What they own, things to watch for, past history…" rows={3} />
              </div>
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
          <div key={n.id} style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-md px-3 py-2 flex items-start gap-3">
            <span style={{ color: TEXT }} className="flex-1 text-sm whitespace-pre-wrap">{n.text}</span>
            <span style={{ color: SUBTEXT }} className="text-[11px] shrink-0">
              {new Date(n.createdAt).toLocaleDateString("zh-CN")}
            </span>
            <IconBtn danger onClick={() => remove(n.id)}>
              <Trash2 size={15} />
            </IconBtn>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Self-Review Tracker (journal entry & Blackline rec sign-off checklist)
// ---------------------------------------------------------------------------
const SR_JE_GROUPS = [
  {
    group: "Pre-Upload Check",
    step: "Step 1",
    items: [
      { id: "noCheckFigures", label: "No check figures in any tab" },
      { id: "datesCorrect", label: "All dates correct" },
      { id: "noExternalLinks", label: "No external links or queries" },
      { id: "screenshotsUpdated", label: "Screenshots updated" },
    ],
  },
  {
    group: "Entry Basics",
    step: "Step 2a–d",
    items: [
      { id: "jeIdVerified", label: "JE ID checked" },
      { id: "entryDateVerified", label: "Entry date checked" },
      { id: "descriptionAccurate", label: "Description accurate — dates & spelling" },
      { id: "reversingCorrect", label: "Reversing / Non-reversing status correct" },
    ],
  },
  {
    group: "Support File",
    step: "Step 2e",
    items: [{ id: "supportDownloaded", label: "Support file downloaded & is correct copy" }],
  },
  {
    group: "Journal Lines Export & Tie-Out",
    step: "Step 2f",
    items: [
      { id: "lineCountMatches", label: "Line count matches support" },
      { id: "busCorrect", label: "BUs are correct" },
      { id: "accountsSense", label: "Accounts make sense" },
      { id: "otherChartfields", label: "Other chartfields correct" },
      { id: "currenciesAgree", label: "Currencies agree & make sense" },
      { id: "signsCorrect", label: "Amount signs correct" },
      { id: "desiredImpact", label: "Amounts achieve desired impact" },
      { id: "blacklineBalance", label: "Agrees to Blackline balance (if applicable)" },
      { id: "lineDescriptions", label: "Line descriptions make sense" },
    ],
  },
];

const SR_BL_GROUPS = [
  {
    group: "Blackline Self-Review",
    step: "Step 3",
    items: [
      { id: "prepaidsReviewed", label: "Prepaids reviewed for items to close before certifying" },
      { id: "supportCorrectVersion", label: "Support file is correct version & has no check figures" },
      { id: "supportUploaded", label: "Support uploaded for auto-certified recs w/ balances" },
    ],
  },
];

function srWithCustom(baseGroups, customItems) {
  if (!customItems || customItems.length === 0) return baseGroups;
  return [...baseGroups, { group: "Custom Checkpoints", step: "Added by you", items: customItems }];
}

function srAllItemIds(groups) {
  return groups.flatMap((g) => g.items.map((i) => i.id));
}

function srStatusOf(checks, groups) {
  const ids = srAllItemIds(groups);
  const done = ids.filter((id) => checks[id]).length;
  if (done === 0) return "OPEN";
  if (done === ids.length) return "REVIEWED";
  return "IN REVIEW";
}

function srStampColor(status) {
  if (status === "REVIEWED") return DONE;
  if (status === "IN REVIEW") return AMBER;
  return SUBTEXT;
}

function newSrEntry(kind) {
  return {
    id: uid(kind),
    ref: "",
    preparer: "",
    reviewer: "",
    reviewDate: "",
    notes: "",
    checks: {},
    open: true,
  };
}

function SrStamp({ status }) {
  const color = srStampColor(status);
  const filled = status === "REVIEWED";
  return (
    <span
      style={{
        border: `2px solid ${color}`,
        color: filled ? "#344356" : color,
        backgroundColor: filled ? color : "transparent",
      }}
      className="text-[10px] font-bold rounded px-1.5 py-0.5 shrink-0 whitespace-nowrap"
    >
      {status}
    </span>
  );
}

function SrCustomizePanel({ items, onAdd, onRemove, onClose }) {
  const [draft, setDraft] = useState("");
  const submit = () => {
    const label = draft.trim();
    if (!label) return;
    onAdd(label);
    setDraft("");
  };
  return (
    <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <span style={{ color: TEXT }} className="text-sm font-bold">Customize Checkpoints</span>
        <button onClick={onClose} style={{ color: AMBER }} className="text-xs font-semibold underline">Done</button>
      </div>
      {items.length > 0 ? (
        <ul className="mb-3 flex flex-col gap-1.5">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-2">
              <span style={{ color: TEXT }} className="text-[13px]">{item.label}</span>
              <IconBtn danger onClick={() => onRemove(item.id)}>
                <Trash2 size={14} />
              </IconBtn>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: SUBTEXT }} className="text-xs italic mb-3">
          No custom checkpoints yet — add one below. It'll show up on every entry in this tab.
        </p>
      )}
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="e.g. Manager sign-off obtained"
          style={{ borderColor: PANEL_LINE, color: TEXT, backgroundColor: "rgba(0,0,0,0.15)" }}
          className="flex-1 text-sm rounded-md border px-2.5 py-1.5 outline-none"
        />
        <PrimaryButton onClick={submit}>
          <Plus size={14} /> Add
        </PrimaryButton>
      </div>
    </div>
  );
}

function SrEntryCard({ entry, groups, refLabel, refPlaceholder, onUpdate, onDelete, onToggleOpen }) {
  const status = srStatusOf(entry.checks, groups);
  const ids = srAllItemIds(groups);
  const done = ids.filter((id) => entry.checks[id]).length;

  const setField = (key, val) => onUpdate({ ...entry, [key]: val });
  const toggleCheck = (id) => onUpdate({ ...entry, checks: { ...entry.checks, [id]: !entry.checks[id] } });

  return (
    <div style={{ borderColor: PANEL_LINE, backgroundColor: PANEL }} className="border rounded-lg overflow-hidden mb-3 sr-entry-card">
      <div onClick={onToggleOpen} className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none no-print">
        {entry.open ? <ChevronDown size={16} color={SUBTEXT} /> : <ChevronRight size={16} color={SUBTEXT} />}
        <span style={{ color: TEXT, fontFamily: "monospace" }} className="text-sm font-bold min-w-[100px]">
          {entry.ref || refPlaceholder}
        </span>
        <span style={{ color: SUBTEXT }} className="text-xs flex-1 truncate">
          {entry.preparer && <span>Prep: {entry.preparer}</span>}
          {entry.reviewer && <span className="ml-3">Rev: {entry.reviewer}</span>}
        </span>
        <span style={{ color: SUBTEXT }} className="text-xs hidden sm:block">{done}/{ids.length}</span>
        <SrStamp status={status} />
        <IconBtn danger onClick={(e) => { e.stopPropagation(); onDelete(); }}>
          <Trash2 size={15} />
        </IconBtn>
      </div>

      {entry.open && (
        <div className="px-4 pb-4">
          <div style={{ borderTop: `1px dashed ${PANEL_LINE}` }} className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 mb-2">
            <Field label={refLabel} value={entry.ref} placeholder={refPlaceholder} onChange={(v) => setField("ref", v)} />
            <Field label="Preparer" value={entry.preparer} onChange={(v) => setField("preparer", v)} />
            <Field label="Reviewer" value={entry.reviewer} onChange={(v) => setField("reviewer", v)} />
            <Field label="Review Date" type="date" value={entry.reviewDate} onChange={(v) => setField("reviewDate", v)} />
          </div>

          {groups.map((g) => (
            <div key={g.group} className="mb-3">
              <div className="flex items-baseline gap-2 mb-1.5">
                <span style={{ color: TEXT }} className="text-xs font-bold uppercase tracking-wide">{g.group}</span>
                <span style={{ color: AMBER }} className="text-[10px] italic">{g.step}</span>
                <span style={{ borderTop: `1px dotted ${PANEL_LINE}` }} className="flex-1" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                {g.items.map((item) => {
                  const checked = !!entry.checks[item.id];
                  return (
                    <label key={item.id} className="flex items-center gap-2 py-0.5 cursor-pointer">
                      <span
                        onClick={() => toggleCheck(item.id)}
                        style={{ borderColor: AMBER, backgroundColor: checked ? AMBER : "transparent" }}
                        className="w-4 h-4 shrink-0 border rounded-sm flex items-center justify-center"
                      >
                        {checked && <CheckCircle2 size={12} color="#344356" strokeWidth={3} />}
                      </span>
                      <span style={{ color: TEXT }} className="text-[13px] leading-tight">{item.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          <TextAreaField label="Notes" value={entry.notes} onChange={(v) => setField("notes", v)} placeholder="" rows={2} />
        </div>
      )}
    </div>
  );
}

function SelfReviewView({ srJeEntries, setSrJeEntries, srBlEntries, setSrBlEntries, srJeCustom, setSrJeCustom, srBlCustom, setSrBlCustom }) {
  const [subTab, setSubTab] = useState("je");
  const [showCustomize, setShowCustomize] = useState(false);

  const entries = subTab === "je" ? srJeEntries : srBlEntries;
  const setEntries = subTab === "je" ? setSrJeEntries : setSrBlEntries;
  const customItems = subTab === "je" ? srJeCustom : srBlCustom;
  const setCustomItems = subTab === "je" ? setSrJeCustom : setSrBlCustom;
  const groups = srWithCustom(subTab === "je" ? SR_JE_GROUPS : SR_BL_GROUPS, customItems);
  const refLabel = subTab === "je" ? "JE ID" : "Rec Name";
  const refPlaceholder = subTab === "je" ? "JE-00000" : "Rec name";

  const summary = useMemo(() => {
    const statuses = entries.map((e) => srStatusOf(e.checks, groups));
    return {
      reviewed: statuses.filter((s) => s === "REVIEWED").length,
      inReview: statuses.filter((s) => s === "IN REVIEW").length,
      open: statuses.filter((s) => s === "OPEN").length,
    };
  }, [entries, groups]);

  const addEntry = () => setEntries((prev) => [newSrEntry(subTab), ...prev]);
  const updateEntry = (id, next) => setEntries((prev) => prev.map((e) => (e.id === id ? next : e)));
  const deleteEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));
  const toggleOpen = (id) => setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, open: !e.open } : e)));

  const addCheckpoint = (label) => setCustomItems((prev) => [...prev, { id: uid("chk"), label }]);
  const removeCheckpoint = (id) => setCustomItems((prev) => prev.filter((i) => i.id !== id));

  const exportPDF = () => {
    setEntries((prev) => prev.map((e) => ({ ...e, open: true })));
    window.setTimeout(() => window.print(), 60);
  };

  return (
    <div>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      <SectionHeader
        title="Self-Review Tracker"
        subtitle="Journal entry & Blackline rec sign-off, step by step"
        action={
          <div className="flex gap-2">
            <span style={{ color: SUBTEXT }} className="text-xs self-center hidden sm:block">
              <b style={{ color: DONE }}>{summary.reviewed}</b> reviewed ·{" "}
              <b style={{ color: AMBER }}>{summary.inReview}</b> in review ·{" "}
              <b style={{ color: SUBTEXT }}>{summary.open}</b> open
            </span>
          </div>
        }
      />

      <div className="flex gap-2 mb-4 no-print">
        <button
          onClick={() => setSubTab("je")}
          style={{
            backgroundColor: subTab === "je" ? AMBER : "transparent",
            color: subTab === "je" ? "#344356" : AMBER,
            borderColor: AMBER,
          }}
          className="text-sm font-semibold rounded-full border px-4 py-1.5"
        >
          Journal Entries
        </button>
        <button
          onClick={() => setSubTab("bl")}
          style={{
            backgroundColor: subTab === "bl" ? AMBER : "transparent",
            color: subTab === "bl" ? "#344356" : AMBER,
            borderColor: AMBER,
          }}
          className="text-sm font-semibold rounded-full border px-4 py-1.5"
        >
          Blackline Recs
        </button>
      </div>

      <div className="flex gap-2 mb-4 no-print">
        <PrimaryButton onClick={addEntry}>
          <Plus size={15} /> New {subTab === "je" ? "Entry" : "Rec"}
        </PrimaryButton>
        <button
          onClick={exportPDF}
          style={{ borderColor: PANEL_LINE, color: TEXT }}
          className="flex items-center gap-1.5 text-sm font-semibold border rounded-full px-4 py-1.5"
        >
          <Download size={15} /> Export as PDF
        </button>
        <button
          onClick={() => setShowCustomize((v) => !v)}
          style={{ borderColor: PANEL_LINE, color: TEXT }}
          className="flex items-center gap-1.5 text-sm font-semibold border rounded-full px-4 py-1.5"
        >
          Customize Checkpoints
        </button>
      </div>

      {showCustomize && (
        <SrCustomizePanel items={customItems} onAdd={addCheckpoint} onRemove={removeCheckpoint} onClose={() => setShowCustomize(false)} />
      )}

      {entries.length === 0 && (
        <EmptyState text={`No ${subTab === "je" ? "entries" : "recs"} logged yet. Add one to start the review.`} />
      )}

      {entries.map((entry) => (
        <SrEntryCard
          key={entry.id}
          entry={entry}
          groups={groups}
          refLabel={refLabel}
          refPlaceholder={refPlaceholder}
          onUpdate={(next) => updateEntry(entry.id, next)}
          onDelete={() => deleteEntry(entry.id)}
          onToggleOpen={() => toggleOpen(entry.id)}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function DashboardView({ meetings, todos, tasks, comms, trainings, docs, contacts, notes, goTo }) {
  const openTodos = todos.filter((t) => !t.done);
  const todayTodos = openTodos.filter((t) => t.due === todayStr());
  const recentMeetings = meetings.slice(0, 3);
  const recentTrainings = trainings.slice(0, 3);
  const stuckTasks = tasks.filter((t) => t.status === "stuck");
  const waitingComms = comms.filter((c) => c.status !== "done");

  const stats = [
    { key: "meetings", label: "Meetings", value: meetings.length, icon: Users },
    { key: "todos", label: "To-Do", value: openTodos.length, icon: CheckSquare },
    { key: "tasks", label: "Tasks", value: tasks.length, icon: Layers },
    { key: "comms", label: "Follow-ups", value: waitingComms.length, icon: MessageCircle },
    { key: "trainings", label: "Training Notes", value: trainings.length, icon: GraduationCap },
    { key: "docs", label: "Docs & Links", value: docs.length, icon: LinkIcon },
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
          <div style={{ color: TEXT }} className="text-sm font-bold mb-2">Recent Training</div>
          {recentTrainings.length === 0 ? (
            <EmptyState text="No training notes yet." />
          ) : (
            <div className="flex flex-col gap-1.5">
              {recentTrainings.map((t) => (
                <div key={t.id} className="flex items-center justify-between text-sm">
                  <span style={{ color: TEXT }} className="truncate">{t.title || "Untitled training"}</span>
                  <span style={{ color: SUBTEXT }} className="text-xs shrink-0 ml-2">{t.date}</span>
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
  const [loaded, setLoaded] = useState(false);
  const [meetings, setMeetings] = useState([]);
  const [todos, setTodos] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [comms, setComms] = useState([]);
  const [trainings, setTrainings] = useState([]);
  const [docs, setDocs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [notes, setNotes] = useState([]);
  const [srJeEntries, setSrJeEntries] = useState([]);
  const [srBlEntries, setSrBlEntries] = useState([]);
  const [srJeCustom, setSrJeCustom] = useState([]);
  const [srBlCustom, setSrBlCustom] = useState([]);

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
        loadKey(STORE_KEYS.trainings, setTrainings),
        loadKey(STORE_KEYS.docs, setDocs),
        loadKey(STORE_KEYS.contacts, setContacts),
        loadKey(STORE_KEYS.notes, setNotes),
        loadKey(STORE_KEYS.srJeEntries, setSrJeEntries),
        loadKey(STORE_KEYS.srBlEntries, setSrBlEntries),
        loadKey(STORE_KEYS.srJeCustom, setSrJeCustom),
        loadKey(STORE_KEYS.srBlCustom, setSrBlCustom),
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
    storage.set(STORE_KEYS.trainings, JSON.stringify(trainings)).catch(() => {});
  }, [trainings, loaded]);
  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.docs, JSON.stringify(docs)).catch(() => {});
  }, [docs, loaded]);
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
    storage.set(STORE_KEYS.srJeEntries, JSON.stringify(srJeEntries)).catch(() => {});
  }, [srJeEntries, loaded]);
  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.srBlEntries, JSON.stringify(srBlEntries)).catch(() => {});
  }, [srBlEntries, loaded]);
  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.srJeCustom, JSON.stringify(srJeCustom)).catch(() => {});
  }, [srJeCustom, loaded]);
  useEffect(() => {
    if (!loaded) return;
    storage.set(STORE_KEYS.srBlCustom, JSON.stringify(srBlCustom)).catch(() => {});
  }, [srBlCustom, loaded]);

  const openTodoCount = useMemo(() => todos.filter((t) => !t.done).length, [todos]);

  return (
    <div style={{ backgroundColor: BG, fontFamily: FONT, minHeight: "100%" }} className="w-full rounded-lg overflow-hidden flex flex-col sm:flex-row">
      {/* Sidebar */}
      <div style={{ backgroundColor: "#28323F", borderColor: PANEL_LINE }} className="sm:w-52 shrink-0 border-b sm:border-b-0 sm:border-r flex sm:flex-col">
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
                  <span style={{ backgroundColor: AMBER, color: "#344356" }} className="text-[10px] font-bold rounded-full px-1.5 py-0.5 ml-auto">
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
            trainings={trainings}
            docs={docs}
            contacts={contacts}
            notes={notes}
            goTo={setTab}
          />
        )}
        {tab === "meetings" && <MeetingsView meetings={meetings} setMeetings={setMeetings} />}
        {tab === "todos" && <TodosView todos={todos} setTodos={setTodos} />}
        {tab === "tasks" && <TasksView tasks={tasks} setTasks={setTasks} />}
        {tab === "comms" && <CommsView comms={comms} setComms={setComms} />}
        {tab === "trainings" && <TrainingsView trainings={trainings} setTrainings={setTrainings} />}
        {tab === "docs" && <DocsView docs={docs} setDocs={setDocs} />}
        {tab === "contacts" && <ContactsView contacts={contacts} setContacts={setContacts} />}
        {tab === "notes" && <NotesView notes={notes} setNotes={setNotes} />}
        {tab === "selfreview" && (
          <SelfReviewView
            srJeEntries={srJeEntries}
            setSrJeEntries={setSrJeEntries}
            srBlEntries={srBlEntries}
            setSrBlEntries={setSrBlEntries}
            srJeCustom={srJeCustom}
            setSrJeCustom={setSrJeCustom}
            srBlCustom={srBlCustom}
            setSrBlCustom={setSrBlCustom}
          />
        )}
      </div>
    </div>
  );
}
