# Event와 Form

사용자가 화면에서 버튼을 누르고, 글자를 입력하고, form을 제출하면 React는 event handler를 호출합니다.

event handler는 단순히 "클릭되었을 때 실행되는 함수"가 아닙니다. 사용자의 의도를 코드로 받아들이는 입구입니다.

버튼 클릭은 "증가하고 싶다", "삭제하고 싶다", "저장하고 싶다" 같은 의도입니다. input 변경은 "현재 입력값을 바꾸고 싶다"는 의도입니다. form 제출은 "지금 입력한 내용을 확정하고 싶다"는 의도입니다.

## handler는 실행 결과가 아니라 함수 자체를 넘긴다

가장 흔한 실수는 아래 코드입니다.

```tsx
<button onClick={handleClick()}>저장</button>
```

이 코드는 클릭할 때 실행되는 것이 아니라 렌더링 중 바로 실행됩니다.

React에는 함수 자체를 넘겨야 합니다.

```tsx
<button onClick={handleClick}>저장</button>
```

인자가 필요하면 새로운 함수를 만들어 넘깁니다.

```tsx
<button onClick={() => handleDelete(todo.id)}>삭제</button>
```

이 코드는 "클릭이 발생하면 그때 `handleDelete(todo.id)`를 실행한다"는 뜻입니다.

## event 이름은 의도를 드러내게 짓는다

초급 단계에서는 함수 이름을 잘 짓는 것만으로도 코드 읽기가 쉬워집니다.

```tsx
function handleIncrement() {
  setCount((count) => count + 1);
}

function handleReset() {
  setCount(0);
}
```

`handleClick`처럼 너무 넓은 이름보다 `handleIncrement`, `handleReset`, `handleSubmit`, `handleTitleChange`처럼 의도가 보이는 이름이 좋습니다.

나중에 컴포넌트가 커져도 "이 이벤트가 사용자의 어떤 행동을 처리하는지" 빠르게 읽을 수 있습니다.

## controlled input으로 form 시작하기

React에서 form을 처음 배울 때는 controlled input으로 시작하는 편이 이해하기 쉽습니다.

controlled input은 input의 현재 값을 React state가 들고 있는 방식입니다.

```tsx
function TodoForm() {
  const [title, setTitle] = useState("");

  return (
    <input
      value={title}
      onChange={(event) => setTitle(event.target.value)}
      placeholder="할 일을 입력하세요"
    />
  );
}
```

이제 input에 보이는 값과 `title` state는 같은 값을 바라봅니다.

사용자가 타이핑하면 `onChange`가 실행되고, `setTitle`이 state를 바꾸고, React가 다시 렌더링하면서 input의 `value`가 최신 state로 맞춰집니다.

처음에는 돌아가는 길처럼 보이지만, 이 구조 덕분에 검증, 초기화, 제출 처리가 명확해집니다.

## form submit은 새로고침을 막고 의도를 처리한다

HTML form은 기본적으로 submit되면 페이지를 새로고침합니다. React 앱에서는 보통 이 기본 동작을 막고 직접 처리합니다.

```tsx
import { useState, FormEvent } from "react";

function TodoForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return;
    }

    onAdd(trimmedTitle);
    setTitle("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="할 일을 입력하세요"
      />
      <button type="submit">추가</button>
    </form>
  );
}
```

이 코드는 흐름이 분명합니다.

1. 사용자가 form을 제출합니다.
2. 브라우저 기본 새로고침을 막습니다.
3. 입력값을 정리합니다.
4. 빈 값이면 아무것도 하지 않습니다.
5. 부모에게 새 할 일을 추가해달라고 알립니다.
6. 입력값을 비웁니다.

초급에서는 이 흐름을 손에 익히는 것이 중요합니다.

## 여러 input은 name보다 목적을 먼저 본다

로그인 form처럼 input이 여러 개라면 각각 state를 둘 수 있습니다.

```tsx
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
```

작은 form에서는 이 방식이 가장 읽기 쉽습니다.

필드가 많아지면 객체 state나 form 라이브러리를 생각할 수 있지만, 초급 단계에서는 먼저 "각 input의 value가 어떤 state와 연결되는지"를 눈으로 확인하는 편이 좋습니다.

## 예제로 이해하기

검색 input은 submit 없이 `onChange`만으로도 충분할 때가 많습니다.

```tsx
import { useState, ChangeEvent } from "react";

function SearchBox({ onSearch }: { onSearch: (keyword: string) => void }) {
  const [keyword, setKeyword] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextKeyword = event.target.value;
    setKeyword(nextKeyword);
    onSearch(nextKeyword);
  }

  return <input value={keyword} onChange={handleChange} />;
}
```

반면 Todo 추가는 "입력 중"과 "제출"이 다릅니다. 그래서 `onChange`로 입력값을 기억하고, `onSubmit`에서 추가를 확정합니다.

이 차이를 구분하면 form 코드가 덜 헷갈립니다.

## 읽으면서 생각할 질문

- 이 이벤트는 사용자의 어떤 의도를 표현하는가?
- handler를 렌더링 중 실행하지 않고 함수로 넘기고 있는가?
- input의 `value`와 state가 같은 값을 바라보고 있는가?
- form submit에서 브라우저 기본 새로고침을 막아야 하는가?
- 검증, 추가, 초기화 순서가 자연스럽게 읽히는가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
