# 2단계. 초급

초급 단계는 "사용자가 행동하면 화면이 바뀐다"는 감각을 몸에 익히는 구간입니다.

기초에서는 데이터를 받아 JSX로 보여주는 흐름을 봤습니다. 초급에서는 여기에 사용자의 입력, 클릭, 제출, 수정, 삭제가 들어옵니다. 즉, 정적인 화면을 작은 앱으로 바꾸는 단계입니다.

React 공식 문서의 핵심 사고방식도 여기서 많이 만납니다.

- state는 필요한 만큼만 둡니다.
- 계산 가능한 값은 저장하지 않고 계산합니다.
- 사용자의 의도는 event handler에서 처리합니다.
- 배열과 객체는 직접 수정하지 않고 새 값으로 교체합니다.
- 여러 컴포넌트가 같은 값을 보면 state를 공통 부모로 올립니다.

## 읽을 문서

| 순서 | 문서 | 다루는 것 |
| --- | --- | --- |
| 1 | [State를 고르는 법](./01-state를-고르는법.md) | 렌더링 사이에 기억해야 하는 값 고르기 |
| 2 | [Event와 Form](./02-event와-form.md) | 클릭, 입력, 제출을 사용자의 의도로 읽기 |
| 3 | [배열 State 업데이트](./03-배열-state-업데이트.md) | 추가, 삭제, 수정, 토글을 불변 업데이트로 처리하기 |
| 4 | [State 위치 정하기](./04-state-위치-정하기.md) | state를 어디에 둘지 결정하고 props로 연결하기 |
| 5 | [파생 State와 계산값](./05-파생-state와-계산값.md) | 저장할 값과 계산할 값을 구분하기 |
| 6 | [Key와 State 보존](./06-key와-state-보존.md) | 목록, key, 컴포넌트 state가 유지되는 방식 이해하기 |
| 7 | [컴포넌트 분리와 Handler 전달](./07-컴포넌트-분리와-handler-전달.md) | 자식 컴포넌트에서 부모 state를 바꾸는 흐름 만들기 |
| 8 | [초급 복습 시나리오](./08-초급-복습-시나리오.md) | 작은 Todo 기능을 문서 없이 다시 만들어보기 |

## 이 단계의 목표

이 단계를 마치면 다음 질문에 답할 수 있어야 합니다.

- 어떤 값을 state로 두고, 어떤 값을 계산값으로 둘지 판단할 수 있는가?
- event handler가 사용자의 어떤 의도를 처리하는지 말할 수 있는가?
- controlled input을 사용해 입력값을 React state와 연결할 수 있는가?
- 배열 state를 추가, 삭제, 수정할 때 원본을 직접 바꾸지 않을 수 있는가?
- 여러 컴포넌트가 공유하는 state를 가장 가까운 공통 부모에 둘 수 있는가?
- key가 단순 경고 제거용이 아니라 state 보존과 연결된다는 점을 이해하는가?
- 자식 컴포넌트는 직접 state를 바꾸는 대신 handler를 호출한다는 흐름을 설명할 수 있는가?

## 외부 자료 기준의 분류

React 공식 문서의 Adding Interactivity와 Managing State 흐름은 정적인 UI를 작은 앱으로 바꾸는 방법을 다룹니다. Full Stack Open도 props 다음에 state, event handler, form, 서버 요청으로 확장합니다.

| 분류 | 이 단계에서 배우는 이유 |
| --- | --- |
| state | 렌더링 사이에 기억해야 하는 값을 다룹니다. |
| event handler | 사용자 행동을 state update로 연결합니다. |
| form | 입력, 제출, 검증이 있는 작은 기능을 만듭니다. |
| 배열 state | 실제 앱의 추가/삭제/수정/토글을 연습합니다. |
| state 위치 | 여러 컴포넌트가 같은 값을 볼 때 소유자를 정합니다. |
| derived value | 중복 state와 동기화 버그를 줄입니다. |
| key와 state 보존 | 목록과 컴포넌트 identity를 연결합니다. |

초급에서는 아직 reducer, context, query cache 같은 도구를 먼저 꺼내지 않습니다. `useState`, props, handler만으로 작은 기능을 완성해 보는 것이 우선입니다.

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:초급`
- State 예제: `src/examples/PropsStateExample.tsx`
- Form 예제: `src/examples/EventsFormsExample.tsx`

## 빠른 정리

| 주제 | 기억할 것 |
| --- | --- |
| state | 렌더링 사이에 기억해야 하는 값 |
| 계산값 | props나 state에서 바로 계산할 수 있는 값 |
| event handler | 사용자의 의도를 처리하는 함수 |
| controlled input | `value`와 `onChange`를 state에 연결한 input |
| 배열 추가 | `[...items, newItem]` |
| 배열 삭제 | `items.filter(...)` |
| 배열 수정 | `items.map(...)` |
| state 위치 | 값을 함께 쓰는 컴포넌트들의 가장 가까운 공통 부모 |
| handler 전달 | 부모가 함수를 만들고 자식에게 props로 내려줌 |
| key | React가 목록 항목을 안정적으로 구분하는 값 |

```tsx
// 계산 가능한 값은 state로 저장하지 않습니다.
const completedCount = todos.filter((todo) => todo.done).length;

// 이전 state에 의존할 때는 updater function을 씁니다.
setCount((count) => count + 1);

// 배열 state는 새 배열로 업데이트합니다.
setTodos((todos) => todos.filter((todo) => todo.id !== id));

// 자식은 부모에게 "무슨 일이 일어났는지" 알립니다.
<TodoItem todo={todo} onToggle={handleToggle} />
```
