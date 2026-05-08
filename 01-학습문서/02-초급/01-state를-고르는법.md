# State를 고르는 법

초급에서 가장 먼저 잡아야 하는 감각은 "무엇을 기억할 것인가"입니다.

React 컴포넌트는 props와 state를 기준으로 UI를 다시 계산합니다. props는 부모가 내려주는 값이고, state는 컴포넌트가 렌더링 사이에 기억하는 값입니다.

여기서 중요한 말은 "렌더링 사이에 기억"입니다. 화면에 보인다고 전부 state가 아닙니다. 화면에 보이는 값 중 상당수는 이미 있는 props나 state에서 계산할 수 있습니다.

## useState의 동작 원리

`useState`가 반환하는 두 가지를 먼저 이해합니다.

```tsx
const [count, setCount] = useState(0);
```

- `count`: 현재 렌더링에서 기억하는 값입니다. 이 값은 렌더링 중에 바뀌지 않습니다.
- `setCount`: 다음 state 값을 예약하는 함수입니다. 호출하면 React가 컴포넌트를 다시 렌더링합니다.

중요한 점은 `setCount`를 호출한다고 해서 지금 코드가 즉시 다시 실행되는 것이 아닙니다. 현재 실행이 끝난 뒤 React가 다음 렌더링을 예약합니다.

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    console.log(count); // 여전히 0 (현재 렌더링의 count)
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

## 왜 일반 변수가 아닌 state를 쓰는가

컴포넌트 함수 안의 일반 변수는 렌더링마다 초기화됩니다.

```tsx
function Counter() {
  let count = 0; // 렌더링마다 다시 0

  function handleClick() {
    count = count + 1; // 바꿔도 다음 렌더링에서 다시 0
  }

  return <button onClick={handleClick}>{count}</button>;
}
```

이 코드는 버튼을 눌러도 화면이 바뀌지 않습니다. `count`가 바뀌어도 React가 다시 렌더링하지 않고, 다시 렌더링하더라도 `count`는 다시 0으로 시작합니다.

`useState`는 이 두 문제를 해결합니다.

- 값을 렌더링 사이에 기억합니다.
- 값이 바뀌면 React에게 알려서 다시 렌더링하게 합니다.

## state가 필요한 순간

예를 들어 카운터를 만든다고 생각해봅니다.

```tsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <section>
      <p>현재 값: {count}</p>
      <button onClick={() => setCount((prev) => prev + 1)}>증가</button>
      <button onClick={() => setCount((prev) => prev - 1)}>감소</button>
      <button onClick={() => setCount(0)}>리셋</button>
    </section>
  );
}
```

`count`는 state가 맞습니다.

사용자가 버튼을 누를 때마다 값이 바뀌고, 다음 렌더링에서도 그 값을 기억해야 합니다. props에서 받을 수도 없고, 다른 값에서 계산할 수도 없습니다.

이번에는 할 일 목록을 봅니다.

```tsx
type Todo = {
  id: string;
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

**초기값을 외부에서 받을 때**

부모에게서 초기값을 받아 state를 시작하는 패턴은 자주 씁니다.

```tsx
function Counter({ initialCount = 0 }: { initialCount?: number }) {
  const [count, setCount] = useState(initialCount);

  return (
    <button onClick={() => setCount((prev) => prev + 1)}>{count}</button>
  );
}
```

여기서 `initialCount`는 최초 한 번만 쓰입니다. 이후 `initialCount` prop이 바뀌어도 `count` state는 바뀌지 않습니다. 이것은 의도적인 동작입니다. `initialCount`는 시작점을 알려주는 것이지, state를 제어하는 것이 아닙니다.

만약 props가 바뀔 때 state도 따라 바뀌어야 한다면, 이는 state 위치나 구조를 다시 생각해야 한다는 신호입니다.

## 이전 state에 의존할 때

state 업데이트가 이전 값에 의존한다면 updater function을 쓰는 편이 안전합니다.

```tsx
setCount((prev) => prev + 1);
setIsOpen((prev) => !prev);
```

이 코드는 "현재 기억된 값을 기준으로 다음 값을 만든다"는 뜻입니다.

특히 같은 이벤트 안에서 state를 여러 번 바꾸거나, 토글처럼 이전 값의 반대가 필요할 때 이 형태가 명확합니다.

```tsx
// 같은 이벤트에서 여러 번 업데이트할 때
function handleTripleIncrement() {
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
  setCount((prev) => prev + 1);
  // count가 3 증가함 (updater function 없으면 1만 증가)
}
```

## React의 state 업데이트 방식

React는 이벤트 핸들러 안의 여러 setState 호출을 한 번에 모아서 처리합니다. 이것을 **배칭(batching)**이라고 합니다.

```tsx
function handleClick() {
  setFirst("a");
  setSecond("b");
  setThird("c");
  // 세 번 setXxx를 호출했지만 렌더링은 한 번만 일어남
}
```

이 덕분에 불필요한 중간 렌더링이 줄어듭니다. 개발자 입장에서는 대부분 이 동작을 신경 쓰지 않아도 됩니다. 다만 "setXxx를 여러 번 호출해도 렌더링은 한 번"이라는 사실을 알아두면 예상치 못한 동작을 만났을 때 도움이 됩니다.

## state 판단 기준 정리

어떤 값을 state로 둘지 헷갈리면 아래 순서로 생각합니다.

1. 부모에게서 props로 받을 수 있는가?
2. 이미 있는 props나 state에서 계산할 수 있는가?
3. 렌더링 사이에 사용자의 행동 결과를 기억해야 하는가?
4. 이 값이 바뀌면 화면이 달라져야 하는가?

앞의 두 질문에 "예"라면 state가 아닐 가능성이 큽니다. 뒤의 두 질문에 "예"라면 state일 가능성이 큽니다.

자주 나오는 state 후보를 표로 정리하면 이렇습니다.

| 값 | state? | 이유 |
| --- | --- | --- |
| 입력 중인 검색어 | ✅ | 사용자가 타이핑하며 기억 필요 |
| 모달 열림 여부 | ✅ | 사용자 클릭으로 바뀌고 기억 필요 |
| 선택된 탭 | ✅ | 사용자 행동으로 바뀌고 기억 필요 |
| 목록 배열 | ✅ | 추가/삭제/수정으로 바뀌고 기억 필요 |
| 완료 개수 | ❌ | todos에서 계산 가능 |
| 필터링된 목록 | ❌ | todos + filter에서 계산 가능 |
| 전체 개수 | ❌ | todos.length로 계산 가능 |
| 버튼 텍스트 (조건부) | ❌ | 다른 state에서 계산 가능 |

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

      <p>검색 결과: {filteredLessons.length}개</p>

      {filteredLessons.length === 0 ? (
        <p>결과가 없습니다.</p>
      ) : (
        <ul>
          {filteredLessons.map((lesson) => (
            <li key={lesson.id}>{lesson.title}</li>
          ))}
        </ul>
      )}
    </>
  );
}
```

여기서 `keyword`는 state입니다. 사용자가 입력한 값을 기억해야 합니다.

반대로 `filteredLessons`와 `filteredLessons.length`는 state가 아닙니다. `lessons`와 `keyword`에서 매번 계산하면 됩니다.

## 읽으면서 생각할 질문

- 이 값은 사용자의 행동 이후에도 기억되어야 하는가?
- props나 다른 state에서 바로 계산할 수 있는 값은 아닌가?
- state를 여러 개로 나눠서 서로 맞춰야 하는 상황을 만들고 있지는 않은가?
- 초기값은 첫 화면의 상태를 자연스럽게 표현하는가?
- 이전 state에 의존하는 업데이트인데 직접 값을 넣고 있지는 않은가?
- `let` 변수가 아닌 `useState`를 써야 하는 이유를 설명할 수 있는가?
