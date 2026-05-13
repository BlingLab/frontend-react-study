# 학습예제

`01-학습문서`를 읽고 책상 앞에서 바로 확인할 수 있는 실행 예제 안내입니다.

실제 React 컴포넌트 코드는 `src/examples/`에 있고, 이 폴더는 난이도별 예제 사용법과 실행 명령어를 정리합니다.

예제를 볼 때는 단순히 화면이 뜨는지만 확인하지 않습니다. 각 예제에서 어떤 값이 state인지, 어떤 값이 props인지, 어떤 로직이 event handler나 Effect에 있어야 하는지 표시하면서 봅니다. 공통 실습 루틴은 [예제 실습 가이드](./실습-가이드.md)에 정리했습니다.

## 빠른 실행

```bash
pnpm install
pnpm run 예제:기초
```

## 예제 학습 루틴

| 순서 | 할 일 | 확인할 것 |
| --- | --- | --- |
| 1 | 관련 학습문서 읽기 | 이번 예제가 답해야 하는 핵심 질문 |
| 2 | 예제 실행 | 화면에 보이는 상태, 버튼, form, 목록 |
| 3 | 코드 읽기 | state, props, 계산값, handler, Effect 위치 |
| 4 | 작은 수정 | 데이터 추가, 실패 상태 만들기, 로직 위치 바꾸기 |
| 5 | 다시 설명 | 왜 이 구조가 맞는지 3문장으로 정리 |

예제를 끝냈다는 기준은 "실행해봤다"가 아니라, 작은 요구사항을 하나 바꾸고 그 변경 이유를 설명할 수 있는 상태입니다.

## 단계별 예제

| 단계 | 문서 | 예제 안내 | 실행 명령 |
| --- | --- | --- | --- |
| 기초 | `01-학습문서/01-기초` | [01-기초](./01-기초/README.md) | `pnpm run 예제:기초` |
| 초급 | `01-학습문서/02-초급` | [02-초급](./02-초급/README.md) | `pnpm run 예제:초급` |
| 중급 | `01-학습문서/03-중급` | [03-중급](./03-중급/README.md) | `pnpm run 예제:중급` |
| 고급 | `01-학습문서/04-고급` | [04-고급](./04-고급/README.md) | `pnpm run 예제:고급` |
| 심화 | `01-학습문서/05-심화` | [05-심화](./05-심화/README.md) | `pnpm run 예제:심화` |
| 실전 정리 | `01-학습문서/06-실전정리` | [06-실전정리](./06-실전정리/README.md) | `pnpm run 예제:전체` |

## 개별 예제 바로 열기

| 예제 | 실행 명령 | 관련 문서 |
| --- | --- | --- |
| 컴포넌트와 목록 | `pnpm run 예제:컴포넌트` | 01-기초 |
| Props와 State | `pnpm run 예제:state` | 02-초급 |
| Event와 Form | `pnpm run 예제:form` | 02-초급 |
| Effect와 Fetching | `pnpm run 예제:effect` | 03-중급 |
| Custom Hook | `pnpm run 예제:hook` | 03-중급 |
| 중급 패턴 | `pnpm run 예제:중급패턴` | 03-중급 |
| Portal과 Modal | `pnpm run 예제:portal` | 03-중급/12 |
| Deferred Value | `pnpm run 예제:deferred` | 03-중급/14 |
| Lazy Loading | `pnpm run 예제:lazy` | 03-중급/13 |
| Reducer와 Context | `pnpm run 예제:reducer` | 04-고급 |
| Transition | `pnpm run 예제:transition` | 04-고급/04 |
| Optimistic UI | `pnpm run 예제:optimistic` | 04-고급/07 |
| Error Boundary | `pnpm run 예제:error-boundary` | 04-고급/06 |
| 성능 | `pnpm run 예제:성능` | 05-심화 |
| Custom Hook 심화 | `pnpm run 예제:hook심화` | 05-심화/08 |
| TypeScript 패턴 | `pnpm run 예제:타입스크립트` | 05-심화/09 |

## 예제별 확인 포인트

| 예제 | 먼저 볼 코드 | 직접 바꿔볼 것 |
| --- | --- | --- |
| JSX Components | `learners`, `ProfileCard`, `SkillList` | learner 추가, empty skills 추가, 조건부 badge 변경 |
| Props State | counter state, step props, reset handler | 초기값 변경, reset 기준 변경, 계산값 분리 |
| Events Forms | form submit, todo 배열 업데이트 | 빈 값 제출 막기, 삭제/토글 동작 변경, 필터 추가 |
| Effects Fetching | Effect cleanup, loading/error/empty UI | 실패 URL 만들기, retry 버튼 확인, stale response 설명 |
| Custom Hooks | `useToggle`, custom Hook 반환값 | reset 추가, Hook 이름 변경, 컴포넌트에서 JSX 의존 제거 |
| Intermediate Patterns | derived value, ref, filter state | 계산값을 state로 바꿔보고 중복 상태 문제 확인 |
| Portal Modal | `createPortal`, 닫기 handler | Escape 닫기, 배경 클릭 닫기, portal container 변경 |
| Deferred Value | 입력 state, deferred keyword, 느린 목록 | 목록 크기 변경, deferred 제거 후 체감 비교 |
| Lazy Loading | `lazy`, `Suspense`, fallback | 지연 컴포넌트 추가, fallback 위치 변경 |
| Context Reducer | action, reducer, provider 범위 | action 추가, state/dispatch context 분리 이유 설명 |
| Transition | urgent update, transition update | `startTransition` 제거, pending UI 변경 |
| Optimistic UI | optimistic state, 실패 복구 | 실패 확률 조정, rollback 메시지 설계 |
| Error Boundary | boundary 범위, reset 흐름 | 오류 발생 위치 변경, 복구 버튼 동작 확인 |
| Performance | list size, filter 비용, memoization | `useMemo` 제거, 목록 크기 증가, 측정 후 최적화 |
| Advanced Hooks | `useLocalStorage`, `useDebounce` | delay 변경, 잘못된 localStorage 값 처리 |
| TypeScript Patterns | union, generic, typed context | 잘못된 상태 조합 만들고 타입 오류 확인 |

## 빌드 후 확인

개발 서버가 아니라 실제 build 결과를 확인하려면 다음 흐름을 사용합니다.

```bash
pnpm build
pnpm preview
```

특정 예제를 바로 열고 싶다면 아래 명령을 사용합니다.

```bash
pnpm run 미리보기:기초
pnpm run 미리보기:초급
pnpm run 미리보기:중급
pnpm run 미리보기:고급
pnpm run 미리보기:심화
```
