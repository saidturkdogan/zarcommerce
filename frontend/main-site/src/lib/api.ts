/**
 * Varsayılan: VPS üzerindeki API Gateway (:8080). Ürün / kullanıcı / ödeme yolları gateway'den geçer.
 * Yerelde localhost kullanmak için `.env.local` ile override et (gitignore'da).
 */
const DEFAULT_GATEWAY_ORIGIN = "http://209.38.224.246:8080";

const gatewayOrigin =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_GATEWAY_ORIGIN;

export const PRODUCT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || gatewayOrigin;

/** user-service yolları; gateway üzerinden aynı kök */
export const USER_API_BASE =
  process.env.NEXT_PUBLIC_USER_API_BASE_URL || gatewayOrigin;

/** payment-service yolları; gateway `/api/v1/payments/**` ile aynı kök */
export const PAYMENT_API_BASE =
  process.env.NEXT_PUBLIC_PAYMENT_API_URL || gatewayOrigin;

export const SESSION_JWT_KEY = "zc_session_jwt";
