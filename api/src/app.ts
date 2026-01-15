import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import diningHallsRouter from "./routes/diningHalls.routes";
import authRouter from "./routes/auth.routes";
import reviewsRouter from "./routes/reviews.routes";

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/dining-halls", diningHallsRouter);
app.use("/auth", authRouter);
app.use("/", reviewsRouter); // reviews routes include /reviews/:id etc.

export default app;
