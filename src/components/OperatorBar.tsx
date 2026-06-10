import type { RuntimeState } from "../types/schedule";
import type { SyncStatus } from "../hooks/useRuntimeState";
import { formatTimestamp } from "../utils/time";

type Props = {
  runtime: RuntimeState;
  online: boolean;
  sharedMode: boolean;
  syncStatus: SyncStatus;
  syncMessage?: string;
  operatorName?: string;
  checking?: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

export function OperatorBar({ runtime, online, sharedMode, syncStatus, syncMessage, operatorName, checking, onLogin, onLogout }: Props) {
  const isOperator = Boolean(operatorName);
  const connected = !sharedMode || syncStatus === "connected" || syncStatus === "syncing";
  return (
    <section className={`operator-bar ${isOperator ? "operator-active" : ""}`} aria-label="操作と保存の状態">
      <div className="operator-state">
        <span className={`connection-dot ${online && connected ? "online" : "offline"}`} />
        <div>
          <strong>{isOperator ? `運営モード: ${operatorName}` : "閲覧モード"}</strong>
          <small>
            {!online
              ? "オフライン: キャッシュ閲覧のみ"
              : sharedMode
                ? syncStatus === "connected" ? "全端末と同期済み" : syncStatus === "syncing" ? "保存中" : "同期停止: 閲覧のみ"
                : "この端末だけに保存 / 別端末とは未同期"}
            {runtime.updatedAt && ` / 最終操作 ${formatTimestamp(runtime.updatedAt)} ${runtime.updatedBy ?? ""}`}
          </small>
          {syncMessage && <small className="sync-warning">{syncMessage}</small>}
        </div>
      </div>
      {isOperator ? (
        <button className="operator-release" onClick={onLogout}>ログアウト</button>
      ) : (
        <button onClick={onLogin} disabled={!online || checking}>{checking ? "確認中" : "運営ログイン"}</button>
      )}
    </section>
  );
}
