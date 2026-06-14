const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploaderName: { type: String }, // denormalized for quick display in the gallery
    url: { type: String, required: true }, // Cloudinary secure URL
    publicId: { type: String, required: true }, // Cloudinary id (needed to delete later)
  },
  { timestamps: true }
);

module.exports = mongoose.model("Photo", photoSchema);
