# 배열 State 업데이트

React에서 배열 state를 다룰 때는 "기존 배열을 고치는 것"이 아니라 "다음 배열을 만드는 것"으로 생각합니다.

이 차이가 초급에서 아주 중요합니다.

JavaScript 배열은 `push`, `splice`, 인덱스 대입처럼 직접 바꾸는 방법이 많습니다. 하지만 React state는 직접 바꾸면 React가 변경을 제대로 추적하기 어렵고, 코드도 예측하기 힘들어집니다.

## 추가는 새 배열을 만든다

할 일을 추가한다고 생각해봅니다.

```tsx
type Todo = {
  id: string;
  title: string;
  done: boolean;
};

const [todos, setTodos] = useState<Todo[]>([]);
```

새 항목을 뒤에 붙일 때는 spread 문법을 사용합니다.

```tsx
function handleAdd(title: string) {
  const newTodo = {
    id: crypto.randomUUID(),
    title,
    done: false,
  };

  setTodos((prev) => [...prev, newTodo]);
}
```

`[...todos, newTodo]`는 기존 배열의 항목을 펼친 뒤 새 항목을 붙인 다음, 완전히 새로운 배열을 만듭니다.

반대로 아래 코드는 피합니다.

```tsx
todos.push(newTodo);
setTodos(todos);
```

이 코드는 기존 배열 자체를 바꿉니다. React 코드에서는 "새 값으로 교체한다"는 흐름을 유지하는 편이 안전합니다.

## 삭제는 filter로 남길 것을 고른다

삭제는 "무엇을 지울까"보다 "무엇을 남길까"로 생각하면 쉽습니다.

```tsx
function handleDelete(id: string) {
  setTodos((todos) => todos.filter((todo) => todo.id !== id));
}
```

`filter`는 조건을 통과한 항목만 남긴 새 배열을 만듭니다.

`todo.id !== id`는 "삭제 대상이 아닌 것만 남긴다"는 뜻입니다.

## 수정은 map으로 항목을 바꾼다

완료 상태를 토글할 때는 배열 안의 특정 항목 하나만 바꿔야 합니다.

이때는 `map`을 사용합니다.

```tsx
function handleToggle(id: string) {
  setTodos((todos) =>
    todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo,
    ),
  );
}
```

흐름을 문장으로 읽으면 이렇습니다.

- 모든 todo를 하나씩 봅니다.
- id가 일치하면 새 객체를 만들어 `done`만 반대로 바꿉니다.
- id가 다르면 기존 todo를 그대로 둡니다.
- 결과로 새 배열을 만듭니다.

배열도 새로 만들고, 바뀐 항목 객체도 새로 만듭니다.

## 객체 state도 같은 원리다

배열 안의 객체뿐 아니라 일반 객체 state도 직접 수정하지 않습니다.

```tsx
const [profile, setProfile] = useState({
  name: "Mina",
  role: "frontend",
});

setProfile((profile) => ({
  ...profile,
  role: "react learner",
}));
```

이 코드는 기존 `profile`의 값을 펼친 뒤 `role`만 새 값으로 덮어씁니다.

React에서는 배열과 객체를 "바꿀 수 있는 값"이 아니라 "새로 만들어 교체하는 값"처럼 다룹니다.

## 정렬과 필터링은 원본을 조심한다

`sort`는 원본 배열을 직접 바꿉니다. 그래서 state 배열을 바로 정렬하면 위험합니다.

```tsx
const sortedTodos = [...todos].sort((a, b) => a.title.localeCompare(b.title));
```

먼저 새 배열을 만들고 정렬합니다.

필터링 결과도 마찬가지로 보통 state에 저장하지 않습니다.

```tsx
const visibleTodos = todos.filter((todo) => {
  if (filter === "done") return todo.done;
  if (filter === "active") return !todo.done;
  return true;
});
```

`todos`와 `filter`가 있으면 `visibleTodos`는 계산할 수 있습니다.

## 예제로 이해하기

Todo 앱에서 초급자가 가장 자주 만드는 흐름은 아래 네 가지입니다.

```tsx
// 추가
setTodos((todos) => [...todos, newTodo]);

// 삭제
setTodos((todos) => todos.filter((todo) => todo.id !== id));

// 완료 토글
setTodos((todos) =>
  todos.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo,
  ),
);

// 제목 수정
setTodos((todos) =>
  todos.map((todo) =>
    todo.id === id ? { ...todo, title: nextTitle } : todo,
  ),
);
```

처음에는 코드가 길어 보일 수 있습니다. 하지만 이 방식은 "어떤 항목이 어떤 조건에서 어떻게 바뀌는지"가 분명하게 드러납니다.

## 읽으면서 생각할 질문

- 기존 배열이나 객체를 직접 수정하고 있지는 않은가?
- 추가, 삭제, 수정에 각각 어떤 배열 메서드를 써야 하는가?
- 수정 대상은 id처럼 안정적인 값으로 찾고 있는가?
- 정렬할 때 원본 배열을 직접 바꾸지 않고 복사본을 만들고 있는가?
- 필터링된 결과를 불필요하게 별도 state로 저장하고 있지는 않은가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
