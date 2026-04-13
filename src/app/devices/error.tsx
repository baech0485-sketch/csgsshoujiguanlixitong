"use client";

import { useEffect } from "react";
import { DesktopShell } from "@/components/desktop-shell";
import { Panel } from "@/components/ui";

export default function DevicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("设备页渲染失败", error);
  }, [error]);

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/devices" title="手机资产台账" subtitle="设备页暂时不可用，请重新加载后再试">
        <Panel title="页面加载异常" subtitle="系统刚刚在加载手机资产页时出现异常，这次错误已被局部拦截。">
          <div className="device-empty">
            当前未能完整加载设备页。你可以先重试当前页面，如果问题持续，再返回其他模块继续操作。
          </div>
          <div className="device-side-panel__actions">
            <button className="button button--primary" type="button" onClick={reset}>重新加载设备页</button>
          </div>
        </Panel>
      </DesktopShell>
    </main>
  );
}
