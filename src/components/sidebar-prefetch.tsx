"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getDesktopPrefetchRoutes } from "@/lib/prefetch-routes";

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void) => number;
  cancelIdleCallback?: (id: number) => void;
};

export function SidebarPrefetch({ activeHref }: { activeHref: string }) {
  const router = useRouter();

  useEffect(() => {
    const routes = getDesktopPrefetchRoutes(activeHref);
    const currentWindow = window as IdleWindow;
    const runPrefetch = () => routes.forEach((href) => router.prefetch(href));

    if (currentWindow.requestIdleCallback) {
      const idleId = currentWindow.requestIdleCallback(runPrefetch);
      return () => currentWindow.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(runPrefetch, 150);
    return () => window.clearTimeout(timeoutId);
  }, [activeHref, router]);

  return null;
}
