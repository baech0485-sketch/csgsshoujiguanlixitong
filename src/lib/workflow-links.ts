export function createWorkflowToken() {
  return crypto.randomUUID().replaceAll("-", "");
}

export function buildWorkflowUrl(baseUrl: string, pathname: string, token: string) {
  const root = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  return `${root}${pathname}?token=${token}`;
}
