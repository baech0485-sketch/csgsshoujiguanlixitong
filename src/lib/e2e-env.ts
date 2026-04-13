export function buildE2ETestEnv(
  baseEnv: NodeJS.ProcessEnv,
  mongoUri: string,
): NodeJS.ProcessEnv {
  return {
    ...baseEnv,
    MONGODB_URI: mongoUri,
    MONGODB_DB_NAME: "shoujiguanli_e2e",
    SESSION_SECRET: baseEnv.SESSION_SECRET || "e2e-session-secret",
    E2E_USE_MEMORY_MONGO: "1",
    NEXT_TELEMETRY_DISABLED: "1",
  };
}
