# EventSnap — Backend

Event photo-sharing API: hosts create events, get a **QR code**, and guests upload photos (stored on **Cloudinary**) into a **shared gallery**. JWT auth.

## Run

```bash
cd backend
npm install
cp .env.example .env     # set JWT_SECRET, MONGO_URI, and Cloudinary keys
npm run dev              # http://localhost:5000
```

Get free Cloudinary keys at cloudinary.com → Dashboard (cloud name, API key, API secret).

## Flow

1. Host registers/logs in → gets a JWT.
2. Host creates an event → receives a `slug` and can fetch a QR code.
3. The QR encodes `CLIENT_URL/event/<slug>` — guests scan it, log in, and upload.
4. Photos go to Cloudinary; their URLs are saved and served in the gallery.

## Endpoints

| Method | Route                                    | Purpose                                   |
| ------ | ---------------------------------------- | ----------------------------------------- |
| POST   | `/api/auth/register` · `/api/auth/login` | Auth                                      |
| POST   | `/api/events`                            | Create an event (host)                    |
| GET    | `/api/events/mine`                       | Host's events                             |
| GET    | `/api/events/:slug`                      | Event info                                |
| GET    | `/api/events/:slug/qr`                   | QR code (data URL) for the event link     |
| POST   | `/api/events/:slug/photos`               | Upload a photo (multipart, field `photo`) |
| GET    | `/api/events/:slug/photos`               | Shared gallery                            |

## Notes

- Uploads are held in memory by multer and streamed straight to Cloudinary (max 10MB, images only).
- The event `slug` is a random code, so links aren't guessable in sequence.
