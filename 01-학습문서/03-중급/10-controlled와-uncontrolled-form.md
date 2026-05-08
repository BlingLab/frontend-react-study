# Controlled와 uncontrolled form

React form을 다룰 때는 controlled와 uncontrolled 방식을 구분해야 합니다.

- controlled: 입력값을 React state가 관리합니다.
- uncontrolled: 입력값을 DOM이 관리하고, 필요할 때 ref나 form submit으로 읽습니다.

둘 중 하나만 정답은 아닙니다. 입력값이 UI 상태와 강하게 연결되면 controlled가 좋고, 단순 제출 중심의 form이면 uncontrolled가 더 단순할 수 있습니다.

## Controlled input

controlled input은 `value`와 `onChange`를 함께 둡니다.

```tsx
function NicknameField() {
  const [nickname, setNickname] = useState("");
  const isValid = nickname.trim().length >= 2;

  return (
    <>
      <input
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
      />
      <button disabled={!isValid}>저장</button>
    </>
  );
}
```

입력값이 바뀔 때마다 React state가 바뀌고, 그 state로 검증, disabled, 미리보기, 글자 수 표시 같은 UI를 바로 계산할 수 있습니다.

## Controlled가 어울리는 경우

- 입력 중 실시간 검증이 필요하다.
- 입력값으로 다른 UI를 즉시 바꿔야 한다.
- 저장 버튼 disabled 여부를 계산해야 한다.
- 검색어, 필터처럼 URL이나 API 요청과 연결된다.
- 입력값을 reset하거나 외부 state와 함께 관리해야 한다.

```tsx
const canSubmit = email.includes("@") && password.length >= 8;
```

이런 계산이 필요하면 controlled가 자연스럽습니다.

## Uncontrolled input

uncontrolled input은 DOM이 현재 값을 들고 있습니다. React는 submit 시점에 값을 읽습니다.

```tsx
function LoginForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    login({ email, password });
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" />
      <input name="password" type="password" />
      <button type="submit">로그인</button>
    </form>
  );
}
```

입력 중 값을 React state로 매번 복사하지 않아도 되므로 단순합니다. form field가 많고 제출 시점에만 값이 필요하다면 좋은 선택입니다.

## defaultValue와 value의 차이

uncontrolled input의 초기값은 `defaultValue`로 넣습니다.

```tsx
<input name="nickname" defaultValue={user.nickname} />
```

controlled input은 `value`를 씁니다.

```tsx
<input value={nickname} onChange={(event) => setNickname(event.target.value)} />
```

`value`를 넣고 `onChange`를 빠뜨리면 읽기 전용처럼 동작합니다. 반대로 `defaultValue`는 초기값만 정하고 이후 입력값은 DOM이 관리합니다.

## ref로 값 읽기

특정 input 하나만 필요한 경우 ref로 읽을 수 있습니다.

```tsx
function SearchForm() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleSearch() {
    const keyword = inputRef.current?.value.trim() ?? "";
    search(keyword);
  }

  return (
    <>
      <input ref={inputRef} />
      <button onClick={handleSearch}>검색</button>
    </>
  );
}
```

다만 입력값이 화면의 다른 상태를 바꿔야 한다면 ref보다 state가 낫습니다.

## 섞어 쓰지 않기

한 input에 controlled와 uncontrolled 방식을 섞으면 혼란이 생깁니다.

```tsx
// 좋지 않음
<input value={name} defaultValue="홍길동" onChange={handleChange} />
```

한 field는 한 방식으로 결정합니다.

## form reset

uncontrolled form은 브라우저의 reset 기능과 잘 맞습니다.

```tsx
function SearchForm() {
  return (
    <form>
      <input name="keyword" defaultValue="react" />
      <button type="reset">초기화</button>
    </form>
  );
}
```

controlled form은 state를 직접 초기화해야 합니다.

```tsx
function reset() {
  setEmail("");
  setPassword("");
}
```

## 판단표

| 상황 | 추천 |
| --- | --- |
| 입력 중 글자 수 표시 | controlled |
| 제출할 때만 값 필요 | uncontrolled |
| submit 버튼 disabled 계산 | controlled |
| 큰 설문 form에서 최종 제출만 처리 | uncontrolled 또는 form library |
| API 검색어와 즉시 연결 | controlled |
| 파일 input | uncontrolled |

## 읽으면서 생각할 질문

- 입력값이 렌더링 결과에 즉시 영향을 주는가?
- 제출 시점에만 값이 필요하지 않은가?
- `value`와 `defaultValue`를 섞고 있지는 않은가?
- reset을 state로 할 것인가, 브라우저 form reset으로 할 것인가?
- field가 많아졌을 때 form library가 필요한 복잡도인가?
