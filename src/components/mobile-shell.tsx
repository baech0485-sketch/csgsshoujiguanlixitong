import type { ReactNode } from "react";

export function MobileShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mobile-screen">
      <header className="mobile-header">
        <div className="mobile-header__inner">
          <div className="mobile-header__icon">{icon}</div>
          <div>
            <h1 className="mobile-header__title">{title}</h1>
            <p className="mobile-header__subtitle">{subtitle}</p>
          </div>
        </div>
      </header>
      <main className="mobile-content">
        <div className="mobile-content__inner">{children}</div>
      </main>
    </div>
  );
}
