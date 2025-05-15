// File: pages/api/contract-send-otp.js

import Twilio from "twilio";

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end("Method Not Allowed");
  }

  const { phone, channel = "sms" } = req.body;

  let to = phone && phone.trim();
  if (!to || !/^\+?\d{10,15}$/.test(to)) {
    return res.status(400).json({ error: "Valid phone number required" });
  }
  if (!to.startsWith("+")) to = "+" + to;

  try {
    const verification = await client.verify
      .v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications
      .create({ to, channel: channel === "call" ? "call" : "sms" });

    return res
      .status(200)
      .json({ sid: verification.sid, channel: verification.channel });
  } catch (err) {
    console.error("Twilio Verify error:", err);
    return res
      .status(500)
      .json({ error: err.message || "OTP send failed" });
  }
}
