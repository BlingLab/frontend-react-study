# 5단계. 심화

렌더링 비용과 성능 최적화의 판단 기준을 배웁니다.

## 읽을 문서

1. [React 렌더링 모델](./01-react-렌더링-모델.md)
2. [Memoization 판단하기](./02-memoization-판단하기.md)
3. [Suspense와 Compiler 관점](./03-suspense와-compiler-관점.md)

## 이 단계의 목표

- 렌더링과 DOM 변경을 구분합니다.
- `useMemo`, `useCallback`, `memo`를 성능 도구로 이해합니다.
- Suspense를 loading UI를 다루는 관점으로 봅니다.
- React Compiler가 있어도 상태 설계가 중요하다는 점을 이해합니다.

## 연결되는 예제

- 예제 안내: [02-학습예제/05-심화](../../02-학습예제/05-심화/README.md)
- 실행 명령: `pnpm run 예제:심화`
- 실제 코드: `src/examples/PerformanceExample.tsx`

## 빠른 정리

| 단계 | 의미 |
| --- | --- |
| Trigger | state, props 변경으로 렌더링 시작 |
| Render | 컴포넌트가 JSX를 계산 |
| Commit | 필요한 DOM 변경 반영 |

렌더링은 DOM 변경과 같지 않습니다. 컴포넌트 함수 재실행 자체도 문제는 아닙니다. 느린 계산, 큰 목록, 넓은 업데이트 범위를 먼저 봅니다.

```tsx
const filtered = useMemo(() => heavyFilter(items, keyword), [items, keyword]);
const handleClick = useCallback(() => onSelect(id), [id, onSelect]);
```

먼저 측정하고, 병목이 있을 때 최적화합니다.
