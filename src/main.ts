import "./style.css";
import { Editor } from "./editor";
import { type Machine, emptyMachine, exampleMachine, parseMachine, removeState, setEvents, toggleFinal } from "./machine";

const KEY = "state-machine-maker";

function load(): Machine {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return parseMachine(saved);
  } catch {
    // Unreadable or blocked storage: start from the example
  }
  return exampleMachine();
}

let machine = load();

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
  try {
    localStorage.setItem(KEY, text);
  } catch {
    // Not saved (private mode): the export button still works
  }
  updateButtons();
}

function updateButtons(): void {
  const s = editor.selection;
  const state = s?.kind === "state" ? s.name : null;
  buttons.initial.disabled = !state || machine.initial === state;
  buttons.final.disabled = !state;
  buttons.final.textContent = state && machine.final.includes(state) ? "Non finale" : "Finale";
  buttons.remove.disabled = !s;
}

function replace(next: Machine): void {
  machine = next;
  editor.selection = null;
  nameInput.value = machine.name;
  changed();
}

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

$("clear").onclick = () => {
  if (confirm("Cancellare questa macchina e ripartire da zero?")) replace(emptyMachine());
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
    replace(parseMachine(await f.text()));
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

replace(machine);
