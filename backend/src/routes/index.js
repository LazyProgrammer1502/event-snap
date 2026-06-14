const express = require("express");
const multer = require("multer");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { register, login } = require("../controllers/authController");
const { createEvent, myEvents, getEvent, getQr } = require("../controllers/eventController");
const { uploadPhoto, listPhotos } = require("../controllers/photoController");

// Keep the file in memory (we stream it straight to Cloudinary), cap at 10MB,
// and accept images only.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    file.mimetype.startsWith("image/") ? cb(null, true) : cb(new Error("Only image files are allowed")),
});

// Auth
router.post("/auth/register", register);
router.post("/auth/login", login);

// Events
router.post("/events", protect, createEvent);
router.get("/events/mine", protect, myEvents);
router.get("/events/:slug", protect, getEvent);
router.get("/events/:slug/qr", protect, getQr);

// Photos
router.post("/events/:slug/photos", protect, upload.single("photo"), uploadPhoto);
router.get("/events/:slug/photos", protect, listPhotos);

module.exports = router;
