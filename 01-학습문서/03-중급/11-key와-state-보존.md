# Key와 state 보존

`key`는 목록 렌더링에서만 쓰는 값처럼 보이지만, React가 컴포넌트를 같은 것으로 볼지 다른 것으로 볼지 판단하는 중요한 단서입니다.

React는 같은 위치에 같은 타입의 컴포넌트가 있으면 state를 보존합니다. `key`가 바뀌면 같은 위치라도 다른 컴포넌트로 보고 state를 새로 만듭니다.

## 목록에서 key가 필요한 이유

```tsx
todos.map((todo) => <TodoItem key={todo.id} todo={todo} />);
```

React는 key를 보고 어떤 item이 추가, 삭제, 이동되었는지 판단합니다. 안정적인 key가 없으면 잘못된 item에 state가 남을 수 있습니다.

## index key가 위험한 경우

배열 index를 key로 쓰면 목록 순서가 바뀔 때 문제가 생길 수 있습니다.

```tsx
todos.map((todo, index) => <TodoItem key={index} todo={todo} />);
```

예를 들어 두 번째 item의 input에 글을 쓰고 있는데 첫 번째 item이 삭제되면, 기존 두 번째 item은 index 1에서 index 0으로 이동합니다. React는 key 기준으로 state를 맞추기 때문에 입력 state가 엉뚱한 item에 붙을 수 있습니다.

index key가 괜찮은 경우도 있습니다.

- 목록이 정적이다.
- 추가/삭제/정렬이 없다.
- item 내부에 state가 없다.

하지만 실제 앱에서는 데이터 id를 key로 쓰는 습관이 안전합니다.

## key는 형제 사이에서만 고유하면 된다

key는 전역으로 유일할 필요는 없습니다. 같은 배열 안의 형제들 사이에서만 고유하면 됩니다.

```tsx
<section>
  {posts.map((post) => <PostCard key={post.id} post={post} />)}
</section>

<aside>
  {posts.map((post) => <PostLink key={post.id} post={post} />)}
</aside>
```

두 목록이 서로 다른 형제 집합이므로 같은 `post.id`를 써도 됩니다.

## state를 의도적으로 초기화하기

key는 state 초기화에도 사용할 수 있습니다.

```tsx
function ProfilePage({ userId }: { userId: string }) {
  return <ProfileForm key={userId} userId={userId} />;
}
```

`userId`가 바뀌면 `ProfileForm`은 새 컴포넌트로 취급됩니다. 이전 사용자의 form draft가 다음 사용자 화면에 남지 않습니다.

## 같은 위치의 같은 컴포넌트는 state가 보존된다

아래 코드는 `isCompany`가 바뀌어도 같은 위치에 `TaxForm`이 렌더링되므로 내부 state가 보존됩니다.

```tsx
function TaxPage({ isCompany }: { isCompany: boolean }) {
  return (
    <TaxForm type={isCompany ? "company" : "personal"} />
  );
}
```

type이 바뀔 때 내부 state를 초기화해야 한다면 key를 추가합니다.

```tsx
function TaxPage({ isCompany }: { isCompany: boolean }) {
  const type = isCompany ? "company" : "personal";

  return <TaxForm key={type} type={type} />;
}
```

## key로 해결하지 말아야 할 문제

key를 바꿔서 컴포넌트를 강제로 새로 만드는 방식은 간단하지만 비용이 있습니다. 내부 state가 모두 사라지고, Effect cleanup/setup도 다시 일어납니다.

아래 경우에는 key보다 state 구조를 먼저 봅니다.

- 일부 field만 초기화하면 되는 경우
- 서버 데이터를 다시 요청할 필요가 없는 경우
- 애니메이션이나 focus가 끊기면 안 되는 경우
- key가 매 렌더링마다 바뀌는 경우

```tsx
// 좋지 않음: 매번 새 key라 state가 계속 사라짐
<Editor key={Math.random()} />
```

## 읽으면서 생각할 질문

- 목록 key가 데이터의 안정적인 id인가?
- index key를 써도 목록 순서가 절대 바뀌지 않는가?
- 다른 데이터로 전환될 때 내부 state를 보존해야 하는가, 초기화해야 하는가?
- `key={Math.random()}`처럼 매번 바뀌는 key를 쓰고 있지는 않은가?
- key로 강제 초기화하기 전에 state 위치를 조정할 수 있는가?
