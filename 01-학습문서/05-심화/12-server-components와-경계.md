# Server Components와 경계

React Server Components(RSC)는 컴포넌트 일부를 브라우저가 아니라 서버 환경에서 렌더링하는 아키텍처입니다. 이 저장소는 Vite 기반 클라이언트 React 앱이므로 RSC를 직접 실행하지는 않습니다. 그래도 React 19 이후 자료를 읽으려면 Server Component, Client Component, Server Function의 경계를 알아야 합니다.

목표는 Next.js 같은 프레임워크를 여기서 바로 구현하는 것이 아닙니다. "이 코드는 서버에서 실행되는가, 클라이언트에서 실행되는가, 번들에 포함되는가"를 구분하는 감각을 잡는 것입니다.

## 먼저 용어를 분리하기

| 용어 | 의미 | 헷갈리기 쉬운 점 |
| --- | --- | --- |
| Server Component | 서버 환경에서 렌더링되는 컴포넌트 | `"use server"`로 표시하는 것이 아닙니다. |
| Client Component | 브라우저에서 hydration되고 상호작용할 수 있는 컴포넌트 | 파일 상단의 `"use client"`로 경계를 만듭니다. |
| Server Function | 클라이언트에서 호출할 수 있는 서버 함수 | `"use server"`는 컴포넌트가 아니라 함수/모듈을 표시합니다. |
| Server Action | form action 등 Action 위치에서 호출되는 Server Function | 모든 Server Function이 Server Action은 아닙니다. |

가장 흔한 오해는 `"use server"`가 Server Component를 의미한다고 생각하는 것입니다. Server Component에는 별도 directive가 없습니다. `"use server"`는 서버에서 실행될 함수를 표시합니다.

## Server Component가 해결하는 문제

클라이언트 컴포넌트에서 데이터를 가져오면 보통 첫 렌더 이후 Effect에서 요청이 시작됩니다.

```tsx
function Note({ id }: { id: string }) {
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((response) => response.json())
      .then(setNote);
  }, [id]);

  if (!note) return <p>불러오는 중...</p>;
  return <article>{note.body}</article>;
}
```

이 방식은 클라이언트 번들이 로드되고, 컴포넌트가 렌더링된 뒤, Effect가 실행된 다음에야 데이터를 요청합니다.

Server Component에서는 서버에서 렌더링 중 데이터를 읽을 수 있습니다.

```tsx
async function Note({ id }: { id: string }) {
  const note = await db.notes.get(id);

  return <article>{note.body}</article>;
}
```

이 코드는 브라우저 번들에 들어가지 않고, 서버에서 실행됩니다. 데이터베이스 접근이나 파일 시스템 접근처럼 클라이언트에 노출하면 안 되는 일을 서버 경계 안에 둘 수 있습니다.

## Client Component가 필요한 경우

Server Component는 브라우저에 보내져 실행되는 컴포넌트가 아니므로 interactive Hook을 쓸 수 없습니다.

| 필요한 것 | Client Component 필요 여부 |
| --- | --- |
| `useState`, `useReducer` | 필요 |
| `useEffect`, browser event listener | 필요 |
| `onClick`, `onChange` 같은 event handler | 필요 |
| `window`, `document`, `localStorage` | 필요 |
| 서버 데이터 읽기, markdown 렌더링, 정적 UI | Server Component 후보 |

상호작용이 필요한 부분만 Client Component로 만듭니다.

```tsx
// Server Component
import Expandable from "./Expandable";

async function ArticlePage({ id }: { id: string }) {
  const article = await getArticle(id);

  return (
    <main>
      <h1>{article.title}</h1>
      <Expandable>
        <article>{article.body}</article>
      </Expandable>
    </main>
  );
}
```

```tsx
"use client";

function Expandable({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <button onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "접기" : "펼치기"}
      </button>
      {isOpen && children}
    </section>
  );
}
```

`ArticlePage`는 서버에서 데이터를 읽고, `Expandable`만 클라이언트에서 상호작용합니다.

## `"use client"` 경계

파일 상단에 `"use client"`를 쓰면 그 파일과 그 파일이 import하는 클라이언트 의존성이 브라우저 번들에 포함됩니다.

```tsx
"use client";

import { useState } from "react";
import HeavyChart from "./HeavyChart";

export function DashboardControls() {
  const [range, setRange] = useState("7d");
  return <HeavyChart range={range} />;
}
```

주의할 점은 `"use client"`를 너무 위에 두면 많은 코드가 클라이언트 번들로 이동한다는 것입니다. 상호작용이 필요한 작은 컴포넌트에만 경계를 둡니다.

| 좋지 않은 방향 | 더 나은 방향 |
| --- | --- |
| 페이지 전체를 `"use client"`로 만들기 | 버튼, form, 토글 같은 작은 섬만 client |
| 서버 데이터 가공 코드를 client 파일에 import | 서버 컴포넌트에서 가공 후 props 전달 |
| 무거운 라이브러리를 client 경계 위로 올리기 | 필요한 화면에서 lazy/client island로 제한 |

## props로 넘길 수 있는 것

Server Component에서 Client Component로 props를 넘길 때는 직렬화 가능한 값이어야 합니다.

```tsx
// 좋음
<LikeButton postId={post.id} initialLiked={post.liked} />
```

```tsx
// 좋지 않음: 일반 함수를 클라이언트 컴포넌트로 직접 전달할 수 없음
<LikeButton onLike={() => db.likes.create(post.id)} />
```

서버에서 실행되어야 하는 함수는 Server Function으로 정의하고, 프레임워크가 그 참조를 클라이언트로 전달하도록 해야 합니다.

## `"use server"`와 Server Function

`"use server"`는 서버에서 실행될 함수를 표시합니다.

```tsx
"use server";

export async function createComment(formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "댓글을 입력하세요." };
  }

  await db.comments.create({ body });
  return { ok: true };
}
```

Client Component에서는 이 함수를 form action과 함께 사용할 수 있습니다. 실제 동작은 Next.js, React Router RSC 모드 같은 프레임워크의 RSC 번들러 지원이 필요합니다.

```tsx
"use client";

import { useActionState } from "react";
import { createComment } from "./actions";

function CommentForm() {
  const [state, action, isPending] = useActionState(createComment, null);

  return (
    <form action={action}>
      <input name="body" />
      <button disabled={isPending}>작성</button>
      {state?.error && <p role="alert">{state.error}</p>}
    </form>
  );
}
```

이 저장소의 Vite 앱에서는 위 서버 함수 흐름을 직접 실행하지 않습니다. 대신 고급 단계의 `useActionState` 문서에서 클라이언트 Action 패턴을 먼저 익힙니다.

## RSC와 SSR은 다르다

Server Components와 SSR(Server-Side Rendering)은 관련이 있지만 같은 개념은 아닙니다.

| 구분 | Server Components | SSR |
| --- | --- | --- |
| 목적 | 컴포넌트를 서버에서 실행하고 결과를 클라이언트에 전달 | 초기 HTML을 서버에서 만들어 빠르게 보여줌 |
| 클라이언트 번들 | Server Component 코드는 브라우저 번들에서 제외 | 컴포넌트 코드는 hydration을 위해 클라이언트에도 필요할 수 있음 |
| 데이터 접근 | 서버 컴포넌트 안에서 직접 접근 가능 | 프레임워크의 loader/fetch 전략에 따름 |
| 상호작용 | Client Component 경계 필요 | hydration 후 상호작용 |

SSR을 한다고 자동으로 RSC를 쓰는 것은 아니고, RSC를 쓴다고 모든 UI가 서버에서만 끝나는 것도 아닙니다.

## RSC에서 상태 설계가 사라지지 않는다

Server Components를 쓰면 client fetch와 bundle 크기를 줄일 수 있지만, 아래 문제는 여전히 남습니다.

- 어떤 값이 URL state인지
- 어떤 상호작용이 client state인지
- mutation 후 어떤 데이터를 다시 검증할지
- optimistic UI가 필요한지
- Error Boundary와 Suspense boundary를 어디에 둘지
- Client Component 경계를 얼마나 작게 유지할지

RSC는 상태 설계를 대체하지 않습니다. 서버에서 할 일을 서버로 옮기고, 클라이언트에서 해야 할 상호작용을 더 선명하게 나누는 도구입니다.

## 이 저장소에서의 학습 위치

| 주제 | 이 저장소에서 먼저 볼 문서 |
| --- | --- |
| client state와 server state 구분 | [State를 분류하고 배치하기](../04-고급/03-state를-분류하고-배치하기.md) |
| server state cache | [Server state와 Query cache](../04-고급/08-server-state와-query-cache.md) |
| form action과 pending UI | [Form Action과 useActionState](../04-고급/10-form-action과-useActionState.md) |
| Suspense boundary | [Suspense와 Error Boundary](./03-suspense와-compiler-관점.md) |
| 최신 API 우선순위 | [React 19 이후 학습 지도](./11-react-19-이후-학습지도.md) |

RSC는 위 개념들이 어느 정도 잡힌 뒤에 Next.js나 React Router RSC 프로젝트에서 따로 실습하는 편이 좋습니다.

## 읽으면서 생각할 질문

- 이 컴포넌트는 상호작용이 필요한가?
- 이 코드가 브라우저 번들에 들어가야 하는가?
- 서버 데이터 접근을 client fetch로 해야 하는가, 서버 경계에서 처리할 수 있는가?
- `"use client"`를 너무 넓은 파일에 붙이고 있지는 않은가?
- `"use server"`를 Server Component 표시로 오해하고 있지는 않은가?
- Server Function 호출 후 어떤 캐시나 화면을 갱신해야 하는가?
