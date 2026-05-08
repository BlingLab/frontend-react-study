import { ChangeEvent, memo, useMemo, useState } from "react";

const items = Array.from({ length: 800 }, (_, index) => ({
  id: index + 1,
  title: `React concept ${index + 1}`,
  category: index % 2 === 0 ? "rendering" : "state",
}));

const ResultItem = memo(function ResultItem({ title, category }: { title: string; category: string }) {
  return (
    <li className="stack-item">
      <span>{title}</span>
      <span className="pill">{category}</span>
    </li>
  );
});

export function PerformanceExample() {
  const [keyword, setKeyword] = useState("");

  const filteredItems = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return items.slice(0, 20);

    return items
      .filter((item) => item.title.toLowerCase().includes(normalizedKeyword))
      .slice(0, 20);
  }, [keyword]);

  function handleKeywordChange(event: ChangeEvent<HTMLInputElement>) {
    setKeyword(event.target.value);
  }

  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">Performance</p>
        <h2>필요한 계산만 다시 하기</h2>
      </div>

      <input
        value={keyword}
        onChange={handleKeywordChange}
        placeholder="rendering 또는 state 검색"
      />
      <p className="muted">표시 중인 결과: {filteredItems.length}개</p>

      <ul className="stack-list compact">
        {filteredItems.map((item) => (
          <ResultItem key={item.id} title={item.title} category={item.category} />
        ))}
      </ul>
    </section>
  );
}
