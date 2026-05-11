import { FormEvent, useOptimistic, useRef, useState, useTransition } from "react";

type Comment = {
  id: number;
  text: string;
  sending?: boolean;
};

const initialComments: Comment[] = [
  { id: 1, text: "useOptimistic이 React 19에서 정식 API가 됐군요." },
  { id: 2, text: "낙관적 업데이트로 체감 속도가 훨씬 빨라집니다." },
];

function fakePostComment(text: string): Promise<Comment> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.25) {
        reject(new Error("전송 실패"));
      } else {
        resolve({ id: Date.now(), text });
      }
    }, 1500);
  });
}

export function OptimisticExample() {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [optimisticComments, addOptimistic] = useOptimistic(
    comments,
    (current, newText: string) => [
      ...current,
      { id: Date.now(), text: newText, sending: true },
    ],
  );
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text || isPending) return;

    setInput("");
    setError("");

    startTransition(async () => {
      addOptimistic(text);
      try {
        const saved = await fakePostComment(text);
        setComments((prev) => [...prev, saved]);
      } catch {
        setError("댓글 전송에 실패했습니다. 다시 시도해주세요.");
        inputRef.current?.focus();
      }
    });
  }

  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">useOptimistic · 낙관적 업데이트</p>
        <h2>서버 응답 전에 화면 먼저 바꾸기</h2>
        <p className="muted">
          댓글을 전송하면 1.5초의 서버 지연이 있습니다. 그 전에 화면에 먼저
          표시됩니다. 25% 확률로 실패하며, 실패하면 낙관적 항목이 사라집니다.
        </p>
      </div>

      <form className="form-row" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="댓글을 입력하세요"
          disabled={isPending}
        />
        <button type="submit" disabled={!input.trim() || isPending}>
          {isPending ? "전송 중..." : "전송"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <ul className="stack-list">
        {optimisticComments.map((comment) => (
          <li
            key={comment.id}
            className="stack-item"
            style={{ opacity: comment.sending ? 0.55 : 1 }}
          >
            <span>{comment.text}</span>
            {comment.sending && (
              <span className="muted" style={{ fontSize: "0.85rem" }}>
                전송 중...
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
