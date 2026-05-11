# Compiler 시대의 최적화 전략

React Compiler는 수동 memoization 필요를 줄이는 방향의 도구입니다. 하지만 Compiler가 있다고 해서 최적화 판단이 사라지는 것은 아닙니다. 오히려 어떤 최적화가 구조의 문제이고, 어떤 최적화가 컴파일러가 도와줄 수 있는 문제인지 구분해야 합니다.

## React Compiler가 하는 일

React Compiler는 빌드 시 컴포넌트와 Hook을 분석해 불필요한 재렌더링과 재계산을 자동으로 줄입니다.

내부적으로는 컴포넌트와 Hook에서 안전하게 memoization을 적용할 수 있는 코드를 찾아 변환합니다. 사람이 직접 `memo`, `useMemo`, `useCallback`을 작성하는 대신 Compiler가 이를 추론합니다.

**Compiler 적용 전:**

```tsx
function ProductList({ products, onSelect }: Props) {
  const filtered = products.filter((p) => p.available);

  return (
    <ul>
      {filtered.map((p) => (
        <ProductRow key={p.id} product={p} onSelect={onSelect} />
      ))}
    </ul>
  );
}
```

**Compiler 적용 후 (conceptual):**

Compiler가 `filtered` 계산과 `ProductRow` 렌더링에 필요한 memoization을 자동으로 삽입합니다. `products`와 `onSelect`가 바뀌지 않으면 재계산하지 않습니다.

## Compiler가 도와주는 영역

공식 문서 기준으로는 아래 수동 최적화의 필요를 줄이는 방향입니다.

- `memo`: props가 같을 때 컴포넌트 리렌더링을 건너뛰는 힌트
- `useMemo`: 비싼 계산 결과 캐시
- `useCallback`: 함수 identity 안정화

이 세 가지를 수동으로 관리하는 부담을 줄입니다.

## Compiler가 해결하지 않는 영역

Compiler는 아래 문제를 대신 설계하지 않습니다.

| 문제 | 여전히 개발자가 판단할 것 |
| --- | --- |
| state 위치가 너무 높음 | state를 어디에 둘지, 어디서 끊을지 |
| 서버 데이터 캐시 | query key, stale time, invalidation 전략 |
| 큰 목록 DOM 비용 | pagination, virtualization, 화면에 보이는 수 |
| Effect 오남용 | 계산/event handler/Effect 분리 판단 |
| Suspense 경계 | fallback을 어느 단위로 보여줄지 |
| 접근성 | label, focus 관리, keyboard interaction |
| 테스트 | 사용자 행동과 결과 검증 |
| 코드 분할 | lazy 로딩 경계, 청크 크기 |

Compiler는 좋은 구조를 더 효율적으로 실행하게 돕지만, 구조 자체를 설계하지는 않습니다.

## Compiler가 잘 작동하는 코드 조건

Compiler는 "순수한" 코드에서 잘 동작합니다. 렌더링 중 외부를 바꾸거나 Hook 규칙을 어기면 Compiler가 memoization을 적용하지 못하거나 건너뜁니다.

**Compiler 친화적:**

```tsx
// 같은 입력에 같은 출력, 부수효과 없음
function ProductCard({ product }: { product: Product }) {
  const label = product.available ? "재고 있음" : "품절";
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{label}</p>
    </div>
  );
}
```

**Compiler가 최적화를 건너뛸 수 있는 경우:**

```tsx
// 렌더링 중 외부 변경 — Compiler가 안전한 memoization을 적용하기 어려움
function BadCard({ product }: { product: Product }) {
  window.__lastProduct = product; // 부수효과

  return <div>{product.name}</div>;
}
```

규칙 요약:
- 컴포넌트와 Hook 이름을 규칙(`use`, 대문자)대로 짓습니다.
- 렌더링을 순수하게 유지합니다. (같은 입력 → 같은 출력)
- props와 state를 직접 변경하지 않습니다.
- Hook 규칙을 지킵니다. (최상위 레벨, 조건문/반복문 안 불가)
- 컴포넌트 책임을 작게 유지합니다.
- 외부 시스템 동기화는 Effect로 분리합니다.

Compiler 대응은 특별한 마법이 아니라 React 기본 원칙을 잘 지키는 일과 이어집니다.

## Compiler 사용 여부 확인

현재 프로젝트에 React Compiler가 적용되어 있는지 확인하는 방법입니다.

```bash
# babel plugin 방식
npm ls babel-plugin-react-compiler

# Vite 방식
npm ls vite-plugin-react-compiler
```

React DevTools 18.3+에서는 Compiler가 최적화한 컴포넌트에 ✨ 표시가 나타납니다.

## Compiler가 없는 환경에서도 지금 할 수 있는 것

Compiler가 아직 적용되지 않았더라도 구조 개선으로 얻는 성능이 더 클 때가 많습니다.

```tsx
// Before: keyword 변경 시 HeavyChart도 재렌더
function Page() {
  const [keyword, setKeyword] = useState("");
  return (
    <>
      <SearchInput value={keyword} onChange={setKeyword} />
      <HeavyChart />
    </>
  );
}

// After: children으로 분리 → keyword와 HeavyChart 렌더 분리
function Page() {
  return (
    <SearchSection>
      <HeavyChart />
    </SearchSection>
  );
}

function SearchSection({ children }: { children: React.ReactNode }) {
  const [keyword, setKeyword] = useState("");
  return (
    <>
      <SearchInput value={keyword} onChange={setKeyword} />
      {children}
    </>
  );
}
```

Compiler 없이도 구조 변경 하나로 `memo`와 같은 효과를 낼 수 있습니다.

## 수동 memoization을 남길 수 있는 경우

Compiler를 쓰더라도 수동 memoization이 escape hatch로 남을 수 있습니다.

- 특정 계산 비용을 명확히 캐시하고 싶다.
- 라이브러리 API가 참조 안정성을 요구한다.
- Compiler가 적용되지 않는 영역이 있다.
- 점진적으로 Compiler를 도입하는 중이다.
- 측정 결과 특정 컴포넌트 최적화가 필요하다.

이 경우에도 이유를 주석이나 문서로 남기는 편이 좋습니다.

```tsx
// 차트 라이브러리가 options 참조가 바뀔 때마다 인스턴스를 재생성함
const chartOptions = useMemo(() => {
  return buildChartOptions(metric, range);
}, [metric, range]);
```

이 `useMemo`가 필요한 이유가 "차트 라이브러리가 options identity 변화마다 instance를 다시 계산한다"라면 그 이유가 중요합니다.

## 팀 규칙 예시

```md
## 성능 최적화 규칙

- 기본적으로 memoization을 먼저 넣지 않는다.
- 느린 행동을 재현하고 Profiler 기록을 남긴다.
- state 위치와 컴포넌트 분리로 해결 가능한지 먼저 본다.
- 수동 memoization을 추가하면 이유를 PR에 적는다.
- Compiler 적용 여부와 적용 범위를 문서화한다.
- Compiler가 최적화한 컴포넌트를 수동 memo로 중복하지 않는다.
```

이런 규칙이 있으면 코드 스타일 논쟁을 줄일 수 있습니다.

## Compiler 도입 순서

Compiler를 기존 프로젝트에 점진적으로 도입하는 경우의 흐름입니다.

1. `eslint-plugin-react-compiler`를 먼저 적용해 규칙 위반을 찾습니다.
2. 위반 코드를 수정합니다. (순수하지 않은 렌더링, Hook 규칙 위반 등)
3. Compiler를 적용하고 빌드가 통과하는지 확인합니다.
4. DevTools로 최적화된 컴포넌트(✨)를 확인합니다.
5. Profiler로 실제 성능 변화를 측정합니다.

특정 컴포넌트에서만 opt-out하고 싶다면 `'use no memo'` 디렉티브를 사용할 수 있습니다.

```tsx
function BrokenByOptimization() {
  'use no memo'; // 이 컴포넌트는 Compiler 최적화 제외

  // 부수효과가 있는 코드...
}
```

## 읽으면서 생각할 질문

- 이 최적화는 Compiler가 도와줄 수 있는 종류인가?
- Compiler가 있어도 state 위치나 큰 목록 문제는 남아 있지 않은가?
- 수동 memoization을 남기는 이유가 측정 결과로 설명되는가?
- 렌더링 순수성과 Hook 규칙을 지키고 있는가?
- 팀 문서에 Compiler 적용 범위가 설명되어 있는가?
- Compiler 없이도 구조 변경으로 먼저 해결할 수 있는 문제는 아닌가?
- children prop으로 렌더링 범위를 분리해 memo 없이 최적화할 수 있는가?
