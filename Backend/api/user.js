import { Router } from "express";
import "dotenv/config";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { usermodel } from "../modules/usermodule.js";
import { sendWelcomeEmail } from "./email.js";

const jwtSecret = process.env.JWT_SECRET;
const authCookie = "authToken";

// Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬ Helpers Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬

function setAuthCookie(res, user) {
  const isProd = process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
  res.cookie(authCookie, createToken(user), {
    httpOnly: true,
    sameSite: process.env.COOKIE_SAME_SITE || (isProd ? "none" : "lax"),
    secure: isProd,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

const requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter(
    (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ""
  );
  if (missing.length)
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  next();
};

const validateObjectId = (field) => (req, res, next) => {
  if (!/^[a-f\d]{24}$/i.test(req.params[field]))
    return res.status(400).json({ message: `Invalid ${field}` });
  next();
};

// Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬ Exported auth utilities (used by other route files) Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬Ã¢â€ â‚¬

export function createToken(user) {
  const id = user.id || (user._id ? user._id.toString() : "");
  return jwt.sign({ id, email: user.email, role: user.role }, jwtSecret, {
    expiresIn: "7d",
  });
}

export function requireAuth(req, res, next) {
  let token = req.cookies?.[authCookie];
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7).trim();
  } else if (!token && req.headers.authorization) {
    token = req.headers.authorization.trim();
  }
  if (!token) return res.status(401).json({ message: "Authentication required" });

  jwt.verify(token, jwtSecret, (error, user) => {
    if (error) return res.status(401).json({ message: "Invalid or expired token" });
    req.user = user;
    if (!req.user.id && req.user._id) req.user.id = req.user._id;
    next();
  });
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ message: "Insufficient permissions" });
    next();
  };
}

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Google OAuth Strategy setup Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email returned from Google"), null);

        // Find by googleId OR email (handles account linking)
        let user = await usermodel.findOne({
          $or: [{ googleId: profile.id }, { email }],
        });

        if (user) {
          // Link googleId if account was originally created with email/password
          if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = user.avatar || profile.photos?.[0]?.value;
            await user.save();
          }
        } else {
          // First-time Google sign-in Ã¢â‚¬â€ create account
          user = await usermodel.create({
            name: profile.displayName,
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
            role: "volunteer",
          });
          sendWelcomeEmail(user).catch(() => {});
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// Passport session hooks (needed even in JWT-mode for the OAuth handshake)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    done(null, await usermodel.findById(id));
  } catch (err) {
    done(err, null);
  }
});

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ /api/users  router Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const userRouter = Router();

// POST /api/users/register
userRouter.post(
  "/register",
  requireFields(["name", "email", "password"]),
  async (req, res, next) => {
    try {
      const { name, email, password, interest, skills, role } = req.body;
      const user = await usermodel.create({
        name,
        email,
        password,
        interest,
        skills,
        role: role === "organizer" ? "organizer" : "volunteer",
      });
      const token = createToken(user);
      setAuthCookie(res, user);
      sendWelcomeEmail(user).catch(() => {});
      res.status(201).json({ token, id: user.id, name: user.name, email: user.email, role: user.role, badges: user.badges, contributionCount: user.contributionCount, rating: user.rating });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/users/login
userRouter.post("/login", requireFields(["email", "password"]), async (req, res, next) => {
  try {
    const user = await usermodel.findOne({ email: req.body.email }).select("+password");
    if (!user || !(await user.comparePassword(req.body.password)))
      return res.status(401).json({ message: "Invalid email or password" });
    const token = createToken(user);
    setAuthCookie(res, user);
    res.json({ token, id: user.id, name: user.name, email: user.email, role: user.role, badges: user.badges, contributionCount: user.contributionCount, rating: user.rating });
  } catch (err) {
    next(err);
  }
});

// GET /api/users/me
userRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const user = await usermodel.findById(userId).select("-password -googleId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/profile/:id
userRouter.get("/profile/:id", validateObjectId("id"), async (req, res, next) => {
  try {
    const user = await usermodel.findById(req.params.id).select("-password -googleId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/users/update/:id
userRouter.patch(
  "/update/:id",
  requireAuth,
  validateObjectId("id"),
  async (req, res, next) => {
    try {
      if (req.user.id !== req.params.id)
        return res.status(403).json({ message: "Cannot update another user" });

      const allowed = ["name", "email", "password", "interest", "skills"];
      const user = await usermodel.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });

      for (const field of allowed) {
        if (req.body[field] !== undefined) user[field] = req.body[field];
      }
      await user.save();
      res.json(await usermodel.findById(user.id).select("-password -googleId"));
    } catch (err) {
      next(err);
    }
  }
);

// Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ /api/auth  router Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬

const authRouter = Router();

// GET /api/auth/google  Ã¢â‚¬â€ start OAuth flow (open in browser)
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: true })
);

// GET /api/auth/google/callback  Ã¢â‚¬â€ Google redirects here after consent
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: true,
    failureRedirect: `${process.env.CLIENT_URL || "http://localhost:3000"}/login?error=google_failed`,
  }),
  (req, res) => {
    // Issue our own JWT cookie so the rest of the app stays stateless
    setAuthCookie(res, req.user);
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:3000"}/dashboard`);
  }
);

// GET /api/auth/logout
authRouter.get("/logout", (req, res) => {
  res.clearCookie(authCookie);
  res.json({ message: "Logged out successfully" });
});

// GET /api/auth/me  Ã¢â‚¬â€ who am I?
authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await usermodel.findById(req.user.id).select("-password -googleId");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export { authRouter };
export default userRouter;
