import { Router } from "express";
import { notificationmodel } from "../modules/notification.js";
import { requireAuth, requireRole } from "./user.js";

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

// POST /api/notifications/create  — organizer or admin only
router.post(
  "/create",
  requireAuth,
  requireRole("organizer", "admin"),
  requireFields(["user", "taskinfo", "message"]),
  async (req, res, next) => {
    try {
      const notification = await notificationmodel.create(req.body);
      res.status(201).json(notification);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/notifications/user/:userId  — own notifications only (admin sees all)
router.get(
  "/user/:userId",
  requireAuth,
  validateObjectId("userId"),
  async (req, res, next) => {
    try {
      if (req.user.id !== req.params.userId && req.user.role !== "admin")
        return res.status(403).json({ message: "Cannot view another user's notifications" });

      const notifications = await notificationmodel
        .find({ user: req.params.userId })
        .populate("taskinfo", "name description status")
        .sort({ createdAt: -1 });

      res.json(notifications);
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/notifications/read/:id  — mark a notification as read
router.patch(
  "/read/:id",
  requireAuth,
  validateObjectId("id"),
  async (req, res, next) => {
    try {
      const notification = await notificationmodel.findById(req.params.id);
      if (!notification) return res.status(404).json({ message: "Notification not found" });

      // Only the owner (or admin) can mark as read
      if (
        notification.user.toString() !== req.user.id &&
        req.user.role !== "admin"
      )
        return res.status(403).json({ message: "Cannot mark another user's notification as read" });

      notification.read = true;
      await notification.save();
      res.json(notification);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/notifications/:id  — remove a notification (admin or owner)
router.delete("/:id", requireAuth, validateObjectId("id"), async (req, res, next) => {
  try {
    const notification = await notificationmodel.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification not found" });

    if (notification.user.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Cannot delete another user's notification" });

    await notification.deleteOne();
    res.json({ message: "Notification deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
