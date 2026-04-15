import React, { useState } from 'react';

export default function SetupModal({ onClose }) {
  const [clientId, setClientId] = useState(localStorage.getItem('yt_audit_client_id') || '');
  const [saved, setSaved] = useState(false);

  function save() {
    if (!clientId.trim()) return;
    localStorage.setItem('yt_audit_client_id', clientId.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const s = {
    overlay: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 20, backdropFilter: 'blur(6px)',
      animation: 'fadeIn 0.15s ease',
    },
    box: {
      background: 'var(--s1)', border: '1px solid var(--border2)',
      borderRadius: 16, padding: 28, width: 500, maxWidth: '100%',
    },
    title: { fontFamily: 'var(--display)', fontSize: 20, fontWeight: 700, marginBottom: 6, letterSpacing: '-0.02em' },
    sub: { fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 },
    stepWrap: { marginBottom: 20 },
    step: { display: 'flex', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
    num: {
      width: 22, height: 22, borderRadius: '50%', background: 'var(--yt)',
      color: 'white', fontSize: 11, fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
    },
    stepText: { fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 },
    link: { color: 'var(--blue)', textDecoration: 'none' },
    code: {
      background: 'var(--s3)', border: '1px solid var(--border)',
      padding: '1px 5px', borderRadius: 3,
      fontFamily: 'var(--mono)', fontSize: 11, color: '#f8c8a0',
    },
    inputRow: { display: 'flex', gap: 8 },
    input: {
      flex: 1, background: 'var(--s2)', border: '1px solid var(--border2)',
      borderRadius: 8, padding: '10px 12px', color: 'var(--text)',
      fontFamily: 'var(--mono)', fontSize: 12, outline: 'none',
    },
    btn: {
      padding: '9px 18px', borderRadius: 8, fontFamily: 'var(--body)',
      fontSize: 13, fontWeight: 500, cursor: 'pointer',
      background: 'var(--yt)', border: '1px solid var(--yt)', color: 'white',
    },
    closeBtn: {
      marginTop: 16, display: 'flex', justifyContent: 'flex-end',
    },
    closeBtnInner: {
      padding: '6px 14px', borderRadius: 8, fontFamily: 'var(--body)',
      fontSize: 12, cursor: 'pointer',
      background: 'var(--s2)', border: '1px solid var(--border2)', color: 'var(--muted)',
    },
    saved: { fontSize: 12, color: 'var(--green)', marginTop: 8, fontFamily: 'var(--mono)' },
  };

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.box}>
        <div style={s.title}>Set up YouTube API</div>
        <div style={s.sub}>You need a Google Cloud OAuth Client ID to connect real YouTube data. Takes about 5 minutes.</div>
        <div style={s.stepWrap}>
          {[
            <>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" style={s.link}>console.cloud.google.com</a> → New Project → enable <strong>YouTube Data API v3</strong></>,
            <>APIs & Services → Credentials → Create OAuth Client ID → Web application → add your URL as redirect URI (e.g. <code style={s.code}>http://localhost:3000</code>)</>,
            <>Paste your Client ID below. Stored in your browser only — never sent anywhere.</>,
          ].map((text, i) => (
            <div key={i} style={s.step}>
              <div style={s.num}>{i + 1}</div>
              <div style={s.stepText}>{text}</div>
            </div>
          ))}
        </div>
        <div style={s.inputRow}>
          <input
            type="text" style={s.input}
            placeholder="xxxxxxx.apps.googleusercontent.com"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
          <button style={s.btn} onClick={save}>Save</button>
        </div>
        {saved && <div style={s.saved}>✓ Client ID saved</div>}
        <div style={s.closeBtn}>
          <button style={s.closeBtnInner} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
