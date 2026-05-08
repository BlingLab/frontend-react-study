import { FormEvent, useState } from "react";

type Todo = {
  id: number;
  title: string;
  done: boolean;
};

const initialTodos: Todo[] = [
  { id: 1, title: "JSX 문서 읽기", done: true },
  { id: 2, title: "state 예제 수정하기", done: false },
];

export function EventsFormsExample() {
  const [todos, setTodos] = useState(initialTodos);
  const [title, setTitle] = useState("");
  const remainingCount = todos.filter((todo) => !todo.done).length;

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return;

    setTodos((currentTodos) => [
      ...currentTodos,
      { id: Date.now(), title: trimmedTitle, done: false },
    ]);
    setTitle("");
  }

  function toggleTodo(id: number) {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  }

  function deleteTodo(id: number) {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">Events · Forms</p>
        <h2>폼으로 할 일 추가하기</h2>
      </div>

      <form className="form-row" onSubmit={addTodo}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="오늘 연습할 내용"
        />
        <button type="submit">추가</button>
      </form>

      <p className="muted">남은 할 일: {remainingCount}개</p>

      <ul className="stack-list">
        {todos.map((todo) => (
          <li key={todo.id} className="stack-item">
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              <span className={todo.done ? "done" : ""}>{todo.title}</span>
            </label>
            <button type="button" onClick={() => deleteTodo(todo.id)}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
