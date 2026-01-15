import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { pool } from "../db/pool";
import { signToken } from "../utils/jwt";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

  const { email, password } = parsed.data;

  try {
    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (email, password_hash)
      VALUES ($1, $2)
      RETURNING id, email, created_at
      `,
      [email.toLowerCase(), hash]
    );

    const user = result.rows[0];
    const token = signToken({ userId: user.id });

    res.status(201).json({ user, token });
  } catch (err: any) {
    // unique violation
    if (err?.code === "23505") return res.status(409).json({ message: "Email already exists" });
    console.error(err);
    res.status(500).json({ message: "Failed to register" });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

  const { email, password } = parsed.data;

  try {
    const found = await pool.query(
      `SELECT id, email, password_hash FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (found.rowCount === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = found.rows[0];
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken({ userId: user.id });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to login" });
  }
});

router.get("/me", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, created_at FROM users WHERE id = $1`,
      [req.userId]
    );
    if (result.rowCount === 0) return res.status(404).json({ message: "User not found" });
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

export default router;
