# State를 분류하고 배치하기

앱이 커지면 "이 값을 어디에 두어야 하나?"라는 질문이 더 자주 생깁니다. 도구를 먼저 고르기보다 state의 성격을 먼저 분류하는 편이 낫습니다.

## 네 가지 분류

### 1. Local UI State

한 컴포넌트나 가까운 영역에서만 쓰는 값입니다. 다른 컴포넌트는 몰라도 됩니다.

```tsx
// 모달 열림/닫힘
const [isOpen, setIsOpen] = useState(false);

// form 입력값
const [title, setTitle] = useState("");

// 탭 선택
const [activeTab, setActiveTab] = useState("overview");

// 툴팁 hover 상태
const [isHovered, setIsHovered] = useState(false);
```

이런 값은 해당 컴포넌트 안에 두는 것이 가장 단순합니다. 불필요하게 위로 올리면 무관한 컴포넌트가 리렌더링됩니다.

**도구**: `useState`, `useReducer`

### 2. Shared Client State

여러 컴포넌트가 함께 읽고 바꿔야 하는 앱 내부 상태입니다. 서버 데이터와는 다릅니다.

```tsx
// 로그인 사용자 정보
const [currentUser, setCurrentUser] = useState<User | null>(null);

// 앱 테마
const [theme, setTheme] = useState<"light" | "dark">("light");

// 장바구니
const [cartItems, setCartItems] = useState<CartItem[]>([]);

// 알림 목록 (서버 데이터가 아닌, 클라이언트가 로컬로 쌓는 알림)
const [notifications, dispatch] = useReducer(notificationReducer, []);
```

이런 값은 공통 부모로 올리거나, 넓은 범위에서 쓰인다면 Context로 제공합니다.

**도구**: `useState` + state 끌어올리기, `useReducer` + Context, Zustand 같은 전역 state 라이브러리

### 3. Server State

서버에서 가져온 데이터입니다. 앱 코드가 source of truth가 아닙니다. 캐시, 재요청, 만료, 중복 방지 같은 문제가 따라옵니다.

```tsx
// 게시글 목록
const [posts, setPosts] = useState<Post[]>([]);

// 사용자 프로필
const [profile, setProfile] = useState<UserProfile | null>(null);

// 검색 결과
const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
```

직접 `useState` + `useEffect`로 관리해도 되지만, 아래 요구가 생기면 server state 도구가 낫습니다.

- 같은 데이터를 여러 화면에서 공유해야 한다
- stale 데이터 자동 갱신이 필요하다
- 페이지네이션, 무한 스크롤, optimistic update가 필요하다
- 요청 중복 제거가 필요하다

**도구**: React Query(TanStack Query), SWR, RTK Query

### 4. URL State

현재 URL(경로, 쿼리 파라미터, 해시)에 담긴 상태입니다. 브라우저 뒤로가기, 링크 공유, 북마크가 필요한 값은 URL에 둡니다.

```tsx
// 검색어 → URL에 있어야 링크 공유 가능
// /search?q=react&page=2

// 현재 탭 → URL에 있어야 새로고침 후에도 유지
// /settings?tab=notifications

// 모달 열림 → 뒤로가기로 닫을 수 있으면 URL
// /posts/123?preview=true
```

```tsx
// React Router v6
const [searchParams, setSearchParams] = useSearchParams();
const keyword = searchParams.get("q") ?? "";
const page = Number(searchParams.get("page") ?? "1");

function handleSearch(q: string) {
  setSearchParams({ q, page: "1" });
}
```

URL state는 local state처럼 쓰이지만, 새로고침이나 링크 공유 후에도 값이 살아있어야 할 때 사용합니다.

**도구**: `useSearchParams` (React Router), `useRouter` (Next.js)

## 분류 판단표

| 값 | 분류 | 이유 |
| --- | --- | --- |
| 모달 열림 여부 | Local UI | 그 컴포넌트만 앎 |
| 검색 input 값 | Local UI | URL에 없으면 그 화면만 앎 |
| 선택된 탭 | Local UI 또는 URL | 새로고침 후 유지가 필요하면 URL |
| 필터/페이지 | URL | 링크 공유, 뒤로가기가 자연스러워야 함 |
| 로그인 사용자 | Shared Client | 헤더, 설정, 게시글 작성 등 여럿이 읽음 |
| 장바구니 | Shared Client | 상품 목록, 헤더 뱃지, 결제 화면이 공유 |
| 게시글 목록 | Server State | 서버가 source of truth |
| 검색 결과 | Server State | 서버 응답에 의존 |

## 배치 원칙

**Local → 가장 가까운 컴포넌트**

state를 필요한 곳 가장 가까이 둡니다. 무조건 위로 올리는 것은 좋은 습관이 아닙니다.

```tsx
// 모달 버튼과 모달이 같은 컴포넌트 안에 있다면 그 안에 state를 둠
function HelpSection() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>도움말</button>
      {isOpen && <HelpModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
```

**Shared Client → 공통 부모 또는 Context**

두 컴포넌트가 같은 값을 필요로 한다면, 가장 가까운 공통 부모로 올립니다. 트리가 깊어지면 Context를 고려합니다.

```tsx
// 검색어를 input과 목록이 공유 → 공통 부모로 올리기
function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const visiblePosts = posts.filter((post) => post.title.includes(keyword));

  return (
    <>
      <SearchInput value={keyword} onChange={setKeyword} />
      <PostList posts={visiblePosts} />
    </>
  );
}
```

**Server State → Effect + useState 또는 server state 도구**

학습 단계에서는 `useEffect` + `useState`로 시작합니다. 요구가 복잡해지면 React Query 같은 도구를 추가합니다.

```tsx
// 직접 관리 (작은 기능, 학습)
function PostPage({ postId }: { postId: string }) {
  const [state, setState] = useState<RequestState>({ status: "loading" });

  useEffect(() => {
    let ignore = false;

    fetchPost(postId)
      .then((post) => {
        if (!ignore) setState({ status: "success", post });
      })
      .catch(() => {
        if (!ignore) setState({ status: "error", message: "불러오기 실패" });
      });

    return () => { ignore = true; };
  }, [postId]);
}

// React Query 사용 (여러 화면 공유, 캐싱 필요)
function PostPage({ postId }: { postId: string }) {
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchPost(postId),
  });
}
```

## 잘못 배치했을 때 나타나는 신호

**Local인데 너무 위에 있다면:**
- 무관한 컴포넌트가 state 변경에 다시 렌더링됩니다.
- 상위 컴포넌트에 props가 많이 쌓입니다.

**Shared인데 너무 아래에 있다면:**
- 형제 컴포넌트가 같은 값을 따로 들고 있어 동기화해야 합니다.
- 값이 어긋나는 버그가 생깁니다.

**Server state를 Client state처럼 다루면:**
- 서버 응답 후 수동으로 동기화해야 합니다.
- 여러 화면에서 같은 데이터를 각자 따로 요청합니다.
- stale 데이터를 계속 보여줄 수 있습니다.

**URL state를 local state로 다루면:**
- 새로고침하면 값이 초기화됩니다.
- 링크를 공유해도 같은 화면이 보이지 않습니다.
- 뒤로가기가 기대와 다르게 동작합니다.

## state 설계 순서

1. 이 값이 서버 데이터인가? → server state 도구 또는 Effect + useState
2. 새로고침/링크 공유/뒤로가기가 필요한가? → URL state
3. 한 컴포넌트에서만 쓰는가? → 그 컴포넌트 안 local state
4. 여러 컴포넌트가 공유하는가? → 공통 부모로 올리거나 Context
5. props drilling이 깊어지는가? → Context 또는 Composition 검토

순서가 중요합니다. 처음부터 전역 상태 도구로 가기보다 필요에 따라 단계적으로 범위를 넓힙니다.

## 파생 state는 state가 아니다

`useState`로 저장할 필요가 없는 값이 있습니다. 다른 state나 props에서 계산할 수 있는 값은 파생 state(derived state)입니다.

```tsx
// 나쁜 예: 파생 state를 useEffect로 동기화
const [todos, setTodos] = useState<Todo[]>([]);
const [completedCount, setCompletedCount] = useState(0);

useEffect(() => {
  setCompletedCount(todos.filter((t) => t.done).length);
}, [todos]);

// 좋은 예: 렌더링 중 직접 계산
const [todos, setTodos] = useState<Todo[]>([]);
const completedCount = todos.filter((t) => t.done).length;
```

파생 state를 따로 `useState`로 관리하면 source of truth가 두 개가 되어 어긋날 위험이 생깁니다.

## 읽으면서 생각할 질문

- 이 state는 local, shared client, server, URL 중 무엇인가?
- 서버 데이터와 UI 선택 상태를 같은 state로 섞고 있지는 않은가?
- state를 올리면 어떤 컴포넌트들이 영향을 받는가?
- 지금 local로 두기 충분한데 불필요하게 올리지는 않았는가?
- server state를 직접 관리하는 것이 지금 복잡도에 맞는가?
- 링크 공유나 뒤로가기가 필요한 값인데 local state에 두고 있지는 않은가?
- useState로 저장하고 있는 값이 사실 파생 state이지는 않은가?
