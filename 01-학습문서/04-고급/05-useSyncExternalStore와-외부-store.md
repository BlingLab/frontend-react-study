# useSyncExternalStore와 외부 store

`useSyncExternalStore`는 React 바깥에 있는 store나 브라우저 API 값을 React 컴포넌트와 안전하게 연결하기 위한 Hook입니다.

대부분의 앱 코드는 `useState`, `useReducer`, `useContext`로 충분합니다. `useSyncExternalStore`는 기존 non-React store, 브라우저 API, 상태 관리 라이브러리 내부 구현처럼 React 밖에서 값이 바뀌는 시스템과 연결할 때 사용합니다.

## 기본 구조

```tsx
const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?);
```

필요한 함수는 두 개입니다.

- `subscribe`: store 변경을 구독하고 unsubscribe 함수를 반환합니다.
- `getSnapshot`: 현재 store 값을 읽어 옵니다.
- `getServerSnapshot` (선택): SSR에서 사용할 초기 값을 반환합니다.

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

핵심 차이는 **tearing 방지**입니다. React 18의 동시성 렌더링에서 컴포넌트들이 동시에 렌더링될 때, Effect 기반 구현은 서로 다른 snapshot을 볼 수 있습니다. `useSyncExternalStore`는 모든 컴포넌트가 같은 store snapshot을 사용하도록 보장합니다.

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

## selector가 필요할 때

외부 store 전체가 큰 객체라면 컴포넌트가 필요한 일부 값만 읽고 싶을 수 있습니다.

```tsx
type StoreState = {
  user: User | null;
  unreadCount: number;
  theme: "light" | "dark";
};

let state: StoreState = {
  user: null,
  unreadCount: 0,
  theme: "light",
};
```

가장 단순한 구현은 전체 snapshot을 읽은 뒤 컴포넌트에서 필요한 값을 꺼내는 것입니다.

```tsx
function useAppStore() {
  return useSyncExternalStore(
    appStore.subscribe,
    appStore.getSnapshot,
    appStore.getServerSnapshot,
  );
}

function UnreadBadge() {
  const { unreadCount } = useAppStore();
  return <span>{unreadCount}</span>;
}
```

이 방식은 이해하기 쉽지만, `theme`만 바뀌어도 `UnreadBadge`가 다시 렌더링될 수 있습니다. 큰 store를 직접 연결한다면 selector를 지원하는 라이브러리나 별도 Hook을 고려합니다.

```tsx
function useUnreadCount() {
  return useSyncExternalStore(
    appStore.subscribe,
    () => appStore.getSnapshot().unreadCount,
    () => appStore.getServerSnapshot().unreadCount,
  );
}
```

selector를 직접 만들 때도 원칙은 같습니다. store가 바뀌지 않았다면 같은 snapshot을 반환해야 하고, 선택한 값이 바뀌었을 때만 의미 있는 리렌더링이 일어나야 합니다.

## 미디어 쿼리 구독

브라우저 viewport 크기에 따라 다른 UI를 보여줄 때도 활용할 수 있습니다.

```tsx
function subscribeMediaQuery(query: string) {
  return (callback: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    subscribeMediaQuery(query),
    () => window.matchMedia(query).matches,
    () => false // SSR fallback
  );
}

function ResponsiveLayout() {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return isMobile ? <MobileLayout /> : <DesktopLayout />;
}
```

`subscribeMediaQuery`가 렌더링마다 새 함수를 만들지 않도록, 실제 사용에서는 컴포넌트 밖에서 memoize하거나 `useMemo`를 사용합니다.

## getSnapshot은 안정적이어야 한다

`getSnapshot`은 store가 바뀌지 않았다면 같은 값을 반환해야 합니다. 매번 새 객체를 만들면 React는 값이 바뀌었다고 볼 수 있습니다.

```tsx
// 좋지 않음: 렌더링마다 새 객체 → 무한 루프 위험
function getSnapshot() {
  return { count };
}
```

객체가 필요하다면 store 내부에서 snapshot을 캐시하거나 불변 업데이트 규칙을 명확히 둡니다.

```tsx
let cachedSnapshot = { count: 0 };

const counterStore = {
  increment() {
    count += 1;
    cachedSnapshot = { count }; // count가 바뀔 때만 새 객체
    listeners.forEach((l) => l());
  },
  getSnapshot() {
    return cachedSnapshot; // 바뀌지 않으면 같은 참조 반환
  },
  // ...
};
```

배열도 마찬가지입니다.

```tsx
// 좋지 않음: 매번 새 배열
function getSnapshot() {
  return [...items];
}
```

외부 store가 불변 업데이트를 한다면, store state 자체를 snapshot으로 반환하는 편이 안전합니다.

```tsx
let snapshot = {
  items: [] as Item[],
  selectedId: null as string | null,
};

function setItems(items: Item[]) {
  snapshot = { ...snapshot, items };
  emitChange();
}

function getSnapshot() {
  return snapshot;
}
```

`getSnapshot` 안에서 데이터를 새로 조립하지 말고, store가 바뀌는 시점에 새 snapshot을 만들어 두는 방식이 더 안정적입니다.

## SSR와 getServerSnapshot

Next.js 같은 SSR 환경에서는 서버에서 렌더링할 때 `window`나 브라우저 API에 접근할 수 없습니다. 세 번째 인자 `getServerSnapshot`으로 서버용 초기 값을 제공합니다.

```tsx
function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,  // 클라이언트 snapshot
    () => true               // 서버 snapshot (항상 온라인으로 가정)
  );
}
```

`getServerSnapshot`이 없으면 SSR 중 오류가 발생할 수 있습니다. 브라우저 API를 사용하는 모든 store에 추가하는 것이 안전합니다.

서버 snapshot과 클라이언트 첫 snapshot이 너무 다르면 hydration mismatch가 날 수 있습니다. 예를 들어 서버에서는 `false`, 클라이언트 첫 렌더에서는 `true`를 반환하면 처음 HTML과 hydration 결과가 달라질 수 있습니다. 서버에서 확실히 알 수 없는 값은 보수적인 기본값을 쓰고, 클라이언트에서 구독 후 갱신되도록 둡니다.

## subscribe 함수 안정화

`subscribe`를 컴포넌트 안에서 매번 새로 만들면 React가 매 렌더링마다 다시 구독해야 할 수 있습니다.

```tsx
function BadComponent({ query }: { query: string }) {
  const matches = useSyncExternalStore(
    (callback) => subscribeMediaQuery(query, callback),
    () => window.matchMedia(query).matches,
    () => false,
  );

  return <p>{matches ? "match" : "no match"}</p>;
}
```

query가 고정된 값이면 컴포넌트 밖으로 빼거나 `useMemo`로 구독 함수를 안정화합니다.

```tsx
function useMediaQuery(query: string) {
  const subscribe = useMemo(() => {
    return (callback: () => void) => subscribeMediaQuery(query, callback);
  }, [query]);

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
```

외부 store Hook은 컴포넌트가 여러 번 렌더링돼도 불필요하게 구독을 해제하고 다시 만들지 않도록 설계합니다.

## 외부 store를 쓰기 전 질문

`useSyncExternalStore`를 직접 쓰기 전에 아래 질문을 봅니다.

| 질문 | 아니오라면 |
| --- | --- |
| 값이 React 바깥에서 독립적으로 바뀌는가? | `useState`나 `useReducer`가 충분할 수 있습니다. |
| 구독/해제 API가 명확한가? | Effect로 직접 연결하는 편이 더 단순할 수 있습니다. |
| snapshot이 안정적으로 캐시되는가? | store 구조부터 정리해야 합니다. |
| 여러 컴포넌트가 같은 snapshot을 읽어야 하는가? | props 전달이나 Context가 충분할 수 있습니다. |
| SSR에서 초기값을 설명할 수 있는가? | 클라이언트 전용 Hook으로 제한할지 결정합니다. |

이 Hook은 "전역 state를 쉽게 만들기 위한 Hook"이 아니라, 이미 React 바깥에 있는 값을 React 렌더링 모델에 맞게 읽기 위한 Hook입니다.

## 언제 직접 쓰지 않을까

- 단순 컴포넌트 state면 `useState`를 씁니다.
- 가까운 트리 공유면 `Context`를 먼저 봅니다.
- 서버 데이터 캐시라면 server state 도구를 검토합니다.
- 이미 사용하는 상태 관리 라이브러리가 있다면 라이브러리 Hook을 씁니다.

`useSyncExternalStore`는 라이브러리 작성자나, 브라우저 API를 React에 안전하게 연결해야 할 때 주로 쓰입니다. Zustand, Redux, Jotai 같은 라이브러리들이 내부적으로 이 Hook을 사용합니다.

## 읽으면서 생각할 질문

- 이 값이 React 바깥에서 바뀌는가?
- subscribe와 getSnapshot 계약을 명확히 만들 수 있는가?
- getSnapshot이 store가 안 바뀌었는데 새 객체를 반환하지 않는가?
- custom Hook으로 감싸서 컴포넌트가 외부 store 세부사항을 몰라도 되는가?
- React state로 충분한 문제를 과하게 풀고 있지는 않은가?
- SSR를 쓴다면 getServerSnapshot도 제공했는가?
