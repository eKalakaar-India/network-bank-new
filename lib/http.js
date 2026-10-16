export const route = (fn) => async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const body = await fn(req);
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json(body);
  } catch (err) {
    console.error(err); // details stay in Vercel logs, never sent to the client
    res.setHeader('Cache-Control', 'no-store');
    res.status(502).json({ error: 'Directory temporarily unavailable' });
  }
};