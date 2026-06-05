import { ObjectId } from "mongodb";
import { inferDeviceLocation } from "@/lib/device-listing";
import { approvalQueue, assignmentPool, incidentCases, myDevices, offboardingCases, records } from "@/lib/mock-data";
import { getApprovalsCollection, getDeviceEventsCollection, getDevicesCollection, getIncidentsCollection, getOffboardingCollection } from "@/lib/mongodb";

type ApprovalTone = "warning" | "info" | "danger" | "selected";

export type ApprovalViewRow = {
  id: string;
  type: string;
  title: string;
  desc: string;
  tone: ApprovalTone;
  status: string;
  requester: string;
  department: string;
  assignedDeviceCode: string;
};

export async function getApprovalsView(): Promise<ApprovalViewRow[]> {
  try {
    const approvals = await getApprovalsCollection();
    const rows = await approvals.find().sort({ updatedAt: -1 }).toArray();
    if (!rows.length) {
      return approvalQueue.map((row, index) => ({
        id: `mock-${index}`,
        ...row,
        status: "待审批",
        requester: "李明",
        department: row.desc.split("/")[0]?.trim() || "销售一组",
        assignedDeviceCode: "",
      })) as ApprovalViewRow[];
    }
    return rows.map((row) => ({
      id: String((row._id as ObjectId).toString()),
      type: String(row.type ?? ""),
      title: String(row.title ?? ""),
      desc: `${String(row.department ?? "")} / ${String(row.status ?? "")}`,
      tone: (row.status === "已驳回" ? "danger" : row.status === "已完成" ? "selected" : row.status === "已通过" || row.status === "已执行" ? "info" : "warning") as ApprovalTone,
      status: String(row.status ?? "待审批"),
      requester: String(row.requester ?? ""),
      department: String(row.department ?? ""),
      assignedDeviceCode: row.assignedDeviceCode ? String(row.assignedDeviceCode) : "",
    }));
  } catch {
    return approvalQueue.map((row, index) => ({ id: `mock-${index}`, ...row, status: "待审批", requester: "李明", department: "销售一组", assignedDeviceCode: "" })) as ApprovalViewRow[];
  }
}

export async function getAssignmentView() {
  const approvals = (await getApprovalsView()).filter((row) => ["已通过", "待审批", "待执行", "已执行"].includes(row.status) || row.id.startsWith("mock-"));
  try {
    const devices = await getDevicesCollection();
    const rows = await devices.find({ status: "待分配" }).limit(50).toArray();
    return {
      approvals,
      devices: rows.length
        ? rows.map((row) => ({
            code: String(row.assetCode ?? ""),
            title: `${String(row.brand ?? "")} ${String(row.model ?? "")} · ${String(row.storage ?? "")}`.trim(),
            desc: `待分配 · ${inferDeviceLocation(String(row.assetCode ?? ""))}`,
          }))
        : assignmentPool,
    };
  } catch {
    return { approvals, devices: assignmentPool };
  }
}

export async function getOffboardingView() {
  try {
    const offboarding = await getOffboardingCollection();
    const rows = await offboarding.find().sort({ updatedAt: -1 }).toArray();
    if (!rows.length) return offboardingCases;
    return rows.map((row) => ({
      employeeName: String(row.employeeName ?? ""),
      department: String(row.department ?? ""),
      leavingDate: String(row.leavingDate ?? ""),
      status: String(row.status ?? ""),
      devices: (row.deviceCodes as string[] | undefined) ?? [],
    }));
  } catch {
    return offboardingCases;
  }
}

export async function getIncidentsView() {
  try {
    const incidents = await getIncidentsCollection();
    const rows = await incidents.find().sort({ updatedAt: -1 }).toArray();
    if (!rows.length) return incidentCases;
    return rows.map((row) => ({
      type: String(row.type ?? ""),
      assetCode: String(row.assetCode ?? ""),
      description: String(row.description ?? ""),
      status: String(row.status ?? ""),
    }));
  } catch {
    return incidentCases;
  }
}

export async function getMobileDevicesView() {
  try {
    const devices = await getDevicesCollection();
    const rows = await devices.find({ status: "已分配" }).limit(5).toArray();
    if (!rows.length) return myDevices;
    return rows.map((row) => ({
      title: `${String(row.brand ?? "")} ${String(row.model ?? "")}`.trim(),
      code: `手机编号 ${String(row.assetCode ?? "")}`,
      status: String(row.status ?? ""),
      location: inferDeviceLocation(String(row.assetCode ?? "")),
      footer: row.updatedAt ? `最后确认：${new Date(String(row.updatedAt)).toISOString().slice(0, 16).replace("T", " ")}` : "",
      tone: "selected",
    }));
  } catch {
    return myDevices;
  }
}

export async function getFirstDeviceByStatus(status: string) {
  try {
    const devices = await getDevicesCollection();
    const row = await devices.findOne({ status });
    return row
      ? {
          code: String(row.assetCode ?? ""),
          title: `${String(row.brand ?? "")} ${String(row.model ?? "")} · ${String(row.storage ?? "")}`.trim(),
          imei1: String(row.imei1 ?? ""),
          status: String(row.status ?? status),
          location: inferDeviceLocation(String(row.assetCode ?? "")),
        }
      : null;
  } catch {
    return null;
  }
}

export async function getRecordsView() {
  try {
    const events = await getDeviceEventsCollection();
    const rows = await events.find().sort({ createdAt: -1 }).limit(10).toArray();
    if (!rows.length) return records;
    return rows.map((row) => ({
      title: String(row.title ?? ""),
      desc: `${String(row.actor ?? "系统")} · ${new Date(String(row.createdAt)).toISOString().slice(0, 16).replace("T", " ")}`,
      tone: row.type === "incident_created" ? "danger" : row.type === "return_confirmed" ? "warning" : "selected",
      status: row.type === "incident_created" ? "异常处理" : row.type === "return_confirmed" ? "归还完成" : "已完成",
    }));
  } catch {
    return records;
  }
}
