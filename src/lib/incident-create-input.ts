export type IncidentCreateInput = {
  employeeCode: string;
  deviceCode: string;
  type: string;
  description?: string;
};

const INCIDENT_TYPES = ["丢失", "维修"] as const;

function text(value: string | undefined) {
  return (value || "").trim();
}

export function normalizeIncidentCreateInput(input: IncidentCreateInput) {
  const employeeCode = text(input.employeeCode);
  const deviceCode = text(input.deviceCode);
  const type = text(input.type);

  if (!employeeCode || !deviceCode || !type) {
    throw new Error("员工、手机和异常类型为必填项");
  }

  if (!INCIDENT_TYPES.includes(type as (typeof INCIDENT_TYPES)[number])) {
    throw new Error("异常类型仅支持丢失或维修");
  }

  return {
    employeeCode,
    deviceCode,
    type,
    description: text(input.description),
    createdAt: new Date(),
  };
}
