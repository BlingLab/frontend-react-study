type StatItem = {
  label: string;
  value: string;
  detail: string;
};

const stats: StatItem[] = [
  { label: "전체 문서", value: "60+", detail: "6단계 × 평균 10개" },
  { label: "실행 가능한 예제", value: "13개", detail: "기초~심화 각 단계 포함" },
  { label: "커버하는 Hook", value: "15+", detail: "useState에서 useOptimistic까지" },
  { label: "학습 목표", value: "설명 가능", detail: "코드 구조를 말로 설명하기" },
];

export function StudyStats() {
  return (
    <div>
      <p className="muted">
        이 컴포넌트는 처음 버튼을 눌렀을 때 별도 파일로 로딩됩니다.
        브라우저 DevTools → Network 탭에서 청크 파일을 확인할 수 있습니다.
      </p>
      <div className="card-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="card summary-card">
            <span className="muted">{stat.label}</span>
            <strong>{stat.value}</strong>
            <small className="muted">{stat.detail}</small>
          </article>
        ))}
      </div>
    </div>
  );
}
