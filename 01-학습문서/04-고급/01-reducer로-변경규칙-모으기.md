# Reducer로 변경 규칙 모으기

`useState`로 시작했는데 event handler마다 `setTodos`를 다르게 부르는 코드가 늘어나면, 어떤 행동이 어떤 상태 변화를 만드는지 컴포넌트 전체를 읽어야만 파악할 수 있게 됩니다.

`useReducer`는 이 변경 규칙을 하나의 함수 안에 모읍니다. 컴포넌트는 "무슨 일이 일어났는지"만 dispatch하고, 실제로 어떻게 바꿀지는 reducer가 결정합니다.

## useReducer 기본 구조

```tsx
const [state, dispatch] = useReducer(reducer, initialState);
```

- `reducer`: `(state, action) => nextState` 형태의 순수 함수
- `initialState`: 초기 state 값
- `state`: 현재 state
- `dispatch`: action을 보내는 함수

## 단계별로 전환하기

Todo 앱에서 `useState`로 작성한 코드를 예로 봅니다.

```tsx
// useState 버전
function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);

  function handleAdd(title: string) {
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), title, done: false }]);
  }

  function handleToggle(id: string) {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo))
    );
  }

  function handleDelete(id: string) {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  }
}
```

상태 변경 규칙이 세 함수에 흩어져 있습니다. `useReducer`로 옮기면 규칙이 한 곳에 모입니다.

**1단계: action 타입 정의**

```tsx
type Todo = {
  id: string;
  title: string;
  done: boolean;
};

type TodoAction =
  | { type: "todo/added"; title: string }
  | { type: "todo/toggled"; id: string }
  | { type: "todo/deleted"; id: string };
```

TypeScript의 discriminated union으로 action별로 필요한 데이터가 명확해집니다. `toggled`에는 `id`가 있고, `added`에는 `title`이 있습니다.

**2단계: reducer 함수 작성**

```tsx
function todoReducer(state: Todo[], action: TodoAction): Todo[] {
  switch (action.type) {
    case "todo/added":
      return [
        ...state,
        { id: crypto.randomUUID(), title: action.title, done: false },
      ];

    case "todo/toggled":
      return state.map((todo) =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo
      );

    case "todo/deleted":
      return state.filter((todo) => todo.id !== action.id);

    default:
      return state;
  }
}
```

reducer는 순수 함수입니다. state를 직접 바꾸지 않고, 항상 새 배열을 반환합니다.

**3단계: 컴포넌트에서 사용**

```tsx
function TodoPage() {
  const [todos, dispatch] = useReducer(todoReducer, []);

  return (
    <>
      <TodoForm onAdd={(title) => dispatch({ type: "todo/added", title })} />
      <TodoList
        todos={todos}
        onToggle={(id) => dispatch({ type: "todo/toggled", id })}
        onDelete={(id) => dispatch({ type: "todo/deleted", id })}
      />
    </>
  );
}
```

컴포넌트는 어떻게 배열이 바뀌는지 몰라도 됩니다. "이런 일이 일어났다"고 dispatch만 합니다.

## action 이름 짓기

action 이름은 "버튼이 무엇을 했는지"보다 "사용자가 무엇을 했는지"에 가깝게 짓습니다.

| 피하는 이름 | 더 나은 이름 |
| --- | --- |
| `SET_TODOS` | `todo/added`, `todo/deleted` |
| `UPDATE` | `profile/nameChanged` |
| `TOGGLE` | `todo/toggled` |
| `RESET` | `form/reset` |
| `HANDLE_CLICK` | `comment/liked` |

`feature/eventName` 형태가 많이 쓰입니다. 나중에 action 목록만 봐도 사용자 행동 흐름이 읽힙니다.

## 여러 필드를 가진 state

배열뿐 아니라 여러 필드를 가진 state도 reducer로 다룰 수 있습니다.

```tsx
type FormState = {
  title: string;
  body: string;
  tags: string[];
  isSubmitting: boolean;
  errorMessage: string | null;
};

type FormAction =
  | { type: "form/titleChanged"; value: string }
  | { type: "form/bodyChanged"; value: string }
  | { type: "form/tagAdded"; tag: string }
  | { type: "form/tagRemoved"; tag: string }
  | { type: "form/submitted" }
  | { type: "form/submitSucceeded" }
  | { type: "form/submitFailed"; message: string }
  | { type: "form/reset" };

const initialFormState: FormState = {
  title: "",
  body: "",
  tags: [],
  isSubmitting: false,
  errorMessage: null,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "form/titleChanged":
      return { ...state, title: action.value };

    case "form/bodyChanged":
      return { ...state, body: action.value };

    case "form/tagAdded":
      return { ...state, tags: [...state.tags, action.tag] };

    case "form/tagRemoved":
      return { ...state, tags: state.tags.filter((t) => t !== action.tag) };

    case "form/submitted":
      return { ...state, isSubmitting: true, errorMessage: null };

    case "form/submitSucceeded":
      return { ...state, isSubmitting: false };

    case "form/submitFailed":
      return { ...state, isSubmitting: false, errorMessage: action.message };

    case "form/reset":
      return initialFormState;

    default:
      return state;
  }
}
```

한 reducer가 `isSubmitting`과 `errorMessage`를 같이 관리하므로, 제출 중에는 두 필드를 일관성 있게 유지할 수 있습니다. `useState` 두 개로 따로 관리했다면 실수할 여지가 생깁니다.

## lazy initialization

`initialState`를 계산하는 비용이 클 때 세 번째 인자로 초기화 함수를 받을 수 있습니다. 컴포넌트가 마운트될 때 한 번만 실행됩니다.

```tsx
function initState(savedData: string | null): FormState {
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch {
      return initialFormState;
    }
  }
  return initialFormState;
}

function DraftEditor() {
  const savedDraft = localStorage.getItem("draft");
  const [state, dispatch] = useReducer(formReducer, savedDraft, initState);
  // ...
}
```

`useReducer(formReducer, savedDraft, initState)` 형태에서 두 번째 인자는 `initState`에 넘겨지는 인자입니다.

## useState와 useReducer 비교

| 상황 | useState | useReducer |
| --- | --- | --- |
| state가 단순한 값 | 좋음 | 과할 수 있음 |
| state가 서로 연관된 여러 값 | 어색해질 수 있음 | 적합 |
| 변경 규칙이 여러 곳에 흩어짐 | 파악하기 어려움 | 한 곳에서 관리 |
| 변경 로직을 독립적으로 테스트하려 함 | 어려움 | reducer만 단독 테스트 가능 |
| 다음 state가 이전 state에 의존 | updater function 필요 | 자연스럽게 처리 |
| 제출 중/실패처럼 연관된 필드 동시 변경 | 실수 여지 있음 | 하나의 action으로 원자적 처리 |

단순한 boolean 토글이나 카운터는 `useState`가 더 간결합니다. state 구조가 복잡해지고 변경 규칙이 많아질 때 `useReducer`가 빛을 냅니다.

## reducer 테스트

reducer는 React 없이도 테스트할 수 있습니다.

```ts
// todoReducer.test.ts
test("todo를 추가하면 배열에 하나가 늘어난다", () => {
  const initialState: Todo[] = [];
  const nextState = todoReducer(initialState, {
    type: "todo/added",
    title: "React 공부",
  });

  expect(nextState).toHaveLength(1);
  expect(nextState[0].title).toBe("React 공부");
  expect(nextState[0].done).toBe(false);
});

test("toggled action은 done 상태를 반전시킨다", () => {
  const initialState: Todo[] = [
    { id: "1", title: "React 공부", done: false },
  ];
  const nextState = todoReducer(initialState, {
    type: "todo/toggled",
    id: "1",
  });

  expect(nextState[0].done).toBe(true);
});

test("알 수 없는 action은 기존 state를 그대로 반환한다", () => {
  const initialState: Todo[] = [{ id: "1", title: "React 공부", done: false }];
  // @ts-expect-error 테스트 목적으로 잘못된 action 전달
  const nextState = todoReducer(initialState, { type: "unknown/action" });

  expect(nextState).toBe(initialState); // 동일 참조
});
```

순수 함수라서 입력과 출력만 검증하면 됩니다. 같은 입력에는 항상 같은 출력이 나오므로 테스트가 결정적입니다.

## useReducer + Context 패턴

복잡한 기능에서는 `useReducer`와 `Context`를 함께 씁니다. state와 dispatch를 두 Context로 분리하면, state만 읽는 컴포넌트와 dispatch만 쓰는 컴포넌트를 분리할 수 있습니다.

```tsx
const TodoStateContext = createContext<Todo[] | null>(null);
const TodoDispatchContext = createContext<Dispatch<TodoAction> | null>(null);

function TodoProvider({ children }: { children: ReactNode }) {
  const [todos, dispatch] = useReducer(todoReducer, []);

  return (
    <TodoStateContext.Provider value={todos}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

function useTodos() {
  const todos = useContext(TodoStateContext);
  if (todos === null) throw new Error("TodoProvider 안에서 사용해야 합니다.");
  return todos;
}

function useTodoDispatch() {
  const dispatch = useContext(TodoDispatchContext);
  if (dispatch === null) throw new Error("TodoProvider 안에서 사용해야 합니다.");
  return dispatch;
}
```

`dispatch` 참조는 re-render를 거쳐도 안정적입니다. dispatch만 쓰는 컴포넌트는 todos가 바뀌어도 다시 렌더링되지 않습니다.

## 흔한 실수

**reducer 안에서 state를 직접 수정하기**

```tsx
// 나쁜 예: state를 직접 수정함
case "todo/toggled":
  const todo = state.find((t) => t.id === action.id);
  if (todo) todo.done = !todo.done; // ← state 직접 수정
  return state;
```

```tsx
// 올바른 예: 새 객체와 새 배열 반환
case "todo/toggled":
  return state.map((todo) =>
    todo.id === action.id ? { ...todo, done: !todo.done } : todo
  );
```

**default case를 빠뜨리기**

미처 처리하지 못한 action이 들어오면 reducer가 `undefined`를 반환할 수 있습니다. 항상 `default: return state`를 둡니다.

**submit 상태와 입력 상태를 별도 useState로 분리하기**

```tsx
// 이렇게 하면 isSubmitting=true인데 errorMessage가 이전 것이 남을 수 있음
const [isSubmitting, setIsSubmitting] = useState(false);
const [errorMessage, setErrorMessage] = useState<string | null>(null);

// 연관된 상태는 reducer로 함께 관리
const [state, dispatch] = useReducer(formReducer, initialFormState);
```

연관된 state를 따로 `useState`로 관리하면 두 state가 일시적으로 불일치하는 "찰나"가 생길 수 있습니다. reducer로 하나의 action에서 함께 바꾸면 항상 일관성이 유지됩니다.

## 읽으면서 생각할 질문

- state 변경 규칙이 한눈에 보이는가?
- action 이름이 사용자의 의도를 설명하는가?
- reducer가 기존 state를 직접 수정하지 않는가?
- 단순한 state까지 reducer로 옮겨 복잡해진 것은 아닌가?
- reducer를 컴포넌트와 분리해 테스트할 수 있는가?
- 연관된 여러 필드가 항상 함께 바뀌어야 한다면 reducer로 원자성을 보장하고 있는가?
