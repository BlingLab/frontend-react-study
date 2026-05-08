# React가 해결하는 문제

React를 배우기 전에, React가 왜 만들어졌는지를 먼저 이해하면 이후 개념들이 훨씬 자연스럽게 연결됩니다.

## React의 탄생

React는 2011년 Facebook 내부에서 Jordan Walke가 처음 만들었습니다. 당시 Facebook 뉴스피드는 사용자가 스크롤할수록 새 글이 올라오고, 좋아요/댓글이 실시간으로 업데이트되는 복잡한 화면이었습니다. 화면 곳곳의 상태를 서로 일관되게 유지하는 것이 점점 어려워졌고, 버그 하나를 고치면 다른 곳이 깨지는 상황이 반복됐습니다.

2013년 Facebook은 React를 오픈소스로 공개했습니다. 처음에는 "왜 JavaScript 안에 HTML을 쓰는가"라는 거부감이 컸지만, 실제로 써보니 복잡한 UI를 훨씬 예측 가능하게 관리할 수 있었고 빠르게 퍼져나갔습니다.

React가 등장하기 전에는 주로 MVC(Model-View-Controller) 패턴으로 프론트엔드를 만들었습니다. 데이터(Model)와 화면(View) 사이를 Controller가 연결하는 구조입니다. 앱이 커질수록 Model과 View 사이의 의존 관계가 복잡하게 얽히면서, "어떤 데이터가 변했을 때 어떤 화면이 갱신되는가"를 파악하기 어려워졌습니다.

React는 이 문제를 다른 방향으로 풀었습니다. View를 데이터의 **결과물**로 보고, 데이터가 바뀌면 View를 처음부터 다시 계산한다는 방식입니다.

## 기존 방식의 문제

React가 없던 시절에는 HTML로 화면을 만들고, JavaScript로 DOM을 직접 수정했습니다.

```html
<ul id="todo-list"></ul>
<button id="add-btn">추가</button>

<script>
  let todos = ["장보기", "운동하기"];

  function render() {
    const list = document.getElementById("todo-list");
    list.innerHTML = "";
    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.textContent = todo;
      list.appendChild(li);
    });
  }

  document.getElementById("add-btn").addEventListener("click", () => {
    todos.push("새 항목");
    render(); // 데이터가 바뀔 때마다 직접 화면을 다시 그려야 함
  });

  render();
</script>
```

이 방식은 화면이 단순할 때는 괜찮지만, 기능이 늘어날수록 문제가 생깁니다.

- 데이터(`todos`)와 화면(`DOM`)을 항상 직접 동기화해야 합니다.
- 화면 상태가 여러 곳에 흩어집니다. "지금 화면에 무엇이 그려져 있는가"를 코드만 보고 파악하기 어렵습니다.
- 기능이 늘어날수록 "언제, 어디서, 무엇을 업데이트해야 하는가"를 추적하기가 점점 힘들어집니다.
- 화면이 현재 데이터와 실제로 일치하는지 확인하기 어렵습니다.

## React의 핵심 아이디어

React는 이 문제를 다른 방식으로 풉니다.

> **UI는 데이터의 결과다.**

데이터가 바뀌면 React가 UI를 다시 계산합니다. 개발자는 DOM을 직접 조작하지 않고, "이 데이터라면 화면이 어떻게 보여야 하는가"만 기술합니다.

```tsx
// todos 배열이 이렇다면 화면은 이렇게 보인다
function TodoList({ todos }: { todos: string[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo}>{todo}</li>
      ))}
    </ul>
  );
}
```

`todos`가 바뀌면 React가 `TodoList`를 다시 실행해 새 화면을 계산합니다. 개발자는 DOM 업데이트 코드를 작성하지 않아도 됩니다.

이 아이디어를 수식으로 쓰면 이렇게 됩니다.

```
UI = f(state)
```

UI는 현재 상태(state)를 입력으로 받는 함수의 결과입니다. 같은 상태가 들어오면 항상 같은 화면이 나옵니다. 이 관계가 명확하면 화면이 왜 이렇게 보이는지, 왜 저렇게 바뀌었는지를 추론하기 쉬워집니다.

## React의 철학

React는 세 가지 철학을 기반으로 설계됐습니다.

### 선언적(Declarative)

명령적(Imperative) 코드는 "어떻게 할 것인가"를 단계별로 지시합니다.

```js
// 명령적: "이 element를 찾아, 이 내용으로 바꿔, 이 class를 추가해"
const el = document.getElementById("status");
el.textContent = "완료";
el.classList.add("done");
```

선언적(Declarative) 코드는 "결과가 어때야 하는가"를 기술합니다.

```tsx
// 선언적: "done이 true이면 이 모양으로 보인다"
function TodoItem({ text, done }: { text: string; done: boolean }) {
  return <li className={done ? "done" : ""}>{text}</li>;
}
```

선언적 코드는 현재 상태만 보면 화면이 어떻게 될지 알 수 있습니다. 명령적 코드는 이전 상태에서 지금까지 어떤 명령이 실행됐는지 추적해야 현재 화면을 알 수 있습니다.

### 컴포넌트 기반(Component-Based)

React는 UI를 독립적인 컴포넌트 조각으로 나눕니다. 각 컴포넌트는 자신의 상태와 렌더링 로직을 가지고 있고, 조합해서 복잡한 UI를 만듭니다.

컴포넌트는 재사용 가능하고, 독립적으로 테스트할 수 있고, 이름을 붙여서 역할을 명확히 할 수 있습니다. 기능을 추가하거나 수정할 때 영향 범위를 컴포넌트 단위로 좁힐 수 있습니다.

### 단방향 데이터 흐름(Unidirectional Data Flow)

React에서 데이터는 항상 부모 → 자식 방향으로만 흐릅니다. 자식이 데이터를 바꾸고 싶다면 부모에게 함수를 통해 요청합니다.

```
부모 (state 소유) → 자식 (props로 전달받음)
                  ← 자식 (이벤트 핸들러로 알림)
```

이 제약이 오히려 코드를 이해하기 쉽게 만듭니다. "이 데이터는 누가 소유하는가", "어디서 바뀌는가"가 항상 명확하기 때문입니다.

## Virtual DOM

React는 실제 DOM을 직접 다루기 전에, 메모리 안에 가상의 DOM 트리(Virtual DOM)를 유지합니다.

상태가 바뀌면 React는 새 Virtual DOM을 계산하고, 이전 Virtual DOM과 비교해서 실제로 달라진 부분만 브라우저 DOM에 반영합니다. 이 과정을 **reconciliation(재조정)**이라고 합니다.

개발자 관점에서는 "매번 전체를 다시 그린다"는 단순한 모델로 생각하면서도, 실제 성능은 최소한의 DOM 변경만 일어납니다.

Virtual DOM은 React의 핵심 혁신 중 하나입니다. 이 덕분에 개발자는 "지금 DOM이 어떤 상태인가, 어디를 바꿔야 하는가"를 생각하지 않아도 됩니다. "이 상태면 화면이 어때야 하는가"만 생각하면 됩니다.

## React식 사고의 전환

React를 처음 배울 때 가장 큰 전환은 질문을 바꾸는 것입니다.

| 직접 DOM 조작 | React 방식 |
| --- | --- |
| 버튼을 누르면 어떤 DOM을 찾아서 바꿀까? | 버튼을 누르면 어떤 데이터가 바뀔까? |
| 이 element를 추가해야 하나 삭제해야 하나? | 이 배열을 렌더링하면 어떤 목록이 나올까? |
| class를 직접 붙일까 뗄까? | 이 상태면 어떤 className을 반환할까? |
| 화면과 데이터가 따로 움직임 | 화면은 데이터의 결과 |

예를 들어 로그인 상태도 마찬가지입니다.

```tsx
function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <header>
      <h1>React Study</h1>
      {isLoggedIn ? <button>로그아웃</button> : <button>로그인</button>}
    </header>
  );
}
```

`isLoggedIn`이 `true`면 로그아웃 버튼이 보이고, `false`면 로그인 버튼이 보입니다. 버튼을 직접 숨기고 보이는 명령을 내리는 것이 아니라, 상태에 맞는 UI를 반환합니다.

## 컴포넌트라는 단위

React는 UI를 **컴포넌트**라는 함수 단위로 나눕니다. 각 컴포넌트는 데이터를 받아 화면 조각을 반환합니다.

```tsx
// 데이터(props)를 받아 UI를 반환하는 함수
function TodoItem({ text }: { text: string }) {
  return <li>{text}</li>;
}
```

컴포넌트를 조합하면 복잡한 화면도 작고 읽기 쉬운 단위로 나눌 수 있습니다.

```tsx
function TodoList({ todos }: { todos: string[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo} text={todo} />
      ))}
    </ul>
  );
}
```

컴포넌트는 꼭 재사용을 위해서만 나누는 것이 아닙니다. 이름을 붙였을 때 화면이 더 잘 읽히면 그것만으로도 좋은 분리입니다.

```tsx
function Dashboard() {
  return (
    <main>
      <TodoSummary todos={["문서 읽기", "예제 고치기"]} />
      <StudyProgress currentStep="기초" doneCount={3} />
    </main>
  );
}
```

위 코드는 실제 HTML 태그보다 "이 화면이 무엇으로 구성되어 있는지"가 먼저 보입니다.

## React 생태계

React 자체는 UI를 만드는 라이브러리입니다. 라우팅, 서버 요청, 전역 상태 관리 등은 별도 라이브러리를 조합해서 씁니다.

| 영역 | 대표 도구 |
| --- | --- |
| 라우팅 | React Router, TanStack Router |
| 서버 데이터 | TanStack Query, SWR |
| 전역 상태 | Zustand, Jotai |
| 스타일 | Tailwind CSS, CSS Modules |
| 빌드 | Vite, Next.js |
| 테스트 | Vitest, Testing Library |

React 자체를 잘 이해하면 이 라이브러리들도 "React의 어떤 문제를 어떻게 해결하는가"라는 관점으로 빠르게 배울 수 있습니다.

## 읽으면서 생각할 질문

- 기존 DOM 조작 방식과 React 방식의 차이를 말로 설명할 수 있는가?
- 선언적 코드와 명령적 코드의 차이가 느껴지는가?
- `UI = f(state)` 라는 공식이 실제 코드에서 어떻게 보이는가?
- Virtual DOM이 왜 필요한지 설명할 수 있는가?
- 단방향 데이터 흐름이 코드를 어떻게 예측 가능하게 만드는가?
