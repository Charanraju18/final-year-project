import Notification from "../models/Notification.js";

// GET /api/notifications
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({ notifications });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// PUT /api/notifications/:notificationId/read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res.status(200).json({ notification });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return res
      .status(200)
      .json({ message: "All notifications marked as read." });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
