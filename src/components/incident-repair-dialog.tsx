"use client";

import { useState } from "react";
import { IncidentIcon } from "@/components/icons";
import { IncidentRepairQueue } from "@/components/incident-repair-queue";
import { PrimaryButton } from "@/components/ui";
import type { RepairQueueRow } from "@/lib/incident-management";

export function IncidentRepairDialog({ items }: { items: RepairQueueRow[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <PrimaryButton onClick={() => setOpen(true)}>
        <IncidentIcon color="var(--text-inverse)" />
        查看维修中手机
      </PrimaryButton>
      {open ? (
        <div className="modal-layer modal-layer--scroll">
          <div className="modal-card modal-card--repair">
            <div className="modal-card__header">
              <div>
                <h2>维修中手机列表</h2>
                <p>集中查看维修中的手机，修复完成后可直接恢复设备状态。</p>
              </div>
              <button className="modal-close" type="button" aria-label="关闭维修中手机列表" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>
            <div className="incident-repair-dialog__body">
              <IncidentRepairQueue items={items} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
