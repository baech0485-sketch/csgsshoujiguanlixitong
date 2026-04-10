import { describe, expect, it } from "vitest";
import {
  getDefaultRememberedLoginState,
  persistRememberedLogin,
  REMEMBER_LOGIN_STORAGE_KEY,
} from "@/lib/remember-login";

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

describe("remember-login", () => {
  it("应从本地存储恢复默认登录表单值", () => {
    const storage = createMockStorage();
    storage.setItem(
      REMEMBER_LOGIN_STORAGE_KEY,
      JSON.stringify({
        password: "CSGS@2026!Admin",
      }),
    );

    expect(getDefaultRememberedLoginState(storage)).toEqual({
      password: "CSGS@2026!Admin",
      rememberPassword: true,
    });
  });

  it("本地存储损坏时应回退到默认值", () => {
    const storage = createMockStorage();
    storage.setItem(REMEMBER_LOGIN_STORAGE_KEY, "{invalid-json");

    expect(getDefaultRememberedLoginState(storage)).toEqual({
      password: "",
      rememberPassword: true,
    });
    expect(storage.getItem(REMEMBER_LOGIN_STORAGE_KEY)).toBeNull();
  });

  it("取消记住密码时应清空本地凭据", () => {
    const storage = createMockStorage();

    persistRememberedLogin(storage, {
      password: "CSGS@2026!Admin",
      rememberPassword: false,
    });

    expect(storage.getItem(REMEMBER_LOGIN_STORAGE_KEY)).toBeNull();
  });
});
