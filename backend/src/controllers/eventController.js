const crypto = require("crypto");
const QRCode = require("qrcode");
const Event = require("../models/Event");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// POST /api/events  (host creates an event)
async function createEvent(req, res) {
  try {
    const { name, date } = req.body;
    if (!name) return res.status(400).json({ error: "Event name is required" });

    // short random, URL-safe code for the public link guests will use
    const slug = crypto.randomBytes(5).toString("hex");
    const event = await Event.create({ name, date, slug, host: req.user._id });
    res.status(201).json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/events/mine  (events created by the logged-in host)
async function myEvents(req, res) {
  try {
    const events = await Event.find({ host: req.user._id }).sort("-createdAt");
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/events/:slug  (anyone with the link can see basic event info)
async function getEvent(req, res) {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json({ event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/events/:slug/qr  -> { qr: "<data-url png>", url }
// The QR encodes the public event page; scanning it opens the upload/gallery.
async function getQr(req, res) {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) return res.status(404).json({ error: "Event not found" });

    const url = `${CLIENT_URL}/event/${event.slug}`;
    const qr = await QRCode.toDataURL(url, { width: 400, margin: 2 });
    res.json({ qr, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createEvent, myEvents, getEvent, getQr };
