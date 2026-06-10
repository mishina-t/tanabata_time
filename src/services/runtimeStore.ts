import type { ItemRuntimeState, RuntimeState } from "../types/schedule";

export const STORAGE_KEY = "tanabata-rakuken-runtime-v2";
export const SYNC_API_URL = import.meta.env.VITE_SYNC_API_URL?.replace(/\/$/, "");

export type RuntimeAction = {
  actionId: string;
  baseRevision: number;
  type: "setGlobalOffset" | "updateItem" | "reset";
  value?: number;
  itemId?: string;
  patch?: Partial<ItemRuntimeState>;
};

export const initialRuntimeState: RuntimeState = {
  globalOffsetMinutes: 0,
  itemStates: {},
  revision: 0,
};

export function loadRuntimeState(): RuntimeState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? { ...initialRuntimeState, ...JSON.parse(saved) } : initialRuntimeState;
  } catch {
    return initialRuntimeState;
  }
}

export function saveRuntimeState(state: RuntimeState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function subscribeRuntimeState(listener: (state: RuntimeState) => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      try {
        listener({ ...initialRuntimeState, ...JSON.parse(event.newValue) });
      } catch {
        // Ignore malformed state from an older local build.
      }
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}

export async function fetchSharedState(): Promise<RuntimeState> {
  if (!SYNC_API_URL) throw new Error("sync_disabled");
  const response = await fetch(SYNC_API_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`sync_fetch_${response.status}`);
  return { ...initialRuntimeState, ...await response.json() as RuntimeState };
}

export async function sendSharedAction(action: RuntimeAction, operatorCode: string): Promise<RuntimeState> {
  if (!SYNC_API_URL) throw new Error("sync_disabled");
  const response = await fetch(SYNC_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${operatorCode}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(action),
  });
  const body = await response.json() as RuntimeState | { error: string; state?: RuntimeState };
  if (response.status === 409 && "state" in body && body.state) {
    const error = new Error("revision_conflict") as Error & { latest?: RuntimeState };
    error.latest = body.state;
    throw error;
  }
  if (!response.ok) throw new Error("error" in body ? body.error : `sync_write_${response.status}`);
  return { ...initialRuntimeState, ...body as RuntimeState };
}
