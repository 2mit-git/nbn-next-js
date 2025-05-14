// pages/api/keys.js
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
        .json({ error: "No API-keys found. Use PUT to create them first." });
    }
    return res.status(200).json({
      geoapify:  doc.geoapify,
      nbn:       doc.nbn,
      recaptcha: doc.recaptcha,
    });
  }

  if (req.method === "PUT") {
    const user = requireAuth(req, res);
    if (!user) return;
    const { geoapify, nbn, recaptcha } = req.body;
    if (!geoapify || !nbn || !recaptcha) {
      return res
        .status(400)
        .json({ error: "geoapify, nbn and recaptcha are all required." });
    }

    // upsert: update if exists, otherwise create
    const updated = await ApiKey.findOneAndUpdate(
      {},                              // filter: the single doc
      { geoapify, nbn, recaptcha },    // new values
      { upsert: true, new: true }      // create if missing, return the new doc
    );

    return res.status(200).json({
      message: "API-keys updated",
      keys:    {
        geoapify:  updated.geoapify,
        nbn:       updated.nbn,
        recaptcha: updated.recaptcha,
      },
    });
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
