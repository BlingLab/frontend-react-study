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
- state 이름이 `totalPrice`인데 "진짜"는 `items`입니다.

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
| 총합, 평균 | 목록 |
| 선택 개수 | 선택된 id 목록 |
| form 유효성 여부 | 입력값 |
| 버튼 disabled 여부 | 요청 상태, 입력값 |
| empty 여부 | 데이터 배열 길이 |
| 완료율, 진행도 | 완료/전체 개수 |

예시는 다음과 같습니다.

```tsx
// 필터링 + 정렬
const visibleTodos = todos
  .filter((todo) => {
    if (filter === "active") return !todo.done;
    if (filter === "done") return todo.done;
    return true;
  })
  .filter((todo) => todo.title.includes(keyword));

// 통계
const totalCount = todos.length;
const doneCount = todos.filter((todo) => todo.done).length;
const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

// form 검증
const canSubmit = title.trim().length > 0 && requestState.status !== "loading";
const isEmailValid = email.includes("@") && email.includes(".");
```

## 계산값을 잘못 state로 만들었을 때의 신호

- `useEffect` 안에서 `setSomething(compute(...))`만 하고 있다.
- state 이름이 `filtered`, `sorted`, `count`, `isValid`, `canSubmit` 같은 계산 결과다.
- 같은 정보를 가진 state가 두 개 이상 있다.
- dependency를 맞추느라 Effect가 복잡해진다.
- state가 잠깐 틀린 값을 보여준 뒤 바로 바뀐다.

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

언제 `useMemo`를 쓸지 결정하는 기준은 실제 측정입니다. React DevTools Profiler로 느린 컴포넌트를 확인하고, 계산 자체가 병목인 경우에만 적용합니다.

## 참조 안정성과 useMemo

`useMemo`의 또 다른 용도는 참조 안정성(referential stability)입니다. 객체나 배열을 매 렌더링마다 새로 만들면 이를 dependency로 받는 Effect나 memo가 불필요하게 재실행될 수 있습니다.

```tsx
// 렌더링마다 새 객체 생성 → 하위 컴포넌트가 매번 업데이트됨
const options = { threshold: 0.5, rootMargin: "100px" };

// useMemo로 안정화
const options = useMemo(
  () => ({ threshold: 0.5, rootMargin: "100px" }),
  [],
);
```

## state로 둬야 하는 값

모든 값을 계산값으로 만들 수는 없습니다. 사용자의 행동으로 바뀌고, 원본이 따로 없고, 시간이 지나도 유지되어야 하는 값은 state입니다.

```tsx
const [keyword, setKeyword] = useState("");
const [selectedIds, setSelectedIds] = useState<string[]>([]);
const [sortOrder, setSortOrder] = useState<"price" | "rating">("price");
const [page, setPage] = useState(1);
```

여기서 `keyword`, `selectedIds`, `sortOrder`, `page`는 사용자의 선택 자체입니다. 반면 `filteredProducts`, `selectedCount`, `canSubmit`은 이 state들에서 계산할 수 있습니다.

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

## 계산값 판단 체크리스트

어떤 값이 계산값인지 판단할 때 이 순서로 확인합니다.

1. 이 값의 원본은 무엇인가?
2. 원본이 바뀔 때 이 값도 자동으로 바뀌어야 하는가?
3. 사용자가 이 값을 직접 바꿀 수 있는가?
4. 렌더링 사이에 이 값을 기억해야 하는가?

1, 2번에 "예"이고 3, 4번에 "아니오"라면 계산값입니다.

## 읽으면서 생각할 질문

- 이 값의 원본은 무엇인가?
- 이미 있는 props/state로 매번 계산할 수 있는가?
- state로 저장해서 얻는 이득이 있는가?
- state로 저장했을 때 원본과 어긋날 위험은 없는가?
- `useMemo`가 필요한 실제 비용이 있는가?
- `useEffect` 안에서 계산값을 setState로 동기화하고 있지는 않은가?
- state 이름이 계산 결과처럼 들리지는 않는가?
