# 파생 State와 계산값

React 초급에서 코드가 복잡해지는 가장 흔한 이유는 "계산하면 되는 값"을 state로 저장하는 것입니다.

state는 편리합니다. 하지만 state가 많아질수록 서로 맞춰야 하는 값도 많아집니다. 그래서 React에서는 가능한 한 state를 최소로 두고, 렌더링 중 계산할 수 있는 값은 계산합니다.

이 문서에서는 저장해야 하는 값과 계산해야 하는 값을 나눠봅니다.

## 파생 state란 무엇인가

파생 state는 이미 있는 props나 state에서 만들어낼 수 있는데도 따로 저장한 state를 말합니다.

예를 들어 아래 코드를 봅니다.

```tsx
const [todos, setTodos] = useState<Todo[]>([]);
const [completedCount, setCompletedCount] = useState(0);
```

`completedCount`는 `todos`에서 계산할 수 있습니다.

```tsx
const completedCount = todos.filter((todo) => todo.done).length;
```

그러면 굳이 state로 저장하지 않아도 됩니다.

`todos`가 바뀌면 컴포넌트가 다시 렌더링되고, `completedCount`도 새 todos를 기준으로 다시 계산됩니다.

## 중복된 진실을 만들지 않는다

데이터에는 "진짜 기준"이 하나여야 합니다.

할 일 목록에서는 `todos`가 기준입니다. 완료 개수, 남은 개수, 필터링된 목록, 전체 개수는 모두 `todos`에서 계산할 수 있습니다.

```tsx
const totalCount = todos.length;
const completedCount = todos.filter((todo) => todo.done).length;
const activeCount = todos.filter((todo) => !todo.done).length;
const completionRate =
  totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
```

이렇게 하면 할 일을 추가하거나 삭제하거나 완료 처리할 때 `todos`만 바꾸면 됩니다. 나머지 값들은 자동으로 새로 계산됩니다.

반대로 개수까지 state로 들고 있으면 모든 이벤트에서 목록과 개수를 함께 맞춰야 합니다.

```tsx
// 문제가 생기는 코드
function handleToggle(id: string) {
  setTodos((todos) => todos.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  // completedCount도 직접 계산해서 업데이트해야 함
  // 하지만 setTodos가 완료된 시점에 새 todos를 바로 볼 수 없음
  // 결국 동기화가 어긋날 가능성이 생김
}
```

이 문제를 "진실의 출처(source of truth)가 여러 개"가 되는 상황이라고 합니다. `todos`가 진짜인지, `completedCount`가 진짜인지 계속 신경 써야 합니다.

## 필터링된 목록도 대부분 계산값이다

Todo 앱에 필터가 있다고 생각해봅니다.

```tsx
type Filter = "all" | "active" | "done";

const [todos, setTodos] = useState<Todo[]>([]);
const [filter, setFilter] = useState<Filter>("all");
```

여기서 `todos`와 `filter`는 state가 맞습니다. 사용자가 할 일을 바꾸고, 필터 탭을 선택하기 때문입니다.

하지만 `visibleTodos`는 state가 아닙니다.

```tsx
const visibleTodos = todos.filter((todo) => {
  if (filter === "active") return !todo.done;
  if (filter === "done") return todo.done;
  return true;
});
```

`todos`와 `filter`가 있으면 항상 계산할 수 있습니다.

검색어로 필터링하는 경우도 마찬가지입니다.

```tsx
const [keyword, setKeyword] = useState("");
const [items, setItems] = useState<Item[]>([]);

const matchedItems = items.filter((item) =>
  item.title.toLowerCase().includes(keyword.toLowerCase()),
);
```

`keyword`와 `items`는 state, `matchedItems`는 계산값입니다.

## state로 저장해도 되는 계산값은 언제일까

초급 단계에서는 우선 "계산 가능한 값은 state로 저장하지 않는다"를 기본값으로 두면 됩니다.

한 가지 예외 상황이 있습니다. 계산 비용이 아주 크고, 매 렌더링마다 새로 계산하기 부담스러운 경우입니다. 수천 개의 항목을 복잡하게 처리하는 경우가 해당합니다. 이때는 심화 단계에서 배우는 `useMemo`를 사용해 캐싱할 수 있습니다.

```tsx
// 계산이 아주 비싼 경우 — 심화 단계에서 다룹니다
const expensiveResult = useMemo(
  () => items.reduce((acc, item) => /* 복잡한 계산 */, {}),
  [items]
);
```

하지만 일반적인 `filter`, `map`, `reduce` 정도의 계산은 state 없이 렌더링 중 바로 계산해도 충분히 빠릅니다.

## useEffect로 파생 state를 동기화하는 실수

파생 state를 만들 때 흔히 보이는 잘못된 패턴이 있습니다.

```tsx
// 피해야 할 패턴 — useEffect로 파생 state 동기화
const [todos, setTodos] = useState<Todo[]>([]);
const [completedCount, setCompletedCount] = useState(0);

useEffect(() => {
  setCompletedCount(todos.filter((t) => t.done).length);
}, [todos]);
```

이 코드는 `todos`가 바뀔 때마다 `completedCount`를 업데이트합니다. 의도는 맞지만 방식이 잘못되었습니다.

- `todos` 변경 → 렌더링
- `useEffect` 실행 → `setCompletedCount` 호출
- 다시 렌더링

불필요한 렌더링이 한 번 더 일어납니다. `useEffect`는 이런 용도로 쓰는 것이 아닙니다.

올바른 방법은 간단합니다.

```tsx
const [todos, setTodos] = useState<Todo[]>([]);
const completedCount = todos.filter((t) => t.done).length; // 렌더링 중 계산
```

한 줄로 해결됩니다.

## 입력값과 계산값을 구분한다

검색 화면에서 state와 계산값은 이렇게 나뉩니다.

```tsx
function SearchableList({ lessons }: { lessons: Lesson[] }) {
  const [keyword, setKeyword] = useState("");

  const visibleLessons = lessons.filter((lesson) =>
    lesson.title.includes(keyword),
  );

  return (
    <>
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="검색"
      />
      <p>검색 결과 {visibleLessons.length}개</p>
      <LessonList lessons={visibleLessons} />
    </>
  );
}
```

`keyword`는 사용자가 입력하므로 state입니다.

`visibleLessons`와 결과 개수는 `lessons`와 `keyword`에서 계산되므로 state가 아닙니다.

이 구분이 잡히면 React 코드가 훨씬 안정적으로 느껴집니다.

## 전체 요약 표

| 값 | state? | 이유 |
| --- | --- | --- |
| `todos` 배열 | ✅ | 사용자 행동으로 추가/삭제/수정됨 |
| `keyword` (검색어) | ✅ | 사용자가 타이핑하며 변경 |
| `filter` (탭 선택) | ✅ | 사용자 클릭으로 변경 |
| `isOpen` (모달) | ✅ | 사용자 클릭으로 변경 |
| `completedCount` | ❌ | `todos.filter(...).length`로 계산 가능 |
| `activeCount` | ❌ | `todos.length - completedCount`로 계산 가능 |
| `visibleTodos` | ❌ | `todos + filter`로 계산 가능 |
| `totalCount` | ❌ | `todos.length`로 계산 가능 |
| `completionRate` | ❌ | `completedCount / totalCount`로 계산 가능 |
| `matchedItems` | ❌ | `items + keyword`로 계산 가능 |
| 버튼 텍스트 (조건부) | ❌ | 다른 state에서 계산 가능 |

## 예제로 이해하기

할 일 목록에서 완료율을 보여주고 싶다고 해봅니다.

```tsx
function TodoSummary({ todos }: { todos: Todo[] }) {
  const completedCount = todos.filter((todo) => todo.done).length;
  const progress =
    todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);

  return (
    <div>
      <p>
        {completedCount} / {todos.length} 완료
      </p>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>
      <p>{progress}% 달성</p>
    </div>
  );
}
```

완료율도 state가 아닙니다. todos가 바뀔 때마다 계산하면 됩니다.

state는 "사용자가 직접 바꾸는 기준 데이터"에 가깝고, 계산값은 "기준 데이터에서 읽어낸 결과"에 가깝습니다.

이 분류 감각이 생기면 React 코드를 짤 때 "어디에 state를 둘까"보다 "무엇이 진짜 기준 데이터인가"를 먼저 생각하게 됩니다.

## 읽으면서 생각할 질문

- 이 값은 사용자가 직접 바꾸는 기준 데이터인가, 아니면 기준 데이터에서 계산한 결과인가?
- 같은 의미의 데이터를 두 곳에 저장하고 있지는 않은가?
- 목록 개수, 완료 개수, 필터링 결과를 state로 들고 있지는 않은가?
- 계산값을 state로 저장해서 업데이트 순서를 신경 써야 하는 상황을 만들었는가?
- `useEffect`로 파생 state를 동기화하려 하고 있지는 않은가?
- 현재 컴포넌트의 진짜 기준 데이터가 무엇인지 한 문장으로 말할 수 있는가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
