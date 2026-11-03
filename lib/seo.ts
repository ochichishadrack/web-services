export const SITE_NAME = "Maraspot";

// Set NEXT_PUBLIC_SITE_URL in .env (e.g. https://maraspot.com), no trailing slash.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://developer.maraspot.com"
).replace(/\/$/, "");

export const DEFAULT_TITLE = "Maraspot | Web & Software Development Company";

export const DEFAULT_DESCRIPTION =
  "Maraspot builds fast, secure, SEO-ready websites, web apps and custom software for businesses worldwide. On-time delivery and 24/7 support.";
