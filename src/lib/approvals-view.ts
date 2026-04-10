import { ObjectId } from "mongodb";
import { getApprovalsCollection } from "@/lib/mongodb";

type ApprovalTone = "warning" | "success" | "info";

export type ApprovalViewRow = {
  id: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  deviceCode: string;
  deviceCodes: string[];
  deviceSummary: string;
  deviceTitle: string;
  status: string;
  confirmUrl: string;
  confirmationMethod: string;
  signatureImage: string;
  signedAt: string;
  tone: ApprovalTone;
};

function getTone(status: string): ApprovalTone {
  if (status === "已领取") return "success";
  if (status === "已回收") return "info";
  return "warning";
}

export async function getApprovalsView(): Promise<ApprovalViewRow[]> {
  const approvals = await getApprovalsCollection();
  const rows = await approvals.find({ workflowType: "assignment_receipt" }).sort({ updatedAt: -1 }).limit(100).toArray();

  return rows.map((row) => {
    const deviceCodes = Array.isArray(row.deviceCodes)
      ? row.deviceCodes.map(String)
      : [String(row.deviceCode ?? "")].filter(Boolean);
    const deviceSummary = Array.isArray(row.devices)
      ? row.devices
          .map((item) => String((item as { deviceCode?: string }).deviceCode ?? ""))
          .filter(Boolean)
          .join("、")
      : deviceCodes.join("、");

    return {
      id: String((row._id as ObjectId).toString()),
      employeeCode: String(row.employeeCode ?? ""),
      employeeName: String(row.employeeName ?? ""),
      department: String(row.department ?? ""),
      deviceCode: String(row.deviceCode ?? ""),
      deviceCodes,
      deviceSummary,
      deviceTitle: String(row.deviceTitle ?? ""),
      status: String(row.status ?? "待领取"),
      confirmUrl: String(row.confirmUrl ?? ""),
      confirmationMethod: String(row.confirmationMethod ?? ""),
      signatureImage: String(row.signatureImage ?? ""),
      signedAt: row.signedAt ? new Date(String(row.signedAt)).toLocaleString("zh-CN", { hour12: false }) : "",
      tone: getTone(String(row.status ?? "待领取")),
    };
  });
}
