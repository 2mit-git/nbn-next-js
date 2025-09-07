import dbConnect from "../../lib/dbConnect";
import Permission from "../../models/Permission";
import jwt from "jsonwebtoken";
import { parse } from "cookie";

// Auth helper (same as in products.js)
function requireAuth(req, res) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token = cookies.token;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    res.status(401).json({ error: "Invalid token" });
    return null;
  }
}

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  if (method === "GET") {
    // Return the single permission doc, create default if none
    let doc = await Permission.findOne().lean();
    if (!doc) {
      doc = await Permission.create({ business: true, residential: true });
      doc = doc.toObject();
    }
    return res.status(200).json(doc);
  }

  // Auth required for updates
  const user = requireAuth(req, res);
  if (!user) return;

  if (user.type !== "admin" && user.type !== "superadmin") {
    return res
      .status(403)
      .json({ error: "Forbidden: Admin or Superadmin only." });
  }

  if (method === "PUT") {
    const { business, residential } = req.body;

    try {
      const updated = await Permission.findOneAndUpdate(
        {},
        {
          ...(business !== undefined ? { business: !!business } : {}),
          ...(residential !== undefined ? { residential: !!residential } : {}),
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean();

      return res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error updating permissions." });
    }
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
