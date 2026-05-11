import { useState } from "react";
import { examples } from "./examples";
import type { Stage } from "./examples/types";

const stages: { key: Stage; label: string }[] = [
  { key: "기초", label: "1단계. 기초" },
  { key: "초급", label: "2단계. 초급" },
  { key: "중급", label: "3단계. 중급" },
  { key: "고급", label: "4단계. 고급" },
  { key: "심화", label: "5단계. 심화" },
];

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
          {stages.map(({ key, label }) => {
            const stageExamples = examples.filter((e) => e.stage === key);
            if (stageExamples.length === 0) return null;
            return (
              <div key={key} className="stage-group">
                <p className="stage-label">{label}</p>
                {stageExamples.map((example) => (
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
              </div>
            );
          })}
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
