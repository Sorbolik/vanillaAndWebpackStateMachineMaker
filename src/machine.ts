// The whole data model. A machine is plain JSON: what you see in the
// JSON panel is exactly what gets saved, exported and (later) sent to the server.

export type Point = { x: number; y: number };

export type Transition = {
  from: string;
  on: string; // the event that fires the transition
  to: string;
};

export type Machine = {
  v: 1;
  name: string;
  initial: string | null;
  final: string[];
  states: Record<string, Point>; // keyed by state name: names are unique
  transitions: Transition[];
};

export const emptyMachine = (name = "nuova macchina"): Machine => ({
  v: 1,
  name,
  initial: null,
  final: [],
  states: {},
  transitions: [],
});

export const exampleMachine = (): Machine => ({
  v: 1,
  name: "semaforo",
  initial: "rosso",
  final: ["spento"],
  states: {
    rosso: { x: 160, y: 160 },
    verde: { x: 400, y: 160 },
    giallo: { x: 280, y: 330 },
    spento: { x: 580, y: 330 },
  },
  transitions: [
    { from: "rosso", on: "timer", to: "verde" },
    { from: "verde", on: "timer", to: "giallo" },
    { from: "giallo", on: "timer", to: "rosso" },
    { from: "giallo", on: "guasto", to: "spento" },
  ],
});

/** Returns an error message, or null when `name` can be used for a state. */
export function checkStateName(m: Machine, name: string, current?: string): string | null {
  if (!name) return "Il nome non può essere vuoto";
  if (name !== current && name in m.states) return `Esiste già uno stato "${name}"`;
  return null;
}

export function nextStateName(m: Machine): string {
  let i = Object.keys(m.states).length + 1;
  while (`s${i}` in m.states) i++;
  return `s${i}`;
}

export function addState(m: Machine, name: string, at: Point): void {
  m.states[name] = at;
  if (m.initial === null) m.initial = name;
}

export function renameState(m: Machine, from: string, to: string): void {
  if (from === to) return;
  // Rebuild the object so the state keeps its position in the key order
  m.states = Object.fromEntries(
    Object.entries(m.states).map(([k, p]) => [k === from ? to : k, p]),
  );
  if (m.initial === from) m.initial = to;
  m.final = m.final.map((s) => (s === from ? to : s));
  for (const t of m.transitions) {
    if (t.from === from) t.from = to;
    if (t.to === from) t.to = to;
  }
}

export function removeState(m: Machine, name: string): void {
  delete m.states[name];
  if (m.initial === name) m.initial = Object.keys(m.states)[0] ?? null;
  m.final = m.final.filter((s) => s !== name);
  m.transitions = m.transitions.filter((t) => t.from !== name && t.to !== name);
}

export function toggleFinal(m: Machine, name: string): void {
  m.final = m.final.includes(name) ? m.final.filter((s) => s !== name) : [...m.final, name];
}

/** Events on the edge from → to, in order. */
export function eventsBetween(m: Machine, from: string, to: string): string[] {
  return m.transitions.filter((t) => t.from === from && t.to === to).map((t) => t.on);
}

/** Replaces every event on the edge from → to. An empty list removes the edge. */
export function setEvents(m: Machine, from: string, to: string, events: string[]): void {
  const at = m.transitions.findIndex((t) => t.from === from && t.to === to);
  const rest = m.transitions.filter((t) => !(t.from === from && t.to === to));
  const edge = [...new Set(events)].map((on) => ({ from, on, to }));
  rest.splice(at === -1 ? rest.length : at, 0, ...edge);
  m.transitions = rest;
}

/** Parses untrusted JSON (an imported file, localStorage) into a Machine. */
export function parseMachine(json: string): Machine {
  const d = JSON.parse(json);
  const fail = (why: string): never => {
    throw new Error(`File non valido: ${why}`);
  };
  if (d?.v !== 1) fail("versione mancante o sconosciuta");
  if (typeof d.name !== "string") fail("manca il nome");
  if (typeof d.states !== "object" || d.states === null) fail("mancano gli stati");
  for (const [k, p] of Object.entries<any>(d.states)) {
    if (typeof p?.x !== "number" || typeof p?.y !== "number") fail(`posizione di "${k}"`);
  }
  const known = (s: unknown) => typeof s === "string" && s in d.states;
  if (d.initial !== null && !known(d.initial)) fail("stato iniziale sconosciuto");
  if (!Array.isArray(d.final) || !d.final.every(known)) fail("stati finali");
  if (!Array.isArray(d.transitions)) fail("mancano le transizioni");
  for (const t of d.transitions) {
    if (!known(t?.from) || !known(t?.to) || typeof t.on !== "string" || !t.on) {
      fail("una transizione punta a uno stato che non esiste");
    }
  }
  return {
    v: 1,
    name: d.name,
    initial: d.initial,
    final: d.final,
    states: d.states,
    transitions: d.transitions.map(({ from, on, to }: Transition) => ({ from, on, to })),
  };
}
