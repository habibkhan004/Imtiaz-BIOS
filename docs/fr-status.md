# IMTIAZ BIOS — FR / SRS status (§1–15 + §16–25)

**Adapter:** When `MONGODB_URI` is set (in `.env.local`), data persists to Atlas collections (`User`, `FileAsset`, `Category`, …). Otherwise falls back to `.data/imtiaz-db.json`. Check `GET /api/health` for `backend: "mongo"`.

## FR-01 … FR-27

| Area | Status | Notes |
|------|--------|-------|
| FR-01…04 Auth/profile | Done | bcrypt, session cookie, reset tokens, profile API |
| FR-05…10 Library | Done | API search/filter/sort/detail + URL params; static merge remains |
| FR-11…13 Trial/plans/entitlement | Done | Configurable intro + `assertCanDownload` |
| FR-14…19 Uploads/download | Partial→Done | Upload→review APIs; secure stream; seed stubs only for catalog seeds |
| FR-20…26 Requests/support/notify | Done | APIs + portal forms; `/password-support` (FR-22) |
| FR-27 Admin dashboard | Done | Live aggregates |
| FR-E01 Welcome email | Done | Nodemailer branded template on register |
| FR-E02 Reset email | Done | Hashed 1h token + branded mail; generic API |
| FR-E03 Password changed email | Done | Confirmation after successful reset |

## §6–15

| Area | Status |
|------|--------|
| §6 File management | Partial — validation, safe keys, private storage; malware = Phase 3 hook |
| §10 Mongo | Done when `MONGODB_URI` set — see `/api/health` |
| §14 APIs | Done (listed routes + extras: brands, plans, audit, reports, settings) |
| §15 Security | Partial — hash, RBAC, rate limit, headers; CORS allowlist |

## §16–25 (this prompt)

| Area | Status | Notes |
|------|--------|-------|
| §16 NFRs | Partial | Pagination on admin lists + library/audit; JSON still in-memory per process |
| §17 Architecture | Done | Next App Router + modular lib; Express-extractable contracts |
| §18 IA / routes | Done | `/dashboard/*`→`/portal/*`, `/upload`, `/request`, `/admin/tickets`→support, `/password-support` |
| §19 Permissions | Done | `requireAuth` / `requireRole` / `requireEntitlement` in `app/lib/auth` + `entitlement` |
| §20 Reports | Done | `GET /api/admin/reports` live aggregates + CSV; UI wired |
| §21 Audit | Done | Append-only `auditLogs`; login success/fail; `/admin/audit` API UI |
| §22 Phase 1 | Done baseline | Feature flags gate Phase 2/3 |
| §23 Acceptance | Partial | E2E works with demo store; Mongo+S3 production still pending |
| §24 Entity separation | Done | files ≠ services ≠ requests/tickets in types + routes |
| §25 UI continuity | Done | Dark cyan portals preserved |

## Phase discipline

- **Phase 1 (current):** Auth, library, entitlement, uploads/review, requests/support/contact, reports/audit, route aliases  
- **Phase 2:** Live payments (`FEATURE_LIVE_PAYMENTS`), hardened tech APIs  
- **Phase 3:** Malware / AI / duplicates flags  

Demo accounts: see `.env.example`. Deploy notes: `docs/deploy.md`.
