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

  function handleDelete(id: string) {
    setTodos((todos) => todos.filter((todo) => todo.id !== id));
  }

  return <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />;
}
```

`TodoList`는 목록을 보여주는 역할에 집중합니다.

```tsx
type TodoListProps = {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p>할 일이 없습니다.</p>;
  }

  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
```

`TodoItem`은 클릭이 발생했다는 사실만 알립니다.

```tsx
type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li>
      <button onClick={() => onToggle(todo.id)}>
        {todo.done ? "✓ 완료" : "진행 중"}
      </button>
      <span style={{ textDecoration: todo.done ? "line-through" : "none" }}>
        {todo.title}
      </span>
      <button onClick={() => onDelete(todo.id)}>삭제</button>
    </li>
  );
}
```

자식은 `setTodos`를 모릅니다. 어떤 배열 업데이트가 필요한지도 모릅니다. 그냥 `onToggle(todo.id)`, `onDelete(todo.id)`를 호출합니다.

이 구조가 React에서 초급자가 가장 먼저 익혀야 할 컴포넌트 협업 방식입니다.

## handler 이름 규칙

handler 이름 규칙을 일관되게 지키면 컴포넌트를 읽는 사람이 구조를 빠르게 파악할 수 있습니다.

**부모 쪽 함수 이름** — 실제 동작을 기준으로 짓습니다.

```tsx
function handleAdd(title: string) { ... }
function handleToggle(id: string) { ... }
function handleDelete(id: string) { ... }
function handleTitleChange(id: string, nextTitle: string) { ... }
```

**자식에게 넘기는 props 이름** — `on + 사건 이름`으로 짓습니다.

```tsx
<TodoForm onAdd={handleAdd} />
<TodoItem todo={todo} onToggle={handleToggle} onDelete={handleDelete} />
```

| 패턴 | 예시 | 의미 |
| --- | --- | --- |
| `on + 명사` | `onAdd`, `onDelete` | "추가/삭제 이벤트가 발생했을 때" |
| `on + 명사 + Change` | `onTitleChange`, `onFilterChange` | "특정 값이 바뀌었을 때" |
| `on + 동작` | `onToggle`, `onSubmit` | "토글/제출 이벤트가 발생했을 때" |
| `handle + 동작` | `handleAdd`, `handleToggle` | 실제 handler 함수 이름 |

`on`으로 시작하는 이름은 "어떤 일이 일어나면 호출해줘"라는 뜻으로 읽힙니다. `handle`로 시작하는 이름은 "이 함수가 그 사건을 처리한다"는 뜻입니다.

이 규칙은 React 공식 문서와 대부분의 React 프로젝트에서 쓰는 관례입니다.

## props로 handler를 받을 때 타입 정의

TypeScript를 쓰면 handler props의 타입을 명확하게 정의합니다.

```tsx
type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string) => void;     // id를 받고 아무것도 반환하지 않음
  onDelete: (id: string) => void;
  onTitleChange: (id: string, nextTitle: string) => void;
};
```

반환값이 없으면 `void`를 씁니다.

인자가 없는 handler는 이렇게 정의합니다.

```tsx
type ModalProps = {
  isOpen: boolean;
  onClose: () => void; // 인자 없음
};
```

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
type PanelProps = {
  title: string;
  children: React.ReactNode;
};

function Panel({ title, children }: PanelProps) {
  return (
    <section className="panel">
      <h2 className="panel-title">{title}</h2>
      <div className="panel-body">{children}</div>
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

이 패턴은 다양한 곳에서 응용됩니다.

```tsx
// 카드 UI
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

// 로딩 래퍼
function LoadingWrapper({
  isLoading,
  children,
}: {
  isLoading: boolean;
  children: React.ReactNode;
}) {
  if (isLoading) return <p>로딩 중...</p>;
  return <>{children}</>;
}

// 조건부 렌더링 래퍼
function AuthGuard({
  isLoggedIn,
  children,
}: {
  isLoggedIn: boolean;
  children: React.ReactNode;
}) {
  if (!isLoggedIn) return <p>로그인이 필요합니다.</p>;
  return <>{children}</>;
}
```

## handler를 중간 컴포넌트를 통해 전달할 때

컴포넌트 계층이 깊어지면 handler가 중간 컴포넌트를 통해 전달됩니다.

```
TodoPage (handleToggle 정의)
  └─ TodoList (onToggle을 받아서 아래로 전달)
       └─ TodoItem (onToggle을 받아서 실제 사용)
```

```tsx
function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
```

`TodoList`는 `onToggle`을 직접 사용하지 않습니다. 단순히 아래로 전달합니다. 이런 경우를 props drilling이라고 합니다.

계층이 2~3단계라면 자연스러운 구조입니다. 5단계 이상으로 깊어지면 Context나 상태 관리 라이브러리를 고려합니다.

## 분리 시 고려할 것들

컴포넌트를 분리할 때 체크하면 좋은 것들입니다.

**재사용 가능성**: 같은 컴포넌트가 다른 곳에서도 쓰일 수 있는가?

```tsx
// Button은 여러 곳에서 재사용 가능
function Button({
  onClick,
  children,
  disabled = false,
}: {
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} className="btn">
      {children}
    </button>
  );
}
```

**가독성**: 분리 후 코드가 더 읽기 쉬워지는가?

분리 전:

```tsx
// 100줄짜리 TodoPage
```

분리 후:

```tsx
function TodoPage() {
  return (
    <Panel title="Todo">
      <TodoForm onAdd={handleAdd} />
      <TodoFilter value={filter} onChange={setFilter} />
      <TodoSummary total={todos.length} completed={completedCount} />
      <TodoList todos={visibleTodos} onToggle={handleToggle} onDelete={handleDelete} />
    </Panel>
  );
}
```

이 코드는 세부 구현을 몰라도 화면의 흐름을 보여줍니다.

## 예제로 이해하기

아래처럼 역할을 나누면 코드가 문장처럼 읽힙니다.

```tsx
function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  function handleAdd(title: string) {
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, done: false },
    ]);
  }

  function handleToggle(id: string) {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  }

  function handleDelete(id: string) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }

  const completedCount = todos.filter((t) => t.done).length;

  const visibleTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.done;
    if (filter === "done") return todo.done;
    return true;
  });

  return (
    <Panel title="Todo">
      <TodoForm onAdd={handleAdd} />
      <TodoFilter value={filter} onChange={setFilter} />
      <TodoSummary total={todos.length} completed={completedCount} />
      <TodoList todos={visibleTodos} onToggle={handleToggle} onDelete={handleDelete} />
    </Panel>
  );
}
```

이 구조에서:

- `TodoPage`는 state와 모든 변경 규칙을 갖습니다.
- `TodoForm`은 입력을 받고 `onAdd`를 호출합니다.
- `TodoFilter`는 필터 선택 UI를 보여주고 `onChange`를 호출합니다.
- `TodoSummary`는 통계를 보여줍니다.
- `TodoList`와 `TodoItem`은 목록을 보여주고 사건을 알립니다.

## 읽으면서 생각할 질문

- 이 컴포넌트는 데이터를 관리하는가, 화면을 보여주는가, 둘 다 하고 있는가?
- 자식 컴포넌트가 부모의 state 변경 규칙을 너무 많이 알고 있지는 않은가?
- handler props 이름이 `onAdd`, `onToggle`, `onChange`처럼 사건 중심으로 읽히는가?
- 반복되는 UI나 역할이 분명한 UI를 컴포넌트로 분리했는가?
- 분리한 뒤 오히려 props 흐름이 더 복잡해지지는 않았는가?
- `children`이 자연스러운 컴포넌트와 props를 받는 컴포넌트를 구분하는가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
