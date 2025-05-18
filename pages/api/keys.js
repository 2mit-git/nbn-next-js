// File: pages/api/keys.js
import dbConnect from "../../lib/dbConnect";
import ApiKey from "../../models/ApiKey";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

function requireAuth(req, res) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user;
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
}

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    const doc = await ApiKey.findOne({});
    if (!doc) {
      return res
        .status(404)
        .json({ error: "No API keys found. Use PUT to create them first." });
    }
    return res.status(200).json({
      TWILIO_ACCOUNT_SID: doc.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: doc.TWILIO_AUTH_TOKEN,
      TWILIO_SERVICE_SID: doc.TWILIO_SERVICE_SID,
      GHL_WEBHOOK: doc.GHL_WEBHOOK,
      GEO_API_KEY: doc.GEO_API_KEY,
      RAPIDAPI_KEY: doc.RAPIDAPI_KEY,
    });
  }

  if (req.method === "PUT") {
    const user = requireAuth(req, res);
    if (!user) return;
    const {
      TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN,
      TWILIO_SERVICE_SID,
      GHL_WEBHOOK,
      GEO_API_KEY,
      RAPIDAPI_KEY,
    } = req.body;
    if (
      !TWILIO_ACCOUNT_SID ||
      !TWILIO_AUTH_TOKEN ||
      !TWILIO_SERVICE_SID ||
      !GHL_WEBHOOK ||
      !GEO_API_KEY ||
      !RAPIDAPI_KEY
    ) {
      return res.status(400).json({
        error:
          "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_SERVICE_SID, GHL_WEBHOOK, GEO_API_KEY, and RAPIDAPI_KEY are all required.",
      });
    }

    // Upsert: update if exists, otherwise create
    const updated = await ApiKey.findOneAndUpdate(
      {},
      {
        TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN,
        TWILIO_SERVICE_SID,
        GHL_WEBHOOK,
        GEO_API_KEY,
        RAPIDAPI_KEY,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      message: "API keys updated",
      keys: {
        TWILIO_ACCOUNT_SID: updated.TWILIO_ACCOUNT_SID,
        TWILIO_AUTH_TOKEN: updated.TWILIO_AUTH_TOKEN,
        TWILIO_SERVICE_SID: updated.TWILIO_SERVICE_SID,
        GHL_WEBHOOK: updated.GHL_WEBHOOK,
        GEO_API_KEY: updated.GEO_API_KEY,
        RAPIDAPI_KEY: updated.RAPIDAPI_KEY,
      },
    });
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
