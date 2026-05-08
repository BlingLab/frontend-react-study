// ─── 데이터 ────────────────────────────────────────────────

type Learner = {
  id: number;
  name: string;
  role: string;
  skills: string[];
  isNew?: boolean;
};

const learners: Learner[] = [
  { id: 1, name: "Mina", role: "Frontend Learner", skills: ["JSX", "Props"], isNew: false },
  { id: 2, name: "Jun", role: "UI Builder", skills: ["Components", "CSS"], isNew: true },
  { id: 3, name: "Sora", role: "React Starter", skills: [] },
];

// ─── 섹션 1: 목록 렌더링 + props ────────────────────────────

function SkillList({ skills }: { skills: string[] }) {
  if (skills.length === 0) {
    return <p className="muted">아직 등록된 기술이 없습니다.</p>;
  }

  return (
    <ul className="tag-list">
      {skills.map((skill) => (
        <li key={skill}>{skill}</li>
      ))}
    </ul>
  );
}

type ProfileCardProps = {
  learner: Learner;
};

function ProfileCard({ learner }: ProfileCardProps) {
  return (
    <article className="card">
      <div className="card-header">
        <h3>{learner.name}</h3>
        {/* isNew가 true일 때만 뱃지 표시 — && 조건부 렌더링 */}
        {learner.isNew && <span className="badge">NEW</span>}
      </div>
      <p className="muted">{learner.role}</p>
      <SkillList skills={learner.skills} />
    </article>
  );
}

// ─── 섹션 2: 조건부 렌더링 패턴 ─────────────────────────────

type StatusBadgeProps = {
  isOnline: boolean;
};

function StatusBadge({ isOnline }: StatusBadgeProps) {
  // 삼항 연산자 — 두 가지 중 하나
  return (
    <span className={isOnline ? "status-on" : "status-off"}>
      {isOnline ? "온라인" : "오프라인"}
    </span>
  );
}

type NoticeBoxProps = {
  message: string | null;
};

function NoticeBox({ message }: NoticeBoxProps) {
  // 조건이 복잡하면 변수로 꺼내기
  if (!message) return null;

  return (
    <div className="notice">
      <strong>알림:</strong> {message}
    </div>
  );
}

// ─── 섹션 3: children props ──────────────────────────────────

type SectionBoxProps = {
  title: string;
  children: React.ReactNode;
};

function SectionBox({ title, children }: SectionBoxProps) {
  return (
    <div className="section-box">
      <h3 className="section-title">{title}</h3>
      {children}
    </div>
  );
}

// ─── 예제 루트 ───────────────────────────────────────────────

export function JsxComponentsExample() {
  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">JSX · Component · Props</p>
        <h2>기초 예제 모음</h2>
      </div>

      {/* 섹션 1: 목록 렌더링 */}
      <SectionBox title="Props로 카드 목록 만들기">
        <p className="description">
          learners 배열을 map으로 순회해 ProfileCard를 렌더링합니다.
          skills가 비어 있으면 빈 상태 메시지를 보여줍니다.
        </p>
        <div className="card-grid">
          {learners.map((learner) => (
            <ProfileCard key={learner.id} learner={learner} />
          ))}
        </div>
      </SectionBox>

      {/* 섹션 2: 조건부 렌더링 */}
      <SectionBox title="조건부 렌더링 패턴">
        <p className="description">
          삼항 연산자(두 가지 중 하나)와 &&(하나 또는 없음) 패턴을 비교합니다.
        </p>
        <div className="row gap">
          <div>
            <p className="label">삼항 연산자</p>
            <StatusBadge isOnline={true} />
            <br />
            <StatusBadge isOnline={false} />
          </div>
          <div>
            <p className="label">&amp;&amp; 연산자</p>
            <NoticeBox message="새로운 업데이트가 있습니다." />
            <NoticeBox message={null} />
            <p className="muted">null을 전달하면 아무것도 렌더링되지 않습니다.</p>
          </div>
        </div>
      </SectionBox>

      {/* 섹션 3: children props */}
      <SectionBox title="children props">
        <p className="description">
          SectionBox처럼 감싸는 역할의 컴포넌트는 children으로 내용을 받습니다.
          이 예제 자체가 SectionBox를 사용하고 있습니다.
        </p>
        <SectionBox title="중첩된 SectionBox">
          <p>children으로 또 다른 SectionBox를 전달할 수 있습니다.</p>
        </SectionBox>
      </SectionBox>
    </section>
  );
}
