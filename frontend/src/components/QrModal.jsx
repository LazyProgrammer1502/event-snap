import { useEffect, useState } from "react";
import api from "../api/axios";

// Fetches the QR for an event and shows it as a card the host can display or
// download. The QR image is a data URL the backend returns — no QR library
// needed on the frontend, it's just an <img src>.
export default function QrModal({ slug, eventName, onClose }) {
  const [qr, setQr] = useState(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    api.get(`/events/${slug}/qr`).then((res) => {
      setQr(res.data.qr);
      setUrl(res.data.url);
    });
  }, [slug]);

  const download = () => {
    const a = document.createElement("a");
    a.href = qr;
    a.download = `${eventName.replace(/\s+/g, "-")}-qr.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-5" onClick={onClose}>
      <div className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl" onClick={(e) => e.stopPropagation()}>
        <p className="text-xs font-medium uppercase tracking-wide text-coral">Scan to join</p>
        <h2 className="font-display mt-1 text-xl font-semibold text-ink">{eventName}</h2>

        <div className="mt-4 rounded-xl border border-black/5 bg-canvas p-4">
          {qr ? <img src={qr} alt="Event QR code" className="mx-auto w-48" /> : <div className="h-48 animate-pulse rounded bg-black/5" />}
        </div>

        <p className="mt-3 break-all text-xs text-muted">{url}</p>

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-black/10 py-2.5 text-sm font-medium text-ink">
            Close
          </button>
          <button onClick={download} disabled={!qr} className="flex-1 rounded-xl bg-coral py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
