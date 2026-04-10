import { MobileDeviceEntryForm } from "@/components/mobile-device-entry-form";
import { DeviceIcon } from "@/components/icons";
import { MobileShell } from "@/components/mobile-shell";
import { Panel } from "@/components/ui";
import { getNextDeviceCode } from "@/lib/device-data";

export default async function DeviceEntryPage() {
  const nextDeviceCode = await getNextDeviceCode();
  const warehousingDate = new Date().toISOString().slice(0, 10);

  return (
    <main className="mobile-page-shell">
      <MobileShell title="手机录入" subtitle="可在手机端直接新增手机资产" icon={<DeviceIcon color="var(--text-inverse)" />}>
        <Panel title="录入手机资产" subtitle="填写手机基础信息并上传图片，提交后自动进入手机资产台账。">
          <MobileDeviceEntryForm nextDeviceCode={nextDeviceCode} warehousingDate={warehousingDate} />
        </Panel>
      </MobileShell>
    </main>
  );
}
