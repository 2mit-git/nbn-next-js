import dbConnect from "../../lib/dbConnect";
import Product   from "../../models/Product";

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  // ── GET all products ───────────────────────────────────────────
  if (method === "GET") {
    const all = await Product.find({}).lean();
    return res.status(200).json(all);
  }

  // ── CREATE a product ──────────────────────────────────────────
  if (method === "POST") {
    const {
      category,
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
      !category ||
      !speed ||
      !title ||
      actualPrice == null  // allow zero
      || !Array.isArray(termsAndConditions)
    ) {
      return res.status(400).json({
        error: "category, speed, title and actualPrice are required."
      });
    }

    try {
      const created = await Product.create({
        category,
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
    const {
      id,
      category,
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
          category,
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
