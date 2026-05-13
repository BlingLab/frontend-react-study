# 초급 예제

초급 예제는 사용자의 행동으로 화면이 바뀌는 흐름을 연습합니다.

문서에서는 state, event, form, 배열 업데이트를 읽고, 예제에서는 직접 버튼을 누르거나 input을 입력하면서 같은 흐름을 확인합니다.

## 연결되는 학습문서

| 문서 | 확인할 예제 |
| --- | --- |
| [State를 고르는 법](../../01-학습문서/02-초급/01-state를-고르는법.md) | `PropsStateExample.tsx` |
| [Event와 Form](../../01-학습문서/02-초급/02-event와-form.md) | `EventsFormsExample.tsx` |
| [배열 State 업데이트](../../01-학습문서/02-초급/03-배열-state-업데이트.md) | `EventsFormsExample.tsx` |
| [State 위치 정하기](../../01-학습문서/02-초급/04-state-위치-정하기.md) | `EventsFormsExample.tsx` |
| [파생 State와 계산값](../../01-학습문서/02-초급/05-파생-state와-계산값.md) | `EventsFormsExample.tsx` |
| [Key와 State 보존](../../01-학습문서/02-초급/06-key와-state-보존.md) | `EventsFormsExample.tsx` |
| [컴포넌트 분리와 Handler 전달](../../01-학습문서/02-초급/07-컴포넌트-분리와-handler-전달.md) | `EventsFormsExample.tsx` |
| [초급 복습 시나리오](../../01-학습문서/02-초급/08-초급-복습-시나리오.md) | 두 예제 전체 |

## 실행 명령

```bash
pnpm run 예제:초급
```

초급에는 카운터와 form 예제가 함께 있습니다. 각각 바로 열고 싶다면 아래 명령을 사용합니다.

```bash
pnpm run 예제:state
pnpm run 예제:form
```

빌드 결과로 확인하려면 다음 명령을 사용합니다.

```bash
pnpm run 미리보기:초급
```

## 확인할 코드

- `src/examples/PropsStateExample.tsx`
- `src/examples/EventsFormsExample.tsx`

## 예제별 집중 포인트

| 예제 | 먼저 볼 것 | 확인 질문 |
| --- | --- | --- |
| Props State | 초기값 props, counter state, reset handler | 렌더링 사이에 기억해야 해서 state가 된 값은 무엇인가? |
| Props State | count에서 계산한 문구와 상태 | 계산값을 state로 저장하면 어떤 동기화 문제가 생기는가? |
| Events Forms | controlled input | 입력값은 왜 input DOM이 아니라 React state가 기준인가? |
| Events Forms | submit handler | 사용자 의도는 어디에서 처리되고, UI 업데이트는 어디에서 일어나는가? |
| Events Forms | todo 배열 업데이트 | 추가, 삭제, 토글이 원본 배열을 직접 바꾸지 않는가? |
| Events Forms | 필터와 요약 | 완료 개수와 보이는 목록은 state인가 계산값인가? |

## 직접 바꿔볼 것

- 카운터의 초기값과 step 값을 바꿉니다.
- reset 버튼을 "0으로 초기화"가 아니라 "초기값으로 되돌리기"로 바꿉니다.
- Todo form에서 빈 값 submit을 막는 위치를 확인합니다.
- Todo 항목에 삭제 버튼을 추가하거나 삭제 동작을 바꿉니다.
- 완료 개수와 남은 개수가 state인지 계산값인지 설명합니다.
- filter state를 추가해서 전체, 진행 중, 완료 목록을 나눠봅니다.
- 목록 key를 일부러 index로 바꿨을 때 어떤 문제가 생길 수 있는지 설명해봅니다.

## 확장 과제

| 과제 | 의도 |
| --- | --- |
| Todo 제목을 더블클릭하면 수정 모드로 전환 | local UI state와 배열 수정 연결 |
| 전체 완료/전체 해제 버튼 추가 | 여러 항목을 한 번에 업데이트하는 배열 state 연습 |
| filter를 button 세 개로 바꾸고 active 표시 | UI state와 className 조건부 렌더링 연결 |
| 남은 할 일만 있을 때 경고 문구 표시 | 계산값과 조건부 렌더링 연결 |

## 설명 질문

- `TodoForm`의 입력 state를 부모로 올리지 않아도 되는 이유는 무엇인가?
- `handleAdd`, `handleToggle`, `handleDelete`가 모두 부모에 있는 이유는 무엇인가?
- `completedCount`를 state로 두면 어떤 코드가 추가로 필요해지는가?
- form submit에서 `preventDefault`가 빠지면 사용자는 어떤 현상을 보게 되는가?
