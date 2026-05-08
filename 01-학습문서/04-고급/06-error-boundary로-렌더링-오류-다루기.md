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
type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportError(error, info);
  }

  render() {
    if (this.state.hasError) {
      return <p>화면을 표시하지 못했습니다.</p>;
    }

    return this.props.children;
  }
}
```

실무에서는 `react-error-boundary` 같은 검증된 라이브러리를 사용하는 경우도 많습니다.

## 어디에 둘까

Error Boundary를 앱 최상단에만 두면 전체 앱이 fallback으로 바뀝니다. 기능 단위로 적절히 나누면 일부 화면만 실패 UI로 대체할 수 있습니다.

```tsx
function App() {
  return (
    <Layout>
      <ErrorBoundary>
        <Dashboard />
      </ErrorBoundary>
      <ErrorBoundary>
        <NotificationPanel />
      </ErrorBoundary>
    </Layout>
  );
}
```

경계는 "이 영역이 실패해도 다른 영역은 계속 쓸 수 있어야 하는가"를 기준으로 잡습니다.

## Suspense와 함께 쓰기

`Suspense`는 loading fallback을 담당하고, Error Boundary는 error fallback을 담당합니다.

```tsx
<ErrorBoundary>
  <Suspense fallback={<p>불러오는 중...</p>}>
    <LazySettingsPage />
  </Suspense>
</ErrorBoundary>
```

lazy 컴포넌트 코드 로딩이 늦으면 Suspense fallback이 보이고, import 자체가 실패하면 Error Boundary fallback이 보입니다.

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

## fallback UI에 필요한 것

- 무엇이 실패했는지
- 다시 시도할 수 있는지
- 사용자가 다른 화면으로 이동할 수 있는지
- 오류를 로깅했는지

단순히 "오류 발생"만 보여주면 사용자는 다음 행동을 알 수 없습니다.

## 읽으면서 생각할 질문

- 이 오류는 렌더링 오류인가, 비동기 요청 실패인가?
- Error Boundary 범위가 너무 넓거나 좁지 않은가?
- Suspense fallback과 Error Boundary fallback의 역할을 구분했는가?
- event handler 오류를 Error Boundary가 잡는다고 착각하고 있지는 않은가?
- fallback UI에서 복구 행동을 제공하는가?
