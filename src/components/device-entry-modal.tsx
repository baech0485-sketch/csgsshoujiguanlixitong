"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DevicePhotoUpload } from "@/components/device-photo-upload";
import { DeviceIcon } from "@/components/icons";

type DeviceFormState = {
  assetCode: string;
  brand: string;
  model: string;
  storage: string;
  serialNumber: string;
  status: string;
  warehousingDate: string;
  photoDataUrl: string;
};

const buildInitialState = (nextDeviceCode: string, warehousingDate: string): DeviceFormState => ({
  assetCode: nextDeviceCode,
  brand: "",
  model: "",
  storage: "",
  serialNumber: "",
  status: "待分配",
  warehousingDate,
  photoDataUrl: "",
});

const fields: Array<{
  key: keyof DeviceFormState;
  label: string;
  placeholder: string;
  readOnly?: boolean;
  tag: "自动生成" | "必填" | "选填";
  hint?: string;
}> = [
  { key: "assetCode", label: "手机编号", placeholder: "", readOnly: true, tag: "自动生成", hint: "系统会按顺序生成 sj-xx" },
  { key: "brand", label: "品牌", placeholder: "例如 Apple / Xiaomi", tag: "必填", hint: "建议填写标准品牌名" },
  { key: "model", label: "型号", placeholder: "例如 iPhone 14 Pro", tag: "必填", hint: "用于后续分配与查询" },
  { key: "storage", label: "存储容量", placeholder: "例如 128G / 256G", tag: "必填", hint: "统一填写设备容量" },
  { key: "serialNumber", label: "序列号", placeholder: "请输入序列号", tag: "必填", hint: "用于设备追溯和售后核对" },
  { key: "warehousingDate", label: "入库日期", placeholder: "", readOnly: true, tag: "自动生成", hint: "提交时自动写入当天日期" },
  { key: "status", label: "当前状态", placeholder: "", readOnly: true, tag: "自动生成", hint: "新设备默认进入待分配" },
];

export function DeviceEntryModal({ nextDeviceCode, warehousingDate }: { nextDeviceCode: string; warehousingDate: string }) {
  const router = useRouter();
  const [form, setForm] = useState(() => buildInitialState(nextDeviceCode, warehousingDate));
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function closeModal() {
    startTransition(() => {
      router.replace("/devices");
      router.refresh();
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!form.serialNumber.trim()) {
      setMessage("请填写序列号");
      return;
    }

    if (!form.photoDataUrl) {
      setMessage("请先上传手机图片");
      return;
    }

    const response = await fetch("/api/devices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = (await response.json()) as { message?: string; assetCode?: string };

    if (!response.ok) {
      setMessage(payload.message || "录入失败，请稍后重试");
      return;
    }

    startTransition(() => {
      router.replace(payload.assetCode ? `/devices?selected=${payload.assetCode}` : "/devices");
      router.refresh();
    });
  }

  return (
    <div className="modal-layer">
      <form className="modal-card" onSubmit={handleSubmit}>
        <div className="modal-card__header">
          <div>
            <h2>录入手机</h2>
            <p>填写手机的基础资产信息，提交后进入手机资产台账，并可继续触发分配或审批流程。</p>
          </div>
          <button className="modal-close" type="button" aria-label="关闭" onClick={closeModal}>
            ×
          </button>
        </div>
        <div className="modal-grid">
          {fields.map((field) => (
            <label key={field.key} className="field">
              <span className="field__label-row">
                <span>{field.label}</span>
                <span className={`field__tag field__tag--${field.tag}`}>{field.tag}</span>
              </span>
              <input
                aria-label={field.label}
                value={form[field.key]}
                placeholder={field.placeholder}
                readOnly={field.readOnly}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
              />
              {field.hint ? <small className="field__hint">{field.hint}</small> : null}
            </label>
          ))}
        </div>
        <DevicePhotoUpload value={form.photoDataUrl} onChange={(value) => setForm((current) => ({ ...current, photoDataUrl: value }))} />
        <div className="modal-note">提交后系统会自动写入手机编号、入库日期和待分配状态。若需要立即分配给销售，可在台账中继续发起领用分配。</div>
        {message ? <p className="form-error">{message}</p> : null}
        <div className="modal-actions">
          <button className="button button--ghost" type="button" onClick={closeModal}>
            取消
          </button>
          <button className="button button--primary button--icon" type="submit" disabled={isPending}>
            <DeviceIcon color="var(--text-inverse)" />
            {isPending ? "提交中..." : "提交录入"}
          </button>
        </div>
      </form>
    </div>
  );
}
