# JSX 문법

JSX는 HTML처럼 보이지만 JavaScript 안에서 UI를 표현하는 문법입니다. 브라우저가 직접 이해하는 것이 아니라, 빌드 과정에서 JavaScript 코드로 변환됩니다.

처음 JSX를 볼 때는 "HTML을 JavaScript 파일에 쓴다" 정도로 이해해도 괜찮습니다. 다만 조금 더 정확히 말하면, JSX는 **UI 구조를 JavaScript 값으로 표현하는 문법**입니다.

## JSX는 JavaScript expression

JSX는 값입니다. 변수에 담거나 함수에서 반환하거나, 다른 JSX 안에 넣을 수 있습니다.

```tsx
// 변수에 담기
const title = <h1>안녕하세요</h1>;

// 함수에서 반환하기 (컴포넌트)
function Greeting() {
  return <h1>안녕하세요</h1>;
}
```

JSX가 값이라는 점은 React를 이해할 때 중요합니다. 조건에 따라 JSX 값을 고를 수도 있고, 배열 안에 JSX 값을 담을 수도 있습니다.

```tsx
const emptyMessage = <p>항목이 없습니다.</p>;
const listTitle = <h2>오늘의 학습</h2>;

function StudyPanel({ isEmpty }: { isEmpty: boolean }) {
  return (
    <section>
      {listTitle}
      {isEmpty ? emptyMessage : <p>학습할 항목이 있습니다.</p>}
    </section>
  );
}
```

이 예제에서 `emptyMessage`와 `listTitle`은 문자열이나 숫자처럼 JavaScript 값입니다. 그래서 JSX 안에서 `{}`로 넣을 수 있습니다.

## 중괄호로 JavaScript 값 넣기

`{}`를 열면 그 안에 JavaScript expression을 쓸 수 있습니다. 변수, 계산, 함수 호출 결과 모두 넣을 수 있습니다.

```tsx
const name = "Mina";
const count = 3;

function Summary() {
  return (
    <div>
      <h2>{name}의 요약</h2>
      <p>총 {count}개 항목</p>
      <p>다음 순서: {count + 1}번째</p>
      <p>소문자: {name.toLowerCase()}</p>
    </div>
  );
}
```

`{}`안에는 expression(값을 만드는 식)만 들어갑니다. `if`, `for`, `while` 같은 statement는 바로 쓸 수 없습니다.

구분이 헷갈리면 이렇게 생각하면 됩니다.

| 코드 | JSX `{}` 안에 가능? | 이유 |
| --- | --- | --- |
| `name` | 가능 | 값을 가리킴 |
| `count + 1` | 가능 | 계산 결과가 값 |
| `name.toUpperCase()` | 가능 | 함수 호출 결과가 값 |
| `isNew ? "NEW" : "OLD"` | 가능 | 삼항 연산자는 값을 만듦 |
| `if (isNew) { ... }` | 불가능 | statement라서 값이 아님 |
| `for (...) { ... }` | 불가능 | statement라서 값이 아님 |

## className과 style

HTML의 `class`는 JSX에서 `className`으로 씁니다. JavaScript에서 `class`는 예약어이기 때문입니다.

```tsx
// class → className
<div className="card">내용</div>
```

인라인 스타일은 문자열이 아니라 JavaScript 객체로 씁니다.

```tsx
// style에 문자열은 오류
<div style="color: red">텍스트</div>

// style에 객체 전달
<div style={{ color: "red", fontSize: "16px" }}>텍스트</div>
```

중괄호가 두 겹인 이유: 바깥 `{}`은 JSX expression, 안쪽 `{}`은 JavaScript 객체입니다. CSS 속성 이름은 camelCase로 씁니다. `font-size` → `fontSize`, `background-color` → `backgroundColor`.

실무 코드에서는 인라인 style보다 `className`을 더 자주 씁니다. 인라인 style은 값이 동적으로 바뀌는 간단한 경우에만 쓰고, 대부분의 시각 스타일은 CSS 파일에 둡니다.

```tsx
function StatusText({ active }: { active: boolean }) {
  return (
    <p className={active ? "status status-active" : "status status-idle"}>
      {active ? "진행 중" : "대기 중"}
    </p>
  );
}
```

`className`도 결국 JavaScript expression입니다. 조건에 따라 문자열을 바꿔 반환하면, 상태에 맞는 class가 적용됩니다.

## 최상위 element는 하나

컴포넌트는 반드시 하나의 최상위 element를 반환해야 합니다.

```tsx
// 오류: 최상위 element가 두 개
function Wrong() {
  return (
    <h1>제목</h1>
    <p>내용</p>
  );
}
```

두 가지 해결 방법이 있습니다.

```tsx
// 방법 1: div로 감싸기
function WithDiv() {
  return (
    <div>
      <h1>제목</h1>
      <p>내용</p>
    </div>
  );
}

// 방법 2: Fragment (<>...</>)
// DOM에 실제 element를 추가하지 않음
function WithFragment() {
  return (
    <>
      <h1>제목</h1>
      <p>내용</p>
    </>
  );
}
```

불필요한 `div`가 HTML 구조를 복잡하게 만든다면 Fragment를 씁니다.

Fragment는 특히 표, 목록, 정의 목록처럼 HTML 구조가 민감한 곳에서 유용합니다.

```tsx
function NameAndRole() {
  return (
    <>
      <dt>이름</dt>
      <dd>Mina</dd>
      <dt>역할</dt>
      <dd>Frontend Learner</dd>
    </>
  );
}
```

여기서 불필요한 `div`를 넣으면 `<dl>` 안의 구조가 어색해질 수 있습니다. Fragment는 실제 DOM element를 만들지 않으므로 이런 상황에 적합합니다.

## 주석 쓰기

JSX 안에서 주석은 `{/* */}` 형태로 씁니다.

```tsx
function Card() {
  return (
    <div className="card">
      {/* 제목 영역 */}
      <h3>카드 제목</h3>
      <p>카드 내용</p>
    </div>
  );
}
```

## 자기 닫는 태그

내용이 없는 element는 반드시 `/>`로 닫아야 합니다.

```tsx
// HTML에서는 <br>이지만 JSX에서는
<br />
<img src="photo.jpg" alt="사진" />
<input type="text" />
```

## JSX 반환 시 소괄호

여러 줄에 걸친 JSX는 소괄호 `()`로 감쌉니다. 없어도 동작하지만, 자동 세미콜론 삽입 문제를 피하기 위해 관례적으로 씁니다.

```tsx
// 한 줄이면 소괄호 생략 가능
function Simple() {
  return <p>짧은 내용</p>;
}

// 여러 줄이면 소괄호로 감쌈
function Complex() {
  return (
    <div>
      <h1>제목</h1>
      <p>내용</p>
    </div>
  );
}
```

## 흔한 실수

| 실수 | 올바른 방법 |
| --- | --- |
| `class="card"` | `className="card"` |
| `style="color: red"` | `style={{ color: "red" }}` |
| `<br>`, `<input>` | `<br />`, `<input />` |
| JSX 안에 `if` 문 사용 | 삼항 연산자 또는 변수로 미리 계산 |
| 최상위 element 두 개 | `<div>` 또는 `<>...</>`로 감싸기 |

조건부 렌더링 패턴(`&&`, 삼항 연산자)은 [조건부 렌더링](./06-조건부-렌더링.md) 문서에서 자세히 다룹니다.

## 읽으면서 생각할 질문

- `{}`안에 들어가는 값은 expression인가, statement인가?
- `className`을 쓰는 이유를 말로 설명할 수 있는가?
- Fragment와 `div`로 감싸는 것의 차이는 무엇인가?
- 인라인 style에 중괄호가 두 겹인 이유를 설명할 수 있는가?
