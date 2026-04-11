import { describe, expect, it } from "vitest";
import {
  canRenderProtectedPathImmediately,
  clearFrontendAuthSession,
  createFrontendAuthSession,
  FRONTEND_AUTH_STORAGE_KEY,
  readFrontendAuthSession,
} from "@/lib/frontend-auth";

function createMockStorage() {
  const storage = new Map<string, string>();

  return {
    getItem(key: string) {
      return storage.has(key) ? storage.get(key) ?? null : null;
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    },
    removeItem(key: string) {
      storage.delete(key);
    },
  };
}

describe("frontend-auth", () => {
  it("应创建并写入前端登录 token", () => {
    const storage = createMockStorage();
    const session = createFrontendAuthSession(1712716800000);

    expect(session.username).toBe("csgs_admin");
    expect(session.role).toBe("系统管理员");
    expect(session.token).toContain("csgs_admin");

    storage.setItem(FRONTEND_AUTH_STORAGE_KEY, JSON.stringify(session));
    expect(readFrontendAuthSession(storage)).toEqual(session);
  });

  it("损坏的前端 token 应被忽略", () => {
    const storage = createMockStorage();
    storage.setItem(FRONTEND_AUTH_STORAGE_KEY, "{bad-json");

    expect(readFrontendAuthSession(storage)).toBeNull();
  });

  it("退出登录后应清除前端 token", () => {
    const storage = createMockStorage();
    storage.setItem(FRONTEND_AUTH_STORAGE_KEY, JSON.stringify(createFrontendAuthSession()));

    clearFrontendAuthSession(storage);
    expect(storage.getItem(FRONTEND_AUTH_STORAGE_KEY)).toBeNull();
  });

  it("已登录时进入受保护页面应可首屏直接放行", () => {
    const storage = createMockStorage();
    storage.setItem(FRONTEND_AUTH_STORAGE_KEY, JSON.stringify(createFrontendAuthSession()));

    expect(canRenderProtectedPathImmediately("/devices/sj-01", "", storage)).toBe(true);
    expect(canRenderProtectedPathImmediately("/login", "", storage)).toBe(false);
  });
});
