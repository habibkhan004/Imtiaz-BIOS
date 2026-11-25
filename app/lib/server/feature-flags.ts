/**
 * Feature flags for phased delivery (§16 / §22).
 * Phase 2/3 items stay off until explicitly enabled.
 */
export const featureFlags = {
  /** Phase 2 — live payment gateway (Stripe etc.). Demo stubs work regardless. */
  livePayments: process.env.FEATURE_LIVE_PAYMENTS === "true",
  /** Phase 3 — malware scan pipeline */
  malwareScan: process.env.FEATURE_MALWARE_SCAN === "true",
  /** Phase 3 — AI classification */
  aiClassification: process.env.FEATURE_AI_CLASSIFICATION === "true",
  /** Phase 3 — duplicate detection */
  duplicateDetection: process.env.FEATURE_DUPLICATE_DETECTION === "true",
  /** MySQL via Prisma when DATABASE_URL is set */
  mysql: Boolean(process.env.DATABASE_URL),
};
