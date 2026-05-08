# Fetching 상태 나누기

서버 데이터를 가져오는 UI는 성공 화면만 있으면 부족합니다.

사용자는 요청 중인지, 실패했는지, 결과가 비었는지 알아야 합니다. 그래서 fetching UI는 보통 다음 상태를 가집니다.

- idle (요청 전)
- loading (요청 중)
- error (실패)
- empty (성공이지만 데이터 없음)
- success (성공)

## 왜 상태를 나눠야 하나

API 요청은 "데이터가 있거나 없거나"만으로 끝나지 않습니다.

| 상황 | 사용자가 알아야 하는 것 |
| --- | --- |
| 요청 시작 전 | 아직 아무 일도 하지 않았는가? |
| 요청 중 | 기다려야 하는가, 다른 행동을 해도 되는가? |
| 실패 | 무엇이 실패했고 다시 시도할 수 있는가? |
| 빈 결과 | 요청은 성공했지만 보여줄 데이터가 없는가? |
| 성공 | 어떤 데이터를 보여줄 것인가? |

이 상태를 대충 섞으면 UI가 이상해집니다. 예를 들어 `posts.length === 0`만 보고 "게시글 없음"을 보여주면 요청 중에도 빈 화면이 보일 수 있고, 실패했을 때도 "결과 없음"처럼 보일 수 있습니다.

## 처음에는 단순하게 시작하기

작은 컴포넌트에서는 state 여러 개로 시작해도 괜찮습니다.

```tsx
const [posts, setPosts] = useState<Post[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
```

다만 상태 조합이 늘어나면 모순이 생깁니다.

```tsx
// 가능한데 이상한 조합
isLoading === true;
errorMessage === "실패했습니다.";
posts.length > 0;
```

로딩 중이면서 에러가 있고, 데이터도 있는 상태는 의도한 UI일 수도 있지만 대부분은 애매합니다. 이럴 때는 상태를 하나의 union 타입으로 정리합니다.

## union 타입으로 요청 상태 표현하기

```tsx
type RequestState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "empty" }
  | { status: "success"; data: T };
```

제네릭을 쓰면 여러 데이터 타입에 재사용할 수 있습니다.

이 방식의 장점은 각 상태에서 필요한 데이터가 명확해진다는 점입니다. `error` 상태에는 message가 있고, `success` 상태에는 data가 있습니다. `loading` 상태에서는 data를 읽을 필요가 없습니다. TypeScript가 이 구분을 강제해줍니다.

```tsx
function PostsView({ state }: { state: RequestState<Post[]> }) {
  if (state.status === "idle") {
    return <p>게시글을 불러와 주세요.</p>;
  }

  if (state.status === "loading") {
    return <PostsSkeleton />;
  }

  if (state.status === "error") {
    return <p role="alert">{state.message}</p>;
  }

  if (state.status === "empty") {
    return <p>아직 게시글이 없습니다.</p>;
  }

  // 여기서는 state.data가 Post[]임을 TypeScript가 알고 있음
  return <PostList posts={state.data} />;
}
```

## Effect에서 fetch 다루기

Effect로 fetch를 작성할 때는 최소한 두 가지를 고려합니다.

- 컴포넌트가 사라졌는데 뒤늦게 응답이 도착할 수 있습니다.
- 빠르게 여러 번 요청했을 때 오래된 응답이 나중 요청을 덮어쓸 수 있습니다.

가장 단순한 방어는 cleanup에서 ignore 플래그를 바꾸는 방식입니다.

```tsx
const [state, setState] = useState<RequestState<Post[]>>({ status: "idle" });

useEffect(() => {
  let ignore = false;

  async function fetchPosts() {
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/posts");
      if (!response.ok) {
        throw new Error("게시글을 불러오지 못했습니다.");
      }

      const posts = (await response.json()) as Post[];

      if (!ignore) {
        setState(
          posts.length === 0
            ? { status: "empty" }
            : { status: "success", data: posts },
        );
      }
    } catch (error) {
      if (!ignore) {
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "알 수 없는 오류",
        });
      }
    }
  }

  fetchPosts();

  return () => {
    ignore = true;
  };
}, []);
```

실제 제품에서는 `AbortController`로 요청 자체를 취소하는 방법도 자주 씁니다.

```tsx
useEffect(() => {
  const controller = new AbortController();

  async function fetchPosts() {
    setState({ status: "loading" });

    try {
      const response = await fetch("/api/posts", {
        signal: controller.signal,
      });
      const posts = (await response.json()) as Post[];
      setState(
        posts.length === 0
          ? { status: "empty" }
          : { status: "success", data: posts },
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return; // 취소된 요청은 에러로 처리하지 않음
      }

      setState({ status: "error", message: "요청에 실패했습니다." });
    }
  }

  fetchPosts();

  return () => controller.abort();
}, []);
```

`AbortController`는 실제 네트워크 요청을 취소하므로 `ignore` 플래그보다 리소스를 아낄 수 있습니다.

## 다시 시도와 reloadKey 패턴

실패 UI에는 가능하면 다시 시도 버튼을 둡니다. 재시도는 `reloadKey` 같은 값을 바꿔 Effect를 다시 실행하게 만들 수 있습니다.

```tsx
const [reloadKey, setReloadKey] = useState(0);

useEffect(() => {
  // ... fetch 로직
}, [reloadKey]);

function handleRetry() {
  setReloadKey((key) => key + 1);
}

// 에러 상태일 때
if (state.status === "error") {
  return (
    <div role="alert">
      <p>{state.message}</p>
      <button type="button" onClick={handleRetry}>
        다시 시도
      </button>
    </div>
  );
}
```

요청 중 버튼을 계속 누를 수 있으면 같은 요청이 여러 번 쌓입니다. 사용자가 누를 수 있는 버튼과 누르면 안 되는 버튼을 UI 상태와 연결해야 합니다.

```tsx
<button
  type="button"
  disabled={state.status === "loading"}
  onClick={handleRetry}
>
  {state.status === "loading" ? "불러오는 중..." : "다시 불러오기"}
</button>
```

## empty는 error가 아니다

빈 배열은 요청 실패가 아닙니다. 서버가 정상 응답을 했고 결과가 0개인 상태입니다.

```tsx
if (posts.length === 0) {
  setState({ status: "empty" });
} else {
  setState({ status: "success", data: posts });
}
```

empty UI에는 보통 다음 행동을 같이 줍니다.

- 검색어를 바꿔 보라는 안내
- 필터 초기화 버튼
- 첫 데이터를 만드는 버튼
- 다시 불러오기 버튼

```tsx
if (state.status === "empty") {
  return (
    <div>
      <p>검색 결과가 없습니다.</p>
      <button onClick={clearFilter}>필터 초기화</button>
    </div>
  );
}
```

## idle 상태는 언제 필요한가

처음에는 아직 아무 요청도 하지 않은 상태입니다. 페이지가 열리자마자 바로 요청하는 경우에는 idle이 눈에 보일 시간이 없으므로 생략하기도 합니다.

하지만 버튼을 눌러야 요청이 시작되는 경우에는 idle이 의미 있습니다.

```tsx
if (state.status === "idle") {
  return <p>검색어를 입력하고 검색 버튼을 누르세요.</p>;
}
```

## 데이터를 유지한 채 재요청하기

페이지네이션이나 필터 변경처럼 기존 데이터를 완전히 지우지 않고 새 데이터를 덧붙이거나 갱신해야 하는 경우도 있습니다.

```tsx
type PostsState =
  | { status: "loading"; previousData?: Post[] }
  | { status: "success"; data: Post[] }
  | { status: "error"; message: string; previousData?: Post[] };
```

재요청 중에도 이전 결과를 흐리게(dimmed) 보여주면 UX가 부드러워집니다.

```tsx
if (state.status === "loading" && state.previousData) {
  return (
    <>
      <p>새 결과를 불러오는 중...</p>
      <PostList posts={state.previousData} dimmed />
    </>
  );
}
```

하지만 상태가 복잡해지는 만큼, 정말 필요한 경우에만 씁니다.

## 페이지네이션 패턴

"더 보기" 방식의 추가 로딩입니다.

```tsx
function handleLoadMore() {
  setPage((prev) => prev + 1);
}

useEffect(() => {
  async function fetchMore() {
    setIsLoadingMore(true);
    try {
      const newPosts = await fetchPosts({ page });
      setPosts((prev) => [...prev, ...newPosts]);
      setHasMore(newPosts.length > 0);
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (page > 1) fetchMore();
}, [page]);
```

처음 요청과 추가 요청의 loading 상태를 별도로 관리하면 "불러오는 중" 표시를 더 세밀하게 제어할 수 있습니다.

## 언제 server state 도구를 고려하나

직접 `useEffect`와 `useState`로 fetch를 다루는 것은 학습에 좋고 작은 기능에는 충분합니다. 하지만 아래 요구가 많아지면 React Query, SWR 같은 server state 도구를 검토합니다.

- 같은 데이터를 여러 화면에서 공유한다.
- 캐싱, 재검증, refetch 정책이 필요하다.
- 페이지네이션, 무한 스크롤, optimistic update가 필요하다.
- 요청 중복 제거와 stale 데이터 처리가 중요하다.

도구를 쓰더라도 UI 상태를 나누는 감각은 그대로 필요합니다. 도구가 `isLoading`, `isError`, `data`를 제공해도 empty와 success를 구분하는 일은 여전히 컴포넌트의 책임입니다.

```tsx
// React Query 사용 예시
const { data: posts, isLoading, isError, error } = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
});

if (isLoading) return <PostsSkeleton />;
if (isError) return <ErrorView message={error.message} onRetry={refetch} />;
if (!posts || posts.length === 0) return <EmptyView />;
return <PostList posts={posts} />;
```

## 읽으면서 생각할 질문

- 요청 중 버튼을 눌러도 되는가?
- 실패했을 때 사용자가 다시 시도할 수 있는가?
- 데이터가 빈 배열일 때는 성공인가, 실패인가?
- 컴포넌트가 fetch URL 세부사항까지 알아야 하는가?
- 요청 결과를 local state로 둘지 server state 도구를 쓸지 판단했는가?
- 이전 요청의 응답이 최신 요청 결과를 덮어쓸 수 있지는 않은가?
- 같은 데이터를 여러 컴포넌트가 각자 다시 요청하고 있지는 않은가?
- idle 상태가 사용자에게 의미 있는 화면 상태인가?
