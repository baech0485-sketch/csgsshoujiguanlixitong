"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DevicePhotoUpload } from "@/components/device-photo-upload";
import { DeviceIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/ui";

type DeviceEntryState = {
  assetCode: string;
  brand: string;
  model: string;
  storage: string;
  serialNumber: string;
  status: string;
  warehousingDate: string;
  photoDataUrl: string;
};

function buildInitialState(nextDeviceCode: string, warehousingDate: string): DeviceEntryState {
  return {
    assetCode: nextDeviceCode,
    brand: "",
    model: "",
    storage: "",
    serialNumber: "",
    status: "待分配",
    warehousingDate,
    photoDataUrl: "",
  };
}

export function MobileDeviceEntryForm({
  nextDeviceCode,
  warehousingDate,
}: {
  nextDeviceCode: string;
  warehousingDate: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState(() => buildInitialState(nextDeviceCode, warehousingDate));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/public/device-entry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const payload = (await response.json()) as { message?: string; assetCode?: string };
    if (!response.ok) {
      setMessage(payload.message || "录入失败");
      return;
    }

    startTransition(() => {
      router.push(payload.assetCode ? `/m/device-entry-success?code=${payload.assetCode}` : "/m/device-entry-success");
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="field"><span>手机编号</span><input aria-label="手机编号" value={form.assetCode} readOnly /></label>
      <label className="field"><span>品牌</span><input aria-label="品牌" value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} /></label>
      <label className="field"><span>型号</span><input aria-label="型号" value={form.model} onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))} /></label>
      <label className="field"><span>存储容量</span><input aria-label="存储容量" value={form.storage} onChange={(event) => setForm((current) => ({ ...current, storage: event.target.value }))} /></label>
      <label className="field"><span>序列号</span><input aria-label="序列号" value={form.serialNumber} onChange={(event) => setForm((current) => ({ ...current, serialNumber: event.target.value }))} /></label>
      <label className="field"><span>入库日期</span><input aria-label="入库日期" value={form.warehousingDate} readOnly /></label>
      <label className="field"><span>当前状态</span><input aria-label="当前状态" value={form.status} readOnly /></label>
      <DevicePhotoUpload
        value={form.photoDataUrl}
        capture="environment"
        onChange={(value) => setForm((current) => ({ ...current, photoDataUrl: value }))}
      />
      <div className="mobile-entry-note">
        <strong>拍照上传说明</strong>
        <p>手机端点击上传手机图片时，会优先调用后置摄像头拍照上传；如设备不支持，也可切换到相册选择图片。</p>
      </div>
      {message ? <p className="form-error">{message}</p> : null}
      <PrimaryButton type="submit" disabled={isPending}>
        <DeviceIcon color="var(--text-inverse)" />
        {isPending ? "提交中..." : "提交录入"}
      </PrimaryButton>
    </form>
  );
}
