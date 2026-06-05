import { NextResponse } from "next/server";
import { getDevicePageData } from "@/lib/device-page-data";
import { normalizePageParam } from "@/lib/pagination";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const payload = await getDevicePageData(
    {
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
      owner: searchParams.get("owner") ?? "",
      location: searchParams.get("location") ?? "",
      brand: "",
    },
    normalizePageParam(searchParams.get("page") ?? ""),
    searchParams.get("selected") ?? "",
  );

  return NextResponse.json(payload);
}
