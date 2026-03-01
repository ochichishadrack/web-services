export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return process.env.NEXT_PUBLIC_API_URL_LOCAL!;
    } else if (
      hostname === "192.168.142.227" || // Your local network IP (update as needed)
      hostname.startsWith("192.168.") // optionally cover all local LAN IPs starting with 192.168.
    ) {
      return process.env.NEXT_PUBLIC_API_URL_NETWORK!;
    } else {
      // For production or any other hostname
      return process.env.NEXT_PUBLIC_API_URL_PROD!;
    }
  }

  // Server-side fallback (production or local)
  return (
    process.env.NEXT_PUBLIC_API_URL_PROD ??
    process.env.NEXT_PUBLIC_API_URL_LOCAL!
  );
}
