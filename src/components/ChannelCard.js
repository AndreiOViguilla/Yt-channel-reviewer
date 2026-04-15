import React, { useState, useEffect } from 'react';

export default function ChannelCard({ videos }) {
  const [unsubTrailer, setUnsubTrailer] = useState('');
  const [featuredVideo, setFeaturedVideo] = useState('');
  const [origUnsub, setOrigUnsub] = useState('');
  const [origFeatured, setOrigFeatured] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { loadBranding(); }, []);

  async function loadBranding() {
    const token = sessionStorage.getItem('yt_audit_token');
    if (!token) { setError('No access token — reconnect YouTube'); setLoading(false); return; }
    try {
      const res = await fetch('http://localhost:3001/api/get-branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setUnsubTrailer(data.unsubscribedTrailer || '');
      setFeaturedVideo(data.featuredVideoId || '');
      setOrigUnsub(data.unsubscribedTrailer || '');
      setOrigFeatured(data.featuredVideoId || '');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }

  async function saveBranding() {
    const token = sessionStorage.getItem('yt_audit_token');
    if (!token) { setSaveStatus('No access token'); return; }
    setSaving(true);
    setSaveStatus('');
    try {
      const res = await fetch('http://localhost:3001/api/update-branding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token, unsubscribedTrailer: unsubTrailer, featuredVideoId: featuredVideo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setSaveStatus('success');
      setOrigUnsub(unsubTrailer);
      setOrigFeatured(featuredVideo);
    } catch (e) {
      setSaveStatus('Error: ' + e.message);
    }
    setSaving(false);
  }

  const latestVideo = videos?.[0];
  const unsubDirty = unsubTrailer !== origUnsub;
  const featuredDirty = featuredVideo !== origFeatured;
  const anyDirty = unsubDirty || featuredDirty;

  const getTitle = (id) => videos?.find(v => v.id === id)?.title || id || 'None selected';

  const selectStyle = {
    width: '100%', background: 'var(--s3)', border: '1px solid var(--border)',
    borderRadius: 6, padding: '8px 10px', color: 'var(--text)',
    fontFamily: 'var(--body)', fontSize: 13, outline: 'none',
    cursor: 'pointer', transition: 'border-color 0.15s',
    appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: 28,
  };

  const labelStyle = {
    fontSize: 11, color: 'var(--dim)', fontFamily: 'var(--mono)',
    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8, display: 'block',
  };

  const latestBtnStyle = {
    padding: '5px 12px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
    fontFamily: 'var(--mono)', border: '1px solid var(--border2)',
    background: 'var(--s3)', color: 'var(--muted)', transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  };

  function VideoPreview({ videoId }) {
    const video = videos?.find(v => v.id === videoId);
    if (!videoId) return null;
    return (
      <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', padding: '8px 10px', background: 'var(--s3)', borderRadius: 6, border: '1px solid var(--border)' }}>
        {video?.thumb
          ? <img src={video.thumb} alt="" style={{ width: 64, height: 36, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }} />
          : <div style={{ width: 64, height: 36, borderRadius: 4, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dim)', flexShrink: 0 }}>▶</div>}
        <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.4, overflow: 'hidden' }}>
          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video?.title || videoId}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', marginTop: 2 }}>{videoId}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '18px 20px', marginBottom: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>Channel featured videos</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Update your channel trailer and featured video</div>
        </div>
        {anyDirty && (
          <button onClick={saveBranding} disabled={saving}
            style={{
              padding: '8px 18px', borderRadius: 8, fontSize: 12, cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--mono)', fontWeight: 500, opacity: saving ? 0.6 : 1,
              border: `1px solid ${saveStatus === 'success' ? 'var(--green-border)' : 'var(--red-border)'}`,
              background: saveStatus === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
              color: saveStatus === 'success' ? 'var(--green)' : 'var(--red)',
            }}>
            {saving ? 'Pushing…' : saveStatus === 'success' ? '✓ Saved to YouTube!' : '↑ Push to YouTube'}
          </button>
        )}
      </div>

      {loading && <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Loading branding settings…</div>}
      {error && <div style={{ fontSize: 13, color: 'var(--red)', fontFamily: 'var(--mono)' }}>{error}</div>}
      {saveStatus && saveStatus !== 'success' && (
        <div style={{ fontSize: 12, color: 'var(--red)', fontFamily: 'var(--mono)', marginBottom: 12 }}>{saveStatus}</div>
      )}

      {!loading && !error && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Channel trailer for non-subscribers */}
          <div style={{ background: 'var(--s2)', borderRadius: 8, padding: '14px 16px', border: `1px solid ${unsubDirty ? 'var(--amber-border)' : 'var(--border)'}` }}>
            <span style={labelStyle}>
              Channel trailer — non-subscribers {unsubDirty && <span style={{ color: 'var(--amber)' }}>(edited)</span>}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <select
                value={unsubTrailer}
                onChange={e => setUnsubTrailer(e.target.value)}
                style={{ ...selectStyle, borderColor: unsubDirty ? 'var(--amber-border)' : 'var(--border)' }}
              >
                <option value="">— Select a video —</option>
                {videos?.map(v => (
                  <option key={v.id} value={v.id}>{v.title.slice(0, 60)}{v.title.length > 60 ? '…' : ''}</option>
                ))}
              </select>
              {latestVideo && (
                <button
                  onClick={() => setUnsubTrailer(latestVideo.id)}
                  title="Set to latest video"
                  style={latestBtnStyle}
                >
                  ↑ Latest
                </button>
              )}
            </div>
            <VideoPreview videoId={unsubTrailer} />
          </div>

          {/* Featured video for returning subscribers */}
          <div style={{ background: 'var(--s2)', borderRadius: 8, padding: '14px 16px', border: `1px solid ${featuredDirty ? 'var(--amber-border)' : 'var(--border)'}` }}>
            <span style={labelStyle}>
              Featured video — returning subscribers {featuredDirty && <span style={{ color: 'var(--amber)' }}>(edited)</span>}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <select
                value={featuredVideo}
                onChange={e => setFeaturedVideo(e.target.value)}
                style={{ ...selectStyle, borderColor: featuredDirty ? 'var(--amber-border)' : 'var(--border)' }}
              >
                <option value="">— Select a video —</option>
                {videos?.map(v => (
                  <option key={v.id} value={v.id}>{v.title.slice(0, 60)}{v.title.length > 60 ? '…' : ''}</option>
                ))}
              </select>
              {latestVideo && (
                <button
                  onClick={() => setFeaturedVideo(latestVideo.id)}
                  title="Set to latest video"
                  style={latestBtnStyle}
                >
                  ↑ Latest
                </button>
              )}
            </div>
            <VideoPreview videoId={featuredVideo} />
          </div>

        </div>
      )}
    </div>
  );
}