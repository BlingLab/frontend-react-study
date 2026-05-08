# Server state와 Query cache

Server state는 서버에서 온 데이터입니다. React 컴포넌트 안의 local state와 비슷해 보이지만 성격이 다릅니다.

local UI state는 현재 브라우저 화면의 선택이나 입력입니다. server state는 원본이 서버에 있고, 클라이언트는 그 사본을 잠시 들고 있습니다. 그래서 캐시, stale 여부, 재요청, 중복 요청, 실패 재시도 같은 문제가 따라옵니다.

## local state와 server state의 차이

| 구분 | Local UI state | Server state |
| --- | --- | --- |
| 원본 위치 | 브라우저 현재 화면 | 서버 |
| 예 | input 값, 탭 선택, 모달 열림 | 게시글 목록, 사용자 상세, 검색 결과 |
| 주요 문제 | 어디에 둘지, 어떻게 업데이트할지 | 캐시, stale, 재검증, 요청 중복 |
| 기본 도구 | `useState`, `useReducer` | fetch + state, TanStack Query/SWR 등 |
| 실패 처리 | 대체로 없음 | error, retry, fallback UI 필요 |

처음에는 `useEffect`와 `useState`로 fetch를 직접 다루는 것이 좋습니다. 그래야 loading/error/empty/success 상태를 직접 이해할 수 있습니다. 하지만 앱이 커지면 직접 관리해야 할 규칙이 빠르게 늘어납니다.

## 직접 fetch가 충분한 경우

아래 조건이면 local state로 요청 상태를 직접 관리해도 괜찮습니다.

- 한 컴포넌트에서만 쓰는 데이터다.
- 캐시가 크게 중요하지 않다.
- 재시도나 background refetch가 필요 없다.
- 같은 요청을 여러 화면에서 반복하지 않는다.
- pagination, infinite scroll, optimistic update가 없다.

```tsx
type RequestState<T> =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: T };
```

이 방식은 학습과 작은 기능에 적합합니다.

## query cache 도구를 고려할 때

TanStack Query나 SWR 같은 도구는 server state를 cache로 관리합니다. 아래 요구가 생기면 도구를 검토합니다.

- 같은 데이터를 여러 컴포넌트에서 읽는다.
- 같은 요청이 중복 실행된다.
- 탭을 다시 열었을 때 이전 데이터를 잠시 보여주고 싶다.
- stale time, refetch on focus 같은 정책이 필요하다.
- mutation 후 관련 데이터를 다시 가져와야 한다.
- optimistic update와 실패 복구가 필요하다.

도구를 쓰는 이유는 "fetch 코드를 짧게 만들기"가 아니라 server state의 성격을 명시적으로 다루기 위해서입니다.

## TanStack Query 기본 사용

```tsx
// 1. QueryClient 설정
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1분 동안 신선한 데이터로 취급
      retry: 1,             // 실패 시 1회 재시도
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  );
}
```

```tsx
// 2. useQuery로 데이터 읽기
import { useQuery } from "@tanstack/react-query";

function PostList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchPosts(),
  });

  if (isLoading) return <p>불러오는 중...</p>;
  if (isError) return <p>오류: {error.message}</p>;
  if (!data?.length) return <p>게시글이 없습니다.</p>;

  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

## useQuery 상태 구분

TanStack Query가 제공하는 상태를 파악해두면 다양한 UI를 만들 수 있습니다.

| 상태 | 의미 |
| --- | --- |
| `isLoading` | 데이터가 없고 fetch 중 (첫 로드) |
| `isFetching` | fetch 중 (background refetch 포함) |
| `isSuccess` | 데이터 있음 |
| `isError` | 오류 발생 |
| `isStale` | 데이터가 staleTime을 지나 오래됨 |
| `isPaused` | 네트워크 오프라인으로 일시 중지 |

`isLoading`과 `isFetching`의 차이가 중요합니다. `isLoading`은 캐시가 없는 첫 로드일 때만 true입니다. `isFetching`은 background refetch 중에도 true입니다.

```tsx
function PostList() {
  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  return (
    <div>
      {/* 스피너는 백그라운드 refetch 중에도 작게 표시 */}
      {isFetching && <SmallSpinner />}

      {isLoading && <SkeletonList />}
      {isError && <ErrorMessage />}
      {data && <PostItems posts={data} />}
    </div>
  );
}
```

## query key 감각

query cache 도구는 보통 query key로 데이터를 구분합니다.

```tsx
useQuery({
  queryKey: ["posts", { keyword, page }],
  queryFn: () => fetchPosts({ keyword, page }),
});
```

query key는 "이 데이터가 무엇으로 결정되는가"를 표현합니다. 검색어와 페이지가 바뀌면 다른 데이터이므로 key에 들어가야 합니다.

```tsx
// 좋지 않음: keyword가 바뀌어도 같은 cache로 취급될 수 있음
queryKey: ["posts"];

// 올바름: 조건이 달라지면 다른 cache 항목
queryKey: ["posts", { keyword, page }];
queryKey: ["user", userId];
queryKey: ["user", userId, "posts"];
```

## 의존 쿼리 (Dependent Queries)

이전 요청의 결과에 의존하는 경우 `enabled` 옵션을 사용합니다.

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data: user } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  // user가 있어야만 posts 요청
  const { data: posts } = useQuery({
    queryKey: ["user", userId, "posts"],
    queryFn: () => fetchUserPosts(userId),
    enabled: !!user, // user가 없으면 요청 안 함
  });

  return (
    <div>
      {user && <UserCard user={user} />}
      {posts && <PostList posts={posts} />}
    </div>
  );
}
```

## server state와 UI state를 섞지 않기

서버에서 온 posts와 사용자가 선택한 tab은 성격이 다릅니다.

```tsx
const [selectedTab, setSelectedTab] = useState("all");
const postsQuery = useQuery({
  queryKey: ["posts"],
  queryFn: fetchPosts,
});
```

tab이 서버 요청 조건이라면 query key에 포함합니다.

```tsx
const [statusFilter, setStatusFilter] = useState("open");

const postsQuery = useQuery({
  queryKey: ["posts", { statusFilter }],
  queryFn: () => fetchPosts({ statusFilter }),
});
```

UI state와 server state를 구분하면 state 관리 도구를 과하게 쓰지 않아도 됩니다.

## mutation 후에는 무엇을 할까

서버 데이터를 바꾸는 요청을 mutation이라고 부릅니다. 예를 들어 게시글 추가, 삭제, 좋아요 저장입니다.

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPost: { title: string; body: string }) =>
      createPost(newPost),

    onSuccess: () => {
      // 관련 query를 stale로 만들고 background에서 다시 fetch
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

function NewPostForm() {
  const createPost = useCreatePost();

  function handleSubmit(data: { title: string; body: string }) {
    createPost.mutate(data);
  }

  return (
    <form onSubmit={...}>
      {createPost.isError && <p>게시글 작성에 실패했습니다.</p>}
      <button disabled={createPost.isPending}>
        {createPost.isPending ? "저장 중..." : "게시"}
      </button>
    </form>
  );
}
```

mutation 후에는 보통 세 가지 선택지가 있습니다.

| 방법 | 설명 |
| --- | --- |
| invalidate | 관련 query를 stale로 만들고 다시 가져온다. |
| cache update | 응답 결과로 cache를 직접 갱신한다. |
| optimistic update | 성공을 가정해 먼저 cache를 바꾸고 실패하면 되돌린다. |

처음에는 invalidate가 단순합니다. 성능이나 UX 요구가 커지면 cache update나 optimistic update를 검토합니다.

## 중급 fetching 문서와의 연결

중급의 [Fetching 상태 나누기](../03-중급/02-fetching-상태-나누기.md)는 server state 도구를 쓰기 전의 기본기입니다. 도구를 써도 UI에서는 여전히 아래 상태를 구분해야 합니다.

- loading
- error
- empty
- success
- refetching
- stale data

query cache 도구가 `isLoading`, `isError`, `data` 같은 값을 제공해도, empty UI와 retry UI를 어떻게 보여줄지는 컴포넌트 설계의 문제입니다.

## 읽으면서 생각할 질문

- 이 데이터의 원본은 브라우저인가, 서버인가?
- 같은 데이터를 여러 곳에서 다시 요청하고 있지는 않은가?
- 검색어, page, filter가 query key에 반영되어 있는가?
- mutation 후 invalidate, cache update, optimistic update 중 무엇이 자연스러운가?
- query cache 도구를 도입할 만큼 server state 요구가 복잡해졌는가?
- `isLoading`과 `isFetching`의 차이를 UI에서 구분해서 다루고 있는가?
