"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ADMIN_BRANDS,
  ADMIN_FILES,
  ADMIN_PROFILE,
  BRANDS_KEY,
  FILES_KEY,
  appendAudit,
  loadJson,
  saveJson,
  type AdminBrand,
} from "../../lib/admin-data";
import {
  AdminPageHeader,
  AdminPanel,
  AdminTable,
  EmptyState,
  Toast,
} from "./ui";

export function BrandsManager() {
  const [rows, setRows] = useState<AdminBrand[]>(ADMIN_BRANDS);
  const [name, setName] = useState("");
  const [renameFrom, setRenameFrom] = useState<string | null>(null);
  const [renameTo, setRenameTo] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setRows(loadJson(BRANDS_KEY, ADMIN_BRANDS));
  }, []);

  const persist = (next: AdminBrand[]) => {
    setRows(next);
    saveJson(BRANDS_KEY, next);
  };

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(""), 1800);
  };

  const onAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (rows.some((r) => r.name.toLowerCase() === name.trim().toLowerCase())) {
      flash("Brand already exists");
      return;
    }
    persist([...rows, { name: name.trim() }]);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "brand.add",
      target: name.trim(),
      detail: "Added brand",
    });
    setName("");
    flash("Brand added");
  };

  const remove = (brand: string) => {
    persist(rows.filter((r) => r.name !== brand));
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "brand.remove",
      target: brand,
      detail: "Removed brand",
    });
    flash("Brand removed");
  };

  const applyRename = () => {
    if (!renameFrom || !renameTo.trim()) return;
    const nextName = renameTo.trim();
    persist(
      rows.map((r) => (r.name === renameFrom ? { name: nextName } : r)),
    );
    const files = loadJson(FILES_KEY, ADMIN_FILES);
    saveJson(
      FILES_KEY,
      files.map((f) =>
        f.brand === renameFrom ? { ...f, brand: nextName, updatedAt: today() } : f,
      ),
    );
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "brand.rename",
      target: renameFrom,
      detail: `Renamed to ${nextName} (files updated)`,
    });
    setRenameFrom(null);
    setRenameTo("");
    flash("Brand renamed");
  };

  const fileCount = (brand: string) => {
    const files = loadJson(FILES_KEY, ADMIN_FILES);
    return files.filter((f) => f.brand === brand && !f.archived).length;
  };

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  return (
    <>
      <AdminPageHeader
        title="Brands"
        description="Brands used in library filters and request forms."
      />
      <AdminPanel title="Add brand">
        <form onSubmit={onAdd}>
          <div className="field">
            <label htmlFor="brandName">Name</label>
            <input id="brandName" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>
      </AdminPanel>
      <AdminPanel title={`Brands (${rows.length})`}>
        {rows.length === 0 ? (
          <EmptyState title="No brands" body="Add a brand above." />
        ) : (
          <AdminTable>
            <div className="lib-row head admin-row-brands">
              <span>Brand</span>
              <span>Files</span>
              <span>Actions</span>
            </div>
            {rows.map((b) => (
              <div className="lib-row admin-row-brands" key={b.name}>
                <span className="lib-model">{b.name}</span>
                <span>
                  {fileCount(b.name)}
                </span>
                <div className="action-btns">
                  <button
                    type="button"
                    className="btn btn-success btn-sm"
                    onClick={() => {
                      setRenameFrom(b.name);
                      setRenameTo(b.name);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(b.name)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </AdminTable>
        )}
      </AdminPanel>
      {renameFrom ? (
        <AdminPanel title={`Rename ${renameFrom}`}>
          <div className="field">
            <label>New name</label>
            <input value={renameTo} onChange={(e) => setRenameTo(e.target.value)} />
          </div>
          <div className="action-btns">
            <button type="button" className="btn btn-success btn-sm" onClick={applyRename}>
              Save
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setRenameFrom(null)}
            >
              Cancel
            </button>
          </div>
        </AdminPanel>
      ) : null}
      <Toast message={toast} />
    </>
  );
}
