import { Router } from "express";
import { ratingmodel } from "../modules/rating.js";
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

const validateObjectId = (field) => (req, res, next) => {
  if (!/^[a-f\d]{24}$/i.test(req.params[field]))
    return res.status(400).json({ message: `Invalid ${field}` });
  next();
};

// POST /api/recognition/rate
router.post(
  "/rate",
  requireAuth,
  requireFields(["ratedUser", "task", "rating"]),
  async (req, res, next) => {
    try {
      // Validate rating value
      const ratingValue = Number(req.body.rating);
      if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5)
        return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });

      // Prevent a user from rating themselves
      if (req.user.id === req.body.ratedUser)
        return res.status(400).json({ message: "You cannot rate yourself" });

      // Prevent duplicate rating: same rater, same task, same user
      const duplicate = await ratingmodel.findOne({
        ratedBy: req.user.id,
        ratedUser: req.body.ratedUser,
        task: req.body.task,
      });
      if (duplicate)
        return res.status(409).json({ message: "You have already rated this user for this task" });

      const rating = await ratingmodel.create({
        ...req.body,
        rating: ratingValue,
        ratedBy: req.user.id,
      });

      // Recalculate the average rating for the rated user
      const allRatings = await ratingmodel.find({ ratedUser: req.body.ratedUser });
      const average =
        allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

      const user = await usermodel.findById(req.body.ratedUser);
      if (!user) return res.status(404).json({ message: "Rated user not found" });

      // Badge logic
      const badges = new Set(user.badges);
      if (user.contributionCount >= 1) badges.add("First Contribution");
      if (user.contributionCount >= 5) badges.add("Five Contributions");
      if (average >= 4.5) badges.add("Highly Rated");

      user.rating = Number(average.toFixed(2));
      user.badges = [...badges];
      await user.save();

      res.status(201).json({ rating, averageRating: user.rating, badges: user.badges });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/recognition/user/:userId
router.get("/user/:userId", requireAuth, validateObjectId("userId"), async (req, res, next) => {
  try {
    const [ratings, user] = await Promise.all([
      ratingmodel
        .find({ ratedUser: req.params.userId })
        .populate("ratedBy", "name")
        .populate("task", "name")
        .sort({ createdAt: -1 }),
      usermodel.findById(req.params.userId).select("badges rating"),
    ]);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ ratings, badges: user.badges, averageRating: user.rating });
  } catch (err) {
    next(err);
  }
});

export default router;
