import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

export type AdminIdentity = {
  username: string;
  role: string;
};

export type AdminUserRecord = AdminIdentity & {
  passwordSalt: string;
  passwordHash: string;
  active: boolean;
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

export async function validateAdminCredentials(username: string, password: string): Promise<AdminIdentity | null> {
  const { getAdminUsersCollection } = await import("@/lib/mongodb");
  const admins = await getAdminUsersCollection();
  const admin = (await admins.findOne({
    username: username.trim(),
    active: true,
  })) as AdminUserRecord | null;

  if (!admin) return null;
  if (!verifyPassword(password, admin.passwordSalt, admin.passwordHash)) return null;

  return {
    username: admin.username,
    role: admin.role,
  };
}
