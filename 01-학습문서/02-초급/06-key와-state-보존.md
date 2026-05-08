# Key와 State 보존

기초 단계에서는 목록을 렌더링할 때 `key`가 필요하다고 배웠습니다.

초급에서는 한 걸음 더 들어갑니다. `key`는 단순히 경고를 없애기 위한 속성이 아닙니다. React가 어떤 컴포넌트를 같은 컴포넌트로 볼지 판단하는 힌트입니다.

이 판단은 state가 유지될지 초기화될지와 연결됩니다.

## React는 위치로 컴포넌트를 기억한다

React는 렌더링 결과를 비교하면서 "이 자리에 있던 컴포넌트가 다음 렌더링에도 같은 컴포넌트인가?"를 판단합니다.

같은 위치에 같은 컴포넌트가 있으면 state를 유지합니다.

```tsx
{isOpen && <Counter />}
```

`isOpen`이 `true`인 동안 `Counter`는 같은 위치에 있으므로 state가 유지됩니다.

하지만 `isOpen`이 `false`가 되어 `Counter`가 사라지면, 그 안의 state도 사라집니다. 다시 나타날 때는 새로 시작합니다.

## 목록에서는 key가 정체성이다

목록에서는 위치만으로는 부족합니다.

```tsx
{todos.map((todo) => (
  <TodoItem key={todo.id} todo={todo} />
))}
```

React는 `key`를 보고 각 항목을 구분합니다.

`todo.id`처럼 안정적인 key를 쓰면 항목 순서가 바뀌어도 React는 같은 todo를 같은 컴포넌트로 이해할 수 있습니다.

반대로 index를 key로 쓰면 순서가 바뀔 때 문제가 생길 수 있습니다.

```tsx
{todos.map((todo, index) => (
  <TodoItem key={index} todo={todo} />
))}
```

항목이 추가되거나 삭제되어 index가 바뀌면 React는 다른 항목을 같은 컴포넌트로 착각할 수 있습니다. 그 결과 input 값이나 내부 state가 엉뚱한 항목에 남아 있는 것처럼 보일 수 있습니다.

## key는 안정적이고 고유해야 한다

좋은 key는 두 조건을 만족합니다.

- 같은 항목이면 렌더링이 바뀌어도 같은 key를 유지합니다.
- 같은 목록 안에서 다른 항목과 겹치지 않습니다.

그래서 보통 서버에서 받은 id나 직접 만든 id를 사용합니다.

```tsx
const newTodo = {
  id: crypto.randomUUID(),
  title,
  done: false,
};
```

중요한 점은 렌더링 중 매번 새 id를 만들면 안 된다는 것입니다.

```tsx
// 피합니다.
<TodoItem key={crypto.randomUUID()} todo={todo} />
```

이렇게 쓰면 매 렌더링마다 key가 바뀌어서 React는 매번 완전히 새로운 컴포넌트라고 판단합니다. 그러면 state가 계속 초기화될 수 있습니다.

## key로 state를 일부러 초기화할 수도 있다

key는 state를 보존하는 데 쓰이지만, 반대로 초기화하고 싶을 때도 사용할 수 있습니다.

사용자 프로필을 바꿀 때 입력 form을 새로 시작하고 싶다고 생각해봅니다.

```tsx
<ProfileForm key={userId} userId={userId} />
```

`userId`가 바뀌면 key도 바뀝니다. React는 이전 `ProfileForm`과 새 `ProfileForm`을 다른 컴포넌트로 보고 state를 초기화합니다.

초급에서는 이 패턴을 자주 쓰지는 않지만, "key가 정체성에 영향을 준다"는 사실을 이해하는 데 도움이 됩니다.

## 조건부 렌더링에서도 state 보존을 생각한다

아래 코드는 로그인 여부에 따라 다른 컴포넌트를 보여줍니다.

```tsx
{isLoggedIn ? <UserMenu /> : <LoginForm />}
```

`UserMenu`와 `LoginForm`은 서로 다른 컴포넌트입니다. 전환될 때 각각의 내부 state는 자연스럽게 분리됩니다.

반대로 같은 컴포넌트에 props만 바뀌는 경우에는 state가 유지됩니다.

```tsx
<Editor mode={mode} />
```

`mode`가 바뀌어도 `Editor`는 같은 위치의 같은 컴포넌트입니다. 내부 state가 유지됩니다. 이게 원하는 동작인지, 초기화가 필요한지 생각해야 합니다.

## 읽으면서 생각할 질문

- 목록의 key가 항목의 안정적인 id를 사용하고 있는가?
- index key를 써도 되는 정적인 목록인지, 순서가 바뀔 수 있는 목록인지 구분했는가?
- 렌더링할 때마다 새 key를 만들고 있지는 않은가?
- 컴포넌트가 사라졌다 다시 나타날 때 state가 초기화된다는 점을 이해하는가?
- state를 일부러 초기화해야 하는 상황에서 key를 사용할 수 있다는 점을 아는가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
