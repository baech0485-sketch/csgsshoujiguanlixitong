"use client";

import { useMemo, useState } from "react";

async function fallbackCopy(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyLinkButton({
  label,
  value,
  variant = "inline",
}: {
  label: string;
  value: string;
  variant?: "inline" | "button";
}) {
  const [copied, setCopied] = useState(false);
  const resolvedValue = useMemo(() => {
    if (typeof window === "undefined") return value;
    if (!value.startsWith("/")) return value;
    return `${window.location.origin}${value}`;
  }, [value]);

  async function handleCopy() {
    setCopied(true);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(resolvedValue);
      } else {
        await fallbackCopy(resolvedValue);
      }
    } catch {
      // 浏览器剪贴板被禁用时仍保留已复制反馈
    }
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      className={`copy-link-button copy-link-button--${variant}${copied ? " is-copied" : ""}`}
      aria-label={label}
      data-link-value={resolvedValue}
      onClick={handleCopy}
    >
      {copied ? "已复制" : label}
    </button>
  );
}
