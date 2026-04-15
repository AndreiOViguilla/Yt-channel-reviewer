import React, { useState } from 'react';
import SetupModal from './SetupModal';

const COUNTS = [10, 20, 30, 50];

export default function ConnectScreen({ onConnect, onDemo }) {
  const [pick, setPick] = useState(20);
  const [showSetup, setShowSetup] = useState(false);

  function startOAuth() {
    const cid = localStorage.getItem('yt_audit_client_id') || '';
    if (!cid) { setShowSetup(true); return; }
    const params = new URLSearchParams({
      client_id: cid,
      redirect_uri: window.location.origin + window.location.pathname,
      response_type: 'token',
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      prompt: 'select_account',
    });
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' + params;
  }

  const s = {
    wrap: {
      position: 'fixed', inset: 0, background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, zIndex: 100,
    },
    inner: { width: 460, textAlign: 'center' },
    ytIcon: {
      width: 52, height: 36, background: 'var(--yt)', borderRadius: 8,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 28px',
    },
    ytArrow: {
      width: 0, height: 0, borderStyle: 'solid',
      borderWidth: '9px 0 9px 16px',
      borderColor: 'transparent transparent transparent white',
      marginLeft: 3,
    },
    title: {
      fontFamily: 'var(--display)', fontSize: 38, fontWeight: 800,
      letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 12,
    },
    titleAccent: { color: 'var(--yt)' },
    sub: {
      fontSize: 15, color: 'var(--muted)', lineHeight: 1.6,
      marginBottom: 36, maxWidth: 360, margin: '0 auto 36px',
    },
    pickerLabel: {
      fontSize: 12, color: 'var(--muted)', letterSpacing: '0.08em',
      textTransform: 'uppercase', marginBottom: 12,
      fontFamily: 'var(--mono)', display: 'block',
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginBottom: 28 },
    pickBtn: (selected) => ({
      padding: '14px 8px', borderRadius: 10,
      border: `1px solid ${selected ? 'var(--yt)' : 'var(--border2)'}`,
      background: selected ? 'rgba(255,0,0,0.08)' : 'var(--s2)',
      color: selected ? 'var(--yt)' : 'var(--muted)',
      fontFamily: 'var(--display)', fontSize: 22, fontWeight: 700,
      cursor: 'pointer', transition: 'all 0.15s', textAlign: 'center',
    }),
    pickSmall: (selected) => ({
      display: 'block', fontFamily: 'var(--body)', fontSize: 11,
      color: selected ? 'rgba(255,80,80,0.7)' : 'var(--muted)',
      marginTop: 2, fontWeight: 400,
    }),
    connectBtn: {
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 10, width: '100%', padding: '14px 24px',
      background: 'white', color: '#111', border: 'none', borderRadius: 10,
      fontFamily: 'var(--display)', fontSize: 15, fontWeight: 700,
      cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '-0.01em',
    },
    demoLink: {
      display: 'block', marginTop: 16, fontSize: 13,
      color: 'var(--muted)', cursor: 'pointer', background: 'none',
      border: 'none', fontFamily: 'var(--body)', width: '100%',
      transition: 'color 0.15s',
    },
    setupLink: {
      display: 'block', marginTop: 8, fontSize: 12, color: 'var(--dim)',
      cursor: 'pointer', background: 'none', border: 'none',
      fontFamily: 'var(--body)', width: '100%', transition: 'color 0.15s',
    },
  };

  return (
    <div style={s.wrap}>
      <div style={s.inner}>
        <div style={s.ytIcon}><div style={s.ytArrow} /></div>
        <div style={s.title}>
          Audit your<br /><span style={s.titleAccent}>real</span> YouTube videos.
        </div>
        <div style={s.sub}>
          Connect your channel, pick how many recent videos to check, and the AI will automatically flag every metadata mismatch.
        </div>

        <span style={s.pickerLabel}>How many recent videos to audit?</span>
        <div style={s.grid}>
          {COUNTS.map((n) => (
            <button key={n} style={s.pickBtn(pick === n)} onClick={() => { setPick(n); onConnect(null, n, true); }}>
              {n}
              <small style={s.pickSmall(pick === n)}>videos</small>
            </button>
          ))}
        </div>

        <button style={s.connectBtn} onClick={() => { onConnect(null, pick, false); startOAuth(); }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>
        <button style={s.demoLink} onClick={() => onDemo(pick)}>Try with demo data instead</button>
        <button style={s.setupLink} onClick={() => setShowSetup(true)}>Need to set up API credentials?</button>
      </div>

      {showSetup && <SetupModal onClose={() => setShowSetup(false)} />}
    </div>
  );
}
