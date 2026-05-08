# 1단계. 기초

React 코드를 읽고 직접 쓸 수 있게 되는 단계입니다. "왜 이렇게 생겼는가"부터 시작해서 컴포넌트, props, 목록과 조건부 렌더링까지 기초를 잡습니다.

## 읽을 문서

| 순서 | 문서 | 다루는 것 |
| --- | --- | --- |
| 1 | [React가 해결하는 문제](./01-react가-해결하는-문제.md) | React를 배우는 이유, UI = 데이터의 결과 |
| 2 | [JS/TS 기본 문법](./02-js-ts-기본문법.md) | const/let, arrow fn, destructuring, map/filter, spread |
| 3 | [JSX 문법](./03-jsx-문법.md) | `{}`, className, style, Fragment, 자기 닫는 태그 |
| 4 | [컴포넌트 만들기](./04-컴포넌트-만들기.md) | 컴포넌트 정의, 이름 짓기, 분리 기준 |
| 5 | [Props 이해하기](./05-props-이해하기.md) | props 전달, TypeScript 타입, optional, children |
| 6 | [조건부 렌더링](./06-조건부-렌더링.md) | `&&`, 삼항 연산자, null 반환, early return |
| 7 | [목록 렌더링](./07-목록-렌더링.md) | `map`, `key`, 빈 목록, 흔한 실수 |
| 8 | [데이터에서 UI로 생각하기](./08-데이터에서-ui로-생각하기.md) | 데이터 모양에서 컴포넌트 구조로 이어지는 흐름 |
| 9 | [기초 복습 시나리오](./09-기초-복습-시나리오.md) | 파일을 보지 않고 다시 만드는 연습 |

## 이 단계의 목표

이 단계를 마치면 다음 질문에 답할 수 있어야 합니다.

- React는 어떤 문제를 해결하는가?
- JSX는 HTML과 무엇이 다른가?
- 컴포넌트는 언제, 어떤 기준으로 나누는가?
- props는 어느 방향으로 흐르는가?
- `&&`와 삼항 연산자는 어떤 상황에 쓰는가?
- 목록을 렌더링할 때 `key`는 왜 필요하고, 무슨 값을 써야 하는가?
- 데이터를 보고 어떤 컴포넌트가 필요할지 추측할 수 있는가?
- 파일을 보지 않고 작은 카드 목록 UI를 다시 만들 수 있는가?

## 외부 자료 기준의 분류

React 공식 문서와 MDN의 입문 흐름은 모두 "component로 UI를 쪼개고, props로 데이터를 내려보내고, JSX로 화면을 표현한다"에서 시작합니다. 그래서 기초 단계에서는 state와 Effect를 깊게 다루지 않습니다.

| 분류 | 이 단계에서 배우는 이유 |
| --- | --- |
| JSX | React 코드를 읽는 최소 문법입니다. |
| component | UI를 재사용 가능한 단위로 나누는 기준입니다. |
| props | 부모 데이터가 자식 UI로 내려가는 방향을 익힙니다. |
| 조건부 렌더링 | 같은 데이터라도 상황에 따라 다른 UI가 필요합니다. |
| 목록 렌더링 | 실제 화면 대부분은 배열 데이터를 반복해서 만듭니다. |
| 데이터에서 UI | Thinking in React 흐름으로 다음 단계 state 설계를 준비합니다. |

기초에서는 "사용자가 클릭하면 어떻게 바뀌는가"보다 "현재 데이터가 주어졌을 때 어떤 UI가 나와야 하는가"를 먼저 설명할 수 있어야 합니다.

## 연결되는 예제

- 예제 안내: [02-학습예제/01-기초](../../02-학습예제/01-기초/README.md)
- 실행 명령: `pnpm run 예제:기초`
- 실제 코드: `src/examples/JsxComponentsExample.tsx`

## 빠른 정리

| 주제 | 기억할 것 |
| --- | --- |
| JSX 값 넣기 | `{value}` — 중괄호 안에 expression |
| className | HTML `class` 대신 `className` |
| Fragment | `<>...</>` — 불필요한 div 없이 여러 element 반환 |
| style | 문자열이 아닌 객체 — `style={{ color: "red" }}` |
| 컴포넌트 이름 | 반드시 대문자로 시작 |
| props 방향 | 부모 → 자식, 자식은 변경 불가 |
| optional props | `?`를 붙이거나 기본값 `= value` 지정 |
| children | 태그 사이 내용을 `children`으로 받음 |
| `&&` | 조건이 참일 때만 렌더링. 앞에 숫자 금지 |
| 삼항 연산자 | 두 가지 중 하나를 렌더링 |
| null 반환 | 아무것도 렌더링하지 않음 |
| map + key | 배열을 목록으로 변환. key는 안정적인 고유값 |
| index key | 순서가 바뀔 수 있는 목록에선 사용하지 않음 |
| 빈 목록 | 빈 상태도 UI — 메시지를 명시적으로 보여줌 |

```tsx
// 목록 렌더링
items.map((item) => <li key={item.id}>{item.title}</li>)

// 조건부 렌더링
{isAdmin && <button>삭제</button>}
{isLoggedIn ? <UserMenu /> : <LoginButton />}
{count === 0 && <p>항목이 없습니다.</p>}

// children props
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}
```
