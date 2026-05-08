# Transition과 pending UI

`useTransition`은 일부 state update를 transition으로 표시해서, 긴급한 업데이트와 덜 긴급한 업데이트를 나누는 Hook입니다.

예를 들어 input 입력은 즉시 반응해야 하지만, 탭 전환으로 무거운 화면을 렌더링하는 일은 잠깐 늦어도 괜찮습니다.

## 기본 사용법

```tsx
function TabContainer() {
  const [tab, setTab] = useState("overview");
  const [isPending, startTransition] = useTransition();

  function selectTab(nextTab: string) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <>
      <TabButtons selectedTab={tab} onSelect={selectTab} />
      {isPending && <p>화면을 준비하는 중...</p>}
      <TabPanel tab={tab} />
    </>
  );
}
```

`startTransition` 안의 update는 긴급하지 않은 update로 표시됩니다. React는 더 급한 사용자 입력을 먼저 처리할 수 있습니다.

## startTransition을 Hook 없이 쓰기

컴포넌트 밖이나 Hook이 없는 곳에서 transition을 시작해야 할 때는 `react`에서 직접 가져옵니다.

```tsx
import { startTransition } from "react";

// event handler 밖, 예를 들어 라우터 내부 로직
function navigate(nextPath: string) {
  startTransition(() => {
    setCurrentPath(nextPath);
  });
}
```

`useTransition`은 `isPending`이 필요할 때 사용하고, `isPending`이 필요 없다면 `startTransition`만 import해서 쓸 수 있습니다.

## transition이 어울리는 경우

- 탭 전환 후 무거운 화면을 렌더링한다.
- 라우트 이동 중 pending 표시가 필요하다.
- 검색 결과 화면 전체를 바꾸되 입력 반응성은 유지하고 싶다.
- Suspense fallback을 너무 갑자기 보여주지 않고 싶다.

## input value update는 transition에 넣지 않는다

controlled input의 `value`를 바꾸는 update는 즉시 처리되어야 합니다.

```tsx
function SearchPage() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextText = event.target.value;
    setText(nextText); // 즉시 업데이트: input에 직접 연결

    startTransition(() => {
      setQuery(nextText); // 느린 결과만 transition
    });
  }

  return (
    <>
      <input value={text} onChange={handleChange} />
      {isPending && <p>결과 업데이트 중...</p>}
      <SearchResults query={query} />
    </>
  );
}
```

input에 직접 연결된 `text`는 즉시 업데이트하고, 느린 결과에 연결된 `query`만 transition으로 넘깁니다.

## Suspense와 함께 쓰기

Suspense를 쓰는 컴포넌트를 transition으로 전환하면, Suspense fallback이 갑자기 나타나는 것을 막을 수 있습니다. 이전 콘텐츠가 `isPending` 동안 유지됩니다.

```tsx
function App() {
  const [tab, setTab] = useState("home");
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <nav>
        {["home", "about", "contact"].map((t) => (
          <button
            key={t}
            onClick={() => startTransition(() => setTab(t))}
            aria-selected={tab === t}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* isPending 동안 이전 탭이 흐리게 유지됨, Suspense fallback 없이 */}
      <div style={{ opacity: isPending ? 0.6 : 1 }}>
        <Suspense fallback={<p>불러오는 중...</p>}>
          <TabContent tab={tab} />
        </Suspense>
      </div>
    </>
  );
}
```

transition 없이 탭을 바꾸면 Suspense fallback(스피너)이 순간 깜빡입니다. transition을 쓰면 새 탭이 준비될 때까지 이전 내용이 자연스럽게 유지됩니다.

## pending UI는 작게 시작하기

`isPending`이 true일 때 전체 화면을 가리는 loading을 보여주면 사용자가 화면이 멈춘 것처럼 느낄 수 있습니다. 가능한 한 바뀌는 영역 가까이에 pending 표시를 둡니다.

```tsx
{/* 전체 화면 로딩: 피하기 */}
{isPending && <FullScreenSpinner />}

{/* 변경 영역 근처: 권장 */}
<div aria-busy={isPending}>
  {isPending && <span className="spinner-small" aria-label="업데이트 중" />}
  <ResultList query={query} />
</div>
```

`aria-busy`는 스크린리더에게 해당 영역이 업데이트 중임을 알립니다.

pending UI는 "기다리라"는 지시가 아니라 "요청한 변경이 처리 중"이라는 피드백입니다.

## 탭 버튼에 pending 표시하기

어떤 탭이 로딩 중인지 버튼 자체에 표시하는 패턴입니다.

```tsx
function TabButton({
  label,
  isSelected,
  isPending,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  isPending: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-selected={isSelected}
      style={{
        fontWeight: isSelected ? "bold" : "normal",
        opacity: isPending ? 0.7 : 1,
      }}
    >
      {label}
      {isPending && <span> (로딩 중)</span>}
    </button>
  );
}
```

## async action과 순서 문제

비동기 작업을 transition 안에서 실행할 수 있지만, 여러 요청이 겹치면 응답 순서가 바뀔 수 있습니다.

```tsx
startTransition(async () => {
  const saved = await saveSettings(draft);
  setSettings(saved);
});
```

이 패턴을 쓸 때는 오래된 응답이 최신 상태를 덮어쓰지 않는지, 실패했을 때 어떤 UI를 보여줄지 같이 설계해야 합니다.

여러 transition이 연속으로 실행될 때 React는 가장 마지막 transition만 반영합니다. 하지만 비동기 처리는 Race condition이 발생할 수 있으므로 필요하다면 `AbortController`나 `ignore` 플래그를 사용합니다.

## setTimeout과의 차이

`setTimeout`으로 업데이트를 지연하는 방식과의 차이가 있습니다.

```tsx
// setTimeout: 고정 시간 후 업데이트
setTimeout(() => {
  setTab(nextTab);
}, 100);

// startTransition: 더 급한 업데이트가 있으면 자동으로 양보
startTransition(() => {
  setTab(nextTab);
});
```

`setTimeout`은 무조건 지연하고, `startTransition`은 리소스가 있으면 즉시 처리합니다. 저사양 기기에서는 `startTransition`이 더 오래 기다리고, 빠른 기기에서는 즉시 처리됩니다.

## useDeferredValue와 비교

| 도구 | 중심 생각 |
| --- | --- |
| `useTransition` | 이 state update는 덜 긴급하다고 표시, `isPending` 제공 |
| `useDeferredValue` | 이 값의 반영은 조금 늦게 따라와도 됨 |

직접 state update를 감싸고 싶으면 transition, 이미 내려보내는 값을 늦추고 싶으면 deferred value가 어울립니다.

자신이 `setState`를 직접 호출하는 쪽이면 `useTransition`, 값을 받아서 쓰는 쪽이면 `useDeferredValue`가 자연스럽습니다.

## 읽으면서 생각할 질문

- 어떤 업데이트가 즉시 반응해야 하는가?
- 어떤 업데이트는 늦게 따라와도 괜찮은가?
- pending UI가 사용자가 보는 변화와 가까운 위치에 있는가?
- input value update를 transition으로 밀어 넣고 있지는 않은가?
- async 작업의 응답 순서와 실패 처리를 고려했는가?
- Suspense fallback이 갑자기 나타나는 문제를 transition으로 해결할 수 있는가?
