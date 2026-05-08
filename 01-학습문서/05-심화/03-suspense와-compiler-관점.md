# Suspense와 Compiler 관점

Suspense는 loading 상태를 컴포넌트 트리 안에서 선언적으로 다루기 위한 React의 방향입니다.

처음 학습할 때는 Suspense API를 깊게 외우기보다, "어디에서 기다리는 UI를 보여줄 것인가"라는 관점을 잡습니다.

## Suspense는 loading boundary다

Suspense는 "이 하위 트리가 아직 준비되지 않았을 때 무엇을 보여줄지"를 선언합니다.

```tsx
<Suspense fallback={<ArticleSkeleton />}>
  <ArticleBody />
</Suspense>
```

fallback을 어디에 두느냐에 따라 사용자 경험이 달라집니다.

| boundary 위치 | 결과 |
| --- | --- |
| 앱 최상단 | 작은 지연에도 전체 화면이 loading으로 바뀔 수 있습니다. |
| 페이지 영역 | 페이지 이동 중 큰 단위 loading을 보여줍니다. |
| 카드/패널 영역 | 일부 영역만 skeleton으로 대체합니다. |

좋은 Suspense boundary는 사용자가 기다리는 단위와 비슷합니다.

## lazy loading과 Suspense

`lazy`는 컴포넌트 코드 로딩을 지연합니다. 데이터 로딩과는 별개의 문제입니다.

```tsx
const AdminPage = lazy(() => import("./AdminPage"));

function App() {
  return (
    <Suspense fallback={<p>관리자 화면을 불러오는 중...</p>}>
      <AdminPage />
    </Suspense>
  );
}
```

처음 화면에 필요 없는 큰 페이지, 차트, 에디터, 지도 같은 코드는 lazy loading 후보입니다. 반대로 작은 버튼 하나를 lazy로 나누면 복잡도만 커질 수 있습니다.

## Error Boundary와 함께 생각하기

Suspense는 loading fallback을 담당합니다. lazy import 실패나 렌더링 오류의 fallback은 Error Boundary가 담당합니다.

```tsx
<ErrorBoundary>
  <Suspense fallback={<SettingsSkeleton />}>
    <SettingsPage />
  </Suspense>
</ErrorBoundary>
```

실전에서는 loading, error, retry가 함께 설계되어야 합니다.

React Compiler는 수동 memoization 필요를 줄이는 방향으로 발전하고 있습니다. 하지만 Compiler가 있다고 해서 상태 위치, 컴포넌트 책임, Effect 사용 판단이 사라지지는 않습니다.

좋은 구조는 도구가 더 잘 도와줄 수 있게 만듭니다.

## Compiler가 줄여주는 일

React Compiler는 컴포넌트와 Hook을 분석해 불필요한 재계산과 리렌더링을 줄이는 방향의 도구입니다. 공식 문서 기준으로는 수동 `memo`, `useMemo`, `useCallback` 필요를 줄이는 것이 목표입니다.

하지만 Compiler는 아래 문제를 자동으로 해결하지 않습니다.

- API 요청 상태를 어떻게 나눌지
- state를 어느 컴포넌트가 소유할지
- URL과 local state 중 무엇을 source of truth로 둘지
- 큰 목록을 어떻게 나눠 렌더링할지
- Suspense와 Error Boundary를 어디에 둘지
- 사용자 행동을 어떻게 테스트할지

따라서 Compiler는 나쁜 구조를 좋은 구조로 바꾸는 도구가 아니라, 이미 설명 가능한 구조를 더 효율적으로 실행하게 돕는 도구로 이해합니다.

## 읽으면서 생각할 질문

- 이 화면은 어느 단위로 loading fallback을 보여줘야 하는가?
- lazy loading이 필요한 화면 단위가 있는가?
- Compiler가 줄여주는 일은 무엇인가?
- 개발자가 여전히 설계해야 하는 일은 무엇인가?
- 성능 도구보다 데이터 흐름 정리가 먼저 필요한가?
