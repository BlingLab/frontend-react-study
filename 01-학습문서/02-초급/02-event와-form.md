# Event와 Form

Event handler는 사용자의 의도를 받는 함수입니다. 버튼 클릭, input 변경, form 제출은 모두 사용자가 화면에 보낸 신호입니다.

```tsx
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  addTodo(title);
}
```

Form은 controlled input으로 시작하는 것이 이해하기 쉽습니다. input의 `value`를 state로 연결하고, `onChange`에서 state를 업데이트합니다.

이 방식은 현재 입력값을 React가 알고 있기 때문에 검증, 초기화, submit 처리가 명확합니다.

## 읽으면서 생각할 질문

- 이 이벤트는 사용자의 어떤 의도를 표현하는가?
- `onClick={handleClick}`과 `onClick={handleClick()}`의 차이를 아는가?
- form submit에서 기본 새로고침을 막아야 하는가?
- input value와 state가 같은 값을 보고 있는가?
- submit 후 input을 비우는 위치가 자연스러운가?
