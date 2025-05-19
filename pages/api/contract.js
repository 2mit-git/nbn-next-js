// File: pages/api/contract.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const data = req.body;
  const webhookUrl = process.env.CONTRACT_WEBHOOK;
  if (!webhookUrl) {
    console.error("❌ CONTRACT_WEBHOOK not set");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const text = await resp.text();
      console.error("Webhook error:", resp.status, text);
      return res.status(502).json({ error: "Upstream webhook failed" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook proxy error:", err);
    return res.status(500).json({ error: "Failed to invoke webhook" });
  }
}
