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

중급에는 fetching과 custom Hook 예제가 함께 있습니다. 각각 바로 열고 싶다면 아래 명령을 사용합니다.

```bash
pnpm run 예제:effect
pnpm run 예제:hook
pnpm run 예제:중급패턴
```

빌드 결과로 확인하려면 다음 명령을 사용합니다.

```bash
pnpm run 미리보기:중급
```

## 확인할 코드

- `src/examples/EffectsFetchingExample.tsx`
- `src/examples/CustomHooksExample.tsx`
- `src/examples/IntermediatePatternsExample.tsx`
- `src/hooks/useToggle.ts`

## 직접 바꿔볼 것

- fetch URL을 일부러 틀려 error 상태를 확인합니다.
- loading 중 버튼을 비활성화합니다.
- `useToggle`에 `reset` 함수를 추가합니다.
- custom Hook이 JSX에 의존하지 않는지 확인합니다.
- `IntermediatePatternsExample`에서 `visibleArticles`를 state로 바꿔 보고 왜 어색해지는지 확인합니다.
- 빈 검색어로 검색 확정을 눌렀을 때 ref가 input focus에만 쓰이는지 확인합니다.
- 카테고리 필터를 URL search params로 옮긴다면 어떤 값이 URL에 남아야 하는지 적어 봅니다.
