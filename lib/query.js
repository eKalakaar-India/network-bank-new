import { hasDisplayName } from './normalize.js';

export const FACET_FIELDS = ['industry', 'city', 'state', 'country', 'tags'];

const hasName = (card) => hasDisplayName(card.name);

const SORTS = {
  name: (a, b) => {
    if (Boolean(hasName(a)) !== Boolean(hasName(b))) return hasName(a) ? -1 : 1;
    return (hasName(a) ? a.name : a.company).localeCompare(hasName(b) ? b.name : b.company);
  },
  company: (a, b) => a.company.localeCompare(b.company),
  newest: (a, b) => b.id - a.id,
};

const toList = (v) =>
  [].concat(v ?? []).join(',').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

const valuesOf = (c, f) => [].concat(c[f]).map((v) => v.toLowerCase());

export function queryCards(cards, params = {}) {
  const tokens = String(params.q ?? '').toLowerCase().split(/\s+/).filter(Boolean);
  const selected = FACET_FIELDS
    .map((f) => [f, new Set(toList(params[f]))])
    .filter(([, set]) => set.size);

  const matches = cards.filter(
    (c) =>
      tokens.every((t) => c._s.includes(t)) &&
      selected.every(([f, set]) => valuesOf(c, f).some((v) => set.has(v)))
  );

  matches.sort(SORTS[Object.hasOwn(SORTS, params.sort) ? params.sort : 'name']);

  const limit = Math.min(100, Math.max(1, parseInt(params.limit, 10) || 24));
  const pages = Math.max(1, Math.ceil(matches.length / limit));
  const page = Math.min(pages, Math.max(1, parseInt(params.page, 10) || 1));
  const items = matches
    .slice((page - 1) * limit, page * limit)
    .map((card) => {
      const result = { ...card };
      delete result._s;
      return result;
    });

  return { items, total: matches.length, page, pages };
}

export function buildFacets(cards) {
  return Object.fromEntries(
    FACET_FIELDS.map((f) => {
      const counts = new Map();
      for (const c of cards) {
        for (const v of [].concat(c[f])) {
          if (!v) continue;
          const key = v.toLowerCase();
          const entry = counts.get(key) ?? { value: v, count: 0 };
          entry.count++;
          counts.set(key, entry);
        }
      }
      const list = [...counts.values()].sort(
        (a, b) => b.count - a.count || a.value.localeCompare(b.value)
      );
      return [f, list];
    })
  );
}