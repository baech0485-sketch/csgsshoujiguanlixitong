import Image from "next/image";
import { CheckIcon } from "@/components/icons";
import { ReceiptConfirmAction } from "@/components/receipt-confirm-action";
import { MobileShell } from "@/components/mobile-shell";
import { Panel, StatusPill } from "@/components/ui";
import { getReceiptConfirmRecord } from "@/lib/mobile-confirmation-data";

type ReceiptConfirmPageProps = {
  searchParams?: Promise<{
    token?: string;
  }>;
};

export default async function ReceiptConfirmPage({ searchParams }: ReceiptConfirmPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const token = params?.token?.trim() || "";
  const device = token ? await getReceiptConfirmRecord(token) : null;
  return (
    <main className="mobile-page-shell">
      <MobileShell title="领用确认" subtitle="请核对设备信息后勾选确认回执" icon={<CheckIcon color="var(--text-inverse)" />}>
        {device ? (
          <>
            <Panel className="mobile-receipt-card">
              <div className="mobile-receipt-card__top">
                <div className="mobile-receipt-card__media">
                  {device.photoDataUrl ? (
                    <Image src={device.photoDataUrl} alt="待确认手机" width={144} height={188} unoptimized />
                  ) : (
                    <div className="mobile-receipt-card__placeholder">无图片</div>
                  )}
                </div>
                <div className="mobile-receipt-card__body">
                  <StatusPill tone="warning">{device.status}</StatusPill>
                  <h2>{device.deviceCount > 1 ? `${device.deviceCount} 台手机待领取确认` : device.deviceTitle}</h2>
                  <p>本页用于完成员工领用回执。请先核对本次分配的全部手机信息，再勾选确认清单和最终声明。</p>
                </div>
              </div>
              <dl className="mobile-receipt-facts">
                <div><dt>手机数量</dt><dd>{device.deviceCount} 台</dd></div>
                <div><dt>领用员工</dt><dd>{device.employeeName}</dd></div>
                <div><dt>所属部门</dt><dd>{device.department || "待同步"}</dd></div>
                <div><dt>主手机编号</dt><dd>{device.deviceCode}</dd></div>
                <div><dt>主手机所在地</dt><dd>{device.location}</dd></div>
                <div><dt>员工编号</dt><dd>{device.employeeCode || "待同步"}</dd></div>
                <div><dt>入库日期</dt><dd>{device.warehousingDate || "未记录"}</dd></div>
              </dl>
            </Panel>
            <Panel title="本次领取手机清单" subtitle="以下手机会在确认后统一绑定到你的责任名下。">
              <div className="mobile-return-device-list">
                {device.devices.map((item) => (
                  <article key={item.deviceCode} className="mobile-return-device-card">
                    <div>
                      <strong>{item.deviceCode}</strong>
                      <p>{item.deviceTitle || "设备信息待同步"}</p>
                      <p>所在地 {item.location}</p>
                      {item.serialNumber ? <p>序列号 {item.serialNumber}</p> : null}
                    </div>
                    <StatusPill tone="warning">待领取</StatusPill>
                  </article>
                ))}
              </div>
            </Panel>
            <Panel title="确认清单" subtitle={`${device.employeeName}，完成确认后系统会把该设备正式绑定到你的责任名下，并同步写入审批中心回执。`} className="mobile-check-panel mobile-check-panel--receipt">
              <ReceiptConfirmAction token={token} />
            </Panel>
          </>
        ) : (
          <Panel title="链接无效" subtitle="当前领取确认链接不存在、已失效或未正确生成。">
            <div className="db-empty">请联系资产管理员重新生成确认链接。</div>
          </Panel>
        )}
      </MobileShell>
    </main>
  );
}
