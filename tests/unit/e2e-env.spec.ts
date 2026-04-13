import { describe, expect, it } from "vitest";
import { buildE2ETestEnv } from "@/lib/e2e-env";

describe("buildE2ETestEnv", () => {
  it("应强制覆盖数据库到内存测试环境且保留无关变量", () => {
    const env = buildE2ETestEnv(
      {
        MONGODB_URI: "mongodb://prod-host:27017/shoujiguanli",
        MONGODB_DB_NAME: "shoujiguanli",
        SESSION_SECRET: "prod-secret",
        CUSTOM_FLAG: "keep-me",
      },
      "mongodb://127.0.0.1:27017",
    );

    expect(env.MONGODB_URI).toBe("mongodb://127.0.0.1:27017");
    expect(env.MONGODB_DB_NAME).toBe("shoujiguanli_e2e");
    expect(env.SESSION_SECRET).toBe("prod-secret");
    expect(env.NEXT_TELEMETRY_DISABLED).toBe("1");
    expect(env.E2E_USE_MEMORY_MONGO).toBe("1");
    expect(env.CUSTOM_FLAG).toBe("keep-me");
  });

  it("在缺少 SESSION_SECRET 时应使用测试默认值", () => {
    const env = buildE2ETestEnv({}, "mongodb://127.0.0.1:27017");

    expect(env.SESSION_SECRET).toBe("e2e-session-secret");
  });
});
