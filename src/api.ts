// Client for the state machine API (Sorbolik/stateMachineMakerSERVER).
// The database belongs to the owner: every call carries the owner's key.
// Without a key the same functions work on a store in memory, lost on reload.

import { type Machine, parseMachine } from "./machine";

// Same address as the editor in production; set VITE_API_URL to call another server (e.g. local dev)
const BASE = import.meta.env.VITE_API_URL ?? "/api";

export type Summary = { id: string; name: string; updated: string };

let key: string | null = null;
export const setKey = (k: string | null) => {
  key = k;
};

export class Unauthorized extends Error {}

async function call(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(BASE + path, {
    ...init,
    headers: { "content-type": "application/json", authorization: `Bearer ${key ?? ""}` },
  });
  if (res.status === 401) throw new Unauthorized("Chiave non valida");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Errore del server (${res.status})`);
  }
  return res;
}

// Visitors' machines: same shape as the server's table, kept only while the page is open
const memory = new Map<string, { data: string; updated: string }>();

export async function listMachines(): Promise<Summary[]> {
  if (key) return (await call("/machines")).json();
  return [...memory]
    .map(([id, { data, updated }]) => ({ id, name: JSON.parse(data).name, updated }))
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

export async function loadMachine(id: string): Promise<Machine> {
  if (key) return parseMachine(await (await call(`/machines/${encodeURIComponent(id)}`)).text());
  const saved = memory.get(id);
  if (!saved) throw new Error("machine not found");
  return parseMachine(saved.data);
}

/** Saves the machine and returns its id: creates it when `id` is null or no longer exists. */
export async function saveMachine(id: string | null, m: Machine): Promise<string> {
  const body = JSON.stringify(m);
  if (!key) {
    const memoryId = id && memory.has(id) ? id : crypto.randomUUID().slice(0, 8);
    memory.set(memoryId, { data: body, updated: new Date().toISOString() });
    return memoryId;
  }
  if (id) {
    try {
      await call(`/machines/${encodeURIComponent(id)}`, { method: "PUT", body });
      return id;
    } catch (e) {
      if (!(e instanceof Error) || e.message !== "machine not found") throw e;
    }
  }
  const created = await (await call("/machines", { method: "POST", body })).json();
  return created.id;
}

export async function deleteMachine(id: string): Promise<void> {
  if (!key) memory.delete(id);
  else await call(`/machines/${encodeURIComponent(id)}`, { method: "DELETE" });
}
