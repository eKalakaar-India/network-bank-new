import process from 'node:process';
import { parseRows } from './normalize.js';

const TTL_MS = 60_000;
let cache = { at: 0, data: null, inflight: null };

async function fetchCards() {
  const { SHEET_ID: id, SHEET_RANGE: configuredRange = 'Sheet1' } = process.env;
  if (!id) throw new Error('SHEET_ID must be set');

  const url = new URL(`https://docs.google.com/spreadsheets/d/${encodeURIComponent(id)}/gviz/tq`);
  const rangeSeparator = configuredRange.indexOf('!');
  if (rangeSeparator === -1) {
    url.searchParams.set('sheet', configuredRange);
  } else {
    url.searchParams.set('sheet', configuredRange.slice(0, rangeSeparator).replace(/^'|'$/g, ''));
    url.searchParams.set('range', configuredRange.slice(rangeSeparator + 1));
  }
  url.searchParams.set('tqx', 'out:json');

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    throw new Error(`Google Sheets request failed (${res.status})`);
  }
  const text = await res.text();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd < jsonStart) {
    throw new Error('Google Sheets returned an invalid response');
  }
  const { table, errors } = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
  if (errors?.length) throw new Error(`Google Sheets error: ${errors[0].message}`);
  if (!table?.cols || !table?.rows) throw new Error('Google Sheets response is missing table data');

  const values = [
    table.cols.map((column) => column.label || column.id),
    ...table.rows.map(({ c = [] }) =>
      table.cols.map((_, index) => c[index]?.f ?? c[index]?.v ?? '')
    ),
  ];
  return parseRows(values);
}

// TTL cache + in-flight de-dupe; serves stale data if Google is down.
export async function getCards() {
  if (cache.data && Date.now() - cache.at < TTL_MS) return cache.data;
  if (cache.inflight) return cache.inflight;

  cache.inflight = fetchCards()
    .then((data) => {
      cache = { at: Date.now(), data, inflight: null };
      return data;
    })
    .catch((err) => {
      cache.inflight = null;
      if (cache.data) return cache.data;
      throw err;
    });

  return cache.inflight;
}