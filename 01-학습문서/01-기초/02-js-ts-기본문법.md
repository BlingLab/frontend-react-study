# JS/TS 기본 문법

React가 어렵게 느껴지는 이유 중 상당수는 React 자체보다 JavaScript 문법 때문입니다. 아래 문법들은 React 코드를 읽다 보면 계속 나오므로, 각 패턴이 어떤 상황에 쓰이는지 감을 잡아두면 좋습니다.

## 이 문서를 읽는 이유

React 예제를 열었는데 아래처럼 보이면 처음에는 낯설 수 있습니다.

```tsx
function SkillList({ skills }: { skills: string[] }) {
  return (
    <ul>
      {skills.map((skill) => (
        <li key={skill}>{skill}</li>
      ))}
    </ul>
  );
}
```

이 코드는 React만 알아서는 읽기 어렵습니다. destructuring, TypeScript 타입, `map`, arrow function, JSX expression이 한꺼번에 들어 있기 때문입니다.

그래서 이 문서는 문법을 외우기 위한 문서가 아니라, React 코드를 읽다가 멈추지 않기 위한 준비 문서입니다.

## const와 let

`const`는 재할당하지 않는 값에 씁니다. 컴포넌트 안의 대부분의 변수는 `const`입니다.

```ts
const name = "Mina";
const skills = ["JSX", "Props"];
```

`let`은 나중에 다른 값으로 바꿔야 할 때 씁니다. React에서는 `let`보다 `useState`로 관리하는 경우가 훨씬 많습니다.

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
```

## Array map과 filter

배열을 다른 형태로 바꾸거나, 조건에 맞는 항목만 남깁니다. React에서 배열 데이터를 화면 목록으로 바꿀 때 `map`을 씁니다.

```ts
const skills = ["jsx", "props", "state"];

// 각 항목을 변환
const upper = skills.map((s) => s.toUpperCase());
// ["JSX", "PROPS", "STATE"]

// 조건에 맞는 항목만 남기기
const short = skills.filter((s) => s.length <= 3);
// ["jsx"]

// 두 가지를 함께 — filter로 걸러낸 뒤 map으로 변환
const result = skills
  .filter((s) => s.length > 3)
  .map((s) => s.toUpperCase());
// ["PROPS", "STATE"]
```

`map`과 `filter`는 원본 배열을 건드리지 않고 새 배열을 반환합니다. React state를 다룰 때 이 점이 중요합니다.

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

## Template Literal

백틱(`` ` ``)을 사용해 문자열 안에 값을 넣습니다.

```ts
const name = "Mina";
const count = 3;

const message = `안녕하세요, ${name}님. 총 ${count}개의 항목이 있습니다.`;
```

## Optional Chaining과 Nullish Coalescing

값이 `null` 또는 `undefined`일 수 있는 상황에 씁니다. React에서 서버 데이터나 선택적 props를 다룰 때 자주 나옵니다.

```ts
const user = null;

// Optional chaining (?.) — user가 null이면 undefined 반환 (오류 없음)
const name = user?.name;   // undefined

// Nullish coalescing (??) — null/undefined일 때 기본값 제공
const label = user?.name ?? "익명";  // "익명"
```

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

타입을 읽는 습관이 생기면 컴포넌트 구현을 보기 전에 사용법을 먼저 추측할 수 있습니다.

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

  return (
    <ul>
      {beginnerCourses.map(({ id, title, completed = false }) => (
        <li key={id}>
          {title} {completed ? "완료" : "진행 전"}
        </li>
      ))}
    </ul>
  );
}
```

이 코드를 읽을 때는 한 번에 다 이해하려고 하지 말고 순서대로 봅니다.

1. `Course` 타입이 데이터 모양을 설명합니다.
2. `courses` 배열이 실제 데이터입니다.
3. `filter`로 기초 과정만 남깁니다.
4. `map`으로 각 과정을 `<li>`로 바꿉니다.
5. destructuring으로 `id`, `title`, `completed`를 꺼냅니다.
6. `completed = false`로 기본값을 줍니다.

## 읽으면서 생각할 질문

- 지금 막힌 지점은 React 문제인가, JavaScript 문법 문제인가?
- 이 값은 배열인가, 객체인가, 문자열인가?
- 원본을 직접 수정하고 있지는 않은가?
- props 타입 정의만 보고 이 컴포넌트를 어떻게 쓰는지 알 수 있는가?
