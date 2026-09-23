"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  loadAssignedRequest,
  TECH_CHANGE_EVENT,
  type TechAssignedRequest,
} from "../../lib/tech-data";
import { RequestSummaryCard } from "./RequestSummaryCard";
import { ReviewForm } from "./ReviewForm";
import { TechPageHeader } from "./ui";

export function ReviewPageClient({ seed }: { seed: TechAssignedRequest }) {
  const [item, setItem] = useState(seed);

  useEffect(() => {
    const sync = () => {
      const live = loadAssignedRequest(seed.id);
      if (live) setItem(live);
    };
    sync();
    window.addEventListener(TECH_CHANGE_EVENT, sync);
    return () => window.removeEventListener(TECH_CHANGE_EVENT, sync);
  }, [seed.id]);

  return (
    <>
      <TechPageHeader
        title={`Review ${item.id}`}
        description="Assess the request, checklist the board details, and recommend next status."
      />
      <div className="portal-grid-2">
        <div>
          <RequestSummaryCard item={item} />
          <div className="portal-panel">
            <h2>Timeline</h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: 12,
              }}
            >
              {item.timeline.map((t, i) => (
                <li
                  key={`${t.at}-${i}`}
                  style={{
                    borderLeft: "2px solid var(--accent-cyan)",
                    paddingLeft: 12,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-muted)",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {t.at}
                  </div>
                  <div style={{ fontSize: 14 }}>{t.text}</div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <ReviewForm item={item} />
          <div className="portal-panel">
            <h2>Quick links</h2>
            <div className="action-btns">
              <Link href={`/tech/notes/${item.id}`} className="btn btn-purple btn-sm">
                Notes
              </Link>
              <Link
                href={`/tech/requests/${item.id}/status`}
                className="btn btn-gold btn-sm"
              >
                Status
              </Link>
              <Link href={`/tech/messages/${item.id}`} className="btn btn-success btn-sm">
                Messages
              </Link>
              {item.type === "upload" ? (
                <Link
                  href={`/tech/verification/${item.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Verification
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
