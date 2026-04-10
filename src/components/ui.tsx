import Link from "next/link";
import type { ReactNode } from "react";

type PillTone = "selected" | "warning" | "danger" | "success" | "info" | "muted" | "default";

export function StatusPill({ children, tone = "default" }: { children: ReactNode; tone?: PillTone }) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

export function PrimaryButton({
  children,
  href,
  tone = "primary",
  type = "button",
  disabled = false,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  tone?: "primary" | "danger" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
}) {
  const className = `button button--${tone}`;
  return href ? <Link href={href} className={className}>{children}</Link> : <button className={className} type={type} disabled={disabled} onClick={onClick}>{children}</button>;
}

export function Panel({
  title,
  subtitle,
  className = "",
  children,
}: {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`panel ${className}`.trim()}>
      {title ? <h2 className="panel__title">{title}</h2> : null}
      {subtitle ? <p className="panel__subtitle">{subtitle}</p> : null}
      {children}
    </section>
  );
}
