/**
 * API kökü:
 * - `https://...` açıkça verildiyse doğrudan kullanılır.
 * - Tarayıcı HTTPS üzerindeyse ve backend sadece HTTP ise mixed content
 *   olmaması için `/api/gw` proxy'si kullanılır
 *   (`next.config.ts` rewrites → BACKEND_API_ORIGIN).
 * - Yerel (HTTP): doğrudan gateway (varsayılan HTTP IP veya .env.local).
 */
const DEFAULT_DIRECT_HTTP = "http://209.38.224.246:8080";

/** Tarayıcıda HTTPS üzerinde çalışıyorsak true döner. */
const isBrowserHttps =
  typeof window !== "undefined" &&
  window.location.protocol === "https:";

function resolveGatewayOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_GATEWAY_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (explicit) {
    if (explicit.startsWith("https://")) {
      return explicit;
    }
    // Tarayıcı HTTPS üzerindeyse HTTP backend'e doğrudan istek bloklanır → proxy kullan
    if (explicit.startsWith("http://") && isBrowserHttps) {
      return "/api/gw";
    }
    return explicit;
  }

  if (process.env.NEXT_PUBLIC_USE_API_PROXY === "true") {
    return "/api/gw";
  }

  // Tarayıcı HTTPS üzerindeyse her zaman proxy'den geç (mixed content engeli)
  if (isBrowserHttps) {
    return "/api/gw";
  }

  return DEFAULT_DIRECT_HTTP;
}

const gatewayOrigin = resolveGatewayOrigin();

export const PRODUCT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || gatewayOrigin;

export const USER_API_BASE =
  process.env.NEXT_PUBLIC_USER_API_BASE_URL?.trim() || gatewayOrigin;

export const PAYMENT_API_BASE =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL?.trim() || gatewayOrigin;

export const SESSION_JWT_KEY = "zc_session_jwt";
