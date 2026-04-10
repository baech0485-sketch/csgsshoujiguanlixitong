"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleLogout() {
    setMessage("");
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      setMessage("退出失败");
      return;
    }

    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="desktop-auth-actions">
      <button className="button button--ghost desktop-logout" type="button" onClick={handleLogout} disabled={isPending}>
        {isPending ? "退出中..." : "退出登录"}
      </button>
      {message ? <span className="desktop-auth-actions__error">{message}</span> : null}
    </div>
  );
}
