import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import { connect } from "mongoose";
import { prepareUserIndexes } from "./modules/usermodule.js";

// Route modules
import userRouter, { authRouter } from "./api/user.js"; // registers Passport strategy on import
import taskApi from "./api/task.js";
import volunteerApi from "./api/volunteer.js";
import ratingApi from "./api/rating.js";
import notificationApi from "./api/notification.js";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:3000").split(","),
]
  .filter(Boolean)
  .join(",")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ─── Core middleware ──────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());

// express-session is needed for the Google OAuth handshake (Passport stores state in session)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: 10 * 60 * 1000, // 10 min — only needed during the OAuth flow
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/users", userRouter);       // register, login, profile, update
app.use("/api/auth", authRouter);        // google OAuth, logout, me

app.use("/api/tasks", taskApi);
app.use("/api/volunteers", volunteerApi);
app.use("/api/recognition", ratingApi);
app.use("/api/notifications", notificationApi);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(err);

  if (err.name === "ValidationError" || err.name === "CastError")
    return res.status(400).json({ message: err.message });

  if (err.code === 11000)
    return res.status(409).json({ message: "Email already exists" });

  res.status(500).json({
    message:
      process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ─── Database + server start ──────────────────────────────────────────────────
const port = Number(process.env.PORT || 9000);

async function connection() {
  try {
    await connect(process.env.MONGO_URI);
    await prepareUserIndexes();
    console.log("MongoDB connected successfully");
    app.listen(port, () => console.log(`Server running on ${port}`));
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
}

connection();
