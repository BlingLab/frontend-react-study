# 2단계. 초급

사용자의 행동으로 UI가 바뀌는 흐름을 익힙니다. state, event, form, list update가 중심입니다.

## 읽을 문서

1. [State를 고르는 법](./01-state를-고르는법.md)
2. [Event와 Form](./02-event와-form.md)
3. [배열 State 업데이트](./03-배열-state-업데이트.md)
4. [State 위치 정하기](./04-state-위치-정하기.md)

## 이 단계의 목표

- state를 최소로 둡니다.
- event handler에서 사용자의 의도를 처리합니다.
- controlled input으로 form 값을 다룹니다.
- 배열 state를 직접 수정하지 않고 새 배열로 업데이트합니다.

## 연결되는 예제

- 예제 안내: [02-학습예제/02-초급](../../02-학습예제/02-초급/README.md)
- 실행 명령: `pnpm run 예제:초급`
- 실제 코드: `src/examples/PropsStateExample.tsx`
- 실제 코드: `src/examples/EventsFormsExample.tsx`

## 빠른 정리

| 구분 | Props | State |
| --- | --- | --- |
| 소유자 | 부모 컴포넌트 | 현재 컴포넌트 |
| 변경 방식 | 자식이 직접 변경하지 않음 | setter로 변경 |
| 용도 | 입력 데이터 | 렌더링 사이에 기억할 값 |

이전 state에 의존할 때는 updater function을 사용합니다.

```tsx
setCount((count) => count + 1);
setItems((items) => items.filter((item) => item.id !== id));
```

State가 아닐 수 있는 값도 먼저 확인합니다.

- props에서 계산 가능
- 다른 state에서 계산 가능
- 렌더링 사이에 기억할 필요 없음
