# 고급 예제

## 연결되는 학습문서

- [고급 문서](../../01-학습문서/04-고급/README.md)
- [Reducer로 변경 규칙 모으기](../../01-학습문서/04-고급/01-reducer로-변경규칙-모으기.md)
- [Context를 필요한 만큼 쓰기](../../01-학습문서/04-고급/02-context를-필요한만큼-쓰기.md)
- [State를 분류하고 배치하기](../../01-학습문서/04-고급/03-state를-분류하고-배치하기.md)
- [Transition과 pending UI](../../01-학습문서/04-고급/04-transition과-pending-UI.md)
- [useSyncExternalStore와 외부 store](../../01-학습문서/04-고급/05-useSyncExternalStore와-외부-store.md)
- [Error Boundary로 렌더링 오류 다루기](../../01-학습문서/04-고급/06-error-boundary로-렌더링-오류-다루기.md)
- [Optimistic UI 설계하기](../../01-학습문서/04-고급/07-optimistic-UI-설계하기.md)
- [Server state와 Query cache](../../01-학습문서/04-고급/08-server-state와-query-cache.md)
- [useEffectEvent와 비반응 로직](../../01-학습문서/04-고급/09-useEffectEvent와-비반응-로직.md)
- [Form Action과 useActionState](../../01-학습문서/04-고급/10-form-action과-useActionState.md)

## 실행 명령

```bash
pnpm run 예제:고급
```

각 예제를 바로 열고 싶다면 아래 명령을 사용합니다.

```bash
pnpm run 예제:reducer
pnpm run 예제:transition
pnpm run 예제:optimistic
pnpm run 예제:error-boundary
```

빌드 결과로 확인하려면 다음 명령을 사용합니다.

```bash
pnpm run 미리보기:고급
```

## 확인할 코드

- `src/examples/ContextReducerExample.tsx`
- `src/examples/TransitionExample.tsx`
- `src/examples/OptimisticExample.tsx`
- `src/examples/ErrorBoundaryExample.tsx`

## 예제별 집중 포인트

| 예제 | 먼저 볼 것 | 핵심 질문 |
| --- | --- | --- |
| Context Reducer | action type, reducer, provider 범위 | 변경 규칙이 컴포넌트 안에 흩어지지 않았는가? |
| Context Reducer | state context와 dispatch context | 읽는 컴포넌트와 변경하는 컴포넌트가 분리되는가? |
| Transition | urgent state와 transition state | 사용자가 즉시 봐야 하는 update는 무엇인가? |
| Optimistic UI | optimistic item, pending 상태, 실패 복구 | 서버 실패 후 사용자가 현재 상태를 이해할 수 있는가? |
| Error Boundary | boundary 위치, reset 버튼 | 오류가 전체 앱이 아니라 기능 단위로 격리되는가? |
| Form Action | 제출 state, pending 버튼, validation message | form 제출 결과를 Action 흐름으로 설명할 수 있는가? |

## 직접 바꿔볼 것

- reducer에 새 action을 추가합니다.
- action 이름을 사용자 의도 중심으로 바꿔봅니다.
- Context provider 범위가 어디까지 필요한지 확인합니다.
- state context와 dispatch context가 왜 분리되어 있는지 설명합니다.
- `TransitionExample`에서 `startTransition`을 제거하고 탭 전환 시 input이 막히는지 확인합니다.
- `isPending`을 활용해 로딩 스피너나 skeleton UI를 만들어봅니다.
- `OptimisticExample`에서 실패 확률을 100%로 바꿔보고 낙관적 항목이 사라지는지 확인합니다.
- optimistic update가 실패했을 때 사용자에게 어떻게 알려야 하는지 설계해 봅니다.
- Error Boundary가 잡는 오류와 잡지 못하는 오류를 구분합니다.
- 같은 서버 데이터를 여러 컴포넌트가 요청한다면 query cache가 필요한지 판단합니다.
- Effect dependency를 줄이고 싶을 때 구조 변경과 `useEffectEvent` 중 무엇이 맞는지 비교합니다.
- form 제출을 `onSubmit`으로 처리하는 방식과 `useActionState`로 처리하는 방식을 비교합니다.

## 확장 과제

| 과제 | 의도 |
| --- | --- |
| reducer action을 `item/added`, `item/toggled`처럼 사용자 의도로 이름 변경 | action을 구현 세부가 아니라 사건으로 읽는 연습 |
| provider 범위를 일부 화면으로 좁혀보기 | Context를 전역 store처럼 쓰지 않는 감각 |
| transition pending 상태를 skeleton 대신 작은 status text로 변경 | pending UI의 범위를 의식하는 연습 |
| optimistic 실패 시 toast 대신 항목 옆 error 상태 표시 | 실패 복구를 사용자 행동과 연결 |
| Error Boundary를 예제 전체와 작은 섹션에 각각 적용 | 오류 격리 범위 비교 |
| `useFormStatus`로 submit 버튼을 별도 컴포넌트로 분리 | form 내부 pending 상태를 props 없이 읽는 연습 |

## 설명 질문

- 이 state는 local UI state, shared client state, server state 중 무엇인가?
- reducer를 쓰면 코드가 늘어나는데도 선택할 만한 기준은 무엇인가?
- Context가 필요한 값과 props로 충분한 값은 어떻게 구분하는가?
- optimistic update가 적합하지 않은 사용자 행동은 무엇인가?
- `useActionState`가 기존 `onSubmit` 패턴보다 유용해지는 조건은 무엇인가?
