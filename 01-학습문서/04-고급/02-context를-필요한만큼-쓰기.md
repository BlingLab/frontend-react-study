# Context를 필요한 만큼 쓰기

Context는 부모에서 여러 단계 아래의 자식에게 값을 직접 전달하는 방법입니다. props를 중간 컴포넌트마다 거치지 않아도 됩니다.

하지만 Context가 만능은 아닙니다. 모든 공유 state를 Context에 넣으면 오히려 데이터 흐름이 보이지 않고, 불필요한 재렌더링이 생길 수 있습니다.

## Context 기본 사용법

**1단계: Context 만들기**

```tsx
import { createContext } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<Theme>("light");
```

`createContext`의 인자는 Provider 없이 사용될 때의 기본값입니다. TypeScript에서는 타입과 기본값을 함께 지정합니다.

**2단계: Provider로 값 제공하기**

```tsx
function App() {
  const [theme, setTheme] = useState<Theme>("light");

  return (
    <ThemeContext.Provider value={theme}>
      <Header />
      <Main />
      <Footer />
    </ThemeContext.Provider>
  );
}
```

Provider 아래의 모든 컴포넌트가 `ThemeContext` 값을 읽을 수 있습니다.

**3단계: useContext로 값 읽기**

```tsx
import { useContext } from "react";

function ThemeToggle() {
  const theme = useContext(ThemeContext);

  return <p>현재 테마: {theme}</p>;
}
```

`ThemeToggle`은 props를 통해 theme을 받지 않아도 됩니다.

## 커스텀 Hook으로 감싸기

`useContext`를 직접 쓰는 대신 커스텀 Hook으로 감싸면 두 가지 장점이 생깁니다.

- Provider 밖에서 사용하면 즉시 오류로 알 수 있습니다.
- 컴포넌트가 Context 구현 세부사항을 몰라도 됩니다.

```tsx
function useTheme() {
  const theme = useContext(ThemeContext);

  if (theme === undefined) {
    throw new Error("useTheme은 ThemeProvider 안에서 사용해야 합니다.");
  }

  return theme;
}
```

```tsx
function ThemeToggle() {
  const theme = useTheme();
  return <p>현재 테마: {theme}</p>;
}
```

## state와 dispatch를 분리하기

Context value가 바뀌면 그 값을 읽는 모든 컴포넌트가 다시 렌더링됩니다.

state와 변경 함수를 한 Context에 담으면, 변경 함수만 쓰는 컴포넌트도 state가 바뀔 때마다 다시 렌더링됩니다.

두 개로 나누면 읽기만 하는 컴포넌트와 변경만 하는 컴포넌트를 분리할 수 있습니다.

```tsx
type AuthUser = {
  id: string;
  name: string;
};

const AuthUserContext = createContext<AuthUser | null>(null);
const AuthDispatchContext = createContext<{
  login: (user: AuthUser) => void;
  logout: () => void;
} | null>(null);

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const dispatch = useMemo(
    () => ({
      login: (user: AuthUser) => setUser(user),
      logout: () => setUser(null),
    }),
    [],
  );

  return (
    <AuthUserContext.Provider value={user}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthUserContext.Provider>
  );
}
```

로그아웃 버튼은 `AuthUserContext`를 읽을 필요가 없습니다. `AuthDispatchContext`만 읽으면 됩니다.

```tsx
function LogoutButton() {
  const dispatch = useContext(AuthDispatchContext);

  return <button onClick={() => dispatch?.logout()}>로그아웃</button>;
}
```

`user` state가 바뀌어도 `dispatch` 참조는 바뀌지 않으므로, `LogoutButton`은 불필요하게 다시 렌더링되지 않습니다.

## Provider 범위를 좁게 잡기

Provider는 필요한 영역만 감쌉니다.

```tsx
// 좋지 않음: 앱 전체를 한 Context로 감쌈
function App() {
  return (
    <AllGlobalStateContext.Provider value={everything}>
      <Routes />
    </AllGlobalStateContext.Provider>
  );
}
```

```tsx
// 좋음: 필요한 영역만 Provider로 감쌈
function App() {
  return (
    <ThemeProvider>         {/* 앱 전체에 필요 */}
      <AuthProvider>        {/* 앱 전체에 필요 */}
        <Router>
          <Route path="/cart" element={
            <CartProvider>  {/* 장바구니 기능에만 필요 */}
              <CartPage />
            </CartProvider>
          } />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

장바구니 state는 장바구니 기능 안에만 있으면 됩니다. 앱 전체가 장바구니 state를 알 필요는 없습니다.

## Context가 어울리는 경우

- 테마, 언어, 사용자 설정처럼 앱 전체에서 읽는 값
- 로그인 사용자 정보
- 특정 기능 영역 안에서만 공유되는 state
- props drilling이 3단계 이상 깊어질 때

## Context를 쓰기 전에 먼저 볼 것

**1. props drilling이 실제로 문제인가?**

두 단계 아래까지 props를 내려보내는 것은 큰 문제가 아닙니다. 흐름이 보이기 때문입니다.

**2. Composition으로 해결할 수 있는가?**

중간 컴포넌트가 props를 "그냥 전달"만 하고 있다면, 완성된 조각을 children이나 slots으로 받는 방식으로 drilling을 피할 수 있습니다.

```tsx
// props drilling
function Page() {
  return <Layout user={user} notifications={notifications} />;
}

function Layout({ user, notifications }: Props) {
  return <Header user={user} notifications={notifications} />;
}

// composition으로 해결
function Page() {
  return (
    <Layout
      header={<UserMenu user={user} notifications={notifications} />}
    />
  );
}

function Layout({ header }: { header: ReactNode }) {
  return <header>{header}</header>;
}
```

`Layout`은 `user`와 `notifications`를 알 필요가 없습니다.

## Context를 피해야 할 경우

- 한 컴포넌트에서만 쓰는 값 → 그 컴포넌트의 local state
- 형제나 가까운 부모에서 공유되는 값 → state 끌어올리기
- 서버 데이터 캐시 → server state 도구(React Query 등)
- Context value가 너무 자주 바뀌는 값 → 별도 최적화 필요

## 읽으면서 생각할 질문

- 이 값을 정말 여러 단계 아래에서 읽는가?
- props로 전달하는 편이 흐름을 더 명확히 보여주지는 않는가?
- composition으로 drilling 없이 해결할 수 있지 않은가?
- Provider 범위가 필요한 것보다 너무 넓지 않은가?
- state와 변경 함수를 분리해서 불필요한 재렌더링을 줄일 수 있는가?
- Context value가 자주 바뀐다면 읽는 컴포넌트 수를 줄일 수 있는가?
