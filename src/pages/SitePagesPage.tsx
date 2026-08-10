import { useEffect, useMemo, useState } from "react";
import { adminApi } from "@/lib/api";
import type { SitePage } from "@/types";
import {
  PageShell,
  StatusBanner,
  FieldLabel,
  inputClass,
  btnPrimary,
  btnGhost,
} from "@/components/ui/PageShell";

const SITE_BASE = (
  import.meta.env.VITE_SITE_URL || "http://localhost:8000"
).replace(/\/$/, "");

const SLUG_LABELS: Record<string, string> = {
  "about-us": "About Us",
  "contact-us": "Contact Us",
  "privacy-policy": "Privacy Policy",
  "terms-condition": "Terms & Conditions",
};

export default function SitePagesPage() {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [activeSlug, setActiveSlug] = useState("about-us");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await adminApi.getSitePages();
      const list = Array.isArray(data) ? data : [];
      setPages(list);
      const current =
        list.find((p) => p.slug === activeSlug) || list[0] || null;
      if (current) {
        setActiveSlug(current.slug);
        setTitle(current.title);
        setBody(current.body);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load pages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = useMemo(
    () => pages.find((p) => p.slug === activeSlug) || null,
    [pages, activeSlug],
  );

  function selectPage(slug: string) {
    const page = pages.find((p) => p.slug === slug);
    if (!page) return;
    setActiveSlug(slug);
    setTitle(page.title);
    setBody(page.body);
    setSuccess("");
    setError("");
  }

  async function save() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const updated = await adminApi.updateSitePage(activeSlug, {
        title: title.trim(),
        body,
      });
      setPages((prev) =>
        prev.map((p) => (p.slug === updated.slug ? updated : p)),
      );
      setSuccess(`Saved “${updated.title}”. Website will show the new text.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell
      title="Site pages"
      subtitle="Edit About, Contact, Privacy Policy, and Terms — shown on the public website."
    >
      <StatusBanner error={error} success={success} />

      {loading ? (
        <p className="text-sm text-admin-muted">Loading…</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            {pages.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => selectPage(p.slug)}
                className={[
                  "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition",
                  p.slug === activeSlug
                    ? "border-indigo-500/40 bg-indigo-500/15 text-white"
                    : "border-admin-border bg-admin-panel text-admin-muted hover:text-white",
                ].join(" ")}
              >
                {SLUG_LABELS[p.slug] || p.title}
                <span className="mt-0.5 block font-mono text-[10px] opacity-60">
                  /{p.slug}
                </span>
              </button>
            ))}
            {pages.length === 0 && (
              <p className="text-xs text-admin-muted">
                No pages yet — restart backend so defaults seed.
              </p>
            )}
          </div>

          {active && (
            <div className="space-y-3 rounded-xl border border-admin-border bg-admin-panel p-4">
              <div>
                <FieldLabel>Title</FieldLabel>
                <input
                  className={inputClass}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <FieldLabel>Body (plain text — line breaks kept on site)</FieldLabel>
                <textarea
                  className={`${inputClass} min-h-[360px] font-mono text-xs leading-relaxed`}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btnPrimary}
                  disabled={saving}
                  onClick={save}
                >
                  {saving ? "Saving…" : "Save page"}
                </button>
                <a
                  className={btnGhost}
                  href={`${SITE_BASE}/${activeSlug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open on site
                </a>
              </div>
              <p className="text-[11px] text-admin-muted">
                Updated{" "}
                {active.updatedAt
                  ? new Date(active.updatedAt).toLocaleString()
                  : "—"}
              </p>
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}
