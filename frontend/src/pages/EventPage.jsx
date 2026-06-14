import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function EventPage() {
  const { slug } = useParams(); // the code from the URL /event/:slug
  const [eventName, setEventName] = useState("");
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState(null); // url of the photo opened full-screen
  const fileInput = useRef(null);

  const loadPhotos = () =>
    api
      .get(`/events/${slug}/photos`)
      .then((res) => {
        setPhotos(res.data.photos);
        setEventName(res.data.eventName);
      })
      .catch((err) => setError(err.response?.data?.error || "Couldn't load this event."));

  // Load once, then POLL every 8s so new photos from other guests appear
  // automatically — that's what makes the gallery feel "live" without a
  // websocket. The cleanup stops the timer when you leave the page.
  useEffect(() => {
    loadPhotos();
    const t = setInterval(loadPhotos, 8000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Sending a file isn't JSON — it's multipart form data. We build a FormData
  // object, append the file under the field name the backend expects ("photo"),
  // and axios sets the right Content-Type automatically.
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
      e.target.value = ""; // reset so the same file can be picked again
    }
  };

  return (
    <div className="min-h-screen pb-28">
      {/* Hero */}
      <header className="bg-ink px-5 pb-8 pt-10 text-center text-white">
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
                onClick={() => setLightbox(p.url)}
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

      {/* Sticky upload bar — big tap target, opens the phone camera */}
      <div className="fixed inset-x-0 bottom-0 border-t border-black/5 bg-canvas/95 px-5 py-4 backdrop-blur">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFiles}
          className="hidden"
        />
        <button
          onClick={() => fileInput.current?.click()}
          disabled={uploading}
          className="mx-auto flex w-full max-w-md items-center justify-center gap-2 rounded-2xl bg-coral py-4 text-base font-semibold text-white shadow-lg shadow-coral/25 disabled:opacity-70"
        >
          {uploading ? "Uploading…" : "📸  Add your photos"}
        </button>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
