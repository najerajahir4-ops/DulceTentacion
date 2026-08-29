import crypto from "crypto";

export const AUTH_COOKIE_NAME = "dt_admin_session";
export const AUTH_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

const DEFAULT_SECRET = "dulce-tentacion-secret-key-salt-2026-waffles-crepes";

function getSecretKey(): string {
  return process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET || DEFAULT_SECRET;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

export interface SessionPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

/**
 * Creates a signed JWT-like token using HMAC-SHA256
 */
export function signAdminToken(username: string): string {
  const secret = getSecretKey();
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload: SessionPayload = {
    sub: username,
    role: "admin",
    iat: now,
    exp: now + AUTH_MAX_AGE,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${dataToSign}.${signature}`;
}

/**
 * Verifies a signed token and returns the payload if valid and not expired
 */
export function verifyAdminToken(token: string | undefined | null): {
  valid: boolean;
  username?: string;
  role?: string;
} {
  if (!token || typeof token !== "string") {
    return { valid: false };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false };
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const secret = getSecretKey();
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(dataToSign)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  // Constant-time comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return { valid: false };
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false };
  }

  try {
    const payload: SessionPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false }; // Expired
    }

    if (payload.role !== "admin") {
      return { valid: false };
    }

    return {
      valid: true,
      username: payload.sub,
      role: payload.role,
    };
  } catch (error) {
    return { valid: false };
  }
}
