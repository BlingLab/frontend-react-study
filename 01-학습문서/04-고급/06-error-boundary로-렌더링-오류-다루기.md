# Error Boundary로 렌더링 오류 다루기

Error Boundary는 자식 컴포넌트 렌더링 중 발생한 오류를 잡아서 앱 전체가 빈 화면이 되는 것을 막는 React 패턴입니다.

네트워크 실패 같은 비동기 오류는 request state로 다루고, 렌더링 중 throw된 오류는 Error Boundary로 격리합니다.

## Error Boundary가 잡는 것

Error Boundary는 아래 오류를 잡을 수 있습니다.

- 자식 컴포넌트 렌더링 중 throw된 오류
- lifecycle 중 발생한 오류
- lazy import 실패처럼 렌더링 과정에서 드러나는 오류

잡지 못하는 것도 있습니다.

- event handler 내부 오류
- 비동기 callback 내부 오류
- server-side rendering 중 오류
- Error Boundary 자신이 던진 오류

event handler 오류는 직접 try/catch로 처리하거나 상태로 바꿔 보여줘야 합니다.

## 기본 구현

현재 React에서 Error Boundary는 class component로 구현합니다.

```tsx
import { Component, ErrorInfo, PropsWithChildren, ReactNode } from "react";

type Props = PropsWithChildren<{
  fallback?: ReactNode;
}>;

type State = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 오류 모니터링 서비스에 보내기
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div role="alert">
            <p>화면을 표시하지 못했습니다.</p>
            <button onClick={() => this.setState({ hasError: false, error: null })}>
              다시 시도
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

실무에서는 `react-error-boundary` 같은 검증된 라이브러리를 사용하는 경우도 많습니다.

## react-error-boundary 사용

직접 class component를 유지하는 대신 `react-error-boundary` 라이브러리를 쓰면 함수형으로 fallback UI를 작성할 수 있습니다.

```bash
npm install react-error-boundary
```

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
      <p>오류가 발생했습니다: {error.message}</p>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Dashboard />
    </ErrorBoundary>
  );
}
```

`resetErrorBoundary`를 호출하면 Error Boundary state가 초기화되어 자식을 다시 렌더링합니다.

## 어디에 둘까

Error Boundary를 앱 최상단에만 두면 전체 앱이 fallback으로 바뀝니다. 기능 단위로 적절히 나누면 일부 화면만 실패 UI로 대체할 수 있습니다.

```tsx
function App() {
  return (
    <Layout>
      <ErrorBoundary FallbackComponent={DashboardError}>
        <Dashboard />
      </ErrorBoundary>
      <ErrorBoundary FallbackComponent={NotificationError}>
        <NotificationPanel />
      </ErrorBoundary>
    </Layout>
  );
}
```

경계는 "이 영역이 실패해도 다른 영역은 계속 쓸 수 있어야 하는가"를 기준으로 잡습니다.

**경계 설정 가이드:**

| 영역 | Error Boundary 전략 |
| --- | --- |
| 앱 최상단 | 반드시 두기 (최후 방어선) |
| 라우트별 페이지 | 두기 권장 (한 페이지 실패가 다른 페이지에 영향 없게) |
| 독립적인 위젯 | 두기 권장 (대시보드의 차트, 피드 등) |
| 데이터 표시 영역 | 선택적 (리스트, 카드 등 실패해도 다른 것이 보여야 하면) |
| 개별 아이템 | 일반적으로 불필요 |

## Suspense와 함께 쓰기

`Suspense`는 loading fallback을 담당하고, Error Boundary는 error fallback을 담당합니다.

```tsx
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Suspense fallback={<p>불러오는 중...</p>}>
    <LazySettingsPage />
  </Suspense>
</ErrorBoundary>
```

lazy 컴포넌트 코드 로딩이 늦으면 Suspense fallback이 보이고, import 자체가 실패하면 Error Boundary fallback이 보입니다.

**순서가 중요합니다**: Error Boundary가 Suspense 바깥에 있어야 Suspense 안에서 발생한 오류도 잡을 수 있습니다.

## key로 Error Boundary 리셋하기

라우트가 바뀌면 Error Boundary를 자동으로 리셋하고 싶을 때 `key`를 사용합니다.

```tsx
function App() {
  const { pathname } = useLocation();

  return (
    // pathname이 바뀌면 Error Boundary가 새로 마운트됨 → 오류 상태 초기화
    <ErrorBoundary key={pathname} FallbackComponent={ErrorFallback}>
      <PageContent />
    </ErrorBoundary>
  );
}
```

`react-error-boundary`에서는 `resetKeys` prop으로 같은 효과를 얻을 수 있습니다.

```tsx
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  resetKeys={[pathname]} // pathname이 바뀌면 자동 리셋
>
  <PageContent />
</ErrorBoundary>
```

## event handler 오류는 따로 처리한다

```tsx
function SaveButton() {
  const [errorMessage, setErrorMessage] = useState("");

  async function handleClick() {
    try {
      await save();
    } catch {
      setErrorMessage("저장에 실패했습니다.");
    }
  }

  return (
    <>
      <button onClick={handleClick}>저장</button>
      {errorMessage && <p role="alert">{errorMessage}</p>}
    </>
  );
}
```

이런 오류는 Error Boundary가 아니라 비동기 UI 상태로 다룹니다.

## 오류 로깅

`componentDidCatch`에서 오류 모니터링 서비스로 보냅니다.

```tsx
componentDidCatch(error: Error, info: ErrorInfo) {
  // Sentry 예시
  Sentry.captureException(error, {
    contexts: {
      react: {
        componentStack: info.componentStack,
      },
    },
  });
}
```

`react-error-boundary`의 `onError` prop으로도 처리할 수 있습니다.

```tsx
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error, info) => {
    Sentry.captureException(error, { extra: info });
  }}
>
  <Dashboard />
</ErrorBoundary>
```

## fallback UI에 필요한 것

- 무엇이 실패했는지
- 다시 시도할 수 있는지
- 사용자가 다른 화면으로 이동할 수 있는지
- 오류를 로깅했는지

단순히 "오류 발생"만 보여주면 사용자는 다음 행동을 알 수 없습니다.

```tsx
function PageErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" style={{ padding: "2rem", textAlign: "center" }}>
      <h2>이 페이지를 표시할 수 없습니다</h2>
      <p>{error.message}</p>
      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
        <button onClick={resetErrorBoundary}>다시 시도</button>
        <a href="/">홈으로 돌아가기</a>
      </div>
    </div>
  );
}
```

## 읽으면서 생각할 질문

- 이 오류는 렌더링 오류인가, 비동기 요청 실패인가?
- Error Boundary 범위가 너무 넓거나 좁지 않은가?
- Suspense fallback과 Error Boundary fallback의 역할을 구분했는가?
- event handler 오류를 Error Boundary가 잡는다고 착각하고 있지는 않은가?
- fallback UI에서 복구 행동을 제공하는가?
- 라우트 전환 시 오류 상태가 이전 페이지에서 넘어오지는 않는가?
- 오류가 모니터링 서비스로 전송되는가?
