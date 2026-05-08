# Portal과 modal

Portal은 컴포넌트의 React 부모 관계는 유지하면서 DOM 렌더링 위치만 다른 곳으로 옮기는 기능입니다.

modal, tooltip, toast, dropdown처럼 화면 위에 떠야 하는 UI는 부모 DOM의 `overflow`, `z-index`, stacking context 영향을 받을 수 있습니다. 이때 portal을 사용하면 `document.body` 아래에 렌더링하면서도 React 이벤트와 context는 유지할 수 있습니다.

## 기본 사용법

```tsx
import { createPortal } from "react-dom";

function Modal({ children }: { children: ReactNode }) {
  return createPortal(
    <div className="modal-backdrop">
      <div className="modal-panel">{children}</div>
    </div>,
    document.body,
  );
}
```

사용하는 쪽은 일반 컴포넌트처럼 렌더링합니다.

```tsx
function Page() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>열기</button>
      {isOpen && (
        <Modal>
          <h2>설정</h2>
          <button onClick={() => setIsOpen(false)}>닫기</button>
        </Modal>
      )}
    </>
  );
}
```

DOM 위치는 `body` 아래로 이동하지만, `setIsOpen` 같은 React 상태 흐름은 그대로 동작합니다.

## Portal이 필요한 상황

- 부모에 `overflow: hidden`이 있어 modal이 잘린다.
- tooltip이 작은 카드 영역 밖으로 나가야 한다.
- toast를 앱 최상단에 띄워야 한다.
- z-index를 부모 layout과 분리하고 싶다.
- dialog가 페이지 구조보다 overlay layer에 속한다.

## 이벤트 전파는 React 트리를 따른다

Portal로 DOM 위치가 바뀌어도 React 이벤트는 React 컴포넌트 트리를 따라 전파됩니다.

```tsx
function Parent() {
  return (
    <div onClick={() => console.log("parent clicked")}>
      <Modal>
        <button>modal button</button>
      </Modal>
    </div>
  );
}
```

modal 버튼을 누르면 DOM 위치와 상관없이 부모의 React `onClick`이 실행될 수 있습니다. 필요하면 modal 내부에서 `event.stopPropagation()`을 사용합니다.

```tsx
function Modal({ children }: { children: ReactNode }) {
  return createPortal(
    <div className="modal-backdrop">
      <div
        className="modal-panel"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

## 배경 클릭으로 닫기

backdrop 클릭으로 modal을 닫을 때는 클릭 이벤트 대상이 backdrop 자체인지 확인합니다.

```tsx
function Modal({
  onClose,
  children,
}: {
  onClose: () => void;
  children: ReactNode;
}) {
  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    // modal-panel 내부를 클릭하면 닫지 않음
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-panel">
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

## Escape 키 닫기

```tsx
function Modal({ onClose, children }: Props) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="modal-backdrop">
      <div role="dialog" aria-modal="true" className="modal-panel">
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

키보드 이벤트 구독은 외부 시스템 연결이므로 Effect와 cleanup을 사용합니다.

## focus 이동과 복귀

모달이 열릴 때 focus가 모달 안으로 이동해야 합니다. 닫힐 때는 모달을 열었던 버튼으로 focus가 돌아가야 합니다.

```tsx
function Modal({ onClose, children }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // 모달 열릴 때 현재 focus된 요소 기억
    triggerRef.current = document.activeElement as HTMLElement;
    // 모달 안으로 focus 이동
    modalRef.current?.focus();

    return () => {
      // 모달 닫힐 때 원래 요소로 focus 복귀
      triggerRef.current?.focus();
    };
  }, []);

  return createPortal(
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}  // focus 받을 수 있도록
      className="modal-panel"
    >
      {children}
    </div>,
    document.body,
  );
}
```

## 스크롤 잠금

모달이 열려 있을 때 배경이 스크롤되지 않게 막을 수 있습니다.

```tsx
useEffect(() => {
  const originalOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = originalOverflow;
  };
}, []);
```

## 접근 가능한 modal 체크리스트

Portal은 DOM 위치 문제를 해결할 뿐, modal의 접근성과 interaction을 자동으로 완성하지 않습니다.

modal에는 보통 다음이 필요합니다.

- `role="dialog"` 속성
- `aria-modal="true"` 속성
- `aria-labelledby`로 modal 제목 연결
- 열릴 때 modal 안으로 focus 이동 (`autoFocus` 또는 `ref.focus()`)
- 닫힐 때 원래 버튼으로 focus 복귀
- Escape 키로 닫기
- 배경 스크롤 잠금
- modal 밖 클릭 시 닫을지 정책 결정

```tsx
function AccessibleModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement;
    dialogRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      prevFocus?.focus();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="modal-panel"
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>,
    document.body,
  );
}
```

간단한 직접 구현은 학습에 좋지만, 제품에서는 `@radix-ui/react-dialog` 같은 검증된 dialog 라이브러리를 쓰는 편이 안전할 수 있습니다. focus trap, ARIA 처리, 접근성 패턴을 이미 검증된 방식으로 제공합니다.

## 읽으면서 생각할 질문

- 이 UI가 부모 DOM 영역 밖으로 떠야 하는가?
- z-index나 overflow 문제 때문에 DOM 위치를 옮겨야 하는가?
- Portal을 써도 React context와 event 흐름이 유지된다는 점을 이해했는가?
- modal 접근성 요구사항을 별도로 처리하고 있는가?
- 직접 구현보다 검증된 dialog 라이브러리가 나은 상황은 아닌가?
- modal이 열렸을 때 focus가 안으로 이동하고, 닫혔을 때 원래 위치로 돌아오는가?
- Escape 키와 배경 클릭으로 닫을 수 있는가?
