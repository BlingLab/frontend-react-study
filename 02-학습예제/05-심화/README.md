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
- [React 19 이후 학습 지도](../../01-학습문서/05-심화/11-react-19-이후-학습지도.md)
- [Server Components와 경계](../../01-학습문서/05-심화/12-server-components와-경계.md)

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

## 예제별 집중 포인트

| 예제 | 먼저 볼 것 | 핵심 질문 |
| --- | --- | --- |
| Performance | 목록 크기, 필터 계산, memoization | 실제 병목을 확인한 뒤 최적화했는가? |
| Performance | child props identity | `memo`가 있어도 props가 매번 바뀌는가? |
| Advanced Hooks | `useLocalStorage` | 저장소 접근 실패나 잘못된 JSON을 어떻게 다루는가? |
| Advanced Hooks | `useDebounce` | 모든 입력에 즉시 반응하지 않아도 되는 이유는 무엇인가? |
| Advanced Hooks | `useOnlineStatus` | React 바깥 브라우저 이벤트를 어떻게 구독하는가? |
| TypeScript Patterns | discriminated union | 불가능한 UI 상태 조합이 타입으로 막히는가? |
| TypeScript Patterns | generic component | 데이터 모양은 달라도 반복되는 UI 구조를 재사용하는가? |
| React 19 이후 지도 | 안정 API, 프레임워크 API, Canary API | 지금 프로젝트에서 직접 연습할 수 있는 API인가? |
| Server Components와 경계 | client/server 실행 위치 | 이 코드는 브라우저 번들에 들어가야 하는가? |

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

## 측정 루틴

성능 예제는 아래 순서로 봅니다.

1. 목록 크기를 기본값으로 두고 입력 반응을 확인합니다.
2. 목록 크기를 늘려 실제로 느려지는지 봅니다.
3. `useMemo`, `memo`, `useCallback`을 제거하고 차이를 비교합니다.
4. 느려진 지점이 계산 비용인지, DOM node 수인지, props identity인지 분리합니다.
5. 최적화 코드가 문제를 줄였는지 다시 확인합니다.

## 설명 질문

- 렌더링이 많이 일어나는 것과 DOM 변경이 많은 것은 어떻게 다른가?
- `useMemo`를 추가하기 전에 어떤 증거가 필요한가?
- Custom Hook은 재사용 말고 어떤 장점을 주는가?
- TypeScript union으로 loading/error/success를 나누면 boolean 여러 개보다 무엇이 좋아지는가?
- React 19 이후 API를 볼 때 안정 API와 Canary API를 어떻게 구분하는가?
- `"use client"`와 `"use server"`가 각각 무엇을 표시하는지 설명할 수 있는가?
