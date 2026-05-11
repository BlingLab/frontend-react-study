import React, {
  Component,
  ErrorInfo,
  PropsWithChildren,
  ReactNode,
  Suspense,
  lazy,
  useState,
} from "react";

// ── ErrorBoundary class ────────────────────────────────────────────────
type BoundaryState = { hasError: boolean; error: Error | null };
type FallbackRender = (props: { error: Error | null; reset: () => void }) => ReactNode;

class ErrorBoundary extends Component<PropsWithChildren<{ fallback?: FallbackRender }>, BoundaryState> {
  state: BoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, reset: this.reset });
      }
      return (
        <div role="alert" style={{ padding: "1rem", background: "#fee2e2", borderRadius: 6, color: "#991b1b" }}>
          <strong>화면을 표시할 수 없습니다.</strong>
          <button
            onClick={this.reset}
            style={{ display: "block", marginTop: "0.5rem", padding: "0.25rem 0.75rem" }}
          >
            다시 시도
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── 의도적으로 오류를 던지는 컴포넌트 ─────────────────────────────────
function BuggyWidget({ triggerAt, count }: { triggerAt: number; count: number }) {
  if (count >= triggerAt) {
    throw new Error(`count가 ${triggerAt}에 도달해 렌더링 오류가 발생했습니다.`);
  }
  return (
    <p style={{ margin: 0 }}>
      카운트: <strong>{count}</strong> / {triggerAt - 1}까지 안전
    </p>
  );
}

// ── 섹션 1: 격리된 오류 ────────────────────────────────────────────────
function IsolatedErrorSection() {
  const [countA, setCountA] = useState(0);
  const [countB, setCountB] = useState(0);

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "0.75rem" }}>1. 격리된 오류</h3>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
        각 위젯은 독립된 ErrorBoundary로 감싸져 있습니다. 하나가 오류를 내도 다른 하나는 계속
        동작합니다.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem" }}>위젯 A (임계값 3)</p>
          <ErrorBoundary
            fallback={({ error, reset }) => (
              <div role="alert" style={{ color: "#dc2626", fontSize: "0.875rem" }}>
                <p style={{ margin: "0 0 0.5rem" }}>{error?.message}</p>
                <button onClick={reset}>↩ 리셋</button>
              </div>
            )}
          >
            <BuggyWidget triggerAt={3} count={countA} />
          </ErrorBoundary>
          <button
            onClick={() => setCountA((c) => c + 1)}
            style={{ marginTop: "0.5rem", padding: "0.25rem 0.75rem" }}
          >
            증가
          </button>
        </div>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: "0.5rem" }}>위젯 B (임계값 5)</p>
          <ErrorBoundary>
            <BuggyWidget triggerAt={5} count={countB} />
          </ErrorBoundary>
          <button
            onClick={() => setCountB((c) => c + 1)}
            style={{ marginTop: "0.5rem", padding: "0.25rem 0.75rem" }}
          >
            증가
          </button>
        </div>
      </div>
    </section>
  );
}

// ── 섹션 2: Suspense + ErrorBoundary ──────────────────────────────────
const LazyPanel = lazy(() =>
  new Promise<{ default: () => React.ReactElement }>((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.4) {
        reject(new Error("청크 로딩에 실패했습니다. (40% 확률)"));
      } else {
        resolve({
          default: () => (
            <div style={{ padding: "0.75rem", background: "#f0fdf4", borderRadius: 6, color: "#166534" }}>
              ✓ 지연 로딩된 패널이 성공적으로 렌더링되었습니다.
            </div>
          ),
        });
      }
    }, 1000);
  })
);

function SuspenseSection() {
  const [show, setShow] = useState(false);
  const [key, setKey] = useState(0);

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "0.75rem" }}>2. Suspense + ErrorBoundary 조합</h3>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
        ErrorBoundary가 Suspense 바깥에 있어야 lazy 로딩 실패를 잡을 수 있습니다. 40% 확률로 오류가
        발생합니다.
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button onClick={() => { setShow(true); setKey((k) => k + 1); }}>
          패널 로드
        </button>
        <button onClick={() => setShow(false)}>숨기기</button>
      </div>
      {show && (
        <ErrorBoundary
          key={key}
          fallback={({ error, reset }) => (
            <div role="alert" style={{ padding: "0.75rem", background: "#fee2e2", borderRadius: 6, color: "#991b1b" }}>
              <p style={{ margin: "0 0 0.5rem", fontSize: "0.875rem" }}>{error?.message}</p>
              <button onClick={() => { reset(); setKey((k) => k + 1); }}>다시 시도</button>
            </div>
          )}
        >
          <Suspense
            fallback={
              <p style={{ color: "#6b7280", fontStyle: "italic" }}>패널을 불러오는 중...</p>
            }
          >
            <LazyPanel />
          </Suspense>
        </ErrorBoundary>
      )}
    </section>
  );
}

// ── 섹션 3: event handler 오류는 state로 ─────────────────────────────
function EventHandlerSection() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    setMessage("");
    try {
      await new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error("저장 서버에 연결할 수 없습니다.")), 800)
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <h3 style={{ marginBottom: "0.75rem" }}>3. event handler 오류는 state로 처리</h3>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "1rem" }}>
        ErrorBoundary는 event handler 오류를 잡지 못합니다. try/catch로 직접 처리하고 state로
        보여줍니다.
      </p>
      <button onClick={handleSave} disabled={loading}>
        {loading ? "저장 중..." : "저장 (항상 실패)"}
      </button>
      {message && (
        <p role="alert" style={{ marginTop: "0.5rem", color: "#dc2626", fontSize: "0.875rem" }}>
          {message}
        </p>
      )}
    </section>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────
export function ErrorBoundaryExample() {
  return (
    <div>
      <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: "0.875rem" }}>
        Error Boundary는 자식 컴포넌트 렌더링 오류를 격리합니다. event handler 오류는 잡지 못하므로
        따로 처리합니다.
      </p>
      <IsolatedErrorSection />
      <SuspenseSection />
      <EventHandlerSection />
    </div>
  );
}
