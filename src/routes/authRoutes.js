import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { publicUser } from "../utils/userResponse.js";

const router = Router();
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", maxAge: 7 * 24 * 60 * 60 * 1000 };
function issueToken(res, userId) { res.cookie("access_token", jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" }), cookieOptions); }

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: "Name, email, and a password with at least 8 characters are required." });
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: "An account with this email already exists." });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    issueToken(res, user._id); res.status(201).json({ user: publicUser(user) });
  } catch (error) { next(error); }
});
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: String(req.body.email || "").toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Incorrect email or password." });
    issueToken(res, user._id); res.json({ user: publicUser(user) });
  } catch (error) { next(error); }
});
router.post("/logout", (_req, res) => { res.clearCookie("access_token", cookieOptions); res.status(204).end(); });
router.get("/me", requireAuth, async (req, res, next) => { try { const user = await User.findById(req.userId); res.json({ user: publicUser(user) }); } catch (error) { next(error); } });
router.patch("/profile", requireAuth, async (req, res, next) => { try { const user = await User.findByIdAndUpdate(req.userId, { $set: { name: req.body.name, avatar: req.body.avatar } }, { new: true, runValidators: true }); res.json({ user: publicUser(user) }); } catch (error) { next(error); } });
export default router;
