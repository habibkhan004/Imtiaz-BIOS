"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";
import { INITIAL_LIBRARY, type LibraryItem } from "../lib/site-data";

function formatFileSize(size: number) {
  return size > 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(2)} MB`
    : `${(size / 1024).toFixed(1)} KB`;
}

function generateFakeBinFile(model: string, type: string) {
  let ext = ".bin";
  if (type === "Boardview") ext = ".brd";
  else if (type === "Schematic") ext = ".wrl";
  const content = `IMTIAZ BIOS DUMP\nBoard: ${model}\nType: ${type}\nGenerated: ${new Date().toISOString()}\n\n${"F4KE-D4T4-".repeat(60)}`;
  return { blob: new Blob([content], { type: "application/octet-stream" }), ext };
}

function downloadFile(model: string, type: string) {
  const { blob, ext } = generateFakeBinFile(model, type);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${model}${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return ext;
}

export function Library() {
  const [activeTab, setActiveTab] = useState<"upload" | "download">("upload");
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileLabel, setFileLabel] = useState("");
  const [brand, setBrand] = useState("Dell");
  const [board, setBoard] = useState("");
  const [notes, setNotes] = useState("");
  const [libraryData, setLibraryData] = useState<LibraryItem[]>(INITIAL_LIBRARY);
  const [libSearch, setLibSearch] = useState("");
  const [libBrandFilter, setLibBrandFilter] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "✅ Added to the review queue. A tech will verify and list it.",
    error: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const boardInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const applyHash = () => {
      if (window.location.hash === "#upload-tab") setActiveTab("upload");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const showToast = useCallback((message: string, isError = false) => {
    setToast({ show: true, message, error: isError });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast({
        show: false,
        message: "✅ Added to the review queue. A tech will verify and list it.",
        error: false,
      });
    }, 4000);
  }, []);

  const applyFile = useCallback((file: File) => {
    setSelectedFile(file);
    setFileLabel(`${file.name} · ${formatFileSize(file.size)}`);
  }, []);

  const filteredLibrary = useMemo(() => {
    const q = libSearch.toLowerCase();
    return libraryData.filter((item) => {
      const matchSearch = !q || item.model.toLowerCase().includes(q);
      const matchBrand = !libBrandFilter || item.brand === libBrandFilter;
      return matchSearch && matchBrand;
    });
  }, [libraryData, libSearch, libBrandFilter]);

  const onDropzoneDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.length) applyFile(files[0]);
  };

  const onUploadSubmit = (e: FormEvent) => {
    e.preventDefault();
    const boardValue = board.trim();
    if (!boardValue) {
      boardInputRef.current?.focus();
      showToast("⚠️ Please enter a board/model number", true);
      return;
    }
    const hasFile = Boolean(selectedFile);
    const fileName = selectedFile?.name ?? "";
    const fileSize = hasFile
      ? `${(selectedFile!.size / 1024 / 1024).toFixed(1)} MB`
      : "—";
    const lower = fileName.toLowerCase();
    const fileType = hasFile
      ? lower.endsWith(".brd") || lower.endsWith(".bdv")
        ? "Boardview"
        : lower.endsWith(".wrl")
          ? "Schematic"
          : "BIOS bin"
      : "BIOS bin";

    setLibraryData((prev) => [
      {
        model: boardValue.toUpperCase(),
        brand,
        type: fileType,
        size: fileSize,
        verified: false,
      },
      ...prev,
    ]);
    showToast("✅ Added to the review queue. A tech will verify and list it.");
    setBoard("");
    setNotes("");
    setBrand("Dell");
    setSelectedFile(null);
    setFileLabel("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const requestModel = (model: string) => {
    sessionStorage.setItem("imtiaz-contact-model", model);
    sessionStorage.removeItem("imtiaz-contact-msg");
    document.getElementById("contact")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    window.dispatchEvent(new Event("imtiaz-contact-prefill"));
  };

  return (
    <section id="library">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow">CORE TOOLS</span>
          <h2>
            Upload a file, or <span className="gradient-gold">find one</span> already
            tested
          </h2>
          <p>
            Send a BIOS dump for the community and our team to review, or search the
            library by board number before you open a ticket.
          </p>
        </div>

        <div className="panel-tabs" role="tablist">
          <button
            className={`tab-btn${activeTab === "upload" ? " active" : ""}`}
            id="upload-tab"
            type="button"
            onClick={() => setActiveTab("upload")}
          >
            📤 Upload
          </button>
          <button
            className={`tab-btn${activeTab === "download" ? " active" : ""}`}
            type="button"
            onClick={() => setActiveTab("download")}
          >
            📚 Library
          </button>
        </div>

        <div
          className={`panel${activeTab === "upload" ? " active" : ""}`}
          id="panel-upload"
        >
          <div className="upload-box">
            <div
              className={`dropzone${dragOver ? " drag" : ""}`}
              id="dropzone"
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("#browseBtn")) return;
                fileInputRef.current?.click();
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              onDrop={onDropzoneDrop}
            >
              <svg
                className="dz-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h3>Drop your .bin / .rom here</h3>
              <p>
                Or click to browse. Max 32MB. SPI dumps, EC firmware and boardview
                files accepted.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                id="fileInput"
                className="hidden-input"
                accept=".bin,.rom,.wrl,.brd,.bdv,.zip"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) applyFile(file);
                }}
              />
              <button
                className="btn btn-outline btn-sm"
                id="browseBtn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Choose file
              </button>
              <div className="dz-filename" id="fileName">
                {fileLabel}
              </div>
            </div>

            <div className="form-side">
              <form id="uploadForm" noValidate onSubmit={onUploadSubmit}>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="brand">Brand</label>
                    <select
                      id="brand"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    >
                      <option value="Dell">Dell</option>
                      <option value="HP">HP</option>
                      <option value="Lenovo">Lenovo / ThinkPad</option>
                      <option value="Toshiba">Toshiba</option>
                      <option value="Surface">Microsoft Surface</option>
                      <option value="Apple">Apple / EFI</option>
                      <option value="Asus">Asus</option>
                      <option value="Acer">Acer</option>
                      <option value="Chromebook">Chromebook</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="board">Board / model number</label>
                    <input
                      ref={boardInputRef}
                      type="text"
                      id="board"
                      placeholder="e.g. LA-H994P"
                      required
                      value={board}
                      onChange={(e) => setBoard(e.target.value)}
                    />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="notes">Notes (fault, tested status, chip part)</label>
                  <textarea
                    id="notes"
                    rows={2}
                    placeholder="No power after liquid damage — flashed and verified on bench."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <button
                  className="btn btn-primary"
                  type="submit"
                  style={{ width: "100%" }}
                >
                  📤 Submit to review queue
                </button>
                <div
                  className={`toast${toast.show ? " show" : ""}${toast.error ? " error" : ""}`}
                  id="uploadToast"
                >
                  {toast.message}
                </div>
                <p className="form-note">
                  ⚠️ Files submitted here stay in your current browser session for this
                  demo build — connect a backend to store and serve them permanently.
                </p>
              </form>
            </div>
          </div>
        </div>

        <div
          className={`panel${activeTab === "download" ? " active" : ""}`}
          id="panel-download"
        >
          <div className="lib-toolbar">
            <input
              type="text"
              id="libSearch"
              placeholder="🔍 Search by board number, e.g. DA0X6..."
              value={libSearch}
              onChange={(e) => setLibSearch(e.target.value)}
            />
            <select
              id="libBrandFilter"
              value={libBrandFilter}
              onChange={(e) => setLibBrandFilter(e.target.value)}
            >
              <option value="">All brands</option>
              <option value="Dell">Dell</option>
              <option value="HP">HP</option>
              <option value="Lenovo">Lenovo</option>
              <option value="Toshiba">Toshiba</option>
              <option value="Surface">Surface</option>
              <option value="Apple">Apple</option>
              <option value="Asus">Asus</option>
              <option value="Chromebook">Chromebook</option>
            </select>
            <span className="status-badge" id="fileCount">
              {filteredLibrary.length} file
              {filteredLibrary.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="lib-table">
            <div className="lib-row head">
              <span>Board / Model</span>
              <span>Brand</span>
              <span>Type</span>
              <span>Size</span>
              <span>Actions</span>
            </div>
            <div id="libBody">
              {filteredLibrary.length === 0 ? (
                <div className="empty-library">
                  <p style={{ fontSize: 18, marginBottom: 8 }}>📭 No matches found</p>
                  <p style={{ color: "var(--text-muted)" }}>
                    Try another board number, or submit it under{" "}
                    <a
                      href="#upload-tab"
                      style={{ color: "var(--accent-cyan)" }}
                      onClick={() => setActiveTab("upload")}
                    >
                      Upload
                    </a>
                    .
                  </p>
                </div>
              ) : (
                filteredLibrary.map((item, index) => (
                  <div
                    className="lib-row"
                    key={`${item.model}-${item.brand}-${index}`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <span className="lib-model">
                      <Link
                        href={`/products/${encodeURIComponent(item.model)}`}
                        style={{ color: "inherit" }}
                      >
                        {item.model}
                      </Link>
                    </span>
                    <span>
                      <span className="tag tag-brand">{item.brand}</span>
                    </span>
                    <span>{item.type}</span>
                    <span>
                      {item.size}{" "}
                      {item.verified ? (
                        <span className="tag tag-verified">✓ verified</span>
                      ) : null}
                    </span>
                    <div className="action-btns">
                      <button
                        className="btn btn-download btn-sm download-btn"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const ext = downloadFile(item.model, item.type);
                          showToast(`⬇️ Downloading ${item.model}${ext} (simulated)`);
                        }}
                      >
                        ⬇ Download
                      </button>
                      <button
                        className="btn btn-request btn-sm request-btn"
                        type="button"
                        onClick={() => requestModel(item.model)}
                      >
                        📩 Request
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
