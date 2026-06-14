import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import QrModal from "../components/QrModal";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [qrFor, setQrFor] = useState(null); // event object whose QR is open

  const load = () => api.get("/events/mine").then((res) => setEvents(res.data.events));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      await api.post("/events", { name, date: date || undefined });
      setName(""); setDate("");
      load();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-5 py-6">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Your events</h1>
          <p className="text-sm text-muted">Hi {user?.name?.split(" ")[0]} — create an event and share its code.</p>
        </div>
        <button onClick={logout} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-ink">
          Log out
        </button>
      </header>

      {/* Create */}
      <div className="mb-8 rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-ink">New event</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <input
            placeholder="e.g. Sara & Ali's Wedding"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1 rounded-xl border border-black/10 px-3 py-2.5 text-sm outline-none focus:border-coral focus:ring-2 focus:ring-coral/20"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-black/10 px-3 py-2.5 text-sm text-muted outline-none focus:border-coral"
          />
          <button
            onClick={create}
            disabled={creating}
            className="rounded-xl bg-coral px-4 py-2.5 text-sm font-semibold text-white hover:bg-coral/90 disabled:opacity-60"
          >
            {creating ? "Creating…" : "Create"}
          </button>
        </div>
      </div>

      {/* List */}
      {events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white py-12 text-center">
          <p className="text-sm text-muted">No events yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <div key={ev._id} className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
              <div>
                <Link to={`/event/${ev.slug}`} className="font-display text-lg font-semibold text-ink hover:text-coral">
                  {ev.name}
                </Link>
                <p className="text-xs text-muted">
                  {ev.date ? new Date(ev.date).toLocaleDateString() : "No date set"}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setQrFor(ev)} className="rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-white">
                  QR code
                </button>
                <Link to={`/event/${ev.slug}`} className="rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-ink">
                  Open
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {qrFor && <QrModal slug={qrFor.slug} eventName={qrFor.name} onClose={() => setQrFor(null)} />}
    </div>
  );
}
