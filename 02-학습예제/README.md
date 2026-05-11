# 학습예제

`01-학습문서`를 읽고 책상 앞에서 바로 확인할 수 있는 실행 예제 안내입니다.

실제 React 컴포넌트 코드는 `src/examples/`에 있고, 이 폴더는 난이도별 예제 사용법과 실행 명령어를 정리합니다.

## 빠른 실행

```bash
pnpm install
pnpm run 예제:기초
```

## 단계별 예제

| 단계 | 문서 | 예제 안내 | 실행 명령 |
| --- | --- | --- | --- |
| 기초 | `01-학습문서/01-기초` | [01-기초](./01-기초/README.md) | `pnpm run 예제:기초` |
| 초급 | `01-학습문서/02-초급` | [02-초급](./02-초급/README.md) | `pnpm run 예제:초급` |
| 중급 | `01-학습문서/03-중급` | [03-중급](./03-중급/README.md) | `pnpm run 예제:중급` |
| 고급 | `01-학습문서/04-고급` | [04-고급](./04-고급/README.md) | `pnpm run 예제:고급` |
| 심화 | `01-학습문서/05-심화` | [05-심화](./05-심화/README.md) | `pnpm run 예제:심화` |
| 실전 정리 | `01-학습문서/06-실전정리` | [06-실전정리](./06-실전정리/README.md) | `pnpm run 예제:전체` |

## 개별 예제 바로 열기

| 예제 | 실행 명령 | 관련 문서 |
| --- | --- | --- |
| 컴포넌트와 목록 | `pnpm run 예제:컴포넌트` | 01-기초 |
| Props와 State | `pnpm run 예제:state` | 02-초급 |
| Event와 Form | `pnpm run 예제:form` | 02-초급 |
| Effect와 Fetching | `pnpm run 예제:effect` | 03-중급 |
| Custom Hook | `pnpm run 예제:hook` | 03-중급 |
| 중급 패턴 | `pnpm run 예제:중급패턴` | 03-중급 |
| Portal과 Modal | `pnpm run 예제:portal` | 03-중급/12 |
| Deferred Value | `pnpm run 예제:deferred` | 03-중급/14 |
| Lazy Loading | `pnpm run 예제:lazy` | 03-중급/13 |
| Reducer와 Context | `pnpm run 예제:reducer` | 04-고급 |
| Transition | `pnpm run 예제:transition` | 04-고급/04 |
| Optimistic UI | `pnpm run 예제:optimistic` | 04-고급/07 |
| Error Boundary | `pnpm run 예제:error-boundary` | 04-고급/06 |
| 성능 | `pnpm run 예제:성능` | 05-심화 |
| Custom Hook 심화 | `pnpm run 예제:hook심화` | 05-심화/08 |
| TypeScript 패턴 | `pnpm run 예제:타입스크립트` | 05-심화/09 |

## 빌드 후 확인

개발 서버가 아니라 실제 build 결과를 확인하려면 다음 흐름을 사용합니다.

```bash
pnpm build
pnpm preview
```

특정 예제를 바로 열고 싶다면 아래 명령을 사용합니다.

```bash
pnpm run 미리보기:기초
pnpm run 미리보기:초급
pnpm run 미리보기:중급
pnpm run 미리보기:고급
pnpm run 미리보기:심화
```
