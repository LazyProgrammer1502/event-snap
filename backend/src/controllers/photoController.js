const cloudinary = require("../config/cloudinary");
const Event = require("../models/Event");
const Photo = require("../models/Photo");

// Cloudinary's SDK uploads from a stream; multer gives us the file in memory
// (req.file.buffer). We wrap the callback-based upload_stream in a Promise.
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) =>
      result ? resolve(result) : reject(err)
    );
    stream.end(buffer);
  });

// POST /api/events/:slug/photos   (multipart, field name "photo")
async function uploadPhoto(req, res) {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) return res.status(404).json({ error: "Event not found" });
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const result = await uploadToCloudinary(req.file.buffer, `eventsnap/${event.slug}`);

    const photo = await Photo.create({
      event: event._id,
      uploader: req.user._id,
      uploaderName: req.user.name,
      url: result.secure_url,
      publicId: result.public_id,
    });

    res.status(201).json({ photo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/events/:slug/photos   (the shared gallery)
async function listPhotos(req, res) {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) return res.status(404).json({ error: "Event not found" });

    const photos = await Photo.find({ event: event._id }).sort("-createdAt");
    res.json({ photos, eventName: event.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { uploadPhoto, listPhotos };
