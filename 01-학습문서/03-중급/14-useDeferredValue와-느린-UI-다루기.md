# useDeferredValue와 느린 UI 다루기

`useDeferredValue`는 어떤 값의 업데이트를 낮은 우선순위로 미루어, 입력처럼 즉시 반응해야 하는 UI가 버벅이지 않게 도와주는 Hook입니다.

대표적인 상황은 검색 input과 느린 결과 목록입니다. 사용자는 타이핑이 즉시 반응하길 기대하지만, 큰 목록 필터링이나 복잡한 결과 렌더링은 조금 늦게 따라와도 괜찮습니다.

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

## debounce와 다르다

`useDeferredValue`는 고정된 시간을 기다리는 debounce가 아닙니다.

| 구분 | useDeferredValue | debounce |
| --- | --- | --- |
| 목적 | 렌더링 우선순위 조정 | 일정 시간 입력 대기 |
| 지연 시간 | React 스케줄링에 따라 달라짐 | 개발자가 지정 |
| 네트워크 요청 감소 | 직접 해주지 않음 | 보통 요청 감소에 사용 |
| 입력 반응성 | input을 우선 처리 | 입력 후 일정 시간 뒤 처리 |

API 요청 횟수를 줄이고 싶다면 debounce를 사용합니다. 느린 렌더링이 입력을 막는 문제라면 `useDeferredValue`를 고려합니다.

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
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <SlowResultList keyword={deferredKeyword} />
      </div>
    </>
  );
}
```

opacity 같은 작은 시각 차이로 "결과가 따라오는 중"이라는 느낌을 줄 수 있습니다.

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

성능 최적화는 항상 측정과 함께 봅니다. 목록이 작다면 `memo`와 `useDeferredValue`가 오히려 코드를 복잡하게 만들 수 있습니다.

## 객체를 바로 넘기지 않기

렌더링 중 새 객체를 만들어 `useDeferredValue`에 넘기면 매번 다른 값으로 인식될 수 있습니다.

```tsx
// 좋지 않음
const deferredFilter = useDeferredValue({ keyword, category });
```

객체가 필요하면 primitive 값을 따로 defer하거나, 객체 생성을 안정화합니다.

```tsx
const deferredKeyword = useDeferredValue(keyword);
const deferredCategory = useDeferredValue(category);
```

## 언제 쓰지 않을까

아래 상황에서는 다른 방법이 더 적합할 수 있습니다.

- API 요청 횟수를 줄여야 한다: debounce
- 계산 자체가 너무 비싸다: 알고리즘 개선, 가상 스크롤, 서버 검색
- 목록이 매우 크다: windowing/virtualization
- 렌더링이 느린 이유를 모른다: 먼저 React DevTools Profiler로 측정

## 읽으면서 생각할 질문

- 느린 것은 입력 state 업데이트인가, 결과 목록 렌더링인가?
- API 요청을 줄이고 싶은 문제를 `useDeferredValue`로 해결하려고 하지는 않는가?
- stale 상태를 사용자에게 표시해야 하는가?
- 하위 컴포넌트에 `memo`가 필요한 구조인가?
- 최적화 전후를 실제로 측정했는가?
