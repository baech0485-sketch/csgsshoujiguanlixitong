export type RecoveryMode = "offboarding" | "active";

type RecoveryModeMeta = {
  label: string;
  formTitle: string;
  formSubtitle: string;
  dateLabel: string;
  createButtonLabel: string;
  createErrorMessage: string;
  recordDateLabel: string;
  recordHint: string;
  confirmIntro: string;
  confirmChecklistLabel: string;
  confirmPanelSubtitle: string;
  confirmActionHint: string;
};

const recoveryModeMetaMap: Record<RecoveryMode, RecoveryModeMeta> = {
  offboarding: {
    label: "离职回收",
    formTitle: "发起离职回收",
    formSubtitle: "先从所有在职员工中选择一人，系统会自动读取其名下已分配手机，并生成员工可打开的归还确认链接。",
    dateLabel: "离职日期",
    createButtonLabel: "生成离职回收链接",
    createErrorMessage: "发起离职回收失败",
    recordDateLabel: "离职日期",
    recordHint: "确认后系统会自动回收入库，并同步员工离职状态。",
    confirmIntro: "本页用于确认离职员工名下手机是否已全部交回公司。确认后系统会自动回收设备并同步员工状态。",
    confirmChecklistLabel: "确认本人已完成离职交接中的手机归还责任",
    confirmPanelSubtitle: "确认后系统会自动完成回收、同步员工离职状态，并将手机转为待分配。",
    confirmActionHint: "确认完成后，员工状态会自动变更为离职，设备会自动回收到手机资产并切回待分配。",
  },
  active: {
    label: "在职回收",
    formTitle: "发起在职回收",
    formSubtitle: "适用于员工仍在职但需要先归还手机的场景，系统会生成员工可打开的归还确认链接。",
    dateLabel: "回收日期",
    createButtonLabel: "生成在职回收链接",
    createErrorMessage: "发起在职回收失败",
    recordDateLabel: "回收日期",
    recordHint: "确认后系统会自动回收入库，但员工仍保持在职状态。",
    confirmIntro: "本页用于确认在职员工名下手机是否已全部交回公司。确认后系统会自动回收设备，但不会修改员工在职状态。",
    confirmChecklistLabel: "确认本人已完成本次手机归还责任",
    confirmPanelSubtitle: "确认后系统会自动完成回收，员工仍保持在职，手机会转为待分配。",
    confirmActionHint: "确认完成后，员工仍保持在职状态，设备会自动回收到手机资产并切回待分配。",
  },
};

export function normalizeRecoveryMode(value: string | null | undefined): RecoveryMode {
  return value === "active" ? "active" : "offboarding";
}

export function getRecoveryModeMeta(mode: RecoveryMode) {
  return recoveryModeMetaMap[mode];
}
