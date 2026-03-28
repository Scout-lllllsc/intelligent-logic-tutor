import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { existsSync } from "fs";
import path from "path";
import circuitRoutes from "./routes/circuitRoutes";

dotenv.config();

const app = express();
const frontendDistPath =
  process.env.FRONTEND_DIST_PATH ||
  path.resolve(__dirname, "../../frontend/dist");
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    }
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    port: Number(process.env.PORT || 5001),
    mode: process.env.NODE_ENV || "development"
  });
});

app.use("/api", circuitRoutes);

if (existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
}

export default app;
