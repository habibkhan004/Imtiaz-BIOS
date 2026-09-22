# IMTIAZ BIOS

A modern BIOS, motherboard repair, BIOS file library, schematic/boardview, and password-unlock platform built with **Next.js** and **PostgreSQL**.

The project is designed for repair technicians and authorized hardware-service providers who need to upload, search, manage, request, and download BIOS-related files.

---

## Features

### BIOS File Library

* Browse BIOS files by motherboard/board number
* Search by board number/model
* Filter files by brand
* Display:

  * Board/model number
  * Brand
  * File type
  * File size
  * Verification status
  * Upload date
* Download available files
* Request a file or service directly from the library
* Admin-controlled file verification

The original frontend already includes library search/filtering and Download/Request actions. These should be connected to PostgreSQL and real file storage in the Next.js version.

### Supported File Types

The system should support files such as:

* `.bin` — BIOS dumps
* `.brd` — Boardview
* `.bdv` — Boardview
* `.wrl` — Schematic
* Other repair-related firmware/document files as required

The existing frontend determines the displayed file type from the uploaded filename extension.

### File Upload

Users can submit:

* Board number
* Brand
* BIOS/firmware file
* Optional description/details

The upload interface supports drag-and-drop as well as normal file selection.

The Next.js implementation should **not store large binary files directly inside PostgreSQL**.

Instead:

```text
PostgreSQL
    ↓
File metadata

Object Storage
    ↓
Actual .bin / .brd / .bdv / .wrl files
```

Possible storage providers:

* Cloudflare R2
* AWS S3
* Backblaze B2
* Supabase Storage
* Local filesystem for development

---

## Services

The website presents services including:

* BIOS flashing and recovery
* Motherboard repair
* Component-level troubleshooting
* BIOS/supervisor password services
* Boardview and schematic resources

The current design describes BIOS flashing/recovery and password-unlocking services as part of the platform.

---

## Password / Unlock Requests

Users should be able to submit an unlock request containing information such as:

* Brand
* Model
* Board number
* Service tag / serial number
* Problem description
* Optional uploaded files

Possible request categories:

```text
Dell
HP
Lenovo / ThinkPad
Toshiba
Microsoft Surface
Apple EFI
Chromebook
Other
```

The current frontend already provides separate request paths for several of these categories.

---

## Contact / Service Requests

Users can open a service request from the website.

Example information:

```text
Name
Email
Brand
Board / Model
Request Type
Message
Attachment
```

Requests should be stored in PostgreSQL.

Example:

```text
POST /api/requests
```

The admin dashboard can then display:

```text
Pending
In Review
Processing
Completed
Rejected
```

---

# Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Responsive design
* Server Components where appropriate
* Client Components for interactive UI

## Backend

* Next.js App Router
* Route Handlers / Server Actions
* PostgreSQL
* Prisma ORM

## Authentication

Recommended:

* Auth.js / NextAuth
* Email/password or OAuth
* Role-based access control

Roles:

```text
USER
TECHNICIAN
ADMIN
```

## File Storage

Use object storage rather than PostgreSQL for binary files.

Recommended architecture:

```text
Next.js
   │
   ├── PostgreSQL / Prisma
   │       └── File metadata
   │
   └── Object Storage
           └── Actual BIOS / Boardview / Schematic files
```

---

# Project Structure

Recommended Next.js structure:

```text
imtiaz-bios/
│
├── app/
│   ├── page.tsx
│   │
│   ├── library/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   │
│   ├── upload/
│   │   └── page.tsx
│   │
│   ├── services/
│   │   └── page.tsx
│   │
│   ├── unlock/
│   │   └── page.tsx
│   │
│   ├── requests/
│   │   └── page.tsx
│   │
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── files/
│   │   ├── requests/
│   │   └── users/
│   │
│   └── api/
│       ├── files/
│       ├── requests/
│       ├──
```
