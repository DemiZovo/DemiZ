const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Build one base-aware internal URL. Input must be a root-relative site path. */
export function sitePath(path = '/'): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}` || '/';
}

export function absoluteSiteUrl(path: string, site: URL): URL {
  return new URL(sitePath(path), site);
}
