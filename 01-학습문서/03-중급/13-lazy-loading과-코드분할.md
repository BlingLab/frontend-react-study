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

`SettingsPanel` 코드는 처음 렌더링될 때 로딩됩니다. 로딩 중에는 가장 가까운 `Suspense` fallback이 보입니다.

## lazy는 컴포넌트 밖에서 선언한다

```tsx
// 올바름 — 파일 최상단 (컴포넌트 외부)
const SettingsPanel = lazy(() => import("./SettingsPanel"));

function Page() {
  return <SettingsPanel />;
}
```

아래처럼 컴포넌트 안에서 `lazy`를 선언하면 렌더링마다 새 컴포넌트 타입을 만들 수 있어 state reset 같은 문제가 생깁니다.

```tsx
// 좋지 않음 — 렌더링마다 새 lazy 호출
function Page() {
  const SettingsPanel = lazy(() => import("./SettingsPanel"));
  return <SettingsPanel />;
}
```

lazy 컴포넌트는 모듈 최상단에 둡니다.

## lazy가 기대하는 모듈 형식

`lazy`는 default export를 사용합니다.

```tsx
// SettingsPanel.tsx
export default function SettingsPanel() {
  return <div>설정</div>;
}
```

named export만 있는 모듈은 별도 래퍼 파일이나 dynamic import에서 감싸는 방식이 필요합니다.

```tsx
// named export를 default로 감싸는 방법
const SettingsPanel = lazy(() =>
  import("./SettingsPanel").then((module) => ({
    default: module.SettingsPanel,
  })),
);
```

## 어떤 단위를 나눌까

코드 분할은 무조건 잘게 나누는 것이 아닙니다. 사용자가 처음 화면에서 필요로 하지 않는 비교적 큰 단위가 좋습니다.

**나누기 좋은 단위:**
- 라우트 단위 페이지
- 관리자 화면
- 차트/에디터/지도처럼 무거운 기능
- 잘 열리지 않는 modal
- markdown preview 같은 선택 기능
- 무거운 third-party 라이브러리를 쓰는 컴포넌트

**나누지 않아도 되는 단위:**
- 버튼, 입력창 같은 작은 UI 컴포넌트
- 항상 화면에 보이는 상단 메뉴, 레이아웃
- 초기 화면에 반드시 필요한 콘텐츠

작은 버튼 하나까지 lazy로 나누면 네트워크 요청이 많아지고 구조가 복잡해질 수 있습니다.

## Suspense fallback은 가까운 곳에 둔다

fallback 위치가 너무 위에 있으면 작은 영역 로딩 때문에 전체 화면이 loading으로 바뀔 수 있습니다.

```tsx
// 전체 화면이 loading 상태로 바뀜
function Dashboard() {
  return (
    <Suspense fallback={<FullPageLoading />}>
      <section>
        <Header />
        <HeavyChart />  {/* 이 컴포넌트가 느릴 때 */}
        <ActivityList />
      </section>
    </Suspense>
  );
}

// 차트만 loading 상태
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
const PostsPage = lazy(() => import("./pages/PostsPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Suspense>
  );
}
```

라우트 전체에 fallback을 둘지, 각 route 영역에 둘지는 UX에 따라 결정합니다.

## 미리 불러오기 (Preload)

사용자가 링크에 hover할 때 해당 페이지 코드를 미리 받아두면 이동할 때 더 빠릅니다.

```tsx
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

// hover 시 미리 로드
function SettingsLink() {
  function handleMouseEnter() {
    // lazy import를 직접 호출해서 preload
    import("./pages/SettingsPage");
  }

  return (
    <Link to="/settings" onMouseEnter={handleMouseEnter}>
      설정
    </Link>
  );
}
```

이 방식은 lazy 선언과 별개로 동작합니다. `import()`를 먼저 호출해두면 나중에 실제 렌더링이 일어날 때 캐시된 결과를 사용합니다.

## 데이터 loading과 코드 loading을 구분하기

`lazy`는 컴포넌트 코드 로딩을 늦추는 기능입니다. API 데이터를 자동으로 가져오지는 않습니다.

```tsx
const Chart = lazy(() => import("./Chart"));
```

이 코드는 Chart 컴포넌트 파일을 늦게 받는다는 뜻입니다. Chart 안에서 필요한 데이터 요청은 별도로 설계해야 합니다.

## 에러 처리

네트워크 문제로 lazy import가 실패할 수 있습니다. Suspense는 로딩 fallback을 보여주지만 에러 fallback은 Error Boundary가 담당합니다.

```tsx
import { ErrorBoundary } from "react-error-boundary";

function AppRoutes() {
  return (
    <ErrorBoundary fallback={<p>화면을 불러오지 못했습니다. <button onClick={() => window.location.reload()}>새로고침</button></p>}>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
```

## 번들 분석

코드 분할의 효과를 확인하려면 번들 크기를 측정해야 합니다. Vite를 쓴다면 `rollup-plugin-visualizer`로 각 청크의 크기를 시각화할 수 있습니다.

```bash
# 번들 분석 실행
pnpm add -D rollup-plugin-visualizer
```

```tsx
// vite.config.ts
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [visualizer({ open: true })],
});
```

분석 결과에서 어떤 라이브러리가 큰지, 어떤 페이지에서 불필요한 코드를 포함하는지 확인합니다.

## 읽으면서 생각할 질문

- 이 코드는 첫 화면에서 반드시 필요한가?
- lazy로 나누는 단위가 너무 작지는 않은가?
- fallback이 전체 화면을 불필요하게 가리고 있지는 않은가?
- 코드 loading과 데이터 loading을 구분하고 있는가?
- lazy import 실패를 Error Boundary로 처리할 계획이 있는가?
- lazy 컴포넌트를 컴포넌트 외부에서 선언하고 있는가?
- 자주 접근하는 페이지는 preload로 미리 받아두면 어떨까?
