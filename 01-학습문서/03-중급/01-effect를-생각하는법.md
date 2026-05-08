# Effect를 생각하는 법

Effect는 렌더링 이후 React 바깥의 시스템과 맞추는 코드입니다.

외부 시스템이 없으면 Effect가 필요 없을 가능성이 큽니다. props와 state에서 계산할 수 있는 값은 렌더링 중 계산하고, 사용자 행동은 event handler에서 처리합니다.

```tsx
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);
```

브라우저 이벤트 구독은 React 바깥의 일이므로 Effect가 어울립니다. 구독을 시작했다면 cleanup에서 정리합니다.

## 읽으면서 생각할 질문

- 이 코드가 외부 시스템과 연결되는가?
- Effect 안에서 읽는 값이 dependency에 들어갔는가?
- cleanup이 필요한 작업인가?
- event handler에서 처리하는 편이 더 자연스럽지는 않은가?
- Effect를 제거하면 데이터 흐름이 더 단순해지는가?
