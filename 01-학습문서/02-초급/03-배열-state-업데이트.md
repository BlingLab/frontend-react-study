# 배열 State 업데이트

배열 state는 직접 수정하지 않고 새 배열을 만들어 업데이트합니다.

```tsx
setTodos((todos) => [...todos, newTodo]);
setTodos((todos) => todos.filter((todo) => todo.id !== id));
```

완료 토글처럼 특정 항목만 바꿀 때는 `map`을 사용합니다.

```tsx
setTodos((todos) =>
  todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo,
  ),
);
```

처음에는 길어 보이지만, 어떤 항목이 어떻게 바뀌는지 분명하게 드러납니다.

## 읽으면서 생각할 질문

- 기존 배열을 직접 바꾸고 있지는 않은가?
- 추가, 삭제, 수정에 각각 어떤 배열 메서드를 쓰는가?
- 항목을 찾는 기준은 id처럼 안정적인 값인가?
- 필터링 결과를 별도 state로 저장하지 않았는가?
- empty state는 사용자에게 충분히 설명되는가?
