function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Títulos con & en Marydale (acento de marca) y el resto escapado. */
export function brandTitleHtml(text) {
  const raw = String(text ?? "");
  if (!raw.includes("&")) return escapeHtml(raw);

  return raw
    .split("&")
    .map((part) => escapeHtml(part))
    .join('<span class="title-amp" aria-hidden="true">&</span>');
}
