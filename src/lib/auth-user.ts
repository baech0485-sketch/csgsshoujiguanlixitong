import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";
import {
  DEFAULT_ADMIN_USERNAME,
  validateFrontendAdminPassword,
} from "@/lib/admin-account";

export type AdminIdentity = {
  username: string;
  role: string;
};

export function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, hash: string) {
  const candidate = pbkdf2Sync(password, salt, 120000, 32, "sha256");
  const target = Buffer.from(hash, "hex");
  return candidate.length === target.length && timingSafeEqual(candidate, target);
}

export async function validateAdminPassword(
  password: string,
  username = DEFAULT_ADMIN_USERNAME,
): Promise<AdminIdentity | null> {
  if (!validateFrontendAdminPassword(password)) {
    return null;
  }

  return {
    username: username.trim(),
    role: "系统管理员",
  };
}
