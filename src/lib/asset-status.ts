export function getAssetStatusMeta(status: string) {
  switch (status) {
    case "已分配":
      return {
        label: "已分配",
        variant: "assigned" as const,
      };
    case "修理中":
      return {
        label: "修理中",
        variant: "repair" as const,
      };
    case "待分配":
    default:
      return {
        label: "待分配",
        variant: "pending" as const,
      };
  }
}
