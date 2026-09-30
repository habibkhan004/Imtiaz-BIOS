# Deploy notes — IMTIAZ BIOS

## Stack

- Next.js 16 App Router
- Prisma ORM → **MySQL** (local via **XAMPP**; production any MySQL 8+)
- Local file binaries under `FILE_STORAGE_ROOT` (default `.data/objects`)
- Nodemailer for auth emails

## Local setup (XAMPP)

1. Start **MySQL** in the XAMPP Control Panel (port **3306**).
2. Open phpMyAdmin → create database **`Imtiaz-bios`** (utf8mb4), **or** run:

   ```sql
   CREATE DATABASE IF NOT EXISTS `Imtiaz-bios`
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

   (Use backticks — the database name contains a hyphen.)

3. Copy `.env.example` → `.env.local` and set the same URL in root `.env` for Prisma CLI:

   ```env
   DATABASE_URL="mysql://root@127.0.0.1:3306/Imtiaz-bios"
   ```

   If root has a password: `mysql://root:YOUR_PASSWORD@127.0.0.1:3306/Imtiaz-bios`

4. Install & migrate:

   ```bash
   npm install
   npx prisma generate
   npx prisma migrate deploy
   npx prisma db seed
   npm run db:test
   npm run dev
   ```

5. Verify: `GET /api/health` should show `"backend": "mysql"`.

## Environment

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma MySQL connection (required) — DB name **`Imtiaz-bios`**, port **3306** |
| `AUTH_SECRET` / `JWT_SECRET` | Session HMAC |
| `FILE_STORAGE_ROOT` | Binary uploads on disk |
| `SMTP_*` | Password reset / welcome email |
| `APP_URL` | Links in emails |

`MONGODB_URI` is **no longer used**.

## Demo accounts (after seed)

- admin@imtiazbios.local / Admin123!
- tech@imtiazbios.local / Tech123!
- user@imtiazbios.local / User123!

## Data migration from Mongo/JSON

If you still have Atlas or `.data/imtiaz-db.json` with real data:

1. Export JSON (or dump Mongo collections).
2. Keep the same UUID `id` fields.
3. Import via a one-off script using Prisma `createMany` in FK order (users → categories/brands → files → …), **or** temporarily point an export at `loadDb` shape and call `persistDatabaseToMysql`.
4. Do **not** run destructive `migrate reset` on production data without a backup.
