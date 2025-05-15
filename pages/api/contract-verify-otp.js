// File: pages/api/contract-verify-otp.js

import Twilio from "twilio";

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end();
  }

  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: "Phone and code required" });
  }
  let to = phone.trim();
  if (!to.startsWith("+")) to = "+" + to;

  try {
    const vc = await client.verify
      .v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks
      .create({ to: to, code });
    if (vc.status !== "approved") {
      return res.status(401).json({ error: "Invalid OTP data" });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Twilio error:", err);
    return res.status(500).json({ error: "OTP verify failed data" });
  }
}
