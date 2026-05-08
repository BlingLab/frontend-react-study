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
    setText(nextText);

    startTransition(() => {
      setQuery(nextText);
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

## pending UI는 작게 시작하기

`isPending`이 true일 때 전체 화면을 가리는 loading을 보여주면 사용자가 화면이 멈춘 것처럼 느낄 수 있습니다. 가능한 한 바뀌는 영역 가까이에 pending 표시를 둡니다.

```tsx
<div aria-busy={isPending}>
  {isPending && <span>업데이트 중...</span>}
  <ResultList query={query} />
</div>
```

pending UI는 "기다리라"는 지시가 아니라 "요청한 변경이 처리 중"이라는 피드백입니다.

## async action과 순서 문제

비동기 작업을 transition 안에서 실행할 수 있지만, 여러 요청이 겹치면 응답 순서가 바뀔 수 있습니다.

```tsx
startTransition(async () => {
  const saved = await saveSettings(draft);
  setSettings(saved);
});
```

이 패턴을 쓸 때는 오래된 응답이 최신 상태를 덮어쓰지 않는지, 실패했을 때 어떤 UI를 보여줄지 같이 설계해야 합니다.

## useDeferredValue와 비교

| 도구 | 중심 생각 |
| --- | --- |
| `useTransition` | 이 state update는 덜 긴급하다고 표시 |
| `useDeferredValue` | 이 값의 반영은 조금 늦게 따라와도 됨 |

직접 state update를 감싸고 싶으면 transition, 이미 내려보내는 값을 늦추고 싶으면 deferred value가 어울립니다.

## 읽으면서 생각할 질문

- 어떤 업데이트가 즉시 반응해야 하는가?
- 어떤 업데이트는 늦게 따라와도 괜찮은가?
- pending UI가 사용자가 보는 변화와 가까운 위치에 있는가?
- input value update를 transition으로 밀어 넣고 있지는 않은가?
- async 작업의 응답 순서와 실패 처리를 고려했는가?
