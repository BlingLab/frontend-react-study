# 배열 State 업데이트

React에서 배열 state를 다룰 때는 "기존 배열을 고치는 것"이 아니라 "다음 배열을 만드는 것"으로 생각합니다.

이 차이가 초급에서 아주 중요합니다.

JavaScript 배열은 `push`, `splice`, 인덱스 대입처럼 직접 바꾸는 방법이 많습니다. 하지만 React state는 직접 바꾸면 React가 변경을 제대로 추적하기 어렵고, 코드도 예측하기 힘들어집니다.

## React가 변경을 감지하는 방식

React는 state가 "새로운 값"으로 교체되었는지를 참조 비교로 확인합니다.

배열을 예로 들면, `setTodos(todos)`처럼 같은 배열을 다시 넘기면 React는 "아무것도 바뀌지 않았다"고 판단합니다. 배열 안의 항목이 바뀌었어도 배열 참조 자체가 같으면 변경을 인식하지 못합니다.

```tsx
// 이 코드는 화면을 업데이트하지 않습니다
function handleAdd(title: string) {
  todos.push({ id: crypto.randomUUID(), title, done: false }); // 원본 수정
  setTodos(todos); // 같은 참조를 넘김 → React는 변경 없음으로 봄
}
```

그래서 React에서 배열을 업데이트할 때는 항상 새 배열을 만들어 교체해야 합니다.

```tsx
// 올바른 방식 — 새 배열 참조를 만들어 넘김
function handleAdd(title: string) {
  const newTodo = { id: crypto.randomUUID(), title, done: false };
  setTodos((prev) => [...prev, newTodo]); // 새 배열
}
```

이 패턴은 단순한 관습이 아닙니다. React가 어떤 컴포넌트를 다시 렌더링해야 하는지 효율적으로 판단하기 위한 약속입니다.

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

앞에 추가하고 싶으면 순서를 바꿉니다.

```tsx
setTodos((prev) => [newTodo, ...prev]); // 맨 앞에 추가
```

특정 위치에 삽입하고 싶으면 `slice`를 씁니다.

```tsx
function handleInsert(targetIndex: number, newTodo: Todo) {
  setTodos((prev) => [
    ...prev.slice(0, targetIndex),
    newTodo,
    ...prev.slice(targetIndex),
  ]);
}
```

## 삭제는 filter로 남길 것을 고른다

삭제는 "무엇을 지울까"보다 "무엇을 남길까"로 생각하면 쉽습니다.

```tsx
function handleDelete(id: string) {
  setTodos((todos) => todos.filter((todo) => todo.id !== id));
}
```

`filter`는 조건을 통과한 항목만 남긴 새 배열을 만듭니다.

`todo.id !== id`는 "삭제 대상이 아닌 것만 남긴다"는 뜻입니다.

직접 `splice`를 쓰는 방식은 피합니다.

```tsx
// 피합니다 — splice는 원본 배열을 직접 수정합니다
const index = todos.findIndex((todo) => todo.id === id);
todos.splice(index, 1);
setTodos(todos); // 같은 참조, React가 변경을 감지 못할 수 있음
```

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

배열도 새로 만들고, 바뀐 항목 객체도 새로 만듭니다. 바뀌지 않은 항목은 기존 참조를 그대로 유지하므로 React가 효율적으로 처리합니다.

제목을 수정하는 경우도 같은 방식입니다.

```tsx
function handleTitleChange(id: string, nextTitle: string) {
  setTodos((todos) =>
    todos.map((todo) =>
      todo.id === id ? { ...todo, title: nextTitle } : todo,
    ),
  );
}
```

## 객체 state도 같은 원리다

배열 안의 객체뿐 아니라 일반 객체 state도 직접 수정하지 않습니다.

```tsx
const [profile, setProfile] = useState({
  name: "Mina",
  role: "frontend",
  bio: "",
});
```

하나의 필드만 바꿀 때는 spread로 나머지를 유지합니다.

```tsx
setProfile((profile) => ({
  ...profile,
  role: "react learner",
}));
```

이 코드는 기존 `profile`의 값을 펼친 뒤 `role`만 새 값으로 덮어씁니다. 나머지 필드는 그대로입니다.

아래처럼 직접 할당하는 방식은 피합니다.

```tsx
// 피합니다
profile.role = "react learner"; // 원본 수정
setProfile(profile); // 같은 참조 → 렌더링 안 될 수 있음
```

## 중첩된 객체 업데이트

객체 안에 또 객체가 있는 경우, 각 단계마다 새 객체를 만들어야 합니다.

```tsx
type UserProfile = {
  name: string;
  address: {
    city: string;
    zip: string;
  };
};

const [user, setUser] = useState<UserProfile>({
  name: "Mina",
  address: { city: "Seoul", zip: "04524" },
});
```

`address.city`만 바꾸고 싶을 때:

```tsx
setUser((prev) => ({
  ...prev,              // 최상위 객체 복사
  address: {
    ...prev.address,   // address 객체 복사
    city: "Busan",     // 변경할 필드만 교체
  },
}));
```

한 단계씩 spread로 복사하면서 바꿀 부분만 새 값으로 교체합니다.

중첩이 3~4단계 이상 깊어지면 이 방식은 번거로워집니다. 그 경우는 데이터 구조를 평탄하게 바꾸거나 심화 단계에서 다루는 `immer` 같은 라이브러리를 고려합니다.

## 순서 변경

항목의 순서를 바꾸는 작업도 새 배열을 만드는 방식으로 합니다.

위로 이동하는 예시입니다.

```tsx
function handleMoveUp(index: number) {
  if (index === 0) return; // 이미 맨 위
  setTodos((todos) => {
    const next = [...todos]; // 복사
    [next[index - 1], next[index]] = [next[index], next[index - 1]]; // 교환
    return next;
  });
}
```

`[...todos]`로 복사한 뒤 인덱스를 교환하면 원본 배열을 건드리지 않고 순서를 바꿀 수 있습니다.

아래로 이동은 방향만 반대입니다.

```tsx
function handleMoveDown(index: number) {
  if (index === todos.length - 1) return; // 이미 맨 아래
  setTodos((todos) => {
    const next = [...todos];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    return next;
  });
}
```

## 정렬과 필터링은 원본을 조심한다

`sort`는 원본 배열을 직접 바꿉니다. 그래서 state 배열을 바로 정렬하면 위험합니다.

```tsx
// 위험 — todos state를 직접 정렬합니다
const sortedTodos = todos.sort((a, b) => a.title.localeCompare(b.title));
```

렌더링 중 원본 배열을 변경하면 다음 렌더링에서 예측하기 어려운 결과가 나올 수 있습니다.

복사 후 정렬합니다.

```tsx
const sortedTodos = [...todos].sort((a, b) => a.title.localeCompare(b.title));
```

필터링 결과도 마찬가지로 보통 state에 저장하지 않습니다.

```tsx
const visibleTodos = todos.filter((todo) => {
  if (filter === "done") return todo.done;
  if (filter === "active") return !todo.done;
  return true;
});
```

`todos`와 `filter`가 있으면 `visibleTodos`는 계산할 수 있습니다.

## 흔한 실수 모음

배열 state를 다루면서 자주 만나는 실수입니다.

**push로 추가하기**

```tsx
// 피합니다
todos.push(newTodo);
setTodos(todos);

// 올바름
setTodos((prev) => [...prev, newTodo]);
```

**splice로 삭제하기**

```tsx
// 피합니다
const index = todos.findIndex((t) => t.id === id);
todos.splice(index, 1);
setTodos(todos);

// 올바름
setTodos((prev) => prev.filter((t) => t.id !== id));
```

**직접 인덱스로 항목 수정하기**

```tsx
// 피합니다
todos[0].done = true;
setTodos(todos);

// 올바름
setTodos((prev) =>
  prev.map((todo, i) => (i === 0 ? { ...todo, done: true } : todo)),
);
```

**정렬 시 복사 없이 sort 호출**

```tsx
// 피합니다
const sorted = todos.sort((a, b) => a.title.localeCompare(b.title));

// 올바름
const sorted = [...todos].sort((a, b) => a.title.localeCompare(b.title));
```

## 예제로 이해하기

Todo 앱에서 초급자가 가장 자주 만드는 흐름은 아래 네 가지입니다.

```tsx
// 추가
setTodos((prev) => [...prev, newTodo]);

// 삭제
setTodos((prev) => prev.filter((todo) => todo.id !== id));

// 완료 토글
setTodos((prev) =>
  prev.map((todo) =>
    todo.id === id ? { ...todo, done: !todo.done } : todo,
  ),
);

// 제목 수정
setTodos((prev) =>
  prev.map((todo) =>
    todo.id === id ? { ...todo, title: nextTitle } : todo,
  ),
);
```

처음에는 코드가 길어 보일 수 있습니다. 하지만 이 방식은 "어떤 항목이 어떤 조건에서 어떻게 바뀌는지"가 분명하게 드러납니다.

패턴이 한 번 손에 익으면 자연스럽게 나오기 시작합니다.

## 배열 메서드 요약

| 작업 | 쓰는 메서드 | 원본 수정? |
| --- | --- | --- |
| 추가 (뒤) | `[...prev, newItem]` | 아니오 |
| 추가 (앞) | `[newItem, ...prev]` | 아니오 |
| 삭제 | `prev.filter(...)` | 아니오 |
| 수정 | `prev.map(...)` | 아니오 |
| 정렬 | `[...prev].sort(...)` | 아니오 (복사 후) |
| 역순 | `[...prev].reverse()` | 아니오 (복사 후) |
| 직접 추가 | `prev.push(...)` | **예 — 피합니다** |
| 직접 삭제 | `prev.splice(...)` | **예 — 피합니다** |

## 읽으면서 생각할 질문

- 기존 배열이나 객체를 직접 수정하고 있지는 않은가?
- 추가, 삭제, 수정에 각각 어떤 배열 메서드를 써야 하는가?
- 수정 대상은 id처럼 안정적인 값으로 찾고 있는가?
- 정렬할 때 원본 배열을 직접 바꾸지 않고 복사본을 만들고 있는가?
- 필터링된 결과를 불필요하게 별도 state로 저장하고 있지는 않은가?
- 중첩 객체를 업데이트할 때 각 단계마다 새 객체를 만들고 있는가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
