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

```tsx
function handleIncrement() {
  setCount((prev) => prev + 1);
}

function handleReset() {
  setCount(0);
}
```

`handleClick`처럼 너무 넓은 이름보다 `handleIncrement`, `handleReset`, `handleSubmit`, `handleTitleChange`처럼 의도가 보이는 이름이 좋습니다.

나중에 컴포넌트가 커져도 "이 이벤트가 사용자의 어떤 행동을 처리하는지" 빠르게 읽을 수 있습니다.

## TypeScript event 타입

이벤트 핸들러에서 자주 쓰는 TypeScript 타입을 알아두면 편집기 자동완성이 도움이 됩니다.

```tsx
import {
  MouseEvent,
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  FocusEvent,
} from "react";

// 버튼 클릭
function handleClick(event: MouseEvent<HTMLButtonElement>) { ... }

// input 값 변경
function handleChange(event: ChangeEvent<HTMLInputElement>) {
  event.target.value; // 현재 입력값
}

// form 제출
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault(); // 새로고침 방지
}

// 키보드 입력
function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
  if (event.key === "Enter") { ... }
  if (event.key === "Escape") { ... }
}

// focus/blur
function handleFocus(event: FocusEvent<HTMLInputElement>) { ... }
```

보통은 인라인에서 타입 추론이 잘 되어서 직접 쓸 일이 많지 않습니다. 하지만 함수를 따로 정의하면 타입을 명시해야 합니다.

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
3. 입력값을 정리합니다(앞뒤 공백 제거).
4. 빈 값이면 아무것도 하지 않습니다.
5. 부모에게 새 할 일을 추가해달라고 알립니다.
6. 입력값을 비웁니다.

## 인라인 유효성 검사

입력 도중 실시간으로 오류 메시지를 보여줄 때는 state로 오류를 관리합니다.

```tsx
function TodoForm({ onAdd }: { onAdd: (title: string) => void }) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setTitle(value);

    if (value.trim().length === 0) {
      setError("제목을 입력해주세요.");
    } else if (value.length > 50) {
      setError("50자 이하로 입력해주세요.");
    } else {
      setError("");
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (title.trim().length === 0) {
      setError("제목을 입력해주세요.");
      return;
    }

    onAdd(title.trim());
    setTitle("");
    setError("");
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={handleChange}
        aria-describedby={error ? "title-error" : undefined}
      />
      {error && (
        <p id="title-error" role="alert" className="error">
          {error}
        </p>
      )}
      <button type="submit" disabled={!!error}>
        추가
      </button>
    </form>
  );
}
```

`role="alert"`을 붙이면 화면 리더가 오류 메시지를 읽어줍니다. `aria-describedby`로 input과 오류 메시지를 연결합니다.

## 여러 input이 있는 form

로그인 form처럼 input이 여러 개라면 각각 state를 둡니다.

```tsx
import { useState, FormEvent } from "react";

type LoginFormData = {
  email: string;
  password: string;
};

function LoginForm({ onLogin }: { onLogin: (data: LoginFormData) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const canSubmit = email.trim().length > 0 && password.length >= 8;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError("이메일과 비밀번호(8자 이상)를 입력해주세요.");
      return;
    }

    onLogin({ email: email.trim(), password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">이메일</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="password">비밀번호</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      {error && <p role="alert">{error}</p>}

      <button type="submit" disabled={!canSubmit}>
        로그인
      </button>
    </form>
  );
}
```

`canSubmit`은 이메일과 비밀번호 조건이 모두 충족될 때 `true`가 됩니다. state에서 계산 가능한 값이므로 별도 state로 두지 않습니다.

## 키보드 이벤트 처리

Enter 키로 제출, Escape 키로 취소 같은 키보드 인터랙션은 접근성에 좋습니다.

```tsx
function InlineEditor({
  value,
  onSave,
  onCancel,
}: {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      onSave(draft);
    }
    if (event.key === "Escape") {
      onCancel();
    }
  }

  return (
    <input
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  );
}
```

`autoFocus`를 붙이면 컴포넌트가 마운트될 때 input이 자동으로 포커스됩니다.

## 제출 중 이중 제출 방지

서버 요청이 진행 중일 때 버튼을 비활성화하면 같은 form이 두 번 제출되는 것을 막을 수 있습니다.

```tsx
function ContactForm() {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await sendMessage({ name });
      // 성공 처리
    } catch (error) {
      // 오류 처리
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={isSubmitting}
      />
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "전송 중..." : "전송"}
      </button>
    </form>
  );
}
```

`isSubmitting` 동안 input과 버튼을 모두 비활성화합니다. 버튼 텍스트도 상태를 알려주도록 바꿉니다.

## 검색 input은 submit 없이 onChange로

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

  return (
    <input
      value={keyword}
      onChange={handleChange}
      placeholder="검색어 입력"
    />
  );
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
- 제출 중 이중 제출을 막는 처리가 되어 있는가?
- label과 input이 연결되어 있는가?
