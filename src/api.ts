// Client for the state machine API (Sorbolik/stateMachineMakerSERVER).

import { type Machine, parseMachine } from "./machine";

const BASE = import.meta.env.VITE_API_URL ?? "https://state-machine-api.sergiosorbi.workers.dev";

export type Summary = { id: string; name: string; updated: string };

async function call(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(BASE + path, { ...init, headers: { "content-type": "application/json" } });
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
