"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { validateFrontendAdminPassword } from "@/lib/admin-account";
import {
  createFrontendAuthSession,
  persistBrowserFrontendAuthSession,
} from "@/lib/frontend-auth";
import {
  getBrowserRememberedLoginState,
  persistBrowserRememberedLogin,
} from "@/lib/remember-login";

export function LoginForm() {
  const router = useRouter();
  const initialLoginState = useRef(getBrowserRememberedLoginState());
  const [password, setPassword] = useState(initialLoginState.current.password);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(initialLoginState.current.rememberPassword);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    router.prefetch("/dashboard");
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!validateFrontendAdminPassword(password)) {
      setError("登录密码错误");
      return;
    }

    persistBrowserFrontendAuthSession(createFrontendAuthSession());
    persistBrowserRememberedLogin({ password, rememberPassword });

    startTransition(() => {
      router.push("/dashboard");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="field">
        <span>登录密码</span>
        <div className="field__control">
          <input
            aria-label="登录密码"
            value={password}
            type={showPassword ? "text" : "password"}
            placeholder="请输入管理员登录密码"
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
