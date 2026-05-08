import { type FormEvent, useMemo, useRef, useState } from "react";

type Article = {
  id: number;
  title: string;
  category: "effect" | "fetching" | "hook" | "router";
  minutes: number;
  completed: boolean;
};

const articles: Article[] = [
  {
    id: 1,
    title: "Effect는 외부 시스템과 동기화할 때만 쓴다",
    category: "effect",
    minutes: 8,
    completed: true,
  },
  {
    id: 2,
    title: "요청 상태는 loading, error, empty, success로 나눈다",
    category: "fetching",
    minutes: 11,
    completed: false,
  },
  {
    id: 3,
    title: "Custom Hook은 상태 로직에 이름을 붙이는 방법이다",
    category: "hook",
    minutes: 9,
    completed: true,
  },
  {
    id: 4,
    title: "URL도 새로고침과 공유가 가능한 UI 상태다",
    category: "router",
    minutes: 7,
    completed: false,
  },
  {
    id: 5,
    title: "계산 가능한 값은 state로 다시 저장하지 않는다",
    category: "effect",
    minutes: 6,
    completed: false,
  },
];

const categoryLabels: Record<Article["category"], string> = {
  effect: "Effect",
  fetching: "Fetching",
  hook: "Hook",
  router: "Router",
};

export function IntermediatePatternsExample() {
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Article["category"] | "all">("all");
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);
  const [submittedKeyword, setSubmittedKeyword] = useState("");

  const visibleArticles = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        article.title.toLowerCase().includes(normalizedKeyword) ||
        categoryLabels[article.category].toLowerCase().includes(normalizedKeyword);
      const matchesCategory =
        selectedCategory === "all" || article.category === selectedCategory;
      const matchesIncomplete = !onlyIncomplete || !article.completed;

      return matchesKeyword && matchesCategory && matchesIncomplete;
    });
  }, [keyword, onlyIncomplete, selectedCategory]);

  const completedCount = articles.filter((article) => article.completed).length;
  const totalMinutes = visibleArticles.reduce((sum, article) => sum + article.minutes, 0);
  const hasFilters =
    keyword.trim().length > 0 || selectedCategory !== "all" || onlyIncomplete;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (keyword.trim().length === 0) {
      searchInputRef.current?.focus();
      return;
    }

    setSubmittedKeyword(keyword.trim());
  }

  function resetFilters() {
    setKeyword("");
    setSelectedCategory("all");
    setOnlyIncomplete(false);
    setSubmittedKeyword("");
    searchInputRef.current?.focus();
  }

  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">Intermediate Patterns</p>
        <h2>계산값, ref, 컴포넌트 분리 감각</h2>
        <p className="muted">
          필터 결과와 요약값은 state로 저장하지 않고 렌더링 중 계산합니다. 빈 검색
          제출처럼 DOM 조작이 필요한 순간에는 ref로 input에 focus를 줍니다.
        </p>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <h3>학습 문서 찾기</h3>
        <div className="form-row">
          <input
            ref={searchInputRef}
            value={keyword}
            placeholder="effect, hook, URL 같은 키워드"
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button type="submit">검색 확정</button>
          <button type="button" onClick={resetFilters} disabled={!hasFilters}>
            초기화
          </button>
        </div>
        <p className="muted">
          확정 검색어: {submittedKeyword.length > 0 ? submittedKeyword : "아직 없음"}
        </p>
      </form>

      <div className="button-row" aria-label="카테고리 필터">
        <button
          type="button"
          className={selectedCategory === "all" ? "active-filter" : ""}
          onClick={() => setSelectedCategory("all")}
        >
          전체
        </button>
        {Object.entries(categoryLabels).map(([category, label]) => (
          <button
            key={category}
            type="button"
            className={selectedCategory === category ? "active-filter" : ""}
            onClick={() => setSelectedCategory(category as Article["category"])}
          >
            {label}
          </button>
        ))}
        <label className="toggle-line">
          <input
            type="checkbox"
            checked={onlyIncomplete}
            onChange={(event) => setOnlyIncomplete(event.target.checked)}
          />
          미완료만
        </label>
      </div>

      <div className="card-grid">
        <SummaryCard title="전체 문서" value={`${articles.length}개`} />
        <SummaryCard title="완료" value={`${completedCount}개`} />
        <SummaryCard title="현재 결과" value={`${visibleArticles.length}개`} />
        <SummaryCard title="예상 시간" value={`${totalMinutes}분`} />
      </div>

      {visibleArticles.length === 0 ? (
        <div className="empty-state">
          <h3>조건에 맞는 문서가 없습니다.</h3>
          <p className="muted">검색어를 줄이거나 필터를 초기화해 보세요.</p>
          <button type="button" onClick={resetFilters}>
            필터 초기화
          </button>
        </div>
      ) : (
        <ul className="stack-list">
          {visibleArticles.map((article) => (
            <ArticleRow key={article.id} article={article} />
          ))}
        </ul>
      )}
    </section>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <article className="card summary-card">
      <span className="muted">{title}</span>
      <strong>{value}</strong>
    </article>
  );
}

function ArticleRow({ article }: { article: Article }) {
  return (
    <li className="stack-item">
      <div>
        <strong>{article.title}</strong>
        <div className="inline-meta">
          <span>{categoryLabels[article.category]}</span>
          <span>{article.minutes}분</span>
        </div>
      </div>
      <span className={article.completed ? "pill" : "pill neutral-pill"}>
        {article.completed ? "완료" : "진행 전"}
      </span>
    </li>
  );
}
