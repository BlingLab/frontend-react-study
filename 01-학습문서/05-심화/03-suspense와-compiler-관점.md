# Suspense와 Compiler 관점

Suspense는 loading 상태를 컴포넌트 트리 안에서 선언적으로 다루기 위한 React의 방향입니다.

처음 학습할 때는 Suspense API를 깊게 외우기보다, "어디에서 기다리는 UI를 보여줄 것인가"라는 관점을 잡습니다.

React Compiler는 수동 memoization 필요를 줄이는 방향으로 발전하고 있습니다. 하지만 Compiler가 있다고 해서 상태 위치, 컴포넌트 책임, Effect 사용 판단이 사라지지는 않습니다.

좋은 구조는 도구가 더 잘 도와줄 수 있게 만듭니다.

## 읽으면서 생각할 질문

- 이 화면은 어느 단위로 loading fallback을 보여줘야 하는가?
- lazy loading이 필요한 화면 단위가 있는가?
- Compiler가 줄여주는 일은 무엇인가?
- 개발자가 여전히 설계해야 하는 일은 무엇인가?
- 성능 도구보다 데이터 흐름 정리가 먼저 필요한가?
