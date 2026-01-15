import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { requireAuth, AuthedRequest } from "../middleware/auth";

const router = Router();

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// GET /dining-halls/:id/reviews?page=1&limit=10&sort=recent
router.get("/dining-halls/:id/reviews", async (req, res) => {
  const diningHallId = req.params.id;
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));
  const offset = (page - 1) * limit;

  try {
    const rows = await pool.query(
      `
      SELECT r.id, r.rating, r.comment, r.created_at, r.updated_at,
             u.id AS user_id, u.email AS user_email
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      WHERE r.dining_hall_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
      `,
      [diningHallId, limit, offset]
    );

    const total = await pool.query(
      `SELECT COUNT(*)::int AS count FROM reviews WHERE dining_hall_id = $1`,
      [diningHallId]
    );

    res.json({
      data: rows.rows,
      page,
      limit,
      total: total.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// POST /dining-halls/:id/reviews (auth)
router.post("/dining-halls/:id/reviews", requireAuth, async (req: AuthedRequest, res) => {
  const diningHallId = req.params.id;

  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

  try {
    const result = await pool.query(
      `
      INSERT INTO reviews (user_id, dining_hall_id, rating, comment)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, dining_hall_id)
      DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment
      RETURNING id, rating, comment, created_at, updated_at
      `,
      [req.userId, diningHallId, parsed.data.rating, parsed.data.comment ?? null]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create review" });
  }
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional(),
});

// PUT /reviews/:id (auth + owner-only)
router.put("/reviews/:id", requireAuth, async (req: AuthedRequest, res) => {
  const reviewId = req.params.id;

  const parsed = updateReviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });

  try {
    // ensure owner
    const owner = await pool.query(`SELECT user_id FROM reviews WHERE id = $1`, [reviewId]);
    if (owner.rowCount === 0) return res.status(404).json({ message: "Review not found" });
    if (owner.rows[0].user_id !== req.userId) return res.status(403).json({ message: "Forbidden" });

    const rating = parsed.data.rating ?? null;
    const comment = parsed.data.comment ?? null;

    const updated = await pool.query(
      `
      UPDATE reviews
      SET rating = COALESCE($1, rating),
          comment = COALESCE($2, comment)
      WHERE id = $3
      RETURNING id, rating, comment, created_at, updated_at
      `,
      [rating, comment, reviewId]
    );

    res.json({ data: updated.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update review" });
  }
});

// DELETE /reviews/:id (auth + owner-only)
router.delete("/reviews/:id", requireAuth, async (req: AuthedRequest, res) => {
  const reviewId = req.params.id;

  try {
    const owner = await pool.query(`SELECT user_id FROM reviews WHERE id = $1`, [reviewId]);
    if (owner.rowCount === 0) return res.status(404).json({ message: "Review not found" });
    if (owner.rows[0].user_id !== req.userId) return res.status(403).json({ message: "Forbidden" });

    await pool.query(`DELETE FROM reviews WHERE id = $1`, [reviewId]);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete review" });
  }
});

export default router;
