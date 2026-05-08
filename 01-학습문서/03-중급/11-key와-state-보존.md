# Key와 state 보존

`key`는 목록 렌더링에서만 쓰는 값처럼 보이지만, React가 컴포넌트를 같은 것으로 볼지 다른 것으로 볼지 판단하는 중요한 단서입니다.

React는 같은 위치에 같은 타입의 컴포넌트가 있으면 state를 보존합니다. `key`가 바뀌면 같은 위치라도 다른 컴포넌트로 보고 state를 새로 만듭니다.

## React의 재조정(Reconciliation) 과정

React는 렌더링이 일어날 때마다 이전 렌더링 결과와 새 렌더링 결과를 비교합니다. 이 과정을 재조정이라고 합니다.

비교의 기준은 두 가지입니다.

1. **위치**: 같은 트리의 같은 위치인가?
2. **타입**: 같은 컴포넌트 또는 같은 HTML 태그인가?

두 조건이 모두 맞으면 React는 기존 컴포넌트 인스턴스를 재사용하고 state를 유지합니다. 하나라도 다르면 기존 인스턴스를 제거하고 새로 만듭니다.

```tsx
// isLoggedIn이 바뀌면 UserMenu와 LoginForm은 다른 타입
// → 각자의 내부 state가 독립적으로 유지/초기화됨
{isLoggedIn ? <UserMenu /> : <LoginForm />}
```

같은 타입이지만 props만 바뀌는 경우에는 state가 유지됩니다.

```tsx
// mode가 바뀌어도 Editor 컴포넌트는 같은 타입, 같은 위치
// → 내부 state 유지
<Editor mode={mode} />
```

## 목록에서 key가 필요한 이유

```tsx
todos.map((todo) => <TodoItem key={todo.id} todo={todo} />);
```

React는 key를 보고 어떤 item이 추가, 삭제, 이동되었는지 판단합니다. 안정적인 key가 없으면 잘못된 item에 state가 남을 수 있습니다.

## index key가 위험한 경우 — 구체적인 예시

배열 index를 key로 쓰면 목록 순서가 바뀔 때 문제가 생길 수 있습니다.

```tsx
todos.map((todo, index) => <TodoItem key={index} todo={todo} />);
```

아래 상황을 상상해봅니다. 각 TodoItem 안에 편집 input이 있고, "배포하기" 항목의 input에 내용을 입력 중입니다.

```
index=0: "리뷰하기"   → key=0
index=1: "배포하기"   → key=1  ← 이 input에 "수정 중..." 입력
index=2: "문서 작성"  → key=2
```

이 상태에서 첫 번째 항목 "리뷰하기"를 삭제합니다.

```
index=0: "배포하기"   → key=0  ← 이전 key=1이었던 항목
index=1: "문서 작성"  → key=1  ← 이전 key=2였던 항목
```

React는 key 기준으로 판단하므로 이렇게 봅니다.

- `key=0` 컴포넌트: "리뷰하기"에서 "배포하기"로 props가 바뀌었다. state 유지.
- `key=2` 컴포넌트: 사라졌다. 제거.

결과: `key=0`이었던 "리뷰하기" 항목의 input state("수정 중...")가 지금 "배포하기"를 보여주는 컴포넌트에 남아 있습니다. 데이터는 "배포하기"를 가리키는데 input에는 "수정 중..." 내용이 보이는 버그가 발생합니다.

안정적인 id를 key로 쓰면 이 문제가 없습니다.

```
key="todo-review": "리뷰하기" 삭제 → 이 컴포넌트와 state 제거
key="todo-deploy": "배포하기" 그대로 → state 유지 (입력 중이던 내용 유지)
key="todo-docs": "문서 작성" 그대로 → state 유지
```

## index key가 괜찮은 경우

아래 세 조건을 모두 만족하면 index를 key로 써도 됩니다.

- 목록이 정적이다 (추가/삭제/정렬 없음).
- 항목 내부에 state가 없다 (input, 편집 모드 등).
- 항목 순서가 절대 바뀌지 않는다.

실제 앱에서는 데이터 id를 key로 쓰는 습관이 안전합니다.

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

## key는 props로 읽을 수 없다

`key`는 React가 내부적으로 관리하는 특수 속성입니다. 컴포넌트 안에서 `props.key`로 읽을 수 없습니다.

id가 컴포넌트 내부에도 필요하다면 별도 prop으로 전달해야 합니다.

```tsx
<TodoItem key={todo.id} id={todo.id} todo={todo} />

function TodoItem({ id, todo }: TodoItemProps) {
  // id를 직접 사용 가능
  // props.key는 항상 undefined
}
```

## state를 의도적으로 초기화하기

key는 state 초기화에도 사용할 수 있습니다.

```tsx
function ProfilePage({ userId }: { userId: string }) {
  return <ProfileForm key={userId} userId={userId} />;
}
```

`userId`가 바뀌면 `ProfileForm`은 새 컴포넌트로 취급됩니다. 이전 사용자의 form draft가 다음 사용자 화면에 남지 않습니다.

다른 활용 예시들입니다.

```tsx
// 선택한 대화 상대가 바뀔 때 채팅 입력 초기화
<ChatInput key={selectedUserId} />

// 탭이 바뀔 때 각 탭의 form을 독립적으로 관리
<EditForm key={activeTabId} tabId={activeTabId} />

// 편집 모드를 시작할 때마다 입력값 초기화
{isEditing && <InlineEditor key={editStartedAt} initialValue={value} />}
```

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
<Editor key={Date.now()} />
```

## 요약표

| 상황 | 동작 |
| --- | --- |
| 같은 위치, 같은 타입 | state 유지 |
| 같은 위치, 다른 타입 | state 초기화 |
| 컴포넌트가 DOM에서 사라짐 | state 제거 |
| key가 같음 | 같은 컴포넌트 취급, state 유지 |
| key가 바뀜 | 다른 컴포넌트 취급, state 초기화 |
| index key + 순서 변경 | 엉뚱한 항목에 state 이동 가능 |
| index key + 항목 삭제 앞에서 | 이후 항목의 state 오이동 |

## 읽으면서 생각할 질문

- 목록 key가 데이터의 안정적인 id인가?
- index key를 써도 목록 순서가 절대 바뀌지 않는가?
- 다른 데이터로 전환될 때 내부 state를 보존해야 하는가, 초기화해야 하는가?
- `key={Math.random()}`처럼 매번 바뀌는 key를 쓰고 있지는 않은가?
- key로 강제 초기화하기 전에 state 위치를 조정할 수 있는가?
- key는 props로 읽을 수 없다는 점을 알고 id를 별도 prop으로 전달하는가?

## 이전 단계 참고

- [초급 — Key와 State 보존](../02-초급/06-key와-state-보존.md): key가 경고 제거용이 아니라 state 정체성과 연결된다는 기본 개념을 먼저 익힙니다.
