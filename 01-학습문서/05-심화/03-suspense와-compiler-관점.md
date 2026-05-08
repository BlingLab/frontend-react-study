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

## React Compiler와의 관계

React Compiler는 수동 memoization 필요를 줄이는 방향의 도구입니다. Suspense나 Error Boundary 위치, useTransition 사용 판단은 Compiler가 대신 설계하지 않습니다.

Compiler 전략의 자세한 내용은 `07-compiler-시대의-최적화-전략.md`에서 다룹니다.

## 읽으면서 생각할 질문

- 이 화면은 어느 단위로 loading fallback을 보여줘야 하는가?
- 오류 fallback과 loading fallback이 같은 단위인가?
- lazy loading이 필요한 화면 단위가 있는가?
- 다시 시도 버튼이 실제로 데이터를 다시 요청하는가?
- 페이지 전환이 느릴 때 `useTransition`으로 개선할 수 있는가?
