const configuredApiBase = (import.meta.env.VITE_API_BASE ?? "").trim().replace(/\/+$/, "");

export function getApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${configuredApiBase}${normalizedPath}`;
}

export function isAuthEnabled(): boolean {
  return import.meta.env.VITE_AUTH_ENABLED !== "false";
}
