# 3단계. 중급

React 바깥의 시스템과 연결하는 법을 다룹니다. Effect, data fetching, custom Hook이 중심입니다.

## 읽을 문서

1. [Effect를 생각하는 법](./01-effect를-생각하는법.md)
2. [Fetching 상태 나누기](./02-fetching-상태-나누기.md)
3. [Custom Hook 만들기](./03-custom-hook-만들기.md)
4. [Router 감각 잡기](./04-router-감각-잡기.md)

## 이 단계의 목표

- Effect가 필요한 상황과 필요 없는 상황을 구분합니다.
- loading, error, empty, success 상태를 나눕니다.
- 반복되는 상태 로직을 custom Hook으로 분리합니다.
- URL도 UI 상태의 일부로 볼 수 있게 됩니다.

## 연결되는 예제

- 예제 안내: [02-학습예제/03-중급](../../02-학습예제/03-중급/README.md)
- 실행 명령: `pnpm run 예제:중급`
- 실제 코드: `src/examples/EffectsFetchingExample.tsx`
- 실제 코드: `src/examples/CustomHooksExample.tsx`

## 빠른 정리

Effect가 필요한 경우는 React 바깥의 시스템과 연결될 때입니다.

| 상황 | 예 |
| --- | --- |
| 브라우저 API 구독 | resize, scroll |
| 네트워크 요청 | fetch |
| 타이머 | setInterval |
| 외부 라이브러리 | map, chart instance |

Effect가 아닐 수 있는 경우도 먼저 봅니다.

- props/state에서 계산 가능한 값
- 클릭 이벤트에서 처리할 수 있는 로직
- form submit 결과 처리

```tsx
useEffect(() => {
  const id = window.setInterval(tick, 1000);
  return () => window.clearInterval(id);
}, []);
```
