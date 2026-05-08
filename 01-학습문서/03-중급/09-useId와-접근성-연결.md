# useId와 접근성 연결

`useId`는 React 컴포넌트 안에서 접근성 속성에 사용할 안정적인 id를 만들 때 쓰는 Hook입니다.

HTML form을 제대로 만들려면 `label`과 `input`, 설명 문구와 입력창, 에러 메시지와 입력창이 서로 연결되어야 합니다. 이 연결은 보통 `id`, `htmlFor`, `aria-describedby`, `aria-invalid` 같은 속성으로 합니다.

## 왜 id가 필요한가

아래 코드는 화면상으로는 label이 input 옆에 있지만, 브라우저와 스크린 리더 입장에서는 둘 사이의 관계가 명확하지 않습니다.

```tsx
function EmailField() {
  return (
    <div>
      <label>이메일</label>
      <input type="email" />
    </div>
  );
}
```

`label`과 `input`을 연결하면 label을 눌러도 input에 focus가 가고, 보조 기술도 입력창의 이름을 정확히 알 수 있습니다.

```tsx
function EmailField() {
  return (
    <div>
      <label htmlFor="email">이메일</label>
      <input id="email" type="email" />
    </div>
  );
}
```

하지만 같은 컴포넌트를 여러 번 렌더링하면 `email` id가 중복될 수 있습니다. id는 문서 안에서 유일해야 합니다.

## useId로 안전한 id 만들기

```tsx
function EmailField() {
  const emailId = useId();

  return (
    <div>
      <label htmlFor={emailId}>이메일</label>
      <input id={emailId} type="email" />
    </div>
  );
}
```

`useId`는 컴포넌트 인스턴스마다 다른 id를 만들어 줍니다. 같은 `EmailField`를 여러 번 사용해도 id가 충돌하지 않습니다.

```tsx
function SignupForm() {
  return (
    <>
      <EmailField />
      <EmailField /> {/* 두 번 써도 각각 다른 id 사용 */}
    </>
  );
}
```

## 설명 문구와 에러 메시지 연결하기

입력창에 설명이나 에러 메시지가 있다면 `aria-describedby`로 연결합니다.

```tsx
function PasswordField({ errorMessage }: { errorMessage?: string }) {
  const passwordId = useId();
  const hintId = `${passwordId}-hint`;
  const errorId = `${passwordId}-error`;

  return (
    <div>
      <label htmlFor={passwordId}>비밀번호</label>
      <input
        id={passwordId}
        type="password"
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorMessage ? `${hintId} ${errorId}` : hintId}
      />
      <p id={hintId}>8자 이상 입력하세요.</p>
      {errorMessage && (
        <p id={errorId} role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
```

여기서 핵심은 화면에 문구를 보여주는 것에서 끝나지 않고, 입력창과 문구의 관계를 DOM 속성으로 알려주는 것입니다.

## 여러 요소가 같은 prefix를 공유할 때

하나의 field 안에서 label, hint, error가 함께 움직이면 하나의 `useId` 결과를 prefix로 쓰면 됩니다.

```tsx
const baseId = useId();
const inputId = `${baseId}-input`;
const helpId = `${baseId}-help`;
const errorId = `${baseId}-error`;
```

이 방식은 컴포넌트를 복사하거나 여러 번 렌더링해도 안전합니다.

## 완성된 Field 컴포넌트 예시

`label`, `input`, 도움말, 에러를 하나로 묶은 Field 컴포넌트입니다.

```tsx
type FieldProps = {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
  errorMessage?: string;
  required?: boolean;
};

function Field({
  label,
  type = "text",
  value,
  onChange,
  helpText,
  errorMessage,
  required = false,
}: FieldProps) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const helpId = `${baseId}-help`;
  const errorId = `${baseId}-error`;

  const describedBy = [
    helpText && helpId,
    errorMessage && errorId,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="field">
      <label htmlFor={inputId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-required={required}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={describedBy || undefined}
      />
      {helpText && (
        <p id={helpId} className="field-help">
          {helpText}
        </p>
      )}
      {errorMessage && (
        <p id={errorId} className="field-error" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
```

## 주요 ARIA 속성

form 접근성에서 자주 쓰는 ARIA 속성들입니다.

| 속성 | 역할 |
| --- | --- |
| `aria-label` | 화면에 텍스트 없을 때 보조 기술에 이름 제공 |
| `aria-labelledby` | 다른 요소의 id를 참조해 이름 지정 |
| `aria-describedby` | 설명/힌트 요소와 연결 |
| `aria-invalid` | 입력값 오류 상태 표시 |
| `aria-required` | 필수 입력 여부 |
| `aria-live` | 동적으로 변하는 영역 스크린 리더에 알림 |
| `role="alert"` | 스크린 리더가 즉시 읽는 영역 |

## 키보드 접근성

폼과 UI를 만들 때 키보드 접근성도 같이 고려합니다.

```tsx
// 모달에서 Escape로 닫기
function Modal({ onClose, children }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

```tsx
// 목록에서 방향키 탐색
function MenuList({ items }: { items: MenuItem[] }) {
  const [focusedIndex, setFocusedIndex] = useState(-1);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      setFocusedIndex((i) => Math.min(i + 1, items.length - 1));
    }
    if (e.key === "ArrowUp") {
      setFocusedIndex((i) => Math.max(i - 1, 0));
    }
  }

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={index === focusedIndex ? 0 : -1}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

## useId를 key로 쓰면 안 된다

`useId`는 접근성 속성 연결을 위한 id입니다. 목록의 `key`는 데이터의 고유 id를 사용해야 합니다.

```tsx
// 좋지 않음 — Hook은 반복문 안에서 호출 불가
items.map((item) => <li key={useId()}>{item.name}</li>);

// 좋음 — 데이터의 id 사용
items.map((item) => <li key={item.id}>{item.name}</li>);
```

## 언제 useId가 필요 없는가

id를 외부에서 안정적으로 받을 수 있다면 그 값을 써도 됩니다.

```tsx
function Field({ id, label }: { id: string; label: string }) {
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </>
  );
}
```

특히 form schema나 서버 데이터에 이미 field id가 있다면 그 id를 props로 받는 방식이 더 명확할 수 있습니다.

## 읽으면서 생각할 질문

- label과 input이 `htmlFor`와 `id`로 연결되어 있는가?
- 설명 문구나 에러 메시지가 `aria-describedby`로 연결되어 있는가?
- 같은 field 컴포넌트를 여러 번 렌더링해도 id가 중복되지 않는가?
- `useId`를 목록 key 용도로 잘못 쓰고 있지는 않은가?
- 외부에서 의미 있는 id를 받을 수 있는데 내부에서 새로 만들고 있지는 않은가?
- 키보드만으로 form을 완성하고 제출할 수 있는가?
- 에러 메시지에 `role="alert"`이 있어서 스크린 리더가 즉시 읽어주는가?
