import { createHash, randomUUID } from "crypto";
import { mkdir, writeFile, readFile, unlink, access } from "fs/promises";
import path from "path";

const ROOT = process.env.FILE_STORAGE_ROOT || path.join(process.cwd(), ".data", "objects");

export type StoredObject = {
  storageKey: string;
  sizeBytes: number;
  absolutePath: string;
};

function safeKey(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().slice(0, 16);
  const hash = createHash("sha256").update(`${randomUUID()}-${originalName}`).digest("hex").slice(0, 32);
  return `${hash}${ext}`;
}

async function ensureRoot() {
  await mkdir(ROOT, { recursive: true });
}

export const fileStorage = {
  async put(buffer: Buffer, originalName: string): Promise<StoredObject> {
    await ensureRoot();
    const storageKey = safeKey(originalName);
    const absolutePath = path.join(ROOT, storageKey);
    await writeFile(absolutePath, buffer);
    return { storageKey, sizeBytes: buffer.length, absolutePath };
  },

  async exists(storageKey: string): Promise<boolean> {
    try {
      await access(path.join(ROOT, storageKey));
      return true;
    } catch {
      return false;
    }
  },

  async read(storageKey: string): Promise<Buffer> {
    return readFile(path.join(ROOT, storageKey));
  },

  absolutePath(storageKey: string): string {
    return path.join(ROOT, storageKey);
  },

  /** Demo signed URL: opaque API path with short-lived token query (not a public static path). */
  getSignedUrl(storageKey: string, fileId: string, ttlSec = 120): string {
    const exp = Math.floor(Date.now() / 1000) + ttlSec;
    const payload = `${fileId}.${storageKey}.${exp}`;
    const sig = createHash("sha256")
      .update(`${payload}.${process.env.AUTH_SECRET || "imtiaz-dev-secret-change-me"}`)
      .digest("hex")
      .slice(0, 24);
    return `/api/files/${fileId}/download?sig=${sig}&exp=${exp}`;
  },

  async delete(storageKey: string): Promise<void> {
    try {
      await unlink(path.join(ROOT, storageKey));
    } catch {
      /* ignore missing */
    }
  },
};

export const ALLOWED_EXTENSIONS_DEFAULT = [
  ".bin",
  ".rom",
  ".bdv",
  ".pdf",
  ".zip",
  ".rar",
  ".7z",
  ".txt",
  ".hex",
];

export const ALLOWED_MIME_DEFAULT = [
  "application/octet-stream",
  "application/pdf",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "text/plain",
];

/** Keep original format: .pdf → PDF MIME, .bin → octet-stream, etc. */
export function contentTypeFromName(fileName: string): string {
  const ext = path.extname(fileName || "").toLowerCase();
  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".zip":
      return "application/zip";
    case ".rar":
      return "application/x-rar-compressed";
    case ".7z":
      return "application/x-7z-compressed";
    case ".txt":
    case ".hex":
      return "text/plain";
    case ".bin":
    case ".rom":
    case ".bdv":
    default:
      return "application/octet-stream";
  }
}

/** Prefer inline for viewable types (PDF); attachment otherwise. */
export function contentDisposition(fileName: string): string {
  const safe = (fileName || "download").replace(/"/g, "");
  const ext = path.extname(safe).toLowerCase();
  const mode = ext === ".pdf" || ext === ".txt" ? "inline" : "attachment";
  return `${mode}; filename="${safe}"`;
}
export function validateUploadMeta(
  originalName: string,
  mimeType: string,
  sizeBytes: number,
  maxBytes: number,
  allowedExt: string[],
  allowedMime: string[],
): string | null {
  const ext = path.extname(originalName).toLowerCase();
  if (!allowedExt.includes(ext)) {
    return `File extension ${ext || "(none)"} is not allowed.`;
  }
  if (mimeType && allowedMime.length && !allowedMime.includes(mimeType) && mimeType !== "application/octet-stream") {
    // Allow octet-stream for BIOS dumps; otherwise require allowlist match
    if (!allowedMime.includes(mimeType)) {
      return `MIME type ${mimeType} is not allowed.`;
    }
  }
  if (sizeBytes <= 0) return "Empty file rejected.";
  if (sizeBytes > maxBytes) {
    return `File exceeds max size of ${Math.round(maxBytes / (1024 * 1024))} MB.`;
  }
  return null;
}
