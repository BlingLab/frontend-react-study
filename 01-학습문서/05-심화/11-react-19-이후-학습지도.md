# React 19 이후 학습 지도

React를 어느 정도 읽고 만들 수 있게 되면 새로운 API 이름이 많이 보입니다. `useActionState`, `useOptimistic`, `use`, React Compiler, Server Components, `cache`, `Activity`, `ViewTransition` 같은 이름이 한꺼번에 나오면 무엇을 지금 배워야 하는지 헷갈립니다.

이 문서는 API 목록을 외우기 위한 문서가 아닙니다. 각 기능이 어떤 문제를 해결하는지, 이 저장소 같은 Vite 클라이언트 앱에서 바로 써볼 수 있는지, 프레임워크와 함께 배워야 하는지를 구분합니다.

## 먼저 구분할 것

| 분류 | 예 | 지금 이 저장소에서 직접 연습하기 |
| --- | --- | --- |
| Client React API | `useTransition`, `useDeferredValue`, `useOptimistic`, `useActionState`, `useEffectEvent` | 가능 |
| React DOM form API | `<form action={fn}>`, `useFormStatus` | 가능 |
| Suspense 기반 로딩 | `lazy`, `<Suspense>`, `use` 일부 패턴 | 일부 가능 |
| React Compiler | 자동 memoization | 빌드 설정 필요 |
| Server Components | RSC, `cache`, `cacheSignal`, server-only 데이터 로딩 | 프레임워크 필요 |
| Canary API | `<Activity>`, `<ViewTransition>` | 안정 API가 아니므로 읽기 중심 |

학습 순서는 "지금 쓸 수 있는 Client API"를 먼저 잡고, 그 다음에 framework/server 영역으로 넘어가는 것이 좋습니다.

## React 19에서 꼭 봐야 할 축

### 1. Action

Action은 사용자 행동이 비동기 작업을 만들고, 그 작업이 pending/success/error UI로 이어지는 흐름을 표현합니다.

대표 API:

- `useTransition`: 긴급하지 않은 update 표시
- `useActionState`: form action 결과 state 관리
- `<form action={fn}>`: 제출 동작을 함수로 연결
- `useFormStatus`: form 안에서 제출 pending 읽기
- `useOptimistic`: 응답 전에 임시 UI 표시

Action을 배우면 "저장 버튼을 누른다"를 단순 event handler가 아니라 아래 흐름으로 볼 수 있습니다.

```txt
사용자 제출
-> pending 표시
-> optimistic UI 선택
-> 서버 요청
-> 성공 state 또는 오류 state
-> 필요하면 캐시 갱신
```

고급 단계의 [Form Action과 useActionState](../04-고급/10-form-action과-useActionState.md)에서 먼저 연습합니다.

### 2. Effect 정리

React 19 기준으로 `useEffectEvent`가 공식 API Reference에 포함되어 있습니다. 이 Hook은 Effect 안에서 최신 props/state를 읽되, 그 값 때문에 외부 시스템을 다시 동기화하고 싶지 않을 때 사용합니다.

다만 `useEffectEvent`는 dependency를 숨기는 도구가 아닙니다.

| 상황 | 선택 |
| --- | --- |
| 값이 바뀌면 외부 연결도 다시 해야 함 | Effect dependency에 포함 |
| 연결은 유지하고 callback에서 최신 값만 읽음 | `useEffectEvent` 후보 |
| 사용자 클릭에 반응함 | event handler |
| 계산 가능한 값 | 렌더링 중 계산 |

Effect를 잘 쓰는 사람은 Effect를 많이 쓰는 사람이 아니라, Effect가 필요 없는 코드를 먼저 제거하는 사람입니다.

### 3. Suspense와 use

`Suspense`는 loading boundary입니다. `lazy`로 코드 로딩을 늦출 때는 이 저장소에서도 바로 연습할 수 있습니다.

`use`는 Promise나 context 같은 resource 값을 읽는 API입니다. 하지만 데이터 fetching을 `use(fetch(...))`처럼 직접 모든 클라이언트 컴포넌트에 퍼뜨리는 방식으로 이해하면 곤란합니다. Suspense 지원 데이터 소스, 라우터, 프레임워크의 캐시 정책과 함께 봐야 합니다.

학습 기준:

- 코드 분할: `lazy` + `Suspense`부터 연습
- 데이터 로딩: 먼저 loading/error/empty/success를 직접 설계
- Suspense 데이터: 사용하는 프레임워크가 어떤 캐시와 revalidation을 제공하는지 함께 확인

### 4. Compiler

React Compiler는 수동 `memo`, `useMemo`, `useCallback`의 필요를 줄이는 방향입니다. 하지만 Compiler가 상태 위치, 큰 목록, server state, accessibility를 대신 설계하지는 않습니다.

Compiler를 공부할 때는 아래 순서가 좋습니다.

1. 렌더링이 순수해야 한다는 원칙을 이해합니다.
2. `memo`, `useMemo`, `useCallback`이 왜 필요했는지 이해합니다.
3. Compiler가 자동화하는 영역을 봅니다.
4. Compiler가 해결하지 않는 구조 문제를 분리합니다.
5. 빌드 도구와 lint 설정을 확인합니다.

Compiler는 "아무 생각 없이 최적화해주는 도구"가 아니라, React 규칙을 잘 지킨 코드를 더 효율적으로 실행하게 돕는 도구입니다.

## 지금 바로 익힐 API

| API | 먼저 물어볼 질문 | 관련 문서 |
| --- | --- | --- |
| `useTransition` | 이 update는 입력보다 덜 긴급한가? | [Transition과 pending UI](../04-고급/04-transition과-pending-UI.md) |
| `useDeferredValue` | 이 값은 조금 늦게 따라와도 되는가? | [useDeferredValue와 느린 UI 다루기](../03-중급/14-useDeferredValue와-느린-UI-다루기.md) |
| `useOptimistic` | 실패해도 되돌릴 수 있는 행동인가? | [Optimistic UI 설계하기](../04-고급/07-optimistic-UI-설계하기.md) |
| `useActionState` | form 제출 결과 state가 필요한가? | [Form Action과 useActionState](../04-고급/10-form-action과-useActionState.md) |
| `useEffectEvent` | Effect 재동기화 없이 최신 값만 읽어야 하는가? | [useEffectEvent와 비반응 로직](../04-고급/09-useEffectEvent와-비반응-로직.md) |
| `memo` / `useMemo` / `useCallback` | 실제 병목을 측정했는가? | [Memoization 판단하기](./02-memoization-판단하기.md) |

## 프레임워크와 함께 배울 것

React 자체만으로는 전체 앱 데이터 흐름을 모두 정하지 않습니다. 특히 아래 주제는 라우터나 프레임워크 선택과 강하게 연결됩니다.

| 주제 | 함께 봐야 하는 것 |
| --- | --- |
| Server Components | Next.js, React Router RSC 모드, 번들 경계 |
| Server Actions | form 제출 위치, 보안, revalidation |
| Streaming SSR | Suspense boundary, HTML 스트리밍, hydration |
| `cache`, `cacheSignal` | 서버 렌더링 중 요청 중복 제거와 abort |
| route data loading | loader/action, query cache, prefetch |

이 저장소에서는 먼저 클라이언트 React 사고방식을 잡습니다. Server Components는 별도 프레임워크 프로젝트에서 다루는 편이 더 정확합니다.

## Canary API를 읽는 법

공식 문서에는 Canary와 Experimental 채널 API도 보입니다. 예를 들어 `<Activity>`와 `<ViewTransition>`은 문서가 있어도 안정 릴리스에서 바로 쓸 API로 보면 안 됩니다.

Canary API를 볼 때는 아래를 확인합니다.

| 확인할 것 | 이유 |
| --- | --- |
| 안정 채널 API인가? | 현재 프로젝트에서 설치한 React 버전과 맞아야 함 |
| Canary 표시가 있는가? | 실험 API는 이름과 동작이 바뀔 수 있음 |
| framework가 지원하는가? | 라우터, 빌드, SSR과 연결될 수 있음 |
| polyfill이나 브라우저 제약이 있는가? | View Transition 같은 기능은 브라우저 API와도 연결됨 |
| 대체 가능한 안정 패턴이 있는가? | 지금 제품 코드에 넣기 전에 안정 대안을 검토 |

Canary API는 "미래 방향을 읽는 자료"로는 유용하지만, 학습 저장소의 본 흐름에는 안정 API를 우선 배치합니다.

## 학습 우선순위

### 1순위: 매일 쓰는 설계

- state 위치 정하기
- derived state 줄이기
- Effect 제거 또는 분리
- loading/error/empty/success 설계
- 접근성 label, focus, keyboard 흐름

### 2순위: React 19 클라이언트 API

- `useTransition`
- `useDeferredValue`
- `useActionState`
- `useOptimistic`
- `useEffectEvent`
- form action과 `useFormStatus`

### 3순위: 성능과 빌드

- Profiler로 측정
- 큰 목록의 렌더링 범위 줄이기
- React Compiler 도입 조건
- lazy loading과 Suspense boundary

### 4순위: 서버/프레임워크

- Server Components
- Server Actions
- streaming SSR
- route loader/action
- query cache와 revalidation

이 순서를 따르면 새 API를 API 이름으로 외우지 않고, 실제 문제와 연결해서 익힐 수 있습니다.

## 기술 선택 예시

게시글 작성 기능을 만든다고 가정합니다.

| 요구사항 | 선택 |
| --- | --- |
| 제목 입력 중 글자 수 표시 | controlled input |
| 제출 중 버튼 disabled | `useActionState` 또는 local pending state |
| 제출 직후 목록에 임시 글 표시 | `useOptimistic` |
| 실패하면 임시 글에 재시도 버튼 | optimistic item 상태 |
| 작성 성공 후 목록 최신화 | query cache invalidation 또는 refetch |
| 작성 페이지가 서버에서 렌더링됨 | framework action/revalidation 확인 |

요구사항이 늘어날수록 API가 하나씩 붙습니다. 반대로 단순 form이라면 `onSubmit` 하나가 더 읽기 쉬울 수 있습니다.

## 읽으면서 생각할 질문

- 이 API는 클라이언트 React만으로 연습 가능한가?
- 이 문제는 state 위치 조정으로 먼저 해결할 수 있는가?
- 새 API가 없으면 동작하지 않는가, 아니면 더 편해지는가?
- 실패, pending, empty 상태가 함께 설계되어 있는가?
- 공식 문서에서 안정 API인지 Canary API인지 확인했는가?
- 프레임워크의 데이터 정책과 연결되는 주제인가?
