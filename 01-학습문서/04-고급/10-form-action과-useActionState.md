# Form Action과 useActionState

React 19에서는 form을 다루는 방식이 조금 넓어졌습니다. 기존처럼 controlled input과 `onSubmit`으로 처리할 수도 있고, `<form action={함수}>` 패턴으로 제출 동작 자체를 Action으로 표현할 수도 있습니다.

이 문서는 "form을 어떻게 더 짧게 쓰는가"보다, 제출 중 상태, 서버 요청, 오류, optimistic UI를 한 흐름으로 설계하는 데 초점을 둡니다.

## 기존 onSubmit 방식

초급과 중급에서는 아래 방식이 기본입니다.

```tsx
function ProfileForm() {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) return;

    setStatus("saving");
    try {
      await saveProfile({ name });
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="name">이름</label>
      <input
        id="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <button disabled={status === "saving"}>저장</button>
      {status === "error" && <p role="alert">저장에 실패했습니다.</p>}
    </form>
  );
}
```

이 방식은 명확하고 React 초급 학습에 좋습니다. 입력값을 state로 들고, submit handler에서 사용자 의도를 처리합니다.

하지만 form이 많아지고 제출 상태, 오류 메시지, pending 버튼, optimistic update가 반복되면 같은 구조가 계속 생깁니다.

## form action 방식

React DOM의 `<form>`은 `action` prop에 함수를 받을 수 있습니다. 이 함수는 form이 제출될 때 실행되고, `FormData`를 인자로 받습니다.

```tsx
function SearchForm() {
  function search(formData: FormData) {
    const query = String(formData.get("query") ?? "");
    console.log(query);
  }

  return (
    <form action={search}>
      <label htmlFor="query">검색어</label>
      <input id="query" name="query" type="search" />
      <button type="submit">검색</button>
    </form>
  );
}
```

여기서 중요한 차이는 input이 반드시 controlled일 필요가 없다는 점입니다. `name` 속성이 있는 input 값은 제출 시점에 `FormData`로 읽습니다.

## useActionState로 제출 결과 관리하기

`useActionState`는 Action이 실행될 때 이전 state와 제출 데이터를 받아 다음 state를 반환하게 합니다.

```tsx
type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const initialState: FormState = { status: "idle" };

async function updateProfile(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();

  if (name.length < 2) {
    return { status: "error", message: "이름은 2글자 이상이어야 합니다." };
  }

  try {
    await saveProfile({ name });
    return { status: "success", message: "저장했습니다." };
  } catch {
    return { status: "error", message: "저장에 실패했습니다." };
  }
}

function ProfileForm() {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState,
  );

  return (
    <form action={formAction}>
      <label htmlFor="name">이름</label>
      <input id="name" name="name" />

      <button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "저장"}
      </button>

      {state.status !== "idle" && (
        <p role={state.status === "error" ? "alert" : undefined}>
          {state.message}
        </p>
      )}
    </form>
  );
}
```

`useActionState`가 반환하는 값은 세 가지입니다.

| 값 | 의미 |
| --- | --- |
| `state` | 마지막 Action 결과 |
| `formAction` | `<form action>`에 연결할 함수 |
| `isPending` | Action이 진행 중인지 여부 |

## useFormStatus로 제출 버튼 분리하기

제출 버튼이 별도 컴포넌트로 분리되어 있으면 `isPending`을 props로 계속 넘기기보다 `useFormStatus`를 쓸 수 있습니다. 이 Hook은 form 안쪽에서 현재 제출 상태를 읽습니다.

```tsx
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending ? "저장 중..." : "저장"}
    </button>
  );
}

function ProfileForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action}>
      <input name="name" />
      <SubmitButton />
    </form>
  );
}
```

`useFormStatus`는 form 안에 렌더링된 컴포넌트에서만 의미가 있습니다. form 밖에 있는 버튼 상태를 읽는 용도로 쓰면 안 됩니다.

## controlled form과 action form 비교

둘 중 하나만 정답은 아닙니다.

| 상황 | 더 자연스러운 방식 |
| --- | --- |
| 입력 중 바로 검증하거나 미리보기 표시 | controlled input + state |
| 입력값이 다른 컴포넌트와 실시간 공유됨 | controlled input + state |
| 제출 시점에만 값이 필요함 | form action + FormData |
| 제출 결과 state와 pending UI가 중요함 | `useActionState` |
| 버튼만 form 상태를 알아야 함 | `useFormStatus` |
| 복잡한 wizard form | reducer 또는 form 라이브러리 검토 |

입력 중 UI가 변해야 하면 controlled가 자연스럽습니다. 제출 시점에만 값이 필요하면 action form이 더 단순할 수 있습니다.

## Action과 transition 관계

Action은 비동기 상태 전환을 표현하는 패턴입니다. `useTransition`, form action, `useActionState`, `useOptimistic`은 모두 "요청 중 UI를 어떻게 보여줄 것인가"라는 문제와 연결됩니다.

```tsx
function RenameButton({ rename }: { rename: () => Promise<void> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await rename();
        });
      }}
    >
      {isPending ? "변경 중..." : "이름 변경"}
    </button>
  );
}
```

비동기 작업 뒤에 state를 바꾸는 경우에는 응답 순서와 실패 처리를 함께 설계해야 합니다. 요청 A가 늦게 도착해서 요청 B의 결과를 덮어쓰는 race condition은 React가 대신 해결해주지 않습니다.

## useOptimistic과 함께 쓰기

댓글 작성처럼 제출 즉시 화면에 반영하고 싶다면 `useOptimistic`과 form action을 함께 쓸 수 있습니다.

```tsx
type Comment = {
  id: string;
  body: string;
  pending?: boolean;
};

function CommentForm({
  comments,
  createComment,
}: {
  comments: Comment[];
  createComment: (body: string) => Promise<void>;
}) {
  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (current: Comment[], body: string) => [
      { id: `temp-${Date.now()}`, body, pending: true },
      ...current,
    ],
  );

  async function action(formData: FormData) {
    const body = String(formData.get("body") ?? "").trim();
    if (!body) return;

    addOptimisticComment(body);
    await createComment(body);
  }

  return (
    <>
      <form action={action}>
        <label htmlFor="body">댓글</label>
        <input id="body" name="body" />
        <SubmitButton />
      </form>

      <ul>
        {optimisticComments.map((comment) => (
          <li key={comment.id}>
            {comment.body}
            {comment.pending && <span> 저장 중</span>}
          </li>
        ))}
      </ul>
    </>
  );
}
```

optimistic UI는 사용자에게 빠른 피드백을 주지만, 실패했을 때의 복구 UI가 반드시 필요합니다. 댓글이면 임시 항목에 "재시도"를 붙일 수 있고, 좋아요라면 원래 상태로 되돌릴 수 있습니다.

## Client Component에서의 주의점

이 저장소는 Vite 기반 클라이언트 앱입니다. 여기서 `<form action={async function}>`은 클라이언트에서 실행되는 함수입니다. Next.js 같은 프레임워크의 Server Action과 같은 개념으로 섞어 생각하면 안 됩니다.

| 구분 | 이 저장소에서 다루는 것 | 프레임워크에서 추가로 다루는 것 |
| --- | --- | --- |
| 실행 위치 | 브라우저 클라이언트 | 서버 또는 클라이언트 |
| 제출 데이터 | `FormData` | `FormData`, 서버 함수, revalidation |
| 상태 표시 | `useActionState`, `useFormStatus` | route cache, server mutation 정책 |
| 학습 초점 | pending/error/optimistic UI | 서버 액션과 데이터 재검증 |

고급 단계에서는 먼저 React의 Action 패턴을 이해합니다. 서버에서 form action을 실행하는 방식은 Next.js, Remix, React Router 같은 프레임워크 문서와 함께 봐야 합니다.

## 언제 아직 쓰지 않아도 되나

- controlled input으로 충분히 단순하다.
- 제출 중 상태가 버튼 하나뿐이다.
- form 데이터가 입력 중 계속 다른 UI와 연결된다.
- 팀이 아직 React 19 form action 패턴을 쓰지 않는다.
- 서버 mutation은 이미 TanStack Query나 라우터 action으로 표준화되어 있다.

새 API는 기존 패턴을 모두 대체하지 않습니다. form action과 `useActionState`는 제출 흐름을 더 선언적으로 다룰 수 있는 선택지입니다.

## 읽으면서 생각할 질문

- 입력값이 입력 중에도 React state로 필요하거나, 제출 시점에만 필요한가?
- pending UI는 form 전체에 필요한가, 버튼 하나에만 필요한가?
- 성공/실패 메시지는 어디 state로 관리할 것인가?
- optimistic UI를 쓴다면 실패 복구는 어떻게 보일 것인가?
- 이 Action은 클라이언트에서 실행되는가, 서버에서 실행되는가?
- race condition이 생길 수 있는 요청인가?
