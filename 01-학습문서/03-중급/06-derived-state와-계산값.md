# Derived state와 계산값

Derived state는 다른 props나 state에서 계산할 수 있는 값입니다. 중급 단계에서 가장 흔한 실수는 계산값을 별도 state로 저장한 뒤 Effect로 동기화하는 것입니다.

원칙은 단순합니다.

> 이미 가진 값으로 계산할 수 있으면 state로 만들지 않습니다.

## 나쁜 예: 계산값을 state로 저장하기

```tsx
function CartSummary({ items }: { items: CartItem[] }) {
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    setTotalPrice(
      items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    );
  }, [items]);

  return <p>합계: {totalPrice.toLocaleString()}원</p>;
}
```

`totalPrice`는 `items`에서 바로 계산할 수 있습니다. state로 저장하면 다음 문제가 생깁니다.

- 렌더링 후 Effect가 실행되어 한 번 더 렌더링됩니다.
- 원본 `items`와 파생값 `totalPrice`가 순간적으로 어긋날 수 있습니다.
- dependency를 빼먹으면 오래된 값이 화면에 남습니다.

## 좋은 예: 렌더링 중 계산하기

```tsx
function CartSummary({ items }: { items: CartItem[] }) {
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return <p>합계: {totalPrice.toLocaleString()}원</p>;
}
```

계산값은 렌더링 결과의 일부입니다. 렌더링 중 계산하면 데이터 흐름이 짧고 명확합니다.

## 자주 나오는 계산값

아래 값들은 대부분 state가 아니라 계산값입니다.

| 값 | 원본 |
| --- | --- |
| 필터링된 목록 | 전체 목록, 검색어, 필터 |
| 정렬된 목록 | 전체 목록, 정렬 기준 |
| 총합 | 목록 |
| 선택 개수 | 선택된 id 목록 |
| form 유효성 | 입력값 |
| 버튼 disabled 여부 | 요청 상태, 입력값 |
| empty 여부 | 데이터 배열 길이 |

예시는 다음과 같습니다.

```tsx
const visibleTodos = todos.filter((todo) => {
  if (filter === "active") return !todo.done;
  if (filter === "done") return todo.done;
  return true;
});

const doneCount = todos.filter((todo) => todo.done).length;
const canSubmit = title.trim().length > 0 && requestState.status !== "loading";
```

## useMemo는 state가 아니다

계산이 비싸거나, 참조 안정성이 필요한 경우에는 `useMemo`를 사용할 수 있습니다. 하지만 `useMemo`는 state를 만드는 도구가 아니라 계산 결과를 캐시하는 도구입니다.

```tsx
const sortedProducts = useMemo(() => {
  return [...products].sort((a, b) => a.price - b.price);
}, [products]);
```

`useMemo`가 항상 필요한 것은 아닙니다. 짧은 filter, map, reduce는 대부분 그냥 계산해도 충분합니다.

```tsx
const completedCount = todos.filter((todo) => todo.done).length;
```

처음에는 단순하게 작성하고, 목록이 크거나 계산이 실제로 느릴 때 `useMemo`를 추가합니다.

## state로 둬야 하는 값

모든 값을 계산값으로 만들 수는 없습니다. 사용자의 행동으로 바뀌고, 원본이 따로 없고, 시간이 지나도 유지되어야 하는 값은 state입니다.

```tsx
const [keyword, setKeyword] = useState("");
const [selectedIds, setSelectedIds] = useState<number[]>([]);
const [sortOrder, setSortOrder] = useState<"price" | "rating">("price");
```

여기서 `keyword`, `selectedIds`, `sortOrder`는 사용자의 선택 자체입니다. 반면 `filteredProducts`, `selectedCount`, `canSubmit`은 이 state들에서 계산할 수 있습니다.

## props를 state 초기값으로 복사할 때

아래 코드는 신중해야 합니다.

```tsx
function ProfileForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name);

  return <input value={name} onChange={(event) => setName(event.target.value)} />;
}
```

이 코드가 항상 나쁜 것은 아닙니다. form draft처럼 "처음에는 props에서 시작하지만 이후에는 사용자가 편집하는 별도 값"이라면 state가 맞습니다.

하지만 props가 바뀔 때마다 state도 맞춰야 한다면 먼저 구조를 다시 봅니다.

- 같은 사용자를 편집하는 동안 draft가 필요한가?
- 다른 사용자로 바뀌면 form을 완전히 초기화해야 하는가?
- 그렇다면 `key={user.id}`로 컴포넌트를 새로 만드는 편이 더 명확한가?

```tsx
function ProfileRoute({ userId }: { userId: string }) {
  const user = useUser(userId);

  return <ProfileForm key={user.id} user={user} />;
}
```

## 계산값을 잘못 state로 만들었을 때의 신호

- `useEffect` 안에서 `setSomething(compute(...))`만 하고 있다.
- state 이름이 `filtered`, `sorted`, `count`, `isValid`, `canSubmit` 같은 계산 결과다.
- 같은 정보를 가진 state가 두 개 이상 있다.
- dependency를 맞추느라 Effect가 복잡해진다.
- state가 잠깐 틀린 값을 보여준 뒤 바로 바뀐다.

## 읽으면서 생각할 질문

- 이 값의 원본은 무엇인가?
- 이미 있는 props/state로 매번 계산할 수 있는가?
- state로 저장해서 얻는 이득이 있는가?
- state로 저장했을 때 원본과 어긋날 위험은 없는가?
- `useMemo`가 필요한 실제 비용이 있는가?
