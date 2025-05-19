// pages/api/nbn.js
export default async function handler(req, res) {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: 'Missing address parameter.' });
  }

  const url = `https://nbnco-address-check.p.rapidapi.com/nbn_address?address=${encodeURIComponent(address)}`;

  try {
    const nbnRes = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,   // from .env.local
        "x-rapidapi-host": "nbnco-address-check.p.rapidapi.com",
      },
    });
    if (!nbnRes.ok) throw new Error(`NBN API ${nbnRes.status}`);
    const data = await nbnRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error('NBN proxy error:', err);
    res.status(500).json({ error: 'NBN lookup failed.' });
  }
}
