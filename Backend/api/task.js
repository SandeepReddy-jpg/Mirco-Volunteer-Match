import { Router } from "express";
import { taskmodel } from "../modules/task.js";
import { usermodel } from "../modules/usermodule.js";
import { requireAuth, requireRole } from "./user.js";
import { sendTaskNotificationEmail } from "./email.js";

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

// POST /api/tasks/create
router.post(
  "/create",
  requireAuth,
  requireRole("organizer", "admin"),
  requireFields(["name", "description", "category"]),
  async (req, res, next) => {
    try {
      const task = await taskmodel.create({ ...req.body, postedBy: req.user.id });
      const users = await usermodel
        .find({ email: { $exists: true, $ne: "" } })
        .select("name email role");

      Promise.all(
        users.map((user) =>
          sendTaskNotificationEmail(user, task, "Created").then((result) => {
            if (!result.success) {
              console.error(`[email] Task-created notification failed for ${user.email}: ${result.error}`);
            }
          })
        )
      ).catch((error) => console.error("[email] Task broadcast failed:", error.message));

      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/tasks/all  (optional ?category=X filter)
router.get("/all", async (req, res, next) => {
  try {
    const query = { status: "open" };
    if (req.query.category)
      query.category = { $elemMatch: { $regex: req.query.category, $options: "i" } };
    const tasks = await taskmodel
      .find(query)
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET /api/tasks/matched/:userId
router.get(
  "/matched/:userId",
  requireAuth,
  validateObjectId("userId"),
  async (req, res, next) => {
    try {
      if (req.user.id !== req.params.userId && req.user.role !== "admin")
        return res.status(403).json({ message: "Cannot view another user's matches" });

      const user = await usermodel.findById(req.params.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const tasks = await taskmodel.find({ status: "open" }).populate("postedBy", "name email");
      const interests = new Set(
        [...(user.interest || []), ...(user.skills || [])].map((i) => i.toLowerCase())
      );

      const ranked = tasks
        .map((task) => ({
          task,
          matchScore: task.category.reduce(
            (score, cat) => score + (interests.has(cat.toLowerCase()) ? 1 : 0),
            0
          ),
        }))
        .sort((a, b) => b.matchScore - a.matchScore);

      res.json(ranked);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/tasks/accept/:id
router.patch(
  "/accept/:id",
  requireAuth,
  requireRole("volunteer", "admin"),
  validateObjectId("id"),
  async (req, res, next) => {
    try {
      const task = await taskmodel.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });
      if (task.status !== "open") return res.status(409).json({ message: "Task is not open" });

      // Prevent duplicate acceptance
      if (task.accepted.some((id) => id.toString() === req.user.id))
        return res.status(409).json({ message: "You have already accepted this task" });

      task.accepted.push(req.user.id);
      if (task.accepted.length >= task.members) task.status = "accepted";

      const saved = await task.save();

      // Email the volunteer about acceptance (non-blocking)
      const volunteer = await usermodel.findById(req.user.id).select("name email role");
      if (volunteer) {
        sendTaskNotificationEmail(volunteer, task, "Accepted").catch(() => {});
      }

      res.json(saved);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/tasks/complete/:id
router.patch(
  "/complete/:id",
  requireAuth,
  requireRole("volunteer", "organizer", "admin"),
  validateObjectId("id"),
  async (req, res, next) => {
    try {
      const task = await taskmodel.findById(req.params.id);
      if (!task) return res.status(404).json({ message: "Task not found" });

      if (
        req.user.role !== "admin" &&
        !task.accepted.some((id) => id.toString() === req.user.id)
      )
        return res.status(403).json({ message: "User has not accepted this task" });

      task.status = "completed";
      task.completedBy = req.user.id;
      await task.save();

      const contributor = await usermodel.findById(req.user.id);
      if (contributor) {
        contributor.contributionCount += 1;
        const badges = new Set(contributor.badges || []);
        badges.add("Rookie");
        if (contributor.contributionCount >= 1) badges.add("First Contribution");
        if (contributor.contributionCount >= 5) badges.add("Five Contributions");
        if (contributor.contributionCount >= 10) badges.add("Ten Contributions");
        contributor.badges = [...badges];
        await contributor.save();
      }

      // Email the volunteer about completion (non-blocking)
      const volunteer = await usermodel.findById(req.user.id).select("name email");
      if (volunteer) {
        sendTaskNotificationEmail(volunteer, task, "Completed").catch(() => {});
      }

      // Email the organizer about completion (non-blocking)
      const organizer = await usermodel.findById(task.postedBy).select("name email role");
      if (organizer) {
        sendTaskNotificationEmail(
          organizer,
          task,
          "Completed",
          `The volunteer has completed your task "${task.name}".`
        ).catch((error) =>
          console.error("[email] Organizer completion notification failed:", error.message)
        );
      }

      res.json(task);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/tasks/mine/:userId
router.get(
  "/mine/:userId",
  requireAuth,
  validateObjectId("userId"),
  async (req, res, next) => {
    try {
      if (req.user.id !== req.params.userId && req.user.role !== "admin")
        return res.status(403).json({ message: "Cannot view another user's tasks" });

      const tasks = await taskmodel
        .find({ $or: [{ postedBy: req.params.userId }, { accepted: req.params.userId }] })
        .sort({ createdAt: -1 });

      res.json(tasks);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
