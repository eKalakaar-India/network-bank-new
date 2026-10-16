import { hasDisplayName } from '../../lib/normalize.js';

export default function CardItem({ card: c }) {
  const hasName = hasDisplayName(c.name);
  const contactDetails = [
    c.phone && ['Phone', c.phone, `tel:${c.phone.replace(/[^\d+]/g, '')}`],
    c.mobile && ['Mobile', c.mobile, `tel:${c.mobile.replace(/[^\d+]/g, '')}`],
    c.email && ['Email', c.email, `mailto:${c.email}`],
    c.fax && ['Fax', c.fax, `fax:${c.fax.replace(/[^\d+]/g, '')}`],
  ].filter(Boolean);
  const links = [
    c.website && ['Website', c.website],
    c.linkedin && ['LinkedIn', c.linkedin],
  ].filter(Boolean);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {c.imageUrl && (
        <img
          src={c.imageUrl}
          alt={`${hasName ? c.name : c.company} visiting card`}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-40 w-full bg-slate-100 object-cover"
          onError={(e) => e.currentTarget.remove()}
        />
      )}
      <div className="flex-1 space-y-1 p-4">
        <h3 className="break-words text-lg font-bold text-slate-900">
          {hasName ? c.name : c.company || 'Unnamed contact'}
        </h3>
        <p className="text-sm text-slate-600">
          {[c.designation, hasName && c.company !== c.name ? c.company : '']
            .filter(Boolean).join(' · ')}
        </p>
        <p className="text-xs text-slate-500">{[c.city, c.state, c.country].filter(Boolean).join(', ')}</p>
        {c.address && <p className="text-xs text-slate-500">{c.address}</p>}
        {contactDetails.length > 0 && (
          <dl className="space-y-1 pt-2 text-sm">
            {contactDetails.map(([label, value, href]) => (
              <div key={label} className="flex flex-wrap gap-x-2">
                <dt className="font-medium text-slate-600">{label}:</dt>
                <dd>
                  <a className="break-all text-indigo-700 hover:underline" href={href}>
                    {value}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        )}
        {c.industry && (
          <span className="inline-block rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
            {c.industry}
          </span>
        )}
        {c.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {c.tags.map((t) => (
              <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">{t}</span>
            ))}
          </div>
        )}
      </div>
      {links.length > 0 && (
        <div className="flex flex-wrap gap-4 border-t border-slate-100 px-4 py-2 text-sm text-indigo-600">
          {links.map(([label, href]) => (
            <a key={label} href={href} target={href.startsWith('http') ? '_blank' : undefined}
               rel="noopener noreferrer" className="hover:underline">{label}</a>
          ))}
        </div>
      )}
    </article>
  );
}