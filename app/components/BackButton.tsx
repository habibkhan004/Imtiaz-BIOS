"use client";

import { useRouter } from "next/navigation";

export function BackButton({
  fallback = "/",
  label = "← Back",
}: {
  fallback?: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="btn btn-outline btn-sm portal-back-btn"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallback);
        }
      }}
    >
      {label}
    </button>
  );
}
