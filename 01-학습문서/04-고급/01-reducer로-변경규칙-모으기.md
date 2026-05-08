# Reducer로 변경 규칙 모으기

`useReducer`는 상태 변경 규칙이 많아질 때 유용합니다.

컴포넌트 안에 `setState` 로직이 흩어지면 어떤 사용자 행동이 어떤 상태 변화를 만드는지 보기 어렵습니다. reducer는 이 규칙을 하나의 함수로 모읍니다.

```tsx
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "todo/toggled":
      return {
        todos: state.todos.map((todo) =>
          todo.id === action.id ? { ...todo, done: !todo.done } : todo,
        ),
      };
  }
}
```

Action 이름은 버튼 이름보다 사용자의 의도에 가깝게 짓는 편이 좋습니다.

## 읽으면서 생각할 질문

- state 변경 규칙이 한눈에 보이는가?
- action 이름이 사용자의 의도를 설명하는가?
- reducer가 기존 state를 직접 수정하지 않는가?
- 단순한 state까지 reducer로 옮겨 복잡해진 것은 아닌가?
- 테스트한다면 어떤 action을 먼저 검증할 것인가?
