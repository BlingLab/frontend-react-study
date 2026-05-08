# useSyncExternalStore와 외부 store

`useSyncExternalStore`는 React 바깥에 있는 store나 브라우저 API 값을 React 컴포넌트와 안전하게 연결하기 위한 Hook입니다.

대부분의 앱 코드는 `useState`, `useReducer`, `useContext`로 충분합니다. `useSyncExternalStore`는 기존 non-React store, 브라우저 API, 상태 관리 라이브러리 내부 구현처럼 React 밖에서 값이 바뀌는 시스템과 연결할 때 사용합니다.

## 기본 구조

```tsx
const value = useSyncExternalStore(subscribe, getSnapshot);
```

필요한 함수는 두 개입니다.

- `subscribe`: store 변경을 구독하고 unsubscribe 함수를 반환합니다.
- `getSnapshot`: 현재 store 값을 읽어 옵니다.

## 예제: online 상태 구독

브라우저의 `navigator.onLine`은 React state가 아닙니다. 값은 브라우저에서 바뀌고, `online`, `offline` 이벤트로 알 수 있습니다.

```tsx
function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);

  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function useOnlineStatus() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
```

컴포넌트는 custom Hook만 사용합니다.

```tsx
function NetworkBadge() {
  const isOnline = useOnlineStatus();

  return <span>{isOnline ? "온라인" : "오프라인"}</span>;
}
```

## Effect와 state로 직접 만들 수도 있지 않나

가능합니다.

```tsx
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    function update() {
      setIsOnline(navigator.onLine);
    }

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return isOnline;
}
```

간단한 브라우저 API는 이 방식도 학습하기 좋습니다. 하지만 외부 store와 React 렌더링 일관성을 맞춰야 하는 경우 `useSyncExternalStore`가 더 명확한 계약을 제공합니다.

## 외부 store 예시

```tsx
type Listener = () => void;

const listeners = new Set<Listener>();
let count = 0;

export const counterStore = {
  increment() {
    count += 1;
    listeners.forEach((listener) => listener());
  },
  getSnapshot() {
    return count;
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
```

React 컴포넌트에서 읽습니다.

```tsx
function Counter() {
  const count = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot,
  );

  return (
    <button onClick={() => counterStore.increment()}>
      {count}
    </button>
  );
}
```

## getSnapshot은 안정적이어야 한다

`getSnapshot`은 store가 바뀌지 않았다면 같은 값을 반환해야 합니다. 매번 새 객체를 만들면 React는 값이 바뀌었다고 볼 수 있습니다.

```tsx
// 좋지 않음
function getSnapshot() {
  return { count };
}
```

객체가 필요하다면 store 내부에서 snapshot을 캐시하거나 불변 업데이트 규칙을 명확히 둡니다.

## 언제 직접 쓰지 않을까

- 단순 컴포넌트 state면 `useState`를 씁니다.
- 가까운 트리 공유면 `Context`를 먼저 봅니다.
- 서버 데이터 캐시라면 server state 도구를 검토합니다.
- 이미 사용하는 상태 관리 라이브러리가 있다면 라이브러리 Hook을 씁니다.

## 읽으면서 생각할 질문

- 이 값이 React 바깥에서 바뀌는가?
- subscribe와 getSnapshot 계약을 명확히 만들 수 있는가?
- getSnapshot이 store가 안 바뀌었는데 새 객체를 반환하지 않는가?
- custom Hook으로 감싸서 컴포넌트가 외부 store 세부사항을 몰라도 되는가?
- React state로 충분한 문제를 과하게 풀고 있지는 않은가?
