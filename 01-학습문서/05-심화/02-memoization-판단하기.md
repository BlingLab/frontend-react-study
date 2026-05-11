# Memoization 판단하기

Memoization은 값을 기억해두고 같은 입력이면 다시 계산하지 않는 방식입니다.

React에서 자주 보는 도구는 세 가지입니다.

- `memo`: props가 같으면 컴포넌트 렌더링을 건너뛰는 힌트
- `useMemo`: 계산 결과를 캐시
- `useCallback`: 함수 identity를 캐시

```tsx
const filteredItems = useMemo(
  () => items.filter((item) => item.title.includes(keyword)),
  [items, keyword],
);
```

이 도구들은 코드가 동작하게 만드는 도구가 아닙니다. 없어도 맞게 동작해야 하고, 필요할 때 성능을 보완합니다.

## 언제 필요한지 판단하는 기준

memoization을 넣기 전에 먼저 이 질문에 답합니다.

```md
1. 이 코드가 실제로 느린가?  → Profiler로 측정했는가?
2. dependency가 자주 바뀌는가? → 바뀔 때마다 재계산이 일어나는가?
3. memoization 없이 맞게 동작하는가? → 동작 정확성을 먼저 확인했는가?
```

세 질문에 모두 "예"라고 답할 때 memoization을 고려합니다.

## memoization이 필요한 대표 상황

### 비싼 계산 결과를 재사용할 때

```tsx
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => expensiveCompare(a, b));
}, [items]);
```

계산이 비싸고, dependency가 자주 바뀌지 않는다면 `useMemo`가 도움이 될 수 있습니다.

실제로 비싼 계산인지 확인하는 방법:

```tsx
console.time("filter");
const result = items.filter(expensiveFilter);
console.timeEnd("filter");
// 1ms 미만이면 useMemo가 없어도 충분합니다.
```

### memoized child에 안정적인 props를 넘길 때

```tsx
const ProductRow = memo(function ProductRow({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (id: string) => void;
}) {
  return <button onClick={() => onSelect(product.id)}>{product.name}</button>;
});
```

부모에서 `onSelect`가 매번 새 함수라면 `memo` 효과가 줄어듭니다.

```tsx
const handleSelect = useCallback((id: string) => {
  setSelectedId(id);
}, []);
```

이런 경우 `useCallback`은 함수 실행 속도를 빠르게 하는 도구가 아니라, 함수 identity를 안정화해서 memoized child가 props 변화를 올바르게 판단할 수 있게 돕는 도구입니다.

### 참조 안정성이 필요한 경우

외부 라이브러리가 props identity 변화를 감지해 내부 인스턴스를 재생성하는 경우입니다.

```tsx
// 차트 라이브러리가 options 변화마다 인스턴스 재생성
const chartOptions = useMemo(() => ({
  type: "bar",
  responsive: true,
  plugins: { legend: { position: "top" } },
}), []); // 바뀔 이유가 없으면 dependency를 최소화
```

## memoization이 필요 없는 경우

아래 코드는 대부분 그냥 두는 편이 낫습니다.

```tsx
const fullName = `${firstName} ${lastName}`;
const completedCount = todos.filter((todo) => todo.done).length;
```

작은 문자열 조합이나 짧은 배열 계산까지 `useMemo`로 감싸면 코드가 더 어렵고 dependency 관리 비용만 늘어날 수 있습니다.

**숫자 기준으로 생각하기**

| 항목 수 | useMemo 필요성 |
| --- | --- |
| 100개 이하 필터/정렬 | 거의 불필요 |
| 1,000개 수준 | 측정 후 판단 |
| 10,000개 이상 | 서버 검색 또는 useMemo 검토 |

React Compiler가 적용된 환경에서는 이 판단을 Compiler가 상당 부분 자동으로 처리합니다.

## memo를 깨는 흔한 패턴

```tsx
<ProductRow
  product={product}
  style={{ color: "red" }}
  onSelect={() => selectProduct(product.id)}
/>
```

`style` 객체와 `onSelect` 함수는 렌더링마다 새로 만들어집니다. `ProductRow`가 `memo`로 감싸져 있어도 props가 달라졌다고 판단될 수 있습니다.

해결책은 항상 `useMemo`와 `useCallback`이 아닙니다.

- style을 CSS class로 옮깁니다.
- 자식에게 `id`만 넘기고 내부에서 핸들러를 만듭니다.
- component composition으로 렌더링 범위를 줄입니다.

```tsx
<ProductRow product={product} onSelect={selectProduct} />
```

### children prop으로 렌더링 범위 줄이기

memo 없이 구조를 바꾸는 것만으로도 불필요한 재렌더를 줄일 수 있습니다.

```tsx
// keyword 변경 시 HeavyWidget이 재렌더됨
function Page() {
  const [keyword, setKeyword] = useState("");
  return (
    <>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      <HeavyWidget /> {/* keyword와 무관하지만 재렌더 발생 */}
    </>
  );
}

// keyword 상태를 SearchBox 안으로 내리면 HeavyWidget은 재렌더 안 됨
function Page() {
  return (
    <SearchBox>
      <HeavyWidget />
    </SearchBox>
  );
}

function SearchBox({ children }: { children: React.ReactNode }) {
  const [keyword, setKeyword] = useState("");
  return (
    <>
      <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      {children}
    </>
  );
}
```

## useMemo dependency 관리

dependency가 빠지면 오래된 캐시가 사용됩니다.

```tsx
// keyword가 바뀌어도 재계산하지 않음 — 버그
const filtered = useMemo(
  () => items.filter((item) => item.title.includes(keyword)),
  [items] // keyword가 빠짐
);
```

dependency를 전부 넣으면 "왜 useMemo를 쓰는가"를 다시 생각해보는 신호가 됩니다. dependency가 자주 바뀐다면 캐시가 거의 작동하지 않습니다.

```tsx
// items와 keyword가 매 렌더마다 바뀐다면 useMemo의 이점이 줄어듦
const filtered = useMemo(
  () => items.filter((item) => item.title.includes(keyword)),
  [items, keyword] // 둘 다 자주 바뀌면 캐시 효과 없음
);
```

## React Compiler가 있을 때

React Compiler는 컴포넌트와 Hook의 memoization을 자동화하는 방향입니다. 이 흐름 때문에 수동 `memo`, `useMemo`, `useCallback`의 필요는 줄어듭니다.

하지만 Compiler가 모든 설계를 대신하지는 않습니다.

- state 위치가 너무 높으면 여전히 넓은 업데이트가 생깁니다.
- 렌더링 중 부수효과가 있으면 구조가 나쁩니다.
- 큰 목록을 한 번에 렌더링하면 DOM 비용은 여전히 큽니다.
- 서버 요청과 캐시는 별도 설계가 필요합니다.

Compiler가 있어도 memoization은 escape hatch로 남습니다. 단, 기본 습관으로 먼저 넣기보다 측정 결과와 구조를 보고 선택합니다.

## 판단 절차

1. memoization 없이 코드가 맞게 동작하게 만듭니다.
2. 느린 사용자 행동을 정합니다.
3. Profiler로 느린 컴포넌트나 계산을 찾습니다.
4. state 위치와 컴포넌트 분리로 해결 가능한지 봅니다.
5. children prop으로 렌더링 범위를 좁힐 수 있는지 봅니다.
6. 남는 병목에만 `memo`, `useMemo`, `useCallback`을 적용합니다.
7. 적용 후 실제로 빨라졌는지 다시 측정합니다.

## 판단 요약

| 상황 | 권장 접근 |
| --- | --- |
| 작은 계산 (문자열, 짧은 배열) | useMemo 불필요 |
| 큰 목록 필터/정렬 | 측정 후 useMemo 검토 |
| memoized child에 함수 전달 | useCallback으로 참조 안정화 |
| memo를 깨는 객체 리터럴 | CSS class, 구조 변경 우선 |
| 라이브러리 참조 안정성 필요 | useMemo or useCallback |
| state 위치 문제 | memoization 전에 구조 변경 |

## 읽으면서 생각할 질문

- 이 계산이 실제로 비싼가? 측정했는가?
- memoization 없이도 코드가 맞게 동작하는가?
- dependency가 빠지지는 않았는가?
- 매 렌더마다 새 object나 function을 props로 넘기고 있는가?
- children prop으로 렌더링 범위를 분리하면 memo가 불필요하지 않은가?
- 최적화 때문에 코드가 지나치게 어려워지지는 않았는가?
- dependency가 너무 자주 바뀌어 useMemo가 효과가 없지는 않은가?
