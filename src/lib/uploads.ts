import { getApiToken } from "./clerk/clerkRefs";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB (mirrors backend)
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

/** Human-readable size cap, interpolated into upload hints and error copy so
 *  the limit is written in exactly one place. */
export const MAX_IMAGE_SIZE_LABEL = `${MAX_IMAGE_SIZE_BYTES / 1024 / 1024} MB`;

/** Accepted formats for display, e.g. "JPG, PNG, WebP, AVIF". */
export const ACCEPTED_IMAGE_LABEL = ACCEPTED_IMAGE_TYPES.map((type) =>
  type.replace("image/", "").replace("jpeg", "jpg").toUpperCase(),
)
  .join(", ")
  .replace("WEBP", "WebP")
  .replace("AVIF", "AVIF");

/** Storage folders the backend accepts (see uploads.controller allowlist). */
export type UploadPrefix = "taxonomy" | "cms";

/**
 * Upload an image to the backend (multipart) and return its stored public URL.
 * The backend stores it in S3-compatible storage; the record only keeps the URL.
 * `prefix` picks the storage folder; omitted keeps the historical default.
 */
export async function uploadImage(
  file: File,
  prefix?: UploadPrefix,
): Promise<string> {
  const token = await getApiToken();
  const body = new FormData();
  body.append("file", file);

  const query = prefix ? `?prefix=${prefix}` : "";
  const response = await fetch(`${API_URL}/uploads/image${query}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body,
  });

  if (!response.ok) {
    throw new Error(`Upload failed (${response.status})`);
  }

  const { data } = await response.json();
  return data.url as string;
}
