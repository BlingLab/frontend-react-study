# State를 고르는 법

초급에서 가장 먼저 잡아야 하는 감각은 "무엇을 기억할 것인가"입니다.

React 컴포넌트는 props와 state를 기준으로 UI를 다시 계산합니다. props는 부모가 내려주는 값이고, state는 컴포넌트가 렌더링 사이에 기억하는 값입니다.

여기서 중요한 말은 "렌더링 사이에 기억"입니다. 화면에 보인다고 전부 state가 아닙니다. 화면에 보이는 값 중 상당수는 이미 있는 props나 state에서 계산할 수 있습니다.

## state가 필요한 순간

예를 들어 카운터를 만든다고 생각해봅니다.

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <section>
      <p>현재 값: {count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>증가</button>
    </section>
  );
}
```

`count`는 state가 맞습니다.

사용자가 버튼을 누를 때마다 값이 바뀌고, 다음 렌더링에서도 그 값을 기억해야 합니다. props에서 받을 수도 없고, 다른 값에서 계산할 수도 없습니다.

이번에는 할 일 목록을 봅니다.

```tsx
type Todo = {
  id: number;
  title: string;
  done: boolean;
};

function TodoSummary({ todos }: { todos: Todo[] }) {
  const completedCount = todos.filter((todo) => todo.done).length;
  const remainingCount = todos.length - completedCount;

  return (
    <p>
      완료 {completedCount}개, 남음 {remainingCount}개
    </p>
  );
}
```

`completedCount`와 `remainingCount`는 state가 아닙니다.

둘 다 `todos`에서 계산할 수 있습니다. 이런 값을 state로 따로 저장하면 나중에 `todos`와 개수가 서로 어긋날 수 있습니다.

## state를 많이 두면 왜 어려워질까

처음에는 state를 많이 두는 편이 편해 보입니다.

```tsx
const [todos, setTodos] = useState<Todo[]>([]);
const [completedCount, setCompletedCount] = useState(0);
const [remainingCount, setRemainingCount] = useState(0);
```

하지만 이제 할 일을 추가하거나 삭제하거나 완료 처리할 때마다 세 state를 모두 맞춰야 합니다.

문제는 React가 아니라 데이터의 기준이 여러 개가 된 것입니다. `todos`가 진짜인지, `completedCount`가 진짜인지 계속 신경 써야 합니다.

초급 단계에서는 이 습관을 강하게 가져가면 좋습니다.

> state는 최소로 두고, 나머지는 렌더링 중 계산한다.

## 초기값은 화면의 첫 상태다

state의 초기값은 "처음 화면이 어떤 상태여야 하는가"를 나타냅니다.

```tsx
const [keyword, setKeyword] = useState("");
const [selectedCategory, setSelectedCategory] = useState("all");
const [isOpen, setIsOpen] = useState(false);
```

빈 검색어로 시작한다면 `""`가 자연스럽습니다. 전체 카테고리를 보여줘야 한다면 `"all"`이 좋습니다. 모달이 처음에 닫혀 있어야 한다면 `false`가 맞습니다.

초기값을 대충 넣으면 이후 조건부 렌더링과 form 처리에서 계속 애매함이 생깁니다.

## 이전 state에 의존할 때

state 업데이트가 이전 값에 의존한다면 updater function을 쓰는 편이 안전합니다.

```tsx
setCount((prev) => prev + 1);
setIsOpen((prev) => !prev);
```

이 코드는 "현재 기억된 값을 기준으로 다음 값을 만든다"는 뜻입니다.

특히 같은 이벤트 안에서 state를 여러 번 바꾸거나, 토글처럼 이전 값의 반대가 필요할 때 이 형태가 명확합니다.

## 작은 판단 순서

어떤 값을 state로 둘지 헷갈리면 아래 순서로 생각합니다.

1. 부모에게서 props로 받을 수 있는가?
2. 이미 있는 props나 state에서 계산할 수 있는가?
3. 렌더링 사이에 사용자의 행동 결과를 기억해야 하는가?
4. 이 값이 바뀌면 화면이 달라져야 하는가?

앞의 두 질문에 "예"라면 state가 아닐 가능성이 큽니다. 뒤의 두 질문에 "예"라면 state일 가능성이 큽니다.

## 예제로 이해하기

검색 가능한 목록을 만든다고 생각해봅니다.

```tsx
function LessonSearch({ lessons }: { lessons: Lesson[] }) {
  const [keyword, setKeyword] = useState("");

  const filteredLessons = lessons.filter((lesson) =>
    lesson.title.includes(keyword),
  );

  return (
    <>
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="문서 검색"
      />

      <ul>
        {filteredLessons.map((lesson) => (
          <li key={lesson.id}>{lesson.title}</li>
        ))}
      </ul>
    </>
  );
}
```

여기서 `keyword`는 state입니다. 사용자가 입력한 값을 기억해야 합니다.

반대로 `filteredLessons`는 state가 아닙니다. `lessons`와 `keyword`에서 매번 계산하면 됩니다.

## 읽으면서 생각할 질문

- 이 값은 사용자의 행동 이후에도 기억되어야 하는가?
- props나 다른 state에서 바로 계산할 수 있는 값은 아닌가?
- state를 여러 개로 나눠서 서로 맞춰야 하는 상황을 만들고 있지는 않은가?
- 초기값은 첫 화면의 상태를 자연스럽게 표현하는가?
- 이전 state에 의존하는 업데이트인데 직접 값을 넣고 있지는 않은가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:state`
- 실제 코드: `src/examples/PropsStateExample.tsx`
