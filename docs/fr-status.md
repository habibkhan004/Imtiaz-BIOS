# FR / backend status — IMTIAZ BIOS

**Adapter:** When `DATABASE_URL` is set, data persists to **MySQL** database **`Imtiaz-bios`** (port **3306**) via **Prisma**. Check `GET /api/health` for `backend: "mysql"`.

Binary files remain on disk (`FILE_STORAGE_ROOT`); only metadata is in MySQL.

| Area | Status |
|---|---|
| Auth (session cookie + bcrypt) | Done — Prisma `User` / `PasswordResetToken` |
| Library files / brands / categories | Done |
| Uploads + review publish | Done |
| File requests + support tickets | Done |
| Admin / tech queues | Done (API-backed) |
| Subscriptions / trial entitlement | Done |
| Audit / reports / settings | Done |
| §10 Mongo | **Replaced by MySQL + Prisma** |
| Live payments | Flagged off (`FEATURE_LIVE_PAYMENTS`) |

## Prisma models

User, Category, Brand, FileAsset, FileVersion, SubscriptionPlan, UserSubscription, UploadSubmission, FileRequest, SupportTicket, TicketMessage, Notification, DownloadEvent, Payment, ServiceItem, PasswordResetToken, AuditLog, PlatformSettings
