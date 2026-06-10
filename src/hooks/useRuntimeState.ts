import { useEffect, useState } from "react";
import {
  SYNC_API_URL,
  fetchSharedState,
  initialRuntimeState,
  loadRuntimeState,
  saveRuntimeState,
  sendSharedAction,
  subscribeRuntimeState,
  type RuntimeAction,
} from "../services/runtimeStore";
import type { ItemRuntimeState, RuntimeState } from "../types/schedule";

export type SyncStatus = "local" | "connecting" | "connected" | "syncing" | "error";

function nextState(current: RuntimeState, actor: string, patch: Partial<RuntimeState>): RuntimeState {
  return {
    ...current,
    ...patch,
    revision: current.revision + 1,
    updatedAt: new Date().toISOString(),
    updatedBy: actor,
  };
}

export function useRuntimeState(operatorCode?: string) {
  const [runtime, setRuntime] = useState<RuntimeState>(loadRuntimeState);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SYNC_API_URL ? "connecting" : "local");
  const [syncMessage, setSyncMessage] = useState<string>();

  useEffect(() => subscribeRuntimeState(setRuntime), []);

  useEffect(() => {
    if (!SYNC_API_URL) return;
    let active = true;
    const refresh = async () => {
      try {
        const shared = await fetchSharedState();
        if (!active) return;
        const cached = saveRuntimeState(shared);
        setRuntime((current) => current.revision === shared.revision ? current : shared);
        setSyncStatus("connected");
        setSyncMessage(cached ? undefined : "共有状態は取得済みですが、この端末へのキャッシュ保存に失敗しました。");
      } catch {
        if (!active) return;
        setSyncStatus("error");
        setSyncMessage("同期APIに接続できません。閲覧のみ利用できます。");
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 2_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  const saveLocal = (updater: (latest: RuntimeState) => RuntimeState) => {
    const updated = updater(loadRuntimeState());
    if (!saveRuntimeState(updated)) {
      setSyncMessage("この端末への保存に失敗しました。空き容量とブラウザ設定を確認してください。");
      return;
    }
    setRuntime(updated);
  };

  const commit = async (action: Omit<RuntimeAction, "actionId" | "baseRevision">, localUpdater: (latest: RuntimeState) => RuntimeState) => {
    if (!SYNC_API_URL) {
      saveLocal(localUpdater);
      return;
    }
    if (!operatorCode || syncStatus !== "connected") return;
    const latest = loadRuntimeState();
    setSyncStatus("syncing");
    try {
      const shared = await sendSharedAction({
        ...action,
        actionId: crypto.randomUUID(),
        baseRevision: latest.revision,
      }, operatorCode);
      const cached = saveRuntimeState(shared);
      setRuntime(shared);
      setSyncStatus("connected");
      setSyncMessage(cached ? undefined : "サーバーには保存済みですが、この端末のキャッシュ保存に失敗しました。");
    } catch (error) {
      const conflict = error as Error & { latest?: RuntimeState };
      if (conflict.latest) {
        saveRuntimeState(conflict.latest);
        setRuntime(conflict.latest);
        setSyncMessage("別端末の更新を反映しました。操作内容を確認して、もう一度実行してください。");
      } else {
        setSyncMessage("保存できませんでした。通信状態を確認してください。");
      }
      setSyncStatus("error");
    }
  };

  const setGlobalOffset = (globalOffsetMinutes: number, actor: string) => void commit(
    { type: "setGlobalOffset", value: globalOffsetMinutes },
    (latest) => nextState(latest, actor, { globalOffsetMinutes }),
  );

  const updateItem = (itemId: string, patch: Partial<ItemRuntimeState>, actor: string) => void commit(
    { type: "updateItem", itemId, patch },
    (latest) => {
      const itemStates = { ...latest.itemStates };
      const existing = itemStates[itemId] ?? {};
      const safePatch = { ...patch };
      if (patch.status === "current" && existing.status === "current") delete safePatch.actualStart;
      if (patch.status === "done" && existing.status === "done") delete safePatch.actualEnd;
      if (patch.status === "current") {
        const now = new Date().toISOString();
        Object.entries(itemStates).forEach(([id, state]) => {
          if (id !== itemId && state.status === "current") {
            itemStates[id] = { ...state, status: "done", actualEnd: state.actualEnd ?? now };
          }
        });
      }
      itemStates[itemId] = { ...existing, ...safePatch };
      return nextState(latest, actor, { itemStates });
    },
  );

  const reset = (actor: string) => void commit(
    { type: "reset" },
    (latest) => ({
      ...initialRuntimeState,
      revision: latest.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: actor,
    }),
  );

  return {
    runtime,
    setGlobalOffset,
    updateItem,
    reset,
    sharedMode: Boolean(SYNC_API_URL),
    syncStatus,
    syncMessage,
  };
}
