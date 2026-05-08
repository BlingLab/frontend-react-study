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
```

이렇게 하면 할 일을 추가하거나 삭제하거나 완료 처리할 때 `todos`만 바꾸면 됩니다.

반대로 개수까지 state로 들고 있으면 모든 이벤트에서 목록과 개수를 함께 맞춰야 합니다. 이때부터 버그가 들어오기 쉽습니다.

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

## state로 저장해도 되는 계산값은 언제일까

초급 단계에서는 우선 "계산 가능한 값은 state로 저장하지 않는다"를 기본값으로 두면 됩니다.

예외는 나중에 성능 최적화나 외부 시스템 동기화 같은 맥락에서 다룹니다. 지금은 먼저 데이터를 단순하게 유지하는 습관이 더 중요합니다.

계산 비용이 아주 크지 않은 한, 렌더링 중 계산하는 방식이 더 읽기 쉽습니다.

```tsx
const visibleLessons = lessons.filter((lesson) =>
  lesson.title.toLowerCase().includes(keyword.toLowerCase()),
);
```

이 정도 계산은 state로 빼기보다 그대로 두는 편이 낫습니다.

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
      <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
      <p>검색 결과 {visibleLessons.length}개</p>
      <LessonList lessons={visibleLessons} />
    </>
  );
}
```

`keyword`는 사용자가 입력하므로 state입니다.

`visibleLessons`와 결과 개수는 `lessons`와 `keyword`에서 계산되므로 state가 아닙니다.

이 구분이 잡히면 React 코드가 훨씬 안정적으로 느껴집니다.

## 예제로 이해하기

할 일 목록에서 완료율을 보여주고 싶다고 해봅니다.

```tsx
const completedCount = todos.filter((todo) => todo.done).length;
const progress =
  todos.length === 0 ? 0 : Math.round((completedCount / todos.length) * 100);
```

완료율도 state가 아닙니다. todos가 바뀔 때마다 계산하면 됩니다.

state는 "사용자가 직접 바꾸는 기준 데이터"에 가깝고, 계산값은 "기준 데이터에서 읽어낸 결과"에 가깝습니다.

## 읽으면서 생각할 질문

- 이 값은 사용자가 직접 바꾸는 기준 데이터인가, 아니면 기준 데이터에서 계산한 결과인가?
- 같은 의미의 데이터를 두 곳에 저장하고 있지는 않은가?
- 목록 개수, 완료 개수, 필터링 결과를 state로 들고 있지는 않은가?
- 계산값을 state로 저장해서 업데이트 순서를 신경 써야 하는 상황을 만들었는가?
- 현재 컴포넌트의 진짜 기준 데이터가 무엇인지 한 문장으로 말할 수 있는가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
