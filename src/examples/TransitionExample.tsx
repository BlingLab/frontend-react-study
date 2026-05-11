import { useState, useTransition } from "react";

type Tab = "소개" | "글 목록" | "연락처";

function SlowPostItem({ index }: { index: number }) {
  const start = performance.now();
  while (performance.now() - start < 0.4) {
    // 항목마다 0.4ms 대기 — 복잡한 컴포넌트 렌더링 비용을 시뮬레이션
  }
  return (
    <li className="stack-item">
      <span>React 학습 노트 #{index + 1}</span>
      <span className="pill neutral-pill">렌더링됨</span>
    </li>
  );
}

function PostsTab() {
  return (
    <ul className="stack-list compact">
      {Array.from({ length: 200 }, (_, i) => (
        <SlowPostItem key={i} index={i} />
      ))}
    </ul>
  );
}

function AboutTab() {
  return (
    <div className="card">
      <h3>useTransition이란</h3>
      <p>
        <code>useTransition</code>은 화면 전환처럼 급하지 않은 state 업데이트를
        "전환(transition)"으로 표시하는 Hook입니다.
      </p>
      <p className="muted">
        전환으로 표시된 업데이트는 다른 긴급한 업데이트(input 입력 등)에
        양보합니다. 덕분에 무거운 탭으로 전환하는 중에도 input이 멈추지
        않습니다.
      </p>
      <p className="muted">
        글 목록 탭을 클릭하고, 전환 중에 이 input에 타이핑해보세요.
      </p>
    </div>
  );
}

function ContactTab() {
  return (
    <div className="card">
      <h3>연락처</h3>
      <p>이 탭은 가볍게 렌더링됩니다.</p>
      <p className="muted">
        소개 → 글 목록 → 연락처 순으로 클릭하며 체감을 비교합니다.
      </p>
    </div>
  );
}

export function TransitionExample() {
  const [tab, setTab] = useState<Tab>("소개");
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleTabChange(nextTab: Tab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">useTransition · Pending UI</p>
        <h2>급하지 않은 업데이트 처리하기</h2>
        <p className="muted">
          글 목록 탭은 200개 항목을 렌더링하므로 느립니다.{" "}
          <code>startTransition</code>으로 탭 전환을 감싸면 <code>isPending</code>
          으로 진행 상태를 표시하면서도 input은 계속 반응합니다.
        </p>
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="탭이 전환되는 중에도 입력해보세요"
      />

      <div className="button-row">
        {(["소개", "글 목록", "연락처"] as Tab[]).map((t) => (
          <button
            key={t}
            className={tab === t && !isPending ? "active-filter" : ""}
            onClick={() => handleTabChange(t)}
          >
            {t}
            {t === "글 목록" && " (느린 탭)"}
          </button>
        ))}
        {isPending && <span className="muted">전환 중...</span>}
      </div>

      <div style={{ opacity: isPending ? 0.5 : 1 }}>
        {tab === "소개" && <AboutTab />}
        {tab === "글 목록" && <PostsTab />}
        {tab === "연락처" && <ContactTab />}
      </div>
    </section>
  );
}
