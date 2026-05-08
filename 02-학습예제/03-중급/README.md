# 중급 예제

## 연결되는 학습문서

- [중급 문서](../../01-학습문서/03-중급/README.md)
- [Effect를 생각하는 법](../../01-학습문서/03-중급/01-effect를-생각하는법.md)
- [Fetching 상태 나누기](../../01-학습문서/03-중급/02-fetching-상태-나누기.md)
- [Custom Hook 만들기](../../01-학습문서/03-중급/03-custom-hook-만들기.md)

## 실행 명령

```bash
pnpm run 예제:중급
```

중급에는 fetching과 custom Hook 예제가 함께 있습니다. 각각 바로 열고 싶다면 아래 명령을 사용합니다.

```bash
pnpm run 예제:effect
pnpm run 예제:hook
```

빌드 결과로 확인하려면 다음 명령을 사용합니다.

```bash
pnpm run 미리보기:중급
```

## 확인할 코드

- `src/examples/EffectsFetchingExample.tsx`
- `src/examples/CustomHooksExample.tsx`
- `src/hooks/useToggle.ts`

## 직접 바꿔볼 것

- fetch URL을 일부러 틀려 error 상태를 확인합니다.
- loading 중 버튼을 비활성화합니다.
- `useToggle`에 `reset` 함수를 추가합니다.
- custom Hook이 JSX에 의존하지 않는지 확인합니다.
