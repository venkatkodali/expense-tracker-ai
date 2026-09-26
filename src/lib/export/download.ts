/** Triggers a browser download of arbitrary text content via a Blob + anchor click. */
export function downloadTextFile(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** Strips characters that are unsafe across Windows/macOS/Linux filesystems. */
export function sanitizeFilename(name: string, fallback: string): string {
  const cleaned = name.trim().replace(/[/\\?%*:|"<>]/g, "-");
  return cleaned.length > 0 ? cleaned : fallback;
}
