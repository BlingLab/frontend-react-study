# Ref와 DOM 다루기

`ref`는 렌더링에 직접 사용하지 않는 값을 보관하거나, React가 관리하는 DOM 노드에 접근할 때 씁니다.

중요한 기준은 간단합니다.

- 화면에 보여줘야 하는 값이면 state를 씁니다.
- 값이 바뀌어도 다시 렌더링할 필요가 없으면 ref를 고려합니다.
- DOM focus, scroll, size 측정처럼 실제 DOM 노드가 필요하면 ref를 씁니다.

## state와 ref의 차이

| 구분 | state | ref |
| --- | --- | --- |
| 값 변경 시 렌더링 | 다시 렌더링됨 | 다시 렌더링되지 않음 |
| 화면 출력에 사용 | 적합 | 부적합 |
| DOM 노드 접근 | 부적합 | 적합 |
| 타이머 id 저장 | 가능하지만 어색함 | 적합 |
| 이전 값 기억 | 가능 | 적합한 경우가 많음 |

ref의 `.current` 값을 바꿔도 React는 화면을 다시 그리지 않습니다. 그래서 아래 코드는 버튼을 눌러도 숫자가 화면에 바로 반영되지 않습니다.

```tsx
function ClickCounter() {
  const countRef = useRef(0);

  return (
    <button
      type="button"
      onClick={() => {
        countRef.current += 1;
      }}
    >
      {countRef.current}
    </button>
  );
}
```

화면에 보여줄 카운트라면 state가 맞습니다.

```tsx
function ClickCounter() {
  const [count, setCount] = useState(0);

  return (
    <button type="button" onClick={() => setCount((value) => value + 1)}>
      {count}
    </button>
  );
}
```

## DOM에 focus 주기

입력값이 비어 있을 때 input에 focus를 주는 코드는 ref가 잘 맞습니다.

```tsx
function SearchForm() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [keyword, setKeyword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (keyword.trim() === "") {
      inputRef.current?.focus();
      return;
    }

    search(keyword);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      <button type="submit">검색</button>
    </form>
  );
}
```

여기서 focus는 브라우저 DOM에 직접 명령하는 일입니다. React state로 표현하기보다 ref로 DOM 노드를 잡고 필요한 순간에 호출합니다.

## scroll 위치 이동

목록에서 "맨 위로" 버튼을 만들 때도 ref를 사용할 수 있습니다.

```tsx
function ArticlePage() {
  const topRef = useRef<HTMLDivElement | null>(null);

  return (
    <>
      <div ref={topRef} />
      <Article />
      <button
        type="button"
        onClick={() => {
          topRef.current?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        맨 위로
      </button>
    </>
  );
}
```

## 타이머 id 저장하기

타이머 id는 화면에 보여줄 값이 아닙니다. 렌더링 사이에 기억하고 있다가 나중에 clear할 수 있으면 됩니다.

```tsx
function AutosaveButton() {
  const timeoutRef = useRef<number | null>(null);

  function scheduleSave() {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      saveDraft();
      timeoutRef.current = null;
    }, 500);
  }

  return <button onClick={scheduleSave}>임시 저장 예약</button>;
}
```

이런 값은 state로 두면 불필요한 렌더링이 생깁니다.

## 이전 값 기억하기

이전 렌더링의 값을 기억해야 할 때도 ref를 사용할 수 있습니다.

```tsx
function usePrevious<T>(value: T) {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
```

사용 예시는 다음과 같습니다.

```tsx
function PriceLabel({ price }: { price: number }) {
  const previousPrice = usePrevious(price);
  const isIncreased = previousPrice !== undefined && price > previousPrice;

  return (
    <p>
      {price.toLocaleString()}원
      {isIncreased && <span> 상승</span>}
    </p>
  );
}
```

## ref를 남용하면 생기는 문제

ref는 React의 렌더링 흐름 밖에 있는 값을 다룹니다. 그래서 너무 많이 쓰면 데이터 흐름이 보이지 않습니다.

피해야 할 예시는 다음과 같습니다.

```tsx
function BadForm() {
  const nameRef = useRef("");

  return (
    <input
      onChange={(event) => {
        nameRef.current = event.target.value;
      }}
    />
  );
}
```

입력값을 화면에 검증 메시지로 보여주거나 submit 버튼 disabled에 써야 한다면 state로 관리하는 편이 맞습니다.

```tsx
function GoodForm() {
  const [name, setName] = useState("");
  const isValid = name.trim().length >= 2;

  return (
    <>
      <input value={name} onChange={(event) => setName(event.target.value)} />
      <button type="submit" disabled={!isValid}>
        저장
      </button>
    </>
  );
}
```

## 읽으면서 생각할 질문

- 이 값이 바뀌면 화면이 다시 그려져야 하는가?
- DOM 노드에 직접 접근해야 하는 상황인가?
- ref에 저장한 값을 렌더링 결과에 사용하고 있지는 않은가?
- state로 두면 불필요한 렌더링이 생기는 값인가?
- ref를 사용해서 React 데이터 흐름을 우회하고 있지는 않은가?
