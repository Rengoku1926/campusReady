import express from "express";

const router = express.Router();

// Example route
router.get("/status", (req, res) => {
  res.json({ status: "API is working! 🚀" });
});

export default router;
