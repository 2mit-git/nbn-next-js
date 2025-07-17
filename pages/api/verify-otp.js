// File: pages/api/verify-otp.js

import dbConnect from "../../lib/dbConnect";
import Admin from "../../models/Admin";
import Twilio from "twilio";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

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

  // 1) Check OTP
  try {
    const vc = await client.verify
      .v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks
      .create({ to: to, code });
    if (vc.status !== "approved") {
      return res.status(401).json({ error: "Invalid OTP" });
    }
  } catch (err) {
    console.error("Twilio error:", err);
    return res.status(500).json({ error: "OTP verify failed" });
  }

  // 2) Connect & load the user
  await dbConnect();
  const user = await Admin.findOne({ number: to.trim() });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // 3) Sign a JWT
  const token = jwt.sign(
    { sub: user._id.toString(), email: user.email, type: user.type },
    process.env.JWT_SECRET,
    { expiresIn: "10h" }
  );

  // 4) Set it as an HttpOnly cookie
  res.setHeader("Set-Cookie", serialize("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: (10*60) * 60, // 1 hour
  }));

  // 5) Done
  return res.status(200).json({ ok: true });
}