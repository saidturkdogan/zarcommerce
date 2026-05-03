export const PRODUCT_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082";

/** user-service doğrudan veya API gateway (ör. :8080) üzerinden */
export const USER_API_BASE =
  process.env.NEXT_PUBLIC_USER_API_BASE_URL || "http://localhost:8081";

export const SESSION_JWT_KEY = "zc_session_jwt";
