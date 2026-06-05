"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AssetStatusPill } from "@/components/asset-status-pill";
import { Panel, PrimaryButton } from "@/components/ui";
import { inferBrand, type DeviceListRow } from "@/lib/device-listing";

type DevicePreviewPanelProps = {
  selected: DeviceListRow | null;
  isLoading?: boolean;
};

export function DevicePreviewPanel({ selected, isLoading = false }: DevicePreviewPanelProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    setIsPreviewOpen(false);
  }, [selected?.code]);

  useEffect(() => {
    if (!isPreviewOpen) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsPreviewOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPreviewOpen]);

  const canPreviewImage = Boolean(selected?.photoDataUrl);
  const photoDataUrl = selected?.photoDataUrl || "";

  return (
    <>
      <Panel title="设备速览" subtitle="与表格联动显示当前选中设备" className="device-side-panel">
        <div className="device-hero-box">
          {canPreviewImage ? (
            <button
              type="button"
              className="device-hero-button"
              aria-label="放大查看设备图片"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Image src={photoDataUrl} alt="设备图片" fill unoptimized className="device-hero-box__image" />
              <span className="device-hero-box__hint">点击放大查看</span>
            </button>
          ) : isLoading ? <span className="device-hero-box__hint">正在切换设备速览</span> : null}
        </div>
        <div className="device-side-panel__info">
          {selected ? (
            <>
              <p>{selected.model.split("/")[0]?.trim() || selected.model}</p>
              <p>{selected.model.split("/")[1]?.trim() || selected.brand || inferBrand(selected.model)}</p>
              <p>手机编号：{selected.code}</p>
              <p>当前所在地：{selected.location}</p>
              <p>当前责任人：{selected.owner}</p>
              <div className="device-side-panel__status-row">
                <span>当前状态：</span>
                <AssetStatusPill status={selected.status} />
              </div>
            </>
          ) : (
            <>
              <p>当前暂无设备数据</p>
              <p>请先通过右上角“手机录入”按钮录入设备</p>
            </>
          )}
        </div>
        <div className="device-side-panel__actions">
          {selected ? (
            <PrimaryButton href={`/devices/${selected.code}`}>查看完整详情</PrimaryButton>
          ) : (
            <button className="button button--ghost" type="button" disabled>暂无详情</button>
          )}
        </div>
      </Panel>
      {isPreviewOpen && canPreviewImage ? (
        <div className="modal-layer modal-layer--image" onClick={() => setIsPreviewOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="设备图片预览"
            className="device-image-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="device-image-dialog__header">
              <div>
                <strong>{selected?.code}</strong>
                <p>{selected?.model || "设备图片预览"}</p>
              </div>
              <button
                type="button"
                className="modal-close"
                aria-label="关闭设备图片预览"
                onClick={() => setIsPreviewOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="device-image-dialog__stage">
              <Image
                src={photoDataUrl}
                alt="设备图片大图预览"
                fill
                unoptimized
                className="device-image-dialog__image"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
