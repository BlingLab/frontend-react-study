# Compiler 시대의 최적화 전략

React Compiler는 수동 memoization 필요를 줄이는 방향의 도구입니다. 하지만 Compiler가 있다고 해서 최적화 판단이 사라지는 것은 아닙니다. 오히려 어떤 최적화가 구조의 문제이고, 어떤 최적화가 컴파일러가 도와줄 수 있는 문제인지 구분해야 합니다.

## Compiler가 도와주는 영역

Compiler는 컴포넌트와 Hook을 분석해 불필요한 재계산과 리렌더링을 줄이는 데 초점을 둡니다.

공식 문서 기준으로는 아래 수동 최적화의 필요를 줄이는 방향입니다.

- `memo`
- `useMemo`
- `useCallback`

즉, 많은 경우 "props가 같으면 다시 계산하지 않아도 된다"는 판단을 사람이 매번 코드에 적지 않아도 되도록 돕습니다.

## Compiler가 해결하지 않는 영역

Compiler는 아래 문제를 대신 설계하지 않습니다.

| 문제 | 여전히 개발자가 판단할 것 |
| --- | --- |
| state 위치가 너무 높음 | state를 어디에 둘지 |
| 서버 데이터 캐시 | query key, stale, invalidation |
| 큰 목록 DOM 비용 | pagination, virtualization |
| Effect 오남용 | 계산/event/Effect 분리 |
| Suspense 경계 | fallback을 어느 단위로 보여줄지 |
| 접근성 | label, focus, keyboard interaction |
| 테스트 | 사용자 행동과 결과 검증 |

Compiler는 좋은 구조를 더 효율적으로 실행하게 돕지만, 구조 자체를 설계하지는 않습니다.

## 수동 memoization을 남길 수 있는 경우

Compiler를 쓰더라도 수동 memoization이 escape hatch로 남을 수 있습니다.

- 특정 계산 비용을 명확히 캐시하고 싶다.
- 라이브러리 API가 참조 안정성을 요구한다.
- Compiler가 적용되지 않는 영역이 있다.
- 점진적으로 Compiler를 도입하는 중이다.
- 측정 결과 특정 컴포넌트 최적화가 필요하다.

이 경우에도 이유를 주석이나 문서로 남기는 편이 좋습니다.

```tsx
const chartOptions = useMemo(() => {
  return buildChartOptions(metric, range);
}, [metric, range]);
```

이 코드가 필요한 이유가 "차트 라이브러리가 options identity 변화마다 instance를 다시 계산한다"라면 그 이유가 중요합니다.

## Compiler 친화적인 코드

Compiler가 잘 이해할 수 있는 코드는 대체로 사람이 읽기에도 좋습니다.

- 컴포넌트와 Hook 이름을 규칙대로 짓습니다.
- 렌더링을 순수하게 유지합니다.
- props와 state를 직접 변경하지 않습니다.
- Hook 규칙을 지킵니다.
- 컴포넌트 책임을 작게 유지합니다.
- 외부 시스템 동기화는 Effect로 분리합니다.

Compiler 대응은 특별한 마법이 아니라 React 기본 원칙을 잘 지키는 일과 이어집니다.

## 팀 규칙 예시

```md
## 성능 최적화 규칙

- 기본적으로 memoization을 먼저 넣지 않는다.
- 느린 행동을 재현하고 Profiler 기록을 남긴다.
- state 위치와 컴포넌트 분리로 해결 가능한지 먼저 본다.
- 수동 memoization을 추가하면 이유를 PR에 적는다.
- Compiler 적용 여부와 적용 범위를 문서화한다.
```

이런 규칙이 있으면 코드 스타일 논쟁을 줄일 수 있습니다.

## 읽으면서 생각할 질문

- 이 최적화는 Compiler가 도와줄 수 있는 종류인가?
- Compiler가 있어도 state 위치나 큰 목록 문제는 남아 있지 않은가?
- 수동 memoization을 남기는 이유가 측정 결과로 설명되는가?
- 렌더링 순수성과 Hook 규칙을 지키고 있는가?
- 팀 문서에 Compiler 적용 범위가 설명되어 있는가?
