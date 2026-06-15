import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

// Cloudinary trick: inserting "fl_attachment" into the URL tells Cloudinary to
// serve the image as a download (Content-Disposition: attachment) instead of
// opening it in the browser. Cleaner than fetching the file ourselves.
const downloadUrl = (url) => url.replace("/upload/", "/upload/fl_attachment/");

export default function EventPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [eventName, setEventName] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState(null); // the full photo object being viewed
  const fileInput = useRef(null);

  const loadPhotos = () =>
    api
      .get(`/events/${slug}/photos`)
      .then((res) => {
        setPhotos(res.data.photos);
        setEventName(res.data.eventName);
      })
      .catch((err) => setError(err.response?.data?.error || "Couldn't load this event."));

  // Load once, then poll every 8s so other guests' photos appear automatically.
  useEffect(() => {
    loadPhotos();
    const t = setInterval(loadPhotos, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("photo", file);
        await api.post(`/events/${slug}/photos`, fd);
      }
      await loadPhotos();
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed. Try a smaller image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDelete = async (photo) => {
    if (!confirm("Delete this photo? This can't be undone.")) return;
    try {
      await api.delete(`/events/${slug}/photos/${photo._id}`);
      setLightbox(null);
      await loadPhotos();
    } catch (err) {
      alert(err.response?.data?.error || "Couldn't delete the photo.");
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Hero with back button */}
      <header className="relative bg-ink px-5 pb-8 pt-10 text-center text-white">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 top-9 flex items-center gap-1 text-sm text-white/80 hover:text-white"
          aria-label="Back to your events"
        >
          <span aria-hidden>←</span> Back
        </button>
        <p className="text-xs font-medium uppercase tracking-widest text-amber">Shared album</p>
        <h1 className="font-display mt-1 text-3xl font-semibold">{eventName || "Loading…"}</h1>
        <p className="mt-2 text-sm text-white/70">
          {photos.length} {photos.length === 1 ? "photo" : "photos"} so far
        </p>
      </header>

      {error && <p className="px-5 pt-4 text-center text-sm text-coral">{error}</p>}

      {/* Gallery */}
      <main className="px-3 pt-4">
        {photos.length === 0 ? (
          <div className="mx-auto mt-12 max-w-xs text-center text-muted">
            <p className="text-sm">No photos yet. Be the first to add one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {photos.map((p) => (
              <button
                key={p._id}
                onClick={() => setLightbox(p)}
                className="group relative aspect-square overflow-hidden rounded-xl bg-black/5"
              >
                <img
                  src={p.url}
                  alt={`by ${p.uploaderName || "guest"}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-2 py-1 text-left text-[10px] text-white/90">
                  {p.uploaderName}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Sticky upload bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-black/5 bg-canvas/95 px-5 py-4 backdrop-blur">
        <input ref={fileInput} type="file" accept="image/*" capture="environment" multiple onChange={handleFiles} className="hidden" />
        <button
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-coral py-4 text-base font-semibold text-white shadow-lg shadow-coral/25 disabled:opacity-70"
        >
          {uploading ? "Uploading…" : "📸  Add your photos"}
        </button>
      </div>

      {/* Lightbox with download + delete */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
          <div className="flex-1 overflow-hidden p-4" onClick={() => setLightbox(null)}>
            <img src={lightbox.url} alt="" className="mx-auto h-full max-w-full rounded-lg object-contain" />
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-black px-4 py-4">
            <span className="truncate text-sm text-white/70">by {lightbox.uploaderName || "guest"}</span>
            <div className="flex shrink-0 gap-2">
              {/* Download — uses the Cloudinary fl_attachment URL */}
              <a
                href={downloadUrl(lightbox.url)}
                className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
              >
                Download
              </a>
              {/* Delete — only shown on the current user's own photos */}
              {String(lightbox.uploader) === String(user?.id) && (
                <button
                  onClick={() => handleDelete(lightbox)}
                  className="rounded-lg bg-coral px-3 py-2 text-sm font-semibold text-white hover:bg-coral/90"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => setLightbox(null)}
                className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
