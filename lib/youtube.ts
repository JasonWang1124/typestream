const ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extract an 11-character YouTube video id from a URL or bare id.
 * Supports watch?v=, youtu.be/, /embed/, /shorts/, /live/, and a raw id.
 * Returns null when nothing valid is found.
 */
export function parseVideoId(input: string): string | null {
  if (!input) return null;
  const s = input.trim();
  if (ID_RE.test(s)) return s;

  try {
    const url = new URL(s.startsWith("http") ? s : `https://${s}`);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = url.pathname.slice(1);
      return ID_RE.test(id) ? id : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && ID_RE.test(v)) return v;
      const m = url.pathname.match(/\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch {
    // not a URL — fall through
  }
  return null;
}
