# State 위치 정하기

state를 어디에 둘지는 초급에서 계속 마주치는 문제입니다.

처음에는 "state가 필요한 컴포넌트 안에 두면 되지 않나?"라고 생각하기 쉽습니다. 한 컴포넌트만 그 값을 쓰면 맞습니다. 하지만 여러 컴포넌트가 같은 값을 읽거나 바꿔야 하면 위치를 다시 생각해야 합니다.

React에서는 데이터를 아래로 내려보냅니다. 부모가 state를 가지고, 자식은 props로 값을 받습니다. 자식에서 일이 일어나면 handler를 호출해 부모에게 알립니다.

## state 위치를 결정하는 기준

state를 어디에 둘지는 "누가 이 값을 읽고 바꾸는가"로 결정합니다.

1. **이 값을 한 컴포넌트만 사용한다** → 그 컴포넌트 안에 둡니다.
2. **두 형제 컴포넌트가 같은 값을 사용한다** → 공통 부모로 올립니다.
3. **매우 먼 관계의 컴포넌트들이 공유한다** → Context나 상태 관리 라이브러리(심화 단계)를 고려합니다.

이 원칙을 **Colocation(코로케이션)**이라고 부르기도 합니다. state를 그 값을 가장 필요로 하는 곳 가까이 두는 것입니다.

## 혼자 쓰는 state는 가까이 둔다

토글 버튼 하나가 자기 open 상태만 관리한다면 그 컴포넌트 안에 state를 둡니다.

```tsx
function MoreButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section>
      <button onClick={() => setIsOpen((prev) => !prev)}>
        {isOpen ? "접기" : "더보기"}
      </button>
      {isOpen && <p>추가 설명입니다.</p>}
    </section>
  );
}
```

이 상태는 다른 컴포넌트가 몰라도 됩니다. 가까이 둘수록 코드가 단순합니다.

모달, 드롭다운, 아코디언처럼 "열림/닫힘"만 관리하는 컴포넌트는 대부분 이 경우에 해당합니다.

state를 무조건 위로 올리는 것도 좋은 습관은 아닙니다. 필요한 곳에 가장 가깝게 두는 것이 먼저입니다. 불필요하게 올린 state는 부모 컴포넌트를 무겁게 만들고 props를 복잡하게 합니다.

## 형제 컴포넌트가 같은 값을 쓰면 공통 부모로 올린다

이번에는 검색 input과 목록이 같은 검색어를 사용한다고 생각해봅니다.

```tsx
// SearchInput은 keyword를 보여주고 변경합니다
function SearchInput({ keyword, onKeywordChange }: SearchInputProps) {
  return (
    <input
      value={keyword}
      onChange={(event) => onKeywordChange(event.target.value)}
      placeholder="검색"
    />
  );
}

// LessonList는 keyword를 기준으로 필터링된 목록을 받습니다
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

`SearchInput`이 keyword를 바꾸고, `LessonList`가 그 keyword를 기반으로 필터링합니다.

이 두 컴포넌트는 형제 관계입니다. 둘 사이에서 직접 데이터를 주고받을 수 없습니다. React는 데이터를 위에서 아래로만 흘려보내기 때문입니다.

해결책은 keyword state를 두 컴포넌트의 가장 가까운 공통 부모로 올리는 것입니다.

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

- 부모(`LessonSearchPage`)가 `keyword`를 기억합니다.
- `SearchInput`은 `keyword`를 보여주고 변경 이벤트를 부모에게 알립니다.
- 부모가 `visibleLessons`를 계산합니다.
- `LessonList`는 계산된 결과만 받아서 보여줍니다.

이 패턴을 **state 끌어올리기(lifting state up)**라고 합니다.

## state 끌어올리기 단계별 예시

처음에 keyword를 `SearchInput` 안에 두었다고 생각해봅니다.

```tsx
// 처음 — keyword가 SearchInput 안에 있음
function SearchInput() {
  const [keyword, setKeyword] = useState("");

  return (
    <input
      value={keyword}
      onChange={(e) => setKeyword(e.target.value)}
    />
  );
}

function LessonSearchPage({ lessons }: { lessons: Lesson[] }) {
  // 여기서는 keyword에 접근할 수 없음
  return (
    <>
      <SearchInput />
      <LessonList lessons={lessons} /> {/* 필터링 불가 */}
    </>
  );
}
```

`SearchInput`이 keyword를 혼자 갖고 있으면 `LessonSearchPage`에서 접근할 수 없습니다.

이제 keyword를 부모로 올립니다.

```tsx
// 끌어올린 후 — keyword가 공통 부모로 이동
type SearchInputProps = {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
};

function SearchInput({ keyword, onKeywordChange }: SearchInputProps) {
  return (
    <input
      value={keyword}
      onChange={(e) => onKeywordChange(e.target.value)}
    />
  );
}

function LessonSearchPage({ lessons }: { lessons: Lesson[] }) {
  const [keyword, setKeyword] = useState(""); // keyword가 여기로 이동

  const visibleLessons = lessons.filter((l) => l.title.includes(keyword));

  return (
    <>
      <SearchInput keyword={keyword} onKeywordChange={setKeyword} />
      <LessonList lessons={visibleLessons} />
    </>
  );
}
```

`SearchInput`은 이제 keyword를 props로 받습니다. 자기가 기억하는 대신 부모에게 보여달라고 받고, 바뀌면 알려줍니다.

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
    <li>
      <button onClick={() => onToggle(todo.id)}>
        {todo.done ? "✓ 완료" : "진행 중"}
      </button>
      <span>{todo.title}</span>
    </li>
  );
}
```

자식 컴포넌트는 부모의 state 구조를 자세히 몰라도 됩니다. 그냥 "이 todo가 토글되었다"고 알리면 됩니다.

실제로 state를 바꾸는 일은 부모가 합니다.

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

자식이 `setTodos`를 직접 호출하려 한다면, state가 잘못된 위치에 있거나 역할 분리가 어긋난 신호입니다.

## state를 너무 빨리 올리면 생기는 일

state를 위로 올리면 여러 컴포넌트가 공유할 수 있습니다. 대신 props가 늘어나고, 부모 컴포넌트가 더 많은 책임을 갖게 됩니다.

한 컴포넌트에서만 쓰는 state를 무조건 최상위로 올리면 오히려 관리가 어려워집니다.

```tsx
// 좋지 않음 — isTooltipOpen은 Tooltip 안에서만 쓰는데 위로 올라가 있음
function App() {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  // ... 더 많은 state

  return (
    <>
      <Tooltip isOpen={isTooltipOpen} onToggle={setIsTooltipOpen} />
      <TodoList todos={todos} />
    </>
  );
}
```

`isTooltipOpen`은 `Tooltip` 안에서만 필요하므로 `Tooltip` 안에 두는 것이 맞습니다.

기준은 단순합니다.

- 한 컴포넌트만 쓰면 그 컴포넌트 안에 둡니다.
- 형제 컴포넌트가 같이 쓰면 공통 부모로 올립니다.
- 너무 멀리 있는 컴포넌트들이 자주 공유하면 심화 단계에서 Context나 상태 관리를 고민합니다.

초급에서는 무조건 전역으로 빼는 것이 아니라, "가장 가까운 공통 부모"를 찾는 연습이 중요합니다.

## prop drilling 미리보기

state를 끌어올릴수록 그 값을 props로 여러 단계를 거쳐 내려보내야 하는 상황이 생깁니다.

```
App
  └─ UserPage (todos를 받아서 아래로 전달)
       └─ TodoSection (todos를 받아서 아래로 전달)
            └─ TodoList (todos를 받아서 아래로 전달)
                 └─ TodoItem (todos를 드디어 사용)
```

이렇게 중간 컴포넌트들이 단순히 아래로 전달만 하는 경우를 **prop drilling**이라고 합니다.

초급 단계에서는 컴포넌트 계층이 깊지 않아서 보통 문제가 되지 않습니다. 하지만 컴포넌트 트리가 깊어지면 이 패턴이 불편해집니다. 그때 고급 단계에서 Context API나 상태 관리 라이브러리를 배우게 됩니다.

## 예제로 이해하기

Todo 화면을 세 컴포넌트로 나누면 이런 형태가 됩니다.

```tsx
function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);

  function handleAdd(title: string) {
    setTodos((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title, done: false },
    ]);
  }

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

  return (
    <>
      <TodoForm onAdd={handleAdd} />
      <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
    </>
  );
}
```

`TodoPage`는 state와 변경 규칙을 갖습니다.

`TodoForm`은 새 제목을 입력받고 `onAdd`를 호출합니다.

`TodoList`와 `TodoItem`은 todos를 보여주고 `onToggle`, `onDelete`를 호출합니다.

이 구조가 React 초급에서 가장 자주 쓰는 기본 흐름입니다.

## 상태 위치 결정 흐름도

어디에 state를 두어야 할지 막힐 때 이 순서로 생각합니다.

1. **이 state를 읽는 컴포넌트는 어디인가?**
2. **이 state를 바꾸는 이벤트는 어디에서 발생하는가?**
3. 읽는 곳과 바꾸는 곳이 같은 컴포넌트라면 → 그 컴포넌트에 두기
4. 다른 컴포넌트라면 → 두 컴포넌트의 가장 가까운 공통 부모 찾기
5. 공통 부모에 state 두기 → 읽는 쪽에 props로 전달, 바꾸는 쪽에 handler 전달

## 읽으면서 생각할 질문

- 이 state를 읽는 컴포넌트는 어디인가?
- 이 state를 바꾸는 이벤트는 어디에서 발생하는가?
- 여러 컴포넌트가 같은 값을 필요로 한다면 가장 가까운 공통 부모는 어디인가?
- 자식이 부모 state를 직접 바꾸려 하지 않고 handler를 호출하고 있는가?
- state를 너무 위로 올려서 props가 불필요하게 복잡해지지는 않았는가?
- prop drilling이 보인다면, 지금 단계에서 허용 가능한 수준인가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
