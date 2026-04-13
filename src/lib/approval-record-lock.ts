export function canDeleteAssignmentApproval(status: string) {
  return status !== "已领取";
}
