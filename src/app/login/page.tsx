import { LockIcon } from "@/components/icons";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="auth-screen">
      <section className="auth-hero">
        <div className="auth-hero__stack">
          <div className="auth-chip">CS Asset Control</div>
          <p className="auth-kicker">企业资产 · 审批闭环 · 全链路追溯</p>
          <h1 className="auth-title">呈尚策划公司<br />手机管理系统</h1>
          <p className="auth-description">围绕手机资产建档、审批分配、销售领用确认与离职回收，建立一套清晰、可信、可追溯的企业内部管理系统。</p>
          <div className="auth-feature-list" aria-label="系统核心能力">
            <span>资产建档</span>
            <span>审批分配</span>
            <span>离职回收</span>
          </div>
          <div className="auth-divider" aria-hidden="true" />
          <div className="auth-stats">
            <div className="auth-stat"><strong>268</strong><span>当前纳管手机</span><small>设备台账全量可查</small></div>
            <div className="auth-stat"><strong>14</strong><span>待审批事项</span><small>流程节点即时处理</small></div>
            <div className="auth-stat"><strong>100%</strong><span>责任链完整度</span><small>关键动作留痕可追溯</small></div>
          </div>
          <p className="auth-footnote">内部资产统一登记、统一审批、统一回收，降低设备丢失与责任不清风险。</p>
        </div>
      </section>
      <section className="auth-form">
        <div className="auth-form__title">
          <div className="auth-form__title-row">
            <span className="desktop-topbar__badge auth-form__badge"><LockIcon color="var(--text-primary)" /></span>
            <h2>登录后台</h2>
          </div>
          <p className="auth-form__subtitle">请输入账号和密码进入后台管理系统</p>
        </div>
        <LoginForm />
        <p className="auth-form__tip">支持管理员与销售主管账号登录</p>
      </section>
    </main>
  );
}
