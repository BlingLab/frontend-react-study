# 3단계. 중급

중급 단계에서는 "컴포넌트를 만들 수 있다"에서 한 단계 더 나아가, 앱이 실제로 복잡해질 때 필요한 React 사고방식을 다룹니다.

핵심은 세 가지입니다.

- React 안에서 계산할 수 있는 일과 React 바깥 시스템과 맞춰야 하는 일을 구분합니다.
- loading, error, empty, success처럼 사용자가 실제로 마주하는 UI 상태를 명확히 나눕니다.
- 반복되는 상태 로직, 화면 구조, URL 상태를 이름 붙여 관리합니다.

중급을 지나면 `useEffect`를 아무 데나 넣지 않고, state를 무작정 늘리지 않고, 컴포넌트를 더 작고 읽기 쉬운 단위로 나눌 수 있어야 합니다.

## 읽을 문서

1. [Effect를 생각하는 법](./01-effect를-생각하는법.md)
2. [Fetching 상태 나누기](./02-fetching-상태-나누기.md)
3. [Custom Hook 만들기](./03-custom-hook-만들기.md)
4. [Router 감각 잡기](./04-router-감각-잡기.md)
5. [Ref와 DOM 다루기](./05-ref와-DOM-다루기.md)
6. [Derived state와 계산값](./06-derived-state와-계산값.md)
7. [컴포넌트 분리와 합성](./07-컴포넌트-분리와-합성.md)
8. [비동기 UI 패턴](./08-비동기-UI-패턴.md)
9. [useId와 접근성 연결](./09-useId와-접근성-연결.md)
10. [Controlled와 uncontrolled form](./10-controlled와-uncontrolled-form.md)
11. [Key와 state 보존](./11-key와-state-보존.md)
12. [Portal과 modal](./12-portal과-modal.md)
13. [Lazy loading과 코드 분할](./13-lazy-loading과-코드분할.md)
14. [useDeferredValue와 느린 UI 다루기](./14-useDeferredValue와-느린-UI-다루기.md)

## 이 단계의 목표

- Effect가 필요한 상황과 필요 없는 상황을 구분합니다.
- loading, error, empty, success 상태를 나눕니다.
- 반복되는 상태 로직을 custom Hook으로 분리합니다.
- URL도 UI 상태의 일부로 볼 수 있게 됩니다.
- `ref`를 state와 구분해서 사용할 수 있습니다.
- props/state에서 계산 가능한 값을 별도 state로 저장하지 않습니다.
- 컴포넌트를 "파일을 나누는 것"이 아니라 "책임을 나누는 것"으로 이해합니다.
- 비동기 작업에서 stale response, retry, disabled, empty UI를 고려합니다.
- label, description, error message를 안정적인 id로 연결합니다.
- controlled form과 uncontrolled form을 상황에 맞게 고릅니다.
- `key`가 목록 식별뿐 아니라 state 보존과 초기화에도 영향을 준다는 점을 이해합니다.
- modal, tooltip처럼 DOM 위치가 중요한 UI를 portal로 분리할 수 있습니다.
- `lazy`와 `Suspense`로 코드 로딩 경계를 나눌 수 있습니다.
- 느린 목록 때문에 입력이 버벅일 때 `useDeferredValue`를 고려할 수 있습니다.

## 외부 자료 기준의 분류

React 공식 문서의 Escape Hatches 흐름은 ref, Effect, custom Hook을 "React 바깥으로 나가는 통로"로 묶습니다. 그래서 중급 단계는 단순히 Hook을 많이 외우는 구간이 아니라, React 내부 계산과 외부 시스템 동기화를 구분하는 구간입니다.

| 분류 | 이 단계에서 배우는 이유 |
| --- | --- |
| Effect | 브라우저 API, 네트워크, 타이머 같은 외부 시스템과 동기화합니다. |
| fetching 상태 | 서버 요청의 loading/error/empty/success를 UI로 분리합니다. |
| custom Hook | 반복 상태 로직에 이름을 붙여 컴포넌트에서 분리합니다. |
| router 감각 | URL을 공유 가능하고 복원 가능한 UI state로 봅니다. |
| ref | 렌더링과 무관한 값 또는 DOM 노드를 다룹니다. |
| portal/lazy/deferred | 실제 UI에서 DOM 위치, 코드 로딩, 느린 렌더링을 다룹니다. |

중급에서는 고급 상태 관리 도구를 먼저 도입하기보다, 컴포넌트 하나 또는 기능 하나 안에서 생기는 복잡도를 명확히 정리하는 데 집중합니다.

## 연결되는 예제

- 예제 안내: [02-학습예제/03-중급](../../02-학습예제/03-중급/README.md)
- 실행 명령: `pnpm run 예제:중급`
- 실제 코드: `src/examples/EffectsFetchingExample.tsx`
- 실제 코드: `src/examples/CustomHooksExample.tsx`
- 실제 코드: `src/examples/IntermediatePatternsExample.tsx`

## 빠른 정리

### Effect는 escape hatch입니다

Effect가 필요한 경우는 React 바깥의 시스템과 연결될 때입니다. 외부 시스템이 없으면 먼저 Effect를 제거할 방법을 찾습니다.

| 상황 | 예 |
| --- | --- |
| 브라우저 API 구독 | resize, scroll |
| 네트워크 요청 | fetch |
| 타이머 | setInterval |
| 외부 라이브러리 | map, chart instance |

Effect가 아닐 수 있는 경우도 먼저 봅니다.

- props/state에서 계산 가능한 값
- 클릭 이벤트에서 처리할 수 있는 로직
- form submit 결과 처리
- 부모와 자식 state를 억지로 동기화하는 코드

```tsx
useEffect(() => {
  const id = window.setInterval(tick, 1000);
  return () => window.clearInterval(id);
}, []);
```

### 중급에서 자주 쓰는 판단표

| 하고 싶은 일 | 먼저 생각할 도구 |
| --- | --- |
| 입력값을 화면에 반영 | `useState` |
| 기존 state로 필터링/정렬 | 렌더링 중 계산, 필요하면 `useMemo` |
| DOM에 focus 주기 | `useRef` |
| 브라우저 이벤트 구독 | `useEffect`와 cleanup |
| API 요청 결과 표시 | loading/error/empty/success 상태 |
| 반복되는 상태 로직 재사용 | custom Hook |
| 뒤로 가기/새로고침에 남아야 하는 값 | URL search params 또는 router state |
| 여러 화면에서 같은 레이아웃 공유 | component composition |
| label과 error message 연결 | `useId` |
| 큰 form 입력 관리 | controlled/uncontrolled 판단 |
| 특정 화면 state 초기화 | `key` 변경 |
| modal을 body 아래에 렌더링 | portal |
| 처음부터 필요 없는 화면 코드 | `lazy`와 `Suspense` |
| 느린 목록 업데이트 지연 | `useDeferredValue` |

### 중급 체크리스트

- 이 값은 state인가, 계산값인가?
- 이 Effect는 외부 시스템과 동기화하는가?
- 요청 실패와 빈 결과를 서로 다른 UI로 보여주는가?
- 사용자가 다시 시도할 방법이 있는가?
- Hook 이름만 보고 목적을 이해할 수 있는가?
- 컴포넌트가 너무 많은 책임을 동시에 들고 있지 않은가?
- URL로 직접 들어와도 같은 화면을 복원할 수 있는가?
