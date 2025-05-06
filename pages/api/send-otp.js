// File: pages/api/send-otp.js

import dbConnect from "../../lib/dbConnect";
import Admin from "../../models/Admin";
import bcrypt from "bcryptjs";
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

  const { email, password, phone, channel = "sms" } = req.body;
  
  let to = phone.trim();
  if (!to.startsWith("+")) to = "+" + to;
  

  // 0) All three fields required
  if (!email || !password || !phone) {
    return res
      .status(400)
      .json({ error: "Email, password and phone are all required" });
  }

  // 1 & 2) Connect to DB, find user by email, verify phone matches, verify password
  await dbConnect();
  const user = await Admin.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (user.number !== to.trim()) {
    return res
      .status(401)
      .json({ error: "That phone number does not belong to this account" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // 3) All checks passed → send OTP
 
  

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
