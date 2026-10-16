const FIELD_ALIASES = {
  name: ['name', 'full name', 'contact name', 'person'],
  company: ['company', 'organisation', 'organization', 'firm', 'business'],
  designation: ['designation', 'title', 'job title', 'role', 'position'],
  industry: ['industry', 'sector', 'category'],
  email: ['email', 'e-mail', 'email id', 'mail'],
  phone: ['phone', 'contact', 'contact no', 'phone number'],
  mobile: ['mobile', 'mobile number'],
  fax: ['fax', 'fax number'],
  address: ['address', 'street address', 'postal address'],
  city: ['city', 'location'],
  state: ['state', 'region'],
  country: ['country'],
  website: ['website', 'url', 'web', 'site'],
  linkedin: ['linkedin', 'linkedin url', 'linkedin profile'],
  tags: ['tags', 'keywords', 'skills', 'services'],
  imageUrl: ['card image', 'card', 'image', 'image url', 'photo', 'card url'],
  notes: ['notes', 'note', 'remarks', 'comments'],
};

const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
export const hasDisplayName = (value) => {
  const name = clean(value);
  return Boolean(name && !/^[-–—.]+$/.test(name) && !/^(?=.*\d)[+\d\s().-]+$/.test(name));
};

const HEADER_TO_FIELD = new Map(
  Object.entries(FIELD_ALIASES).flatMap(([field, aliases]) =>
    aliases.map((a) => [norm(a), field])
  )
);

const splitList = (v) => [...new Set(clean(v).split(/[,;|]/).map((s) => s.trim()).filter(Boolean))];

// Only http(s) URLs survive: blocks javascript:/data: payloads from a user-editable sheet.
function safeUrl(v) {
  const s = clean(v);
  if (!s) return '';
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    return ['http:', 'https:'].includes(u.protocol) ? u.href : '';
  } catch {
    return '';
  }
}

function toImageUrl(v) {
  const url = safeUrl(v);
  const id = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/)?.[1];
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w800` : url;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseRows([header = [], ...rows]) {
  const fields = header.map((h) => HEADER_TO_FIELD.get(norm(h)));
  const cards = [];

  rows.forEach((row, i) => {
    const c = {
      name: '', company: '', designation: '', industry: '', email: '', phone: '',
      mobile: '', fax: '', address: '', city: '', state: '', country: '',
      website: '', linkedin: '', tags: '', imageUrl: '', notes: '',
    };
    fields.forEach((f, col) => { if (f && !c[f]) c[f] = clean(row[col]); });
    if (!c.name && !c.company) return; // skip blank / junk rows

    c.id = i + 2; // actual sheet row number
    c.email = EMAIL_RE.test(c.email) ? c.email.toLowerCase() : '';
    c.website = safeUrl(c.website);
    c.linkedin = safeUrl(c.linkedin);
    c.imageUrl = toImageUrl(c.imageUrl);
    c.tags = splitList(c.tags);
    c._s = [c.name, c.company, c.designation, c.industry, c.email, c.phone,
            c.mobile, c.fax, c.address,
            c.city, c.state, c.country, c.tags.join(' '), c.notes].join(' ').toLowerCase();
    cards.push(c);
  });

  return cards;
}