"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { DeviceIcon } from "@/components/icons";

type DeviceDetailFormProps = {
  code: string;
  initialValues: {
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
};

export function DeviceDetailForm({ code, initialValues }: DeviceDetailFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initialValues);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const fields = useMemo(
    () => [
  { key: "assetCode", label: "手机编号" },
      { key: "brand", label: "品牌" },
      { key: "model", label: "型号" },
      { key: "storage", label: "存储容量" },
      { key: "imei1", label: "IMEI1" },
      { key: "imei2", label: "IMEI2" },
      { key: "serialNumber", label: "序列号" },
      { key: "purchaseDate", label: "入库日期" },
      { key: "purchasePrice", label: "采购金额" },
      { key: "status", label: "当前状态" },
    ] as const,
    [],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const response = await fetch(`/api/devices/${code}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "保存失败");
      return;
    }

    setMessage("保存成功");
    startTransition(() => router.refresh());
  }

  async function handleDelete() {
    const confirmed = window.confirm("确定删除这台手机资产吗？");
    if (!confirmed) return;

    const response = await fetch(`/api/devices/${code}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setMessage("删除失败");
      return;
    }

    startTransition(() => {
      router.push("/devices");
      router.refresh();
    });
  }

  return (
    <form className="device-detail-layout" onSubmit={handleSubmit}>
      <div className="device-detail-hero">
        <div className="device-detail-hero__thumb">
          {form.photoDataUrl ? <Image src={form.photoDataUrl} alt="设备图片" fill unoptimized className="device-hero-box__image" /> : null}
        </div>
        <div>
          <h2>{form.brand} {form.model}</h2>
          <p>{form.storage} / 当前状态：{form.status || "待分配"}</p>
          <span className="pill pill--selected">手机编号：{form.assetCode}</span>
        </div>
      </div>
      <div className="device-detail-grid">
        {fields.map((field) => (
          <label key={field.key} className="field">
            <span>{field.label}</span>
            {field.key === "status" ? (
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                {["待分配", "已分配", "修理中"].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            ) : (
              <input
                value={form[field.key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
              />
            )}
          </label>
        ))}
      </div>
      {message ? <p className="form-error">{message}</p> : null}
      <div className="device-detail-actions">
        <Link href="/devices" className="button button--ghost">返回台账</Link>
        <button className="button button--danger" type="button" onClick={handleDelete} disabled={isPending}>删除设备</button>
        <button className="button button--primary button--icon" type="submit" disabled={isPending}>
          <DeviceIcon color="var(--text-inverse)" />
          保存修改
        </button>
      </div>
    </form>
  );
}
