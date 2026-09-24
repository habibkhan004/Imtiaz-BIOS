"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ADMIN_PLANS,
  ADMIN_PROFILE,
  DEFAULT_ADMIN_SETTINGS,
  PLANS_KEY,
  SETTINGS_KEY,
  appendAudit,
  loadJson,
  saveJson,
  type AdminPlan,
  type AdminSettings,
} from "../../lib/admin-data";
import { AdminPageHeader, AdminPanel, Toast } from "./ui";

export function SettingsManager() {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);
  const [plans, setPlans] = useState<AdminPlan[]>(ADMIN_PLANS);
  const [toast, setToast] = useState("");

  useEffect(() => {
    setSettings(loadJson(SETTINGS_KEY, DEFAULT_ADMIN_SETTINGS));
    setPlans(loadJson(PLANS_KEY, ADMIN_PLANS));
  }, []);

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    saveJson(SETTINGS_KEY, settings);
    appendAudit({
      actor: ADMIN_PROFILE.name,
      action: "settings.save",
      target: "settings",
      detail: "Updated site settings / feature flags",
    });
    setToast("✅ Settings saved");
    setTimeout(() => setToast(""), 2000);
  };

  return (
    <>
      <AdminPageHeader
        title="Settings"
        description="Site identity, feature flags, and demo limits."
      />
      <form onSubmit={onSave}>
        <AdminPanel title="Site">
          <div className="portal-grid-2">
            <div className="field">
              <label>Site name</label>
              <input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Telegram URL</label>
              <input
                value={settings.telegramUrl}
                onChange={(e) => setSettings({ ...settings, telegramUrl: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Contact email</label>
              <input
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Support hours</label>
              <input
                value={settings.supportHours}
                onChange={(e) => setSettings({ ...settings, supportHours: e.target.value })}
              />
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Feature flags">
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "flex", gap: 8, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={settings.publicRegistration}
                onChange={(e) =>
                  setSettings({ ...settings, publicRegistration: e.target.checked })
                }
              />
              Public registration on
            </label>
            <label style={{ display: "flex", gap: 8, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={settings.downloadsRequireLogin}
                onChange={(e) =>
                  setSettings({ ...settings, downloadsRequireLogin: e.target.checked })
                }
              />
              Library downloads require login
            </label>
            <label style={{ display: "flex", gap: 8, fontSize: 14 }}>
              <input
                type="checkbox"
                checked={settings.showTestimonials}
                onChange={(e) =>
                  setSettings({ ...settings, showTestimonials: e.target.checked })
                }
              />
              Show testimonials
            </label>
          </div>
        </AdminPanel>

        <AdminPanel title="Limits">
          <div className="portal-grid-2">
            <div className="field">
              <label>Max upload size (MB)</label>
              <input
                type="number"
                value={settings.maxUploadMb}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maxUploadMb: Number(e.target.value) || 1,
                  })
                }
              />
            </div>
            <div className="field">
              <label>Default plan for new users</label>
              <select
                value={settings.defaultPlanId}
                onChange={(e) =>
                  setSettings({ ...settings, defaultPlanId: e.target.value })
                }
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 8 }}>
            Save settings
          </button>
        </AdminPanel>
      </form>
      <Toast message={toast} />
    </>
  );
}
