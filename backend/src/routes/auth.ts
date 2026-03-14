import { Router } from "express";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { UserModel } from "../db/models/User.js";
import { JWT_SECRET } from "../middleware/auth.js";

const router = Router();

// ── Signup ──────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const body = req.body as SignupRequest;
    const existing = await UserModel.findOne({ email: body.email });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await UserModel.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
    });
    const token = await new SignJWT({ userId: user._id.toString() })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
    const response: AuthResponse = { user: user.toJSON() as any, token };
    res.status(201).json(response);
  } catch (err) {
    res.status(500).json({ error: "Signup failed" });
  }
});

// ── Login ───────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const body = req.body as LoginRequest;
    const user = await UserModel.findOne({ email: body.email });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });
    const token = await new SignJWT({ userId: user._id.toString() })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
    const response: AuthResponse = { user: user.toJSON() as any, token };
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
