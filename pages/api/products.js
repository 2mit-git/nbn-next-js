import dbConnect from "../../lib/dbConnect";
import Product   from "../../models/Product";
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
  const { method } = req;

  // ── GET all products ───────────────────────────────────────────
  if (method === "GET") {
    const all = await Product.find({}).lean();
    // Find the latest updatedAt timestamp
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

  // ── CREATE a product ──────────────────────────────────────────
  if (method === "POST") {
    const user = requireAuth(req, res);
    if (!user) return;
    const {
      categories,
      speed,
      title,
      subtitle,
      actualPrice,
      discountPrice,
      termsAndConditions = [],
      recommendation,
    } = req.body;

    // required checks
    if (
      !categories ||
      !Array.isArray(categories) ||
      categories.length === 0 ||
      !speed ||
      !title ||
      actualPrice == null  // allow zero
      || !Array.isArray(termsAndConditions)
    ) {
      return res.status(400).json({
        error: "categories, speed, title and actualPrice are required."
      });
    }

    try {
      const created = await Product.create({
        categories,
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

  // ── UPDATE a product ──────────────────────────────────────────
  if (method === "PUT") {
    const user = requireAuth(req, res);
    if (!user) return;
    const {
      id,
      categories,
      speed,
      title,
      subtitle,
      actualPrice,
      discountPrice,
      termsAndConditions =[],
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

  // ── DELETE a product ──────────────────────────────────────────
  if (method === "DELETE") {
    const user = requireAuth(req, res);
    if (!user) return;
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

  // ── METHOD NOT ALLOWED ────────────────────────────────────────
  res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  res.status(405).end(`Method ${method} Not Allowed`);
}
