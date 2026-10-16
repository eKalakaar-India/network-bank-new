const GROUPS = [
  ['industry', 'Industry'],
  ['city', 'City'],
  ['state', 'State'],
  ['country', 'Country'],
  ['tags', 'Tags'],
];

export default function FilterPanel({ facets, filters, activeCount, onToggle, onClear }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-sm text-indigo-600 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {GROUPS.map(([key, label]) =>
        facets?.[key]?.length ? (
          <details
            key={key}
            open={key === 'industry' || filters[key].length > 0}
            className="rounded-lg border border-slate-200 bg-white p-3"
          >
            <summary className="cursor-pointer text-sm font-medium">{label}</summary>
            <ul className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
              {facets[key].map(({ value, count }) => (
                <li key={value}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={filters[key].includes(value)}
                      onChange={() => onToggle(key, value)}
                    />
                    <span className="flex-1 truncate">{value}</span>
                    <span className="text-xs text-slate-400">{count}</span>
                  </label>
                </li>
              ))}
            </ul>
          </details>
        ) : null
      )}
    </div>
  );
}