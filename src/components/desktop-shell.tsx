import Link from "next/link";
import type { ReactNode } from "react";
import {
  ApprovalIcon,
  AssignmentIcon,
  DashboardIcon,
  DeviceIcon,
  EmployeeIcon,
  ExchangeIcon,
  IncidentIcon,
  RecoveryIcon,
} from "@/components/icons";
import { SidebarPrefetch } from "@/components/sidebar-prefetch";
import { DesktopUserChip } from "@/components/desktop-user-chip";
import { LogoutButton } from "@/components/logout-button";
import { desktopSidebarItems } from "@/lib/tokens";

const iconMap = {
  dashboard: DashboardIcon,
  device: DeviceIcon,
  employee: EmployeeIcon,
  approval: ApprovalIcon,
  assignment: AssignmentIcon,
  exchange: ExchangeIcon,
  recovery: RecoveryIcon,
  incident: IncidentIcon,
} as const;

export function DesktopShell({
  title,
  subtitle,
  activeHref,
  children,
}: {
  title: string;
  subtitle: string;
  activeHref: string;
  children: ReactNode;
}) {
  return (
    <div className="desktop-screen">
      <SidebarPrefetch activeHref={activeHref} />
      <aside className="desktop-sidebar">
        <Link href="/dashboard" className="sidebar-brand">
          <span className="sidebar-brand__eyebrow">呈尚策划</span>
          <span className="brand-title">手机管理系统</span>
          <span className="brand-subtitle">企业手机资产全流程管理</span>
        </Link>
        <nav className="desktop-nav">
          {desktopSidebarItems.map((item) => {
            const Icon = iconMap[item.icon];
            const active = item.href === activeHref;
            return (
              <Link key={item.href} href={item.href} prefetch className={`desktop-nav__item${active ? " is-active" : ""}`}>
                <Icon className="desktop-nav__icon" color={active ? "var(--text-inverse)" : "var(--accent-gold-soft)"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="desktop-main">
        <header className="desktop-topbar">
          <div className="desktop-topbar__badge">
            <DeviceIcon color="var(--text-primary)" />
          </div>
          <div>
            <h1 className="desktop-page-title">{title}</h1>
            <p className="desktop-page-subtitle">{subtitle}</p>
          </div>
          <div className="desktop-topbar__auth">
            <DesktopUserChip />
            <LogoutButton />
          </div>
        </header>
        <div className="desktop-content">{children}</div>
      </div>
    </div>
  );
}
