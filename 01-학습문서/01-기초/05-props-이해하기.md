# Props 이해하기

## Props란

Props는 **부모 컴포넌트가 자식 컴포넌트에게 전달하는 입력값**입니다.

```tsx
// 부모
function App() {
  return <ProfileCard name="Mina" role="Frontend" />;
}

// 자식 — name과 role을 props로 받음
function ProfileCard({ name, role }: { name: string; role: string }) {
  return (
    <article>
      <h3>{name}</h3>
      <p>{role}</p>
    </article>
  );
}
```

Props는 HTML 속성처럼 태그 안에 씁니다. 문자열은 `""`로, JavaScript 값은 `{}`로 전달합니다.

```tsx
<ProfileCard name="Mina" role="Frontend" count={3} isNew={true} />
```

문자열은 따옴표로 전달하고, 숫자나 boolean, 배열, 객체, 함수처럼 JavaScript 값은 중괄호로 전달합니다.

```tsx
<ProfileCard
  name="Mina"
  role="Frontend"
  count={3}
  isNew={true}
  skills={["JSX", "Props"]}
/>
```

읽을 때는 "이 컴포넌트는 어떤 데이터를 입력으로 받는가?"를 먼저 봅니다.

## Props는 읽기 전용

자식 컴포넌트는 props를 직접 바꿀 수 없습니다. 데이터는 항상 부모 → 자식 방향으로 흐릅니다.

```tsx
// 오류: props를 자식에서 변경하려는 시도
function Counter({ count }: { count: number }) {
  count = count + 1;  // 동작하지 않고, 해서도 안 됨
  return <p>{count}</p>;
}
```

자식이 값을 바꿔야 한다면, 부모에서 변경 함수를 만들어 props로 함께 내려줍니다. (이 패턴은 초급 단계에서 state와 이벤트를 배울 때 자세히 다룹니다.)

예를 들어 부모가 선택된 id를 가지고 있고, 자식은 클릭이 일어났다는 사실만 알려줄 수 있습니다.

```tsx
type UserItemProps = {
  id: number;
  name: string;
  onSelect: (id: number) => void;
};

function UserItem({ id, name, onSelect }: UserItemProps) {
  return (
    <button type="button" onClick={() => onSelect(id)}>
      {name}
    </button>
  );
}
```

자식은 `selectedId`를 직접 바꾸지 않습니다. 대신 `onSelect(id)`를 호출해서 부모에게 "이 사용자가 선택됐다"고 알립니다.

## TypeScript로 Props 타입 정의하기

`type`으로 props의 모양을 미리 정의하면 잘못 전달할 때 편집기가 즉시 알려줍니다.

```tsx
type ProfileCardProps = {
  name: string;
  role: string;
  followerCount: number;
};

function ProfileCard({ name, role, followerCount }: ProfileCardProps) {
  return (
    <article>
      <h3>{name}</h3>
      <p>{role}</p>
      <p>팔로워 {followerCount}명</p>
    </article>
  );
}

// 필수 props를 빠뜨리면 편집기가 경고
<ProfileCard name="Mina" role="Frontend" />  // followerCount 빠짐 → 오류 표시
```

```tsx
type SkillListProps = {
  skills: string[];
  emptyMessage?: string;
};
```

이 타입을 보면 `SkillList`는 문자열 배열을 받고, 빈 상태 문구는 선택적으로 받을 수 있음을 알 수 있습니다.

## Optional Props

`?`를 붙이면 없어도 되는 props가 됩니다.

```tsx
type BadgeProps = {
  label: string;
  count?: number;   // 없어도 됨
};

function Badge({ label, count }: BadgeProps) {
  return (
    <span>
      {label}
      {count !== undefined && ` (${count})`}
    </span>
  );
}

<Badge label="알림" />          // count 없이 써도 됨
<Badge label="알림" count={3} /> // count 있게 써도 됨
```

## 기본값 설정

optional props에 기본값을 주고 싶다면 destructuring에서 바로 설정합니다.

```tsx
type ButtonProps = {
  label: string;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

function Button({ label, variant = "primary", disabled = false }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled}>
      {label}
    </button>
  );
}

<Button label="저장" />                          // variant="primary", disabled=false
<Button label="취소" variant="secondary" />      // variant="secondary"
<Button label="제출" disabled={true} />          // disabled=true
```

## children Props

컴포넌트 태그 **사이에 넣는 내용**은 `children`으로 받을 수 있습니다. 레이아웃이나 래퍼(감싸는) 컴포넌트에서 자주 씁니다.

```tsx
type CardProps = {
  children: React.ReactNode;
};

function Card({ children }: CardProps) {
  return <div className="card">{children}</div>;
}

// 태그 사이에 어떤 내용이든 넣을 수 있음
<Card>
  <h3>카드 제목</h3>
  <p>카드 설명</p>
</Card>

// 다른 컴포넌트를 children으로 넣어도 됨
<Card>
  <ProfileCard name="Mina" role="Frontend" />
</Card>
```

`React.ReactNode`는 JSX, 문자열, 숫자, 배열 등 React가 렌더링할 수 있는 모든 값을 받습니다.

`children`은 "내용을 컴포넌트 밖에서 채우고 싶을 때" 유용합니다.

```tsx
function AlertBox({ children }: { children: React.ReactNode }) {
  return <div className="alert">{children}</div>;
}

<AlertBox>
  <strong>주의</strong>
  <p>저장하지 않은 변경사항이 있습니다.</p>
</AlertBox>
```

반면 단순히 문자열 하나만 받으면 되는 경우에는 일반 props가 더 명확합니다.

```tsx
function AlertTitle({ title }: { title: string }) {
  return <strong>{title}</strong>;
}
```

`children`은 레이아웃이나 박스처럼 "감싸는 역할"이 있을 때 먼저 떠올리면 됩니다.

## Props로 다양한 값 전달하기

Props에는 문자열과 숫자뿐 아니라 배열, 객체, 함수도 전달할 수 있습니다.

```tsx
type UserListProps = {
  users: { id: number; name: string }[];
  onSelect: (id: number) => void;
};

function UserList({ users, onSelect }: UserListProps) {
  return (
    <ul>
      {users.map((user) => (
        <li key={user.id} onClick={() => onSelect(user.id)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

함수를 props로 전달하는 패턴은 초급 단계에서 이벤트와 함께 더 자세히 다룹니다.

객체를 props로 한 번에 넘길 수도 있습니다.

```tsx
type User = {
  id: number;
  name: string;
  role: string;
};

function UserCard({ user }: { user: User }) {
  return (
    <article>
      <h3>{user.name}</h3>
      <p>{user.role}</p>
    </article>
  );
}
```

객체 전체를 넘길지, 필요한 값만 펼쳐서 넘길지는 상황에 따라 다릅니다.

```tsx
<UserCard user={user} />
<ProfileCard name={user.name} role={user.role} />
```

`UserCard`처럼 사용자 객체 자체가 자연스러운 단위라면 객체 전체가 괜찮습니다. 하지만 컴포넌트가 실제로 이름과 역할만 필요하다면 필요한 값만 넘기는 편이 의존성이 작습니다.

## 흔한 실수

**문자열 props에 `{}` 쓰기 — 틀린 건 아니지만 관례에 맞지 않음**

```tsx
<ProfileCard name={"Mina"} />  // 동작하지만 관례상 문자열은 ""로
<ProfileCard name="Mina" />    // 권장
```

**`true`인 boolean props는 값 생략 가능**

```tsx
<Button disabled={true} />  // 길게 써도 되지만
<Button disabled />          // 이렇게 줄여 쓸 수 있음
```

**props 이름에 HTML 속성과 충돌하는 이름 쓰기**

`class`, `for` 등은 JSX에서 사용할 수 없습니다. `className`, `htmlFor`로 씁니다.

## 읽으면서 생각할 질문

- 이 props는 어디에서 내려오는가?
- 자식이 props를 바꾸려고 하고 있지는 않은가?
- 필수 props와 optional props를 구분할 수 있는가?
- children이 적합한 상황과 일반 props가 적합한 상황의 차이는 무엇인가?
