import { useState } from "react";
import { examples } from "./examples";

function getInitialExampleId() {
  const exampleId = new URLSearchParams(window.location.search).get("example");
  return examples.some((example) => example.id === exampleId) ? exampleId! : examples[0].id;
}

export default function App() {
  const [selectedId, setSelectedId] = useState(getInitialExampleId);
  const selectedExample = examples.find((example) => example.id === selectedId) ?? examples[0];
  const ExampleComponent = selectedExample.Component;

  function selectExample(exampleId: string) {
    setSelectedId(exampleId);
    const url = new URL(window.location.href);
    url.searchParams.set("example", exampleId);
    window.history.replaceState(null, "", url);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">frontend-react-study</p>
          <h1>React 실습 노트</h1>
          <p className="muted">
            문서를 읽고, 작은 예제를 고치며 React 사고방식을 익힙니다.
          </p>
        </div>

        <nav className="example-nav" aria-label="예제 선택">
          {examples.map((example) => (
            <button
              key={example.id}
              type="button"
              className={example.id === selectedId ? "active" : ""}
              onClick={() => selectExample(example.id)}
            >
              <span>{example.title}</span>
              <small>{example.summary}</small>
            </button>
          ))}
        </nav>
      </aside>

      <section className="content-area">
        <div className="study-meta">
          <span>관련 문서</span>
          <code>{selectedExample.curriculumPath}</code>
        </div>
        <ExampleComponent />
      </section>
    </main>
  );
}
