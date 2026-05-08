# Controlled와 uncontrolled form

React form을 다룰 때는 controlled와 uncontrolled 방식을 구분해야 합니다.

- **controlled**: 입력값을 React state가 관리합니다.
- **uncontrolled**: 입력값을 DOM이 관리하고, 필요할 때 ref나 form submit으로 읽습니다.

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
      {nickname.length > 0 && !isValid && (
        <p>2자 이상 입력해주세요.</p>
      )}
      <p>{nickname.length} / 20</p>
      <button disabled={!isValid}>저장</button>
    </>
  );
}
```

입력값이 바뀔 때마다 React state가 바뀌고, 그 state로 검증, disabled, 글자 수 표시 같은 UI를 바로 계산할 수 있습니다.

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

`value`를 넣고 `onChange`를 빠뜨리면 읽기 전용처럼 동작합니다. React에서 경고를 줍니다.

```tsx
// 경고 발생 — value가 있는데 onChange가 없음
<input value={name} />

// 의도적으로 읽기 전용으로 만들 때는 readOnly를 명시
<input value={name} readOnly />
```

반대로 `defaultValue`는 초기값만 정하고 이후 입력값은 DOM이 관리합니다.

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
      <input name="keyword" defaultValue="" />
      <button type="reset">초기화</button>
    </form>
  );
}
```

controlled form은 state를 직접 초기화해야 합니다.

```tsx
function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function reset() {
    setEmail("");
    setPassword("");
  }
}
```

## 복잡한 form — 중첩 객체 다루기

form 입력값이 중첩 객체일 때는 spread로 부분 업데이트합니다.

```tsx
type FormData = {
  name: string;
  address: {
    city: string;
    zip: string;
  };
};

function ProfileForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: { city: "", zip: "" },
  });

  function handleNameChange(value: string) {
    setFormData((prev) => ({ ...prev, name: value }));
  }

  function handleCityChange(value: string) {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, city: value },
    }));
  }

  return (
    <form>
      <input
        value={formData.name}
        onChange={(e) => handleNameChange(e.target.value)}
        placeholder="이름"
      />
      <input
        value={formData.address.city}
        onChange={(e) => handleCityChange(e.target.value)}
        placeholder="도시"
      />
    </form>
  );
}
```

## form 라이브러리를 고려할 시점

직접 controlled form으로 충분한 경우가 많지만, 아래 상황이 겹치면 React Hook Form 같은 라이브러리를 고려합니다.

- field가 10개 이상이고 각각 다른 검증 규칙이 있다.
- 배열 형태의 동적 field가 필요하다 (동적으로 추가/삭제되는 행).
- submit 중 각 field의 touched/dirty 상태를 관리해야 한다.
- form 성능이 중요하고 매 키입력마다 전체 form이 렌더링되면 안 된다.
- 복잡한 cross-field validation이 필요하다.

React Hook Form은 uncontrolled 방식으로 동작하므로 성능이 우수하고, 검증, 에러, 제출 상태를 통합적으로 관리합니다.

```tsx
// React Hook Form 예시
import { useForm } from "react-hook-form";

function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; password: string }>();

  function onSubmit(data: { email: string; password: string }) {
    signup(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("email", {
          required: "이메일을 입력해주세요.",
          pattern: { value: /@/, message: "올바른 이메일 형식이 아닙니다." },
        })}
      />
      {errors.email && <p>{errors.email.message}</p>}
      <button type="submit">가입</button>
    </form>
  );
}
```

## 판단표

| 상황 | 추천 |
| --- | --- |
| 입력 중 글자 수 표시 | controlled |
| 제출할 때만 값 필요 | uncontrolled |
| submit 버튼 disabled 계산 | controlled |
| 큰 설문 form에서 최종 제출만 처리 | uncontrolled 또는 form 라이브러리 |
| API 검색어와 즉시 연결 | controlled |
| 파일 input | uncontrolled |
| 동적 field 배열 | form 라이브러리 검토 |
| 복잡한 cross-field validation | form 라이브러리 검토 |

## 읽으면서 생각할 질문

- 입력값이 렌더링 결과에 즉시 영향을 주는가?
- 제출 시점에만 값이 필요하지 않은가?
- `value`와 `defaultValue`를 섞고 있지는 않은가?
- reset을 state로 할 것인가, 브라우저 form reset으로 할 것인가?
- field가 많아졌을 때 form 라이브러리가 필요한 복잡도인가?
- controlled로 관리할 때 매 키입력마다 렌더링이 문제되지는 않는가?
