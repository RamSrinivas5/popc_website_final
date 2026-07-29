/**
 * Resolves a media file path from the Django backend into a usable URL.
 *
 * The backend returns photo fields as either:
 *   - Already-absolute URLs:  "http://180.235.121.245:8065/media/patient_photos/img.jpg"
 *   - Relative paths:         "patient_photos/img.jpg"
 *   - Media-relative paths:   "media/patient_photos/img.jpg"
 *
 * Vite proxies "/media" → backend, so we normalise everything to "/media/<path>".
 */
export function resolveMediaUrl(url, timestamp = null) {
  if (!url) return null;

  let resolved = url;

  // Already a full URL — return as-is (or could strip host to use proxy instead)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Rewrite backend absolute URL to go through the local Vite proxy
    // so we avoid any CORS / mixed-content issues.
    try {
      const parsed = new URL(url);
      resolved = parsed.pathname; // e.g. "/media/patient_photos/img.jpg"
    } catch {
      resolved = url;
    }
  } else {
    // Strip leading slash to normalise
    const clean = url.startsWith('/') ? url.slice(1) : url;

    // Already has "media/" prefix
    if (clean.startsWith('media/')) {
      resolved = `/${clean}`;
    } else {
      // Bare relative path — prepend /media/
      resolved = `/media/${clean}`;
    }
  }

  if (timestamp) {
    const cleanTime = typeof timestamp === 'string' ? timestamp.replace(/[:.-]/g, '') : timestamp;
    const sep = resolved.includes('?') ? '&' : '?';
    return `${resolved}${sep}t=${cleanTime}`;
  }

  return resolved;
}
