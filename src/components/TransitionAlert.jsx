import { CSSTransition } from 'react-transition-group';
import './TransitionAlert.css';

import { useRef } from 'react';

export default function TransitionAlert({ show, message, type = 'success', onClose, duration = 3500 }) {
  const nodeRef = useRef(null);
  return (
    <CSSTransition
      nodeRef={nodeRef}
      in={!!show}
      timeout={300}
      classNames="ta"
      unmountOnExit
      onExited={() => onClose?.()}
    >
      <div ref={nodeRef} className={`transition-alert ${type}`} role="status">
        <div className="alert-inner">
          <div className="alert-message">{message}</div>
          <button className="alert-close" onClick={() => onClose?.()} aria-label="Cerrar">×</button>
        </div>
      </div>
    </CSSTransition>
  );
}
