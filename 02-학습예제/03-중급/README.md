# 중급 예제

## 연결되는 학습문서

- [중급 문서](../../01-학습문서/03-중급/README.md)
- [Effect를 생각하는 법](../../01-학습문서/03-중급/01-effect를-생각하는법.md)
- [Fetching 상태 나누기](../../01-학습문서/03-중급/02-fetching-상태-나누기.md)
- [Custom Hook 만들기](../../01-학습문서/03-중급/03-custom-hook-만들기.md)
- [Ref와 DOM 다루기](../../01-학습문서/03-중급/05-ref와-DOM-다루기.md)
- [Derived state와 계산값](../../01-학습문서/03-중급/06-derived-state와-계산값.md)
- [컴포넌트 분리와 합성](../../01-학습문서/03-중급/07-컴포넌트-분리와-합성.md)
- [비동기 UI 패턴](../../01-학습문서/03-중급/08-비동기-UI-패턴.md)
- [useId와 접근성 연결](../../01-학습문서/03-중급/09-useId와-접근성-연결.md)
- [Controlled와 uncontrolled form](../../01-학습문서/03-중급/10-controlled와-uncontrolled-form.md)
- [Key와 state 보존](../../01-학습문서/03-중급/11-key와-state-보존.md)
- [Portal과 modal](../../01-학습문서/03-중급/12-portal과-modal.md)
- [Lazy loading과 코드 분할](../../01-학습문서/03-중급/13-lazy-loading과-코드분할.md)
- [useDeferredValue와 느린 UI 다루기](../../01-학습문서/03-중급/14-useDeferredValue와-느린-UI-다루기.md)

## 실행 명령

```bash
pnpm run 예제:중급
```

중급에는 fetching, custom Hook, Portal, DeferredValue 예제가 있습니다. 각각 바로 열고 싶다면 아래 명령을 사용합니다.

```bash
pnpm run 예제:effect
pnpm run 예제:hook
pnpm run 예제:중급패턴
pnpm run 예제:portal
pnpm run 예제:deferred
pnpm run 예제:lazy
```

빌드 결과로 확인하려면 다음 명령을 사용합니다.

```bash
pnpm run 미리보기:중급
```

## 확인할 코드

- `src/examples/EffectsFetchingExample.tsx`
- `src/examples/CustomHooksExample.tsx`
- `src/examples/IntermediatePatternsExample.tsx`
- `src/examples/PortalModalExample.tsx`
- `src/examples/DeferredValueExample.tsx`
- `src/examples/LazyLoadingExample.tsx`
- `src/examples/lazy/StudyStats.tsx`
- `src/hooks/useToggle.ts`
- `src/hooks/useFetch.ts`

## 예제별 집중 포인트

| 예제 | 관찰할 흐름 | 핵심 질문 |
| --- | --- | --- |
| Effects Fetching | mount, loading, success, error, retry | 이 Effect는 어떤 외부 시스템과 동기화하는가? |
| Custom Hooks | Hook 내부 state와 반환값 | 컴포넌트는 "어떻게"보다 "무엇"을 읽고 있는가? |
| Intermediate Patterns | filter state, derived list, input ref | state와 계산값이 중복되지 않는가? |
| Portal Modal | open state, portal target, close handler | DOM 위치 때문에 portal이 필요한 UI인가? |
| Deferred Value | 입력 state와 deferred value | 급한 입력 반응과 느린 목록 계산이 나뉘는가? |
| Lazy Loading | Suspense fallback과 lazy component | 처음 화면에 필요 없는 코드를 늦게 불러오는가? |

## 직접 바꿔볼 것

- fetch URL을 일부러 틀려 error 상태를 확인합니다.
- loading 중 버튼을 비활성화합니다.
- `useToggle`에 `reset` 함수를 추가합니다.
- custom Hook이 JSX에 의존하지 않는지 확인합니다.
- `IntermediatePatternsExample`에서 `visibleArticles`를 state로 바꿔 보고 왜 어색해지는지 확인합니다.
- 빈 검색어로 검색 확정을 눌렀을 때 ref가 input focus에만 쓰이는지 확인합니다.
- 카테고리 필터를 URL search params로 옮긴다면 어떤 값이 URL에 남아야 하는지 적어 봅니다.
- `PortalModalExample`에서 배경 클릭으로 닫히는 로직이 어떻게 동작하는지 확인합니다.
- `createPortal`의 두 번째 인수를 `document.body` 대신 특정 컨테이너 div로 바꿔 봅니다.

## 실패 케이스로 확인할 것

| 상황 | 기대하는 UI |
| --- | --- |
| fetch URL이 틀림 | error message와 다시 시도 버튼이 보입니다. |
| 결과가 빈 배열 | loading이나 error가 아니라 empty UI가 보입니다. |
| 검색어를 빠르게 변경 | 오래된 응답이 최신 결과를 덮지 않아야 합니다. |
| modal이 열린 상태에서 Escape | modal이 닫히고 기존 화면 흐름이 유지됩니다. |
| lazy component가 늦게 로딩 | fallback이 필요한 영역에만 보입니다. |

## 설명 질문

- Effect를 제거하고 event handler나 렌더링 중 계산으로 옮길 수 있는 로직은 무엇인가?
- custom Hook이 JSX를 반환하지 않을 때 얻는 장점은 무엇인가?
- `ref`를 state 대신 쓰는 기준은 무엇인가?
- loading, empty, error를 하나의 boolean으로 처리하면 어떤 상태가 애매해지는가?
