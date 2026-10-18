// Draws a Machine as one SVG and turns pointer gestures into model edits.
// The SVG is rebuilt from the model after every edit: machines are small,
// so this stays fast and the screen can never drift from the data.

import {
  type Machine,
  type Point,
  addState,
  checkStateName,
  eventsBetween,
  nextStateName,
  renameState,
  setEvents,
} from "./machine";

const NS = "http://www.w3.org/2000/svg";
const R = 28; // state radius
const SNAP = 10;

export type Selection = { kind: "state"; name: string } | { kind: "edge"; from: string; to: string } | null;

type Drag =
  | { kind: "move"; name: string; dx: number; dy: number; moved: boolean }
  | { kind: "link"; from: string; line: SVGLineElement };

const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number> = {}) => {
  const node = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  return node;
};

const snap = (n: number) => Math.round(n / SNAP) * SNAP;

/** Circles grow with long names so the label stays inside. */
const radius = (name: string) => Math.max(R, Math.round(name.length * 2.8 + 14));

export class Editor {
  selection: Selection = null;
  private drag: Drag | null = null;
  private layer = el("g");

  constructor(
    private svg: SVGSVGElement,
    private input: HTMLInputElement,
    private machine: () => Machine,
    private changed: () => void, // the model changed: save and redraw
    private selected: () => void, // only the selection changed
  ) {
    svg.append(this.defs(), this.layer);
    svg.addEventListener("pointerdown", (e) => this.onDown(e));
    svg.addEventListener("pointermove", (e) => this.onMove(e));
    svg.addEventListener("pointerup", (e) => this.onUp(e));
    svg.addEventListener("dblclick", (e) => this.onDoubleClick(e));
  }

  render(): void {
    const m = this.machine();
    this.layer.replaceChildren();
    const pairs = new Set(m.transitions.map((t) => `${t.from}\n${t.to}`));
    for (const pair of pairs) {
      const [from, to] = pair.split("\n");
      this.layer.append(this.edge(m, from, to, pairs.has(`${to}\n${from}`)));
    }
    for (const [name, p] of Object.entries(m.states)) this.layer.append(this.state(m, name, p));
    this.markSelection();
  }

  /** Updates the selected look without rebuilding (keeps double clicks working). */
  markSelection(): void {
    const s = this.selection;
    for (const g of this.layer.querySelectorAll<SVGGElement>("[data-state],[data-from]")) {
      const on =
        s?.kind === "state"
          ? g.dataset.state === s.name
          : s?.kind === "edge" && g.dataset.from === s.from && g.dataset.to === s.to;
      g.classList.toggle("selected", on);
    }
  }

  select(s: Selection): void {
    this.selection = s;
    this.markSelection();
    this.selected();
  }

  /** Adds a state at `at` and asks for its name straight away. */
  newState(at: Point): void {
    const m = this.machine();
    const name = nextStateName(m);
    addState(m, name, { x: snap(at.x), y: snap(at.y) });
    this.changed();
    this.select({ kind: "state", name });
    this.renameStateAt(name);
  }

  // ---- drawing ----

  private defs(): SVGDefsElement {
    const defs = el("defs");
    const marker = el("marker", {
      id: "arrow",
      viewBox: "0 0 10 10",
      refX: 9,
      refY: 5,
      markerWidth: 7,
      markerHeight: 7,
      orient: "auto-start-reverse",
    });
    marker.append(el("path", { d: "M0,0 L10,5 L0,10 z", class: "arrowhead" }));
    defs.append(marker);
    return defs;
  }

  private state(m: Machine, name: string, p: Point): SVGGElement {
    const r = radius(name);
    const g = el("g", { class: "state", transform: `translate(${p.x} ${p.y})` });
    g.dataset.state = name;
    if (m.initial === name) {
      g.append(el("line", { class: "initial", x1: -r - 34, y1: 0, x2: -r - 2, y2: 0, "marker-end": "url(#arrow)" }));
    }
    g.append(el("circle", { class: "body", r }));
    if (m.final.includes(name)) g.append(el("circle", { class: "ring", r: r - 5 }));
    const label = el("text", { class: "name", "dominant-baseline": "central" });
    label.textContent = name;
    g.append(label);
    // Drag this dot onto another state to create a transition
    const handle = el("circle", { class: "handle", cx: r, cy: 0, r: 7 });
    handle.dataset.handle = name;
    g.append(handle);
    return g;
  }

  private edge(m: Machine, from: string, to: string, hasReverse: boolean): SVGGElement {
    const a = m.states[from];
    const b = m.states[to];
    let d: string;
    let mid: Point;
    if (from === to) {
      // Self loop above the state
      const r = radius(from);
      const sx = a.x - r * Math.sin(0.45), sy = a.y - r * Math.cos(0.45);
      const ex = a.x + r * Math.sin(0.45), ey = sy;
      d = `M${sx},${sy} C${a.x - 45},${a.y - r - 60} ${a.x + 45},${a.y - r - 60} ${ex},${ey}`;
      mid = { x: a.x, y: a.y - r - 52 };
    } else {
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      // Two states linked both ways: bend each edge to its own side
      const bend = hasReverse ? 28 : 0;
      const c = { x: (a.x + b.x) / 2 - (dy / len) * bend, y: (a.y + b.y) / 2 + (dx / len) * bend };
      const toward = (p: Point, q: Point, r: number) => {
        const l = Math.hypot(q.x - p.x, q.y - p.y) || 1;
        return { x: p.x + ((q.x - p.x) / l) * r, y: p.y + ((q.y - p.y) / l) * r };
      };
      const s = toward(a, c, radius(from));
      const e = toward(b, c, radius(to) + 1);
      d = `M${s.x},${s.y} Q${c.x},${c.y} ${e.x},${e.y}`;
      mid = { x: (s.x + 2 * c.x + e.x) / 4, y: (s.y + 2 * c.y + e.y) / 4 - 8 };
    }
    const g = el("g", { class: "edge" });
    g.dataset.from = from;
    g.dataset.to = to;
    g.append(el("path", { class: "hit", d }), el("path", { class: "line", d, "marker-end": "url(#arrow)" }));
    const label = el("text", { class: "event", x: mid.x, y: mid.y, "text-anchor": "middle" });
    label.textContent = eventsBetween(m, from, to).join(", ");
    g.append(label);
    return g;
  }

  // ---- gestures ----

  private point(e: MouseEvent): Point {
    const r = this.svg.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    const target = e.target as Element;
    const handle = target.closest<SVGElement>("[data-handle]");
    const state = target.closest<SVGGElement>("[data-state]");
    const edge = target.closest<SVGGElement>("[data-from]");
    const p = this.point(e);
    if (handle) {
      const line = el("line", { class: "draft", x1: p.x, y1: p.y, x2: p.x, y2: p.y });
      this.layer.append(line);
      this.drag = { kind: "link", from: handle.dataset.handle!, line };
    } else if (state) {
      const name = state.dataset.state!;
      const at = this.machine().states[name];
      this.drag = { kind: "move", name, dx: p.x - at.x, dy: p.y - at.y, moved: false };
      this.select({ kind: "state", name });
    } else if (edge) {
      this.select({ kind: "edge", from: edge.dataset.from!, to: edge.dataset.to! });
      return;
    } else {
      this.select(null);
      return;
    }
    this.svg.setPointerCapture(e.pointerId);
  }

  private onMove(e: PointerEvent): void {
    const p = this.point(e);
    if (this.drag?.kind === "move") {
      const at = { x: snap(p.x - this.drag.dx), y: snap(p.y - this.drag.dy) };
      const cur = this.machine().states[this.drag.name];
      if (at.x === cur.x && at.y === cur.y) return;
      this.machine().states[this.drag.name] = at;
      this.drag.moved = true;
      this.render();
    } else if (this.drag?.kind === "link") {
      this.drag.line.setAttribute("x2", String(p.x));
      this.drag.line.setAttribute("y2", String(p.y));
    }
  }

  private onUp(e: PointerEvent): void {
    const drag = this.drag;
    this.drag = null;
    if (drag?.kind === "move" && drag.moved) this.changed();
    if (drag?.kind !== "link") return;
    drag.line.remove();
    const target = document.elementFromPoint(e.clientX, e.clientY)?.closest<SVGGElement>("[data-state]");
    if (!target) return;
    const to = target.dataset.state!;
    const m = this.machine();
    const isNew = eventsBetween(m, drag.from, to).length === 0;
    if (isNew) {
      setEvents(m, drag.from, to, ["evento"]);
      this.changed();
    }
    this.select({ kind: "edge", from: drag.from, to });
    this.editEdge(drag.from, to, isNew);
  }

  private onDoubleClick(e: MouseEvent): void {
    // Pointer capture retargets clicks to the <svg>, so look up what is really under the pointer
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return;
    const state = target.closest<SVGGElement>("[data-state]");
    const edge = target.closest<SVGGElement>("[data-from]");
    if (state) this.renameStateAt(state.dataset.state!);
    else if (edge) this.editEdge(edge.dataset.from!, edge.dataset.to!, false);
    else this.newState(this.point(e));
  }

  // ---- inline text editing ----

  private renameStateAt(name: string): void {
    const at = this.machine().states[name];
    this.ask(name, at, (value) => {
      const m = this.machine();
      const error = checkStateName(m, value, name);
      if (error) return error;
      renameState(m, name, value);
      this.selection = { kind: "state", name: value };
      this.changed();
      return null;
    });
  }

  /** Edits the events on one edge, comma separated. Clearing them removes the edge. */
  private editEdge(from: string, to: string, isNew: boolean): void {
    const m = this.machine();
    const label = this.layer.querySelector(`[data-from="${CSS.escape(from)}"][data-to="${CSS.escape(to)}"] .event`);
    const at = label ? { x: Number(label.getAttribute("x")), y: Number(label.getAttribute("y")) - 4 } : m.states[from];
    this.ask(
      eventsBetween(m, from, to).join(", "),
      at,
      (value) => {
        const events = value.split(",").map((s) => s.trim()).filter(Boolean);
        setEvents(this.machine(), from, to, events);
        if (events.length === 0) this.selection = null;
        this.changed();
        return null;
      },
      () => {
        if (!isNew) return;
        setEvents(this.machine(), from, to, []);
        this.selection = null;
        this.changed();
      },
    );
  }

  /**
   * Shows the text box over the canvas. `commit` returns an error message to
   * keep the box open, or null to close it. Escape calls `cancel`.
   */
  private ask(value: string, at: Point, commit: (v: string) => string | null, cancel?: () => void): void {
    const input = this.input;
    input.value = value;
    input.style.left = `${at.x}px`;
    input.style.top = `${at.y}px`;
    input.hidden = false;
    input.setCustomValidity("");
    input.focus();
    input.select();
    const close = () => {
      input.removeEventListener("keydown", onKey);
      input.removeEventListener("blur", onBlur);
      input.hidden = true;
    };
    const submit = () => {
      const error = commit(input.value.trim());
      if (error) {
        input.setCustomValidity(error);
        input.reportValidity();
        return false;
      }
      close();
      return true;
    };
    const onKey = (e: KeyboardEvent) => {
      e.stopPropagation();
      if (e.key === "Enter") submit();
      if (e.key === "Escape") {
        close();
        cancel?.();
      }
    };
    // Clicking elsewhere saves when valid, otherwise drops the edit
    const onBlur = () => {
      if (!submit()) {
        close();
        cancel?.();
      }
    };
    input.addEventListener("keydown", onKey);
    input.addEventListener("blur", onBlur);
  }
}
