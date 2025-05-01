// File: pages/api/send-otp.js

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

  const { phone, channel = "sms" } = req.body;
  if (!phone) {
    return res.status(400).json({ error: "Phone number required" });
  }

  // Only allow “sms” or “call”
  const safeChannel = channel === "call" ? "call" : "sms";

  try {
    const verification = await client.verify
      .v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications
      .create({ to: phone, channel: safeChannel });

    return res
      .status(200)
      .json({ sid: verification.sid, channel: safeChannel });
  } catch (err) {
    console.error("Twilio Verify error:", err);
    return res.status(500).json({ error: "OTP send failed" });
  }
}
