# 컴포넌트 분리와 Handler 전달

초급 단계에서는 컴포넌트를 단순히 파일로 나누는 것보다 "역할로 나누는 것"이 중요합니다.

React 컴포넌트는 보통 두 가지 책임을 갖습니다.

- 데이터를 기억하고 변경 규칙을 관리합니다.
- 받은 데이터를 화면에 보여주고 사용자 이벤트를 알립니다.

작은 앱을 만들 때는 이 둘을 적절히 나눠야 코드가 읽기 쉬워집니다.

## 부모는 규칙을 알고, 자식은 사건을 알린다

Todo 앱을 생각해봅니다.

`TodoPage`는 전체 할 일 목록 state를 알고 있습니다. 그래서 추가, 삭제, 완료 토글 규칙도 `TodoPage`에 두는 것이 자연스럽습니다.

```tsx
function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);

  function handleToggle(id: string) {
    setTodos((todos) =>
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  }

  return <TodoList todos={todos} onToggle={handleToggle} />;
}
```

`TodoList`는 목록을 보여주는 역할에 집중합니다.

```tsx
function TodoList({ todos, onToggle }: TodoListProps) {
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} />
      ))}
    </ul>
  );
}
```

`TodoItem`은 클릭이 발생했다는 사실만 알립니다.

```tsx
function TodoItem({ todo, onToggle }: TodoItemProps) {
  return (
    <li>
      <button onClick={() => onToggle(todo.id)}>
        {todo.done ? "완료" : "진행 중"}
      </button>
      <span>{todo.title}</span>
    </li>
  );
}
```

자식은 `setTodos`를 모릅니다. 어떤 배열 업데이트가 필요한지도 모릅니다. 그냥 `onToggle(todo.id)`를 호출합니다.

이 구조가 React에서 초급자가 가장 먼저 익혀야 할 컴포넌트 협업 방식입니다.

## props 이름은 관점에 따라 달라진다

부모 쪽에서는 실제 동작 이름을 씁니다.

```tsx
function handleToggle(id: string) {
  // state 변경
}
```

자식에게 넘길 때는 `onToggle`처럼 이벤트 props 이름을 씁니다.

```tsx
<TodoItem todo={todo} onToggle={handleToggle} />
```

`on`으로 시작하는 이름은 "어떤 일이 일어나면 호출해줘"라는 뜻으로 읽힙니다.

이 이름 규칙을 지키면 컴포넌트의 역할이 훨씬 잘 보입니다.

## 너무 빨리 나누면 오히려 흐름이 흐려진다

컴포넌트 분리는 좋은 습관이지만, 너무 작은 단위로 먼저 쪼개면 오히려 이해가 어려워질 수 있습니다.

처음에는 한 컴포넌트에서 기능을 완성합니다.

그 다음 아래 기준이 보이면 분리합니다.

- 같은 UI 조각이 반복됩니다.
- 한 컴포넌트가 너무 많은 일을 합니다.
- 데이터 관리와 화면 표시가 섞여 읽기 어렵습니다.
- 특정 부분만 따로 이름 붙이면 코드가 더 잘 설명됩니다.

컴포넌트는 폴더 정리용이 아니라 생각 정리용입니다.

## children으로 감싸는 컴포넌트 만들기

초급에서 유용한 분리 방식 중 하나는 `children`을 받는 UI 껍데기 컴포넌트입니다.

```tsx
function Panel({ title, children }: PanelProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

사용할 때는 이렇게 씁니다.

```tsx
<Panel title="오늘 할 일">
  <TodoForm onAdd={handleAdd} />
  <TodoList todos={todos} onToggle={handleToggle} />
</Panel>
```

`Panel`은 내부에 무엇이 들어오는지 몰라도 됩니다. 제목과 레이아웃을 담당하고, 실제 내용은 `children`으로 받습니다.

이 패턴은 기초의 props와 초급의 컴포넌트 조립 감각을 이어줍니다.

## 예제로 이해하기

아래처럼 역할을 나누면 코드가 문장처럼 읽힙니다.

```tsx
function TodoPage() {
  return (
    <Panel title="Todo">
      <TodoForm onAdd={handleAdd} />
      <TodoFilter value={filter} onChange={setFilter} />
      <TodoList todos={visibleTodos} onToggle={handleToggle} />
    </Panel>
  );
}
```

이 코드는 세부 구현을 몰라도 화면의 흐름을 보여줍니다.

- form에서 추가합니다.
- filter에서 보여줄 범위를 고릅니다.
- list에서 할 일을 보여주고 토글합니다.

React 컴포넌트 분리는 이런 식으로 "읽히는 구조"를 만드는 작업입니다.

## 읽으면서 생각할 질문

- 이 컴포넌트는 데이터를 관리하는가, 화면을 보여주는가, 둘 다 하고 있는가?
- 자식 컴포넌트가 부모의 state 변경 규칙을 너무 많이 알고 있지는 않은가?
- handler props 이름이 `onAdd`, `onToggle`, `onChange`처럼 사건 중심으로 읽히는가?
- 반복되는 UI나 역할이 분명한 UI를 컴포넌트로 분리했는가?
- 분리한 뒤 오히려 props 흐름이 더 복잡해지지는 않았는가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
