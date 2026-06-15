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

// DELETE /api/events/:slug/photos/:photoId
// Only the person who uploaded the photo (or the event host) can delete it.
async function deletePhoto(req, res) {
  try {
    const photo = await Photo.findById(req.params.photoId);
    if (!photo) return res.status(404).json({ error: "Photo not found" });

    const event = await Event.findById(photo.event);
    const isUploader = photo.uploader.equals(req.user._id);
    const isHost = event && event.host.equals(req.user._id);
    if (!isUploader && !isHost) return res.status(403).json({ error: "You can only delete your own photos" });

    // Remove the file from Cloudinary too, otherwise it lingers (and bills) there.
    await cloudinary.uploader.destroy(photo.publicId);
    await photo.deleteOne();

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { uploadPhoto, listPhotos, deletePhoto };
