# 심화 예제

## 연결되는 학습문서

- [심화 문서](../../01-학습문서/05-심화/README.md)
- [React 렌더링 모델](../../01-학습문서/05-심화/01-react-렌더링-모델.md)
- [Memoization 판단하기](../../01-학습문서/05-심화/02-memoization-판단하기.md)
- [Suspense와 Error Boundary](../../01-학습문서/05-심화/03-suspense와-compiler-관점.md)
- [Profiler로 성능 측정하기](../../01-학습문서/05-심화/04-profiler로-성능-측정하기.md)
- [큰 목록과 렌더링 범위 줄이기](../../01-학습문서/05-심화/05-큰-목록과-렌더링-범위-줄이기.md)
- [순수한 렌더링과 부수효과 분리](../../01-학습문서/05-심화/06-순수한-렌더링과-부수효과-분리.md)
- [Compiler 시대의 최적화 전략](../../01-학습문서/05-심화/07-compiler-시대의-최적화-전략.md)
- [Custom Hook 심화](../../01-학습문서/05-심화/08-custom-hook-심화.md)
- [TypeScript와 React 패턴](../../01-학습문서/05-심화/09-타입스크립트와-리액트-패턴.md)
- [심화 복습 시나리오](../../01-학습문서/05-심화/10-심화-복습-시나리오.md)

## 실행 명령

```bash
pnpm run 예제:심화
pnpm run 예제:성능
pnpm run 예제:hook심화
pnpm run 예제:타입스크립트
```

빌드 결과로 확인하려면 다음 명령을 사용합니다.

```bash
pnpm run 미리보기:심화
```

## 확인할 코드

- `src/examples/PerformanceExample.tsx`
- `src/examples/AdvancedHooksExample.tsx`
- `src/examples/TypeScriptPatternsExample.tsx`
- `src/hooks/useLocalStorage.ts`
- `src/hooks/useDebounce.ts`
- `src/hooks/useOnlineStatus.ts`

## 직접 바꿔볼 것

- `useMemo`를 제거하고 다시 실행합니다.
- 목록 크기를 늘려 렌더링 체감을 비교합니다.
- `memo`를 제거했을 때 코드가 어떻게 달라지는지 확인합니다.
- 먼저 측정하고 최적화한다는 원칙을 코드에 적용합니다.
- input state 위치를 바꾸면 렌더링 범위가 어떻게 달라지는지 확인합니다.
- 큰 목록에서는 `useMemo`만으로 충분한지, pagination이 더 나은지 판단해 봅니다.
- `useLocalStorage`에서 잘못된 JSON이 들어왔을 때 어떻게 처리하는지 확인합니다.
- `useDebounce`의 delay를 0으로 바꿔보고 동작이 어떻게 달라지는지 확인합니다.
- `useDebounce`를 제거하고 모든 입력에 즉시 반응하도록 바꿔봅니다.
- Custom Hook을 컴포넌트에서 분리한 뒤 `renderHook`으로 테스트할 수 있는지 확인합니다.
- 심화 복습 시나리오의 각 판단 질문에 답변을 적어봅니다.
