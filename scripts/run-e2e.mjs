import { spawn } from "node:child_process";
import { MongoMemoryServer } from "mongodb-memory-server";

function buildE2ETestEnv(baseEnv, mongoUri) {
  return {
    ...baseEnv,
    MONGODB_URI: mongoUri,
    MONGODB_DB_NAME: "shoujiguanli_e2e",
    SESSION_SECRET: baseEnv.SESSION_SECRET || "e2e-session-secret",
    E2E_USE_MEMORY_MONGO: "1",
    NEXT_TELEMETRY_DISABLED: "1",
  };
}

function getExecutable(name) {
  return process.platform === "win32" ? `${name}.cmd` : name;
}

function runCommand(command, args, env) {
  return new Promise((resolve, reject) => {
    const normalizedEnv = Object.fromEntries(
      Object.entries(env).filter(([, value]) => value !== undefined),
    );
    const child = spawn(command, args, {
      stdio: "inherit",
      cwd: process.cwd(),
      env: normalizedEnv,
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`命令被信号终止：${signal}`));
        return;
      }

      resolve(code ?? 1);
    });
  });
}

const mongoServer = await MongoMemoryServer.create();
const env = buildE2ETestEnv(process.env, mongoServer.getUri());
const playwrightArgs = process.argv.slice(2);

try {
  const buildCode = await runCommand(getExecutable("npm"), ["run", "build"], env);
  if (buildCode !== 0) {
    process.exit(buildCode);
  }

  const testCode = await runCommand(
    getExecutable("npx"),
    ["playwright", "test", ...playwrightArgs],
    env,
  );
  process.exit(testCode);
} finally {
  await mongoServer.stop();
}
