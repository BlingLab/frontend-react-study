# 초급 예제

## 연결되는 학습문서

- [초급 문서](../../01-학습문서/02-초급/README.md)
- [State를 고르는 법](../../01-학습문서/02-초급/01-state를-고르는법.md)
- [Event와 Form](../../01-학습문서/02-초급/02-event와-form.md)
- [배열 State 업데이트](../../01-학습문서/02-초급/03-배열-state-업데이트.md)

## 실행 명령

```bash
pnpm run 예제:초급
```

초급에는 카운터와 폼 예제가 함께 있습니다. 각각 바로 열고 싶다면 아래 명령을 사용합니다.

```bash
pnpm run 예제:state
pnpm run 예제:form
```

빌드 결과로 확인하려면 다음 명령을 사용합니다.

```bash
pnpm run 미리보기:초급
```

## 확인할 코드

- `src/examples/PropsStateExample.tsx`
- `src/examples/EventsFormsExample.tsx`

## 직접 바꿔볼 것

- 카운터의 step 값을 바꿉니다.
- reset 버튼의 동작을 수정합니다.
- Todo form에서 빈 값 submit을 막는 위치를 확인합니다.
- 남은 할 일 개수가 state인지 계산값인지 설명합니다.
