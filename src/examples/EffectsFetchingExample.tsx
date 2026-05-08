import { useEffect, useState } from "react";

type Post = {
  id: number;
  title: string;
};

type RequestState = {
  status: "idle" | "loading" | "success" | "error";
  posts: Post[];
  errorMessage: string;
};

const initialState: RequestState = {
  status: "idle",
  posts: [],
  errorMessage: "",
};

export function EffectsFetchingExample() {
  const [requestState, setRequestState] = useState(initialState);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function fetchPosts() {
      setRequestState({ status: "loading", posts: [], errorMessage: "" });

      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/posts?_limit=5");
        if (!response.ok) throw new Error("게시글을 불러오지 못했습니다.");

        const posts = (await response.json()) as Post[];
        if (!ignore) {
          setRequestState({ status: "success", posts, errorMessage: "" });
        }
      } catch (error) {
        if (!ignore) {
          setRequestState({
            status: "error",
            posts: [],
            errorMessage: error instanceof Error ? error.message : "알 수 없는 오류",
          });
        }
      }
    }

    fetchPosts();

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">Effect · Fetching</p>
        <h2>외부 데이터 불러오기</h2>
      </div>

      <button type="button" onClick={() => setReloadKey((key) => key + 1)}>
        다시 불러오기
      </button>

      {requestState.status === "loading" && <p className="muted">불러오는 중...</p>}
      {requestState.status === "error" && (
        <p className="error-message">{requestState.errorMessage}</p>
      )}
      {requestState.status === "success" && (
        <ul className="stack-list">
          {requestState.posts.map((post) => (
            <li key={post.id} className="stack-item">
              {post.title}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
