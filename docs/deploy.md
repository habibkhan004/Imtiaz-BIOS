# Deploy topology (Phase 1)

## Current (monolithic Next.js)

| Layer | Choice |
|-------|--------|
| App + API | Next.js App Router on one host (local `npm run dev` / Vercel) |
| Metadata | JSON adapter → `.data/imtiaz-db.json` (swap to Mongo later) |
| Binaries | Private disk → `.data/objects/` via `FileStorage` (swap to S3) |
| Auth | HTTP-only signed session cookie (`AUTH_SECRET`) |

## Recommended production split

1. **Frontend / App Router** — Vercel (or any Node host)
2. **MongoDB** — Atlas replica set; set `MONGODB_URI` when Mongoose adapter is wired
3. **Object storage** — S3-compatible bucket (private ACL); implement `put` / `getSignedUrl` / `delete` in `app/lib/server/file-storage.ts`
4. **Secrets** — `AUTH_SECRET`, storage credentials, never commit `.env`

## Env checklist

Copy `.env.example` → `.env.local`:

- `AUTH_SECRET` — long random string
- `INTRO_DURATION_DAYS` — default 183
- `FILE_STORAGE_ROOT` / `DATA_DB_PATH` — local demo paths
- `CORS_ORIGINS` — production origins allowlist
- `MONGODB_URI` — leave empty until Mongo adapter lands
- `FEATURE_*` — Phase 2/3 flags (default off)

## Database

Set `MONGODB_URI` in **`.env.local`** (gitignored). On first API hit the app seeds Atlas and persists all collections. Verify with:

```text
GET http://localhost:3000/api/health
```

Expect `"backend": "mongo"` and non-zero `counts`. In Atlas → Browse Collections → database `imtiaz_bios`.

If Mongo is unreachable (IP not allowlisted in Network Access), the app logs a warning and falls back to the JSON file store.

## Horizontal scale note

Session cookies are HMAC-signed and stateless (no sticky sessions required). Replace JSON file store before multi-instance production — it is process-local and file-locked, not cluster-safe.
