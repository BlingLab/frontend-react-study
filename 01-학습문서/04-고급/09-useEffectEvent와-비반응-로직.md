# useEffectEvent와 비반응 로직

`useEffectEvent`는 Effect 안에서 "최신 props/state는 읽고 싶지만, 그 값이 바뀔 때마다 Effect를 다시 동기화하고 싶지는 않은" 로직을 분리하는 Hook입니다.

Effect는 기본적으로 reactive합니다. Effect 안에서 읽는 props와 state는 dependency에 들어가야 하고, dependency가 바뀌면 Effect는 다시 동기화됩니다. 하지만 Effect 안의 모든 코드가 같은 이유로 다시 실행되어야 하는 것은 아닙니다.

## 문제 상황

채팅방에 연결하고, 연결되면 현재 theme로 알림을 보여준다고 가정합니다.

```tsx
function ChatRoom({ roomId, theme }: Props) {
  useEffect(() => {
    const connection = createConnection(roomId);

    connection.on("connected", () => {
      showNotification("연결되었습니다.", theme);
    });

    connection.connect();
    return () => connection.disconnect();
  }, [roomId, theme]);
}
```

이 코드는 dependency 관점에서는 맞습니다. Effect 안에서 `roomId`와 `theme`를 읽으므로 둘 다 dependency에 있습니다.

하지만 `theme`가 바뀔 때마다 채팅 연결을 끊고 다시 연결하는 것은 이상합니다. 연결은 `roomId`가 바뀔 때만 다시 해야 하고, 알림은 실행되는 순간의 최신 `theme`만 읽으면 됩니다.

## useEffectEvent로 분리하기

```tsx
function ChatRoom({ roomId, theme }: Props) {
  const onConnected = useEffectEvent(() => {
    showNotification("연결되었습니다.", theme);
  });

  useEffect(() => {
    const connection = createConnection(roomId);

    connection.on("connected", () => {
      onConnected();
    });

    connection.connect();
    return () => connection.disconnect();
  }, [roomId]);
}
```

`onConnected`는 Effect Event입니다. Effect 안에서 호출되지만, 그 내부 로직은 dependency를 늘려 Effect를 다시 동기화하지 않습니다. 동시에 실행 시점의 최신 `theme`를 읽을 수 있습니다.

## event handler, Effect, Effect Event 비교

| 구분 | 언제 실행되는가 | reactive한가 |
| --- | --- | --- |
| event handler | 사용자가 클릭/입력/submit할 때 | 아니오 |
| Effect | 렌더링 후 dependency가 바뀔 때 | 예 |
| Effect Event | Effect 안에서 개발자가 호출할 때 | 내부 로직은 비반응 |

Effect Event는 일반 event handler를 대체하지 않습니다. 사용자 클릭에 반응하는 코드는 event handler에 둡니다. Effect Event는 Effect 내부 로직 중 일부만 비반응으로 분리할 때 씁니다.

## dependency를 숨기는 도구가 아니다

`useEffectEvent`는 linter를 피하기 위한 도구가 아닙니다. 먼저 Effect가 정말 필요한지, dependency가 맞는지 확인해야 합니다.

좋지 않은 접근:

```tsx
const run = useEffectEvent(() => {
  fetchData(userId, token);
});

useEffect(() => {
  run();
}, []);
```

이 코드는 `userId`나 `token`이 바뀌어도 다시 요청하지 않습니다. 요청 조건이 바뀌면 다시 동기화해야 하는 상황이라면 dependency를 숨기면 안 됩니다.

좋은 기준:

- 외부 시스템 연결 조건은 dependency에 남긴다.
- 연결 중 발생하는 callback에서 최신 값만 읽어야 하는 로직을 Effect Event로 뺀다.
- Effect Event는 Effect나 다른 Effect Event 안에서 호출한다.

## 자주 나오는 사례

### 타이머에서 최신 값 읽기

```tsx
function TimerLogger({ value }: { value: string }) {
  const logLatestValue = useEffectEvent(() => {
    console.log(value);
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      logLatestValue();
    }, 1000);

    return () => window.clearInterval(id);
  }, []);
}
```

타이머 자체는 한 번만 설정하고, 로그는 최신 값을 읽습니다.

### 이벤트 리스너에서 최신 값 읽기

```tsx
function Page({ theme }: { theme: string }) {
  const handleResize = useEffectEvent(() => {
    reportResize({ theme });
  });

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
}
```

이런 패턴은 "이벤트 구독은 유지하고 callback 안에서 최신 값을 읽는다"는 요구가 있을 때만 사용합니다.

## 언제 아직 쓰지 않아도 되나

- Effect 자체를 제거할 수 있다.
- event handler로 옮기면 된다.
- dependency가 바뀔 때 다시 동기화하는 것이 맞다.
- 프로젝트가 아직 `useEffectEvent`를 안정적으로 사용할 React 버전과 lint 설정을 갖추지 않았다.

대부분의 중급 Effect 문제는 `useEffectEvent` 전에 구조 조정으로 해결됩니다. 이 Hook은 고급 단계에서 dependency와 비반응 로직을 더 세밀하게 분리할 때 다룹니다.

## 읽으면서 생각할 질문

- 이 로직은 Effect 안에서 실행되어야 하는가?
- 어떤 값이 바뀔 때 외부 시스템을 다시 동기화해야 하는가?
- 최신 값은 읽어야 하지만 재연결은 피해야 하는 코드가 있는가?
- dependency를 숨기려고 `useEffectEvent`를 쓰고 있지는 않은가?
- event handler, Effect, Effect Event의 실행 조건을 구분할 수 있는가?
