import { unstable_noStore as noStore } from "next/cache";
import {
  getAdminUsersCollection,
  getApprovalsCollection,
  getDeviceEventsCollection,
  getDevicesCollection,
  getEmployeesCollection,
  getIncidentsCollection,
  getOffboardingCollection,
} from "@/lib/mongodb";
import { dashboardStats } from "@/lib/mock-data";

type MetricCard = { label: string; value: string; accent: string };
type SummaryRow = { label: string; value: string; ratio: number; tone: "success" | "selected" | "warning" | "info" | "danger"; hint: string };
type ActivityRow = { title: string; meta: string; tone: "success" | "selected" | "warning" | "info" | "danger" };
type DeviceRow = { code: string; title: string; status: string };

export type DashboardSnapshot = {
  connectionStatus: "已连接" | "连接失败";
  headline: string;
  overviewStats: MetricCard[];
  deviceSummary: SummaryRow[];
  employeeSummary: SummaryRow[];
  workflowSummary: SummaryRow[];
  collectionCounts: Array<{ label: string; value: number }>;
  latestDevices: DeviceRow[];
  recentActivities: ActivityRow[];
};

function ratio(part: number, whole: number) {
  if (!whole) return 0;
  return Math.max(0.08, Math.min(1, part / whole));
}

function toneForEvent(type: string): ActivityRow["tone"] {
  if (type === "return_confirmed") return "warning";
  if (type === "incident_confirmed") return "info";
  if (type === "incident_created") return "danger";
  if (type === "receipt_confirmed") return "success";
  return "selected";
}

function fallbackSnapshot(): DashboardSnapshot {
  return {
    connectionStatus: "连接失败",
    headline: "当前未能读取云数据库，请检查网络或数据库连接。",
    overviewStats: dashboardStats,
    deviceSummary: [],
    employeeSummary: [],
    workflowSummary: [],
    collectionCounts: [
      { label: "管理员账号", value: 0 },
      { label: "员工档案", value: 0 },
      { label: "领取记录", value: 0 },
      { label: "异常确认", value: 0 },
    ],
    latestDevices: [],
    recentActivities: [],
  };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  noStore();

  try {
    const [devices, employees, approvals, offboarding, incidents, admins, events] = await Promise.all([
      getDevicesCollection(),
      getEmployeesCollection(),
      getApprovalsCollection(),
      getOffboardingCollection(),
      getIncidentsCollection(),
      getAdminUsersCollection(),
      getDeviceEventsCollection(),
    ]);

    const [
      deviceTotal,
      assignedCount,
      pendingCount,
      repairingCount,
      activeEmployees,
      inactiveEmployees,
      pendingReceipt,
      receivedCount,
      pendingReturns,
      returnedCount,
      pendingIncidents,
      confirmedIncidents,
      incidentTotal,
      employeeTotal,
      adminCount,
      latestDevices,
      recentEvents,
      repairingOwnersRows,
    ] = await Promise.all([
      devices.countDocuments({}),
      devices.countDocuments({ status: "已分配" }),
      devices.countDocuments({ status: "待分配" }),
      devices.countDocuments({ status: "修理中" }),
      employees.countDocuments({ status: "在职" }),
      employees.countDocuments({ status: "离职" }),
      approvals.countDocuments({ workflowType: "assignment_receipt", status: "待领取" }),
      approvals.countDocuments({ workflowType: "assignment_receipt", status: "已领取" }),
      offboarding.countDocuments({ status: "待回收" }),
      offboarding.countDocuments({ status: "已回收" }),
      incidents.countDocuments({ workflowType: "employee_incident", status: "待员工确认" }),
      incidents.countDocuments({ workflowType: "employee_incident", status: "已确认" }),
      incidents.countDocuments({}),
      employees.countDocuments({}),
      admins.countDocuments({ active: true }),
      devices.find().sort({ updatedAt: -1 }).limit(4).project({ assetCode: 1, brand: 1, model: 1, storage: 1, status: 1 }).toArray(),
      events.find().sort({ createdAt: -1 }).limit(6).toArray(),
      devices
        .find({ status: "修理中", currentOwnerCode: { $exists: true, $ne: null } })
        .project({ currentOwnerCode: 1 })
        .toArray(),
    ]);

    const repairingOwners = new Set(
      repairingOwnersRows
        .map((item) => String(item.currentOwnerCode ?? "").trim())
        .filter(Boolean),
    );

    return {
      connectionStatus: "已连接",
      headline: `当前待领取 ${pendingReceipt} 条、待回收 ${pendingReturns} 条、异常待确认 ${pendingIncidents} 条，修理中手机 ${repairingCount} 台。`,
      overviewStats: [
        { label: "手机总数", value: String(deviceTotal), accent: "var(--line-teal-dark)" },
        { label: "待分配", value: String(pendingCount), accent: "var(--line-gold)" },
        { label: "已分配", value: String(assignedCount), accent: "var(--line-aqua)" },
        { label: "修理中", value: String(repairingCount), accent: "var(--line-info)" },
      ],
      deviceSummary: [
        { label: "待分配手机", value: String(pendingCount), ratio: ratio(pendingCount, deviceTotal), tone: "success", hint: "可直接进入领用分配继续发放" },
        { label: "已分配手机", value: String(assignedCount), ratio: ratio(assignedCount, deviceTotal), tone: "selected", hint: "当前仍挂在员工责任名下的设备" },
        { label: "修理中手机", value: String(repairingCount), ratio: ratio(repairingCount, deviceTotal), tone: "info", hint: "包含维修、丢失等异常后转入维修中的设备" },
      ],
      employeeSummary: [
        { label: "在职员工", value: String(activeEmployees), ratio: ratio(activeEmployees, employeeTotal), tone: "success", hint: "当前可参与领用分配的员工人数" },
        { label: "离职员工", value: String(inactiveEmployees), ratio: ratio(inactiveEmployees, employeeTotal), tone: "warning", hint: "已完成离职同步的员工人数" },
        { label: "受维修影响员工", value: String(repairingOwners.size), ratio: ratio(repairingOwners.size, Math.max(activeEmployees, 1)), tone: "info", hint: "名下至少有 1 台维修中手机的员工" },
      ],
      workflowSummary: [
        { label: "待领取确认", value: String(pendingReceipt), ratio: ratio(pendingReceipt, Math.max(pendingReceipt + receivedCount, 1)), tone: "warning", hint: "员工尚未完成领取回执的记录" },
        { label: "待回收", value: String(pendingReturns), ratio: ratio(pendingReturns, Math.max(pendingReturns + returnedCount, 1)), tone: "danger", hint: "离职回收链接已发出但仍未确认" },
        { label: "异常待确认", value: String(pendingIncidents), ratio: ratio(pendingIncidents, Math.max(pendingIncidents + confirmedIncidents, 1)), tone: "danger", hint: "需要员工确认的异常设备记录" },
        { label: "已确认异常", value: String(confirmedIncidents), ratio: ratio(confirmedIncidents, Math.max(incidentTotal, 1)), tone: "info", hint: "已完成异常确认并进入维修中的记录" },
      ],
      collectionCounts: [
        { label: "管理员账号", value: adminCount },
        { label: "员工档案", value: employeeTotal },
        { label: "领取记录", value: pendingReceipt + receivedCount },
        { label: "异常确认", value: incidentTotal },
      ],
      latestDevices: latestDevices.map((item) => ({
        code: String(item.assetCode ?? ""),
        title: `${String(item.brand ?? "")} ${String(item.model ?? "")} / ${String(item.storage ?? "")}`.trim(),
        status: String(item.status ?? "待分配"),
      })),
      recentActivities: recentEvents.map((item) => ({
        title: String(item.title ?? "系统事件"),
        meta: `${String(item.actor ?? "系统")} · ${new Date(String(item.createdAt ?? new Date())).toLocaleString("zh-CN", { hour12: false })}`,
        tone: toneForEvent(String(item.type ?? "")),
      })),
    };
  } catch {
    return fallbackSnapshot();
  }
}
