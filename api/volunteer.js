import { Router } from "express";
import { volunteermodel } from "../modules/volunteer.js";
import { usermodel } from "../modules/usermodule.js";
import { requireAuth } from "./user.js";

const router = Router();

const requireFields = (fields) => (req, res, next) => {
  const missing = fields.filter(
    (f) => req.body[f] === undefined || req.body[f] === null || req.body[f] === ""
  );
  if (missing.length)
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  next();
};

// GET /api/volunteers/  — public listing
router.get("/", async (_req, res, next) => {
  try {
    const [profiles, users] = await Promise.all([
      volunteermodel.find().populate("userinfo", "name email avatar rating badges interest skills"),
      usermodel.find({ role: "volunteer" }).select("name email avatar rating badges interest skills"),
    ]);
    const profileUserIds = new Set(profiles.map((profile) => profile.userinfo?._id?.toString()).filter(Boolean));
    const unprofiledUsers = users
      .filter((user) => !profileUserIds.has(user._id.toString()))
      .map((user) => ({ userinfo: user, interest: user.interest, skills: user.skills, rating: user.rating }));
    res.json([...profiles, ...unprofiledUsers]);
  } catch (err) {
    next(err);
  }
});

// POST /api/volunteers/  — authenticated; a user creates their own volunteer profile
router.post(
  "/",
  requireAuth,
  requireFields(["userinfo", "interest", "skills"]),
  async (req, res, next) => {
    try {
      // Only the user themselves (or admin) can create their profile
      if (req.user.id !== req.body.userinfo && req.user.role !== "admin")
        return res.status(403).json({ message: "Cannot create a volunteer profile for another user" });

      // Prevent duplicate profile
      const existing = await volunteermodel.findOne({ userinfo: req.body.userinfo });
      if (existing)
        return res.status(409).json({ message: "Volunteer profile already exists for this user" });

      const profile = await volunteermodel.create(req.body);
      res.status(201).json(profile);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/volunteers/:id  — get a single volunteer profile
router.get("/:id", async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id))
      return res.status(400).json({ message: "Invalid id" });

    const profile = await volunteermodel
      .findById(req.params.id)
      .populate("userinfo", "name email avatar rating badges");
    if (!profile) return res.status(404).json({ message: "Volunteer profile not found" });
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/volunteers/:id  — authenticated; update own volunteer profile
router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id))
      return res.status(400).json({ message: "Invalid id" });

    const profile = await volunteermodel.findById(req.params.id);
    if (!profile) return res.status(404).json({ message: "Volunteer profile not found" });

    if (profile.userinfo.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Cannot update another user's volunteer profile" });

    const allowed = ["interest", "skills", "rating"];
    for (const field of allowed) {
      if (req.body[field] !== undefined) profile[field] = req.body[field];
    }
    await profile.save();
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

export default router;
