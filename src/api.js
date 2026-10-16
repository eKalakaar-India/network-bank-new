export function toQuery(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    const val = Array.isArray(v) ? v.join(',') : v;
    if (val !== '' && val != null) qs.set(k, val);
  }
  return qs.toString();
}

export async function fetchJson(path, params, signal) {
  const qs = toQuery(params);
  const res = await fetch(`/api/${path}${qs ? `?${qs}` : ''}`, { signal });
  console.log(res)
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}