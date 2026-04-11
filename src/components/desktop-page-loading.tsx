export function DesktopPageLoading({
  title = "页面加载中",
  subtitle = "正在拉取最新数据，请稍候。",
}: {
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="desktop-loading">
      <div className="desktop-loading__hero">
        <div className="desktop-loading__badge" />
        <div className="desktop-loading__title" />
        <div className="desktop-loading__subtitle" />
      </div>
      <div className="desktop-loading__grid">
        <div className="desktop-loading__card" />
        <div className="desktop-loading__card" />
        <div className="desktop-loading__card" />
        <div className="desktop-loading__card" />
      </div>
      <div className="desktop-loading__panel">
        <strong>{title}</strong>
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
