import { useEffect, useState } from 'react';
import { fetchJson, toQuery } from './api';
import FilterPanel from './components/FilterPanel';
import CardItem from './components/CardItem';

const LIST_KEYS = ['industry', 'city', 'state', 'country', 'tags'];
const PAGE_SIZE = 24;

function initialFilters() {
  const p = new URLSearchParams(location.search);
  const f = { q: p.get('q') ?? '', sort: p.get('sort') ?? 'name', page: Number(p.get('page')) || 1 };
  for (const k of LIST_KEYS) f[k] = p.get(k)?.split(',').filter(Boolean) ?? [];
  return f;
}

function useDebounced(value, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function App() {
  const [filters, setFilters] = useState(initialFilters);
  const [facets, setFacets] = useState(null);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [showFilters, setShowFilters] = useState(false);
  const dq = useDebounced(filters.q);

  useEffect(() => {
    fetchJson('facets').then(setFacets).catch(() => {});
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    const params = { ...filters, q: dq };
    history.replaceState(null, '', `?${toQuery(params)}`); // shareable URL
    setStatus('loading');
    fetchJson('cards', { ...params, limit: PAGE_SIZE }, ctrl.signal)
      .then((d) => { setData(d); setStatus('ready'); })
      .catch((e) => { if (e.name !== 'AbortError') setStatus('error'); });
    return () => ctrl.abort();
  }, [dq, filters.sort, filters.page, ...LIST_KEYS.map((k) => filters[k])]);

  const patch = (p) => setFilters((f) => ({ ...f, page: 1, ...p }));
  const toggle = (key, value) =>
    patch({
      [key]: filters[key].includes(value)
        ? filters[key].filter((v) => v !== value)
        : [...filters[key], value],
    });
  const clear = () => patch({ q: '', ...Object.fromEntries(LIST_KEYS.map((k) => [k, []])) });
  const goTo = (page) => {
    setFilters((f) => ({ ...f, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const activeCount = LIST_KEYS.reduce((n, k) => n + filters[k].length, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
          <h1 className="text-xl font-bold">Network Bank</h1>
          <input
            type="search"
            value={filters.q}
            onChange={(e) => patch({ q: e.target.value })}
            placeholder="Search name, company, role, city, tags…"
            className="w-full flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm lg:hidden"
            onClick={() => setShowFilters((s) => !s)}
          >
            Filters{activeCount ? ` (${activeCount})` : ''}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[260px_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:sticky lg:top-4 lg:block lg:self-start`}>
          <FilterPanel
            facets={facets}
            filters={filters}
            activeCount={activeCount}
            onToggle={toggle}
            onClear={clear}
          />
        </aside>

        <main>
          <div className="mb-4 flex items-center justify-between text-sm">
            <p className="text-slate-600">
              {status === 'loading' ? 'Loading…' : `${data.total} contact${data.total === 1 ? '' : 's'}`}
            </p>
            <select
              value={filters.sort}
              onChange={(e) => patch({ sort: e.target.value })}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1"
            >
              <option value="name">Name (A–Z)</option>
              <option value="company">Company (A–Z)</option>
              <option value="newest">Recently added</option>
            </select>
          </div>

          {status === 'error' && (
            <p role="alert" className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
              Couldn't load contacts. Please try again shortly.
            </p>
          )}
          {status === 'ready' && data.items.length === 0 && (
            <p className="rounded-lg bg-white p-6 text-center text-sm text-slate-500">
              No contacts match these filters.
            </p>
          )}

          <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${status === 'loading' ? 'opacity-60' : ''}`}>
            {data.items.map((c) => <CardItem key={c.id} card={c} />)}
          </div>

          {data.pages > 1 && (
            <nav className="mt-6 flex items-center justify-center gap-4 text-sm">
              <button disabled={data.page <= 1} onClick={() => goTo(data.page - 1)}
                className="rounded border border-slate-300 bg-white px-3 py-1 disabled:opacity-40">Prev</button>
              <span>Page {data.page} of {data.pages}</span>
              <button disabled={data.page >= data.pages} onClick={() => goTo(data.page + 1)}
                className="rounded border border-slate-300 bg-white px-3 py-1 disabled:opacity-40">Next</button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}