# useDeferredValue와 느린 UI 다루기

`useDeferredValue`는 어떤 값의 업데이트를 낮은 우선순위로 미루어, 입력처럼 즉시 반응해야 하는 UI가 버벅이지 않게 도와주는 Hook입니다.

대표적인 상황은 검색 input과 느린 결과 목록입니다. 사용자는 타이핑이 즉시 반응하길 기대하지만, 큰 목록 필터링이나 복잡한 결과 렌더링은 조금 늦게 따라와도 괜찮습니다.

## React 동시성 기능의 맥락

React 18에서 도입된 **동시성 렌더링(Concurrent Rendering)**은 렌더링 작업에 우선순위를 두고, 급한 업데이트가 느린 업데이트를 중단할 수 있게 만든 기능입니다.

이전 React는 렌더링이 시작되면 끝날 때까지 중단할 수 없었습니다. 한 번 `setState`가 발생하면 그 트리 전체가 다시 그려져야 했기 때문에, 느린 컴포넌트가 있으면 그 시간 동안 사용자 입력이 막혔습니다.

동시성 렌더링에서는 렌더링을 잠깐 멈추고 더 급한 작업(사용자 입력 등)을 먼저 처리한 뒤 돌아와서 계속할 수 있습니다. `useDeferredValue`와 `useTransition`은 이 동시성 기능을 활용하는 두 가지 API입니다.

## 기본 예시

```tsx
function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const deferredKeyword = useDeferredValue(keyword);

  return (
    <>
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
      <SlowResultList keyword={deferredKeyword} />
    </>
  );
}
```

`keyword`는 즉시 바뀌므로 input은 빠르게 반응합니다. `deferredKeyword`는 조금 늦게 따라오므로 느린 목록 렌더링이 입력을 막는 정도를 줄일 수 있습니다.

흐름을 단계별로 보면:

1. 사용자가 "r" 입력 → `keyword = "r"` 즉시 반영 (input 즉각 표시)
2. `deferredKeyword`는 아직 `""` 유지 (이전 목록 렌더링 유지)
3. React가 여유가 생기면 `deferredKeyword`를 `"r"`로 업데이트
4. 목록이 `"r"` 기준으로 다시 렌더링됨
5. 그 사이 사용자가 "re" 입력 → 2번으로 돌아가 반복

## debounce와 다르다

`useDeferredValue`는 고정된 시간을 기다리는 debounce가 아닙니다.

| 구분 | useDeferredValue | debounce |
| --- | --- | --- |
| 목적 | 렌더링 우선순위 조정 | 일정 시간 입력 대기 |
| 지연 시간 | React 스케줄링에 따라 달라짐 | 개발자가 지정 |
| 네트워크 요청 감소 | 직접 해주지 않음 | 보통 요청 감소에 사용 |
| 입력 반응성 | input을 우선 처리 | 입력 후 일정 시간 뒤 처리 |
| 저사양 기기 | 기기 성능에 맞게 자동 조정 | 고정 시간 (과도하거나 부족할 수 있음) |

API 요청 횟수를 줄이고 싶다면 debounce를 사용합니다. 느린 렌더링이 입력을 막는 문제라면 `useDeferredValue`를 고려합니다.

**두 가지를 동시에 쓸 수도 있습니다.** API 요청은 debounce로 줄이고, 동시에 즉각적인 필터링 렌더링은 `useDeferredValue`로 처리하는 구조입니다.

```tsx
function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const deferredKeyword = useDeferredValue(keyword);

  // API 요청은 debounce (300ms 후에만 요청)
  const debouncedKeyword = useDebounce(keyword, 300);
  const { data } = useSearchAPI(debouncedKeyword);

  // 클라이언트 필터링은 deferredKeyword로 우선순위 조정
  const filteredLocal = useMemo(
    () => localData.filter((item) => item.name.includes(deferredKeyword)),
    [deferredKeyword]
  );

  return (
    <>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <ResultList items={data ?? filteredLocal} />
    </>
  );
}
```

## useDeferredValue vs useTransition

두 Hook 모두 동시성 렌더링을 활용하지만, 어디에 적용하는지가 다릅니다.

| 구분 | useDeferredValue | useTransition |
| --- | --- | --- |
| 적용 대상 | 값 자체 | state 업데이트 |
| 사용 위치 | 값을 받는 쪽 (소비자) | state를 바꾸는 쪽 (생산자) |
| 외부 값 처리 | 가능 (prop, context 값도 defer 가능) | 자신이 직접 setState 해야 함 |
| isPending 제공 | 없음 (직접 비교해야 함) | `isPending` 직접 제공 |

### useTransition 사용 예시

```tsx
function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setKeyword(e.target.value); // 즉시 업데이트

    startTransition(() => {
      // 이 업데이트는 낮은 우선순위로 처리
      setResults(searchLargeList(e.target.value));
    });
  }

  return (
    <>
      <input value={keyword} onChange={handleChange} />
      {isPending && <span>검색 중...</span>}
      <ul>
        {results.map((r) => <li key={r}>{r}</li>)}
      </ul>
    </>
  );
}
```

### 선택 기준

- state를 직접 내가 바꾸고 로딩 표시(`isPending`)도 필요하다 → **`useTransition`**
- 외부에서 넘어오는 prop이나 context 값의 반영을 미루고 싶다 → **`useDeferredValue`**

## 오래된 결과임을 표시하기

deferred 값은 최신 값보다 늦을 수 있습니다. 사용자에게 현재 결과가 최신 입력을 아직 따라가지 못했다는 힌트를 줄 수 있습니다.

```tsx
function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const deferredKeyword = useDeferredValue(keyword);
  const isStale = keyword !== deferredKeyword;

  return (
    <>
      <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      <div style={{ opacity: isStale ? 0.5 : 1, transition: "opacity 0.2s" }}>
        <SlowResultList keyword={deferredKeyword} />
      </div>
    </>
  );
}
```

`isStale`은 `keyword !== deferredKeyword`일 때 `true`입니다. opacity를 낮추거나, 스피너를 추가하거나, "최신 결과 계산 중..." 같은 문구를 보여주는 용도로 활용할 수 있습니다.

## memo와 함께 쓰는 경우

느린 하위 컴포넌트가 부모 렌더링마다 무조건 다시 렌더링된다면 deferred 값만으로 충분하지 않을 수 있습니다. 하위 컴포넌트를 `memo`로 감싸서 props가 같을 때 렌더링을 건너뛰게 할 수 있습니다.

```tsx
const SlowResultList = memo(function SlowResultList({
  keyword,
}: {
  keyword: string;
}) {
  const results = searchLargeList(keyword);

  return (
    <ul>
      {results.map((result) => (
        <li key={result.id}>{result.title}</li>
      ))}
    </ul>
  );
});
```

**왜 `memo`가 필요한가?**

`useDeferredValue`는 값의 업데이트 타이밍을 미룰 뿐입니다. 부모 컴포넌트가 다른 이유로 리렌더링되면, `deferredKeyword`가 바뀌지 않았어도 자식 컴포넌트도 같이 렌더링될 수 있습니다. `memo`는 props가 동일하면 이 불필요한 렌더링을 막아줍니다.

두 가지를 세트로 사용하면 최적의 효과를 얻을 수 있습니다:
1. `useDeferredValue` → 값 업데이트 타이밍 조정
2. `memo` → 값이 안 바뀌었을 때 렌더링 스킵

성능 최적화는 항상 측정과 함께 봅니다. 목록이 작다면 `memo`와 `useDeferredValue`가 오히려 코드를 복잡하게 만들 수 있습니다.

## 객체를 바로 넘기지 않기

렌더링 중 새 객체를 만들어 `useDeferredValue`에 넘기면 매번 다른 값으로 인식될 수 있습니다.

```tsx
// 좋지 않음: 렌더링마다 새 객체 생성 → 항상 "바뀐 값"으로 인식
const deferredFilter = useDeferredValue({ keyword, category });
```

객체가 필요하면 primitive 값을 따로 defer하거나, `useMemo`로 객체를 안정화합니다.

```tsx
// 권장: primitive 각각 defer
const deferredKeyword = useDeferredValue(keyword);
const deferredCategory = useDeferredValue(category);

// 또는: useMemo로 객체 안정화 후 defer
const filter = useMemo(() => ({ keyword, category }), [keyword, category]);
const deferredFilter = useDeferredValue(filter);
```

## React DevTools Profiler로 측정하기

"느리다"는 감각이 있을 때, 막연하게 최적화를 적용하기 전에 **Profiler로 원인을 파악**하는 것이 먼저입니다.

### Profiler 사용 흐름

1. Chrome DevTools → React 탭 → Profiler 패널
2. "Record" 버튼 클릭 후 느린 인터랙션 수행
3. "Stop" 후 Flamegraph 확인

### Flamegraph에서 볼 것

| 색상/표시 | 의미 |
| --- | --- |
| 회색 | 렌더링하지 않음 (최적화됨) |
| 노란색/주황색 | 렌더링됨, 시간이 걸림 |
| 파란색 | 렌더링됨, 빠름 |
| 빨간색 | 렌더링됨, 매우 느림 |

### 확인 포인트

- 불필요하게 렌더링되는 컴포넌트가 있는가?
- 특정 컴포넌트의 render 시간이 비정상적으로 긴가?
- `memo`가 있지만 여전히 렌더링되는가? → props 비교 실패 여부 확인

측정 결과 **렌더링 자체가 느리다**면 `useDeferredValue`나 `memo`를 고려하고, **렌더링은 빠른데 목록이 너무 많다**면 가상화(virtualization)를 고려합니다.

## 언제 쓰지 않을까

아래 상황에서는 다른 방법이 더 적합할 수 있습니다.

| 상황 | 더 적합한 해결책 | 이유 |
| --- | --- | --- |
| API 요청 횟수를 줄이고 싶다 | debounce | `useDeferredValue`는 렌더링 타이밍만 조정, 요청은 계속 나감 |
| 목록 아이템이 수천 개 | 가상 스크롤 (react-window) | 렌더링 미루기로는 DOM 노드 수 자체를 줄일 수 없음 |
| 계산 로직 자체가 느리다 | 알고리즘 개선, Web Worker | 실행은 여전히 발생, 우선순위만 낮춰줌 |
| 서버 데이터로 검색 | debounce + 서버 검색 | 클라이언트 렌더링 최적화가 아니라 요청 설계 문제 |
| 느린 이유를 모른다 | Profiler 먼저 | 원인 모르고 최적화하면 코드만 복잡해짐 |

## 흔한 실수

### 실수 1: 모든 느린 UI에 useDeferredValue 적용

```tsx
// 잘못된 판단: "느리니까 일단 defer"
const deferredItems = useDeferredValue(items); // items가 2개짜리 배열인데?
```

목록이 작거나 계산이 가볍다면 `useDeferredValue`는 코드만 복잡하게 만듭니다. 먼저 Profiler로 실제로 느린지 확인합니다.

### 실수 2: API 요청 줄이기에 useDeferredValue 사용

```tsx
// 잘못된 사용: keyword가 defer되어도 effect는 deferredKeyword가 바뀔 때마다 실행됨
const deferredKeyword = useDeferredValue(keyword);

useEffect(() => {
  fetchResults(deferredKeyword); // 여전히 매 글자마다 요청 나감
}, [deferredKeyword]);
```

타이밍이 늦춰질 수는 있지만, 결국 모든 값 변경에 대해 요청이 나갑니다. 요청 횟수를 줄이려면 debounce를 사용합니다.

### 실수 3: useDeferredValue 없이 memo만 쓰기

```tsx
// memo는 있지만 defer가 없으면 빠른 업데이트 중에도 느린 컴포넌트가 렌더링됨
const SlowList = memo(({ keyword }) => { ... });

function Parent() {
  const [keyword, setKeyword] = useState("");
  // deferredKeyword가 없으면 keyword가 바뀔 때마다 SlowList도 재렌더링
  return <SlowList keyword={keyword} />;
}
```

`memo`는 props가 같을 때만 스킵합니다. `useDeferredValue`와 세트로 써야 "값을 늦게 전달 + 같으면 스킵" 두 효과를 모두 얻을 수 있습니다.

## 실전 패턴: 탭 전환 지연

대용량 데이터를 탭으로 나눠서 보여줄 때, 탭 클릭 즉시 반응하되 콘텐츠 렌더링은 미루는 패턴입니다.

```tsx
function TabView() {
  const [activeTab, setActiveTab] = useState("posts");
  const deferredTab = useDeferredValue(activeTab);
  const isTransitioning = activeTab !== deferredTab;

  return (
    <div>
      <div role="tablist">
        {["posts", "comments", "likes"].map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        style={{
          opacity: isTransitioning ? 0.6 : 1,
          transition: "opacity 0.15s",
        }}
      >
        <TabContent tab={deferredTab} />
      </div>
    </div>
  );
}

const TabContent = memo(function TabContent({ tab }: { tab: string }) {
  // 탭별 대용량 렌더링
  return <HeavyList category={tab} />;
});
```

탭 버튼은 `activeTab`으로 즉각 시각 피드백을 주고, 실제 콘텐츠는 `deferredTab`이 따라올 때 렌더링합니다.

## 읽으면서 생각할 질문

- 느린 것은 입력 state 업데이트인가, 결과 목록 렌더링인가?
- API 요청을 줄이고 싶은 문제를 `useDeferredValue`로 해결하려고 하지는 않는가?
- stale 상태를 사용자에게 표시해야 하는가?
- 하위 컴포넌트에 `memo`가 필요한 구조인가?
- state를 직접 바꾸는 쪽인가, 값을 받아서 쓰는 쪽인가? (`useTransition` vs `useDeferredValue`)
- 최적화 전후를 실제로 측정했는가?
