"use client";

import { useEffect, useState } from "react";
import { DevicePhotoUpload } from "@/components/device-photo-upload";
import { DeviceIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui";

type IncidentRepairDeviceEditModalProps = {
  deviceCode: string;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

type RepairDeviceForm = {
  assetCode: string;
  brand: string;
  model: string;
  storage: string;
  photoDataUrl: string;
  imei1: string;
  imei2: string;
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: string;
  status: string;
};

const emptyForm: RepairDeviceForm = {
  assetCode: "",
  brand: "",
  model: "",
  storage: "",
  photoDataUrl: "",
  imei1: "",
  imei2: "",
  serialNumber: "",
  purchaseDate: "",
  purchasePrice: "",
  status: "修理中",
};

function normalizeForm(payload: Record<string, unknown>): RepairDeviceForm {
  return {
    assetCode: String(payload.assetCode ?? ""),
    brand: String(payload.brand ?? ""),
    model: String(payload.model ?? ""),
    storage: String(payload.storage ?? ""),
    photoDataUrl: String(payload.photoDataUrl ?? ""),
    imei1: String(payload.imei1 ?? ""),
    imei2: String(payload.imei2 ?? ""),
    serialNumber: String(payload.serialNumber ?? ""),
    purchaseDate: String(payload.purchaseDate ?? ""),
    purchasePrice: payload.purchasePrice ? String(payload.purchasePrice) : "",
    status: String(payload.status ?? "修理中"),
  };
}

export function IncidentRepairDeviceEditModal({
  deviceCode,
  open,
  onClose,
  onSaved,
}: IncidentRepairDeviceEditModalProps) {
  const [form, setForm] = useState<RepairDeviceForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setMessage("");
      setIsLoading(false);
      setIsSaving(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setMessage("");

    fetch(`/api/devices/${encodeURIComponent(deviceCode)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as Record<string, unknown> & { message?: string };
        if (!response.ok) {
          throw new Error(payload.message || "加载设备资料失败");
        }
        setForm(normalizeForm(payload));
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setMessage(error instanceof Error ? error.message : "加载设备资料失败");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [deviceCode, open]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSaving(true);

    const response = await fetch(`/api/devices/${encodeURIComponent(deviceCode)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as { message?: string };

    if (!response.ok) {
      setMessage(payload.message || "保存手机资料失败");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    onSaved();
  }

  return (
    <div className="modal-layer modal-layer--scroll" onClick={onClose}>
      <form className="modal-card modal-card--repair-edit" onSubmit={handleSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="modal-card__header">
          <div>
            <h2>编辑维修中手机</h2>
            <p>如果维修返回的是替换新机，可直接在这里更新手机编号、型号、序列号、IMEI 和图片资料。</p>
          </div>
          <button className="modal-close" type="button" aria-label="关闭编辑维修中手机弹窗" onClick={onClose}>
            ×
          </button>
        </div>
        {isLoading ? (
          <div className="device-empty">正在加载手机资料...</div>
        ) : (
          <>
            <div className="device-detail-grid">
              <label className="field"><span>手机编号</span><input aria-label="编辑手机编号" value={form.assetCode} onChange={(event) => setForm((current) => ({ ...current, assetCode: event.target.value }))} /></label>
              <label className="field"><span>品牌</span><input aria-label="编辑品牌" value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} /></label>
              <label className="field"><span>型号</span><input aria-label="编辑型号" value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))} /></label>
              <label className="field"><span>存储容量</span><input aria-label="编辑存储容量" value={form.storage} onChange={(event) => setForm((current) => ({ ...current, storage: event.target.value }))} /></label>
              <label className="field"><span>IMEI1</span><input aria-label="编辑IMEI1" value={form.imei1} onChange={(event) => setForm((current) => ({ ...current, imei1: event.target.value }))} /></label>
              <label className="field"><span>IMEI2</span><input aria-label="编辑IMEI2" value={form.imei2} onChange={(event) => setForm((current) => ({ ...current, imei2: event.target.value }))} /></label>
              <label className="field"><span>序列号</span><input aria-label="编辑序列号" value={form.serialNumber} onChange={(event) => setForm((current) => ({ ...current, serialNumber: event.target.value }))} /></label>
              <label className="field"><span>入库日期</span><input aria-label="编辑入库日期" value={form.purchaseDate} onChange={(event) => setForm((current) => ({ ...current, purchaseDate: event.target.value }))} /></label>
              <label className="field"><span>采购金额</span><input aria-label="编辑采购金额" value={form.purchasePrice} onChange={(event) => setForm((current) => ({ ...current, purchasePrice: event.target.value }))} /></label>
              <label className="field">
                <span>当前状态</span>
                <select aria-label="编辑当前状态" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
                  {["待分配", "已分配", "修理中"].map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
            </div>
            <DevicePhotoUpload value={form.photoDataUrl} onChange={(value) => setForm((current) => ({ ...current, photoDataUrl: value }))} />
          </>
        )}
        {message ? <p className="form-error">{message}</p> : null}
        <div className="modal-actions">
          <button className="button button--ghost" type="button" onClick={onClose} disabled={isSaving}>取消</button>
          <PrimaryButton type="submit" disabled={isLoading || isSaving}>
            <DeviceIcon color="var(--text-inverse)" />
            {isSaving ? "保存中..." : "保存手机资料"}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
