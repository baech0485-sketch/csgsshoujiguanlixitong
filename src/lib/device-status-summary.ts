export type DeviceStatusCard = {
  label: string;
  value: string;
  tone: "muted" | "success" | "selected" | "info";
  accent: string;
};

type DeviceStatusSummaryInput = {
  total: number;
  pending: number;
  assigned: number;
  repairing: number;
};

function formatCount(value: number) {
  return String(value).padStart(2, "0");
}

export function buildDeviceStatusCards(summary: DeviceStatusSummaryInput): DeviceStatusCard[] {
  return [
    {
      label: "全部手机",
      value: formatCount(summary.total),
      tone: "muted",
      accent: "var(--line-teal-dark)",
    },
    {
      label: "待分配",
      value: formatCount(summary.pending),
      tone: "success",
      accent: "var(--line-gold)",
    },
    {
      label: "已分配",
      value: formatCount(summary.assigned),
      tone: "selected",
      accent: "var(--line-aqua)",
    },
    {
      label: "修理中",
      value: formatCount(summary.repairing),
      tone: "info",
      accent: "var(--line-info)",
    },
  ];
}
