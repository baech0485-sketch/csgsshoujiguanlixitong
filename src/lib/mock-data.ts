export const dashboardStats = [
  { label: "手机总数", value: "284", accent: "var(--line-teal-dark)" },
  { label: "已分配", value: "173", accent: "var(--line-aqua)" },
  { label: "待分配", value: "41", accent: "var(--line-gold)" },
  { label: "修理中", value: "14", accent: "var(--line-info)" },
];

export const deviceRows = [
  { code: "sj-18", model: "iPhone 14 Pro / 256G", owner: "李明", status: "已分配", date: "2026-04-06 14:32", tone: "selected" },
  { code: "sj-11", model: "iPhone 13 / 128G", owner: "待确认", status: "已分配", date: "2026-04-06 11:18", tone: "selected" },
  { code: "sj-86", model: "Xiaomi 14 / 256G", owner: "库存", status: "待分配", date: "2026-04-05 18:09", tone: "success" },
  { code: "sj-21", model: "iPhone 12 / 128G", owner: "维修站", status: "修理中", date: "2026-04-02 09:15", tone: "info" },
  { code: "sj-77", model: "iPhone 11 / 64G", owner: "维修站", status: "修理中", date: "2026-04-01 16:50", tone: "info" },
] satisfies Array<{
  code: string;
  model: string;
  owner: string;
  status: string;
  date: string;
  tone: "selected" | "warning" | "success" | "danger" | "info";
}>;

export const approvalQueue = [
  { type: "领用申请", title: "李明申请领用 iPhone 13", desc: "销售一组 / 待主管审批", tone: "warning" },
  { type: "跨组调拨", title: "王强转交 Xiaomi 14 给赵婷", desc: "地推组 / 待转出主管审批", tone: "info" },
  { type: "报废申请", title: "iPhone 11 电池损耗严重", desc: "库存组 / 待资产管理员审批", tone: "danger" },
  { type: "离职回收", title: "王晨名下设备已交还", desc: "人事流程 / 待主管关闭", tone: "selected" },
];

export const myDevices = [
  { title: "iPhone 14 Pro", code: "手机编号 sj-18", status: "已分配", footer: "最后确认：2026-04-06 14:32", tone: "selected" },
  { title: "iPhone 13", code: "手机编号 sj-11", status: "已分配", footer: "", tone: "selected" },
];

export const records = [
  { title: "领用确认", desc: "已完成 · 2026-04-06 14:32", tone: "selected", status: "已完成" },
  { title: "归还申请", desc: "审批中 · 等待主管确认", tone: "warning", status: "审批中" },
  { title: "异常申报", desc: "已驳回 · 请补充照片", tone: "danger", status: "已驳回" },
];

export const assignmentPool = [
  { code: "sj-11", title: "iPhone 13 · 128G", desc: "库存正常" },
  { code: "sj-86", title: "Xiaomi 14 · 256G", desc: "库存正常" },
  { code: "sj-22", title: "iPhone 12 · 128G", desc: "已维修完成" },
];

export const offboardingCases = [
  { employeeName: "王晨", department: "销售一组", leavingDate: "2026-04-10", status: "资产待回收", devices: ["sj-18", "sj-21"] },
];

export const incidentCases = [
  { type: "丢失", assetCode: "sj-21", description: "等待备案", status: "丢失待备案" },
  { type: "报废", assetCode: "sj-19", description: "主板损坏严重", status: "报废待审批" },
  { type: "异常库存", assetCode: "sj-87", description: "盘点不一致", status: "异常库存" },
];
