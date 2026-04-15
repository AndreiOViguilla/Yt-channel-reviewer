import React, { useState, useMemo } from 'react';
import VideoCard from './VideoCard';

export default function ResultsScreen({ results }) {
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('score_asc');

  const total = results.length;
  const critical = results.reduce((n, r) => n + r.issues.filter((i) => i.severity === 'high').length, 0);
  const warnings = results.reduce((n, r) => n + r.issues.filter((i) => i.severity === 'medium').length, 0);
  const clean = results.filter((r) => r.issues.length === 0).length;

  const filtered = useMemo(() => {
    let list = [...results];
    if (filter === 'issues') list = list.filter((r) => r.issues.length > 0);
    else if (filter === 'clean') list = list.filter((r) => r.issues.length === 0);
    else if (filter === 'high') list = list.filter((r) => r.issues.some((i) => i.severity === 'high'));
    if (sort === 'score_asc') list.sort((a, b) => a.score - b.score);
    else if (sort === 'score_desc') list.sort((a, b) => b.score - a.score);
    else if (sort === 'issues_desc') list.sort((a, b) => b.issues.length - a.issues.length);
    return list;
  }, [results, filter, sort]);

  function exportReport() {
    const lines = ['YouTube Metadata Audit Report', 'Date: ' + new Date().toLocaleString(), '', '='.repeat(60), ''];
    results.forEach((r, i) => {
      const v = r._video;
      lines.push(`[${i + 1}] ${v.title}`);
      lines.push(`Score: ${r.score}/100  |  Tags: ${v.tags.length}  |  Issues: ${r.issues.length}`);
      lines.push(`Summary: ${r.summary}`);
      if (r.issues.length) {
        lines.push('Issues:');
        r.issues.forEach((iss) => {
          lines.push(`  [${iss.severity.toUpperCase()}] ${iss.title}`);
          lines.push(`  ${iss.description}`);
          if (iss.offending_tags?.length) lines.push(`  Flagged: ${iss.offending_tags.join(', ')}`);
          if (iss.suggested_tags?.length) lines.push(`  Consider adding: ${iss.suggested_tags.join(', ')}`);
        });
      } else {
        lines.push('  No issues found.');
      }
      lines.push('');
    });
    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    a.download = 'yt_metadata_audit.txt';
    a.click();
  }

  const s = {
    wrap: { padding: 28, maxWidth: 1000, margin: '0 auto', width: '100%' },
    header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
    title: { fontFamily: 'var(--display)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' },
    summaryRow: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 },
    sumCard: { background: 'var(--s1)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 18px' },
    sumN: (color) => ({ fontFamily: 'var(--display)', fontSize: 32, fontWeight: 700, lineHeight: 1, marginBottom: 4, letterSpacing: '-0.02em', color }),
    sumL: { fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.07em' },
    filterRow: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' },
    pill: (on) => ({
      padding: '5px 14px', borderRadius: 20,
      border: `1px solid ${on ? 'var(--yt)' : 'var(--border)'}`,
      background: on ? 'var(--yt)' : 'transparent',
      fontSize: 12, color: on ? 'white' : 'var(--muted)',
      cursor: 'pointer', fontFamily: 'var(--mono)', transition: 'all 0.15s',
    }),
    sep: { flex: 1 },
    select: {
      background: 'var(--s2)', border: '1px solid var(--border)', borderRadius: 6,
      padding: '5px 10px', color: 'var(--muted)', fontSize: 12,
      fontFamily: 'var(--mono)', outline: 'none', cursor: 'pointer',
    },
    exportBtn: {
      padding: '8px 16px', borderRadius: 8, fontFamily: 'var(--body)',
      fontSize: 13, fontWeight: 500, cursor: 'pointer',
      background: 'var(--s2)', border: '1px solid var(--border2)', color: 'var(--text)',
    },
  };

  const filters = [
    { key: 'all', label: `All (${total})` },
    { key: 'issues', label: `Has issues (${total - clean})` },
    { key: 'clean', label: `Clean (${clean})` },
    { key: 'high', label: 'Critical only' },
  ];

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <div style={s.title}>Audit complete — {total} videos</div>
        <button style={s.exportBtn} onClick={exportReport}>↓ Export report</button>
      </div>

      <div style={s.summaryRow}>
        {[
          { n: total, label: 'Videos audited', color: 'var(--text)' },
          { n: critical, label: 'Critical issues', color: 'var(--red)' },
          { n: warnings, label: 'Warnings', color: 'var(--amber)' },
          { n: clean, label: 'Clean videos', color: 'var(--green)' },
        ].map((card, i) => (
          <div key={i} style={s.sumCard}>
            <div style={s.sumN(card.color)}>{card.n}</div>
            <div style={s.sumL}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={s.filterRow}>
        {filters.map((f) => (
          <button key={f.key} style={s.pill(filter === f.key)} onClick={() => setFilter(f.key)}>{f.label}</button>
        ))}
        <div style={s.sep} />
        <select style={s.select} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="score_asc">Worst first</option>
          <option value="score_desc">Best first</option>
          <option value="issues_desc">Most issues</option>
        </select>
      </div>

      {filtered.length === 0
        ? <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>No videos match this filter.</div>
        : filtered.map((r, i) => <VideoCard key={r._video.id || i} result={r} />)}
    </div>
  );
}
