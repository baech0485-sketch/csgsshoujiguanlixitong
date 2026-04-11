import { desktopSidebarItems } from "@/lib/tokens";

export function getDesktopPrefetchRoutes(activeHref: string) {
  return desktopSidebarItems
    .map((item) => item.href)
    .filter((href) => href !== activeHref);
}
