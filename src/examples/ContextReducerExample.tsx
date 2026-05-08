import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
} from "react";

type Todo = {
  id: number;
  title: string;
  done: boolean;
};

type TodoAction =
  | { type: "todo/added"; title: string }
  | { type: "todo/toggled"; id: number }
  | { type: "todo/clearedCompleted" };

type TodoState = {
  todos: Todo[];
};

const initialTodoState: TodoState = {
  todos: [
    { id: 1, title: "reducer action 읽기", done: true },
    { id: 2, title: "Context 범위 생각하기", done: false },
  ],
};

const TodoStateContext = createContext<TodoState | null>(null);
const TodoDispatchContext = createContext<React.Dispatch<TodoAction> | null>(null);

function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case "todo/added":
      return {
        todos: [
          ...state.todos,
          { id: Date.now(), title: action.title, done: false },
        ],
      };
    case "todo/toggled":
      return {
        todos: state.todos.map((todo) =>
          todo.id === action.id ? { ...todo, done: !todo.done } : todo,
        ),
      };
    case "todo/clearedCompleted":
      return {
        todos: state.todos.filter((todo) => !todo.done),
      };
    default:
      return state;
  }
}

function TodoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, initialTodoState);
  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

function useTodoState() {
  const state = useContext(TodoStateContext);
  if (!state) throw new Error("useTodoState must be used inside TodoProvider");
  return state;
}

function useTodoDispatch() {
  const dispatch = useContext(TodoDispatchContext);
  if (!dispatch) throw new Error("useTodoDispatch must be used inside TodoProvider");
  return dispatch;
}

function TodoComposer() {
  const [title, setTitle] = useState("");
  const dispatch = useTodoDispatch();

  return (
    <form
      className="form-row"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;
        dispatch({ type: "todo/added", title: trimmedTitle });
        setTitle("");
      }}
    >
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="reducer로 추가할 일"
      />
      <button type="submit">추가</button>
    </form>
  );
}

function TodoReducerList() {
  const { todos } = useTodoState();
  const dispatch = useTodoDispatch();
  const summary = useMemo(
    () => ({
      total: todos.length,
      done: todos.filter((todo) => todo.done).length,
    }),
    [todos],
  );

  return (
    <>
      <p className="muted">
        전체 {summary.total}개 · 완료 {summary.done}개
      </p>
      <ul className="stack-list">
        {todos.map((todo) => (
          <li key={todo.id} className="stack-item">
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => dispatch({ type: "todo/toggled", id: todo.id })}
              />
              <span className={todo.done ? "done" : ""}>{todo.title}</span>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => dispatch({ type: "todo/clearedCompleted" })}
      >
        완료 항목 정리
      </button>
    </>
  );
}

export function ContextReducerExample() {
  return (
    <TodoProvider>
      <section className="example-panel">
        <div className="example-heading">
          <p className="eyebrow">Context · Reducer</p>
          <h2>상태 변경 규칙 모으기</h2>
        </div>
        <TodoComposer />
        <TodoReducerList />
      </section>
    </TodoProvider>
  );
}
