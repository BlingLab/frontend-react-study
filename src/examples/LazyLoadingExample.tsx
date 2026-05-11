import { lazy, Suspense, useState } from "react";

// 컴포넌트 외부에서 선언 — 렌더링마다 새 lazy 호출이 생기지 않도록
const StudyStats = lazy(() => import("./lazy/StudyStats").then((m) => ({ default: m.StudyStats })));

function StatsPanel() {
  const [show, setShow] = useState(false);

  return (
    <div className="card">
      <h3>학습 통계 (지연 로딩)</h3>
      <p className="muted">
        버튼을 처음 누르면 통계 컴포넌트 코드를 그때 불러옵니다.
        Network 탭을 열고 버튼을 누르면 새 청크 파일 요청을 볼 수 있습니다.
      </p>
      <button type="button" onClick={() => setShow(true)} disabled={show}>
        {show ? "로딩됨" : "통계 불러오기"}
      </button>

      {show && (
        <Suspense
          fallback={
            <p className="muted">통계를 불러오는 중...</p>
          }
        >
          <StudyStats />
        </Suspense>
      )}
    </div>
  );
}

function EagerPanel() {
  return (
    <div className="card">
      <h3>즉시 로딩 패널</h3>
      <p className="muted">
        이 패널은 앱 번들에 처음부터 포함되어 있습니다.
        통계 패널과 달리 추가 네트워크 요청이 없습니다.
      </p>
      <p>
        코드 분할은 항상 필요하지 않습니다. 첫 화면에 필요한 코드라면
        즉시 로딩이 더 빠를 수 있습니다.
      </p>
    </div>
  );
}

export function LazyLoadingExample() {
  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">React.lazy · Suspense · 코드 분할</p>
        <h2>필요할 때 코드 불러오기</h2>
        <p className="muted">
          <code>lazy</code>와 <code>Suspense</code>로 컴포넌트 코드를 지연
          로딩합니다. 처음 로드하지 않아도 되는 화면 코드를 분리해 초기
          로딩을 줄입니다.
        </p>
      </div>

      <div className="card-grid">
        <StatsPanel />
        <EagerPanel />
      </div>

      <div className="card">
        <h3>언제 코드 분할이 필요한가</h3>
        <ul className="stack-list">
          {[
            "첫 화면과 무관한 대형 서드파티 라이브러리",
            "탭, 모달, 설정 패널처럼 일부 사용자만 여는 화면",
            "라우트 단위 분할 — 진입하는 페이지 코드만 로딩",
            "관리자 전용 기능처럼 선택적 흐름",
          ].map((text) => (
            <li key={text} className="stack-item">
              {text}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
