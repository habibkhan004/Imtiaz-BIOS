/** Files module — re-exports domain + store helpers used by file APIs. */
export type {
  FileAsset,
  FileVersion,
  UploadSubmission,
  FilePublishStatus,
  VerificationStatus,
  AccessType,
} from "../domain/types";
export { loadDb, updateDb, findBrand, findCategory } from "../server/db";
export { assertCanDownload } from "../server/entitlement";
export { fileStorage, validateUploadMeta } from "../server/file-storage";
