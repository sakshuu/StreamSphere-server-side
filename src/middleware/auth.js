import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const token = req.cookies.access_token;
  if (!token) return res.status(401).json({ message: "Please sign in to continue." });
  try { req.userId = jwt.verify(token, process.env.JWT_SECRET).userId; next(); }
  catch { return res.status(401).json({ message: "Your session has expired. Please sign in again." }); }
}
