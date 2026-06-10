import { formatOffset } from "../utils/schedule";

type Props = { value: number; disabled?: boolean; onChange: (value: number) => void };

export function OffsetControl({ value, disabled = false, onChange }: Props) {
  return (
    <section className="panel offset-panel" aria-labelledby="offset-heading">
      <div className="offset-summary">
        <h2 id="offset-heading">全体進行</h2>
        <p className={`offset-value ${value !== 0 ? "is-shifted" : ""}`}>{formatOffset(value)}</p>
      </div>
      <div className="button-row compact">
        <button disabled={disabled} onClick={() => onChange(value - 5)}>-5分</button>
        <button disabled={disabled} onClick={() => onChange(value - 1)}>-1分</button>
        <button disabled={disabled} className="button-subtle" onClick={() => onChange(0)}>リセット</button>
        <button disabled={disabled} onClick={() => onChange(value + 1)}>+1分</button>
        <button disabled={disabled} onClick={() => onChange(value + 5)}>+5分</button>
      </div>
    </section>
  );
}
