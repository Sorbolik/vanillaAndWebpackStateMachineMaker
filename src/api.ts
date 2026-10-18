// Client for the state machine API (Sorbolik/stateMachineMakerSERVER).
// The database belongs to the owner: every call carries the owner's key.

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

export const listMachines = async (): Promise<Summary[]> => (await call("/machines")).json();

export const loadMachine = async (id: string): Promise<Machine> =>
  parseMachine(await (await call(`/machines/${encodeURIComponent(id)}`)).text());

/** Saves the machine and returns its id: creates it when `id` is null or no longer exists. */
export async function saveMachine(id: string | null, m: Machine): Promise<string> {
  const body = JSON.stringify(m);
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

export const deleteMachine = async (id: string): Promise<void> => {
  await call(`/machines/${encodeURIComponent(id)}`, { method: "DELETE" });
};
