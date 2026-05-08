import { useToggle } from "../hooks/useToggle";

function ToggleCard({ title, defaultOpen = false }: { title: string; defaultOpen?: boolean }) {
  const { isOn, turnOn, turnOff, toggle } = useToggle(defaultOpen);

  return (
    <article className="card">
      <h3>{title}</h3>
      <p className="muted">{isOn ? "열려 있습니다." : "닫혀 있습니다."}</p>
      <div className="button-row">
        <button type="button" onClick={turnOn}>
          열기
        </button>
        <button type="button" onClick={turnOff}>
          닫기
        </button>
        <button type="button" onClick={toggle}>
          토글
        </button>
      </div>
    </article>
  );
}

export function CustomHooksExample() {
  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">Custom Hook</p>
        <h2>토글 로직에 이름 붙이기</h2>
      </div>
      <div className="card-grid">
        <ToggleCard title="학습 메모" defaultOpen />
        <ToggleCard title="복습 체크" />
      </div>
    </section>
  );
}
