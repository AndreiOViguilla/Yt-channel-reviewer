import React, { useState, useEffect, useCallback } from 'react';
import ConnectScreen from './components/ConnectScreen';
import ProgressScreen from './components/ProgressScreen';
import ResultsScreen from './components/ResultsScreen';
import Toast from './components/Toast';
import { fetchYouTubeVideos, analyzeVideo } from './api';
import { DEMO_VIDEOS } from './constants';

function extractToken() {
  const hash = window.location.hash;
  if (!hash) return null;
  const params = new URLSearchParams(hash.slice(1));
  const token = params.get('access_token');
  if (token) {
    sessionStorage.setItem('yt_audit_token', token);
    window.history.replaceState(null, '', window.location.pathname);
  }
  return token || null;
}

const VIEWS = { CONNECT: 'connect', PROGRESS: 'progress', RESULTS: 'results' };

export default function App() {
  const [view, setView] = useState(VIEWS.CONNECT);
  const [channelName, setChannelName] = useState('');
  const [progressItems, setProgressItems] = useState([]);
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [results, setResults] = useState([]);
  const [toast, setToast] = useState({ message: '', type: '' });

  const showToast = useCallback((message, type = '') => setToast({ message, type }), []);
  const clearToast = useCallback(() => setToast({ message: '', type: '' }), []);

  const runAudit = useCallback(async (videos) => {
    setView(VIEWS.PROGRESS);
    setProgressCurrent(0);
    setProgressItems(videos.map((v) => ({ title: v.title, thumb: v.thumb, state: 'pending', statusText: 'Waiting…' })));
    const auditResults = [];
    for (let i = 0; i < videos.length; i++) {
      setProgressItems((prev) => prev.map((item, idx) => idx === i ? { ...item, state: 'active', statusText: 'Analyzing…' } : item));
      setProgressCurrent(i);
      try {
        const r = await analyzeVideo(videos[i]);
        auditResults.push({ ...r, _video: videos[i] });
        setProgressItems((prev) => prev.map((item, idx) => idx === i ? { ...item, state: 'done', statusText: r.issues.length ? `${r.issues.length} issue${r.issues.length !== 1 ? 's' : ''} found` : 'No issues ✓' } : item));
      } catch (e) {
        auditResults.push({ score: 0, issues: [{ severity: 'high', title: 'Analysis failed', description: e.message, offending_tags: [], suggested_tags: [] }], good_tags: [], summary: 'Could not analyze.', _video: videos[i] });
        setProgressItems((prev) => prev.map((item, idx) => idx === i ? { ...item, state: 'error', statusText: 'Failed' } : item));
      }
    }
    setProgressCurrent(videos.length);
    setResults(auditResults);
    setTimeout(() => setView(VIEWS.RESULTS), 700);
  }, []);

  const handleDemo = useCallback(async (count) => {
    setChannelName('Demo Channel');
    await runAudit(DEMO_VIDEOS.slice(0, count));
  }, [runAudit]);

  useEffect(() => {
    const token = extractToken();
    if (!token) return;
    const savedCount = parseInt(sessionStorage.getItem('yt_audit_pick') || '20', 10);
    setView(VIEWS.PROGRESS);
    (async () => {
      try {
        const { channelName: name, videos } = await fetchYouTubeVideos(token, savedCount);
        setChannelName(name);
        await runAudit(videos);
      } catch (e) {
        showToast('YouTube error: ' + e.message, 'err');
        setView(VIEWS.CONNECT);
      }
    })();
  }, [runAudit, showToast]);

  function startOAuth(count) {
    sessionStorage.setItem('yt_audit_pick', count);
  }

  function disconnect() {
    setChannelName('');
    setResults([]);
    setView(VIEWS.CONNECT);
  }

  const btn = { padding: '6px 14px', borderRadius: 8, fontFamily: 'var(--body)', fontSize: 12, fontWeight: 500, cursor: 'pointer', background: 'var(--s2)', border: '1px solid var(--border2)', color: 'var(--text)' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {view === VIEWS.CONNECT && (
        <ConnectScreen onConnect={(_, count) => startOAuth(count)} onDemo={handleDemo} />
      )}
      {view !== VIEWS.CONNECT && (
        <>
          <div style={{ height: 54, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16, flexShrink: 0, position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 22, height: 15, background: 'var(--yt)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '4px 0 4px 7px', borderColor: 'transparent transparent transparent white', marginLeft: 1 }} />
              </div>
              <span style={{ fontFamily: 'var(--display)', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>Metadata Auditor</span>
            </div>
            {channelName && <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>{channelName}</span>}
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              {view === VIEWS.RESULTS && <button style={btn} onClick={() => runAudit(results.map((r) => r._video))}>↺ Re-audit</button>}
              <button style={{ ...btn, color: 'var(--muted)' }} onClick={disconnect}>Disconnect</button>
            </div>
          </div>
          {view === VIEWS.PROGRESS && <ProgressScreen items={progressItems} current={progressCurrent} total={progressItems.length} />}
          {view === VIEWS.RESULTS && <ResultsScreen results={results} />}
        </>
      )}
      <Toast message={toast.message} type={toast.type} onDone={clearToast} />
    </div>
  );
}
