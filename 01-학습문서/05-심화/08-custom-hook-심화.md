# Custom Hook 심화

Custom Hook은 컴포넌트에서 상태 로직을 추출하는 방법입니다. `use`로 시작하는 함수이며, 내부에서 다른 Hook을 호출할 수 있습니다.

## Custom Hook이 필요한 시점

같은 로직이 두 컴포넌트에 반복되거나, 컴포넌트 함수가 너무 많은 일을 할 때 추출을 고려합니다. 추출 전에 먼저 묻습니다.

- 이 로직은 여러 컴포넌트에서 재사용 가능한가?
- 컴포넌트가 UI 계산과 상태 관리 둘 다를 하고 있는가?
- 테스트하기 어려운 이유가 UI와 로직이 섞였기 때문인가?

코드 줄 수보다 책임이 흐릿해졌는지를 기준으로 봅니다.

## 기본 추출 패턴

아래처럼 컴포넌트 안에 상태 로직이 많으면 추출을 고려합니다.

```tsx
function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Post[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (!keyword) return;
    setStatus("loading");

    fetchPosts(keyword)
      .then((data) => {
        setResults(data);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [keyword]);

  // JSX ...
}
```

`usePostSearch`로 추출하면 컴포넌트는 화면만 담당합니다.

```tsx
function usePostSearch(keyword: string) {
  const [results, setResults] = useState<Post[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (!keyword) return;
    setStatus("loading");

    fetchPosts(keyword)
      .then((data) => {
        setResults(data);
        setStatus("idle");
      })
      .catch(() => setStatus("error"));
  }, [keyword]);

  return { results, status };
}

function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const { results, status } = usePostSearch(keyword);

  // JSX ...
}
```

## cleanup이 있는 Custom Hook

외부 시스템을 구독하는 로직은 cleanup도 함께 포함합니다.

```tsx
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
```

이 Hook을 쓰는 컴포넌트는 이벤트 구독 방식을 알 필요가 없습니다.

## ref를 포함한 Custom Hook

DOM 조작이나 인스턴스 관리가 필요하면 ref를 Hook 안에 둡니다.

```tsx
function useAutoFocus<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return ref;
}

function SearchInput() {
  const inputRef = useAutoFocus<HTMLInputElement>();

  return <input ref={inputRef} placeholder="검색어를 입력하세요" />;
}
```

## 반환값 설계

Custom Hook의 반환값은 컴포넌트가 필요한 것만 줍니다.

값만 필요하면 값 하나를 반환합니다.

```tsx
const isOnline = useOnlineStatus();
```

state와 handler 쌍이 필요하면 객체로 반환합니다.

```tsx
const { items, addItem, removeItem, toggle } = useTodoList();
```

너무 많은 것을 반환하면 Hook이 컴포넌트처럼 비대해질 수 있습니다. Hook 하나가 한 가지 책임을 갖는지 확인합니다.

## 테스트 가능성

Custom Hook은 `renderHook`으로 컴포넌트 없이 테스트할 수 있습니다.

```tsx
import { renderHook, act } from "@testing-library/react";

test("useTodoList - 항목을 추가하면 목록에 보인다", () => {
  const { result } = renderHook(() => useTodoList());

  act(() => {
    result.current.addItem("문서 읽기");
  });

  expect(result.current.items).toHaveLength(1);
  expect(result.current.items[0].title).toBe("문서 읽기");
});
```

로직만 분리된 Hook은 UI 렌더 없이 동작을 검증할 수 있습니다.

## Custom Hook의 흔한 실수

### 추출을 너무 빨리 하기

로직이 한 곳에서만 쓰이면 굳이 Hook으로 추출하지 않아도 됩니다. 두 곳에서 쓰일 때 추출 시점을 고려합니다.

### 이름이 책임을 설명하지 않음

`useData`, `useLogic`, `useHelper`처럼 추상적인 이름은 피합니다. `usePostSearch`, `useCartTotal`, `useFormValidation`처럼 무엇을 하는지 알 수 있게 짓습니다.

### 렌더링마다 다른 값이 반환되는 Hook

```tsx
function useCurrentUser() {
  return { id: Math.random() };
}
```

Hook이 호출마다 새 객체를 반환하면 useEffect dependency가 계속 바뀌어 보일 수 있습니다. 안정적인 참조가 필요하면 `useMemo`나 `useRef`를 활용합니다.

## 브라우저 API를 감싸는 Custom Hook

`localStorage`, `setTimeout`, 브라우저 이벤트처럼 외부 시스템을 직접 쓰는 코드를 Hook으로 감싸면 컴포넌트는 그 세부사항을 알 필요 없습니다.

### useLocalStorage

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = value instanceof Function ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(next));
        } catch { /* 용량 초과 등 무시 */ }
        return next;
      });
    },
    [key],
  );

  return [storedValue, setValue] as const;
}
```

초기값은 lazy initializer로 읽고, `setValue`는 `useCallback`으로 안정적인 참조를 유지합니다.

```tsx
// 사용하는 쪽
const [theme, setTheme] = useLocalStorage<"light" | "dark">("theme", "light");
```

### useDebounce

```tsx
function useDebounce<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
```

값이 바뀔 때마다 타이머를 초기화합니다. 입력이 멈춘 뒤 `delayMs`가 지나야 `debouncedValue`가 갱신됩니다.

```tsx
const [keyword, setKeyword] = useState("");
const debouncedKeyword = useDebounce(keyword, 400);

// keyword는 즉시 바뀌고, debouncedKeyword는 400ms 뒤에 따라옴
useEffect(() => {
  if (debouncedKeyword) fetchResults(debouncedKeyword);
}, [debouncedKeyword]);
```

이 두 Hook의 실제 구현은 `src/hooks/useLocalStorage.ts`, `src/hooks/useDebounce.ts`에 있습니다.

## 읽으면서 생각할 질문

- 이 로직이 두 컴포넌트 이상에서 쓰이는가?
- 컴포넌트가 UI 계산 외에 너무 많은 일을 하고 있는가?
- Hook 이름이 무엇을 하는지 설명하는가?
- cleanup이 필요한 Effect를 포함하고 있는가?
- Hook을 컴포넌트 없이 테스트할 수 있는가?
- `useCallback`으로 반환 함수의 참조를 안정화했는가?
- 브라우저 API 예외 상황(localStorage 용량 초과, SSR 등)을 고려했는가?
