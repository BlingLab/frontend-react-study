import { useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type DialogProps = {
  titleId: string;
  onClose: () => void;
};

function Dialog({ titleId, onClose }: DialogProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === backdropRef.current) {
      onClose();
    }
  }

  return createPortal(
    <div
      ref={backdropRef}
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
    >
      <div className="modal">
        <h3 id={titleId}>createPortal 모달</h3>
        <p>
          이 모달은 <code>document.body</code>에 직접 렌더링됩니다.
        </p>
        <p className="muted">
          부모 컴포넌트에 <code>overflow: hidden</code>이나{" "}
          <code>z-index</code> 제약이 있어도 모달은 영향을 받지 않습니다.
          배경을 클릭하거나 닫기 버튼으로 닫습니다.
        </p>
        <div className="button-row">
          <button type="button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ConstrainedBox() {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  return (
    <div className="card" style={{ overflow: "hidden", position: "relative" }}>
      <h3>overflow: hidden 컨테이너</h3>
      <p className="muted">
        일반 모달이라면 이 영역에 잘릴 수 있습니다. Portal을 사용하면
        document.body에 렌더링되므로 잘리지 않습니다.
      </p>
      <button type="button" onClick={() => setIsOpen(true)}>
        모달 열기
      </button>
      {isOpen && (
        <Dialog titleId={titleId} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}

function NestedBox() {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  return (
    <div className="card">
      <h3>깊게 중첩된 컴포넌트</h3>
      <p className="muted">
        컴포넌트가 깊이 중첩되어 있어도 Portal은 항상 body에 렌더링됩니다.
        React 트리 구조와 실제 DOM 위치는 다릅니다.
      </p>
      <button type="button" onClick={() => setIsOpen(true)}>
        모달 열기
      </button>
      {isOpen && (
        <Dialog titleId={titleId} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}

export function PortalModalExample() {
  return (
    <section className="example-panel">
      <div className="example-heading">
        <p className="eyebrow">createPortal · Modal</p>
        <h2>컴포넌트 트리 바깥에 렌더링하기</h2>
        <p className="muted">
          <code>createPortal</code>은 JSX를 React 트리의 다른 DOM 노드에
          렌더링합니다. 모달, 툴팁처럼 CSS 컨텍스트 바깥에 띄워야 할 때
          사용합니다.
        </p>
      </div>

      <div className="card-grid">
        <ConstrainedBox />
        <NestedBox />
      </div>
    </section>
  );
}
