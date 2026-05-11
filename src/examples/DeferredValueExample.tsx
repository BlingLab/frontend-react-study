import { memo, useDeferredValue, useState } from "react";

const allItems = Array.from({ length: 2000 }, (_, i) => ({
  id: i + 1,
  title: `학습 항목 ${i + 1}`,
  category: i % 3 === 0 ? "state" : i % 3 === 1 ? "effect" : "rendering",
}));

const ResultItem = memo(function ResultItem({
  title,
  category,
}: {
  title: string;
  category: string;
}) {
  const start = performance.now();
  while (performance.now() - start < 0.2) {
    // 항목마다 0.2ms 대기 — 복잡한 렌더링 비용 시뮬레이션
  }
  return (
    <li className="stack-item">
      <span>{title}</span>
      <span className="pill neutral-pill">{category}</span>
    </li>
  );
});

function ResultList({ keyword }: { keyword: string }) {
  const filtered = allItems.filter(
    (item) =>
      item.title.includes(keyword) || item.category.includes(keyword),
  );
  const visible = filtered.slice(0, 40);

  if (keyword && filtered.length === 0) {
    return (
      <div className="empty-state">
        <h3>결과가 없습니다.</h3>
        <p className="muted">다른 키워드를 입력해보세요.</p>
      </div>
    );
  }

  return (
    <>
      <p className="muted">
        {keyword
          ? `"${keyword}" — ${filtered.length}개 중 ${visible.length}개 표시`
          : `전체 ${visible.length}개 표시`}
      </p>
      <ul className="stack-list compact">
        {visible.map((item) => (
          <ResultItem key={item.id} title={item.title} category={item.category} />
        ))}
      </ul>
    </>
  );
}

export function DeferredValueExample() {
  const [keyword, setKeyword] = useState("");
  const deferredKeyword = useDeferredValue(keyword);

  const isStale = keyword !== deferredKeyword;

  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">useDeferredValue · 느린 UI 다루기</p>
        <h2>입력 반응성 유지하기</h2>
        <p className="muted">
          <code>useDeferredValue</code>는 값의 업데이트를 낮은 우선순위로
          미룹니다. input은 즉시 바뀌고, 결과 목록은 여유가 생길 때
          따라옵니다. 이전 결과가 흐리게 남아 있는 것이 stale 상태입니다.
        </p>
      </div>

      <div>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="state, effect, rendering 검색"
          autoFocus
        />
        {isStale && (
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            결과 업데이트 중...
          </p>
        )}
      </div>

      <div style={{ opacity: isStale ? 0.55 : 1 }}>
        <ResultList keyword={deferredKeyword} />
      </div>
    </section>
  );
}
