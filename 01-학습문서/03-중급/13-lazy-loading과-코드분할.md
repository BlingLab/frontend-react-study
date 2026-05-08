# Lazy loading과 코드 분할

React 앱은 처음 로딩할 때 모든 화면 코드를 한 번에 받을 필요가 없습니다. 처음에는 필요한 코드만 받고, 나중에 필요한 화면은 그때 불러오도록 나눌 수 있습니다.

React에서는 `lazy`와 `Suspense`를 사용해 컴포넌트 코드를 지연 로딩할 수 있습니다.

## 기본 사용법

```tsx
import { lazy, Suspense, useState } from "react";

const SettingsPanel = lazy(() => import("./SettingsPanel"));

function Page() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>설정 열기</button>
      {isOpen && (
        <Suspense fallback={<p>설정을 불러오는 중...</p>}>
          <SettingsPanel />
        </Suspense>
      )}
    </>
  );
}
```

`SettingsPanel` 코드는 처음 렌더링될 때 로딩됩니다. 로딩 중에는 가까운 `Suspense` fallback이 보입니다.

## lazy는 컴포넌트 밖에서 선언한다

```tsx
const SettingsPanel = lazy(() => import("./SettingsPanel"));

function Page() {
  return <SettingsPanel />;
}
```

아래처럼 컴포넌트 안에서 `lazy`를 선언하면 렌더링마다 새 컴포넌트 타입을 만들 수 있어 state reset 같은 문제가 생깁니다.

```tsx
function Page() {
  const SettingsPanel = lazy(() => import("./SettingsPanel"));

  return <SettingsPanel />;
}
```

lazy 컴포넌트는 module top level에 둡니다.

## 어떤 단위를 나눌까

코드 분할은 무조건 잘게 나누는 것이 아닙니다. 사용자가 처음 화면에서 필요로 하지 않는 비교적 큰 단위가 좋습니다.

- 라우트 단위 페이지
- 관리자 화면
- 차트/에디터/지도처럼 무거운 기능
- 잘 열리지 않는 modal
- markdown preview 같은 선택 기능

작은 버튼 하나까지 lazy로 나누면 네트워크 요청이 많아지고 구조가 복잡해질 수 있습니다.

## Suspense fallback은 가까운 곳에 둔다

fallback 위치가 너무 위에 있으면 작은 영역 로딩 때문에 전체 화면이 loading으로 바뀔 수 있습니다.

```tsx
function Dashboard() {
  return (
    <section>
      <Header />
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart />
      </Suspense>
      <ActivityList />
    </section>
  );
}
```

차트만 늦게 로딩된다면 차트 영역에만 fallback을 두는 편이 자연스럽습니다.

## 라우트 단위 lazy loading

라우터를 쓰는 앱에서는 page 컴포넌트를 lazy로 나누는 일이 많습니다.

```tsx
const HomePage = lazy(() => import("./pages/HomePage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}
```

라우트 전체에 fallback을 둘지, 각 route 영역에 둘지는 UX에 따라 결정합니다.

## 데이터 loading과 코드 loading을 구분하기

`lazy`는 컴포넌트 코드 로딩을 늦추는 기능입니다. API 데이터를 자동으로 가져오지는 않습니다.

```tsx
const Chart = lazy(() => import("./Chart"));
```

이 코드는 Chart 컴포넌트 파일을 늦게 받는다는 뜻입니다. Chart 안에서 필요한 데이터 요청은 별도로 설계해야 합니다.

## 에러 처리

네트워크 문제로 lazy import가 실패할 수 있습니다. Suspense는 로딩 fallback을 보여주지만 에러 fallback은 Error Boundary가 담당합니다.

```tsx
<ErrorBoundary fallback={<p>화면을 불러오지 못했습니다.</p>}>
  <Suspense fallback={<p>불러오는 중...</p>}>
    <SettingsPanel />
  </Suspense>
</ErrorBoundary>
```

Error Boundary는 고급 단계에서 더 자세히 다룹니다.

## 읽으면서 생각할 질문

- 이 코드는 첫 화면에서 반드시 필요한가?
- lazy로 나누는 단위가 너무 작지는 않은가?
- fallback이 전체 화면을 불필요하게 가리고 있지는 않은가?
- 코드 loading과 데이터 loading을 구분하고 있는가?
- lazy import 실패를 Error Boundary로 처리할 계획이 있는가?
