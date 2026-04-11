import { ObjectId } from "mongodb";
import { getApprovalsCollection } from "@/lib/mongodb";
import { buildServerPagination } from "@/lib/pagination";

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

export type PaginatedApprovalView = {
  items: ApprovalViewRow[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
};

function getTone(status: string): ApprovalTone {
  if (status === "已领取") return "success";
  if (status === "已回收") return "info";
  return "warning";
}

function mapApprovalRow(row: Record<string, unknown>): ApprovalViewRow {
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
}

export async function getApprovalsView(
  search = "",
  status = "全部",
  pageInput = 1,
  pageSize = 10,
): Promise<PaginatedApprovalView> {
  const approvals = await getApprovalsCollection();
  const query: Record<string, unknown> = { workflowType: "assignment_receipt" };

  if (status === "待领取" || status === "已领取") {
    query.status = status;
  }

  const keyword = search.trim();
  if (keyword) {
    query.employeeName = { $regex: keyword, $options: "i" };
  }

  const totalItems = await approvals.countDocuments(query);
  const pagination = buildServerPagination(totalItems, pageInput, pageSize);
  const rows = await approvals
    .find(query)
    .sort({ updatedAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.limit)
    .toArray();

  return {
    ...pagination,
    items: rows.map((row) => mapApprovalRow(row as Record<string, unknown>)),
  };
}

export async function getApprovalsSummary() {
  const approvals = await getApprovalsCollection();
  const rows = await approvals
    .aggregate([
      { $match: { workflowType: "assignment_receipt" } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ])
    .toArray();

  return rows.reduce<Record<string, number>>((result, row) => {
    result[String(row._id ?? "")] = Number(row.count ?? 0);
    return result;
  }, {});
}
