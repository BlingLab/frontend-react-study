# State 위치 정하기

state를 어디에 둘지는 초급에서 계속 마주치는 문제입니다.

처음에는 "state가 필요한 컴포넌트 안에 두면 되지 않나?"라고 생각하기 쉽습니다. 한 컴포넌트만 그 값을 쓰면 맞습니다. 하지만 여러 컴포넌트가 같은 값을 읽거나 바꿔야 하면 위치를 다시 생각해야 합니다.

React에서는 데이터를 아래로 내려보냅니다. 부모가 state를 가지고, 자식은 props로 값을 받습니다. 자식에서 일이 일어나면 handler를 호출해 부모에게 알립니다.

## 혼자 쓰는 state는 가까이 둔다

토글 버튼 하나가 자기 open 상태만 관리한다면 그 컴포넌트 안에 state를 둡니다.

```tsx
function MoreButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <button onClick={() => setIsOpen((prev) => !prev)}>더보기</button>
      {isOpen && <p>추가 설명입니다.</p>}
    </section>
  );
}
```

이 상태는 다른 컴포넌트가 몰라도 됩니다. 가까이 둘수록 코드가 단순합니다.

state를 무조건 위로 올리는 것도 좋은 습관은 아닙니다. 필요한 곳에 가장 가깝게 두는 것이 먼저입니다.

## 같이 쓰면 공통 부모로 올린다

이번에는 검색 input과 목록이 같은 검색어를 사용한다고 생각해봅니다.

```tsx
function SearchInput({ keyword, onKeywordChange }: SearchInputProps) {
  return (
    <input
      value={keyword}
      onChange={(event) => onKeywordChange(event.target.value)}
      placeholder="검색"
    />
  );
}

function LessonList({ lessons }: { lessons: Lesson[] }) {
  return (
    <ul>
      {lessons.map((lesson) => (
        <li key={lesson.id}>{lesson.title}</li>
      ))}
    </ul>
  );
}
```

검색어는 input이 바꾸고, 목록이 읽습니다.

이럴 때 검색어 state는 두 컴포넌트의 가장 가까운 공통 부모에 둡니다.

```tsx
function LessonSearchPage({ lessons }: { lessons: Lesson[] }) {
  const [keyword, setKeyword] = useState("");

  const visibleLessons = lessons.filter((lesson) =>
    lesson.title.includes(keyword),
  );

  return (
    <>
      <SearchInput keyword={keyword} onKeywordChange={setKeyword} />
      <LessonList lessons={visibleLessons} />
    </>
  );
}
```

이제 흐름이 명확합니다.

- 부모가 `keyword`를 기억합니다.
- input은 `keyword`를 보여주고 변경 이벤트를 부모에게 알립니다.
- 부모가 `visibleLessons`를 계산합니다.
- 목록은 계산된 결과만 받아서 보여줍니다.

## 데이터는 내려가고 이벤트는 올라간다

React에서 자주 쓰는 문장입니다.

```tsx
<TodoItem todo={todo} onToggle={handleToggle} />
```

`todo`는 데이터입니다. 부모에서 자식으로 내려갑니다.

`onToggle`은 이벤트 handler입니다. 자식이 클릭을 받으면 이 함수를 호출해서 부모에게 알립니다.

```tsx
function TodoItem({ todo, onToggle }: TodoItemProps) {
  return (
    <button onClick={() => onToggle(todo.id)}>
      {todo.done ? "완료" : "진행 중"} - {todo.title}
    </button>
  );
}
```

자식 컴포넌트는 부모의 state 구조를 자세히 몰라도 됩니다. 그냥 "이 todo가 토글되었다"고 알리면 됩니다.

실제로 state를 바꾸는 일은 부모가 합니다.

## state를 너무 빨리 올리면 생기는 일

state를 위로 올리면 여러 컴포넌트가 공유할 수 있습니다. 대신 props가 늘어나고, 부모 컴포넌트가 더 많은 책임을 갖게 됩니다.

그래서 기준은 단순합니다.

- 한 컴포넌트만 쓰면 그 컴포넌트 안에 둡니다.
- 형제 컴포넌트가 같이 쓰면 공통 부모로 올립니다.
- 너무 멀리 있는 컴포넌트들이 자주 공유하면 고급 단계에서 context나 상태 관리 방식을 고민합니다.

초급에서는 무조건 전역으로 빼는 것이 아니라, "가장 가까운 공통 부모"를 찾는 연습이 중요합니다.

## 예제로 이해하기

Todo 화면을 세 컴포넌트로 나누면 이런 형태가 됩니다.

```tsx
function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);

  function handleAdd(title: string) {
    setTodos((prev) => [...prev, { id: crypto.randomUUID(), title, done: false }]);
  }

  function handleToggle(id: string) {
    setTodos((todos) =>
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  }

  return (
    <>
      <TodoForm onAdd={handleAdd} />
      <TodoList todos={todos} onToggle={handleToggle} />
    </>
  );
}
```

`TodoPage`는 state와 변경 규칙을 갖습니다.

`TodoForm`은 새 제목을 입력받고 `onAdd`를 호출합니다.

`TodoList`와 `TodoItem`은 todos를 보여주고 `onToggle`을 호출합니다.

이 구조가 React 초급에서 가장 자주 쓰는 기본 흐름입니다.

## 읽으면서 생각할 질문

- 이 state를 읽는 컴포넌트는 어디인가?
- 이 state를 바꾸는 이벤트는 어디에서 발생하는가?
- 여러 컴포넌트가 같은 값을 필요로 한다면 가장 가까운 공통 부모는 어디인가?
- 자식이 부모 state를 직접 바꾸려 하지 않고 handler를 호출하고 있는가?
- state를 너무 위로 올려서 props가 불필요하게 복잡해지지는 않았는가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
