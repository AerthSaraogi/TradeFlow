import express from "express";
import { jwtVerify } from "jose";

const JWT_SECRET_STR = process.env.JWT_SECRET || "tradeflow-secret";
export const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STR);

export async function authenticateToken(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token required" });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    (req as any).userId = payload.userId as string;
    next();
  } catch {
    return res.status(403).json({ error: "Invalid token" });
  }
}
