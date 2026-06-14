const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // short random code used in the public URL guests scan/visit, e.g. /event/a1b2c3d4e5
    slug: { type: String, required: true, unique: true, index: true },
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
