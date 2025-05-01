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

  try {
    // use .v2.services and .verificationChecks
    const vc = await client.verify
      .v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks
      .create({ to: phone, code });

    if (vc.status === "approved") {
      return res.status(200).json({ ok: true });
    } else {
      return res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OTP verify failed" });
  }
}
