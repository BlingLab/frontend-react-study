# State를 고르는 법

State는 렌더링 사이에 컴포넌트가 기억해야 하는 값입니다.

React에서 가장 중요한 습관은 state를 최소로 두는 것입니다. props나 다른 state에서 계산할 수 있는 값은 state로 저장하지 않습니다.

```tsx
const remainingCount = todos.filter((todo) => !todo.done).length;
```

`remainingCount`는 `todos`에서 계산되므로 별도 state가 아닙니다.

## 읽으면서 생각할 질문

- 이 값은 렌더링 사이에 기억해야 하는가?
- 이미 있는 props나 state에서 계산할 수 있는가?
- state가 많아져서 서로 맞춰야 하는 값이 생기지는 않았는가?
- 초기값은 어떤 기준으로 정하는가?
- 이 state가 바뀌면 어떤 UI가 다시 계산되는가?
