/**
 * Extract Google Drive file ID from various Drive URL formats
 */
export function extractDriveFileId(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  const driveMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                     trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
                     trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  return (driveMatch && driveMatch[1]) ? driveMatch[1] : null;
}

/**
 * Format any Google Drive URL into a direct viewable image URL.
 * Also handles standard image URLs untouched.
 */
export function formatDriveImageUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  const fileId = extractDriveFileId(trimmed);
  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return trimmed;
}

/**
 * Smart error handler for image element failures (e.g., Google Drive CORS/Referrer issues or broken links)
 */
export function handleImageError(e, originalUrl) {
  const target = e.currentTarget;
  if (!target) return;

  const currentSrc = target.src || '';
  const fileId = extractDriveFileId(originalUrl) || extractDriveFileId(currentSrc);

  // If already tried proxy, fall back to high quality artwork placeholder
  if (target.dataset.triedProxy === 'true') {
    target.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=900&auto=format&fit=crop';
    return;
  }

  if (fileId) {
    target.dataset.triedProxy = 'true';
    // Fall back to server-side drive proxy
    target.src = `/api/drive-proxy/${fileId}`;
  } else {
    target.dataset.triedProxy = 'true';
    target.src = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=900&auto=format&fit=crop';
  }
}

export default {
  extractDriveFileId,
  formatDriveImageUrl,
  handleImageError
};
