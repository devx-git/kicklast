import { useState, useMemo } from 'react';

const S = {
  wrap: { background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 8, overflow: 'hidden' },
  toolbar: { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', padding: '14px 16px', borderBottom: '1px solid #1e2a3a', background: '#0a0e1a' },
  searchBox: { flex: 1, minWidth: 180, background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '8px 12px 8px 32px', color: '#e2e8f0', fontFamily: 'Roboto, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
  filterSel: { background: '#0a0d14', border: '1px solid #1e2a3a', borderRadius: 6, padding: '8px 10px', color: '#c0cad8', fontFamily: 'Roboto, sans-serif', fontSize: 12, outline: 'none', cursor: 'pointer' },
  table: { width: '100%', borderCollapse: 'collapse', fontFamily: 'Roboto, sans-serif', fontSize: 13 },
  th: { padding: '10px 14px', textAlign: 'left', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid #1e2a3a', background: '#0a0e1a', whiteSpace: 'nowrap', userSelect: 'none' },
  td: { padding: '11px 14px', color: '#c0cad8', borderBottom: '1px solid #111827', verticalAlign: 'middle' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #1e2a3a', background: '#0a0e1a', flexWrap: 'wrap', gap: 8 },
  pageBtn: (active) => ({ background: active ? '#8dc63f' : '#1e2535', color: active ? '#0a0d14' : '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 4, border: 'none', cursor: 'pointer', minWidth: 32 }),
};

/**
 * Reusable DataTable
 * @param {Object[]} columns  — [{ key, label, sortable?, filterable?, filterOptions?, render? }]
 * @param {Object[]} data     — raw rows
 * @param {number}   pageSize — default rows per page (10 | 25 | 50)
 * @param {string}   emptyMsg — message shown when no rows match
 * @param {boolean}  exportCsv — show CSV export button
 */
export default function DataTable({ columns = [], data = [], pageSize: defaultSize = 10, emptyMsg = 'Sin datos', exportCsv = false }) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(defaultSize);

  const searchKeys = columns.filter(c => !c.noSearch).map(c => c.key);

  // ── filter + search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let rows = data;

    // column filters
    Object.entries(filters).forEach(([key, val]) => {
      if (!val) return;
      rows = rows.filter(r => String(r[key] ?? '').toLowerCase() === val.toLowerCase());
    });

    // global search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(r =>
        searchKeys.some(k => String(r[k] ?? '').toLowerCase().includes(q))
      );
    }

    return rows;
  }, [data, search, filters]);

  // ── sort ──────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    return [...filtered].sort((a, b) => {
      const av = a[sort.key] ?? '';
      const bv = b[sort.key] ?? '';
      const cmp = String(av).localeCompare(String(bv), 'es', { numeric: true });
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort]);

  // ── pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / size));
  const safePage = Math.min(page, totalPages);
  const rows = sorted.slice((safePage - 1) * size, safePage * size);

  const toggleSort = (key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
    setPage(1);
  };

  const setFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  // ── CSV export ────────────────────────────────────────────────────────────
  const downloadCsv = () => {
    const header = columns.map(c => c.label).join(',');
    const body = sorted.map(r =>
      columns.map(c => {
        const v = r[c.key] ?? '';
        return `"${String(v).replace(/"/g, '""')}"`;
      }).join(',')
    ).join('\n');
    const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'datos.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // ── page numbers ──────────────────────────────────────────────────────────
  const pageNums = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = new Set([1, totalPages, safePage]);
    if (safePage > 1) pages.add(safePage - 1);
    if (safePage < totalPages) pages.add(safePage + 1);
    return [...pages].sort((a, b) => a - b);
  };

  const filterableCols = columns.filter(c => c.filterable && c.filterOptions?.length);

  return (
    <div style={S.wrap}>
      {/* Toolbar */}
      <div style={S.toolbar}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7a8d', fontSize: 13 }}>🔍</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar..."
            style={S.searchBox}
          />
          {search && (
            <button onClick={() => { setSearch(''); setPage(1); }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6b7a8d', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}>✕</button>
          )}
        </div>

        {/* Column filters */}
        {filterableCols.map(c => (
          <select key={c.key} value={filters[c.key] || ''} onChange={e => setFilter(c.key, e.target.value)} style={S.filterSel}>
            <option value="">{c.label}: todos</option>
            {c.filterOptions.map(o => (
              <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
            ))}
          </select>
        ))}

        {/* Rows per page */}
        <select value={size} onChange={e => { setSize(Number(e.target.value)); setPage(1); }} style={{ ...S.filterSel, minWidth: 80 }}>
          {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n} filas</option>)}
        </select>

        {/* Export */}
        {exportCsv && (
          <button onClick={downloadCsv} style={{ background: '#1e2535', color: '#8dc63f', fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '7px 14px', borderRadius: 6, border: '1px solid #8dc63f30', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            ↓ CSV
          </button>
        )}

        {/* Count */}
        <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 11, whiteSpace: 'nowrap' }}>
          {filtered.length} de {data.length}
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr>
              {columns.map(c => (
                <th
                  key={c.key}
                  style={{ ...S.th, cursor: c.sortable ? 'pointer' : 'default' }}
                  onClick={() => c.sortable && toggleSort(c.key)}
                >
                  {c.label}
                  {c.sortable && (
                    <span style={{ marginLeft: 5, opacity: sort.key === c.key ? 1 : 0.3 }}>
                      {sort.key === c.key ? (sort.dir === 'asc' ? '▲' : '▼') : '⇅'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ ...S.td, textAlign: 'center', padding: '40px 14px', color: '#4a5568' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                  {emptyMsg}
                  {(search || Object.values(filters).some(Boolean)) && (
                    <button onClick={() => { setSearch(''); setFilters({}); }} style={{ display: 'block', margin: '12px auto 0', background: '#1e2535', color: '#6b7a8d', fontFamily: 'Oswald, sans-serif', fontSize: 10, fontWeight: 700, padding: '6px 14px', borderRadius: 4, border: 'none', cursor: 'pointer' }}>
                      LIMPIAR FILTROS
                    </button>
                  )}
                </td>
              </tr>
            ) : rows.map((row, i) => (
              <tr key={row.id ?? i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(141,198,63,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}>
                {columns.map(c => (
                  <td key={c.key} style={{ ...S.td, ...c.tdStyle }}>
                    {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div style={S.footer}>
        <span style={{ color: '#4a5568', fontFamily: 'Roboto, sans-serif', fontSize: 11 }}>
          {sorted.length === 0 ? 'Sin resultados' : `Mostrando ${(safePage - 1) * size + 1}–${Math.min(safePage * size, sorted.length)} de ${sorted.length}`}
        </span>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setPage(1)} disabled={safePage === 1} style={S.pageBtn(false)}>«</button>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} style={S.pageBtn(false)}>‹</button>

          {pageNums().reduce((acc, n, i, arr) => {
            if (i > 0 && n - arr[i - 1] > 1) {
              acc.push(<span key={`gap${n}`} style={{ color: '#4a5568', padding: '0 4px', fontFamily: 'Roboto, sans-serif', fontSize: 12 }}>…</span>);
            }
            acc.push(
              <button key={n} onClick={() => setPage(n)} style={S.pageBtn(n === safePage)}>{n}</button>
            );
            return acc;
          }, [])}

          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} style={S.pageBtn(false)}>›</button>
          <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} style={S.pageBtn(false)}>»</button>
        </div>
      </div>
    </div>
  );
}
