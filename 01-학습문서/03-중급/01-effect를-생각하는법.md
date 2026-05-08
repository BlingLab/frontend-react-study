# Effect를 생각하는 법

Effect는 렌더링 결과를 React 바깥의 시스템과 맞추는 코드입니다.

React 컴포넌트는 기본적으로 props와 state를 받아 UI를 계산합니다. 이 계산만으로 끝나는 일이라면 Effect가 필요하지 않습니다. Effect는 브라우저 API, 네트워크, 타이머, 외부 라이브러리처럼 React가 직접 관리하지 않는 시스템과 연결할 때 사용합니다.

## Effect는 렌더링 이후에 실행된다

컴포넌트 함수가 실행되고 JSX가 DOM에 반영된 뒤, Effect가 실행됩니다. 이 순서가 중요합니다.

```
컴포넌트 함수 실행 → JSX → DOM 업데이트 → Effect 실행
```

처음 마운트(mount)될 때와 의존성이 바뀔 때 Effect가 실행되고, 컴포넌트가 사라질 때(unmount) cleanup이 실행됩니다.

```tsx
useEffect(() => {
  // 마운트 또는 deps 변경 후 실행
  console.log("effect 실행");

  return () => {
    // 다음 effect 실행 전, 또는 unmount 시 실행
    console.log("cleanup 실행");
  };
}, [deps]);
```

의존성 배열이 비어있으면 마운트 시 한 번만 실행됩니다.

```tsx
useEffect(() => {
  // 마운트 시 한 번만 실행
}, []);
```

의존성 배열을 아예 생략하면 매 렌더링마다 실행됩니다. 이 경우는 의도적인 상황이 아니라면 피합니다.

```tsx
useEffect(() => {
  // 매 렌더링마다 실행 — 보통 원하는 동작이 아님
});
```

## 먼저 던질 질문

Effect를 쓰기 전에는 아래 질문을 먼저 봅니다.

- 이 코드가 React 바깥 시스템과 연결되는가?
- 렌더링 중 계산하면 되는 값을 굳이 state로 다시 저장하고 있지는 않은가?
- 사용자의 클릭, submit, change 때문에 발생하는 일이라면 event handler가 더 자연스럽지 않은가?
- 이 작업을 시작했다면 되돌리거나 정리할 cleanup이 필요한가?
- dependency 배열에 Effect 안에서 읽는 reactive 값이 모두 들어갔는가?

## Effect가 어울리는 경우

브라우저 이벤트 구독은 React 바깥의 일이므로 Effect가 어울립니다. 구독을 시작했다면 cleanup에서 정리해야 합니다.

```tsx
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

타이머도 마찬가지입니다.

```tsx
useEffect(() => {
  const intervalId = window.setInterval(() => {
    setSeconds((seconds) => seconds + 1);
  }, 1000);

  return () => window.clearInterval(intervalId);
}, []);
```

외부 라이브러리 인스턴스를 만들고 제거하는 코드도 Effect로 감쌉니다.

```tsx
useEffect(() => {
  const chart = createChart(containerRef.current, options);
  chart.setData(data);

  return () => chart.destroy();
}, [data, options]);
```

이때 중요한 점은 setup과 cleanup이 짝을 이뤄야 한다는 것입니다. 이벤트를 등록했다면 제거하고, 타이머를 만들었다면 해제하고, 외부 인스턴스를 만들었다면 destroy합니다.

`document.title`처럼 브라우저 상태와 동기화하는 작업도 Effect가 자연스럽습니다.

```tsx
useEffect(() => {
  document.title = title ? `${title} - 앱 이름` : "앱 이름";
}, [title]);
```

## Effect가 필요 없는 경우

### props/state로 계산할 수 있는 값

아래 코드는 흔하지만 좋지 않습니다.

```tsx
function ProductList({ products, keyword }: Props) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    setFilteredProducts(
      products.filter((product) => product.name.includes(keyword)),
    );
  }, [products, keyword]);

  return <List items={filteredProducts} />;
}
```

`filteredProducts`는 이미 `products`와 `keyword`에서 계산할 수 있습니다. state로 다시 저장하면 렌더링이 한 번 더 발생하고, 원본과 파생값이 어긋날 가능성이 생깁니다.

```tsx
function ProductList({ products, keyword }: Props) {
  const filteredProducts = products.filter((product) =>
    product.name.includes(keyword),
  );

  return <List items={filteredProducts} />;
}
```

계산이 정말 무겁다면 Effect가 아니라 `useMemo`를 고려합니다.

```tsx
const filteredProducts = useMemo(() => {
  return products.filter((product) => product.name.includes(keyword));
}, [products, keyword]);
```

### 사용자 행동의 결과

버튼을 눌렀을 때 토스트를 띄우거나 페이지를 이동하는 일은 Effect보다 event handler가 자연스럽습니다.

```tsx
function CartButton({ product }: Props) {
  function handleAddClick() {
    addToCart(product);
    showToast("장바구니에 담았습니다.");
  }

  return <button onClick={handleAddClick}>담기</button>;
}
```

사용자 행동의 결과를 Effect로 옮기면 "언제 실행됐는지"가 흐려집니다. 특히 새로고침 뒤에 복원된 state 때문에 의도하지 않은 알림이 뜨는 문제가 생길 수 있습니다.

### props 변경에 반응해서 state를 초기화할 때

아래 패턴은 흔하지만 피해야 합니다.

```tsx
// 좋지 않음
function SearchForm({ initialKeyword }: { initialKeyword: string }) {
  const [keyword, setKeyword] = useState(initialKeyword);

  useEffect(() => {
    setKeyword(initialKeyword); // initialKeyword가 바뀌면 keyword를 맞춤
  }, [initialKeyword]);

  return <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />;
}
```

이 코드는 렌더링이 두 번 일어납니다. `key`로 컴포넌트를 새로 만드는 방식이 더 명확합니다.

```tsx
// 좋음 — initialKeyword가 바뀌면 컴포넌트 자체를 새로 만듦
<SearchForm key={initialKeyword} initialKeyword={initialKeyword} />
```

## dependency 배열을 보는 법

Effect 안에서 읽는 props, state, component 내부 함수는 dependency에 들어가야 합니다.

```tsx
useEffect(() => {
  document.title = `${count}개 선택됨`;
}, [count]);
```

dependency를 줄이고 싶어서 값을 빼는 방식은 피합니다. 대신 Effect 내부로 함수를 옮기거나, state updater 함수를 사용하거나, Effect 자체가 필요한지 다시 봅니다.

```tsx
useEffect(() => {
  const connection = createConnection({ roomId });
  connection.connect();

  return () => connection.disconnect();
}, [roomId]);
```

객체나 함수를 컴포넌트 본문에서 매번 새로 만들면 dependency가 매번 바뀔 수 있습니다. 그럴 때는 객체 생성이나 함수를 Effect 안으로 옮기는 편이 단순합니다.

```tsx
useEffect(() => {
  const options = { roomId, serverUrl }; // Effect 안에서 선언
  const connection = createConnection(options);
  connection.connect();

  return () => connection.disconnect();
}, [roomId, serverUrl]);
```

## 무한 루프 주의

Effect 안에서 state를 바꾸면 그 state가 dependency에 들어갈 때 무한 루프가 생길 수 있습니다.

```tsx
// 무한 루프 — count가 바뀌면 Effect 실행, Effect에서 count 변경, 다시 Effect 실행
useEffect(() => {
  setCount(count + 1);
}, [count]);
```

이런 상황은 보통 "Effect에서 state를 직접 계산하는 값으로 업데이트하려는 것"입니다. state updater 함수를 쓰거나, Effect가 필요 없는 경우가 많습니다.

```tsx
// updater function 사용 — count를 dependency에서 제거
useEffect(() => {
  const intervalId = setInterval(() => {
    setCount((prev) => prev + 1); // dependency에 count 불필요
  }, 1000);
  return () => clearInterval(intervalId);
}, []);
```

## useLayoutEffect

`useEffect`는 DOM이 그려진 후(paint) 비동기로 실행됩니다. 반면 `useLayoutEffect`는 DOM 업데이트 후, 브라우저가 화면을 그리기 전에 동기로 실행됩니다.

대부분의 경우 `useEffect`로 충분합니다. 아래 상황에서만 `useLayoutEffect`를 고려합니다.

- DOM 크기를 측정하고 그 결과로 DOM을 바꿀 때. `useEffect`를 쓰면 화면이 한 번 깜빡일 수 있습니다.
- tooltip 위치처럼 요소가 화면에 보이기 전에 위치를 계산해야 할 때.

```tsx
useLayoutEffect(() => {
  // DOM 측정 후 위치 계산
  const rect = tooltipRef.current?.getBoundingClientRect();
  if (rect) {
    setPosition(calculatePosition(rect));
  }
});
```

`useLayoutEffect`는 렌더링을 블로킹하므로 꼭 필요한 경우에만 씁니다.

## Strict Mode에서 두 번 실행되는 것처럼 보일 때

개발 환경의 Strict Mode에서는 Effect setup과 cleanup을 한 번 더 실행해서 cleanup이 제대로 작성됐는지 확인합니다. 이 동작 때문에 문제가 생긴다면 "한 번만 실행되게 막기"보다 cleanup이 setup을 정확히 되돌리는지 먼저 봐야 합니다.

```tsx
useEffect(() => {
  const socket = connectSocket(roomId);

  return () => {
    socket.disconnect();
  };
}, [roomId]);
```

setup이 연결이면 cleanup은 연결 해제입니다. setup이 구독이면 cleanup은 구독 해제입니다. 이 규칙을 지키면 Strict Mode에서 두 번 실행되어도 문제없습니다.

## 실전 판단 예시

| 코드의 목적 | Effect가 맞나? | 이유 |
| --- | --- | --- |
| 검색어로 목록 필터링 | 아니오 | props/state로 계산 가능 |
| 버튼 클릭 후 알림 표시 | 아니오 | event handler의 책임 |
| document title 변경 | 예 | 브라우저 문서 상태와 동기화 |
| window resize 구독 | 예 | 브라우저 이벤트 구독 |
| fetch 요청 | 경우에 따라 예 | 외부 네트워크와 연결, cleanup 고려 |
| localStorage 저장 | 예 | 브라우저 저장소와 동기화 |
| props가 바뀌면 내부 state 초기화 | 대부분 아니오 | key, state 위치, 계산값을 먼저 검토 |
| 카운트 증가시키기 | 아니오 | event handler나 state updater로 처리 |
| 외부 차트 라이브러리 연결 | 예 | 외부 라이브러리와 동기화 |

## 읽으면서 생각할 질문

- 이 코드가 외부 시스템과 연결되는가?
- Effect 안에서 읽는 값이 dependency에 들어갔는가?
- cleanup이 필요한 작업인가?
- event handler에서 처리하는 편이 더 자연스럽지는 않은가?
- Effect를 제거하면 데이터 흐름이 더 단순해지는가?
- state를 하나 더 만들기 위해 Effect를 쓰고 있지는 않은가?
- Strict Mode에서 setup과 cleanup이 반복되어도 안전한가?
- dependency를 줄이기 위해 값을 빼고 있지는 않은가?
