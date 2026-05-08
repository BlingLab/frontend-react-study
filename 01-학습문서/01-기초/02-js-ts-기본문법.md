# JS/TS 기본 문법

React가 어렵게 느껴지는 이유 중 상당수는 React 자체보다 JavaScript 문법 때문입니다. 아래 문법들은 React 코드를 읽다 보면 계속 나오므로, 각 패턴이 어떤 상황에 쓰이는지 감을 잡아두면 좋습니다.

## const와 let

`const`는 재할당하지 않는 값에 씁니다. 컴포넌트 안의 대부분의 변수는 `const`입니다.

```ts
const name = "Mina";
const skills = ["JSX", "Props"];
```

`let`은 나중에 다른 값으로 바꿔야 할 때 씁니다. React에서는 `let`보다 `useState`로 관리하는 경우가 훨씬 많습니다.

`const`로 선언한 객체나 배열의 **내용**은 바꿀 수 있습니다. 재할당이 안 되는 것이지, 내부 값 변경이 안 되는 것이 아닙니다.

```ts
const user = { name: "Mina" };
user.name = "Jun";    // 가능: 내부 값 변경
user = { name: "Jun" }; // 불가능: 재할당
```

React state 업데이트 시 원본 수정 없이 새 값을 반환해야 하는 이유도 이와 연결됩니다.

## Arrow Function

함수를 값처럼 짧게 표현할 때 씁니다. 이벤트 핸들러, `map` 안의 변환 함수가 모두 이 형태입니다.

```ts
// 일반 함수
function double(n: number) {
  return n * 2;
}

// arrow function — 같은 의미
const double = (n: number) => n * 2;

// 본문이 여러 줄이면 중괄호와 return을 씀
const formatLabel = (name: string, count: number) => {
  const suffix = count > 0 ? `(${count})` : "";
  return `${name}${suffix}`;
};
```

`=>` 뒤에 중괄호 없이 바로 값이 오면 그 값이 반환됩니다. 이것을 **implicit return(암묵적 반환)**이라 합니다.

```ts
// 이 두 코드는 같은 의미
const add = (a: number, b: number) => a + b;
const add = (a: number, b: number) => { return a + b; };

// 객체를 반환할 때는 소괄호로 감싸야 함
// 중괄호가 함수 본문으로 오해될 수 있기 때문
const toUser = (name: string) => ({ name, createdAt: Date.now() });
```

## Destructuring

객체나 배열에서 값을 꺼낼 때 씁니다. React에서 props를 받을 때 거의 항상 이 방식입니다.

```ts
// 객체 destructuring
const user = { name: "Mina", role: "Frontend" };
const { name, role } = user;

// 함수 인자에서 바로 꺼내기
function greet({ name }: { name: string }) {
  return `Hello, ${name}`;
}

// 배열 destructuring — useState 반환값을 받을 때 이 형태
const [count, setCount] = [0, () => {}];

// 이름 바꾸기
const { name: userName } = user;  // userName에 user.name 값이 들어감

// 기본값 설정
const { role = "viewer" } = {};  // role에 "viewer" (객체에 role이 없으면)
```

## Array map, filter, reduce

배열을 다른 형태로 바꾸거나, 조건에 맞는 항목만 남기거나, 하나의 값으로 합칩니다.

```ts
const skills = ["jsx", "props", "state"];

// 각 항목을 변환
const upper = skills.map((s) => s.toUpperCase());
// ["JSX", "PROPS", "STATE"]

// 조건에 맞는 항목만 남기기
const short = skills.filter((s) => s.length <= 3);
// ["jsx"]

// 두 가지를 함께
const result = skills
  .filter((s) => s.length > 3)
  .map((s) => s.toUpperCase());
// ["PROPS", "STATE"]

// reduce — 배열을 하나의 값으로 합치기
const completedCount = todos.reduce(
  (count, todo) => (todo.done ? count + 1 : count),
  0
);
```

`map`과 `filter`는 원본 배열을 건드리지 않고 새 배열을 반환합니다. React state를 다룰 때 이 점이 중요합니다.

원본을 수정하는 `push`, `sort`, `splice`는 React state 업데이트에서 바로 사용하지 않습니다.

```ts
// 하지 말 것: 원본 수정
todos.push({ id: "1", text: "새 항목" });

// 올바름: 새 배열 반환
const newTodos = [...todos, { id: "1", text: "새 항목" }];
```

## Spread Syntax

배열이나 객체를 복사하거나 합칠 때 씁니다. React에서 state를 업데이트할 때 기존 값을 유지하면서 일부만 바꾸는 패턴에 자주 등장합니다.

```ts
// 배열: 복사 + 항목 추가
const list = ["A", "B"];
const added = [...list, "C"];    // ["A", "B", "C"]
const prepended = ["Z", ...list]; // ["Z", "A", "B"]

// 객체: 복사 + 일부 속성 변경
const user = { name: "Mina", role: "Frontend", age: 25 };
const promoted = { ...user, role: "Lead" };
// { name: "Mina", role: "Lead", age: 25 } — 원본 user는 그대로
```

나중에 오는 속성이 이전 속성을 덮어씁니다. 위 예제에서 `role`이 두 번 정의되지만 뒤에 있는 `"Lead"`가 남습니다.

## Template Literal

백틱(`` ` ``)을 사용해 문자열 안에 값을 넣습니다.

```ts
const name = "Mina";
const count = 3;

const message = `안녕하세요, ${name}님. 총 ${count}개의 항목이 있습니다.`;
// "안녕하세요, Mina님. 총 3개의 항목이 있습니다."
```

여러 줄 문자열도 그대로 씁니다.

```ts
const sql = `
  SELECT *
  FROM users
  WHERE name = '${name}'
`;
```

## Optional Chaining과 Nullish Coalescing

값이 `null` 또는 `undefined`일 수 있는 상황에 씁니다. React에서 서버 데이터나 선택적 props를 다룰 때 자주 나옵니다.

```ts
const user = null;

// Optional chaining (?.) — user가 null이면 undefined 반환 (오류 없음)
const name = user?.name;            // undefined
const city = user?.address?.city;   // undefined (연결해서 쓸 수 있음)
const firstSkill = user?.skills?.[0]; // 배열에도 적용

// Nullish coalescing (??) — null/undefined일 때 기본값 제공
const label = user?.name ?? "익명";  // "익명"
const count = null ?? 0;             // 0
```

`??`와 `||`의 차이: `||`는 falsy(`0`, `""`, `false`)에도 기본값을 줍니다. `??`는 정확히 `null`과 `undefined`에만 기본값을 줍니다.

```ts
const count = 0;
count || 10  // 10 (0이 falsy이므로)
count ?? 10  // 0  (0은 null/undefined가 아니므로)
```

React에서 숫자 `0`은 유효한 값이므로 `??`를 쓰는 쪽이 안전한 경우가 많습니다.

## Promise와 async/await

서버에서 데이터를 가져오거나 저장할 때 비동기 코드를 씁니다. React에서 `useEffect` 안에 자주 등장합니다.

```ts
// Promise 기본
fetch("/api/todos")
  .then((response) => response.json())
  .then((data) => console.log(data))
  .catch((error) => console.error(error));

// async/await — 더 읽기 쉬운 비동기 코드
async function fetchTodos() {
  try {
    const response = await fetch("/api/todos");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("불러오기 실패:", error);
    throw error;
  }
}
```

`await`는 Promise가 완료될 때까지 기다립니다. `async` 함수 안에서만 쓸 수 있습니다.

React에서 `useEffect` 안에 async 함수를 직접 쓸 수 없고, 별도 함수로 정의하고 호출하는 방식을 씁니다.

```tsx
useEffect(() => {
  // useEffect 콜백 자체를 async로 만들 수 없음
  async function loadTodos() {
    const data = await fetchTodos();
    setTodos(data);
  }

  loadTodos();
}, []);
```

이 패턴은 초급 단계에서 자세히 다룹니다.

## TypeScript 기초

처음부터 깊게 들어갈 필요는 없습니다. 컴포넌트가 받는 props의 모양을 타입으로 적는 정도면 충분합니다.

```tsx
// type alias — props 모양 정의
type ProfileCardProps = {
  name: string;
  role: string;
  count?: number;   // ?는 있어도 되고 없어도 됨
};

function ProfileCard({ name, role, count = 0 }: ProfileCardProps) {
  return (
    <article>
      <h3>{name}</h3>
      <p>{role} ({count})</p>
    </article>
  );
}
```

타입을 적으면 두 가지 이점이 있습니다.

- 잘못된 props를 전달할 때 편집기가 즉시 알려줍니다.
- 컴포넌트 타입 정의만 봐도 어떻게 사용하는지 알 수 있습니다.

처음에는 `type`을 문서처럼 읽으면 됩니다.

```tsx
type ButtonProps = {
  label: string;
  disabled?: boolean;
  onClick: () => void;
};
```

이 타입은 이렇게 말하고 있습니다.

- 이 버튼은 `label`이라는 문자열이 반드시 필요합니다.
- `disabled`는 있어도 되고 없어도 됩니다.
- `onClick`은 인자 없이 호출되는 함수입니다.

## Union 타입

여러 가지 타입 중 하나일 수 있는 값에 씁니다.

```ts
type Status = "loading" | "error" | "success";
type Id = string | number;

let status: Status = "loading";
status = "error";    // 가능
status = "done";     // 오류: "done"은 Status가 아님
```

컴포넌트의 상태를 표현할 때 union 타입을 쓰면 가능한 상태가 명확해집니다.

```tsx
type FetchStatus = "idle" | "loading" | "error" | "success";

function StatusIndicator({ status }: { status: FetchStatus }) {
  if (status === "loading") return <p>불러오는 중...</p>;
  if (status === "error") return <p>오류가 발생했습니다.</p>;
  if (status === "success") return <p>완료되었습니다.</p>;
  return null;
}
```

## 타입을 읽는 습관

타입을 읽는 습관이 생기면 컴포넌트 구현을 보기 전에 사용법을 먼저 추측할 수 있습니다.

```tsx
type UserListProps = {
  users: { id: string; name: string; isActive: boolean }[];
  onSelect: (id: string) => void;
  selectedId?: string;
};
```

이 타입만 보면 알 수 있는 것:

- 사용자 배열을 받습니다. 각 사용자는 `id`, `name`, `isActive`를 가집니다.
- 선택됐을 때 호출할 함수를 받습니다. id를 인자로 전달합니다.
- 현재 선택된 id를 받을 수 있지만 필수는 아닙니다.

## 하나의 예제로 묶어보기

아래 코드는 이 문서의 문법이 한꺼번에 들어간 작은 React 예제입니다.

```tsx
type Course = {
  id: number;
  title: string;
  level: "기초" | "초급" | "중급";
  completed?: boolean;
};

const courses: Course[] = [
  { id: 1, title: "JSX 문법", level: "기초", completed: true },
  { id: 2, title: "State", level: "초급" },
  { id: 3, title: "Effect", level: "중급" },
];

function CourseList() {
  const beginnerCourses = courses.filter((course) => course.level === "기초");
  const completedCount = courses.filter((c) => c.completed).length;

  return (
    <div>
      <p>총 {completedCount}개 완료</p>
      <ul>
        {beginnerCourses.map(({ id, title, completed = false }) => (
          <li key={id}>
            {title} {completed ? "완료" : "진행 전"}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

이 코드를 읽을 때는 한 번에 다 이해하려고 하지 말고 순서대로 봅니다.

1. `Course` 타입이 데이터 모양을 설명합니다.
2. `courses` 배열이 실제 데이터입니다.
3. `filter`로 기초 과정만 남깁니다.
4. `reduce` 대신 `filter.length`로 완료 개수를 계산합니다.
5. `map`으로 각 과정을 `<li>`로 바꿉니다.
6. destructuring으로 `id`, `title`, `completed`를 꺼냅니다.
7. `completed = false`로 기본값을 줍니다.

## 읽으면서 생각할 질문

- 지금 막힌 지점은 React 문제인가, JavaScript 문법 문제인가?
- 이 값은 배열인가, 객체인가, 문자열인가?
- 원본을 직접 수정하고 있지는 않은가?
- `??`와 `||`의 차이를 설명할 수 있는가?
- async/await에서 에러는 어디서 잡는가?
- props 타입 정의만 보고 이 컴포넌트를 어떻게 쓰는지 알 수 있는가?
