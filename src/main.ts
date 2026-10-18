import "./style.css";
import { Unauthorized, listMachines, loadMachine, saveMachine, setKey } from "./api";
import { Editor } from "./editor";
import { type Machine, emptyMachine, exampleMachine, parseMachine, removeState, setEvents, toggleFinal } from "./machine";

// Visitors can draw and export, but nothing is kept: a reload starts again from the example.
// The owner unlocks the database with a key; only then the draft, Salva and Apri… exist.

const KEY = "state-machine-maker";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the session still works, it just is not remembered
  }
}

let ownerKey = read(`${KEY}.key`);
setKey(ownerKey);

function load(): Machine {
  const saved = ownerKey ? read(KEY) : null;
  try {
    if (saved) return parseMachine(saved);
  } catch {
    // Unreadable draft: start from the example
  }
  return exampleMachine();
}

let machine = load();
// Server id of the machine on screen; null until it is saved the first time
let currentId: string | null = ownerKey ? read(`${KEY}.id`) : null;
let dirty = false;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const nameInput = $<HTMLInputElement>("name");
const json = $<HTMLPreElement>("json");
const buttons = {
  initial: $<HTMLButtonElement>("set-initial"),
  final: $<HTMLButtonElement>("toggle-final"),
  remove: $<HTMLButtonElement>("remove"),
};

const editor = new Editor(
  document.querySelector("svg")!,
  $<HTMLInputElement>("inline"),
  () => machine,
  changed,
  updateButtons,
);

function changed(): void {
  editor.render();
  const text = JSON.stringify(machine, null, 2);
  json.textContent = text;
  dirty = true;
  if (ownerKey) {
    write(KEY, text);
    showStatus(currentId ? "Modifiche non salvate" : "Mai salvata");
  }
  updateButtons();
}

const statusLine = $<HTMLSpanElement>("status");
function showStatus(text: string, error = false): void {
  statusLine.textContent = text;
  statusLine.classList.toggle("error", error);
}

function updateButtons(): void {
  const s = editor.selection;
  const state = s?.kind === "state" ? s.name : null;
  buttons.initial.disabled = !state || machine.initial === state;
  buttons.final.disabled = !state;
  buttons.final.textContent = state && machine.final.includes(state) ? "Non finale" : "Finale";
  buttons.remove.disabled = !s;
}

function replace(next: Machine, id: string | null): void {
  machine = next;
  currentId = id;
  if (ownerKey) write(`${KEY}.id`, id);
  editor.selection = null;
  nameInput.value = machine.name;
  changed();
}

// ---- owner ----

const openSelect = $<HTMLSelectElement>("open");
const loginButton = $<HTMLButtonElement>("login");

function showOwnerTools(): void {
  document.body.classList.toggle("owner", ownerKey !== null);
  loginButton.textContent = ownerKey ? "Esci" : "Accedi";
  if (!ownerKey) showStatus("Non viene salvata: usa Esporta");
}

function logout(): void {
  ownerKey = null;
  setKey(null);
  write(`${KEY}.key`, null);
  write(`${KEY}.id`, null);
  write(KEY, null);
  currentId = null;
  showOwnerTools();
}

async function refreshList(): Promise<void> {
  try {
    const machines = await listMachines();
    openSelect.replaceChildren(
      new Option(machines.length ? `Apri… (${machines.length})` : "Nessuna salvata", ""),
      ...machines.map((m) => new Option(m.name || "senza nome", m.id)),
    );
    openSelect.value = "";
  } catch (e) {
    if (e instanceof Unauthorized) {
      logout();
      return;
    }
    openSelect.replaceChildren(new Option("Server non raggiungibile", ""));
  }
}

loginButton.onclick = async () => {
  if (ownerKey) {
    logout();
    return;
  }
  const key = prompt("Chiave del database")?.trim();
  if (!key) return;
  setKey(key);
  try {
    await listMachines();
  } catch (e) {
    setKey(null);
    alert(e instanceof Error ? e.message : "Accesso non riuscito");
    return;
  }
  ownerKey = key;
  write(`${KEY}.key`, key);
  write(KEY, JSON.stringify(machine));
  showOwnerTools();
  showStatus(currentId ? "Modifiche non salvate" : "Mai salvata");
  await refreshList();
};

$("save").onclick = async () => {
  showStatus("Salvataggio…");
  try {
    const id = await saveMachine(currentId, machine);
    currentId = id;
    write(`${KEY}.id`, id);
    dirty = false;
    showStatus("Salvata");
    await refreshList();
  } catch (e) {
    if (e instanceof Unauthorized) logout();
    showStatus(e instanceof Error ? e.message : "Salvataggio non riuscito", true);
  }
};

openSelect.onchange = async () => {
  const id = openSelect.value;
  openSelect.value = "";
  if (!id) return;
  if (dirty && !confirm("Ci sono modifiche non salvate. Aprire comunque?")) return;
  try {
    replace(await loadMachine(id), id);
    dirty = false;
    showStatus("Salvata");
  } catch (e) {
    if (e instanceof Unauthorized) logout();
    showStatus(e instanceof Error ? e.message : "Apertura non riuscita", true);
  }
};

// ---- actions on the selection ----

function setInitial(): void {
  const s = editor.selection;
  if (s?.kind !== "state") return;
  machine.initial = s.name;
  changed();
}

function flipFinal(): void {
  const s = editor.selection;
  if (s?.kind !== "state") return;
  toggleFinal(machine, s.name);
  changed();
}

function removeSelected(): void {
  const s = editor.selection;
  if (!s) return;
  if (s.kind === "state") removeState(machine, s.name);
  else setEvents(machine, s.from, s.to, []);
  editor.selection = null;
  changed();
}

buttons.initial.onclick = setInitial;
buttons.final.onclick = flipFinal;
buttons.remove.onclick = removeSelected;

$("add").onclick = () => {
  const svg = document.querySelector("svg")!.getBoundingClientRect();
  const n = Object.keys(machine.states).length;
  editor.newState({ x: 120 + (n % 6) * 110, y: Math.min(120 + Math.floor(n / 6) * 110, svg.height - 60) });
};

nameInput.oninput = () => {
  machine.name = nameInput.value;
  changed();
};

$("new").onclick = () => {
  if (dirty && !confirm("Ci sono modifiche non salvate. Iniziare una nuova macchina?")) return;
  replace(emptyMachine(), null);
};

$("export").onclick = () => {
  const blob = new Blob([JSON.stringify(machine, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${machine.name || "macchina"}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
};

const file = $<HTMLInputElement>("file");
$("import").onclick = () => file.click();
file.onchange = async () => {
  const f = file.files?.[0];
  file.value = "";
  if (!f) return;
  try {
    replace(parseMachine(await f.text()), null);
  } catch (e) {
    alert(e instanceof Error ? e.message : "File non valido");
  }
};

document.addEventListener("keydown", (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.key === "Delete" || e.key === "Backspace") removeSelected();
  else if (e.key === "i") setInitial();
  else if (e.key === "f") flipFinal();
  else if (e.key === "Escape") editor.select(null);
});

replace(machine, currentId);
dirty = false;
showOwnerTools();
if (ownerKey) {
  showStatus(currentId ? "" : "Mai salvata");
  refreshList();
}
