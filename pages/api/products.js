// pages/api/products.js
import dbConnect from "../../lib/dbConnect";
import Product   from "../../models/Product";
import jwt       from "jsonwebtoken";
import { parse } from "cookie";

// Helper: read & verify the token cookie
function requireAuth(req, res) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const token   = cookies.token;
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

  // ── PROTECT all non-GET methods ───────────────────────────
  let user = null;
  if (method !== "GET") {
    user = requireAuth(req, res);
    if (!user) return;  // stops here with 401 if not authenticated
  }

  // ── GET all products (public) ─────────────────────────────
  if (method === "GET") {
    const all = await Product.find({}).lean();
    const updatedAt =
      all.length > 0
        ? all.reduce(
            (max, p) =>
              p.updatedAt && new Date(p.updatedAt) > new Date(max)
                ? p.updatedAt
                : max,
            all[0].updatedAt || ""
          )
        : null;
    return res.status(200).json({ products: all, updatedAt });
  }

  // ── CREATE a product ──────────────────────────────────────
  if (method === "POST") {
    if (!user || (user.type !== "admin" && user.type !== "superadmin")) {
      return res.status(403).json({ error: "Forbidden: Admin or Superadmin only." });
    }
    const {
      categories,
      types,
      speed,
      title,
      subtitle,
      actualPrice,
      discountPrice,
      termsAndConditions = [],
      recommendation,
    } = req.body;

    // Minimal validation (added `types`)
    if (
      !categories ||
      !Array.isArray(categories) ||
      categories.length === 0 ||
      !types ||
      !Array.isArray(types) ||
      types.length === 0 ||
      !speed ||
      !title ||
      actualPrice == null ||  // allow zero
      !Array.isArray(termsAndConditions)
    ) {
      return res.status(400).json({
        error: "categories, types, speed, title and actualPrice are required."
      });
    }

    try {
      const created = await Product.create({
        categories,
        types,
        speed,
        title,
        subtitle,
        actualPrice,
        discountPrice,
        termsAndConditions,
        recommendation,
      });
      return res.status(201).json(created);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error creating product." });
    }
  }

  // ── UPDATE a product ──────────────────────────────────────
  if (method === "PUT") {
    if (!user || (user.type !== "admin" && user.type !== "superadmin")) {
      return res.status(403).json({ error: "Forbidden: Admin or Superadmin only." });
    }
    const {
      id,
      categories,
      types,
      speed,
      title,
      subtitle,
      actualPrice,
      discountPrice,
      termsAndConditions = [],
      recommendation,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Product id is required." });
    }

    try {
      const updated = await Product.findByIdAndUpdate(
        id,
        {
          categories,
          types,
          speed,
          title,
          subtitle,
          actualPrice,
          discountPrice,
          termsAndConditions,
          recommendation,
        },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: "Product not found." });
      }
      return res.status(200).json(updated);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error updating product." });
    }
  }

  // ── DELETE a product ──────────────────────────────────────
  if (method === "DELETE") {
    if (!user || (user.type !== "admin" && user.type !== "superadmin")) {
      return res.status(403).json({ error: "Forbidden: Admin or Superadmin only." });
    }
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Product id is required." });
    }
    try {
      const deleted = await Product.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found." });
      }
      return res.status(200).json({ message: "Product deleted." });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Error deleting product." });
    }
  }

  // ── METHOD NOT ALLOWED ─────────────────────────────────────
  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
