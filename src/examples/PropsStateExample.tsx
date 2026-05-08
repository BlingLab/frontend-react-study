import { useState } from "react";

function CounterCard({ label, step }: { label: string; step: number }) {
  const [count, setCount] = useState(0);
  const status = count >= 10 ? "목표에 도달했습니다." : "조금 더 올려봅니다.";

  return (
    <article className="card">
      <h3>{label}</h3>
      <p className="counter-value">{count}</p>
      <p className="muted">{status}</p>
      <div className="button-row">
        <button type="button" onClick={() => setCount((value) => value - step)}>
          -{step}
        </button>
        <button type="button" onClick={() => setCount(0)}>
          Reset
        </button>
        <button type="button" onClick={() => setCount((value) => value + step)}>
          +{step}
        </button>
      </div>
    </article>
  );
}

export function PropsStateExample() {
  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">Props · State</p>
        <h2>독립적으로 움직이는 카운터</h2>
      </div>
      <div className="card-grid">
        <CounterCard label="기본 연습" step={1} />
        <CounterCard label="조금 빠르게" step={2} />
      </div>
    </section>
  );
}
