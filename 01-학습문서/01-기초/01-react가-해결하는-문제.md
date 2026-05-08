# React가 해결하는 문제

React를 배우기 전에, React가 왜 만들어졌는지를 먼저 이해하면 이후 개념들이 훨씬 자연스럽게 연결됩니다.

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

위 코드는 실제 HTML 태그보다 "이 화면이 무엇으로 구성되어 있는지"가 먼저 보입니다. React에서 컴포넌트는 화면의 문단 제목 같은 역할을 합니다.
