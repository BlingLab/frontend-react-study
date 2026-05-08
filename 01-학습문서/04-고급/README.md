# 4단계. 고급

앱이 커질 때 상태 변경 규칙과 데이터 전달 흐름을 정리하는 단계입니다.

## 읽을 문서

1. [Reducer로 변경 규칙 모으기](./01-reducer로-변경규칙-모으기.md)
2. [Context를 필요한 만큼 쓰기](./02-context를-필요한만큼-쓰기.md)
3. [State를 분류하고 배치하기](./03-state를-분류하고-배치하기.md)

## 이 단계의 목표

- 복잡한 state 변경을 reducer로 정리합니다.
- Context를 전역 저장소처럼 남용하지 않습니다.
- 상태를 local, shared client, server로 나눠 봅니다.
- 상태 관리 도구보다 상태의 성격을 먼저 판단합니다.

## 연결되는 예제

- 예제 안내: [02-학습예제/04-고급](../../02-학습예제/04-고급/README.md)
- 실행 명령: `pnpm run 예제:고급`
- 실제 코드: `src/examples/ContextReducerExample.tsx`

## 빠른 정리

| Hook | 목적 |
| --- | --- |
| `useState` | 컴포넌트 state 관리 |
| `useEffect` | 외부 시스템과 동기화 |
| `useReducer` | 복잡한 state update 정리 |
| `useContext` | 위쪽 트리에서 제공한 값 읽기 |
| `useMemo` | 계산 결과 캐시 |
| `useCallback` | 함수 identity 캐시 |

Hook은 컴포넌트 또는 custom Hook의 top level에서 호출합니다. 조건문, 반복문, 중첩 함수 안에서는 호출하지 않습니다.

Custom Hook 이름은 `use`로 시작합니다.
