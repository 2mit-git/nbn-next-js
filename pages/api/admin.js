// pages/api/admins.js
import dbConnect from "../../lib/dbConnect";
import Admin      from "../../models/Admin";
import bcrypt     from "bcryptjs";
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

  // ── GET all admins ───────────────────────────────────────────────
  if (req.method === "GET") {
    const all = await Admin.find({}, "-password").lean();
    return res.status(200).json(all);
  }

  // ── CREATE new admin ─────────────────────────────────────────────
  if (req.method === "POST") {
    const user = requireAuth(req, res);
    if (!user) return;
    const { email,number, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required." });
    }
    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: "Email already in use." });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newAdmin = await Admin.create({ email,number,password: hash });
    return res.status(201).json({
      message: "Admin created",
      admin: { id: newAdmin._id, email: newAdmin.email,number: newAdmin.number },
    });
  }

  // ── UPDATE password ─────────────────────────────────────────────
  if (req.method === "PUT") {
    const user = requireAuth(req, res);
    if (!user) return;
    const { id, password } = req.body;
    if (!id || !password) {
      return res.status(400).json({ error: "id and password required." });
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const updated = await Admin.findByIdAndUpdate(
      id,
      { password: hash },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ error: "Admin not found." });
    }
    return res.status(200).json({ message: "Password updated." });
  }

  // ── DELETE admin ────────────────────────────────────────────────
  if (req.method === "DELETE") {
    const user = requireAuth(req, res);
    if (!user) return;
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "id required." });
    }
    const deleted = await Admin.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: "Admin not found." });
    }
    return res.status(200).json({ message: "Admin deleted." });
  }

  // ── METHOD NOT ALLOWED ──────────────────────────────────────────
  res.setHeader("Allow", ["GET","POST","PUT","DELETE"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
