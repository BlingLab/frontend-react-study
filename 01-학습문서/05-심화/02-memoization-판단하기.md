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

## 읽으면서 생각할 질문

- 이 계산이 실제로 비싼가?
- memoization 없이도 코드가 맞게 동작하는가?
- dependency가 빠지지는 않았는가?
- 매 렌더마다 새 object나 function을 props로 넘기고 있는가?
- 최적화 때문에 코드가 지나치게 어려워지지는 않았는가?
