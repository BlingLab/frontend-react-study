# Suspense와 Error Boundary

Suspense는 "이 하위 트리가 아직 준비되지 않았을 때 무엇을 보여줄지"를 선언합니다. Error Boundary는 "이 하위 트리에서 렌더링 오류가 발생했을 때 무엇을 보여줄지"를 선언합니다.

두 개념은 항상 함께 설계됩니다. loading 상태와 error 상태는 한 쌍이기 때문입니다.

## Suspense는 loading boundary다

```tsx
<Suspense fallback={<ArticleSkeleton />}>
  <ArticleBody />
</Suspense>
```

fallback을 어디에 두느냐에 따라 사용자 경험이 달라집니다.

| boundary 위치 | 결과 |
| --- | --- |
| 앱 최상단 | 작은 지연에도 전체 화면이 loading으로 바뀔 수 있습니다. |
| 페이지 영역 | 페이지 이동 중 큰 단위 loading을 보여줍니다. |
| 카드/패널 영역 | 일부 영역만 skeleton으로 대체합니다. |

좋은 Suspense boundary는 사용자가 기다리는 단위와 비슷합니다.

## lazy loading과 Suspense

`lazy`는 컴포넌트 코드 로딩을 지연합니다. 처음 화면에 필요 없는 큰 페이지, 차트, 에디터, 지도 같은 코드는 lazy loading 후보입니다.

```tsx
const AdminPage = lazy(() => import("./AdminPage"));
const ChartPanel = lazy(() => import("./ChartPanel"));

function App() {
  return (
    <Suspense fallback={<p>불러오는 중...</p>}>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Suspense>
  );
}
```

반대로 작은 버튼 컴포넌트를 lazy로 나누면 복잡도만 커질 수 있습니다.

## Suspense가 반응하는 로딩

Suspense는 모든 비동기 작업을 자동으로 감지하지 않습니다. Effect 안에서 `fetch`를 시작하고 local state로 loading을 관리하는 코드는 Suspense fallback을 트리거하지 않습니다.

Suspense boundary를 활성화하는 대표 사례는 다음입니다.

| 사례 | 설명 |
| --- | --- |
| `lazy` | 컴포넌트 코드 청크가 아직 로딩되지 않았을 때 |
| Suspense 지원 데이터 소스 | Relay, Next.js 같은 프레임워크나 라우터가 제공하는 데이터 로딩 |
| cached Promise를 `use`로 읽기 | 프레임워크/캐시 정책과 함께 사용할 때 |

```tsx
function PostList() {
  const [state, setState] = useState<RequestState<Post[]>>({ status: "loading" });

  useEffect(() => {
    fetchPosts().then((posts) => {
      setState({ status: "success", data: posts });
    });
  }, []);

  // 이 loading은 Suspense fallback이 아니라 컴포넌트 내부 UI로 처리합니다.
  if (state.status === "loading") return <PostListSkeleton />;
}
```

학습 단계에서는 이 차이가 중요합니다. 모든 loading을 Suspense로 바꾸려 하지 말고, 직접 요청 상태를 다루는 방식과 Suspense boundary를 쓰는 방식을 구분합니다.

## Error Boundary

Error Boundary는 하위 트리에서 렌더링 오류가 발생했을 때 fallback UI를 보여주는 컴포넌트입니다. 현재 React에서는 class component로만 만들 수 있어서, 실전에서는 `react-error-boundary` 라이브러리를 주로 씁니다.

```tsx
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert">
      <p>문제가 발생했습니다.</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SettingsPage />
    </ErrorBoundary>
  );
}
```

Error Boundary가 잡는 것과 잡지 않는 것을 구분합니다.

| 잡는 것 | 잡지 않는 것 |
| --- | --- |
| 렌더링 중 오류 | 이벤트 핸들러 오류 |
| 생명주기 메서드 오류 | 비동기 코드 오류 |
| 하위 컴포넌트 오류 | SSR 오류 |

이벤트 핸들러 오류는 try/catch로 잡고, Error Boundary에는 렌더링 오류를 맡깁니다.

## Suspense와 Error Boundary 조합

실전에서는 두 가지를 함께 둡니다.

```tsx
<ErrorBoundary FallbackComponent={ErrorFallback} onReset={refetch}>
  <Suspense fallback={<SettingsSkeleton />}>
    <SettingsPage />
  </Suspense>
</ErrorBoundary>
```

- 데이터 로딩 중: Suspense fallback이 보입니다.
- 렌더링 오류 발생: Error Boundary fallback이 보입니다.
- 다시 시도: `onReset`으로 데이터를 다시 요청합니다.

## 이미 보인 UI가 fallback으로 사라지는 문제

Suspense boundary가 이미 실제 콘텐츠를 보여주고 있는데, 업데이트 중 다시 suspend되면 fallback으로 되돌아갈 수 있습니다. 사용자는 보던 화면이 갑자기 스피너로 바뀌었다고 느낍니다.

이때는 업데이트를 transition으로 표시하거나, 값 자체를 deferred로 내려보내서 이전 콘텐츠를 잠시 유지할 수 있습니다.

```tsx
function SearchPage() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <>
      <input value={query} onChange={(event) => setQuery(event.target.value)} />
      <Suspense fallback={<SearchSkeleton />}>
        <div style={{ opacity: isStale ? 0.5 : 1 }}>
          <SearchResults query={deferredQuery} />
        </div>
      </Suspense>
    </>
  );
}
```

여기서 input은 즉시 바뀌고, 결과 목록은 이전 query 결과를 잠시 유지합니다. 사용자는 fallback으로 화면이 사라지는 대신 "이전 결과가 낡았다"는 시각적 힌트를 봅니다.

## useTransition으로 느린 화면 전환 다루기

`useTransition`은 state 업데이트를 긴급하지 않은 것으로 표시합니다. 입력처럼 즉각 반응해야 하는 것과, 목록 업데이트처럼 조금 늦어도 괜찮은 것을 분리할 수 있습니다.

```tsx
const [isPending, startTransition] = useTransition();

function handleTabClick(tab: Tab) {
  startTransition(() => {
    setActiveTab(tab);
  });
}
```

`isPending`이 `true`인 동안 버튼을 흐리게 보여줄 수 있습니다.

```tsx
<button
  onClick={() => handleTabClick("settings")}
  style={{ opacity: isPending ? 0.6 : 1 }}
>
  설정
</button>
```

`startTransition` 안의 state 업데이트는 현재 렌더링을 막지 않습니다. 사용자가 다른 탭을 클릭해도 이전 화면이 잠시 유지되고, 준비되면 전환됩니다.

## Suspense boundary 위치 설계

어디에 Suspense를 둘지는 "사용자가 무엇을 기다리는가"를 기준으로 정합니다.

```tsx
function DashboardPage() {
  return (
    <div>
      <Suspense fallback={<UserProfileSkeleton />}>
        <UserProfile />
      </Suspense>

      <Suspense fallback={<ActivityListSkeleton />}>
        <ActivityList />
      </Suspense>
    </div>
  );
}
```

프로필과 활동 목록을 별도로 기다리면 하나가 느려도 다른 쪽은 바로 보입니다. 두 컴포넌트를 하나의 Suspense로 묶으면 둘 다 준비될 때까지 skeleton이 보입니다.

## 함께 드러낼지, 따로 드러낼지

Suspense boundary는 loading 단위이면서 reveal 단위입니다.

| 상황 | boundary 전략 |
| --- | --- |
| 프로필과 활동 목록이 독립적 | 각각 Suspense로 감쌉니다. |
| 가격과 결제 버튼이 함께 의미를 가짐 | 같은 Suspense로 묶습니다. |
| 페이지 shell은 항상 유지해야 함 | shell 밖이 아니라 내부 영역에 둡니다. |
| 새로 들어온 섹션만 늦게 보이면 됨 | nested Suspense를 씁니다. |

너무 크게 묶으면 작은 지연에도 넓은 영역이 loading으로 바뀝니다. 너무 잘게 나누면 skeleton이 여러 곳에서 따로 깜빡여 화면이 산만해질 수 있습니다.

## reset 기준

라우트나 주요 resource가 바뀌면 기존 Suspense/Error Boundary 상태를 초기화하고 싶을 수 있습니다. 이때 `key`를 사용합니다.

```tsx
function ArticleRoute({ articleId }: { articleId: string }) {
  return (
    <ErrorBoundary key={articleId} FallbackComponent={ArticleError}>
      <Suspense fallback={<ArticleSkeleton />}>
        <ArticlePage articleId={articleId} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

`articleId`가 바뀌면 boundary가 새로 마운트되므로 이전 오류 상태나 pending 상태가 다음 글로 새어 들어가지 않습니다.

## fallback UI 기준

fallback은 가볍고, 현재 레이아웃을 크게 흔들지 않아야 합니다.

| 좋은 fallback | 피할 fallback |
| --- | --- |
| 실제 콘텐츠 크기와 비슷한 skeleton | 전체 화면을 덮는 spinner |
| 영역 가까이에 있는 작은 pending 표시 | 사용자가 보던 화면을 모두 숨기는 loading |
| 접근 가능한 loading text | 아무 텍스트 없는 장식 spinner |
| layout shift가 적은 placeholder | 높이가 매번 달라지는 임시 UI |

## React Compiler와의 관계

React Compiler는 수동 memoization 필요를 줄이는 방향의 도구입니다. Suspense나 Error Boundary 위치, useTransition 사용 판단은 Compiler가 대신 설계하지 않습니다.

Compiler 전략의 자세한 내용은 `07-compiler-시대의-최적화-전략.md`에서 다룹니다.

## 읽으면서 생각할 질문

- 이 화면은 어느 단위로 loading fallback을 보여줘야 하는가?
- 오류 fallback과 loading fallback이 같은 단위인가?
- lazy loading이 필요한 화면 단위가 있는가?
- 다시 시도 버튼이 실제로 데이터를 다시 요청하는가?
- 페이지 전환이 느릴 때 `useTransition`으로 개선할 수 있는가?
- Suspense가 실제로 반응하는 데이터 소스를 쓰고 있는가?
- 이미 보인 UI가 fallback으로 갑자기 사라지는 문제는 없는가?
- boundary를 reset해야 하는 route/resource 기준이 있는가?
