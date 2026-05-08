# Effect를 생각하는 법

Effect는 렌더링 결과를 React 바깥의 시스템과 맞추는 코드입니다.

React 컴포넌트는 기본적으로 props와 state를 받아 UI를 계산합니다. 이 계산만으로 끝나는 일이라면 Effect가 필요하지 않습니다. Effect는 브라우저 API, 네트워크, 타이머, 외부 라이브러리처럼 React가 직접 관리하지 않는 시스템과 연결할 때 사용합니다.

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

객체를 컴포넌트 본문에서 매번 새로 만들면 dependency가 매번 바뀔 수 있습니다. 그럴 때는 객체 생성을 Effect 안으로 옮기는 편이 단순합니다.

```tsx
useEffect(() => {
  const options = { roomId, serverUrl };
  const connection = createConnection(options);
  connection.connect();

  return () => connection.disconnect();
}, [roomId, serverUrl]);
```

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

setup이 연결이면 cleanup은 연결 해제입니다. setup이 구독이면 cleanup은 구독 해제입니다.

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

## 읽으면서 생각할 질문

- 이 코드가 외부 시스템과 연결되는가?
- Effect 안에서 읽는 값이 dependency에 들어갔는가?
- cleanup이 필요한 작업인가?
- event handler에서 처리하는 편이 더 자연스럽지는 않은가?
- Effect를 제거하면 데이터 흐름이 더 단순해지는가?
- state를 하나 더 만들기 위해 Effect를 쓰고 있지는 않은가?
- Strict Mode에서 setup과 cleanup이 반복되어도 안전한가?
