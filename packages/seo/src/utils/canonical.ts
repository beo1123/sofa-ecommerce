export const SITE_URL = "https://sofaphamgia.com";

export function buildCanonical(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(path.startsWith("/") ? path : `/${path}`, SITE_URL);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}
