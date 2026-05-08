# Custom Hook 만들기

Custom Hook은 반복되는 상태 로직을 컴포넌트 밖으로 꺼내 이름 붙이는 방법입니다.

컴포넌트가 길어지는 이유는 JSX가 많아서만은 아닙니다. 상태 초기값, 업데이트 규칙, Effect, 브라우저 API 연결 코드가 섞이면 컴포넌트가 "무엇을 보여주는지"보다 "어떻게 관리하는지"가 더 크게 보입니다. Custom Hook은 이 관리 규칙에 이름을 붙여 분리합니다.

```tsx
function useToggle(initialValue = false) {
  const [isOn, setIsOn] = useState(initialValue);

  function turnOn() {
    setIsOn(true);
  }

  function turnOff() {
    setIsOn(false);
  }

  function toggle() {
    setIsOn((prev) => !prev);
  }

  return { isOn, turnOn, turnOff, toggle };
}
```

Hook은 UI를 몰라도 됩니다. 오히려 UI와 상태 규칙이 분리될수록 여러 컴포넌트에서 쓰기 쉽습니다.

처음에는 재사용성보다 이름 붙이기를 기준으로 봅니다. `useToggle`, `useWindowSize`, `useSearchParams`처럼 로직의 목적이 드러나야 합니다.

## 언제 Custom Hook으로 뽑나

처음부터 모든 로직을 Hook으로 뽑을 필요는 없습니다. 아래 신호가 보일 때 분리합니다.

- 같은 상태 규칙이 두 컴포넌트 이상에서 반복된다.
- 컴포넌트 본문에서 Effect와 event handler가 길게 섞인다.
- JSX를 읽기 전에 상태 관리 코드를 오래 읽어야 한다.
- 로직에 이름을 붙이면 호출부가 더 설명적으로 바뀐다.
- 브라우저 API나 외부 시스템 연결 코드를 숨기고 싶다.

## 좋은 Custom Hook의 특징

### 이름만 보고 목적이 보인다

`useThing`, `useCommon`, `useUtil` 같은 이름은 피합니다. Hook 이름은 "무엇을 관리하는지"를 말해야 합니다.

```tsx
useToggle();
useWindowSize();
useDebouncedValue(keyword, 300);
useLocalStorageState("theme", "light");
useOnClickOutside(ref, handler);
useMediaQuery("(max-width: 768px)");
```

### JSX를 반환하지 않는다

Custom Hook은 상태 로직을 재사용하는 도구입니다. 보통 JSX는 컴포넌트가 책임지고, Hook은 값과 함수를 반환합니다.

```tsx
function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}

function HelpPanel() {
  const disclosure = useDisclosure();

  return (
    <>
      <button onClick={disclosure.open}>도움말 열기</button>
      {disclosure.isOpen && <Panel onClose={disclosure.close} />}
    </>
  );
}
```

### state를 공유하지 않고 로직을 공유한다

Custom Hook을 두 번 호출하면 state도 두 개 생깁니다.

```tsx
function Page() {
  const first = useToggle();
  const second = useToggle();

  // first와 second는 서로 독립적입니다.
}
```

Hook을 만들었다고 자동으로 전역 상태가 되는 것은 아닙니다. 여러 컴포넌트가 같은 값을 공유해야 한다면 state 끌어올리기, context, router state, server state 도구를 따로 판단해야 합니다.

## 예제: debounced value 만들기

검색 입력처럼 값이 빠르게 바뀌지만 일정 시간 멈춘 뒤에만 요청하고 싶을 때가 있습니다. 이때 debounce 로직을 Hook으로 분리할 수 있습니다.

```tsx
function useDebouncedValue<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
```

사용하는 컴포넌트는 타이머 세부사항을 몰라도 됩니다.

```tsx
function SearchBox() {
  const [keyword, setKeyword] = useState("");
  const debouncedKeyword = useDebouncedValue(keyword, 300);

  useEffect(() => {
    if (debouncedKeyword.trim() === "") return;
    searchProducts(debouncedKeyword);
  }, [debouncedKeyword]);

  return (
    <input
      value={keyword}
      onChange={(event) => setKeyword(event.target.value)}
      placeholder="검색어 입력"
    />
  );
}
```

## 예제: localStorage state 만들기

브라우저 저장소와 state를 연결하는 로직도 여러 곳에서 반복되기 쉽습니다.

```tsx
function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

이 Hook을 사용하면 컴포넌트는 "theme 값을 저장한다"는 의도만 남습니다.

```tsx
function ThemeSelect() {
  const [theme, setTheme] = useLocalStorageState<"light" | "dark">("theme", "light");

  return (
    <select value={theme} onChange={(event) => setTheme(event.target.value as "light" | "dark")}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

## 예제: 외부 클릭 감지

모달이나 드롭다운 밖을 클릭할 때 닫는 기능은 여러 컴포넌트에서 반복됩니다.

```tsx
function useOnClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void,
) {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler();
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, handler]);
}
```

사용하는 쪽은 간결합니다.

```tsx
function Dropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, onClose);

  return (
    <div ref={ref} className="dropdown">
      {/* 드롭다운 내용 */}
    </div>
  );
}
```

## 예제: 교차 관찰 (Intersection Observer)

요소가 뷰포트에 들어왔을 때를 감지하는 로직입니다. 무한 스크롤이나 지연 로딩에 쓰입니다.

```tsx
function useIntersectionObserver(
  ref: React.RefObject<Element | null>,
  options?: IntersectionObserverInit,
) {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}
```

```tsx
function LoadMoreTrigger({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref);

  useEffect(() => {
    if (isVisible) onVisible();
  }, [isVisible, onVisible]);

  return <div ref={ref} style={{ height: 1 }} />;
}
```

## 반환값은 object와 tuple 중 무엇이 좋나

둘 다 가능합니다.

| 형태 | 어울리는 경우 |
| --- | --- |
| object | 반환값이 여러 개이고 이름이 중요할 때 |
| tuple | `useState`처럼 순서가 관례로 굳어져 있을 때 |

대부분의 앱 전용 Hook은 object가 읽기 쉽습니다.

```tsx
const { isOpen, open, close } = useDisclosure();
```

반면 `useState`와 비슷한 느낌을 주고 싶다면 tuple도 괜찮습니다.

```tsx
const [value, setValue] = useLocalStorageState("theme", "light");
```

## Hook 안의 Effect도 같은 규칙을 따른다

Custom Hook 안에 Effect를 넣어도 Effect의 원칙은 변하지 않습니다.

- 외부 시스템과 연결할 때만 사용합니다.
- cleanup이 필요한지 봅니다.
- dependency를 숨기지 않습니다.
- Hook 호출부에서 넘겨준 값도 reactive 값입니다.

```tsx
function useWindowSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useEffect(() => {
    function handleResize() {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
```

## 흔한 실수

**cleanup을 빠뜨리기**

```tsx
// 좋지 않음 — 컴포넌트가 사라진 뒤에도 이벤트 리스너가 남음
function useScrollPosition() {
  const [position, setPosition] = useState(0);

  useEffect(() => {
    window.addEventListener("scroll", () => setPosition(window.scrollY));
    // cleanup 없음!
  }, []);

  return position;
}
```

**dependency를 숨기기**

```tsx
// 좋지 않음 — userId가 dependency에 없어서 오래된 값을 볼 수 있음
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, []); // userId를 빼면 처음 값만 사용

  return user;
}

// 올바름
function useUserData(userId: string) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let ignore = false;
    fetchUser(userId).then((data) => {
      if (!ignore) setUser(data);
    });
    return () => { ignore = true; };
  }, [userId]); // userId 포함

  return user;
}
```

## 읽으면서 생각할 질문

- 이 상태 로직에 이름을 붙이면 컴포넌트가 짧아지는가?
- Custom Hook이 JSX에 의존하고 있지는 않은가?
- 반환값을 object로 하면 호출부가 더 읽기 쉬운가?
- Hook 이름이 실제 목적을 설명하는가?
- 여러 컴포넌트에서 같은 규칙을 반복하고 있지는 않은가?
- 이 Hook은 state를 공유하는가, 로직만 공유하는가?
- Effect를 Hook 안에 숨겼다면 cleanup과 dependency가 여전히 명확한가?
- 두 컴포넌트가 같은 Hook을 쓰면 각자 독립적인 state를 갖는다는 점을 이해했는가?
