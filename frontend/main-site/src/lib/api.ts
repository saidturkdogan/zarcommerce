/**
 * API kökü:
 * - `https://...` açıkça verildiyse doğrudan kullanılır.
 * - Vercel (HTTPS) + backend sadece HTTP ise mixed content olmaması için `/api/gw` kullanılır
 *   (`next.config.ts` rewrites → BACKEND_API_ORIGIN).
 * - Yerel: doğrudan gateway (varsayılan HTTP IP veya .env.local).
 */
const DEFAULT_DIRECT_HTTP = "http://209.38.224.246:8080";

function resolveGatewayOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_GATEWAY_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim();

  if (explicit) {
    if (explicit.startsWith("https://")) {
      return explicit;
    }
    // Vercel sayfası HTTPS; http:// backend tarayıcıda bloklanır → aynı kök proxy
    if (explicit.startsWith("http://") && process.env.VERCEL) {
      return "/api/gw";
    }
    return explicit;
  }

  if (process.env.NEXT_PUBLIC_USE_API_PROXY === "true") {
    return "/api/gw";
  }

  if (process.env.VERCEL) {
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
