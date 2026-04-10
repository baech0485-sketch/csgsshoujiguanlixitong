"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setError(payload.message || "登录失败");
      return;
    }

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="field">
        <span>账号</span>
        <input aria-label="账号" value={username} placeholder="请输入账号" onChange={(event) => setUsername(event.target.value)} />
      </label>
      <label className="field">
        <span>密码</span>
        <div className="field__control">
          <input
            aria-label="密码"
            value={password}
            type={showPassword ? "text" : "password"}
            placeholder="请输入密码"
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            className="field__toggle"
            type="button"
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? <EyeOffIcon color="var(--primary-surface)" /> : <EyeIcon color="var(--primary-surface)" />}
          </button>
        </div>
      </label>
      <label className="remember-field">
        <input
          aria-label="记住密码"
          checked={rememberPassword}
          type="checkbox"
          onChange={(event) => setRememberPassword(event.target.checked)}
        />
        <span>记住密码</span>
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button button--primary button--block" type="submit" disabled={isPending}>
        {isPending ? "登录中..." : "登录系统"}
      </button>
    </form>
  );
}
