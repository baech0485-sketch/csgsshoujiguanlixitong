"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { IncidentIcon } from "@/components/icons";
import { PrimaryButton, StatusPill } from "@/components/ui";

export function IncidentReportForm({ assetCode }: { assetCode: string }) {
  const router = useRouter();
  const [type, setType] = useState("丢失");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, assetCode, description }),
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message || "提交失败");
      return;
    }
    startTransition(() => router.push("/incidents"));
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="filters-row filters-row--mobile">
        {["丢失", "损坏", "送修申请"].map((item) => (
          <button key={item} className="plain-chip-button" type="button" onClick={() => setType(item)}>
            <StatusPill tone={item === "丢失" ? "danger" : item === "损坏" ? "warning" : "info"}>{item}</StatusPill>
          </button>
        ))}
      </div>
      <div className="textarea-placeholder textarea-placeholder--editable">
        <textarea value={description} placeholder="请输入异常说明..." onChange={(event) => setDescription(event.target.value)} />
      </div>
      {message ? <p className="form-error">{message}</p> : null}
      <PrimaryButton tone="danger" type="submit" disabled={isPending}><IncidentIcon color="var(--text-inverse)" />{isPending ? "提交中..." : "提交异常申报"}</PrimaryButton>
    </form>
  );
}
