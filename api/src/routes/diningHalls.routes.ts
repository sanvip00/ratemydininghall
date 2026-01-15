import { Router } from "express";
import { pool } from "../db/pool";

const router = Router();

// GET /dining-halls?school=Drexel&query=Urban
router.get("/", async (req, res) => {
  const school = (req.query.school as string) || "Drexel";
  const query = (req.query.query as string) || "";

  try {
    const result = await pool.query(
      `
      SELECT id, school, name, location
      FROM dining_halls
      WHERE school = $1
        AND ($2 = '' OR name ILIKE '%' || $2 || '%')
      ORDER BY name ASC
      `,
      [school, query]
    );

    res.json({ data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dining halls" });
  }
});

// GET /dining-halls/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const hall = await pool.query(
      `SELECT id, school, name, location FROM dining_halls WHERE id = $1`,
      [id]
    );

    if (hall.rowCount === 0) return res.status(404).json({ message: "Not found" });

    res.json({ data: hall.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch dining hall" });
  }
});

// GET /dining-halls/:id/summary
router.get("/:id/summary", async (req, res) => {
  const { id } = req.params;

  try {
    const agg = await pool.query(
      `
      SELECT
        COUNT(*)::int AS "totalReviews",
        COALESCE(AVG(rating), 0)::float AS "avgRating"
      FROM reviews
      WHERE dining_hall_id = $1
      `,
      [id]
    );

    const dist = await pool.query(
      `
      SELECT rating, COUNT(*)::int AS count
      FROM reviews
      WHERE dining_hall_id = $1
      GROUP BY rating
      ORDER BY rating ASC
      `,
      [id]
    );

    const ratingCounts: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
    for (const row of dist.rows) ratingCounts[String(row.rating)] = row.count;

    res.json({
      data: {
        totalReviews: agg.rows[0].totalReviews,
        avgRating: agg.rows[0].avgRating,
        ratingCounts,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch summary" });
  }
});

export default router;
