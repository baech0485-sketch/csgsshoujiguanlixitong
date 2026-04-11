"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  canRenderProtectedPathImmediately,
  getBrowserFrontendAuthSession,
  isPublicFrontendPath,
} from "@/lib/frontend-auth";

export function FrontendAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(() => {
    if (typeof window === "undefined") return false;
    return canRenderProtectedPathImmediately(pathname, window.location.search, window.localStorage);
  });

  useEffect(() => {
    const session = getBrowserFrontendAuthSession();
    const search = typeof window !== "undefined" ? window.location.search : "";
    const isPublic = isPublicFrontendPath(pathname, search);

    if (pathname === "/") {
      setIsReady(false);
      router.replace(session ? "/dashboard" : "/login");
      return;
    }

    if (pathname === "/login") {
      if (session) {
        setIsReady(false);
        router.replace("/dashboard");
        return;
      }

      setIsReady(true);
      return;
    }

    if (!session && !isPublic) {
      setIsReady(false);
      router.replace("/login");
      return;
    }

    setIsReady(true);
  }, [pathname, router]);

  if (!isReady) {
    return (
      <div className="auth-guard">
        <div className="auth-guard__card">
          <strong>正在验证登录状态</strong>
          <span>请稍候，系统正在同步当前登录信息。</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
