/** Derive display format (PDF, ZIP, TXT, BIN, …) from filename / MIME. */

const EXT_LABELS: Record<string, string> = {
  pdf: "PDF",
  zip: "ZIP",
  rar: "RAR",
  "7z": "7Z",
  gz: "GZ",
  tar: "TAR",
  txt: "TXT",
  bin: "BIN",
  bdv: "BDV",
  rom: "ROM",
  hex: "HEX",
  sch: "SCH",
  brd: "BRD",
  fw: "FW",
  img: "IMG",
  iso: "ISO",
  doc: "DOC",
  docx: "DOCX",
  xls: "XLS",
  xlsx: "XLSX",
};

export type FileFormatInfo = {
  /** Uppercase badge label, e.g. PDF */
  label: string;
  /** Lowercase extension without dot, or "other" */
  ext: string;
  /** CSS modifier class fragment, e.g. pdf */
  tone: string;
};

function extensionOf(name?: string | null): string {
  if (!name) return "";
  const base = name.split(/[/\\]/).pop() || name;
  const clean = base.split("?")[0].split("#")[0];
  const i = clean.lastIndexOf(".");
  if (i <= 0 || i === clean.length - 1) return "";
  return clean.slice(i + 1).toLowerCase();
}

export function fileFormatFromName(
  originalName?: string | null,
  storageKey?: string | null,
  mimeType?: string | null,
): FileFormatInfo {
  let ext = extensionOf(originalName) || extensionOf(storageKey);

  if (!ext && mimeType) {
    const m = mimeType.toLowerCase();
    if (m.includes("pdf")) ext = "pdf";
    else if (m.includes("zip") || m.includes("compressed")) ext = "zip";
    else if (m.includes("text") || m.includes("plain")) ext = "txt";
    else if (m.includes("octet-stream")) ext = "bin";
  }

  if (ext && EXT_LABELS[ext]) {
    return { label: EXT_LABELS[ext], ext, tone: ext };
  }
  if (ext) {
    return { label: ext.toUpperCase().slice(0, 8), ext, tone: "other" };
  }
  return { label: "OTHER", ext: "other", tone: "other" };
}

export function downloadFileName(
  originalName?: string | null,
  fallbackBase = "download",
): string {
  const name = (originalName || "").trim();
  if (name && name.includes(".")) return name.replace(/[/\\]/g, "_");
  const fmt = fileFormatFromName(originalName);
  const ext = fmt.ext !== "other" ? fmt.ext : "bin";
  return `${fallbackBase}.${ext}`;
}

export function formatCompactCount(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1000) return String(Math.round(n));
  if (n < 10_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}K`;
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
}
