import { useDebounce } from "../hooks/useDebounce";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useOnlineStatus } from "../hooks/useOnlineStatus";

// ─── 타입 ────────────────────────────────────────────────────

type Theme = "light" | "dark";

type Note = {
  id: number;
  text: string;
  createdAt: number;
};

// ─── 섹션 1: useLocalStorage — 새로고침에도 유지되는 설정 ────

function ThemeSection() {
  const [theme, setTheme, resetTheme] = useLocalStorage<Theme>(
    "study-theme",
    "light",
  );
  const [fontSize, setFontSize] = useLocalStorage<number>("study-font-size", 16);

  return (
    <div className="card">
      <h3>useLocalStorage — 새로고침에도 유지</h3>
      <p className="muted">
        현재 설정을 바꾼 뒤 페이지를 새로고침하면 값이 그대로 남습니다.
        localStorage에 JSON으로 저장되기 때문입니다.
      </p>

      <div className="button-row" style={{ marginBottom: "0.75rem" }}>
        <button
          type="button"
          className={theme === "light" ? "active-filter" : ""}
          onClick={() => setTheme("light")}
        >
          라이트
        </button>
        <button
          type="button"
          className={theme === "dark" ? "active-filter" : ""}
          onClick={() => setTheme("dark")}
        >
          다크
        </button>
        <button type="button" onClick={resetTheme}>
          초기화
        </button>
      </div>

      <div style={{ marginBottom: "0.75rem" }}>
        <label style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span className="muted">폰트 크기: {fontSize}px</span>
          <input
            type="range"
            min={12}
            max={22}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </label>
      </div>

      <div
        style={{
          padding: "0.75rem",
          borderRadius: "6px",
          background: theme === "dark" ? "#1a2422" : "#f4f7f5",
          color: theme === "dark" ? "#d0e8e0" : "#21302c",
          fontSize: `${fontSize}px`,
          border: "1px solid #dce4df",
        }}
      >
        {theme === "dark" ? "다크 테마 미리보기" : "라이트 테마 미리보기"}
      </div>
    </div>
  );
}

// ─── 섹션 2: useDebounce — 입력이 멈춘 뒤 요청 보내기 ────────

function DebounceSection() {
  const [keyword, setKeyword] = useLocalStorage("study-search", "");
  const debouncedKeyword = useDebounce(keyword, 400);

  const results = debouncedKeyword.trim()
    ? ["Effect", "State", "Props", "Context", "Reducer", "Portal"].filter(
        (t) => t.toLowerCase().includes(debouncedKeyword.toLowerCase()),
      )
    : [];

  const isWaiting = keyword !== debouncedKeyword;

  return (
    <div className="card">
      <h3>useDebounce — 입력이 멈춘 뒤에 검색</h3>
      <p className="muted">
        입력할 때마다 즉시 검색하지 않고, 400ms 동안 추가 입력이 없을 때
        검색합니다. 검색어도 localStorage에 저장됩니다.
      </p>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Effect, State, Props..."
      />

      {isWaiting ? (
        <p className="muted">입력 대기 중...</p>
      ) : debouncedKeyword.trim() ? (
        results.length > 0 ? (
          <ul className="tag-list">
            {results.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">결과가 없습니다.</p>
        )
      ) : null}
    </div>
  );
}

// ─── 섹션 3: useLocalStorage + 복잡한 배열 state ────────────

function NotesSection() {
  const [notes, setNotes, clearNotes] = useLocalStorage<Note[]>("study-notes", []);

  function addNote(text: string) {
    if (!text.trim()) return;
    setNotes((prev) => [
      { id: Date.now(), text: text.trim(), createdAt: Date.now() },
      ...prev,
    ]);
  }

  function removeNote(id: number) {
    setNotes((prev) => prev.filter((note) => note.id !== id));
  }

  return (
    <div className="card">
      <h3>배열 state + localStorage</h3>
      <p className="muted">
        복잡한 타입도 JSON 직렬화가 가능하면 localStorage에 저장할 수 있습니다.
        새로고침해도 노트가 남습니다.
      </p>

      <form
        className="form-row"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("note") as HTMLInputElement;
          addNote(input.value);
          input.value = "";
        }}
      >
        <input name="note" placeholder="학습 메모를 입력하세요" />
        <button type="submit">추가</button>
        {notes.length > 0 && (
          <button type="button" onClick={clearNotes}>
            전체 삭제
          </button>
        )}
      </form>

      {notes.length === 0 ? (
        <p className="muted">메모가 없습니다.</p>
      ) : (
        <ul className="stack-list">
          {notes.map((note) => (
            <li key={note.id} className="stack-item">
              <span>{note.text}</span>
              <button type="button" onClick={() => removeNote(note.id)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── 섹션 4: useOnlineStatus — useSyncExternalStore 활용 ─────

function OnlineStatusSection() {
  const isOnline = useOnlineStatus();

  return (
    <div className="card">
      <h3>useOnlineStatus — useSyncExternalStore</h3>
      <p className="muted">
        브라우저의 navigator.onLine은 React state가 아닙니다.{" "}
        <code>useSyncExternalStore</code>로 구독하면 모든 컴포넌트가 일관된
        snapshot을 공유합니다. 네트워크를 끊어 보세요.
      </p>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          borderRadius: 6,
          background: isOnline ? "#dcfce7" : "#fee2e2",
          color: isOnline ? "#166534" : "#991b1b",
          fontWeight: 600,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: isOnline ? "#16a34a" : "#dc2626",
            flexShrink: 0,
          }}
        />
        {isOnline ? "온라인" : "오프라인"}
      </div>
      <p className="muted" style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        subscribe: online/offline 이벤트 구독 &nbsp;|&nbsp; getSnapshot: () =&gt;
        navigator.onLine
      </p>
    </div>
  );
}

// ─── 예제 루트 ───────────────────────────────────────────────

export function AdvancedHooksExample() {
  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">Custom Hook 심화</p>
        <h2>재사용 가능한 로직 설계하기</h2>
        <p className="muted">
          <code>useLocalStorage</code>, <code>useDebounce</code>,{" "}
          <code>useOnlineStatus</code>는 각각 브라우저 API를 감싸는 패턴입니다.
          Hook 이름만 보고 목적과 API를 예측할 수 있도록 설계합니다.
        </p>
      </div>

      <ThemeSection />
      <DebounceSection />
      <NotesSection />
      <OnlineStatusSection />
    </section>
  );
}
