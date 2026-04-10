import { getAssetStatusMeta } from "@/lib/asset-status";

export function AssetStatusPill({ status }: { status: string }) {
  const meta = getAssetStatusMeta(status);

  return (
    <span className={`asset-status-pill asset-status-pill--${meta.variant}`}>
      {meta.label}
    </span>
  );
}
