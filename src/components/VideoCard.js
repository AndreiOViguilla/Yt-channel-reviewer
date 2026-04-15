import React, { useState } from 'react';
import ScoreRing from './ScoreRing';

function IssueBlock({ issue, onAddTag, onRemoveTag, onReplaceTag }) {
  const sev = issue.severity === 'high' ? 'high' : issue.severity === 'medium' ? 'med' : 'low';
  const icon = issue.severity === 'high' ? '⚠' : issue.severity === 'medium' ? '◉' : 'ℹ';
  const bg = sev === 'high' ? 'var(--red-bg)' : sev === 'med' ? 'var(--amber-bg)' : 'var(--blue-bg)';
  const border = sev === 'high' ? 'var(--red-border)' : sev === 'med' ? 'var(--amber-border)' : 'var(--blue-border)';
  const [replaceTarget, setReplaceTarget] = useState(null);
  const [replaceValue, setReplaceValue] = useState('');

  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 8, background: bg, border: `1px solid ${border}`, alignItems: 'flex-start' }}>
      <div style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{issue.title}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.65 }}>{issue.description}</div>
        {(issue.offending_tags?.length > 0 || issue.suggested_tags?.length > 0) && (
          <div style={{ marginTop: 10 }}>
            {issue.offending_tags?.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--mono)', display: 'block', marginBottom: 5 }}>FLAGGED TAGS — remove or replace:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {issue.offending_tags.map((t, i) => (
                    <div key={i}>
                      {replaceTarget === t ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <input autoFocus value={replaceValue}
                            onChange={e => setReplaceValue(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && replaceValue.trim()) { onReplaceTag(t, replaceValue.trim()); setReplaceTarget(null); setReplaceValue(''); }
                              if (e.key === 'Escape') { setReplaceTarget(null); setReplaceValue(''); }
                            }}
                            placeholder="new tag..."
                            style={{ background: 'var(--s2)', border: '1px solid var(--border2)', borderRadius: 4, padding: '3px 8px', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: 11, outline: 'none', width: 110 }} />
                          <button onClick={() => { if (replaceValue.trim()) { onReplaceTag(t, replaceValue.trim()); setReplaceTarget(null); setReplaceValue(''); } }}
                            style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid var(--green-border)', background: 'var(--green-bg)', color: 'var(--green)', fontSize: 11, cursor: 'pointer' }}>✓</button>
                          <button onClick={() => { setReplaceTarget(null); setReplaceValue(''); }}
                            style={{ padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted)', fontSize: 11, cursor: 'pointer' }}>✕</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,59,59,0.3)' }}>
                          <span style={{ padding: '3px 8px', fontFamily: 'var(--mono)', fontSize: 11, background: 'rgba(255,59,59,0.12)', color: '#ff8080' }}>{t}</span>
                          <button onClick={() => onRemoveTag(t)} title="Remove" style={{ padding: '3px 7px', background: 'rgba(255,59,59,0.2)', border: 'none', borderLeft: '1px solid rgba(255,59,59,0.3)', color: '#ff8080', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>−</button>
                          <button onClick={() => { setReplaceTarget(t); setReplaceValue(''); }} title="Replace" style={{ padding: '3px 7px', background: 'rgba(255,59,59,0.2)', border: 'none', borderLeft: '1px solid rgba(255,59,59,0.3)', color: '#ff8080', cursor: 'pointer', fontSize: 11 }}>↻</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {issue.suggested_tags?.length > 0 && (
              <div>
                <span style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--mono)', display: 'block', marginBottom: 5 }}>SUGGESTED TAGS — click + to add:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {issue.suggested_tags.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(52,211,153,0.25)' }}>
                      <span style={{ padding: '3px 8px', fontFamily: 'var(--mono)', fontSize: 11, background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>{t}</span>
                      <button onClick={() => onAddTag(t)} title="Add" style={{ padding: '3px 8px', background: 'rgba(52,211,153,0.15)', border: 'none', borderLeft: '1px solid rgba(52,211,153,0.25)', color: '#34d399', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>+</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const fieldStyle = {
  width: '100%', background: 'var(--s3)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '8px 10px', color: 'var(--text)',
  fontFamily: 'var(--body)', fontSize: 13, outline: 'none',
  transition: 'border-color 0.15s', lineHeight: 1.5,
};

export default function VideoCard({ result }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(result._video.title || '');
  const [description, setDescription] = useState(result._video.description || '');
  const [tags, setTags] = useState(result._video.tags || []);
  const [pushing, setPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');

  const { score, issues, good_tags, summary, _video: v } = result;
  const hasHigh = issues.some((i) => i.severity === 'high');
  const hasMed = !hasHigh && issues.some((i) => i.severity === 'medium');
  const clean = issues.length === 0;
  const accentColor = hasHigh ? 'var(--red)' : hasMed ? 'var(--amber)' : clean ? 'var(--green)' : 'var(--border)';

  const titleDirty = title !== result._video.title;
  const descDirty = description !== result._video.description;
  const tagsDirty = JSON.stringify(tags) !== JSON.stringify(result._video.tags || []);
  const anyDirty = titleDirty || descDirty || tagsDirty;

  function addTag(tag) { if (!tags.includes(tag)) setTags(prev => [...prev, tag]); }
  function removeTag(tag) { setTags(prev => prev.filter(t => t !== tag)); }
  function replaceTag(oldTag, newTag) { setTags(prev => prev.map(t => t === oldTag ? newTag : t)); }

  function copyTags() {
    navigator.clipboard.writeText(tags.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function resetAll() {
    setTitle(result._video.title || '');
    setDescription(result._video.description || '');
    setTags(result._video.tags || []);
    setPushStatus('');
  }

  async function pushToYouTube() {
    const token = sessionStorage.getItem('yt_audit_token');
    if (!token) { setPushStatus('No access token — reconnect YouTube'); return; }
    setPushing(true);
    setPushStatus('');
    try {
      const res = await fetch('http://localhost:3001/api/update-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: v.id, title, description, tags, accessToken: token }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Update failed');
      }
      setPushStatus('success');
    } catch (e) {
      setPushStatus('Error: ' + e.message);
    }
    setPushing(false);
  }

  async function scanLinks() {
    setScanning(true);
    setScanResult(null);
    setScanError('');
    try {
      const res = await fetch('http://localhost:3001/api/scan-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: v.description, title: v.title }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Scan failed');
      }
      const data = await res.json();
      setScanResult(data);
    } catch (e) {
      setScanError(e.message);
    }
    setScanning(false);
  }

  return (
    <div style={{
      background: 'var(--s1)', borderRadius: 12, marginBottom: 14, overflow: 'hidden',
      border: '1px solid var(--border)', borderLeft: `3px solid ${accentColor}`,
      transition: 'border-color 0.15s', animation: 'slideUp 0.25s ease',
    }}>
      {/* Header */}
      <div onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer', userSelect: 'none' }}>
        {v.thumb
          ? <img style={{ width: 80, height: 45, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} src={v.thumb} alt="" loading="lazy" />
          : <div style={{ width: 80, height: 45, borderRadius: 6, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)', flexShrink: 0, fontSize: 20 }}>▶</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--mono)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>{issues.length} issue{issues.length !== 1 ? 's' : ''}</span>
            <span>{tags.length} tags</span>
            {anyDirty && <span style={{ color: 'var(--amber)' }}>✎ edited</span>}
            <span style={{ color: score >= 80 ? 'var(--green)' : score >= 60 ? 'var(--amber)' : 'var(--red)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>{summary}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <ScoreRing score={score} />
          <span style={{ color: 'var(--dim)', fontSize: 12, display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 18px', animation: 'slideUp 0.15s ease' }}>

          {/* Issues */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {issues.length === 0
              ? <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'var(--green-bg)', border: '1px solid var(--green-border)', borderRadius: 8, fontSize: 13, color: 'var(--green)' }}>✓ All metadata is consistent — no issues found.</div>
              : issues.map((iss, i) => <IssueBlock key={i} issue={iss} onAddTag={addTag} onRemoveTag={removeTag} onReplaceTag={replaceTag} />)}
          </div>

          {/* Editable title */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              Title {titleDirty && <span style={{ color: 'var(--amber)' }}>(edited)</span>}
            </div>
            <input value={title} onChange={e => setTitle(e.target.value)} onClick={e => e.stopPropagation()}
              style={{ ...fieldStyle }}
              onFocus={e => e.target.style.borderColor = 'var(--amber)'}
              onBlur={e => e.target.style.borderColor = titleDirty ? 'var(--amber-border)' : 'var(--border)'} />
            <div style={{ fontSize: 11, color: title.length > 100 ? 'var(--red)' : 'var(--dim)', fontFamily: 'var(--mono)', marginTop: 4, textAlign: 'right' }}>{title.length}/100</div>
          </div>

          {/* Editable description */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
              Description {descDirty && <span style={{ color: 'var(--amber)' }}>(edited)</span>}
            </div>
            <textarea value={description} onChange={e => setDescription(e.target.value)} onClick={e => e.stopPropagation()}
              rows={4} style={{ ...fieldStyle, resize: 'vertical' }}
              onFocus={e => e.target.style.borderColor = 'var(--amber)'}
              onBlur={e => e.target.style.borderColor = descDirty ? 'var(--amber-border)' : 'var(--border)'} />
            <div style={{ fontSize: 11, color: description.length > 5000 ? 'var(--red)' : 'var(--dim)', fontFamily: 'var(--mono)', marginTop: 4, textAlign: 'right' }}>{description.length}/5000</div>
          </div>

          {/* Scan links */}
          <div style={{ marginBottom: 12, padding: '12px 14px', background: 'var(--s2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                AI tag suggestions from links
              </span>
              <button onClick={scanLinks} disabled={scanning}
                style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid var(--border2)', background: scanning ? 'var(--s3)' : 'transparent', color: scanning ? 'var(--muted)' : 'var(--text)', fontSize: 11, cursor: scanning ? 'not-allowed' : 'pointer', fontFamily: 'var(--mono)', opacity: scanning ? 0.6 : 1 }}>
                {scanning ? '⟳ Scanning…' : '⌕ Scan links'}
              </button>
            </div>
            {scanError && <div style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--mono)', marginTop: 8 }}>{scanError}</div>}
            {scanResult && (
              <div style={{ marginTop: 10 }}>
                {scanResult.reasoning && (
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 8, lineHeight: 1.6 }}>{scanResult.reasoning}</div>
                )}
                <div style={{ fontSize: 10, color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Suggested — click + to add:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {scanResult.suggested_tags?.filter(t => !tags.includes(t)).map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(52,211,153,0.25)' }}>
                      <span style={{ padding: '3px 8px', fontFamily: 'var(--mono)', fontSize: 11, background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>{t}</span>
                      <button onClick={() => addTag(t)}
                        style={{ padding: '3px 8px', background: 'rgba(52,211,153,0.15)', border: 'none', borderLeft: '1px solid rgba(52,211,153,0.25)', color: '#34d399', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>+</button>
                    </div>
                  ))}
                  {scanResult.suggested_tags?.every(t => tags.includes(t)) && (
                    <span style={{ fontSize: 12, color: 'var(--green)', fontFamily: 'var(--mono)' }}>✓ All suggested tags already added</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Tags panel */}
          <div style={{ padding: '12px 14px', background: 'var(--s2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                Tags {tagsDirty && <span style={{ color: 'var(--amber)' }}>(edited)</span>}
              </span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {anyDirty && (
                  <button onClick={resetAll}
                    style={{ padding: '3px 10px', borderRadius: 4, border: '1px solid var(--border2)', background: 'transparent', color: 'var(--muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--mono)' }}>Reset all</button>
                )}
                <button onClick={copyTags}
                  style={{ padding: '3px 10px', borderRadius: 4, border: `1px solid ${copied ? 'var(--green-border)' : 'var(--border2)'}`, background: copied ? 'var(--green-bg)' : 'transparent', color: copied ? 'var(--green)' : 'var(--muted)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--mono)' }}>
                  {copied ? '✓ Copied!' : '⎘ Copy tags'}
                </button>
                {anyDirty && (
                  <button onClick={pushToYouTube} disabled={pushing}
                    style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, cursor: pushing ? 'not-allowed' : 'pointer', fontFamily: 'var(--mono)', opacity: pushing ? 0.6 : 1,
                      border: `1px solid ${pushStatus === 'success' ? 'var(--green-border)' : 'var(--red-border)'}`,
                      background: pushStatus === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: pushStatus === 'success' ? 'var(--green)' : 'var(--red)' }}>
                    {pushing ? 'Pushing…' : pushStatus === 'success' ? '✓ Saved to YouTube!' : '↑ Push to YouTube'}
                  </button>
                )}
              </div>
            </div>
            {pushStatus && pushStatus !== 'success' && (
              <div style={{ fontSize: 11, color: 'var(--red)', fontFamily: 'var(--mono)', marginBottom: 8 }}>{pushStatus}</div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {tags.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', borderRadius: 4, overflow: 'hidden', border: '1px solid var(--border2)' }}>
                  <span style={{ padding: '3px 8px', fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--s3)', color: 'var(--text)' }}>{t}</span>
                  <button onClick={() => removeTag(t)} title="Remove" style={{ padding: '3px 6px', background: 'var(--s3)', border: 'none', borderLeft: '1px solid var(--border)', color: 'var(--dim)', cursor: 'pointer', fontSize: 11 }}>×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Good tags */}
          {good_tags?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Well-matched tags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {good_tags.slice(0, 6).map((t, i) => (
                  <span key={i} style={{ padding: '2px 8px', borderRadius: 3, fontFamily: 'var(--mono)', fontSize: 11, background: 'var(--s3)', color: 'var(--muted)', border: '1px solid var(--border)' }}>{t}</span>
                ))}
              </div>
            </div>
          )}
          <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', lineHeight: 1.6 }}>"{summary}"</div>
        </div>
      )}
    </div>
  );
}