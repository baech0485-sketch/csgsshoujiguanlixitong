import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "cs_session";

export type SessionPayload = {
  username: string;
  role: string;
  issuedAt: number;
};

type SessionIdentity = {
  username: string;
  role: string;
};

function encode(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decode(value: string) {
  return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionPayload;
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function getDefaults() {
  return {
    secret: process.env.SESSION_SECRET || "dev-session-secret",
  };
}

export function createSessionValue(identity: SessionIdentity, secret: string) {
  const payload: SessionPayload = {
    ...identity,
    issuedAt: Date.now(),
  };
  const body = encode(payload);
  return `${body}.${sign(body, secret)}`;
}

export function readSessionValue(value: string, secret: string) {
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = sign(body, secret);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, signatureBuffer)) return null;

  return decode(body);
}

export function getSessionSecret() {
  return getDefaults().secret;
}

export function readCookieSession(value: string | undefined) {
  if (!value) return null;
  return readSessionValue(value, getSessionSecret());
}
