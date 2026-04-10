import type { SessionPayload } from "@/lib/session";

function getEdgeSessionSecret() {
  return process.env.SESSION_SECRET || "dev-session-secret";
}

function toBase64Url(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodePayload(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  return JSON.parse(atob(base64 + padding)) as SessionPayload;
}

async function signEdge(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return toBase64Url(signature);
}

export async function readSessionValueEdge(value: string) {
  const [body, signature] = value.split(".");
  if (!body || !signature) return null;

  const expected = await signEdge(body, getEdgeSessionSecret());
  if (expected !== signature) return null;

  return decodePayload(body);
}
