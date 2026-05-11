import {
  ComponentType,
  createContext,
  useContext,
  useState,
} from "react";

// ── 섹션 1: Discriminated Union 상태 ─────────────────────────────────
type FetchState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };

type Article = { id: number; title: string; body: string };

function ArticleDisplay({ state }: { state: FetchState<Article> }) {
  if (state.status === "idle") {
    return <p style={{ color: "#9ca3af", fontStyle: "italic" }}>아직 요청하지 않았습니다.</p>;
  }
  if (state.status === "loading") {
    return <p style={{ color: "#6b7280" }}>불러오는 중...</p>;
  }
  if (state.status === "error") {
    return (
      <p role="alert" style={{ color: "#dc2626" }}>
        오류: {state.message}
      </p>
    );
  }
  // status === "success" → state.data가 보장됨
  return (
    <div style={{ padding: "0.75rem", background: "#f0fdf4", borderRadius: 6 }}>
      <strong>{state.data.title}</strong>
      <p style={{ fontSize: "0.875rem", color: "#374151", margin: "0.25rem 0 0" }}>
        {state.data.body}
      </p>
    </div>
  );
}

const sampleArticle: Article = {
  id: 1,
  title: "Discriminated Union 패턴",
  body: "TypeScript가 status 필드로 각 상태에서 가능한 프로퍼티를 자동으로 좁혀줍니다.",
};

function DiscriminatedUnionSection() {
  const [state, setState] = useState<FetchState<Article>>({ status: "idle" });

  function simulate(next: "loading" | "success" | "error") {
    if (next === "loading") {
      setState({ status: "loading" });
      setTimeout(() => {
        setState({ status: "success", data: sampleArticle });
      }, 1000);
      return;
    }
    if (next === "success") {
      setState({ status: "success", data: sampleArticle });
      return;
    }
    setState({ status: "error", message: "서버에 연결할 수 없습니다." });
  }

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>1. Discriminated Union 상태</h3>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>
        status 필드로 상태를 좁히면 각 분기에서 가능한 프로퍼티만 접근할 수 있습니다.
      </p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <button onClick={() => setState({ status: "idle" })}>idle</button>
        <button onClick={() => simulate("loading")}>loading → success</button>
        <button onClick={() => simulate("error")}>error</button>
        <button onClick={() => simulate("success")}>success</button>
      </div>
      <ArticleDisplay state={state} />
    </section>
  );
}

// ── 섹션 2: Generic 컴포넌트 ─────────────────────────────────────────
type SelectProps<T> = {
  items: T[];
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  value: string;
  onChange: (value: string) => void;
  label: string;
};

function Select<T>({ items, getLabel, getValue, value, onChange, label }: SelectProps<T>) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">— 선택 —</option>
        {items.map((item) => (
          <option key={getValue(item)} value={getValue(item)}>
            {getLabel(item)}
          </option>
        ))}
      </select>
    </label>
  );
}

type User = { id: string; name: string; role: string };
type Category = { slug: string; label: string };

const users: User[] = [
  { id: "u1", name: "이지영", role: "PM" },
  { id: "u2", name: "박준호", role: "FE" },
  { id: "u3", name: "최서연", role: "BE" },
];

const categories: Category[] = [
  { slug: "react", label: "React" },
  { slug: "typescript", label: "TypeScript" },
  { slug: "testing", label: "Testing" },
];

function GenericSelectSection() {
  const [userId, setUserId] = useState("");
  const [categorySlug, setCategorySlug] = useState("");

  const selectedUser = users.find((u) => u.id === userId);
  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>2. Generic 컴포넌트</h3>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>
        같은 Select 컴포넌트가 User와 Category 두 타입을 처리합니다. 타입 인수로 getLabel,
        getValue 콜백이 올바른 프로퍼티만 받을 수 있습니다.
      </p>
      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <Select<User>
          label="담당자"
          items={users}
          getLabel={(u) => `${u.name} (${u.role})`}
          getValue={(u) => u.id}
          value={userId}
          onChange={setUserId}
        />
        <Select<Category>
          label="카테고리"
          items={categories}
          getLabel={(c) => c.label}
          getValue={(c) => c.slug}
          value={categorySlug}
          onChange={setCategorySlug}
        />
      </div>
      <p style={{ fontSize: "0.875rem", margin: 0 }}>
        선택:{" "}
        <strong>
          {selectedUser ? selectedUser.name : "없음"}
        </strong>
        {" / "}
        <strong>
          {selectedCategory ? selectedCategory.label : "없음"}
        </strong>
      </p>
    </section>
  );
}

// ── 섹션 3: Context 타입 안전 Hook ────────────────────────────────────
type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (ctx === null) {
    throw new Error("useTheme은 ThemeProvider 안에서만 사용할 수 있습니다.");
  }
  return ctx;
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const themes: Theme[] = ["light", "dark", "system"];

  return (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {themes.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          style={{
            padding: "0.25rem 0.75rem",
            background: theme === t ? "#1d4ed8" : undefined,
            color: theme === t ? "white" : undefined,
          }}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function ContextSection() {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h3 style={{ marginBottom: "0.5rem" }}>3. Context 타입 안전 Hook</h3>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>
        Context 기본값을 null로 두고 전용 Hook에서 null 체크를 합니다. Provider 밖에서 사용하면
        명확한 오류가 납니다.
      </p>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        <ThemeToggle />
        <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
          현재 테마: <strong>{theme}</strong>
        </p>
      </ThemeContext.Provider>
    </section>
  );
}

// ── 섹션 4: ComponentType prop ────────────────────────────────────────
type ListProps<T> = {
  items: T[];
  renderItem: ComponentType<{ item: T }>;
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
};

function TypedList<T>({ items, renderItem: Item, keyExtractor, emptyMessage }: ListProps<T>) {
  if (items.length === 0) {
    return <p style={{ color: "#9ca3af", fontStyle: "italic" }}>{emptyMessage ?? "항목 없음"}</p>;
  }
  return (
    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {items.map((item) => (
        <li key={keyExtractor(item)}>
          <Item item={item} />
        </li>
      ))}
    </ul>
  );
}

function UserCard({ item }: { item: User }) {
  return (
    <div
      style={{
        padding: "0.5rem 0.75rem",
        border: "1px solid #e5e7eb",
        borderRadius: 6,
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
      }}
    >
      <span
        style={{
          background: "#eff6ff",
          color: "#1d4ed8",
          borderRadius: "50%",
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.75rem",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {item.name[0]}
      </span>
      <span>
        {item.name} <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>({item.role})</span>
      </span>
    </div>
  );
}

function ComponentTypePropSection() {
  const [filter, setFilter] = useState<string>("");
  const filtered = users.filter((u) => u.name.includes(filter) || u.role.includes(filter));

  return (
    <section>
      <h3 style={{ marginBottom: "0.5rem" }}>4. ComponentType prop 패턴</h3>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>
        renderItem을 ComponentType으로 받으면 목록과 렌더링 방식을 분리할 수 있습니다.
      </p>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="이름 또는 역할로 필터"
        style={{ marginBottom: "0.75rem", padding: "0.375rem 0.5rem", width: "100%", boxSizing: "border-box" }}
      />
      <TypedList<User>
        items={filtered}
        renderItem={UserCard}
        keyExtractor={(u) => u.id}
        emptyMessage="일치하는 사용자가 없습니다."
      />
    </section>
  );
}

// ── 메인 ──────────────────────────────────────────────────────────────
export function TypeScriptPatternsExample() {
  return (
    <div>
      <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: "0.875rem" }}>
        TypeScript로 React 컴포넌트를 더 안전하게 만드는 핵심 패턴입니다. 코드 탭에서 타입
        정의를 함께 확인해 보세요.
      </p>
      <DiscriminatedUnionSection />
      <GenericSelectSection />
      <ContextSection />
      <ComponentTypePropSection />
    </div>
  );
}

