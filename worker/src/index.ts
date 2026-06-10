type EventStatus = "pending" | "current" | "done" | "skipped" | "cancelled";

type ItemRuntimeState = {
  status?: EventStatus;
  actualStart?: string;
  actualEnd?: string;
  manualOffsetMinutes?: number;
  adjustedDurationMinutes?: number;
  memo?: string;
};

type RuntimeState = {
  globalOffsetMinutes: number;
  itemStates: Record<string, ItemRuntimeState>;
  revision: number;
  updatedAt?: string;
  updatedBy?: string;
};

type RuntimeAction = {
  actionId: string;
  baseRevision: number;
  type: "setGlobalOffset" | "updateItem" | "reset";
  value?: number;
  itemId?: string;
  patch?: Partial<ItemRuntimeState>;
};

type Env = {
  SCHEDULE_ROOM: DurableObjectNamespace;
  ALLOWED_ORIGIN: string;
  OPERATOR_HASHES: string;
};

const initialState: RuntimeState = { globalOffsetMinutes: 0, itemStates: {}, revision: 0 };

function json(data: unknown, status = 200, origin = "*"): Response {
  return Response.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Cache-Control": "no-store",
    },
  });
}

async function hash(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function authenticate(request: Request, env: Env): Promise<string | undefined> {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return undefined;
  const operators = JSON.parse(env.OPERATOR_HASHES || "{}") as Record<string, string>;
  return operators[await hash(token)];
}

export class ScheduleRoom implements DurableObject {
  constructor(private ctx: DurableObjectState, private env: Env) {}

  async fetch(request: Request): Promise<Response> {
    const origin = this.env.ALLOWED_ORIGIN;
    if (request.method === "OPTIONS") return json({}, 204, origin);

    const state = await this.ctx.storage.get<RuntimeState>("runtime") ?? initialState;
    if (request.method === "GET") return json(state, 200, origin);
    if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);

    const actor = await authenticate(request, this.env);
    if (!actor) {
      await request.arrayBuffer();
      return json({ error: "unauthorized" }, 401, origin);
    }

    const action = await request.json<RuntimeAction>();
    const seen = await this.ctx.storage.get<string[]>("seenActions") ?? [];
    if (seen.includes(action.actionId)) return json(state, 200, origin);
    if (action.baseRevision !== state.revision) return json({ error: "revision_conflict", state }, 409, origin);

    const next: RuntimeState = {
      ...state,
      itemStates: { ...state.itemStates },
      revision: state.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: actor,
    };

    if (action.type === "setGlobalOffset" && Number.isFinite(action.value)) {
      next.globalOffsetMinutes = Math.max(-180, Math.min(180, action.value as number));
    } else if (action.type === "updateItem" && action.itemId && action.patch) {
      const existing = next.itemStates[action.itemId] ?? {};
      const patch = { ...action.patch };
      if (patch.status === "current" && existing.status === "current") delete patch.actualStart;
      if (patch.status === "done" && existing.status === "done") delete patch.actualEnd;
      if (patch.status === "current") {
        Object.entries(next.itemStates).forEach(([id, itemState]) => {
          if (id !== action.itemId && itemState.status === "current") {
            next.itemStates[id] = { ...itemState, status: "done", actualEnd: itemState.actualEnd ?? next.updatedAt };
          }
        });
      }
      next.itemStates[action.itemId] = { ...existing, ...patch };
    } else if (action.type === "reset") {
      next.globalOffsetMinutes = 0;
      next.itemStates = {};
    } else {
      return json({ error: "invalid_action" }, 400, origin);
    }

    await this.ctx.storage.put({ runtime: next, seenActions: [...seen.slice(-99), action.actionId] });
    return json(next, 200, origin);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const requestOrigin = request.headers.get("Origin");
    if (requestOrigin && requestOrigin !== env.ALLOWED_ORIGIN) {
      await request.arrayBuffer();
      return json({ error: "origin_not_allowed" }, 403, env.ALLOWED_ORIGIN);
    }
    const room = env.SCHEDULE_ROOM.getByName("tanabata-2026");
    return room.fetch(request);
  },
};
