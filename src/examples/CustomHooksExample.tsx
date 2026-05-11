import { useState } from "react";
import { useFetch } from "../hooks/useFetch";
import { useToggle } from "../hooks/useToggle";

// ─── 섹션 1: useToggle ─────────────────────────────────────

function ToggleCard({ title, defaultOpen = false }: { title: string; defaultOpen?: boolean }) {
  const { isOn, turnOn, turnOff, toggle } = useToggle(defaultOpen);

  return (
    <article className="card">
      <h3>{title}</h3>
      <p className="muted">{isOn ? "열려 있습니다." : "닫혀 있습니다."}</p>
      <div className="button-row">
        <button type="button" onClick={turnOn} disabled={isOn}>
          열기
        </button>
        <button type="button" onClick={turnOff} disabled={!isOn}>
          닫기
        </button>
        <button type="button" onClick={toggle}>
          토글
        </button>
      </div>
    </article>
  );
}

// ─── 섹션 2: useFetch ─────────────────────────────────────

type User = {
  id: number;
  name: string;
  email: string;
  company: { name: string };
};

const USER_URLS: Record<string, string | null> = {
  "사용자 1": "https://jsonplaceholder.typicode.com/users/1",
  "사용자 2": "https://jsonplaceholder.typicode.com/users/2",
  "잘못된 URL": "https://jsonplaceholder.typicode.com/invalid-endpoint-404",
  "없음 (idle)": null,
};

function FetchSection() {
  const [selected, setSelected] = useState<keyof typeof USER_URLS>("사용자 1");
  const url = USER_URLS[selected];
  const result = useFetch<User>(url);

  return (
    <div className="card">
      <h3>useFetch 사용 예시</h3>
      <p className="muted">
        URL을 바꾸면 자동으로 새 요청을 보냅니다. 이전 응답은 무시됩니다.
      </p>

      <div className="button-row" style={{ marginBottom: "0.75rem" }}>
        {Object.keys(USER_URLS).map((label) => (
          <button
            key={label}
            type="button"
            className={selected === label ? "active-filter" : ""}
            onClick={() => setSelected(label as keyof typeof USER_URLS)}
          >
            {label}
          </button>
        ))}
      </div>

      {result.status === "idle" && (
        <p className="muted">URL이 없습니다. 버튼을 선택하세요.</p>
      )}
      {result.status === "loading" && <p className="muted">불러오는 중...</p>}
      {result.status === "error" && (
        <p className="error-message">{result.message}</p>
      )}
      {result.status === "success" && (
        <div>
          <p>
            <strong>{result.data.name}</strong>
          </p>
          <p className="muted">{result.data.email}</p>
          <p className="muted">{result.data.company.name}</p>
        </div>
      )}
    </div>
  );
}

// ─── 예제 루트 ───────────────────────────────────────────────

export function CustomHooksExample() {
  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">Custom Hooks</p>
        <h2>상태 로직에 이름 붙이기</h2>
        <p className="muted">
          Custom Hook은 컴포넌트에서 상태 로직을 꺼내 이름을 붙이는 방법입니다.
          JSX가 없고, Hook을 직접 호출하며, 다른 컴포넌트와 로직을 공유합니다.
        </p>
      </div>

      <div>
        <p className="label" style={{ marginBottom: "0.5rem", fontWeight: 600 }}>
          useToggle — 불리언 상태 토글
        </p>
        <div className="card-grid">
          <ToggleCard title="학습 메모" defaultOpen />
          <ToggleCard title="복습 체크" />
        </div>
      </div>

      <FetchSection />
    </section>
  );
}
