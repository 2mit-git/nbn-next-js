// pages/api/geocode.js
export default async function handler(req, res) {
  const { text, lang = 'en', limit = '5', countrycode = 'au' } = req.query;
  if (!text) {
    return res.status(400).json({ error: 'Missing text query parameter.' });
  }

  const url = new URL('https://api.geoapify.com/v1/geocode/autocomplete');
  url.search = new URLSearchParams({
    text,
    lang,
    limit,
    filter: `countrycode:${countrycode}`,
    apiKey: process.env.GEOAPIFY_API_KEY,  // from .env.local
  });

  try {
    const geoRes = await fetch(url);
    if (!geoRes.ok) throw new Error(`Geoapify ${geoRes.status}`);
    const data = await geoRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('Geo proxy error:', err);
    res.status(500).json({ error: 'Geo lookup failed.' });
  }
}
