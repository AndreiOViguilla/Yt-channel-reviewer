import React, { useEffect, useState } from 'react';

export default function Toast({ message, type, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = setTimeout(() => { setVisible(false); setTimeout(onDone, 300); }, 3000);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  const colors = {
    ok: { border: 'var(--green-border)', color: 'var(--green)' },
    err: { border: 'var(--red-border)', color: 'var(--red)' },
  };
  const style = colors[type] || {};

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20,
      background: 'var(--s3)',
      border: `1px solid ${style.border || 'var(--border2)'}`,
      color: style.color || 'var(--text)',
      padding: '10px 16px', borderRadius: 8,
      fontFamily: 'var(--mono)', fontSize: 13,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'all 0.2s',
      zIndex: 300, maxWidth: 280,
      pointerEvents: 'none',
    }}>
      {message}
    </div>
  );
}
