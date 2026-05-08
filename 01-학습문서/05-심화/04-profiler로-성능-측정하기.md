# Profiler로 성능 측정하기

성능 최적화는 감으로 시작하면 거의 항상 과해집니다. 심화 단계에서는 "느린 것 같다"를 "어떤 사용자 행동에서 어떤 컴포넌트가 얼마나 오래 걸린다"로 바꾸는 연습을 합니다.

React에서는 React DevTools Profiler를 먼저 사용하고, 필요하면 `<Profiler>` API로 특정 영역의 렌더링 비용을 기록할 수 있습니다.

## 무엇을 측정할까

측정은 코드 전체가 아니라 사용자 행동 하나에서 시작합니다.

- 검색어를 입력한다.
- 필터를 바꾼다.
- 탭을 전환한다.
- 큰 목록에서 항목을 선택한다.
- modal을 연다.

이 행동을 기준으로 "어떤 컴포넌트가 렌더링되었는지", "렌더링에 얼마나 걸렸는지", "왜 렌더링되었는지"를 봅니다.

## React DevTools Profiler로 보는 것

Profiler에서 먼저 볼 지표는 다음입니다.

| 볼 것 | 의미 |
| --- | --- |
| commit 시간 | 한 번의 DOM 반영까지 걸린 시간 |
| 느린 컴포넌트 | 렌더링 비용이 큰 컴포넌트 |
| render reason | props, state, context 중 무엇이 바뀌었는지 |
| flamegraph | 렌더링 비용이 어디에 몰리는지 |

렌더링 횟수만 보고 바로 최적화하지 않습니다. 빠른 렌더링이 여러 번 일어나는 것보다 느린 렌더링 한 번이 더 문제가 될 수 있습니다.

## `<Profiler>` API

특정 영역을 코드로 측정하고 싶을 때 `<Profiler>`를 사용할 수 있습니다.

```tsx
import { Profiler } from "react";

function App() {
  return (
    <Profiler id="SearchResults" onRender={handleRender}>
      <SearchResults />
    </Profiler>
  );
}

function handleRender(
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number,
) {
  console.log({ id, phase, actualDuration });
}
```

`actualDuration`은 해당 업데이트에서 실제 렌더링에 걸린 시간을 보여줍니다. 이 값으로 최적화 전후를 비교할 수 있습니다.

## 측정 전후 기록하기

성능 작업은 기록이 중요합니다.

```md
## 검색 필터 성능 측정

- 행동: keyword input에 10글자 입력
- 변경 전: SearchResults update 평균 38ms
- 원인: 5,000개 item을 매 입력마다 정렬
- 변경: 정렬 결과 useMemo 적용, 목록 컴포넌트 분리
- 변경 후: 평균 12ms
- 남은 문제: DOM node 수가 많아 스크롤이 느림
```

이런 기록이 있어야 memoization을 왜 넣었는지 나중에도 설명할 수 있습니다.

## 흔한 오판

### 콘솔 로그만 보고 판단하기

```tsx
console.log("render");
```

콘솔 로그는 렌더링이 일어났는지는 보여주지만 비용은 알려주지 않습니다. Strict Mode에서는 개발 환경에서 더 많이 찍힐 수도 있습니다.

### 모든 자식 렌더링을 막으려 하기

React 컴포넌트 함수가 다시 실행되는 것은 정상입니다. 모든 렌더링을 막는 것이 목표가 아니라, 사용자에게 느린 렌더링을 줄이는 것이 목표입니다.

### 측정 없이 memoization 넣기

`memo`, `useMemo`, `useCallback`은 코드 복잡도를 늘립니다. 실제로 빨라지는지 측정하지 않으면 유지보수 비용만 생길 수 있습니다.

## 브라우저 Performance 탭

React DevTools Profiler는 컴포넌트 렌더링 비용을 봅니다. 브라우저 Performance 탭은 전체 JavaScript 실행, 레이아웃, 페인트를 봅니다.

사용자가 느리다고 느끼는 원인이 React 렌더링인지, DOM 레이아웃 비용인지, 네트워크인지를 구분할 때 브라우저 Performance 탭을 씁니다.

- Long Tasks: 50ms 이상 메인 스레드를 점유하는 작업 단위
- Layout Shift: 화면 요소가 예기치 않게 이동하는 현상 (CLS)
- FPS: 스크롤이나 애니메이션이 60fps를 유지하는지

React 렌더링이 문제라면 DevTools Profiler에서 잡힙니다. 레이아웃이나 CSS 애니메이션이 문제라면 브라우저 Performance 탭에서 찾습니다.

## 성능 작업 흐름

측정 → 원인 파악 → 수정 → 재측정 순서를 지킵니다.

```md
## 성능 작업 기록

### 문제
- 행동: 검색 input에 한 글자씩 입력
- 증상: 입력할 때마다 화면이 버벅임

### 측정 (수정 전)
- ProductList update: 평균 48ms
- render reason: keyword state 변경
- 느린 원인: 3,000개 item을 매 입력마다 filter + sort

### 수정
- filter 결과를 useMemo로 캐시
- keyword state를 SearchInput 안으로 이동
- ProductChart를 SearchSection 밖으로 분리

### 측정 (수정 후)
- ProductList update: 평균 11ms
- 입력 응답이 60fps 유지

### 남은 과제
- DOM node 수가 많아 스크롤이 여전히 느림 → pagination 검토
```

이 기록이 있어야 "왜 이 최적화를 했는지"를 코드 리뷰나 면접에서 설명할 수 있습니다.

## 읽으면서 생각할 질문

- 느린 사용자 행동을 하나로 좁혔는가?
- 렌더링 횟수와 실제 렌더링 비용을 구분했는가?
- 최적화 전후 지표를 기록했는가?
- Strict Mode 때문에 로그가 더 많이 찍히는 상황은 아닌가?
- memoization보다 state 위치 조정이 먼저 필요한가?
- 느린 원인이 React 렌더링인지, DOM 레이아웃인지, 네트워크인지 구분했는가?
