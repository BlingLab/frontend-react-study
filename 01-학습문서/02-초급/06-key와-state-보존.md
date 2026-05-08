# Key와 State 보존

기초 단계에서는 목록을 렌더링할 때 `key`가 필요하다고 배웠습니다.

초급에서는 한 걸음 더 들어갑니다. `key`는 단순히 경고를 없애기 위한 속성이 아닙니다. React가 어떤 컴포넌트를 같은 컴포넌트로 볼지 판단하는 힌트입니다.

이 판단은 state가 유지될지 초기화될지와 연결됩니다.

## React는 컴포넌트 트리의 위치로 state를 기억한다

React는 렌더링 결과를 비교하면서 "이 자리에 있던 컴포넌트가 다음 렌더링에도 같은 컴포넌트인가?"를 판단합니다.

판단 기준은 두 가지입니다.

- **같은 위치**에 있는가?
- **같은 타입(컴포넌트 이름)**인가?

두 조건이 모두 충족되면 React는 "이전 렌더링의 컴포넌트와 같다"고 보고 state를 유지합니다.

```tsx
{isOpen && <Counter />}
```

`isOpen`이 `true`인 동안 `Counter`는 같은 위치에 있으므로 state가 유지됩니다.

하지만 `isOpen`이 `false`가 되어 `Counter`가 사라지면, 그 안의 state도 사라집니다. 다시 나타날 때는 새로 시작합니다.

## 같은 위치라도 타입이 다르면 state가 초기화된다

두 컴포넌트가 같은 자리에서 조건에 따라 전환된다면 state는 분리됩니다.

```tsx
{isLoggedIn ? <UserMenu /> : <LoginForm />}
```

`UserMenu`와 `LoginForm`은 다른 컴포넌트입니다. 전환될 때 각각의 내부 state는 초기화됩니다. `LoginForm`에서 입력했던 값은 `UserMenu`로 전환될 때 사라집니다.

반대로 같은 컴포넌트에 props만 바뀌는 경우에는 state가 유지됩니다.

```tsx
<Editor mode={mode} />
```

`mode`가 `"view"`에서 `"edit"`으로 바뀌어도 `Editor`는 같은 위치의 같은 컴포넌트입니다. 내부 state가 유지됩니다. 이게 원하는 동작인지, 초기화가 필요한지 생각해야 합니다.

## 목록에서는 key가 정체성이다

배열을 렌더링할 때는 위치만으로는 부족합니다.

항목이 추가되거나 삭제되면 나머지 항목의 위치(인덱스)가 바뀝니다. 위치만 보면 React는 엉뚱한 항목을 같은 컴포넌트로 착각할 수 있습니다.

그래서 `key`를 사용합니다.

```tsx
{todos.map((todo) => (
  <TodoItem key={todo.id} todo={todo} />
))}
```

React는 `key`를 보고 각 항목의 정체성을 파악합니다. 렌더링 간에 같은 `key`를 가진 컴포넌트는 같은 컴포넌트로 취급됩니다.

## index key의 문제 — 구체적인 예시

`index`를 `key`로 쓰면 어떤 문제가 생기는지 확인해봅니다.

아래 목록이 있다고 생각합니다.

```
[0] "리뷰하기" (key=0)
[1] "배포하기" (key=1)
[2] "문서 작성" (key=2)
```

각 `TodoItem`에 내부 input state가 있다고 가정합니다.

이제 첫 번째 항목 "리뷰하기"를 삭제합니다.

```
[0] "배포하기" (key=0)  ← 이전에 key=1이었던 항목
[1] "문서 작성" (key=1) ← 이전에 key=2였던 항목
```

`index`가 `key`라면 React는 이렇게 봅니다.

- `key=0`인 컴포넌트가 있다. 이것은 이전 `key=0`(리뷰하기)의 컴포넌트와 같다. → "리뷰하기" 컴포넌트의 state를 "배포하기"에 그대로 유지
- `key=2`가 사라졌다. "문서 작성" 컴포넌트를 제거.

그 결과, "배포하기" 항목이 "리뷰하기" 항목의 input state를 물려받습니다. input에 입력 중이던 내용이 엉뚱한 항목으로 이동하는 버그가 발생합니다.

반면 `todo.id`가 `key`라면 React는 이렇게 봅니다.

- `key="todo-1"`(리뷰하기)이 사라졌다. 이 컴포넌트를 제거하고 state도 버린다.
- `key="todo-2"`(배포하기)는 그대로 있다. 기존 state를 유지.
- `key="todo-3"`(문서 작성)도 그대로 있다. 기존 state를 유지.

정확하게 동작합니다.

```tsx
// 피합니다 — index key
{todos.map((todo, index) => (
  <TodoItem key={index} todo={todo} />
))}

// 올바름 — stable id key
{todos.map((todo) => (
  <TodoItem key={todo.id} todo={todo} />
))}
```

순서가 절대 바뀌지 않고 항목이 추가/삭제되지 않는 완전히 정적인 목록이라면 `index`를 써도 됩니다. 하지만 그런 경우는 생각보다 드뭅니다.

## key는 안정적이고 고유해야 한다

좋은 key는 두 조건을 만족합니다.

- **안정성**: 같은 항목이면 렌더링이 바뀌어도 같은 key를 유지합니다.
- **유일성**: 같은 목록 안에서 다른 항목과 겹치지 않습니다.

그래서 보통 서버에서 받은 id나 직접 만든 id를 사용합니다.

```tsx
const newTodo = {
  id: crypto.randomUUID(), // 항목 생성 시 한 번만 실행
  title,
  done: false,
};
```

중요한 점은 렌더링 중 매번 새 id를 만들면 안 된다는 것입니다.

```tsx
// 피합니다 — 렌더링마다 새 key 생성
{todos.map((todo) => (
  <TodoItem key={crypto.randomUUID()} todo={todo} />
))}
```

이렇게 쓰면 매 렌더링마다 key가 바뀌어서 React는 매번 완전히 새로운 컴포넌트라고 판단합니다. 그러면 state가 계속 초기화될 수 있습니다.

`key`는 항목을 만들 때(`setTodos((prev) => [...prev, newTodo])`) 한 번 부여하고, 이후 렌더링에서는 그 값을 그대로 씁니다.

## key의 범위

`key`는 같은 목록(sibling) 안에서만 고유하면 됩니다.

```tsx
function App() {
  return (
    <>
      <ul>
        {activeTodos.map((todo) => <TodoItem key={todo.id} ... />)}
      </ul>
      <ul>
        {doneTodos.map((todo) => <TodoItem key={todo.id} ... />)}
      </ul>
    </>
  );
}
```

두 목록에 같은 `todo.id`가 있어도 문제없습니다. 다른 부모 아래에 있으므로 충돌하지 않습니다.

## key는 props로 읽을 수 없다

`key`는 React가 내부적으로 쓰는 특수 속성입니다. 컴포넌트 안에서 `props.key`로 읽을 수 없습니다.

`id`가 컴포넌트 내부에서도 필요하다면 별도 prop으로 전달해야 합니다.

```tsx
// key와 id를 따로 전달
<TodoItem key={todo.id} id={todo.id} todo={todo} />

// TodoItem 안에서
function TodoItem({ id, todo }: TodoItemProps) {
  // id를 쓸 수 있음
  // props.key는 읽을 수 없음
}
```

## key로 state를 일부러 초기화할 수도 있다

key는 state를 보존하는 데 쓰이지만, 반대로 초기화하고 싶을 때도 사용할 수 있습니다.

프로필을 보는 화면에서 사용자가 바뀔 때 form을 초기화하고 싶다고 생각해봅니다.

```tsx
<ProfileForm key={userId} userId={userId} />
```

`userId`가 바뀌면 key도 바뀝니다. React는 이전 `ProfileForm`과 새 `ProfileForm`을 다른 컴포넌트로 보고 state를 초기화합니다.

이 패턴은 다음 상황에서 유용합니다.

- 탭을 전환할 때 각 탭의 입력 form을 독립적으로 관리하고 싶을 때
- 선택한 항목이 바뀔 때 편집 form을 새로 시작하고 싶을 때
- 대화 상대가 바뀔 때 채팅 입력 form을 초기화하고 싶을 때

```tsx
// 사용자가 바뀔 때마다 채팅 입력 form 초기화
<ChatInput key={selectedUserId} recipientId={selectedUserId} />
```

key 없이 이 효과를 얻으려면 `useEffect`로 state를 수동으로 초기화해야 합니다. key를 쓰는 것이 더 명확합니다.

## 요약

| 상황 | 동작 |
| --- | --- |
| 같은 위치, 같은 타입 | state 유지 |
| 같은 위치, 다른 타입 | state 초기화 |
| 컴포넌트가 DOM에서 사라짐 | state 제거 |
| key가 같음 | 같은 컴포넌트로 취급, state 유지 |
| key가 바뀜 | 다른 컴포넌트로 취급, state 초기화 |
| index를 key로 사용, 순서 변경 | 엉뚱한 항목에 state가 남는 버그 가능 |

## 읽으면서 생각할 질문

- 목록의 key가 항목의 안정적인 id를 사용하고 있는가?
- index key를 써도 되는 정적인 목록인지, 순서가 바뀔 수 있는 목록인지 구분했는가?
- 렌더링할 때마다 새 key를 만들고 있지는 않은가?
- 컴포넌트가 사라졌다 다시 나타날 때 state가 초기화된다는 점을 이해하는가?
- 조건부 렌더링에서 전환되는 컴포넌트의 state가 의도대로 유지/초기화되는가?
- state를 일부러 초기화해야 하는 상황에서 key를 사용할 수 있다는 점을 아는가?

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:form`
- 실제 코드: `src/examples/EventsFormsExample.tsx`
