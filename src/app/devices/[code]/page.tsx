import { notFound } from "next/navigation";
import { DeviceDetailForm } from "@/components/device-detail-form";
import { DesktopShell } from "@/components/desktop-shell";
import { Panel } from "@/components/ui";
import { inferDeviceLocation } from "@/lib/device-listing";
import { getDevicesCollection } from "@/lib/mongodb";

type DeviceDetailPageProps = {
  params: Promise<{
    code: string;
  }>;
};

async function getDeviceDetail(code: string) {
  try {
    const devices = await getDevicesCollection();
    const device = await devices.findOne({ assetCode: code });
    if (device) {
      return {
        assetCode: String(device.assetCode ?? ""),
        brand: String(device.brand ?? ""),
        model: String(device.model ?? ""),
        storage: String(device.storage ?? ""),
        photoDataUrl: String(device.photoDataUrl ?? ""),
        imei1: String(device.imei1 ?? ""),
        imei2: String(device.imei2 ?? ""),
        serialNumber: String(device.serialNumber ?? ""),
        purchaseDate: String(device.purchaseDate ?? ""),
        purchasePrice: device.purchasePrice ? String(device.purchasePrice) : "",
        status: String(device.status ?? "待分配"),
        location: inferDeviceLocation(String(device.assetCode ?? "")),
      };
    }
  } catch {
    return null;
  }

  return null;
}

export default async function DeviceDetailPage({ params }: DeviceDetailPageProps) {
  const { code } = await params;
  const device = await getDeviceDetail(code);

  if (!device) {
    notFound();
  }

  return (
    <main className="page-shell">
      <DesktopShell activeHref="/devices" title="设备详情与编辑" subtitle="查看并维护手机资产的完整信息与状态">
        <Panel title="设备详情" subtitle="支持直接编辑基础字段并保存到手机资产库">
          <DeviceDetailForm code={code} initialValues={device} />
        </Panel>
      </DesktopShell>
    </main>
  );
}
