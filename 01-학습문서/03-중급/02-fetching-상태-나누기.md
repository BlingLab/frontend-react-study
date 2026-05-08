# Fetching 상태 나누기

서버 데이터를 가져오는 UI는 성공 화면만 있으면 부족합니다.

사용자는 요청 중인지, 실패했는지, 결과가 비었는지 알아야 합니다. 그래서 fetching UI는 보통 다음 상태를 가집니다.

- loading
- error
- empty
- success

```tsx
type RequestState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Post[] };
```

처음에는 단순한 state 여러 개로 시작해도 됩니다. 다만 상태 조합이 어색해지면 하나의 union 타입으로 정리할 수 있습니다.

## 읽으면서 생각할 질문

- 요청 중 버튼을 눌러도 되는가?
- 실패했을 때 사용자가 다시 시도할 수 있는가?
- 데이터가 빈 배열일 때는 성공인가, 실패인가?
- 컴포넌트가 fetch URL 세부사항까지 알아야 하는가?
- 요청 결과를 local state로 둘지 server state 도구를 쓸지 판단했는가?
