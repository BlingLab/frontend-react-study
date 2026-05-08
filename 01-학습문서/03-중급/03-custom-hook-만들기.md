# Custom Hook 만들기

Custom Hook은 반복되는 상태 로직을 컴포넌트 밖으로 꺼내 이름 붙이는 방법입니다.

```tsx
function useToggle(initialValue = false) {
  const [isOn, setIsOn] = useState(initialValue);
  return { isOn, toggle: () => setIsOn((value) => !value) };
}
```

Hook은 UI를 몰라도 됩니다. 오히려 UI와 상태 규칙이 분리될수록 여러 컴포넌트에서 쓰기 쉽습니다.

처음에는 재사용성보다 이름 붙이기를 기준으로 봅니다. `useToggle`, `useWindowSize`, `useSearchParams`처럼 로직의 목적이 드러나야 합니다.

## 읽으면서 생각할 질문

- 이 상태 로직에 이름을 붙이면 컴포넌트가 짧아지는가?
- custom Hook이 JSX에 의존하고 있지는 않은가?
- 반환값을 object로 하면 호출부가 더 읽기 쉬운가?
- Hook 이름이 실제 목적을 설명하는가?
- 여러 컴포넌트에서 같은 규칙을 반복하고 있지는 않은가?
