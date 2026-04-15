import React from 'react';

export default function ProgressScreen({ items, current, total }) {
  const pct = total ? Math.round((current / total) * 100) : 0;

  const s = {
    wrap: { padding: '40px 28px', maxWidth: 700, margin: '0 auto', width: '100%' },
    title: { fontFamily: 'var(--display)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 },
    sub: { fontSize: 14, color: 'var(--muted)', marginBottom: 32, fontFamily: 'var(--mono)' },
    list: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
    item: (state) => ({
      background: 'var(--s1)',
      border: `1px solid ${state === 'done' ? 'var(--green-border)' : state === 'active' ? 'var(--amber-border)' : state === 'error' ? 'var(--red-border)' : 'var(--border)'}`,
      borderRadius: 10, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 14,
      transition: 'border-color 0.2s',
      animation: 'slideUp 0.2s ease',
    }),
    thumb: { width: 72, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0, background: 'var(--s3)' },
    thumbPh: {
      width: 72, height: 40, borderRadius: 6, background: 'var(--s3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--dim)', flexShrink: 0, fontSize: 16,
    },
    info: { flex: 1, minWidth: 0 },
    vtitle: {
      fontSize: 13, fontWeight: 500,
      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2,
    },
    status: (state) => ({
      fontSize: 11, fontFamily: 'var(--mono)',
      color: state === 'done' ? 'var(--green)' : state === 'active' ? 'var(--amber)' : state === 'error' ? 'var(--red)' : 'var(--dim)',
    }),
    icon: { fontSize: 18, flexShrink: 0, width: 24, textAlign: 'center' },
    spinner: {
      width: 16, height: 16,
      border: '2px solid var(--border2)', borderTopColor: 'var(--amber)',
      borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block',
    },
    barWrap: { height: 3, background: 'var(--s3)', borderRadius: 2, overflow: 'hidden' },
    bar: { height: '100%', background: 'var(--yt)', borderRadius: 2, transition: 'width 0.4s ease', width: pct + '%' },
  };

  return (
    <div style={s.wrap}>
      <div style={s.title}>Auditing your videos…</div>
      <div style={s.sub}>
        {current < total ? `Checking video ${current + 1} of ${total}` : 'Audit complete!'}
      </div>
      <div style={s.list}>
        {items.map((item, i) => (
          <div key={i} style={s.item(item.state)}>
            {item.thumb
              ? <img style={s.thumb} src={item.thumb} alt="" loading="lazy" />
              : <div style={s.thumbPh}>▶</div>}
            <div style={s.info}>
              <div style={s.vtitle}>{item.title}</div>
              <div style={s.status(item.state)}>{item.statusText}</div>
            </div>
            <div style={s.icon}>
              {item.state === 'active'
                ? <div style={s.spinner} />
                : item.state === 'done' ? '✓'
                : item.state === 'error' ? '✕'
                : '○'}
            </div>
          </div>
        ))}
      </div>
      <div style={s.barWrap}><div style={s.bar} /></div>
    </div>
  );
}
