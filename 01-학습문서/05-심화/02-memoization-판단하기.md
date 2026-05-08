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

## memoization이 필요한 대표 상황

### 비싼 계산 결과를 재사용할 때

```tsx
const sortedItems = useMemo(() => {
  return [...items].sort((a, b) => expensiveCompare(a, b));
}, [items]);
```

계산이 비싸고, dependency가 자주 바뀌지 않는다면 `useMemo`가 도움이 될 수 있습니다.

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

이런 경우 `useCallback`은 함수 실행 속도를 빠르게 하는 도구가 아니라, 함수 identity를 안정화해서 memoized child가 props 변화를 판단할 수 있게 돕는 도구입니다.

## memoization이 필요 없는 경우

아래 코드는 대부분 그냥 두는 편이 낫습니다.

```tsx
const fullName = `${firstName} ${lastName}`;
const completedCount = todos.filter((todo) => todo.done).length;
```

작은 문자열 조합이나 짧은 배열 계산까지 `useMemo`로 감싸면 코드가 더 어렵고 dependency 관리 비용만 늘어날 수 있습니다.

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
- 자식에게 `id`와 공통 handler를 넘깁니다.
- 자식이 직접 작은 함수를 만들어도 되는지 봅니다.
- component composition으로 렌더링 범위를 줄입니다.

```tsx
<ProductRow product={product} onSelect={selectProduct} />
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
5. 남는 병목에만 `memo`, `useMemo`, `useCallback`을 적용합니다.
6. 적용 후 실제로 빨라졌는지 다시 측정합니다.

## 읽으면서 생각할 질문

- 이 계산이 실제로 비싼가?
- memoization 없이도 코드가 맞게 동작하는가?
- dependency가 빠지지는 않았는가?
- 매 렌더마다 새 object나 function을 props로 넘기고 있는가?
- 최적화 때문에 코드가 지나치게 어려워지지는 않았는가?
