# React 렌더링 모델

컴포넌트 함수가 다시 실행되는 것은 자연스러운 일입니다.

React는 state나 props가 바뀌면 새 UI를 계산합니다. 이 계산이 렌더링입니다. 렌더링과 실제 DOM 변경은 같은 말이 아닙니다.

## Trigger, Render, Commit

React 업데이트는 크게 세 단계로 봅니다.

| 단계 | 의미 | 확인할 것 |
| --- | --- | --- |
| Trigger | state, props, context 변경으로 업데이트가 시작됩니다. | 어떤 값이 바뀌었는가? |
| Render | 컴포넌트 함수가 실행되어 다음 UI를 계산합니다. | 계산이 느린가? 너무 넓게 실행되는가? |
| Commit | 계산 결과 중 실제 변경이 DOM에 반영됩니다. | DOM 변경이 많거나 layout 비용이 큰가? |

렌더링이 일어났다고 항상 DOM이 크게 바뀌는 것은 아닙니다. React는 이전 결과와 다음 결과를 비교해 필요한 변경만 commit합니다.

## Reconciliation과 Diffing

React는 이전 렌더 결과와 새 렌더 결과를 비교해 실제로 바뀐 DOM 노드만 업데이트합니다. 이 과정을 Reconciliation이라 하고, 내부 비교 알고리즘을 Diffing이라 합니다.

Diffing 기본 규칙은 두 가지입니다.

**1. 타입이 바뀌면 서브트리 전체를 교체합니다.**

```tsx
// 이전
<div>
  <Counter />
</div>

// 이후 (div → section으로 변경)
<section>
  <Counter />
</section>
```

부모 타입이 `div`에서 `section`으로 바뀌면 `Counter` state가 초기화됩니다. 같은 위치에 같은 컴포넌트처럼 보여도 타입이 다르면 마운트부터 다시 합니다.

**2. 같은 타입이면 props만 업데이트합니다.**

```tsx
// 이전
<Input placeholder="검색어" />

// 이후
<Input placeholder="키워드" />
```

`Input` 인스턴스는 유지되고 `placeholder` prop만 바뀝니다. state도 보존됩니다.

## key가 Reconciliation에 미치는 영향

key는 목록 내 항목의 identity를 알려줍니다. key가 없으면 인덱스로 위치를 판단합니다.

```tsx
// key 없음 — 인덱스 기준
items.map((item, i) => <Row item={item} />)

// key 있음 — id 기준
items.map((item) => <Row key={item.id} item={item} />)
```

목록 앞에 항목을 삽입하면:
- 인덱스 기준: 모든 항목이 props 변경 + 마지막 항목 새로 마운트
- id 기준: 실제로 추가된 항목만 마운트, 나머지는 props 업데이트

목록 외부에서도 `key`를 활용할 수 있습니다. `key`를 바꾸면 컴포넌트가 새로 마운트됩니다.

```tsx
// selectedUserId가 바뀔 때 ProfileEditor state 초기화
<ProfileEditor key={selectedUserId} userId={selectedUserId} />
```

## State 업데이트 배칭

React 18부터 모든 상황에서 자동 배칭이 기본 적용됩니다. 같은 이벤트 핸들러 안에서 여러 setState를 호출해도 렌더링은 한 번만 일어납니다.

```tsx
function handleClick() {
  setCount((c) => c + 1);
  setFlag(true);
  setName("Alice");
  // 렌더링 1회만 발생
}
```

React 17 이전에는 이벤트 핸들러 내부에서만 배칭이 됐습니다. setTimeout이나 Promise 콜백에서는 각각 렌더링이 발생했습니다.

```tsx
// React 17 이전 — Promise 안에서는 배칭 안 됨
fetch("/api/data").then(() => {
  setCount((c) => c + 1); // 렌더링 1회
  setLoading(false);       // 렌더링 1회 추가
});

// React 18 — 자동 배칭
fetch("/api/data").then(() => {
  setCount((c) => c + 1); // 배칭됨
  setLoading(false);       // 배칭됨 → 렌더링 1회
});
```

배칭을 의도적으로 끊어야 할 때는 `flushSync`를 씁니다.

```tsx
import { flushSync } from "react-dom";

function handleClick() {
  flushSync(() => {
    setCount((c) => c + 1);
  }); // 이 시점에 DOM 업데이트 완료

  // DOM이 업데이트된 상태에서 실행
  inputRef.current?.focus();
}
```

## 동시성 렌더링 (Concurrent Rendering)

React 18에서 도입된 동시성 모드는 렌더링을 중단, 재개, 포기할 수 있게 합니다.

**이전 방식 (동기 렌더링)**
- 렌더링 시작 → 중간에 멈출 수 없음 → 완료까지 메인 스레드 점유
- 긴 렌더링이 있으면 클릭, 입력이 막힘

**동시성 렌더링**
- 긴급한 업데이트(입력, 클릭)는 즉시 처리
- 급하지 않은 업데이트(검색 결과 목록 등)는 뒤로 미룰 수 있음

동시성 기능을 사용하는 API:
- `useTransition` / `startTransition`: 일부 업데이트를 transition으로 표시해 입력 반응성 유지
- `useDeferredValue`: 값의 업데이트를 낮은 우선순위로 처리
- `Suspense`: 아직 준비되지 않은 컴포넌트를 기다리는 동안 fallback 표시

```tsx
const [isPending, startTransition] = useTransition();

function handleTabChange(tab: string) {
  startTransition(() => {
    setSelectedTab(tab); // 급하지 않은 업데이트
  });
}
```

`startTransition` 안에 넣은 업데이트는 긴급한 업데이트(input 입력)에 의해 중단되고 나중에 재개될 수 있습니다.

## 렌더링 횟수와 렌더링 비용은 다르다

아래 두 상황은 다르게 봐야 합니다.

- 자주 렌더링되지만 계산이 가볍다.
- 가끔 렌더링되지만 계산이 매우 무겁다.

첫 번째는 문제가 아닐 수 있습니다. 두 번째는 사용자가 느리다고 느낄 수 있습니다. 그래서 "왜 렌더링됐지?"보다 먼저 "이 렌더링이 실제로 느린가?"를 봅니다.

```tsx
function Summary({ items }: { items: Item[] }) {
  const completedCount = items.filter((item) => item.done).length;

  return <p>{completedCount}개 완료</p>;
}
```

이 정도 계산은 대부분 memoization이 필요 없습니다. 반대로 수천 개 데이터를 정렬하고 복잡한 차트를 그리는 계산이라면 측정 후 최적화를 검토합니다.

## 부모가 렌더링되면 자식도 계산될 수 있다

부모 컴포넌트가 다시 렌더링되면 기본적으로 자식 컴포넌트 함수도 다시 실행될 수 있습니다.

```tsx
function Page() {
  const [keyword, setKeyword] = useState("");

  return (
    <>
      <SearchInput value={keyword} onChange={setKeyword} />
      <ExpensiveChart />
    </>
  );
}
```

`keyword`가 바뀔 때마다 `Page`가 다시 렌더링되고, `ExpensiveChart`도 계산될 수 있습니다. 이때 바로 `memo`를 붙이기 전에 구조를 봅니다.

- `keyword` state를 더 아래로 내릴 수 있는가?
- `ExpensiveChart`를 children으로 받아 부모 업데이트와 분리할 수 있는가?
- 실제로 Chart 렌더링이 느린가?
- props가 매번 새 객체/함수로 바뀌고 있지는 않은가?

**children prop으로 분리하기**

```tsx
function SearchSection({ children }: { children: React.ReactNode }) {
  const [keyword, setKeyword] = useState("");

  return (
    <>
      <SearchInput value={keyword} onChange={setKeyword} />
      {children}
    </>
  );
}

function Page() {
  return (
    <SearchSection>
      <ExpensiveChart /> {/* keyword 변경에 영향받지 않음 */}
    </SearchSection>
  );
}
```

`ExpensiveChart`는 `Page`가 props로 전달하고, `keyword` state를 갖는 `SearchSection`이 아니라 `Page`의 렌더 결과에 의존합니다. `keyword` 변경이 `ExpensiveChart` 재렌더를 유발하지 않습니다.

## Strict Mode에서 렌더링이 더 많이 보일 수 있다

개발 환경의 Strict Mode는 순수하지 않은 렌더링을 찾기 위해 일부 함수를 한 번 더 호출할 수 있습니다. 이 때문에 콘솔 로그만 보고 "프로덕션도 두 번 렌더링된다"고 판단하면 안 됩니다.

렌더링 중에는 외부 상태를 바꾸거나, DOM을 직접 조작하거나, 네트워크 요청을 보내지 않습니다. 렌더링은 같은 입력에 대해 같은 JSX를 계산하는 순수한 과정이어야 합니다.

## 최적화 순서

1. 사용자가 느리다고 느끼는 구체적인 행동을 정합니다.
2. Profiler로 어떤 컴포넌트가 오래 걸리는지 봅니다.
3. state 위치와 컴포넌트 분리로 업데이트 범위를 줄일 수 있는지 봅니다.
4. 계산이 비싸면 `useMemo`를 검토합니다.
5. props가 안정적인데도 자식 렌더링이 비싸면 `memo`를 검토합니다.
6. 목록 자체가 크면 pagination이나 virtualization을 검토합니다.

## 읽으면서 생각할 질문

- 느리다고 느낀 부분을 실제로 측정했는가?
- 렌더링 횟수와 렌더링 비용을 구분했는가?
- 큰 목록을 한 번에 다 그리고 있지는 않은가?
- state 위치 때문에 너무 넓은 영역이 업데이트되는가?
- 최적화보다 컴포넌트 분리가 먼저 필요한 상황인가?
- children prop으로 렌더링 범위를 좁힐 수 있는가?
- 자동 배칭이 기대한 대로 동작하는지 확인했는가?
- 동시성 기능(useTransition, useDeferredValue)이 필요한 상황인지 판단했는가?
