# 5단계. 심화

렌더링 비용과 성능 최적화의 판단 기준을 배웁니다.

## 읽을 문서

1. [React 렌더링 모델](./01-react-렌더링-모델.md)
2. [Memoization 판단하기](./02-memoization-판단하기.md)
3. [Suspense와 Compiler 관점](./03-suspense와-compiler-관점.md)
4. [Profiler로 성능 측정하기](./04-profiler로-성능-측정하기.md)
5. [큰 목록과 렌더링 범위 줄이기](./05-큰-목록과-렌더링-범위-줄이기.md)
6. [순수한 렌더링과 부수효과 분리](./06-순수한-렌더링과-부수효과-분리.md)
7. [Compiler 시대의 최적화 전략](./07-compiler-시대의-최적화-전략.md)

## 이 단계의 목표

- 렌더링과 DOM 변경을 구분합니다.
- `useMemo`, `useCallback`, `memo`를 성능 도구로 이해합니다.
- Suspense를 loading UI를 다루는 관점으로 봅니다.
- React Compiler가 있어도 상태 설계가 중요하다는 점을 이해합니다.
- React DevTools Profiler나 `<Profiler>`로 병목을 확인합니다.
- 큰 목록에서는 memoization보다 렌더링 범위, pagination, virtualization을 먼저 검토합니다.
- 렌더링 중 부수효과를 만들지 않고, 순수한 계산과 Effect를 분리합니다.
- Compiler가 줄여주는 일과 여전히 개발자가 설계해야 하는 일을 구분합니다.

## 외부 자료 기준의 분류

React API Reference와 Compiler 문서는 성능 최적화를 "기본 습관"이 아니라 "측정 후 필요한 곳에 적용하는 도구"로 설명합니다. 심화 단계는 코드를 더 복잡하게 만드는 단계가 아니라, 렌더링 비용을 정확히 보고 필요한 최적화만 선택하는 단계입니다.

| 분류 | 이 단계에서 배우는 이유 |
| --- | --- |
| 렌더링 모델 | render와 commit, DOM 변경을 구분합니다. |
| memoization | 느린 계산이나 불필요한 하위 렌더링을 줄일 때만 씁니다. |
| Suspense | loading 경계를 컴포넌트 트리 안에서 설계합니다. |
| Compiler 관점 | 자동 memoization이 생겨도 상태 설계가 사라지지 않음을 이해합니다. |
| Profiler | 체감이 아니라 측정 결과로 병목을 찾습니다. |
| 큰 목록 | 한 번에 렌더링하는 양과 업데이트 범위를 줄입니다. |
| 순수성 | render는 계산만 하고 외부 변경은 Effect나 event handler로 보냅니다. |

심화에서는 "최적화를 많이 하는 사람"보다 "최적화가 필요한 상황을 증명할 수 있는 사람"을 목표로 합니다.

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

## 심화 판단표

| 증상 | 먼저 볼 것 | 다음 선택지 |
| --- | --- | --- |
| 입력이 버벅임 | 같은 state가 큰 목록까지 다시 렌더링시키는가 | state 위치 조정, `useDeferredValue`, 목록 분리 |
| 필터링이 느림 | 계산 자체가 큰가 | `useMemo`, 서버 검색, 알고리즘 개선 |
| 긴 목록이 느림 | DOM node 수가 너무 많은가 | pagination, infinite scroll, virtualization |
| 자식이 자주 렌더링 | props identity가 매번 바뀌는가 | component composition, `memo`, `useCallback` |
| loading이 화면 전체를 덮음 | Suspense boundary가 너무 위에 있는가 | fallback 위치 조정 |
| 최적화 코드가 많음 | 실제 병목을 측정했는가 | 불필요한 memoization 제거, Compiler 도입 검토 |
