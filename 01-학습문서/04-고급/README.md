# 4단계. 고급

앱이 커질 때 상태 변경 규칙과 데이터 전달 흐름을 정리하는 단계입니다.

## 읽을 문서

1. [Reducer로 변경 규칙 모으기](./01-reducer로-변경규칙-모으기.md)
2. [Context를 필요한 만큼 쓰기](./02-context를-필요한만큼-쓰기.md)
3. [State를 분류하고 배치하기](./03-state를-분류하고-배치하기.md)
4. [Transition과 pending UI](./04-transition과-pending-UI.md)
5. [useSyncExternalStore와 외부 store](./05-useSyncExternalStore와-외부-store.md)
6. [Error Boundary로 렌더링 오류 다루기](./06-error-boundary로-렌더링-오류-다루기.md)
7. [Optimistic UI 설계하기](./07-optimistic-UI-설계하기.md)
8. [Server state와 Query cache](./08-server-state와-query-cache.md)
9. [useEffectEvent와 비반응 로직](./09-useEffectEvent와-비반응-로직.md)

## 이 단계의 목표

- 복잡한 state 변경을 reducer로 정리합니다.
- Context를 전역 저장소처럼 남용하지 않습니다.
- 상태를 local, shared client, server로 나눠 봅니다.
- 상태 관리 도구보다 상태의 성격을 먼저 판단합니다.
- 사용자가 기다리는 동안 pending UI를 설계합니다.
- React 바깥 store와 안전하게 연결하는 방법을 이해합니다.
- 렌더링 중 발생한 오류를 Error Boundary로 격리합니다.
- optimistic update가 실패했을 때 복구 흐름까지 설계합니다.
- 서버에서 온 데이터는 local UI state와 다른 규칙으로 다룹니다.
- Effect 안에서 반응해야 하는 로직과 최신 값만 읽어야 하는 로직을 분리합니다.

## 외부 자료 기준의 분류

React 공식 문서의 Scaling Up with Reducer and Context, Full Stack Open의 state management 흐름, TanStack Query 문서가 공통으로 말하는 지점은 "앱이 커지면 상태의 종류를 먼저 나눠야 한다"는 것입니다.

| 분류 | 이 단계에서 배우는 이유 |
| --- | --- |
| reducer | 여러 event가 같은 state를 바꿀 때 변경 규칙을 한곳에 모읍니다. |
| context | 멀리 있는 컴포넌트에게 값을 전달하되 전역 store처럼 남용하지 않습니다. |
| state 분류 | local UI, shared client, server state를 구분합니다. |
| transition | 긴급한 update와 늦어도 되는 update를 나눕니다. |
| external store | React 바깥에서 바뀌는 값을 안전하게 구독합니다. |
| Error Boundary | 렌더링 오류를 기능 단위로 격리합니다. |
| server state cache | 서버 데이터의 stale, refetch, 중복 요청 문제를 다룹니다. |
| optimistic UI | 실패 복구까지 포함해 빠른 사용자 피드백을 설계합니다. |

고급 단계에서는 "어떤 라이브러리를 쓸까"보다 "이 상태가 어떤 종류인가"를 먼저 판단합니다. 도구 선택은 상태 분류 이후에 따라옵니다.

## 연결되는 예제

- 예제 안내: [02-학습예제/04-고급](../../02-학습예제/04-고급/README.md)
- 실행 명령: `pnpm run 예제:고급`
- 실제 코드: `src/examples/ContextReducerExample.tsx`
- 실제 코드: `src/examples/TransitionExample.tsx`
- 실제 코드: `src/examples/OptimisticExample.tsx`
- 실제 코드: `src/examples/ErrorBoundaryExample.tsx`

## 빠른 정리

| Hook | 목적 |
| --- | --- |
| `useState` | 컴포넌트 state 관리 |
| `useEffect` | 외부 시스템과 동기화 |
| `useReducer` | 복잡한 state update 정리 |
| `useContext` | 위쪽 트리에서 제공한 값 읽기 |
| `useMemo` | 계산 결과 캐시 |
| `useCallback` | 함수 identity 캐시 |
| `useTransition` | 일부 업데이트를 transition으로 표시 |
| `useSyncExternalStore` | React 바깥 store 구독 |
| `useEffectEvent` | Effect 안의 비반응 로직 분리 |

Hook은 컴포넌트 또는 custom Hook의 top level에서 호출합니다. 조건문, 반복문, 중첩 함수 안에서는 호출하지 않습니다.

Custom Hook 이름은 `use`로 시작합니다.

고급 단계에서는 도구 이름을 외우는 것보다 "왜 이 도구가 필요한 복잡도가 생겼는지"를 먼저 봅니다. `useTransition`, `useSyncExternalStore`, Error Boundary, optimistic UI는 단순한 화면보다 앱의 경계와 실패 상황을 다루는 기술입니다.

## 상태 분류 빠른 판단

| 상태 종류 | 예 | 먼저 볼 도구 |
| --- | --- | --- |
| Local UI state | input, tab, modal open | `useState` |
| 복잡한 local/shared state | 여러 action이 있는 todo, wizard | `useReducer` |
| 멀리 전달할 값 | theme, auth user, feature 설정 | Context |
| Server state | 게시글 목록, 검색 결과, 사용자 상세 | query cache 도구 |
| External store | 브라우저 상태, non-React store | `useSyncExternalStore` |
| Optimistic state | 좋아요 pending, 댓글 임시 추가 | `useOptimistic`, transition |
