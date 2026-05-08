# State 위치 정하기

State 위치는 그 값을 읽고 바꾸는 컴포넌트를 기준으로 정합니다.

한 컴포넌트만 쓰는 값은 그 컴포넌트 안에 두면 됩니다. 여러 컴포넌트가 같은 값을 필요로 하면 가장 가까운 공통 부모로 올립니다.

데이터는 props로 내려가고, 이벤트는 handler를 통해 올라갑니다.

```tsx
function TodoItem({ todo, onToggle }: TodoItemProps) {
  return <button onClick={() => onToggle(todo.id)}>{todo.title}</button>;
}
```

자식은 "무엇이 일어났다"를 부모에게 알리고, 부모가 state를 바꿉니다.

## 읽으면서 생각할 질문

- 이 값을 읽는 컴포넌트는 어디인가?
- 이 값을 바꾸는 이벤트는 어디에서 발생하는가?
- state를 올리면 props 흐름이 더 복잡해지는가?
- 자식이 부모 state를 직접 바꾸려고 하고 있지는 않은가?
- 같은 값을 여러 state에 중복 저장하고 있지는 않은가?
