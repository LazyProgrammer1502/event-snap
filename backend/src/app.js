const express = require("express");
const cors = require("cors");
const multer = require("multer");
const routes = require("./routes");

const app = express();

const allowed = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : true;
app.use(cors({ origin: allowed, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", routes);

// Error handler — turns multer/upload errors into clean JSON instead of crashing.
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("image files")) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong" });
});

module.exports = app;
