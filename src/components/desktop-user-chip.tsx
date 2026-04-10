"use client";

import { useEffect, useState } from "react";
import { DEFAULT_ADMIN_USERNAME } from "@/lib/admin-account";
import { getBrowserFrontendAuthSession } from "@/lib/frontend-auth";

export function DesktopUserChip() {
  const [identity, setIdentity] = useState(`系统管理员 · ${DEFAULT_ADMIN_USERNAME}`);

  useEffect(() => {
    const session = getBrowserFrontendAuthSession();
    if (!session) return;
    setIdentity(`${session.role} · ${session.username}`);
  }, []);

  return <div className="desktop-user-chip">{identity}</div>;
}
